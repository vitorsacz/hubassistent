import { useAuth } from "@/lib/auth-context";

export function DashboardPage() {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-slate-950 p-8 text-white">
      <header className="mb-8 flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Olá, {user?.name ?? user?.email}</h1>
        <button
          onClick={logout}
          className="rounded-md border border-slate-700 px-3 py-1.5 text-sm text-slate-300 hover:bg-slate-800"
        >
          Sair
        </button>
      </header>

      <p className="text-slate-400">
        Dashboard financeiro em construção — próximo passo: contas, cartões, transações e faturas.
      </p>
    </div>
  );
}
