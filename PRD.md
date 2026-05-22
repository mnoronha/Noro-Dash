# PRD - Noro Dash

## Visao

Noro Dash e uma plataforma SaaS white-label all-in-one para agencias de trafego pago. O produto centraliza dashboards multi-cliente, integracoes com plataformas de midia e analytics, alertas inteligentes, onboarding, metas, orcamentos, auditoria e camada futura de IA para insights e otimizacoes.

## Publico-alvo

- Primario: uso interno da agencia com os primeiros clientes.
- Futuro: outras agencias em modelo B2B2C white-label.

## Diferenciais

- IA proativa com insights e sugestoes.
- Visao consolidada de midia, analytics, e-commerce e SEO.
- Alertas por email, WhatsApp e in-app.
- White-label nativo.
- Health Score por cliente.

## Arquitetura

- `apps/web`: dashboard Next.js.
- `apps/api`: API NestJS.
- `apps/workers`: sincronizacao, alertas e tarefas de IA.
- `packages/database`: schemas, migrations e tipos.
- `packages/integrations`: conectores externos.
- `packages/shared`: tipos e utilitarios compartilhados.
- `packages/ai`: prompts, parsers e camada de IA.
- `packages/ui`: componentes compartilhados.

## Papeis

- `super_admin`: acesso total a plataforma.
- `agency_admin`: acesso total a uma agencia.
- `agency_manager`: acesso aos clientes atribuidos.
- `client_admin`: acesso administrativo da propria conta.
- `client_viewer`: visualizacao da propria conta.

## MVP

O MVP deve provar que a plataforma consegue:

- autenticar usuarios;
- isolar agencias e contas via RLS;
- conectar Meta Ads e GA4;
- sincronizar dados basicos;
- exibir dashboard por agencia e por cliente;
- cadastrar metas e orcamentos;
- disparar alertas relevantes;
- operar com um cliente piloto por quatro semanas.

## Criterios de sucesso

- Dashboard P95 abaixo de 2s.
- Sync Meta + GA4 com 99% de estabilidade.
- Zero vazamento entre tenants.
- Pelo menos um alerta critico util durante piloto.
- NPS do cliente piloto maior que 8.
