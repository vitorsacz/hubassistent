import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createTransactionSchema, type CreateTransactionInput } from "@hubassistent/shared-types";
import type { Account } from "@/features/accounts/api";
import type { Card } from "@/features/cards/api";
import type { Category } from "@/features/categories/api";
import type { Transaction } from "./api";

interface TransactionFormProps {
  accounts: Account[];
  cards: Card[];
  categories: Category[];
  editing: Transaction | null;
  onSubmit: (input: CreateTransactionInput) => void;
  onCancel: () => void;
  isSubmitting: boolean;
}

function toDateInputValue(date: string | Date) {
  const d = new Date(date);
  return d.toISOString().slice(0, 10);
}

function blankDefaults(): CreateTransactionInput {
  return {
    type: "EXPENSE",
    method: "PIX",
    date: new Date(),
    amount: "" as unknown as number,
    description: "",
    notes: undefined,
    accountId: undefined,
    cardId: undefined,
    categoryId: undefined,
  };
}

export function TransactionForm({
  accounts,
  cards,
  categories,
  editing,
  onSubmit,
  onCancel,
  isSubmitting,
}: TransactionFormProps) {
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<CreateTransactionInput>({
    resolver: zodResolver(createTransactionSchema),
    defaultValues: blankDefaults(),
  });

  useEffect(() => {
    if (editing) {
      reset({
        type: editing.type,
        method: editing.method,
        amount: Number(editing.amount),
        description: editing.description,
        date: new Date(editing.date),
        notes: editing.notes ?? undefined,
        accountId: editing.accountId ?? undefined,
        cardId: editing.cardId ?? undefined,
        categoryId: editing.categoryId ?? undefined,
      });
    } else {
      reset(blankDefaults());
    }
  }, [editing, reset]);

  return (
    <form
      onSubmit={handleSubmit((data) => onSubmit(data))}
      className="grid grid-cols-1 gap-4 rounded-xl bg-slate-900 p-6 sm:grid-cols-2"
    >
      <h2 className="col-span-full text-lg font-semibold">
        {editing ? "Editar transação" : "Nova transação"}
      </h2>

      <div>
        <label className="mb-1 block text-sm text-slate-300">Tipo</label>
        <select
          className="w-full rounded-md border border-slate-700 bg-slate-800 px-3 py-2"
          {...register("type")}
        >
          <option value="EXPENSE">Saída</option>
          <option value="INCOME">Entrada</option>
        </select>
      </div>

      <div>
        <label className="mb-1 block text-sm text-slate-300">Método</label>
        <select
          className="w-full rounded-md border border-slate-700 bg-slate-800 px-3 py-2"
          {...register("method")}
        >
          <option value="PIX">Pix</option>
          <option value="DEBIT">Débito</option>
          <option value="CREDIT">Crédito</option>
          <option value="CASH">Dinheiro</option>
          <option value="TRANSFER">Transferência</option>
          <option value="BOLETO">Boleto</option>
        </select>
      </div>

      <div>
        <label className="mb-1 block text-sm text-slate-300">Valor</label>
        <input
          type="number"
          step="0.01"
          className="w-full rounded-md border border-slate-700 bg-slate-800 px-3 py-2"
          {...register("amount", { valueAsNumber: true })}
        />
        {errors.amount && <p className="mt-1 text-sm text-red-400">{errors.amount.message}</p>}
      </div>

      <div>
        <label className="mb-1 block text-sm text-slate-300">Data</label>
        <input
          type="date"
          className="w-full rounded-md border border-slate-700 bg-slate-800 px-3 py-2"
          value={toDateInputValue(watch("date") ?? new Date())}
          onChange={(e) => setValue("date", new Date(`${e.target.value}T00:00:00`))}
        />
      </div>

      <div className="col-span-full">
        <label className="mb-1 block text-sm text-slate-300">Descrição</label>
        <input
          type="text"
          className="w-full rounded-md border border-slate-700 bg-slate-800 px-3 py-2"
          {...register("description")}
        />
        {errors.description && (
          <p className="mt-1 text-sm text-red-400">{errors.description.message}</p>
        )}
      </div>

      <div>
        <label className="mb-1 block text-sm text-slate-300">Categoria</label>
        <select
          className="w-full rounded-md border border-slate-700 bg-slate-800 px-3 py-2"
          {...register("categoryId", { setValueAs: (v) => v || undefined })}
        >
          <option value="">Nenhuma</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.icon} {c.name}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="mb-1 block text-sm text-slate-300">Conta</label>
        <select
          className="w-full rounded-md border border-slate-700 bg-slate-800 px-3 py-2"
          {...register("accountId", { setValueAs: (v) => v || undefined })}
        >
          <option value="">Nenhuma</option>
          {accounts.map((a) => (
            <option key={a.id} value={a.id}>
              {a.name}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="mb-1 block text-sm text-slate-300">Cartão</label>
        <select
          className="w-full rounded-md border border-slate-700 bg-slate-800 px-3 py-2"
          {...register("cardId", { setValueAs: (v) => v || undefined })}
        >
          <option value="">Nenhum</option>
          {cards.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </div>

      <div className="col-span-full flex gap-3">
        <button
          type="submit"
          disabled={isSubmitting}
          className="rounded-md bg-indigo-600 px-4 py-2 font-medium hover:bg-indigo-500 disabled:opacity-50"
        >
          {editing ? "Salvar" : "Adicionar"}
        </button>
        {editing && (
          <button
            type="button"
            onClick={onCancel}
            className="rounded-md border border-slate-700 px-4 py-2 text-slate-300 hover:bg-slate-800"
          >
            Cancelar
          </button>
        )}
      </div>
    </form>
  );
}
