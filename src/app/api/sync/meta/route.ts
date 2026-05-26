import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServiceClient } from "@/lib/supabase/service";
import { createSupabaseServerClient } from "@/lib/supabase/server";

const CRON_SECRET = process.env.CRON_SECRET;

type Integration = {
  id: string;
  account_id: string;
  agency_id: string;
  external_account_id: string;
  access_token: string;
  token_expires_at: string | null;
  last_success_at: string | null;
};

type MetaAction = { action_type: string; value: string };

type MetaRow = {
  campaign_id?: string;
  campaign_name?: string;
  spend: string;
  impressions: string;
  clicks: string;
  actions?: MetaAction[];
  action_values?: MetaAction[];
  date_start: string;
};

const LEAD_ACTIONS = ["lead", "onsite_conversion.lead_grouped"];
const PURCHASE_ACTIONS = ["purchase", "omni_purchase"];
const REVENUE_ACTIONS = ["purchase", "omni_purchase", "offsite_conversion.fb_pixel_purchase"];

function sumActions(row: MetaRow, types: string[]): number {
  return (row.actions ?? [])
    .filter((a) => types.includes(a.action_type))
    .reduce((s, a) => s + Number(a.value || 0), 0);
}

function sumActionValues(row: MetaRow, types: string[]): number {
  return (row.action_values ?? [])
    .filter((a) => types.includes(a.action_type))
    .reduce((s, a) => s + Number(a.value || 0), 0);
}

async function fetchAllPages(url: string): Promise<MetaRow[]> {
  const rows: MetaRow[] = [];
  let nextUrl: string | null = url;
  let page = 0;
  while (nextUrl && page < 20) {
    const res = await fetch(nextUrl);
    const data: { data?: MetaRow[]; paging?: { next?: string } } = await res.json();
    if (data.data) rows.push(...data.data);
    nextUrl = data.paging?.next ?? null;
    page++;
  }
  return rows;
}

async function upsertAlert(
  db: ReturnType<typeof createSupabaseServiceClient>,
  payload: {
    agency_id: string;
    account_id: string;
    severity: "info" | "warning" | "critical";
    title: string;
    message: string;
    fingerprint: string;
  }
) {
  const { data: existing } = await db
    .from("alerts")
    .select("id")
    .eq("fingerprint", payload.fingerprint)
    .eq("account_id", payload.account_id)
    .is("resolved_at", null)
    .maybeSingle();
  if (!existing) await db.from("alerts").insert(payload);
}

async function resolveAlert(
  db: ReturnType<typeof createSupabaseServiceClient>,
  fingerprint: string,
  account_id: string
) {
  await db
    .from("alerts")
    .update({ resolved_at: new Date().toISOString() })
    .eq("fingerprint", fingerprint)
    .eq("account_id", account_id)
    .is("resolved_at", null);
}

async function generateAlerts(
  db: ReturnType<typeof createSupabaseServiceClient>,
  integration: Integration,
  today: string
) {
  const currentMonth = today.slice(0, 7);

  // — Token expirando em < 7 dias —
  if (integration.token_expires_at) {
    const daysLeft =
      (new Date(integration.token_expires_at).getTime() - Date.now()) / 86_400_000;
    const fp = `meta_token_expiring_${integration.account_id}`;
    if (daysLeft < 7) {
      await upsertAlert(db, {
        agency_id: integration.agency_id,
        account_id: integration.account_id,
        severity: "warning",
        title: "Token Meta Ads expirando em breve",
        message: `O token de acesso expira em ${Math.ceil(daysLeft)} dia(s). Reconecte a integração.`,
        fingerprint: fp,
      });
    } else {
      await resolveAlert(db, fp, integration.account_id);
    }
  }

  // — ROAS abaixo da meta —
  const monthStart = `${currentMonth}-01`;
  const { data: metricRows } = await db
    .from("meta_metrics_daily")
    .select("spend, revenue")
    .eq("account_id", integration.account_id)
    .gte("date", monthStart);

  if (metricRows?.length) {
    const spend = metricRows.reduce((s, r) => s + Number(r.spend || 0), 0);
    const revenue = metricRows.reduce((s, r) => s + Number(r.revenue || 0), 0);
    const roas = spend > 0 ? revenue / spend : null;
    const fp = `roas_below_goal_${integration.account_id}_${currentMonth}`;

    const { data: goal } = await db
      .from("account_goals")
      .select("roas_goal")
      .eq("account_id", integration.account_id)
      .eq("month", currentMonth)
      .maybeSingle<{ roas_goal: number | null }>();

    if (goal?.roas_goal && roas !== null && roas < Number(goal.roas_goal)) {
      await upsertAlert(db, {
        agency_id: integration.agency_id,
        account_id: integration.account_id,
        severity: "warning",
        title: "ROAS abaixo da meta",
        message: `ROAS atual ${roas.toFixed(2)}x está abaixo da meta de ${goal.roas_goal}x.`,
        fingerprint: fp,
      });
    } else {
      await resolveAlert(db, fp, integration.account_id);
    }

    // — Orçamento estourado —
    const { data: budget } = await db
      .from("account_budgets")
      .select("amount")
      .eq("account_id", integration.account_id)
      .eq("month", currentMonth)
      .eq("platform", "meta_ads")
      .maybeSingle<{ amount: number | null }>();

    const bfp = `budget_overspend_${integration.account_id}_${currentMonth}`;
    if (budget?.amount && spend > Number(budget.amount) * 1.05) {
      await upsertAlert(db, {
        agency_id: integration.agency_id,
        account_id: integration.account_id,
        severity: "critical",
        title: "Orçamento Meta Ads estourado",
        message: `Gasto ${spend.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })} ultrapassa o orçamento de ${Number(budget.amount).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}.`,
        fingerprint: bfp,
      });
    } else {
      await resolveAlert(db, bfp, integration.account_id);
    }
  }
}

