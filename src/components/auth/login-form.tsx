"use client";

import { FormEvent, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Eye, EyeOff, Loader2, LogIn } from "lucide-react";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";
import { hasSupabaseEnv } from "@/lib/env";

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const envReady = hasSupabaseEnv();
  const [email, setEmail] = useState("noroiaoficial@gmail.com");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError(null);

    if (!envReady) {
      setLoading(false);
      setError("Configuracao pendente: as variaveis do Supabase ainda nao foram definidas no deploy.");
      return;
    }

    const supabase = createSupabaseBrowserClient();
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    setLoading(false);

    if (signInError) {
      setError("Nao consegui entrar com esses dados. Confira email e senha.");
      return;
    }

    router.replace(searchParams.get("next") ?? "/dashboard");
    router.refresh();
  }

  return (
    <div className="rounded-lg bg-white p-8 shadow-panel">
      <div className="mb-8">
        <p className="text-sm font-medium text-sea">Acesso seguro</p>
        <h2 className="mt-2 text-2xl font-semibold text-ink">Entrar no Noro Dash</h2>
        <p className="mt-2 text-sm leading-6 text-slate-500">
          Use o usuario criado no Supabase Auth para acessar a area administrativa.
        </p>
      </div>

      {!envReady ? (
        <div className="mb-6 rounded-md border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          Configuracao pendente: as variaveis do Supabase ainda nao foram
          definidas neste deploy. O login sera habilitado apos configura-las na
          Vercel.
        </div>
      ) : null}

      <form className="space-y-5" onSubmit={handleSubmit}>
        <label className="block">
          <span className="mb-2 block text-sm font-medium text-slate-700">Email</span>
          <input
            className="h-12 w-full rounded-md border border-slate-200 bg-white px-4 text-ink outline-none transition focus:border-sea focus:ring-4 focus:ring-teal-100"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
          />
        </label>

        <label className="block">
          <span className="mb-2 block text-sm font-medium text-slate-700">Senha</span>
          <div className="relative">
            <input
              className="h-12 w-full rounded-md border border-slate-200 bg-white px-4 pr-12 text-ink outline-none transition focus:border-sea focus:ring-4 focus:ring-teal-100"
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
            />
            <button
              aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
              className="absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-md text-slate-500 transition hover:bg-slate-100 hover:text-ink"
              type="button"
              onClick={() => setShowPassword((value) => !value)}
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </label>

        {error ? (
          <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        ) : null}

        <button
          className="flex h-12 w-full items-center justify-center gap-2 rounded-md bg-ink px-4 font-medium text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-70"
          type="submit"
          disabled={loading || !envReady}
        >
          {loading ? <Loader2 className="animate-spin" size={18} /> : <LogIn size={18} />}
          Entrar
        </button>
      </form>
    </div>
  );
}
