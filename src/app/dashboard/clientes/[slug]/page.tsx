import { notFound } from "next/navigation";
import {
  AlertTriangle,
  CheckCircle2,
  DollarSign,
  ExternalLink,
  Plug,
  TrendingUp,
  Users,
  WalletCards,
  XCircle,
  Clock,
} from "lucide-react";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { SyncButton } from "@/components/clients/sync-button";

type Account = {
  id: string;
  name: string;
  slug: string;
  website_url: string | null;
  status: string;
  created_at: string;
};

type Integration = {
  id: string;
  provider: string;
  status: string;
  last_success_at: string | null;
  created_at: string;
};

type Alert = {
  id: string;
  severity: string;
  title: string;
  created_at: string;
};

type MetricRow = { spend: number | null; revenue: number | null; leads: number | null };

function fmtBRL(n: number) {
  return n.toLocaleString("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 });
}

function fmtRoas(spend: number, revenue: number) {
  if (spend <= 0) return "—";
  return (revenue / spend).toFixed(2) + "x";
}

function fmtDate(s: string | null) {
  if (!s) return "—";
  return new Date(s).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", year: "2-digit" });
}

const PROVIDER_LABELS: Record<string, string> = {
  meta_ads: "Meta Ads",
  google_ads: "Google Ads",
  ga4: "Google Analytics 4",
  gsc: "Google Search Console",
};

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: typeof CheckCircle2 }> = {
  active:   { label: "Ativo",      color: "text-emerald-600 bg-emerald-50",  icon: CheckCircle2 },
  pending:  { label: "Pendente",   color: "text-amber-600 bg-amber-50",      icon: Clock },
  warning:  { label: "Atenção",    color: "text-amber-600 bg-amber-50",      icon: AlertTriangle },
  expired:  { label: "Expirado",   color: "text-red-600 bg-red-50",          icon: XCircle },
  revoked:  { label: "Revogado",   color: "text-red-600 bg-red-50",          icon: XCircle },
  error:    { label: "Erro",       color: "text-red-600 bg-red-50",          icon: XCircle },
};

const SEVERITY_COLOR: Record<string, string> = {
  info:     "border-l-blue-400 bg-blue-50",
  warning:  "border-l-amber-400 bg-amber-50",
  critical: "border-l-red-400 bg-red-50",
};

