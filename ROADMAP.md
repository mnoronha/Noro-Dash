# Roadmap - Noro Dash

## Fase 0 - Pre-desenvolvimento

- Definir nome da plataforma: Noro Dash.
- Criar repositorio GitHub privado.
- Criar projetos Supabase staging e production.
- Iniciar Meta App Review.
- Solicitar Google Ads Developer Token.
- Configurar Vercel, Railway, Resend, Sentry, Better Stack e PostHog.

## Fase 1 - Fundacao

- Criar monorepo.
- Configurar Supabase Auth.
- Aplicar schema base.
- Implementar RLS.
- Criar testes de isolamento multi-tenant.
- Criar layout base white-label.
- Implementar login e convite.

## Fase 2 - Integracoes Core

- Criar interface comum de conectores.
- Implementar Meta Ads OAuth, sync e backfill.
- Implementar GA4 OAuth, sync e backfill.
- Criar workers BullMQ.
- Registrar `sync_runs` e health checks.

## Fase 3 - Dashboard MVP

- Visao agencia.
- Visao cliente.
- KPIs principais.
- Graficos temporais.
- Tabelas exportaveis.

## Fase 4 - Metas, Orcamento e Alertas

- CRUD de metas.
- CRUD de orcamentos.
- Engine de alertas.
- Email via Resend.
- WhatsApp via Evolution API.
- Notificacoes in-app.

## Fase 5 - Acabamento MVP

- Anotacoes e eventos.
- Tags.
- White-label basico.
- Auditoria LGPD inicial.
- Piloto com primeiro cliente.

## Fases Futuras

- Google Ads, GSC e Merchant Center.
- Shopify, Nuvemshop e Vnda.
- Insights de IA.
- Chat com dados.
- Health Score.
- Galeria de criativos.
