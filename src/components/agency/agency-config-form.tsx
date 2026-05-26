"use client";

import { FormEvent, useState } from "react";
import { Loader2, Save } from "lucide-react";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";
import { useRouter } from "next/navigation";

type Agency = {
  id: string;
  name: string;
  slug: string;
};

export function AgencyConfigForm({ agency }: { agency: Agency }) {
  const router = useRouter();
  const [name, setName] = useState(agency.name);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    setSaved(false);
    const trimmed = name.trim();
    if (!trimmed) { setError("Nome não pode ser vazio."); return; }

    setLoading(true);
    const supabase = createSupabaseBrowserClient();
    const { error: err } = await supabase
      .from("agencies")
      .update({ name: trimmed })
      .eq("id", agency.id);
    setLoading(false);

    if (err) { setError(err.message); return; }
    setSaved(true);
    router.refresh();
  }

  return (
    <form className="space-y-4" onSubmit={handleSubmit}>
      <label className="block">
        <span className="mb-2 block text-sm font-medium text-slate-700">Nome da agência</span>
        <input
          className="h-11 w-full rounded-md border border-slate-200 bg-white px-3 text-ink outline-none transition focus:border-sea focus:ring-4 focus:ring-teal-100"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
      </label>

      <label className="block">
        <span className="mb-2 block text-sm font-medium text-slate-700">Slug</span>
        <input
          className="h-11 w-full rounded-md border border-slate-200 bg-slate-50 px-3 text-slate-400 outline-none cursor-not-allowed"
          type="text"
          value={agency.slug}
          disabled
        />
        <p className="mt-1 text-xs text-slate-400">O slug não pode ser alterado.</p>
      </label>

      {error && (
        <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}
      {saved && (
        <div className="rounded-md border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
          Salvo com sucesso.
        </div>
      )}

      <button
        type="submit"
        disabled={loading}
        className="flex items-center gap-2 rounded-md bg-ink px-4 py-2.5 text-sm font-medium text-white transition hover:bg-slate-800 disabled:opacity-70"
      >
        {loading ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />}
        Salvar
      </button>
    </form>
  );
}
