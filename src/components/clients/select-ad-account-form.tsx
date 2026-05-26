"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";
import { useRouter } from "next/navigation";

type AdAccount = { id: string; name: string; account_id: string; currency: string };

export function SelectAdAccountForm({
  integrationId,
  adAccounts,
  accountSlug,
}: {
  integrationId: string;
  adAccounts: AdAccount[];
  accountSlug: string;
}) {
  const router = useRouter();
  const [selected, setSelected] = useState(adAccounts[0]?.id ?? "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit() {
    if (!selected) return;
    setLoading(true);
    const supabase = createSupabaseBrowserClient();
    const { error: err } = await supabase
      .from("integrations")
      .update({ external_account_id: selected, status: "active" })
      .eq("id", integrationId);

    if (err) { setError(err.message); setLoading(false); return; }
    router.push(`/dashboard/clientes/${accountSlug}?connected=meta`);
  }

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        {adAccounts.map((acc) => (
          <label
            key={acc.id}
            className={[
              "flex cursor-pointer items-start gap-3 rounded-md border p-4 transition",
              selected === acc.id
                ? "border-sea bg-teal-50"
                : "border-slate-200 hover:border-slate-300",
            ].join(" ")}
          >
            <input
              type="radio"
              name="ad_account"
              value={acc.id}
              checked={selected === acc.id}
              onChange={() => setSelected(acc.id)}
              className="mt-0.5"
            />
            <div>
              <p className="font-medium text-ink">{acc.name}</p>
              <p className="text-xs text-slate-400">
                ID: {acc.account_id} · {acc.currency}
              </p>
            </div>
          </label>
        ))}
      </div>

      {error && (
        <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <button
        onClick={handleSubmit}
        disabled={loading || !selected}
        className="flex items-center gap-2 rounded-md bg-ink px-4 py-2.5 text-sm font-medium text-white transition hover:bg-slate-800 disabled:opacity-70"
      >
        {loading && <Loader2 className="animate-spin" size={16} />}
        Conectar esta conta
      </button>
    </div>
  );
}
