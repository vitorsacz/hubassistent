import { useMemo } from "react";
import { useTransactions } from "@/features/transactions/api";

function formatCurrency(value: number) {
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export function DashboardPage() {
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);

  const { data: transactions } = useTransactions({
    dateFrom: monthStart,
    dateTo: monthEnd,
  });

  const { income, expense } = useMemo(() => {
    return (transactions ?? []).reduce(
      (acc, tx) => {
        const amount = Number(tx.amount);
        if (tx.type === "INCOME") acc.income += amount;
        else acc.expense += amount;
        return acc;
      },
      { income: 0, expense: 0 },
    );
  }, [transactions]);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Visão geral do mês</h1>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-xl bg-slate-900 p-6">
          <p className="text-sm text-slate-400">Entradas</p>
          <p className="mt-1 text-2xl font-semibold text-emerald-400">{formatCurrency(income)}</p>
        </div>
        <div className="rounded-xl bg-slate-900 p-6">
          <p className="text-sm text-slate-400">Saídas</p>
          <p className="mt-1 text-2xl font-semibold text-red-400">{formatCurrency(expense)}</p>
        </div>
        <div className="rounded-xl bg-slate-900 p-6">
          <p className="text-sm text-slate-400">Saldo</p>
          <p className="mt-1 text-2xl font-semibold">{formatCurrency(income - expense)}</p>
        </div>
      </div>

      <p className="text-sm text-slate-500">
        Próximo passo: faturas/contas a pagar e um extrato mensal detalhado.
      </p>
    </div>
  );
}
