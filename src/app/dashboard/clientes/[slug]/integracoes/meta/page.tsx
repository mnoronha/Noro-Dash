import { notFound, redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { SelectAdAccountForm } from "@/components/clients/select-ad-account-form";

type Account = { id: string; name: string; slug: string };
type AdAccount = { id: string; name: string; account_id: string; currency: string };
type Integration = { id: string; meta_data: { ad_accounts: AdAccount[] } | null };

export default async function MetaSelectAccountPage({
  params,
}: {
  params: { slug: string };
}) {
  const supabase = createSupabaseServerClient();

  const { data: account } = await supabase
    .from("accounts")
    .select("id, name, slug")
    .eq("slug", params.slug)
    .single<Account>();

  if (!account) notFound();

  const { data: integration } = await supabase
    .from("integrations")
    .select("id, meta_data")
    .eq("account_id", account.id)
    .eq("provider", "meta_ads")
    .single<Integration>();

  if (!integration?.meta_data?.ad_accounts?.length) {
    redirect(`/dashboard/clientes/${params.slug}`);
  }

  return (
    <div className="max-w-lg">
      <div className="rounded-lg bg-white p-6 shadow-panel">
        <h2 className="mb-1 text-lg font-semibold text-ink">
          Selecionar conta de anúncios
        </h2>
        <p className="mb-6 text-sm text-slate-500">
          Encontramos múltiplas contas vinculadas ao seu Meta. Selecione qual
          conectar para <strong>{account.name}</strong>.
        </p>
        <SelectAdAccountForm
          integrationId={integration.id}
          adAccounts={integration.meta_data.ad_accounts}
          accountSlug={account.slug}
        />
      </div>
    </div>
  );
}
