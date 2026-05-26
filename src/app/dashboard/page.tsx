import { redirect } from "next/navigation";
import Link from "next/link";
import {
  AlertTriangle,
  Building2,
  DollarSign,
  Plug,
  Plus,
  TrendingUp,
  Users,
  WalletCards,
} from "lucide-react";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { hasSupabaseEnv } from "@/lib/env";

type Profile = {
  full_name: string | null;
  role: string;
  agencies: { name: string; slug: string } | null;
};

type Account = { id: string; name: string; slug: string; status: string };
type MetricRow = {
  account_id: string;
  spend: number | null;
  revenue: number | null;
  leads: number | null;
};
type IntegrationRow = { account_id: string; status: string };
type AlertRow = { account_id: string };

// status de integração considerados "com problema" (enum integration_status)
const PROBLEM_INTEGRATION = ["error", "expired", "revoked"];

function fmtBRL(n: number) {
  return n.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
    maximumFractionDigits: 0,
  });
}

function fmtInt(n: number) {
  return n.toLocaleString("pt-BR");
}

function fmtRoas(spend: number, revenue: number) {
  if (spend <= 0) return "—";
  return (revenue / spend).toFixed(2);
}

export default async function DashboardPage() {
  if (!hasSupabaseEnv()) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-mist px-6">
        <div className="max-w-md rounded-lg bg-white p-8 text-center shadow-panel">
          <div className="mx-auto mb-5 flex h-12 w-12 items-center justify-center rounded-lg bg-ink text-lg font-bold text-white">
            N
          </div>
          <h1 className="text-xl font-semibold text-ink">Configuracao pendente</h1>
          <p className="mt-3 text-sm leading-6 text-slate-500">
            O deploy esta no ar, mas as variaveis do Supabase
            (<code>NEXT_PUBLIC_SUPABASE_URL</code> e{" "}
            <code>NEXT_PUBLIC_SUPABASE_ANON_KEY</code>) ainda nao foram definidas.
            Configure-as no projeto da Vercel e refaca o deploy para habilitar
            login e dashboard.
          </p>
        </div>
      </main>
    );
  }

  const supabase = createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, role, agencies(name, slug)")
    .eq("id", user.id)
    .single<Profile>();

  const { data: accountsData } = await supabase
    .from("accounts")
    .select("id, name, slug, status")
    .order("created_at", { ascending: false })
    .returns<Account[]>();
  const clients = accountsData ?? [];

  // Janela: mês atual (MTD)
  const now = new Date();
  const monthStart = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1))
    .toISOString()
    .slice(0, 10);

  const [{ data: metricRows }, { data: integrationRows }, { data: alertRows }] =
    await Promise.all([
      supabase
        .from("meta_metrics_daily")
        .select("account_id, spend, revenue, leads")
        .gte("date", monthStart)
        .returns<MetricRow[]>(),
      supabase
        .from("integrations")
        .select("account_id, status")
        .returns<IntegrationRow[]>(),
      supabase
        .from("alerts")
        .select("account_id")
        .is("resolved_at", null)
        .returns<AlertRow[]>(),
    ]);

  // Agrega métricas por cliente (MTD)
  const metricsByAccount = new Map<
    string,
    { spend: number; revenue: number; leads: number }
  >();
  for (const r of metricRows ?? []) {
    const cur = metricsByAccount.get(r.account_id) ?? {
      spend: 0,
      revenue: 0,
      leads: 0,
    };
    cur.spend += Number(r.spend) || 0;
    cur.revenue += Number(r.revenue) || 0;
    cur.leads += Number(r.leads) || 0;
    metricsByAccount.set(r.account_id, cur);
  }

  const integrationsByAccount = new Map<string, number>();
  for (const i of integrationRows ?? []) {
    integrationsByAccount.set(
      i.account_id,
      (integrationsByAccount.get(i.account_id) ?? 0) + 1,
    );
  }

  const alertsByAccount = new Map<string, number>();
  for (const a of alertRows ?? []) {
    alertsByAccount.set(a.account_id, (alertsByAccount.get(a.account_id) ?? 0) + 1);
  }

  let totalSpend = 0;
  let totalRevenue = 0;
  for (const v of metricsByAccount.values()) {
    totalSpend += v.spend;
    totalRevenue += v.revenue;
  }
  const integrationsWithError = (integrationRows ?? []).filter((i) =>
    PROBLEM_INTEGRATION.includes(i.status),
  ).length;
  const openAlerts = (alertRows ?? []).length;

  const globals = [
    { label: "Investimento (MTD)", value: fmtBRL(totalSpend), icon: WalletCards, tone: "text-coral" },
    { label: "Receita atribuida", value: fmtBRL(totalRevenue), icon: DollarSign, tone: "text-emerald-500" },
    { label: "ROAS medio", value: fmtRoas(totalSpend, totalRevenue), icon: TrendingUp, tone: "text-sea" },
    { label: "Clientes ativos", value: fmtInt(clients.length), icon: Users, tone: "text-sea" },
    { label: "Integracoes c/ erro", value: fmtInt(integrationsWithError), icon: Plug, tone: "text-amber-500" },
    { label: "Alertas abertos", value: fmtInt(openAlerts), icon: AlertTriangle, tone: "text-amber-500" },
  ];

  return (
    <div className="mx-auto max-w-7xl px-6 py-8">
        {/* Indicadores globais da agencia */}
        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
          {globals.map((g) => (
            <div key={g.label} className="rounded-lg bg-white p-5 shadow-panel">
              <div className="mb-4 flex items-center justify-between">
                <p className="text-sm font-medium text-slate-500">{g.label}</p>
                <g.icon className={g.tone} size={18} />
              </div>
              <p className="text-2xl font-semibold text-ink">{g.value}</p>
            </div>
          ))}
        </section>

        {/* Clientes */}
        <section className="mt-8">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500">Visao Agencia</p>
              <h2 className="mt-1 text-xl font-semibold text-ink">Clientes</h2>
            </div>
            <Link
              href="/dashboard/clientes"
              className="inline-flex items-center gap-1 rounded-md bg-ink px-3 py-2 text-sm font-medium text-white transition hover:bg-slate-800"
            >
              <Plus size={16} />
              Adicionar cliente
            </Link>
          </div>

          {clients.length === 0 ? (
            <div className="flex min-h-56 items-center justify-center rounded-lg border border-dashed border-slate-300 bg-white px-6 text-center shadow-panel">
              <div className="max-w-md">
                <Building2 className="mx-auto mb-4 text-slate-400" size={34} />
                <h3 className="text-lg font-semibold text-ink">
                  Nenhum cliente cadastrado ainda
                </h3>
                <p className="mt-2 text-sm leading-6 text-slate-500">
                  Cadastre o primeiro cliente da agencia para comecar a conectar
                  Meta Ads + GA4.
                </p>
                <Link
                  href="/dashboard/clientes"
                  className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-sea hover:underline"
                >
                  Cadastrar primeiro cliente
                </Link>
              </div>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {clients.map((client) => {
                const m = metricsByAccount.get(client.id) ?? {
                  spend: 0,
                  revenue: 0,
                  leads: 0,
                };
                const integrations = integrationsByAccount.get(client.id) ?? 0;
                const alerts = alertsByAccount.get(client.id) ?? 0;
                const semDados = m.spend === 0 && m.revenue === 0 && integrations === 0;

                return (
                  <Link
                    key={client.id}
                    href={`/dashboard/clientes/${client.slug}`}
                    className="block rounded-lg bg-white p-5 shadow-panel transition hover:shadow-md hover:-translate-y-0.5"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-md bg-teal-50 text-sea">
                          <Building2 size={18} />
                        </div>
                        <div>
                          <p className="font-semibold text-ink">{client.name}</p>
                          <p className="text-xs text-slate-400">{client.slug}</p>
                        </div>
                      </div>
                      <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-600">
                        {client.status}
                      </span>
                    </div>

                    <div className="mt-5 grid grid-cols-2 gap-3">
                      <div className="rounded-md bg-slate-50 p-3">
                        <p className="text-xs text-slate-500">Investimento</p>
                        <p className="text-base font-semibold text-ink">
                          {fmtBRL(m.spend)}
                        </p>
                      </div>
                      <div className="rounded-md bg-slate-50 p-3">
                        <p className="text-xs text-slate-500">Receita</p>
                        <p className="text-base font-semibold text-ink">
                          {fmtBRL(m.revenue)}
                        </p>
                      </div>
                      <div className="rounded-md bg-slate-50 p-3">
                        <p className="text-xs text-slate-500">ROAS</p>
                        <p className="text-base font-semibold text-ink">
                          {fmtRoas(m.spend, m.revenue)}
                        </p>
                      </div>
                      <div className="rounded-md bg-slate-50 p-3">
                        <p className="text-xs text-slate-500">Leads</p>
                        <p className="text-base font-semibold text-ink">
                          {fmtInt(m.leads)}
                        </p>
                      </div>
                    </div>

                    <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3 text-xs text-slate-500">
                      <span>Integracoes: {integrations}</span>
                      <span>Alertas: {alerts}</span>
                      <span>Health: —</span>
                    </div>

                    {semDados ? (
                      <p className="mt-3 rounded-md bg-amber-50 px-3 py-2 text-xs text-amber-700">
                        Sem dados de midia ainda — conecte uma integracao.
                      </p>
                    ) : null}
                  </Link>
                );
              })}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
