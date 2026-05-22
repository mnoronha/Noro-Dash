insert into public.agencies (id, name, slug, status)
values ('11111111-1111-4111-8111-111111111111', 'Noro Dash', 'noro-dash', 'active')
on conflict (slug) do update
set name = excluded.name,
    status = excluded.status,
    updated_at = now();

insert into public.agency_branding (
  agency_id,
  primary_color,
  secondary_color,
  email_from_name
)
values (
  '11111111-1111-4111-8111-111111111111',
  '#111827',
  '#14B8A6',
  'Noro Dash'
)
on conflict (agency_id) do update
set primary_color = excluded.primary_color,
    secondary_color = excluded.secondary_color,
    email_from_name = excluded.email_from_name,
    updated_at = now();

insert into public.profiles (
  id,
  agency_id,
  full_name,
  role
)
values (
  '9c2b3fcb-d76f-409b-85df-ce61b13cee12',
  '11111111-1111-4111-8111-111111111111',
  'Noro IA Oficial',
  'super_admin'
)
on conflict (id) do update
set agency_id = excluded.agency_id,
    full_name = excluded.full_name,
    role = excluded.role,
    updated_at = now();
