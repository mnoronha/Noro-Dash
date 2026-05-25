# Noro Dash — STATUS (gap vs Spec)

Atualizado: 2026-05-25 · Base: Spec detalhada v1 + `ROADMAP.md` + código real.

Legenda: ✅ feito · 🟡 parcial · ❌ não iniciado · 🔒 só schema (tabela existe no banco, sem nenhuma tela/lógica)

## Resumo executivo

- **Banco de dados:** ~90% desenhado — quase todas as tabelas da spec já existem no `schema.sql`.
- **Aplicação (UI + lógica + integrações):** ~5–10%. Só a fundação: login, dashboard shell, cadastro/lista de clientes.
- **Backend dedicado (NestJS/workers/BullMQ/Redis):** não existe (era stub vazio, removido). Hoje é só Next.js + Supabase.
- 🚨 **Bloqueador de segurança:** RLS **não está bloqueando** — a anon key lê `agencies`/`profiles`. Precisa corrigir antes de dados reais de cliente.

## MVP (Spec §18)

| # | Item | Status | Observação |
|---|---|---|---|
| 1 | Login funcional | ✅ | email/senha, sessão, logout |
| 2 | Estrutura de agência e clientes | ✅ | schema + agência bootstrap "Noro Dash" |
| 3 | Usuário super admin | ✅ | profile `super_admin` (noroiaoficial) |
| 4 | Dashboard inicial | ✅ | shell com KPIs (ainda placeholders) |
| 5 | RLS funcionando | ❌ | **policies existem mas não bloqueiam** (gap) |
| 6 | Cadastro/listagem de clientes | ✅ | `/dashboard/clientes` (criar + listar) |
| 7 | Estrutura para métricas | 🟡 | tabelas staging+mart existem; sem ingestão/seed |
| 8 | Primeiros cards de performance | 🟡 | cards mostram "0" estático, sem dados reais |
| 9 | Base para integração Meta/GA4 | ❌ | só a tabela `integrations`; sem conector/OAuth |
| 10 | Deploy no Vercel | ✅ | https://noro-dash.vercel.app |

## Módulos (Spec §3–16)

| Módulo | Status | Existe | Falta |
|---|---|---|---|
| 4 Autenticação | 🟡 | login, logout, sessão, proteção de rota | recuperação de senha, redirect por papel, Google login, 2FA |
| 5 Gestão de agência | 🟡 | tabela `agencies` + `agency_branding` (1 agência) | UI de gestão, criar/editar agências |
| 5 Gestão de clientes | 🟡 | criar + listar (`accounts`) | editar/excluir, vincular usuários (`user_account_access`) |
| 6 Dashboard da agência | 🟡 | shell, KPI "clientes" real | health score, cards por cliente com métricas, indicadores globais, filtros |
| 7 Dashboard do cliente | ❌ | — | tela por cliente, filtros de período/canal, KPIs reais, gráficos, funil, top campanhas, export CSV |
| 8 Integrações | ❌ | tabela `integrations` 🔒 | conectores Meta/GA4, OAuth, refresh token, status, health |
| 9 Sincronização | ❌ | — | cron/worker, sync incremental, backfill, janelas móveis |
| 10 Camadas de dados | 🟡 | STAGING (`meta_metrics_daily`, `ga4_metrics_daily`) + MART (`mart_account_daily`) | camada RAW (`raw_api_responses`), `mart_account_monthly`, staging Google/ecommerce |
| 11 Metas | ❌ | tabela `goals` 🔒 | UI, pacing, alerta de meta |
| 12 Orçamentos | ❌ | tabela `budgets` 🔒 | UI, burn rate, alerta de estouro/subuso |
| 13 Alertas | ❌ | tabelas `alert_rules`/`alerts` 🔒 | engine de regras, canais (in-app/email/WhatsApp), dedup 24h, severidade |
| — Anotações/eventos | ❌ | tabela `campaign_notes` 🔒 | UI, marcação no gráfico |
| — Tags | ❌ | tabela `tags` 🔒 | UI |
| 14 Health Score | ❌ | — | cálculo (metas/tendência/integrações/engajamento) |
| 15 White-label | ❌ | tabela `agency_branding` 🔒 | aplicar logo/cores/favicon no front, domínio custom |
| — Auditoria | 🟡 | tabela `audit_log` 🔒 | escrita das ações + tela de leitura |
| 16 IA e insights | ❌ (futuro) | tabela `ai_insights` 🔒 | resumos, sugestões, chat com dados |

## Próximos passos da Spec (§19)

1. ✅ Resolver 100% o deploy no Vercel
2. ✅ Login funcionando em produção
3. ✅ Validar conexão Supabase em produção
4. ✅ Criar tela de clientes
5. 🟡 Criar tela de dashboard da agência (shell pronto; falta cards por cliente + indicadores)
6. ❌ Criar seed/demo de métricas
7. ❌ Criar estrutura de metas e orçamento
8. ❌ Implementar primeira integração real (Meta Ads)

## Ordem de construção recomendada (a partir daqui)

1. **🚨 Corrigir RLS** — item de MVP + segurança; bloqueia dados reais. (pequeno/médio)
2. **Seed/demo de métricas** + **dashboard da agência** com cards por cliente (investimento/receita/ROAS/leads/health) — pra a tela ganhar vida. (médio)
3. **Completar gestão de clientes** — editar/excluir + vincular usuários. (pequeno)
4. **Metas + Orçamentos** (UI sobre as tabelas já existentes). (médio)
5. **Integração Meta Ads** — OAuth + sync + worker. É o coração do valor; exige backend/worker. (grande)
6. **GA4**, **dashboard do cliente** detalhado, **alertas**, **health score**. (grande)

## Gaps de schema notados (pra revisar)

- Camada **RAW** (`raw_api_responses`) não existe.
- `mart_account_monthly` não existe (só `mart_account_daily`).
- Staging de **Google Ads** e **e-commerce** (`ecommerce_orders`) não existe (fases pós-MVP — ok por ora).