async function syncIntegration(
  db: ReturnType<typeof createSupabaseServiceClient>,
  integration: Integration
): Promise<{ rows: number; error?: string }> {
  // Verifica expiração do token
  if (integration.token_expires_at && new Date(integration.token_expires_at) < new Date()) {
    await db.from("integrations").update({ status: "expired" }).eq("id", integration.id);
    return { rows: 0, error: "token_expired" };
  }

  // Define janela de datas
  const today = new Date().toISOString().slice(0, 10);
  const dateFrom = integration.last_success_at
    ? (() => {
        const d = new Date();
        d.setDate(d.getDate() - 7);
        return d.toISOString().slice(0, 10);
      })()
    : (() => {
        const d = new Date();
        d.setDate(d.getDate() - 90);
        return d.toISOString().slice(0, 10);
      })();

  const adAccountId = integration.external_account_id;
  const url =
    `https://graph.facebook.com/v20.0/${adAccountId}/insights?` +
    `level=campaign` +
    `&fields=campaign_id,campaign_name,spend,impressions,clicks,actions,action_values` +
    `&time_increment=1` +
    `&time_range=${encodeURIComponent(JSON.stringify({ since: dateFrom, until: today }))}` +
    `&access_token=${integration.access_token}`;

  const rows = await fetchAllPages(url);

  for (const row of rows) {
    await db.from("meta_metrics_daily").upsert(
      {
        agency_id: integration.agency_id,
        account_id: integration.account_id,
        integration_id: integration.id,
        date: row.date_start,
        campaign_id: row.campaign_id ?? "__unknown__",
        campaign_name: row.campaign_name ?? null,
        adset_id: "__all__",
        adset_name: null,
        ad_id: "__all__",
        ad_name: null,
        spend: Number(row.spend) || 0,
        impressions: Number(row.impressions) || 0,
        clicks: Number(row.clicks) || 0,
        leads: sumActions(row, LEAD_ACTIONS),
        purchases: sumActions(row, PURCHASE_ACTIONS),
        revenue: sumActionValues(row, REVENUE_ACTIONS),
        raw: row,
      },
      { onConflict: "account_id,date,campaign_id,adset_id,ad_id" }
    );
  }

  const now = new Date().toISOString();
  await db.from("integrations").update({ last_success_at: now }).eq("id", integration.id);

  await db.from("sync_runs").insert({
    agency_id: integration.agency_id,
    account_id: integration.account_id,
    integration_id: integration.id,
    provider: "meta_ads",
    job_type: "insights_daily",
    status: "success",
    date_from: dateFrom,
    date_to: today,
    rows_read: rows.length,
    rows_written: rows.length,
    started_at: now,
    finished_at: now,
  });

  await generateAlerts(db, integration, today);

  return { rows: rows.length };
}

export async function POST(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  const isCron = CRON_SECRET && authHeader === `Bearer ${CRON_SECRET}`;
  const accountId = request.nextUrl.searchParams.get("account_id");

  // Trigger manual: valida sessão do usuário
  if (!isCron) {
    if (!accountId) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
    const userClient = createSupabaseServerClient();
    const { data: { user } } = await userClient.auth.getUser();
    if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const db = createSupabaseServiceClient();

  let query = db
    .from("integrations")
    .select("id, account_id, agency_id, external_account_id, access_token, token_expires_at, last_success_at")
    .eq("provider", "meta_ads")
    .eq("status", "active")
    .not("access_token", "is", null)
    .not("external_account_id", "is", null);

  if (accountId) query = query.eq("account_id", accountId);

  const { data: integrations } = await query.returns<Integration[]>();

  if (!integrations?.length) {
    return NextResponse.json({ synced: 0, skipped: 0 });
  }

  let synced = 0;
  let failed = 0;

  for (const intg of integrations) {
    const result = await syncIntegration(db, intg).catch((err) => ({
      rows: 0,
      error: err instanceof Error ? err.message : String(err),
    }));

    if (result.error && result.error !== "token_expired") {
      await db
        .from("integrations")
        .update({
          last_error_at: new Date().toISOString(),
          last_error_message: result.error,
        })
        .eq("id", intg.id);
      failed++;
    } else if (!result.error) {
      synced++;
    }
  }

  return NextResponse.json({ synced, failed });
}
