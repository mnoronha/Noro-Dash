import { redirect } from "next/navigation";
import Link from "next/link";
import { Building2, ExternalLink, Users, ChevronRight } from "lucide-react";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { hasSupabaseEnv } from "@/lib/env";
import { AddClientForm } from "@/components/clients/add-client-form";

type Profile = { agency_id: string | null; role: string };
type Account = {
  id: string;
  name: string;
  slug: string;
  website_url: string | null;
  status: string;
  created_at: string;
};

export default async function ClientesPage() {
  if (!hasSupabaseEnv()) redirect("/dashboard");

  const supabase = createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("agency_id, role")
    .eq("id", user.id)
    .single<Profile>();

  const { data: accounts } = await supabase
    .from("accounts")
    .select("id, name, slug, website_url, status, created_at")
    .order("created_at", { ascending: false })
    .returns<Account[]>();

  const clients = accounts ?? [];

  return (
    <div className="mx-auto max-w-7xl px-6 py-8">
      <div className="mb-6">
        <p className="text-sm text-slate-500">Noro Dash</p>
        <h1 className="mt-0.5 text-2xl font-semibold text-ink">Clientes</h1>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
        <section className="rounded-lg bg-white p-6 shadow-panel">
          <div className="mb-5 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-ink">Seus clientes</h2>
            <span className="flex items-center gap-1.5 rounded-md bg-slate-100 px-3 py-1.5 text-sm text-slate-600">
              <Users size={14} className="text-sea" />
              {clients.length} {clients.length === 1 ? "cliente" : "clientes"}
            </span>
          </div>

          {clients.length === 0 ? (
            <div className="flex min-h-56 items-center justify-center rounded-lg border border-dashed border-slate-300 bg-slate-50 px-6 text-center">
              <div className="max-w-sm">
                <Building2 className="mx-auto mb-3 text-slate-400" size={32} />
                <h3 className="text-base font-semibold text-ink">Nenhum cliente cadastrado</h3>
                <p className="mt-2 text-sm leading-6 text-slate-500">
                  Use o formulário ao lado para cadastrar o primeiro cliente.
                </p>
              </div>
            </div>
          ) : (
            <ul className="divide-y divide-slate-100">
              {clients.map((client) => (
                <li key={client.id}>
                  <Link
                    href={`/dashboard/clientes/${client.slug}`}
                    className="flex items-center justify-between gap-4 py-4 transition hover:bg-slate-50 -mx-2 px-2 rounded-md"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-md bg-teal-50 text-sea">
                        <Building2 size={18} />
                      </div>
                      <div>
                        <p className="font-medium text-ink">{client.name}</p>
                        {client.website_url ? (
                          <span className="inline-flex items-center gap-1 text-sm text-slate-400">
                            {client.website_url}
                            <ExternalLink size={11} />
                          </span>
                        ) : (
                          <p className="text-sm text-slate-400">sem site</p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-600">
                        {client.status}
                      </span>
                      <ChevronRight size={16} className="text-slate-300" />
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>

        <aside className="rounded-lg bg-white p-6 shadow-panel">
          <h2 className="mb-1 text-lg font-semibold text-ink">Adicionar cliente</h2>
          <p className="mb-5 text-sm leading-6 text-slate-500">
            Cadastre um novo cliente na agência.
          </p>
          {profile?.agency_id ? (
            <AddClientForm agencyId={profile.agency_id} />
          ) : (
            <div className="rounded-md border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
              Seu usuário não está vinculado a nenhuma agência.
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}
