"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Plus } from "lucide-react";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";

function slugify(value: string) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
}

export function AddClientForm({ agencyId }: { agencyId: string }) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [website, setWebsite] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    const trimmed = name.trim();
    if (!trimmed) {
      setError("Informe o nome do cliente.");
      return;
    }

    const slug = slugify(trimmed);
    if (!slug) {
      setError("Nome invalido — use letras ou numeros.");
      return;
    }

    setLoading(true);
    const supabase = createSupabaseBrowserClient();
    const { error: insertError } = await supabase.from("accounts").insert({
      agency_id: agencyId,
      name: trimmed,
      slug,
      website_url: website.trim() || null,
      status: "active",
    });
    setLoading(false);

    if (insertError) {
      // 23505 = unique_violation (slug ja existe nessa agencia)
      if (insertError.code === "23505") {
        setError("Ja existe um cliente com esse nome nessa agencia.");
      } else {
        setError(insertError.message || "Nao consegui cadastrar o cliente.");
      }
      return;
    }

    setName("");
    setWebsite("");
    router.refresh();
  }

  return (
    <form className="space-y-4" onSubmit={handleSubmit}>
      <label className="block">
        <span className="mb-2 block text-sm font-medium text-slate-700">
          Nome do cliente *
        </span>
        <input
          className="h-11 w-full rounded-md border border-slate-200 bg-white px-3 text-ink outline-none transition focus:border-sea focus:ring-4 focus:ring-teal-100"
          type="text"
          value={name}
          onChange={(event) => setName(event.target.value)}
          placeholder="Ex: Clinica Tarcio Caetano"
          required
        />
      </label>

      <label className="block">
        <span className="mb-2 block text-sm font-medium text-slate-700">
          Site <span className="font-normal text-slate-400">(opcional)</span>
        </span>
        <input
          className="h-11 w-full rounded-md border border-slate-200 bg-white px-3 text-ink outline-none transition focus:border-sea focus:ring-4 focus:ring-teal-100"
          type="url"
          value={website}
          onChange={(event) => setWebsite(event.target.value)}
          placeholder="https://exemplo.com.br"
        />
      </label>

      {error ? (
        <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      ) : null}

      <button
        className="flex h-11 w-full items-center justify-center gap-2 rounded-md bg-ink px-4 font-medium text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-70"
        type="submit"
        disabled={loading}
      >
        {loading ? <Loader2 className="animate-spin" size={18} /> : <Plus size={18} />}
        Adicionar cliente
      </button>
    </form>
  );
}
