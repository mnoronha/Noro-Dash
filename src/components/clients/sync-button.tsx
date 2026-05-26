"use client";

import { useState } from "react";
import { Loader2, RefreshCw } from "lucide-react";
import { useRouter } from "next/navigation";

export function SyncButton({ accountId }: { accountId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<{ type: "ok" | "err"; text: string } | null>(null);

  async function handleSync() {
    setLoading(true);
    setMsg(null);
    try {
      const res = await fetch(`/api/sync/meta?account_id=${accountId}`, { method: "POST" });
      const data: { synced?: number; failed?: number; error?: string } = await res.json();
      if (!res.ok || data.error) {
        setMsg({ type: "err", text: data.error ?? "Erro ao sincronizar." });
      } else if (data.synced === 0) {
        setMsg({ type: "err", text: "Nenhuma integração ativa encontrada." });
      } else {
        setMsg({ type: "ok", text: "Sincronizado com sucesso!" });
        router.refresh();
      }
    } catch {
      setMsg({ type: "err", text: "Falha na requisição." });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex items-center gap-3">
      <button
        onClick={handleSync}
        disabled={loading}
        className="flex items-center gap-1.5 rounded-md border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-600 transition hover:border-sea hover:text-sea disabled:opacity-60"
      >
        {loading ? (
          <Loader2 size={13} className="animate-spin" />
        ) : (
          <RefreshCw size={13} />
        )}
        {loading ? "Sincronizando…" : "Sincronizar agora"}
      </button>
      {msg && (
        <span
          className={`text-xs ${msg.type === "ok" ? "text-emerald-600" : "text-red-600"}`}
        >
          {msg.text}
        </span>
      )}
    </div>
  );
}
