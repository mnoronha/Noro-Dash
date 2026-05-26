import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { ClientTabNav } from "@/components/clients/tab-nav";

type Account = { id: string; name: string; slug: string; status: string };

export default async function ClienteLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { slug: string };
}) {
  const supabase = createSupabaseServerClient();

  const { data: account } = await supabase
    .from("accounts")
    .select("id, name, slug, status")
    .eq("slug", params.slug)
    .single<Account>();

  if (!account) notFound();

  const base = `/dashboard/clientes/${params.slug}`;

  return (
    <div className="mx-auto max-w-7xl px-6 py-8">
      {/* Breadcrumb + header */}
      <div className="flex items-center gap-3 mb-6">
        <Link
          href="/dashboard/clientes"
          className="flex h-9 w-9 items-center justify-center rounded-md border border-slate-200 text-slate-500 transition hover:bg-slate-50 hover:text-ink"
        >
          <ArrowLeft size={16} />
        </Link>
        <div>
          <p className="text-xs text-slate-400">
            <Link href="/dashboard" className="hover:text-ink">Dashboard</Link>
            {" / "}
            <Link href="/dashboard/clientes" className="hover:text-ink">Clientes</Link>
          </p>
          <div className="flex items-center gap-2 mt-0.5">
            <h1 className="text-xl font-semibold text-ink">{account.name}</h1>
            <span className="rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-medium text-emerald-600">
              {account.status}
            </span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-slate-200 mb-6">
        <ClientTabNav base={base} />
      </div>

      {children}
    </div>
  );
}
