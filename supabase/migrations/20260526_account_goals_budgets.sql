-- Goals per client per month
CREATE TABLE IF NOT EXISTS public.account_goals (
  id             UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  account_id     UUID NOT NULL REFERENCES public.accounts(id) ON DELETE CASCADE,
  month          TEXT NOT NULL, -- YYYY-MM
  leads_goal         INTEGER,
  conversions_goal   INTEGER,
  revenue_goal       NUMERIC(14,2),
  roas_goal          NUMERIC(6,2),
  created_at     TIMESTAMPTZ DEFAULT now(),
  UNIQUE (account_id, month)
);

-- Budgets per client per month per platform
CREATE TABLE IF NOT EXISTS public.account_budgets (
  id             UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  account_id     UUID NOT NULL REFERENCES public.accounts(id) ON DELETE CASCADE,
  month          TEXT NOT NULL, -- YYYY-MM
  platform       TEXT NOT NULL, -- meta_ads | google_ads | etc
  amount         NUMERIC(14,2),
  created_at     TIMESTAMPTZ DEFAULT now(),
  UNIQUE (account_id, month, platform)
);

-- RLS: agency members can read/write their own clients' data
ALTER TABLE public.account_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.account_budgets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "agency members manage goals"
  ON public.account_goals
  USING (
    account_id IN (
      SELECT a.id FROM public.accounts a
      JOIN public.profiles p ON p.agency_id = a.agency_id
      WHERE p.id = auth.uid()
    )
  )
  WITH CHECK (
    account_id IN (
      SELECT a.id FROM public.accounts a
      JOIN public.profiles p ON p.agency_id = a.agency_id
      WHERE p.id = auth.uid()
    )
  );

CREATE POLICY "agency members manage budgets"
  ON public.account_budgets
  USING (
    account_id IN (
      SELECT a.id FROM public.accounts a
      JOIN public.profiles p ON p.agency_id = a.agency_id
      WHERE p.id = auth.uid()
    )
  )
  WITH CHECK (
    account_id IN (
      SELECT a.id FROM public.accounts a
      JOIN public.profiles p ON p.agency_id = a.agency_id
      WHERE p.id = auth.uid()
    )
  );
