import { useState } from "react";
import type { CreateTransactionInput } from "@hubassistent/shared-types";
import { useAccounts } from "@/features/accounts/api";
import { useCards } from "@/features/cards/api";
import { useCategories } from "@/features/categories/api";
import { useInvoices } from "@/features/invoices/api";
import {
  useCreateTransaction,
  useDeleteTransaction,
  useTransactions,
  useUpdateTransaction,
  type Transaction,
} from "./api";
import { TransactionForm } from "./transaction-form";

function formatCurrency(value: string) {
  return Number(value).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function formatDate(value: string) {
  return new Date(value).toLocaleDateString("pt-BR", { timeZone: "UTC" });
}

export function TransactionsPage() {
  const { data: transactions, isLoading } = useTransactions();
  const { data: accounts = [] } = useAccounts();
  const { data: cards = [] } = useCards();
  const { data: categories = [] } = useCategories();
  const { data: invoices = [] } = useInvoices();

  const createTransaction = useCreateTransaction();
  const updateTransaction = useUpdateTransaction();
  const deleteTransaction = useDeleteTransaction();

  const [editing, setEditing] = useState<Transaction | null>(null);
  const [formKey, setFormKey] = useState(0);

  function categoryLabel(categoryId: string | null) {
    const category = categories.find((c) => c.id === categoryId);
    return category ? `${category.icon ?? ""} ${category.name}` : "—";
  }

  function handleSubmit(input: CreateTransactionInput) {
    if (editing) {
      updateTransaction.mutate(
        { id: editing.id, input },
        { onSuccess: () => setEditing(null) },
      );
    } else {
      createTransaction.mutate(input, { onSuccess: () => setFormKey((k) => k + 1) });
    }
  }

  return (
    <div className="space-y-8">
      <h1 className="font-display text-2xl italic text-ink">Transações</h1>

      <TransactionForm
        key={formKey}
        accounts={accounts}
        cards={cards}
        categories={categories}
        invoices={invoices}
        editing={editing}
        onSubmit={handleSubmit}
        onCancel={() => setEditing(null)}
        isSubmitting={createTransaction.isPending || updateTransaction.isPending}
      />

      <div className="overflow-x-auto rounded border border-line bg-surface">
        <table className="w-full text-left text-sm">
          <thead>
            <tr>
              <th className="border-b border-line px-5 py-3 text-xs font-semibold uppercase tracking-wide text-muted">
                Data
              </th>
              <th className="border-b border-line px-5 py-3 text-xs font-semibold uppercase tracking-wide text-muted">
                Descrição
              </th>
              <th className="border-b border-line px-5 py-3 text-xs font-semibold uppercase tracking-wide text-muted">
                Categoria
              </th>
              <th className="border-b border-line px-5 py-3 text-xs font-semibold uppercase tracking-wide text-muted">
                Método
              </th>
              <th className="border-b border-line px-5 py-3 text-right text-xs font-semibold uppercase tracking-wide text-muted">
                Valor
              </th>
              <th className="border-b border-line px-5 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {isLoading && (
              <tr>
                <td colSpan={6} className="px-5 py-8 text-center text-muted">
                  Carregando…
                </td>
              </tr>
            )}
            {!isLoading && transactions?.length === 0 && (
              <tr>
                <td colSpan={6} className="px-5 py-8 text-center text-muted">
                  Nenhuma transação ainda.
                </td>
              </tr>
            )}
            {transactions?.map((tx) => (
              <tr key={tx.id} className="border-b border-line last:border-0">
                <td className="px-5 py-3 text-muted">{formatDate(tx.date)}</td>
                <td className="px-5 py-3 text-ink">{tx.description}</td>
                <td className="px-5 py-3">
                  <span className="rounded-sm border border-line px-2.5 py-1 text-xs text-muted">
                    {categoryLabel(tx.categoryId)}
                  </span>
                </td>
                <td className="px-5 py-3 text-muted">{tx.method}</td>
                <td
                  className={`tabular px-5 py-3 text-right font-medium ${
                    tx.type === "INCOME" ? "text-good" : "text-ink"
                  }`}
                >
                  {tx.type === "INCOME" ? "+" : "−"}
                  {formatCurrency(tx.amount)}
                </td>
                <td className="px-5 py-3 text-right text-xs">
                  <button onClick={() => setEditing(tx)} className="mr-3 text-accent hover:underline">
                    Editar
                  </button>
                  <button onClick={() => deleteTransaction.mutate(tx.id)} className="text-bad hover:underline">
                    Excluir
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
