"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const tabs = [
  { suffix: "", label: "Visão Geral" },
  { suffix: "/metas", label: "Metas & Orçamentos" },
  { suffix: "/configuracoes", label: "Configurações" },
];

export function ClientTabNav({ base }: { base: string }) {
  const path = usePathname();

  return (
    <nav className="-mb-px flex gap-0">
      {tabs.map(({ suffix, label }) => {
        const href = base + suffix;
        const active = suffix === "" ? path === href : path === href || path.startsWith(href + "/");
        return (
          <Link
            key={suffix}
            href={href}
            className={[
              "px-4 py-3 text-sm font-medium border-b-2 transition-colors",
              active
                ? "border-sea text-sea"
                : "border-transparent text-slate-500 hover:text-ink hover:border-slate-300",
            ].join(" ")}
          >
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
