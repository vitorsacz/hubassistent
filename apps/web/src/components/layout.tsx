import type { ReactNode } from "react";
import { NavLink, Outlet } from "react-router-dom";
import { useAuth } from "@/lib/auth-context";
import { ThemeToggle } from "./theme-toggle";

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
        `border-b py-0.5 text-sm transition-colors ${
          isActive
            ? "border-accent text-ink"
            : "border-transparent text-muted hover:text-ink"
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
    <div className="min-h-screen bg-app text-ink">
      <header className="flex items-center justify-between border-b border-line px-8 py-4">
        <div className="flex items-center gap-8">
          <span className="font-display text-xl italic">HubAssistent</span>
          <nav className="flex gap-6">
            {NAV_LINKS.map((link) => (
              <NavItem key={link.to} {...link} />
            ))}
          </nav>
        </div>
        <div className="flex items-center gap-4">
          <ThemeToggle />
          <span className="text-sm text-muted">{user?.name ?? user?.email}</span>
          <button
            onClick={logout}
            className="rounded-md border border-line px-3 py-1.5 text-sm text-muted transition-colors hover:text-ink"
          >
            Sair
          </button>
        </div>
      </header>
      <main className="p-8">{children ?? <Outlet />}</main>
    </div>
  );
}
