# Noro Dash

Plataforma SaaS white-label para gestao, analise e automacao de trafego pago para agencias.

## Objetivo

Centralizar dados de midia, analytics, e-commerce, metas, orcamentos, alertas e insights de IA em uma experiencia unica para agencias e clientes.

## Estrutura inicial

```text
noro-dash/
+-- apps/
|   +-- web/
|   +-- api/
|   +-- workers/
+-- packages/
|   +-- ai/
|   +-- database/
|   +-- integrations/
|   +-- shared/
|   +-- ui/
+-- docs/
+-- supabase/
|   +-- tests/
+-- PRD.md
+-- ROADMAP.md
```

## Stack planejada

- Frontend: Next.js, TypeScript, TailwindCSS, shadcn/ui
- Backend: NestJS, BullMQ, Redis
- Dados: Supabase Postgres, RLS, Vault, Realtime
- Infra: Vercel, Railway, Supabase Cloud
- Observabilidade: Sentry, Better Stack, PostHog

## Proximo entregavel

Validar e aplicar o schema Supabase inicial em um projeto staging.
