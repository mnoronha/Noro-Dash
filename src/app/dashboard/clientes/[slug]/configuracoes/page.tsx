import { notFound } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { ClienteConfigForm } from "@/components/clients/cliente-config-form";

type Account = {
  id: string;
  name: string;
  slug: string;
  website_url: string | null;
  status: string;
};

export default async function ClienteConfigPage({ params }: { params: { slug: string } }) {
  const supabase = createSupabaseServerClient();

  const { data: account } = await supabase
    .from("accounts")
    .select("id, name, slug, website_url, status")
    .eq("slug", params.slug)
    .single<Account>();

  if (!account) notFound();

  return (
    <div className="max-w-xl">
      <div className="rounded-lg bg-white p-6 shadow-panel">
        <h2 className="mb-1 text-lg font-semibold text-ink">Dados do cliente</h2>
        <p className="mb-6 text-sm text-slate-500">
          Edite o nome, site e status deste cliente.
        </p>
        <ClienteConfigForm account={account} />
      </div>

      <div className="mt-6 rounded-lg border border-red-100 bg-white p-6 shadow-panel">
        <h2 className="mb-1 text-base font-semibold text-red-600">Zona de perigo</h2>
        <p className="mb-4 text-sm text-slate-500">
          Ações irreversíveis. Proceda com cautela.
        </p>
        <button
          disabled
          className="rounded-md border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-600 cursor-not-allowed opacity-60"
        >
          Arquivar cliente
        </button>
      </div>
    </div>
  );
}
