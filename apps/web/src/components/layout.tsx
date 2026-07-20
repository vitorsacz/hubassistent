import type { ReactNode } from "react";
import { NavLink, Outlet } from "react-router-dom";
import { useAuth } from "@/lib/auth-context";

const NAV_LINKS = [
  { to: "/", label: "Dashboard", end: true },
  { to: "/transactions", label: "Transações" },
  { to: "/cards", label: "Cartões" },
  { to: "/settings", label: "Configurações" },
];

function NavItem({ to, label, end }: { to: string; label: string; end?: boolean }) {
  return (
    <NavLink
      to={to}
      end={end}
      className={({ isActive }) =>
        `rounded-md px-3 py-1.5 text-sm ${
          isActive ? "bg-indigo-600 text-white" : "text-slate-400 hover:text-white"
        }`
      }
    >
      {label}
    </NavLink>
  );
}

export function Layout({ children }: { children?: ReactNode }) {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <header className="flex items-center justify-between border-b border-slate-800 px-8 py-4">
        <div className="flex items-center gap-6">
          <span className="font-semibold">HubAssistent</span>
          <nav className="flex gap-1">
            {NAV_LINKS.map((link) => (
              <NavItem key={link.to} {...link} />
            ))}
          </nav>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm text-slate-400">{user?.name ?? user?.email}</span>
          <button
            onClick={logout}
            className="rounded-md border border-slate-700 px-3 py-1.5 text-sm text-slate-300 hover:bg-slate-800"
          >
            Sair
          </button>
        </div>
      </header>
      <main className="p-8">{children ?? <Outlet />}</main>
    </div>
  );
}
