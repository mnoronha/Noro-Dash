import { redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Building2, ExternalLink, Users } from "lucide-react";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { hasSupabaseEnv } from "@/lib/env";
import { AddClientForm } from "@/components/clients/add-client-form";

type Profile = {
  agency_id: string | null;
  role: string;
};

type Account = {
  id: string;
  name: string;
  slug: string;
  website_url: string | null;
  status: string;
  created_at: string;
};

export default async function ClientesPage() {
  if (!hasSupabaseEnv()) {
    redirect("/dashboard");
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
    .select("agency_id, role")
    .eq("id", user.id)
    .single<Profile>();

  const agencyId = profile?.agency_id ?? null;

  const { data: accounts } = await supabase
    .from("accounts")
    .select("id, name, slug, website_url, status, created_at")
    .order("created_at", { ascending: false })
    .returns<Account[]>();

  const clients = accounts ?? [];

  return (
    <main className="min-h-screen bg-mist">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <Link
              href="/dashboard"
              className="flex h-10 w-10 items-center justify-center rounded-md border border-slate-200 text-slate-600 transition hover:bg-slate-50 hover:text-ink"
              aria-label="Voltar ao dashboard"
            >
              <ArrowLeft size={18} />
            </Link>
            <div>
              <p className="text-sm font-medium text-slate-500">Noro Dash</p>
              <h1 className="text-lg font-semibold text-ink">Clientes</h1>
            </div>
          </div>
          <div className="flex items-center gap-2 rounded-md bg-slate-100 px-3 py-2 text-sm text-slate-600">
            <Users size={16} className="text-sea" />
            {clients.length} {clients.length === 1 ? "cliente" : "clientes"}
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-6 py-8">
        <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
          <section className="rounded-lg bg-white p-6 shadow-panel">
            <h2 className="mb-5 text-lg font-semibold text-ink">Seus clientes</h2>

            {clients.length === 0 ? (
              <div className="flex min-h-56 items-center justify-center rounded-lg border border-dashed border-slate-300 bg-slate-50 px-6 text-center">
                <div className="max-w-sm">
                  <Building2 className="mx-auto mb-3 text-slate-400" size={32} />
                  <h3 className="text-base font-semibold text-ink">
                    Nenhum cliente cadastrado
                  </h3>
                  <p className="mt-2 text-sm leading-6 text-slate-500">
                    Use o formulario ao lado para cadastrar o primeiro cliente da
                    agencia.
                  </p>
                </div>
              </div>
            ) : (
              <ul className="divide-y divide-slate-100">
                {clients.map((client) => (
                  <li
                    key={client.id}
                    className="flex items-center justify-between gap-4 py-4"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-md bg-teal-50 text-sea">
                        <Building2 size={18} />
                      </div>
                      <div>
                        <p className="font-medium text-ink">{client.name}</p>
                        {client.website_url ? (
                          <a
                            href={client.website_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-sea"
                          >
                            {client.website_url}
                            <ExternalLink size={12} />
                          </a>
                        ) : (
                          <p className="text-sm text-slate-400">sem site</p>
                        )}
                      </div>
                    </div>
                    <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-600">
                      {client.status}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <aside className="rounded-lg bg-white p-6 shadow-panel">
            <h2 className="mb-1 text-lg font-semibold text-ink">Adicionar cliente</h2>
            <p className="mb-5 text-sm leading-6 text-slate-500">
              Cadastre um novo cliente (account) na agencia.
            </p>

            {agencyId ? (
              <AddClientForm agencyId={agencyId} />
            ) : (
              <div className="rounded-md border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
                Seu usuario nao esta vinculado a nenhuma agencia. Defina o
                <code> agency_id </code> do seu profile no Supabase para cadastrar
                clientes.
              </div>
            )}
          </aside>
        </div>
      </div>
    </main>
  );
}
