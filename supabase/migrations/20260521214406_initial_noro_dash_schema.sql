-- Noro Dash - Supabase schema v0.1
-- Apply first in a staging project.

create extension if not exists "uuid-ossp";
create extension if not exists "pgcrypto";

create type public.user_role as enum (
  'super_admin',
  'agency_admin',
  'agency_manager',
  'client_admin',
  'client_viewer'
);

create type public.integration_provider as enum (
  'meta_ads',
  'google_ads',
  'ga4',
  'gsc',
  'merchant_center',
  'shopify',
  'nuvemshop',
  'vnda'
);

create type public.integration_status as enum (
  'pending',
  'active',
  'warning',
  'expired',
  'revoked',
  'error'
);

create type public.sync_status as enum (
  'queued',
  'running',
  'success',
  'partial',
  'failed'
);

create type public.alert_severity as enum (
  'info',
  'warning',
  'critical'
);

create type public.notification_channel as enum (
  'in_app',
  'email',
  'whatsapp'
);

create table public.agencies (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  status text not null default 'active',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.agency_branding (
  agency_id uuid primary key references public.agencies(id) on delete cascade,
  logo_url text,
  favicon_url text,
  primary_color text,
  secondary_color text,
  custom_domain text unique,
  email_from_name text,
  email_from_address text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.accounts (
  id uuid primary key default gen_random_uuid(),
  agency_id uuid not null references public.agencies(id) on delete cascade,
  name text not null,
  slug text not null,
  website_url text,
  status text not null default 'active',
  manager_user_id uuid,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (agency_id, slug)
);

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  agency_id uuid references public.agencies(id) on delete set null,
  full_name text,
  avatar_url text,
  role public.user_role not null default 'client_viewer',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.accounts
  add constraint accounts_manager_user_id_fkey
  foreign key (manager_user_id) references public.profiles(id) on delete set null;

create table public.user_account_access (
  user_id uuid not null references public.profiles(id) on delete cascade,
  account_id uuid not null references public.accounts(id) on delete cascade,
  role public.user_role not null default 'client_viewer',
  created_at timestamptz not null default now(),
  primary key (user_id, account_id)
);

create table public.integrations (
  id uuid primary key default gen_random_uuid(),
  agency_id uuid not null references public.agencies(id) on delete cascade,
  account_id uuid not null references public.accounts(id) on delete cascade,
  provider public.integration_provider not null,
  external_account_id text,
  external_account_name text,
  status public.integration_status not null default 'pending',
  scopes text[] not null default '{}',
  token_vault_key text,
  last_success_at timestamptz,
  last_error_at timestamptz,
  last_error_message text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (account_id, provider, external_account_id)
);

create table public.integration_health_log (
  id uuid primary key default gen_random_uuid(),
  integration_id uuid not null references public.integrations(id) on delete cascade,
  status public.integration_status not null,
  message text,
  checked_at timestamptz not null default now()
);

create table public.sync_runs (
  id uuid primary key default gen_random_uuid(),
  agency_id uuid not null references public.agencies(id) on delete cascade,
  account_id uuid not null references public.accounts(id) on delete cascade,
  integration_id uuid references public.integrations(id) on delete set null,
  provider public.integration_provider not null,
  job_type text not null,
  status public.sync_status not null default 'queued',
  date_from date,
  date_to date,
  rows_read integer not null default 0,
  rows_written integer not null default 0,
  error_message text,
  started_at timestamptz,
  finished_at timestamptz,
  created_at timestamptz not null default now()
);

create table public.meta_metrics_daily (
  id uuid primary key default gen_random_uuid(),
  agency_id uuid not null references public.agencies(id) on delete cascade,
  account_id uuid not null references public.accounts(id) on delete cascade,
  integration_id uuid references public.integrations(id) on delete set null,
  date date not null,
  campaign_id text,
  campaign_name text,
  adset_id text,
  adset_name text,
  ad_id text,
  ad_name text,
  spend numeric(14, 4) not null default 0,
  impressions bigint not null default 0,
  clicks bigint not null default 0,
  leads bigint not null default 0,
  purchases bigint not null default 0,
  revenue numeric(14, 4) not null default 0,
  raw jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (account_id, date, campaign_id, adset_id, ad_id)
);

create table public.ga4_metrics_daily (
  id uuid primary key default gen_random_uuid(),
  agency_id uuid not null references public.agencies(id) on delete cascade,
  account_id uuid not null references public.accounts(id) on delete cascade,
  integration_id uuid references public.integrations(id) on delete set null,
  date date not null,
  source text,
  medium text,
  campaign text,
  sessions bigint not null default 0,
  users_count bigint not null default 0,
  conversions numeric(14, 4) not null default 0,
  revenue numeric(14, 4) not null default 0,
  raw jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (account_id, date, source, medium, campaign)
);

create table public.goals (
  id uuid primary key default gen_random_uuid(),
  agency_id uuid not null references public.agencies(id) on delete cascade,
  account_id uuid not null references public.accounts(id) on delete cascade,
  month date not null,
  leads_goal integer,
  conversions_goal integer,
  revenue_goal numeric(14, 2),
  roas_goal numeric(10, 4),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (account_id, month)
);

create table public.budgets (
  id uuid primary key default gen_random_uuid(),
  agency_id uuid not null references public.agencies(id) on delete cascade,
  account_id uuid not null references public.accounts(id) on delete cascade,
  month date not null,
  channel public.integration_provider not null,
  amount numeric(14, 2) not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (account_id, month, channel)
);

create table public.campaign_notes (
  id uuid primary key default gen_random_uuid(),
  agency_id uuid not null references public.agencies(id) on delete cascade,
  account_id uuid not null references public.accounts(id) on delete cascade,
  event_date date not null,
  title text not null,
  body text,
  category text,
  color text,
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now()
);

create table public.tags (
  id uuid primary key default gen_random_uuid(),
  agency_id uuid not null references public.agencies(id) on delete cascade,
  account_id uuid references public.accounts(id) on delete cascade,
  name text not null,
  color text,
  created_at timestamptz not null default now(),
  unique (agency_id, account_id, name)
);

create table public.alert_rules (
  id uuid primary key default gen_random_uuid(),
  agency_id uuid not null references public.agencies(id) on delete cascade,
  account_id uuid references public.accounts(id) on delete cascade,
  name text not null,
  rule_key text not null,
  severity public.alert_severity not null default 'warning',
  enabled boolean not null default true,
  channels public.notification_channel[] not null default '{in_app}',
  throttle_minutes integer not null default 1440,
  config jsonb not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.alerts (
  id uuid primary key default gen_random_uuid(),
  agency_id uuid not null references public.agencies(id) on delete cascade,
  account_id uuid not null references public.accounts(id) on delete cascade,
  alert_rule_id uuid references public.alert_rules(id) on delete set null,
  severity public.alert_severity not null,
  title text not null,
  message text not null,
  fingerprint text not null,
  resolved_at timestamptz,
  created_at timestamptz not null default now()
);

create table public.notifications (
  id uuid primary key default gen_random_uuid(),
  agency_id uuid not null references public.agencies(id) on delete cascade,
  account_id uuid references public.accounts(id) on delete cascade,
  user_id uuid references public.profiles(id) on delete cascade,
  alert_id uuid references public.alerts(id) on delete cascade,
  channel public.notification_channel not null,
  title text not null,
  body text not null,
  read_at timestamptz,
  sent_at timestamptz,
  created_at timestamptz not null default now()
);

create table public.ai_insights (
  id uuid primary key default gen_random_uuid(),
  agency_id uuid not null references public.agencies(id) on delete cascade,
  account_id uuid not null references public.accounts(id) on delete cascade,
  insight_date date not null,
  title text not null,
  body text not null,
  model text,
  metadata jsonb not null default '{}',
  created_at timestamptz not null default now()
);

create table public.audit_log (
  id uuid primary key default gen_random_uuid(),
  agency_id uuid references public.agencies(id) on delete set null,
  account_id uuid references public.accounts(id) on delete set null,
  actor_user_id uuid references public.profiles(id) on delete set null,
  action text not null,
  entity_table text,
  entity_id uuid,
  metadata jsonb not null default '{}',
  created_at timestamptz not null default now()
);

create materialized view public.mart_account_daily as
select
  agency_id,
  account_id,
  date,
  sum(spend) as spend,
  sum(impressions) as impressions,
  sum(clicks) as clicks,
  sum(leads) as leads,
  sum(purchases) as purchases,
  sum(revenue) as revenue
from public.meta_metrics_daily
group by agency_id, account_id, date;

create unique index mart_account_daily_unique
  on public.mart_account_daily (account_id, date);

create index accounts_agency_id_idx on public.accounts (agency_id);
create index profiles_agency_id_idx on public.profiles (agency_id);
create index integrations_account_provider_idx on public.integrations (account_id, provider);
create index sync_runs_account_created_idx on public.sync_runs (account_id, created_at desc);
create index meta_metrics_daily_account_date_idx on public.meta_metrics_daily (account_id, date desc);
create index ga4_metrics_daily_account_date_idx on public.ga4_metrics_daily (account_id, date desc);
create index alerts_account_created_idx on public.alerts (account_id, created_at desc);
create index notifications_user_created_idx on public.notifications (user_id, created_at desc);
create index audit_log_agency_created_idx on public.audit_log (agency_id, created_at desc);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger agencies_set_updated_at before update on public.agencies
for each row execute function public.set_updated_at();

create trigger agency_branding_set_updated_at before update on public.agency_branding
for each row execute function public.set_updated_at();

create trigger accounts_set_updated_at before update on public.accounts
for each row execute function public.set_updated_at();

create trigger profiles_set_updated_at before update on public.profiles
for each row execute function public.set_updated_at();

create trigger integrations_set_updated_at before update on public.integrations
for each row execute function public.set_updated_at();

create trigger meta_metrics_daily_set_updated_at before update on public.meta_metrics_daily
for each row execute function public.set_updated_at();

create trigger ga4_metrics_daily_set_updated_at before update on public.ga4_metrics_daily
for each row execute function public.set_updated_at();

create trigger goals_set_updated_at before update on public.goals
for each row execute function public.set_updated_at();

create trigger budgets_set_updated_at before update on public.budgets
for each row execute function public.set_updated_at();

create trigger alert_rules_set_updated_at before update on public.alert_rules
for each row execute function public.set_updated_at();

create or replace function public.current_profile()
returns public.profiles
language sql
stable
security definer
set search_path = public
as $$
  select *
  from public.profiles
  where id = auth.uid()
  limit 1
$$;

create or replace function public.is_super_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.profiles
    where id = auth.uid()
      and role = 'super_admin'
  )
$$;

create or replace function public.current_agency_id()
returns uuid
language sql
stable
security definer
set search_path = public
as $$
  select agency_id
  from public.profiles
  where id = auth.uid()
  limit 1
$$;

create or replace function public.can_access_account(target_account_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select public.is_super_admin()
    or exists (
      select 1
      from public.profiles p
      join public.accounts a on a.agency_id = p.agency_id
      where p.id = auth.uid()
        and p.role in ('agency_admin', 'agency_manager')
        and a.id = target_account_id
    )
    or exists (
      select 1
      from public.user_account_access uaa
      where uaa.user_id = auth.uid()
        and uaa.account_id = target_account_id
    )
$$;

create or replace function public.can_manage_agency(target_agency_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select public.is_super_admin()
    or exists (
      select 1
      from public.profiles
      where id = auth.uid()
        and agency_id = target_agency_id
        and role in ('agency_admin')
    )
$$;

alter table public.agencies enable row level security;
alter table public.agency_branding enable row level security;
alter table public.accounts enable row level security;
alter table public.profiles enable row level security;
alter table public.user_account_access enable row level security;
alter table public.integrations enable row level security;
alter table public.integration_health_log enable row level security;
alter table public.sync_runs enable row level security;
alter table public.meta_metrics_daily enable row level security;
alter table public.ga4_metrics_daily enable row level security;
alter table public.goals enable row level security;
alter table public.budgets enable row level security;
alter table public.campaign_notes enable row level security;
alter table public.tags enable row level security;
alter table public.alert_rules enable row level security;
alter table public.alerts enable row level security;
alter table public.notifications enable row level security;
alter table public.ai_insights enable row level security;
alter table public.audit_log enable row level security;

create policy agencies_select on public.agencies
for select using (public.is_super_admin() or id = public.current_agency_id());

create policy agency_branding_select on public.agency_branding
for select using (public.is_super_admin() or agency_id = public.current_agency_id());

create policy accounts_select on public.accounts
for select using (public.can_access_account(id));

create policy profiles_select on public.profiles
for select using (
  public.is_super_admin()
  or id = auth.uid()
  or agency_id = public.current_agency_id()
);

create policy user_account_access_select on public.user_account_access
for select using (
  public.is_super_admin()
  or user_id = auth.uid()
  or public.can_access_account(account_id)
);

create policy integrations_select on public.integrations
for select using (public.can_access_account(account_id));

create policy integration_health_log_select on public.integration_health_log
for select using (
  exists (
    select 1
    from public.integrations i
    where i.id = integration_id
      and public.can_access_account(i.account_id)
  )
);

create policy sync_runs_select on public.sync_runs
for select using (public.can_access_account(account_id));

create policy meta_metrics_daily_select on public.meta_metrics_daily
for select using (public.can_access_account(account_id));

create policy ga4_metrics_daily_select on public.ga4_metrics_daily
for select using (public.can_access_account(account_id));

create policy goals_select on public.goals
for select using (public.can_access_account(account_id));

create policy budgets_select on public.budgets
for select using (public.can_access_account(account_id));

create policy campaign_notes_select on public.campaign_notes
for select using (public.can_access_account(account_id));

create policy tags_select on public.tags
for select using (
  public.is_super_admin()
  or agency_id = public.current_agency_id()
);

create policy alert_rules_select on public.alert_rules
for select using (
  public.is_super_admin()
  or agency_id = public.current_agency_id()
);

create policy alerts_select on public.alerts
for select using (public.can_access_account(account_id));

create policy notifications_select on public.notifications
for select using (
  public.is_super_admin()
  or user_id = auth.uid()
  or (user_id is null and agency_id = public.current_agency_id())
);

create policy ai_insights_select on public.ai_insights
for select using (public.can_access_account(account_id));

create policy audit_log_select on public.audit_log
for select using (
  public.is_super_admin()
  or agency_id = public.current_agency_id()
);

create policy agencies_manage on public.agencies
for all using (public.is_super_admin())
with check (public.is_super_admin());

create policy agency_branding_manage on public.agency_branding
for all using (public.can_manage_agency(agency_id))
with check (public.can_manage_agency(agency_id));

create policy accounts_manage on public.accounts
for all using (public.can_manage_agency(agency_id))
with check (public.can_manage_agency(agency_id));

create policy user_account_access_manage on public.user_account_access
for all using (
  exists (
    select 1
    from public.accounts a
    where a.id = account_id
      and public.can_manage_agency(a.agency_id)
  )
)
with check (
  exists (
    select 1
    from public.accounts a
    where a.id = account_id
      and public.can_manage_agency(a.agency_id)
  )
);

create policy goals_manage on public.goals
for all using (public.can_manage_agency(agency_id))
with check (public.can_manage_agency(agency_id));

create policy budgets_manage on public.budgets
for all using (public.can_manage_agency(agency_id))
with check (public.can_manage_agency(agency_id));

create policy campaign_notes_manage on public.campaign_notes
for all using (public.can_access_account(account_id))
with check (public.can_access_account(account_id));

create policy tags_manage on public.tags
for all using (public.can_manage_agency(agency_id))
with check (public.can_manage_agency(agency_id));

create policy alert_rules_manage on public.alert_rules
for all using (public.can_manage_agency(agency_id))
with check (public.can_manage_agency(agency_id));

create policy notifications_update_own on public.notifications
for update using (user_id = auth.uid())
with check (user_id = auth.uid());

comment on table public.integrations is 'OAuth/API connections. Store sensitive token material in Supabase Vault; token_vault_key points to the secret.';
comment on materialized view public.mart_account_daily is 'Consolidated daily account KPIs for fast dashboard reads. Refresh from backend/workers after sync batches.';
