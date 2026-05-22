# Decisoes de Arquitetura - Noro Dash

## 2026-05-21 - Nome do produto

Decisao: o sistema se chama Noro Dash.

## 2026-05-21 - Modelo multi-tenant

Decisao: manter nomenclatura `agency -> accounts`.

Motivo: combina com o modelo white-label para agencias e permite expansao futura para multiplas agencias usando a mesma plataforma.

## 2026-05-21 - Supabase como camada de dados

Decisao: usar Supabase Postgres com RLS como base de isolamento multi-tenant.

Motivo: reduz complexidade operacional no inicio, entrega Auth, Realtime, Postgres gerenciado e politicas de seguranca proximas dos dados.
