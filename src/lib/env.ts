export function getRequiredEnv(name: string) {
  const value = process.env[name];

  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }

  return value;
}

/**
 * True quando as credenciais Supabase estao configuradas. Usado para o app
 * degradar graciosamente (mostrar tela de setup) em vez de dar 500 quando o
 * deploy ainda nao tem as env vars setadas.
 */
export function hasSupabaseEnv() {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  );
}
