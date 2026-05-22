-- Noro Dash - multi-tenant isolation smoke test
-- Intended for Supabase SQL editor or local test harness after schema.sql.
-- Replace user UUIDs with real auth.users IDs in staging.

begin;

insert into public.agencies (id, name, slug)
values
  ('00000000-0000-0000-0000-000000000101', 'Agency A', 'agency-a'),
  ('00000000-0000-0000-0000-000000000102', 'Agency B', 'agency-b');

insert into public.accounts (id, agency_id, name, slug)
values
  ('00000000-0000-0000-0000-000000000201', '00000000-0000-0000-0000-000000000101', 'Client A', 'client-a'),
  ('00000000-0000-0000-0000-000000000202', '00000000-0000-0000-0000-000000000102', 'Client B', 'client-b');

-- These UUIDs must exist in auth.users before running outside a transaction fixture.
insert into public.profiles (id, agency_id, full_name, role)
values
  ('00000000-0000-0000-0000-000000000301', '00000000-0000-0000-0000-000000000101', 'Manager A', 'agency_admin'),
  ('00000000-0000-0000-0000-000000000302', '00000000-0000-0000-0000-000000000102', 'Manager B', 'agency_admin');

insert into public.meta_metrics_daily (
  agency_id,
  account_id,
  date,
  campaign_id,
  spend,
  impressions,
  clicks,
  leads
)
values
  ('00000000-0000-0000-0000-000000000101', '00000000-0000-0000-0000-000000000201', current_date, 'campaign-a', 100, 1000, 100, 10),
  ('00000000-0000-0000-0000-000000000102', '00000000-0000-0000-0000-000000000202', current_date, 'campaign-b', 200, 2000, 200, 20);

-- In an automated harness, run the select below with JWT claims for Manager A.
-- Expected result: 1 row, only Client A.
select account_id, campaign_id
from public.meta_metrics_daily
order by account_id;

rollback;
