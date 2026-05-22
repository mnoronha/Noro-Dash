import { Suspense } from "react";
import { LoginForm } from "@/components/auth/login-form";

export default function LoginPage() {
  return (
    <main className="flex min-h-screen bg-mist">
      <section className="hidden min-h-screen w-1/2 flex-col justify-between bg-ink p-10 text-white lg:flex">
        <div>
          <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-sea text-lg font-bold">
            N
          </div>
        </div>

        <div className="max-w-xl">
          <p className="mb-5 text-sm font-medium uppercase tracking-[0.22em] text-sea">
            Noro Dash
          </p>
          <h1 className="text-5xl font-semibold leading-tight">
            Visao clara para trafego, metas e alertas de cada cliente.
          </h1>
          <p className="mt-6 max-w-lg text-base leading-7 text-slate-300">
            A primeira versao conecta a base multi-cliente, autentica usuarios e
            prepara o caminho para dashboards com dados reais de midia e analytics.
          </p>
        </div>

        <div className="grid grid-cols-3 gap-4 text-sm text-slate-300">
          <div>
            <strong className="block text-xl text-white">RLS</strong>
            isolamento nativo
          </div>
          <div>
            <strong className="block text-xl text-white">Meta</strong>
            integracao core
          </div>
          <div>
            <strong className="block text-xl text-white">GA4</strong>
            analytics core
          </div>
        </div>
      </section>

      <section className="flex min-h-screen flex-1 items-center justify-center px-6 py-10">
        <div className="w-full max-w-md">
          <div className="mb-8 lg:hidden">
            <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-lg bg-ink text-lg font-bold text-white">
              N
            </div>
            <h1 className="text-3xl font-semibold text-ink">Noro Dash</h1>
          </div>

          <Suspense>
            <LoginForm />
          </Suspense>
        </div>
      </section>
    </main>
  );
}
