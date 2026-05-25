import { redirect } from "next/navigation";
import Link from "next/link";
import {
  AlertTriangle,
  ArrowRight,
  Building2,
  CheckCircle2,
  Gauge,
  Goal,
  Plus,
  WalletCards,
} from "lucide-react";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { hasSupabaseEnv } from "@/lib/env";
import { SignOutButton } from "@/components/auth/sign-out-button";

type Profile = {
  full_name: string | null;
  role: string;
  agencies: {
    name: string;
    slug: string;
  } | null;
};

type Account = {
  id: string;
  name: string;
  slug: string;
  website_url: string | null;
  status: string;
};

const setupItems = [
  "Conectar primeiro cliente",
  "Configurar Meta Ads",
  "Configurar GA4",
  "Criar metas mensais",
  "Ativar alertas criticos",
];

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

  const { data: accounts } = await supabase
    .from("accounts")
    .select("id, name, slug, website_url, status")
    .order("created_at", { ascending: false })
    .returns<Account[]>();

  const clients = accounts ?? [];

  const metrics = [
    { label: "Clientes ativos", value: String(clients.length), icon: Building2, tone: "text-sea" },
    { label: "Investimento MTD", value: "R$ 0", icon: WalletCards, tone: "text-coral" },
    { label: "Alertas abertos", value: "0", icon: AlertTriangle, tone: "text-amber-500" },
    { label: "Health medio", value: "--", icon: Gauge, tone: "text-emerald-500" },
  ];

  return (
    <main className="min-h-screen bg-mist">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-ink text-base font-bold text-white">
              N
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500">Noro Dash</p>
              <h1 className="text-lg font-semibold text-ink">
                {profile?.agencies?.name ?? "Agencia"}
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden text-right sm:block">
              <p className="text-sm font-medium text-ink">
                {profile?.full_name ?? user.email}
              </p>
              <p className="text-xs uppercase tracking-wide text-slate-500">
                {profile?.role ?? "usuario"}
              </p>
            </div>
            <SignOutButton />
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-6 py-8">
        <section className="mb-8 rounded-lg bg-ink p-7 text-white shadow-panel">
          <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
            <div>
              <p className="mb-3 text-sm font-medium uppercase tracking-[0.2em] text-sea">
                Fundacao pronta
              </p>
              <h2 className="max-w-3xl text-3xl font-semibold leading-tight">
                A base multi-tenant ja esta conectada. Agora entram clientes,
                integracoes e os primeiros dados reais.
              </h2>
            </div>
            <div className="flex items-center gap-2 rounded-md bg-white/10 px-4 py-3 text-sm text-slate-200">
              <CheckCircle2 size={18} className="text-sea" />
              Supabase ativo
            </div>
          </div>
        </section>

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {metrics.map((metric) => (
            <div key={metric.label} className="rounded-lg bg-white p-5 shadow-panel">
              <div className="mb-5 flex items-center justify-between">
                <p className="text-sm font-medium text-slate-500">{metric.label}</p>
                <metric.icon className={metric.tone} size={20} />
              </div>
              <p className="text-3xl font-semibold text-ink">{metric.value}</p>
            </div>
          ))}
        </section>

        <section className="mt-8 grid gap-6 lg:grid-cols-[1.35fr_0.65fr]">
          <div className="rounded-lg bg-white p-6 shadow-panel">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500">Visao Agencia</p>
                <h3 className="mt-1 text-xl font-semibold text-ink">Clientes</h3>
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
              <div className="flex min-h-64 items-center justify-center rounded-lg border border-dashed border-slate-300 bg-slate-50 px-6 text-center">
                <div className="max-w-md">
                  <Building2 className="mx-auto mb-4 text-slate-400" size={34} />
                  <h4 className="text-lg font-semibold text-ink">
                    Nenhum cliente cadastrado ainda
                  </h4>
                  <p className="mt-2 text-sm leading-6 text-slate-500">
                    Cadastre o primeiro cliente da agencia para comecar a conectar
                    Meta Ads + GA4.
                  </p>
                  <Link
                    href="/dashboard/clientes"
                    className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-sea hover:underline"
                  >
                    Cadastrar primeiro cliente
                    <ArrowRight size={14} />
                  </Link>
                </div>
              </div>
            ) : (
              <div>
                <ul className="divide-y divide-slate-100">
                  {clients.slice(0, 5).map((client) => (
                    <li
                      key={client.id}
                      className="flex items-center justify-between gap-4 py-3"
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-md bg-teal-50 text-sea">
                          <Building2 size={16} />
                        </div>
                        <div>
                          <p className="font-medium text-ink">{client.name}</p>
                          {client.website_url ? (
                            <span className="text-sm text-slate-400">
                              {client.website_url}
                            </span>
                          ) : null}
                        </div>
                      </div>
                      <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-600">
                        {client.status}
                      </span>
                    </li>
                  ))}
                </ul>
                <Link
                  href="/dashboard/clientes"
                  className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-sea hover:underline"
                >
                  Ver todos os clientes
                  <ArrowRight size={14} />
                </Link>
              </div>
            )}
          </div>

          <aside className="rounded-lg bg-white p-6 shadow-panel">
            <div className="mb-6 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-md bg-teal-50 text-sea">
                <Goal size={20} />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-500">Setup MVP</p>
                <h3 className="text-xl font-semibold text-ink">Proximas acoes</h3>
              </div>
            </div>

            <div className="space-y-3">
              {setupItems.map((item) => (
                <div
                  className="flex items-center gap-3 rounded-md border border-slate-200 px-3 py-3 text-sm text-slate-700"
                  key={item}
                >
                  <span className="h-2.5 w-2.5 rounded-full bg-sea" />
                  {item}
                </div>
              ))}
            </div>
          </aside>
        </section>
      </div>
    </main>
  );
}
