import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

type StateData = { account_id: string; account_slug: string };
type Account = { id: string; agency_id: string };
type Agency = { meta_app_id: string; meta_app_secret: string };
type AdAccount = { id: string; name: string; account_id: string; currency: string };
type ExistingIntegration = { id: string };

export async function GET(request: NextRequest) {
  const { searchParams, origin } = request.nextUrl;
  const code = searchParams.get("code");
  const state = searchParams.get("state");
  const metaError = searchParams.get("error");

  if (metaError) {
    return NextResponse.redirect(new URL("/dashboard/clientes?error=meta_denied", origin));
  }
  if (!code || !state) {
    return NextResponse.json({ error: "missing params" }, { status: 400 });
  }

  let stateData: StateData;
  try {
    stateData = JSON.parse(Buffer.from(state, "base64url").toString("utf-8"));
  } catch {
    return NextResponse.json({ error: "invalid state" }, { status: 400 });
  }

  const { account_id, account_slug } = stateData;
  const supabase = createSupabaseServerClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.redirect(new URL("/login", origin));

  const { data: account } = await supabase
    .from("accounts")
    .select("id, agency_id")
    .eq("id", account_id)
    .single<Account>();

  if (!account) return NextResponse.redirect(new URL("/dashboard/clientes", origin));

  const { data: agency } = await supabase
    .from("agencies")
    .select("meta_app_id, meta_app_secret")
    .eq("id", account.agency_id)
    .single<Agency>();

  if (!agency?.meta_app_id || !agency?.meta_app_secret) {
    return NextResponse.redirect(
      new URL("/dashboard/configuracoes?error=missing_meta_credentials", origin)
    );
  }

  const redirectUri = `${origin}/api/auth/meta/callback`;

  // Troca code por token de curto prazo
  const tokenRes = await fetch(
    `https://graph.facebook.com/v20.0/oauth/access_token?` +
    `client_id=${agency.meta_app_id}` +
    `&redirect_uri=${encodeURIComponent(redirectUri)}` +
    `&client_secret=${agency.meta_app_secret}` +
    `&code=${code}`
  );
  const tokenData = await tokenRes.json();

  if (!tokenData.access_token) {
    console.error("Meta token error:", tokenData);
    return NextResponse.redirect(
      new URL(`/dashboard/clientes/${account_slug}?error=meta_token`, origin)
    );
  }

  // Troca por token de longo prazo (~60 dias)
  const longRes = await fetch(
    `https://graph.facebook.com/v20.0/oauth/access_token?` +
    `grant_type=fb_exchange_token` +
    `&client_id=${agency.meta_app_id}` +
    `&client_secret=${agency.meta_app_secret}` +
    `&fb_exchange_token=${tokenData.access_token}`
  );
  const longData = await longRes.json();
  const accessToken: string = longData.access_token ?? tokenData.access_token;
  const expiresIn: number = longData.expires_in ?? 5_184_000; // 60 dias padrão

  // Busca contas de anúncio vinculadas ao usuário
  const adAccountsRes = await fetch(
    `https://graph.facebook.com/v20.0/me/adaccounts?` +
    `fields=id,name,account_id,currency,account_status` +
    `&access_token=${accessToken}`
  );
  const adAccountsData = await adAccountsRes.json();
  const adAccounts: AdAccount[] = adAccountsData.data ?? [];

  if (adAccounts.length === 0) {
    return NextResponse.redirect(
      new URL(`/dashboard/clientes/${account_slug}?error=no_ad_accounts`, origin)
    );
  }

  const tokenExpiresAt = new Date(Date.now() + expiresIn * 1_000).toISOString();
  const autoSelect = adAccounts.length === 1;

  const integrationPayload = {
    account_id,
    provider: "meta_ads",
    status: autoSelect ? "active" : "pending_selection",
    access_token: accessToken,
    token_expires_at: tokenExpiresAt,
    external_account_id: autoSelect ? adAccounts[0].id : null,
    meta_data: { ad_accounts: adAccounts },
    last_sync_at: null,
  };

  const { data: existing } = await supabase
    .from("integrations")
    .select("id")
    .eq("account_id", account_id)
    .eq("provider", "meta_ads")
    .single<ExistingIntegration>();

  if (existing) {
    await supabase.from("integrations").update(integrationPayload).eq("id", existing.id);
  } else {
    await supabase.from("integrations").insert(integrationPayload);
  }

  if (autoSelect) {
    return NextResponse.redirect(
      new URL(`/dashboard/clientes/${account_slug}?connected=meta`, origin)
    );
  }

  // Múltiplas contas → página de seleção
  return NextResponse.redirect(
    new URL(`/dashboard/clientes/${account_slug}/integracoes/meta`, origin)
  );
}
