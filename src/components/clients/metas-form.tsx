"use client";

import { FormEvent, useState } from "react";
import { Loader2, Save, Target, DollarSign } from "lucide-react";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";
import { useRouter } from "next/navigation";

type Goal = {
  id: string;
  month: string;
  leads_goal: number | null;
  conversions_goal: number | null;
  revenue_goal: number | null;
  roas_goal: number | null;
};

type Budget = {
  id: string;
  month: string;
  platform: string;
  amount: number | null;
};

const PLATFORMS = [
  { value: "meta_ads", label: "Meta Ads" },
  { value: "google_ads", label: "Google Ads" },
];

function fmtMonth(m: string) {
  const [year, month] = m.split("-");
  return new Date(Number(year), Number(month) - 1).toLocaleDateString("pt-BR", {
    month: "long",
    year: "numeric",
  });
}

type Props = {
  accountId: string;
  currentMonth: string;
  initialGoal: Goal | null;
  initialBudgets: Budget[];
  pastGoals: Goal[];
};

export function MetasForm({ accountId, currentMonth, initialGoal, initialBudgets, pastGoals }: Props) {
  const router = useRouter();
  const supabase = createSupabaseBrowserClient();

  const [leadsGoal, setLeadsGoal] = useState(String(initialGoal?.leads_goal ?? ""));
  const [convsGoal, setConvsGoal] = useState(String(initialGoal?.conversions_goal ?? ""));
  const [revenueGoal, setRevenueGoal] = useState(String(initialGoal?.revenue_goal ?? ""));
  const [roasGoal, setRoasGoal] = useState(String(initialGoal?.roas_goal ?? ""));

  const getInitialBudget = (platform: string) => {
    const b = initialBudgets.find((b) => b.platform === platform);
    return String(b?.amount ?? "");
  };
  const [budgets, setBudgets] = useState<Record<string, string>>({
    meta_ads: getInitialBudget("meta_ads"),
    google_ads: getInitialBudget("google_ads"),
  });

  const [loadingGoals, setLoadingGoals] = useState(false);
  const [loadingBudgets, setLoadingBudgets] = useState(false);
  const [errorGoals, setErrorGoals] = useState<string | null>(null);
  const [errorBudgets, setErrorBudgets] = useState<string | null>(null);
  const [savedGoals, setSavedGoals] = useState(false);
  const [savedBudgets, setSavedBudgets] = useState(false);

  async function handleGoalsSubmit(event: FormEvent) {
    event.preventDefault();
    setErrorGoals(null);
    setSavedGoals(false);
    setLoadingGoals(true);

    const payload = {
      account_id: accountId,
      month: currentMonth,
      leads_goal: leadsGoal ? Number(leadsGoal) : null,
      conversions_goal: convsGoal ? Number(convsGoal) : null,
      revenue_goal: revenueGoal ? Number(revenueGoal) : null,
      roas_goal: roasGoal ? Number(roasGoal) : null,
    };

    const { error } = initialGoal
      ? await supabase.from("account_goals").update(payload).eq("id", initialGoal.id)
      : await supabase.from("account_goals").insert(payload);

    setLoadingGoals(false);
    if (error) { setErrorGoals(error.message); return; }
    setSavedGoals(true);
    router.refresh();
  }

  async function handleBudgetsSubmit(event: FormEvent) {
    event.preventDefault();
    setErrorBudgets(null);
    setSavedBudgets(false);
    setLoadingBudgets(true);

    for (const platform of PLATFORMS.map((p) => p.value)) {
      const amount = budgets[platform] ? Number(budgets[platform]) : null;
      const existing = initialBudgets.find((b) => b.platform === platform);

      if (existing) {
        await supabase.from("account_budgets").update({ amount }).eq("id", existing.id);
      } else if (amount !== null) {
        await supabase.from("account_budgets").insert({
          account_id: accountId,
          month: currentMonth,
          platform,
          amount,
        });
      }
    }

    setLoadingBudgets(false);
    setSavedBudgets(true);
    router.refresh();
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Metas */}
        <section className="rounded-lg bg-white p-6 shadow-panel">
          <div className="mb-5 flex items-center gap-2">
            <Target size={16} className="text-sea" />
            <h2 className="text-lg font-semibold text-ink">Metas — {fmtMonth(currentMonth)}</h2>
          </div>

          <form className="space-y-4" onSubmit={handleGoalsSubmit}>
            <div className="grid grid-cols-2 gap-4">
              <label className="block">
                <span className="mb-2 block text-sm font-medium text-slate-700">Leads</span>
                <input
                  className="h-11 w-full rounded-md border border-slate-200 bg-white px-3 text-ink outline-none transition focus:border-sea focus:ring-4 focus:ring-teal-100"
                  type="number"
                  min="0"
                  value={leadsGoal}
                  onChange={(e) => setLeadsGoal(e.target.value)}
                  placeholder="—"
                />
              </label>
              <label className="block">
                <span className="mb-2 block text-sm font-medium text-slate-700">Conversões</span>
                <input
                  className="h-11 w-full rounded-md border border-slate-200 bg-white px-3 text-ink outline-none transition focus:border-sea focus:ring-4 focus:ring-teal-100"
                  type="number"
                  min="0"
                  value={convsGoal}
                  onChange={(e) => setConvsGoal(e.target.value)}
                  placeholder="—"
                />
              </label>
              <label className="block">
                <span className="mb-2 block text-sm font-medium text-slate-700">Receita (R$)</span>
                <input
                  className="h-11 w-full rounded-md border border-slate-200 bg-white px-3 text-ink outline-none transition focus:border-sea focus:ring-4 focus:ring-teal-100"
                  type="number"
                  min="0"
                  step="0.01"
                  value={revenueGoal}
                  onChange={(e) => setRevenueGoal(e.target.value)}
                  placeholder="—"
                />
              </label>
              <label className="block">
                <span className="mb-2 block text-sm font-medium text-slate-700">ROAS mínimo</span>
                <input
                  className="h-11 w-full rounded-md border border-slate-200 bg-white px-3 text-ink outline-none transition focus:border-sea focus:ring-4 focus:ring-teal-100"
                  type="number"
                  min="0"
                  step="0.01"
                  value={roasGoal}
                  onChange={(e) => setRoasGoal(e.target.value)}
                  placeholder="—"
                />
              </label>
            </div>

            {errorGoals && (
              <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {errorGoals}
              </div>
            )}
            {savedGoals && (
              <div className="rounded-md border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
                Metas salvas.
              </div>
            )}

            <button
              type="submit"
              disabled={loadingGoals}
              className="flex items-center gap-2 rounded-md bg-ink px-4 py-2.5 text-sm font-medium text-white transition hover:bg-slate-800 disabled:opacity-70"
            >
              {loadingGoals ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />}
              Salvar metas
            </button>
          </form>
        </section>

        {/* Orçamentos */}
        <section className="rounded-lg bg-white p-6 shadow-panel">
          <div className="mb-5 flex items-center gap-2">
            <DollarSign size={16} className="text-sea" />
            <h2 className="text-lg font-semibold text-ink">Orçamentos — {fmtMonth(currentMonth)}</h2>
          </div>

          <form className="space-y-4" onSubmit={handleBudgetsSubmit}>
            {PLATFORMS.map(({ value, label }) => (
              <label key={value} className="block">
                <span className="mb-2 block text-sm font-medium text-slate-700">{label} (R$)</span>
                <input
                  className="h-11 w-full rounded-md border border-slate-200 bg-white px-3 text-ink outline-none transition focus:border-sea focus:ring-4 focus:ring-teal-100"
                  type="number"
                  min="0"
                  step="0.01"
                  value={budgets[value]}
                  onChange={(e) => setBudgets((prev) => ({ ...prev, [value]: e.target.value }))}
                  placeholder="—"
                />
              </label>
            ))}

            {errorBudgets && (
              <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {errorBudgets}
              </div>
            )}
            {savedBudgets && (
              <div className="rounded-md border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
                Orçamentos salvos.
              </div>
            )}

            <button
              type="submit"
              disabled={loadingBudgets}
              className="flex items-center gap-2 rounded-md bg-ink px-4 py-2.5 text-sm font-medium text-white transition hover:bg-slate-800 disabled:opacity-70"
            >
              {loadingBudgets ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />}
              Salvar orçamentos
            </button>
          </form>
        </section>
      </div>

      {/* Histórico de metas */}
      {pastGoals.length > 0 && (
        <section className="rounded-lg bg-white p-6 shadow-panel">
          <h2 className="mb-4 text-base font-semibold text-ink">Histórico de metas</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 text-left text-xs font-medium uppercase tracking-wide text-slate-400">
                  <th className="pb-3 pr-6">Mês</th>
                  <th className="pb-3 pr-6">Leads</th>
                  <th className="pb-3 pr-6">Conversões</th>
                  <th className="pb-3 pr-6">Receita</th>
                  <th className="pb-3">ROAS mín.</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {pastGoals.map((g) => (
                  <tr key={g.id} className={g.month === currentMonth ? "bg-teal-50/40" : ""}>
                    <td className="py-3 pr-6 font-medium text-ink">{fmtMonth(g.month)}</td>
                    <td className="py-3 pr-6 text-slate-600">{g.leads_goal ?? "—"}</td>
                    <td className="py-3 pr-6 text-slate-600">{g.conversions_goal ?? "—"}</td>
                    <td className="py-3 pr-6 text-slate-600">
                      {g.revenue_goal != null
                        ? g.revenue_goal.toLocaleString("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 })
                        : "—"}
                    </td>
                    <td className="py-3 text-slate-600">{g.roas_goal != null ? g.roas_goal + "x" : "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}
    </div>
  );
}
