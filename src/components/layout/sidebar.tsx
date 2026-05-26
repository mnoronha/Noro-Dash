"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  Settings,
  LogOut,
} from "lucide-react";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";
import { useRouter } from "next/navigation";

const nav = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { href: "/dashboard/clientes", label: "Clientes", icon: Users, exact: false },
  { href: "/dashboard/configuracoes", label: "Configurações", icon: Settings, exact: false },
];

type Props = {
  agencyName: string;
  userName: string;
  userRole: string;
};

export function Sidebar({ agencyName, userName, userRole }: Props) {
  const path = usePathname();
  const router = useRouter();
  const supabase = createSupabaseBrowserClient();

  async function signOut() {
    await supabase.auth.signOut();
    router.replace("/login");
    router.refresh();
  }

  function isActive(href: string, exact: boolean) {
    return exact ? path === href : path === href || path.startsWith(href + "/");
  }

  return (
    <aside className="fixed left-0 top-0 z-30 flex h-full w-60 flex-col border-r border-slate-200 bg-white">
      {/* Logo */}
      <div className="border-b border-slate-100 px-5 py-5">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-ink text-sm font-bold text-white">
            N
          </div>
          <div>
            <p className="text-sm font-semibold text-ink">Noro Dash</p>
            <p className="text-xs text-slate-400 truncate max-w-32">{agencyName}</p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 space-y-0.5 px-3 py-4">
        {nav.map(({ href, label, icon: Icon, exact }) => {
          const active = isActive(href, exact);
          return (
            <Link
              key={href}
              href={href}
              className={[
                "flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-colors",
                active
                  ? "bg-teal-50 text-sea"
                  : "text-slate-600 hover:bg-slate-50 hover:text-ink",
              ].join(" ")}
            >
              <Icon size={16} />
              {label}
            </Link>
          );
        })}
      </nav>

      {/* User + sign out */}
      <div className="border-t border-slate-100 px-3 py-4">
        <div className="mb-3 px-3">
          <p className="text-sm font-medium text-ink truncate">{userName}</p>
          <p className="text-xs uppercase tracking-wide text-slate-400">{userRole}</p>
        </div>
        <button
          onClick={signOut}
          className="flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-sm text-slate-500 transition-colors hover:bg-slate-50 hover:text-ink"
        >
          <LogOut size={16} />
          Sair
        </button>
      </div>
    </aside>
  );
}
