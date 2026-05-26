import { notFound } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { MetasForm } from "@/components/clients/metas-form";

type Account = { id: string; name: string; slug: string };

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

export default async function MetasPage({ params }: { params: { slug: string } }) {
  const supabase = createSupabaseServerClient();

  const { data: account } = await supabase
    .from("accounts")
    .select("id, name, slug")
    .eq("slug", params.slug)
    .single<Account>();

  if (!account) notFound();

  const now = new Date();
  const currentMonth = `${now.getUTCFullYear()}-${String(now.getUTCMonth() + 1).padStart(2, "0")}`;

  const [{ data: goalRows }, { data: budgetRows }] = await Promise.all([
    supabase
      .from("account_goals")
      .select("id, month, leads_goal, conversions_goal, revenue_goal, roas_goal")
      .eq("account_id", account.id)
      .order("month", { ascending: false })
      .limit(6)
      .returns<Goal[]>(),
    supabase
      .from("account_budgets")
      .select("id, month, platform, amount")
      .eq("account_id", account.id)
      .order("month", { ascending: false })
      .limit(12)
      .returns<Budget[]>(),
  ]);

  const currentGoal = (goalRows ?? []).find((g) => g.month === currentMonth) ?? null;
  const currentBudgets = (budgetRows ?? []).filter((b) => b.month === currentMonth);

  return (
    <MetasForm
      accountId={account.id}
      currentMonth={currentMonth}
      initialGoal={currentGoal}
      initialBudgets={currentBudgets}
      pastGoals={goalRows ?? []}
    />
  );
}
