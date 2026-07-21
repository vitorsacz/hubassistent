import { useMemo } from "react";
import { useTransactions } from "@/features/transactions/api";

function formatCurrency(value: number) {
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export function DashboardPage() {
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
  const monthLabel = now.toLocaleDateString("pt-BR", { month: "long" });

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
    <div className="space-y-8">
      <h1 className="font-display text-2xl italic text-ink">Visão geral de {monthLabel}</h1>

      <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-3">
        <div className="rounded border border-line bg-app p-5">
          <p className="text-xs uppercase tracking-wide text-muted">Entradas</p>
          <p className="tabular mt-2 font-display text-3xl italic text-ink">{formatCurrency(income)}</p>
        </div>
        <div className="rounded border border-line bg-app p-5">
          <p className="text-xs uppercase tracking-wide text-muted">Saídas</p>
          <p className="tabular mt-2 font-display text-3xl italic text-ink">{formatCurrency(expense)}</p>
        </div>
        <div className="rounded border border-transparent bg-accent-soft p-5">
          <p className="text-xs uppercase tracking-wide text-muted">Saldo</p>
          <p className="tabular mt-2 font-display text-3xl italic text-ink">
            {formatCurrency(income - expense)}
          </p>
        </div>
      </div>

      <p className="text-sm text-muted">
        Próximo passo: faturas/contas a pagar e um extrato mensal detalhado.
      </p>
    </div>
  );
}
