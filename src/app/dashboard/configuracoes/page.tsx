import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { AgencyConfigForm } from "@/components/agency/agency-config-form";
import { MetaAppFormClient } from "@/components/agency/meta-app-form";

type Profile = { agency_id: string | null; role: string };
type Agency = {
  id: string;
  name: string;
  slug: string;
  meta_app_id: string | null;
  meta_app_secret: string | null;
};

export default async function AgencyConfigPage() {
  const supabase = createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("agency_id, role")
    .eq("id", user.id)
    .single<Profile>();

  if (!profile?.agency_id) {
    return (
      <div className="mx-auto max-w-7xl px-6 py-8">
        <div className="mb-6">
          <p className="text-sm text-slate-500">Noro Dash</p>
          <h1 className="mt-0.5 text-2xl font-semibold text-ink">Configurações</h1>
        </div>
        <div className="rounded-md border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          Seu usuário não está vinculado a nenhuma agência.
        </div>
      </div>
    );
  }

  const { data: agency } = await supabase
    .from("agencies")
    .select("id, name, slug, meta_app_id, meta_app_secret")
    .eq("id", profile.agency_id)
    .single<Agency>();

  if (!agency) redirect("/dashboard");

  return (
    <div className="mx-auto max-w-7xl px-6 py-8">
      <div className="mb-6">
        <p className="text-sm text-slate-500">Noro Dash</p>
        <h1 className="mt-0.5 text-2xl font-semibold text-ink">Configurações</h1>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
        <div className="space-y-6">
          <section className="rounded-lg bg-white p-6 shadow-panel">
            <h2 className="mb-1 text-lg font-semibold text-ink">Agência</h2>
            <p className="mb-6 text-sm text-slate-500">
              Dados gerais da agência na plataforma.
            </p>
            <AgencyConfigForm agency={agency} />
          </section>

          <section className="rounded-lg bg-white p-6 shadow-panel">
            <h2 className="mb-1 text-lg font-semibold text-ink">Meta App</h2>
            <p className="mb-1 text-sm text-slate-500">
              Credenciais usadas para OAuth (Meta Ads) e CAPI.
            </p>
            <p className="mb-6 text-xs text-slate-400">
              Obtidos em{" "}
              <a
                href="https://developers.facebook.com/apps"
                target="_blank"
                rel="noopener noreferrer"
                className="underline hover:text-sea"
              >
                developers.facebook.com/apps
              </a>
              .
            </p>
            <MetaAppFormClient agency={agency} />
          </section>
        </div>

        <aside className="space-y-4">
          <div className="rounded-lg bg-white p-5 shadow-panel">
            <h3 className="mb-3 text-sm font-semibold text-ink">Como conectar Meta Ads</h3>
            <ol className="space-y-2 text-sm text-slate-500 list-decimal list-inside">
              <li>Crie um Meta App em developers.facebook.com</li>
              <li>Adicione o produto "Marketing API"</li>
              <li>Copie o App ID e App Secret abaixo</li>
              <li>Configure o domínio de callback OAuth</li>
              <li>Conecte cada cliente na aba Integrações</li>
            </ol>
          </div>

          <div className="rounded-lg border border-amber-100 bg-amber-50 p-5">
            <h3 className="mb-1 text-sm font-semibold text-amber-800">Atenção</h3>
            <p className="text-xs text-amber-700">
              O App Secret é sensível. Nunca compartilhe nem exponha no frontend.
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
}
