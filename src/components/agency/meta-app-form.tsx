"use client";

import { FormEvent, useState } from "react";
import { Eye, EyeOff, Loader2, Save } from "lucide-react";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";
import { useRouter } from "next/navigation";

type Agency = {
  id: string;
  meta_app_id: string | null;
  meta_app_secret: string | null;
};

export function MetaAppFormClient({ agency }: { agency: Agency }) {
  const router = useRouter();
  const [appId, setAppId] = useState(agency.meta_app_id ?? "");
  const [appSecret, setAppSecret] = useState(agency.meta_app_secret ?? "");
  const [showSecret, setShowSecret] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    setSaved(false);

    setLoading(true);
    const supabase = createSupabaseBrowserClient();
    const { error: err } = await supabase
      .from("agencies")
      .update({
        meta_app_id: appId.trim() || null,
        meta_app_secret: appSecret.trim() || null,
      })
      .eq("id", agency.id);
    setLoading(false);

    if (err) { setError(err.message); return; }
    setSaved(true);
    router.refresh();
  }

  return (
    <form className="space-y-4" onSubmit={handleSubmit}>
      <label className="block">
        <span className="mb-2 block text-sm font-medium text-slate-700">App ID</span>
        <input
          className="h-11 w-full rounded-md border border-slate-200 bg-white px-3 font-mono text-sm text-ink outline-none transition focus:border-sea focus:ring-4 focus:ring-teal-100"
          type="text"
          value={appId}
          onChange={(e) => setAppId(e.target.value)}
          placeholder="123456789012345"
        />
      </label>

      <label className="block">
        <span className="mb-2 block text-sm font-medium text-slate-700">App Secret</span>
        <div className="relative">
          <input
            className="h-11 w-full rounded-md border border-slate-200 bg-white px-3 pr-10 font-mono text-sm text-ink outline-none transition focus:border-sea focus:ring-4 focus:ring-teal-100"
            type={showSecret ? "text" : "password"}
            value={appSecret}
            onChange={(e) => setAppSecret(e.target.value)}
            placeholder="••••••••••••••••"
          />
          <button
            type="button"
            onClick={() => setShowSecret((v) => !v)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
          >
            {showSecret ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        </div>
      </label>

      {error && (
        <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}
      {saved && (
        <div className="rounded-md border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
          Credenciais salvas.
        </div>
      )}

      <button
        type="submit"
        disabled={loading}
        className="flex items-center gap-2 rounded-md bg-ink px-4 py-2.5 text-sm font-medium text-white transition hover:bg-slate-800 disabled:opacity-70"
      >
        {loading ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />}
        Salvar credenciais
      </button>
    </form>
  );
}
