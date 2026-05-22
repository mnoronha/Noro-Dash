# Noro Dash Web

App web Next.js do Noro Dash.

## Variaveis obrigatorias

Copie `.env.example` para `.env.local` na raiz do monorepo e preencha:

```text
NEXT_PUBLIC_SUPABASE_URL="https://vissuqlvbypholgiqhmc.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="..."
```

A anon key fica em:

Supabase Dashboard -> Project Settings -> API -> Project API keys -> anon public.

## Rodar localmente

```bash
pnpm install
pnpm --filter @noro-dash/web dev
```

O app abre em:

```text
http://localhost:3000
```

## Rotas criadas

- `/login`: login com email e senha via Supabase Auth.
- `/dashboard`: primeira visao administrativa protegida por sessao.

## Usuario inicial

O usuario `noroiaoficial@gmail.com` ja esta vinculado ao perfil `super_admin` no banco.
