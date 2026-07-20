import { useState } from "react";
import type { CreateTransactionInput } from "@hubassistent/shared-types";
import { useAccounts } from "@/features/accounts/api";
import { useCards } from "@/features/cards/api";
import { useCategories } from "@/features/categories/api";
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
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Transações</h1>

      <TransactionForm
        key={formKey}
        accounts={accounts}
        cards={cards}
        categories={categories}
        editing={editing}
        onSubmit={handleSubmit}
        onCancel={() => setEditing(null)}
        isSubmitting={createTransaction.isPending || updateTransaction.isPending}
      />

      <div className="overflow-x-auto rounded-xl bg-slate-900">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-slate-800 text-slate-400">
            <tr>
              <th className="px-4 py-3">Data</th>
              <th className="px-4 py-3">Descrição</th>
              <th className="px-4 py-3">Categoria</th>
              <th className="px-4 py-3">Método</th>
              <th className="px-4 py-3 text-right">Valor</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {isLoading && (
              <tr>
                <td colSpan={6} className="px-4 py-6 text-center text-slate-500">
                  Carregando…
                </td>
              </tr>
            )}
            {!isLoading && transactions?.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-6 text-center text-slate-500">
                  Nenhuma transação ainda.
                </td>
              </tr>
            )}
            {transactions?.map((tx) => (
              <tr key={tx.id} className="border-b border-slate-800/50">
                <td className="px-4 py-3 text-slate-400">{formatDate(tx.date)}</td>
                <td className="px-4 py-3">{tx.description}</td>
                <td className="px-4 py-3 text-slate-400">{categoryLabel(tx.categoryId)}</td>
                <td className="px-4 py-3 text-slate-400">{tx.method}</td>
                <td
                  className={`px-4 py-3 text-right font-medium ${
                    tx.type === "INCOME" ? "text-emerald-400" : "text-red-400"
                  }`}
                >
                  {tx.type === "INCOME" ? "+" : "-"}
                  {formatCurrency(tx.amount)}
                </td>
                <td className="px-4 py-3 text-right">
                  <button
                    onClick={() => setEditing(tx)}
                    className="mr-3 text-indigo-400 hover:underline"
                  >
                    Editar
                  </button>
                  <button
                    onClick={() => deleteTransaction.mutate(tx.id)}
                    className="text-red-400 hover:underline"
                  >
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
