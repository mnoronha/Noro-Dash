# Proximos Passos - Noro Dash

## Agora

1. Criar o repositorio privado no GitHub com o nome `noro-dash`.
2. Conectar este diretorio local ao repositorio.
3. Criar projeto Supabase staging.
4. Aplicar `supabase/schema.sql` no staging.
5. Criar usuarios de teste no Supabase Auth.
6. Ajustar e rodar `supabase/tests/multi_tenant_isolation.sql`.

## Depois da validacao do banco

1. Preencher `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
2. Instalar dependencias do monorepo.
3. Rodar `pnpm --filter @noro-dash/web dev`.
4. Testar login com `noroiaoficial@gmail.com`.
5. Criar o primeiro `account` da agencia.
6. Preparar fluxo de conexao Meta Ads + GA4.
7. Criar API NestJS em `apps/api`.
8. Criar worker base em `apps/workers`.

## Decisoes pendentes

- Dominio final da plataforma.
- Cores iniciais do white-label padrao.
- Nome do remetente de email.
- Se o piloto comecara com Meta Ads + GA4 ou apenas Meta Ads.