export default async function ClienteDetailPage({
  params,
  searchParams,
}: {
  params: { slug: string };
  searchParams: { connected?: string; error?: string };
}) {
  const supabase = createSupabaseServerClient();

  const { data: account } = await supabase
    .from("accounts")
    .select("id, name, slug, website_url, status, created_at")
    .eq("slug", params.slug)
    .single<Account>();

  if (!account) notFound();

  const now = new Date();
  const monthStart = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1))
    .toISOString()
    .slice(0, 10);

  const [{ data: metricRows }, { data: integrationRows }, { data: alertRows }] =
    await Promise.all([
      supabase
        .from("meta_metrics_daily")
        .select("spend, revenue, leads")
        .eq("account_id", account.id)
        .gte("date", monthStart)
        .returns<MetricRow[]>(),
      supabase
        .from("integrations")
        .select("id, provider, status, last_success_at, created_at")
        .eq("account_id", account.id)
        .returns<Integration[]>(),
      supabase
        .from("alerts")
        .select("id, severity, title, created_at")
        .eq("account_id", account.id)
        .is("resolved_at", null)
        .order("created_at", { ascending: false })
        .limit(5)
        .returns<Alert[]>(),
    ]);

  const metrics = (metricRows ?? []).reduce<{ spend: number; revenue: number; leads: number }>(
    (acc, r) => ({
      spend: acc.spend + (Number(r.spend) || 0),
      revenue: acc.revenue + (Number(r.revenue) || 0),
      leads: acc.leads + (Number(r.leads) || 0),
    }),
    { spend: 0, revenue: 0, leads: 0 }
  );

  const integrations = integrationRows ?? [];
  const alerts = alertRows ?? [];

  const kpis = [
    { label: "Investimento (mês)", value: fmtBRL(metrics.spend),          icon: WalletCards, color: "text-coral" },
    { label: "Receita atribuída",  value: fmtBRL(metrics.revenue),         icon: DollarSign,  color: "text-emerald-500" },
    { label: "ROAS",               value: fmtRoas(metrics.spend, metrics.revenue), icon: TrendingUp, color: "text-sea" },
    { label: "Leads (mês)",        value: metrics.leads.toLocaleString("pt-BR"), icon: Users, color: "text-sea" },
  ];

  const semDados = metrics.spend === 0 && metrics.revenue === 0;

  const connectedProviders = new Set(integrations.map((i) => i.provider));

  return (
    <div className="space-y-6">
      {/* Banners de feedback OAuth */}
      {searchParams.connected === "meta" && (
        <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
          Meta Ads conectado com sucesso! Os dados aparecerão aqui após a primeira sincronização.
        </div>
      )}
      {searchParams.error === "meta_denied" && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          Autorização cancelada. Tente novamente.
        </div>
      )}
      {searchParams.error === "no_ad_accounts" && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          Nenhuma conta de anúncios encontrada neste perfil do Meta.
        </div>
      )}
      {searchParams.error === "missing_meta_credentials" && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          Configure o App ID e App Secret do Meta em{" "}
          <a href="/dashboard/configuracoes" className="underline font-medium">Configurações da agência</a>{" "}
          antes de conectar.
        </div>
      )}

      {/* Website link */}
      {account.website_url && (
        <div className="flex items-center justify-between">
          <a
            href={account.website_url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-xs text-slate-400 hover:text-sea"
          >
            {account.website_url}
            <ExternalLink size={11} />
          </a>
          <p className="text-xs text-slate-400">
            Cliente desde {fmtDate(account.created_at)}
          </p>
        </div>
      )}

      {/* KPIs */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {kpis.map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="rounded-lg bg-white p-5 shadow-panel">
            <div className="mb-3 flex items-center justify-between">
              <p className="text-xs font-medium text-slate-500">{label}</p>
              <Icon size={16} className={color} />
            </div>
            <p className="text-2xl font-semibold text-ink">{value}</p>
          </div>
        ))}
      </div>

      {semDados && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          Sem dados de mídia ainda — conecte uma integração abaixo para começar a importar métricas.
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        {/* Integrações */}
        <section className="rounded-lg bg-white p-6 shadow-panel">
          <div className="mb-5 flex items-center justify-between gap-4">
            <h2 className="text-lg font-semibold text-ink">Integrações</h2>
            <div className="flex items-center gap-3">
              {integrations.some((i) => i.status === "active") && (
                <SyncButton accountId={account.id} />
              )}
              <Plug size={16} className="text-slate-400" />
            </div>
          </div>

          {integrations.length === 0 ? (
            <div className="flex min-h-40 items-center justify-center rounded-lg border border-dashed border-slate-200 bg-slate-50 text-center px-4">
              <div>
                <Plug className="mx-auto mb-2 text-slate-300" size={28} />
                <p className="text-sm text-slate-500">Nenhuma integração conectada</p>
                <p className="mt-1 text-xs text-slate-400">
                  Conecte Meta Ads ou Google Ads para importar métricas automaticamente.
                </p>
              </div>
            </div>
          ) : (
            <ul className="divide-y divide-slate-100">
              {integrations.map((intg) => {
                const cfg = STATUS_CONFIG[intg.status] ?? STATUS_CONFIG.pending;
                const StatusIcon = cfg.icon;
                return (
                  <li key={intg.id} className="flex items-center justify-between gap-4 py-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-md bg-slate-100">
                        <Plug size={15} className="text-slate-500" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-ink">
                          {PROVIDER_LABELS[intg.provider] ?? intg.provider}
                        </p>
                        <p className="text-xs text-slate-400">
                          Última sincronização: {fmtDate(intg.last_success_at)}
                        </p>
                      </div>
                    </div>
                    <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium ${cfg.color}`}>
                      <StatusIcon size={12} />
                      {cfg.label}
                    </span>
                  </li>
                );
              })}
            </ul>
          )}

          <div className="mt-4 rounded-md border border-dashed border-slate-200 bg-slate-50 p-4">
            <p className="mb-3 text-xs font-medium uppercase tracking-wide text-slate-400">
              Disponíveis para conectar
            </p>
            <div className="flex flex-wrap gap-2">
              {connectedProviders.has("meta_ads") ? (
                <a
                  href={`/api/auth/meta/connect?account_id=${account.id}`}
                  className="rounded-md border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-500 hover:border-sea hover:text-sea transition"
                >
                  Reconectar Meta Ads
                </a>
              ) : (
                <a
                  href={`/api/auth/meta/connect?account_id=${account.id}`}
                  className="rounded-md border border-blue-200 bg-blue-50 px-3 py-1.5 text-xs text-blue-600 hover:bg-blue-100 transition"
                >
                  + Meta Ads
                </a>
              )}
              {["Google Ads", "GA4"].map((p) => (
                <button
                  key={p}
                  disabled
                  className="rounded-md border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-400 cursor-not-allowed"
                  title="Em breve"
                >
                  + {p}
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* Alertas */}
        <section className="rounded-lg bg-white p-6 shadow-panel">
          <div className="mb-5 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-ink">Alertas abertos</h2>
            {alerts.length > 0 && (
              <span className="rounded-full bg-red-50 px-2.5 py-0.5 text-xs font-semibold text-red-600">
                {alerts.length}
              </span>
            )}
          </div>

          {alerts.length === 0 ? (
            <div className="flex min-h-40 flex-col items-center justify-center text-center">
              <CheckCircle2 className="mb-2 text-emerald-400" size={28} />
              <p className="text-sm text-slate-500">Nenhum alerta em aberto</p>
              <p className="mt-1 text-xs text-slate-400">Tudo certo por aqui.</p>
            </div>
          ) : (
            <ul className="space-y-2">
              {alerts.map((a) => (
                <li
                  key={a.id}
                  className={`rounded-md border-l-4 px-3 py-2.5 text-sm ${SEVERITY_COLOR[a.severity] ?? "border-l-slate-300 bg-slate-50"}`}
                >
                  <p className="font-medium text-ink">{a.title}</p>
                  <p className="mt-0.5 text-xs text-slate-500">{fmtDate(a.created_at)}</p>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}
