# Supabase - Noro Dash

## Arquivos

- `schema.sql`: schema inicial com tabelas, indices, funcoes auxiliares, RLS e policies.
- `tests/multi_tenant_isolation.sql`: roteiro inicial para validar isolamento entre agencias.

## Ordem sugerida

1. Criar projeto Supabase staging.
2. Aplicar `schema.sql`.
3. Criar usuarios reais pelo Supabase Auth.
4. Adaptar os UUIDs do teste para usuarios reais.
5. Rodar os testes de isolamento.

## Observacoes

- Tokens OAuth nao devem ser armazenados diretamente em tabelas publicas.
- O campo `integrations.token_vault_key` deve apontar para segredo no Supabase Vault.
- Workers/backend podem usar service role; frontend nunca deve receber service role key.
- As tabelas de metricas ainda estao em versao MVP. Particionamento mensal deve entrar antes de alto volume em producao.
