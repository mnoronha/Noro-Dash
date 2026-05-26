import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

type Account = { id: string; slug: string; agency_id: string };
type Agency = { meta_app_id: string | null };

export async function GET(request: NextRequest) {
  const accountId = request.nextUrl.searchParams.get("account_id");
  if (!accountId) return NextResponse.json({ error: "missing account_id" }, { status: 400 });

  const supabase = createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.redirect(new URL("/login", request.url));

  const { data: account } = await supabase
    .from("accounts")
    .select("id, slug, agency_id")
    .eq("id", accountId)
    .single<Account>();

  if (!account) return NextResponse.json({ error: "account not found" }, { status: 404 });

  const { data: agency } = await supabase
    .from("agencies")
    .select("meta_app_id")
    .eq("id", account.agency_id)
    .single<Agency>();

  if (!agency?.meta_app_id) {
    return NextResponse.redirect(
      new URL("/dashboard/configuracoes?error=missing_meta_credentials", request.url)
    );
  }

  const state = Buffer.from(
    JSON.stringify({ account_id: accountId, account_slug: account.slug })
  ).toString("base64url");

  const redirectUri = `${request.nextUrl.origin}/api/auth/meta/callback`;

  const oauthUrl = new URL("https://www.facebook.com/v20.0/dialog/oauth");
  oauthUrl.searchParams.set("client_id", agency.meta_app_id);
  oauthUrl.searchParams.set("redirect_uri", redirectUri);
  oauthUrl.searchParams.set("scope", "ads_read,ads_management,read_insights");
  oauthUrl.searchParams.set("state", state);
  oauthUrl.searchParams.set("response_type", "code");

  return NextResponse.redirect(oauthUrl.toString());
}
