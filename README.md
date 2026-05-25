# Noro Dash

Plataforma SaaS white-label para gestao, analise e automacao de trafego pago para agencias.

## Objetivo

Centralizar dados de midia, analytics, e-commerce, metas, orcamentos, alertas e insights de IA em uma experiencia unica para agencias e clientes.

## Estrutura atual

App unico Next.js (App Router) na raiz. O monorepo com `apps/api` (NestJS) e
`packages/*` descrito no PRD/ROADMAP e evolucao futura — ainda nao existe no codigo.

```text
noro-dash/
+-- src/
|   +-- app/            # rotas (App Router): /, /login, /dashboard
|   +-- components/     # componentes (auth, ...)
|   +-- lib/            # env, clients Supabase (browser/server)
|   +-- middleware.ts   # protecao de rotas via Supabase Auth
+-- supabase/
|   +-- migrations/     # schema + bootstrap super_admin
|   +-- tests/          # isolamento multi-tenant
+-- docs/
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
