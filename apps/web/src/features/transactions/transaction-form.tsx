import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createTransactionSchema, type CreateTransactionInput } from "@hubassistent/shared-types";
import type { Account } from "@/features/accounts/api";
import type { Card } from "@/features/cards/api";
import type { Category } from "@/features/categories/api";
import type { Invoice } from "@/features/invoices/api";
import type { Transaction } from "./api";

interface TransactionFormProps {
  accounts: Account[];
  cards: Card[];
  categories: Category[];
  invoices: Invoice[];
  editing: Transaction | null;
  onSubmit: (input: CreateTransactionInput) => void;
  onCancel: () => void;
  isSubmitting: boolean;
}

const fieldLabel = "mb-1.5 block text-xs font-medium uppercase tracking-wide text-muted";
const fieldInput =
  "w-full rounded-md border border-line bg-app px-3 py-2 text-ink outline-none transition-colors focus:border-accent";

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
    invoiceId: undefined,
    categoryId: undefined,
  };
}

export function TransactionForm({
  accounts,
  cards,
  categories,
  invoices,
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
        invoiceId: editing.invoiceId ?? undefined,
        categoryId: editing.categoryId ?? undefined,
      });
    } else {
      reset(blankDefaults());
    }
  }, [editing, reset]);

  return (
    <form
      onSubmit={handleSubmit((data) => onSubmit(data))}
      className="grid grid-cols-1 gap-4 rounded border border-line bg-surface p-6 sm:grid-cols-2"
    >
      <h2 className="col-span-full font-display text-lg italic text-ink">
        {editing ? "Editar transação" : "Nova transação"}
      </h2>

      <div>
        <label className={fieldLabel}>Tipo</label>
        <select className={fieldInput} {...register("type")}>
          <option value="EXPENSE">Saída</option>
          <option value="INCOME">Entrada</option>
        </select>
      </div>

      <div>
        <label className={fieldLabel}>Método</label>
        <select className={fieldInput} {...register("method")}>
          <option value="PIX">Pix</option>
          <option value="DEBIT">Débito</option>
          <option value="CREDIT">Crédito</option>
          <option value="CASH">Dinheiro</option>
          <option value="TRANSFER">Transferência</option>
          <option value="BOLETO">Boleto</option>
        </select>
      </div>

      <div>
        <label className={fieldLabel}>Valor</label>
        <input
          type="number"
          step="0.01"
          className={fieldInput}
          {...register("amount", { valueAsNumber: true })}
        />
        {errors.amount && <p className="mt-1.5 text-sm text-bad">{errors.amount.message}</p>}
      </div>

      <div>
        <label className={fieldLabel}>Data</label>
        <input
          type="date"
          className={fieldInput}
          value={toDateInputValue(watch("date") ?? new Date())}
          onChange={(e) => setValue("date", new Date(`${e.target.value}T00:00:00`))}
        />
      </div>

      <div className="col-span-full">
        <label className={fieldLabel}>Descrição</label>
        <input type="text" className={fieldInput} {...register("description")} />
        {errors.description && (
          <p className="mt-1.5 text-sm text-bad">{errors.description.message}</p>
        )}
      </div>

      <div>
        <label className={fieldLabel}>Categoria</label>
        <select className={fieldInput} {...register("categoryId", { setValueAs: (v) => v || undefined })}>
          <option value="">Nenhuma</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.icon} {c.name}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className={fieldLabel}>Conta</label>
        <select className={fieldInput} {...register("accountId", { setValueAs: (v) => v || undefined })}>
          <option value="">Nenhuma</option>
          {accounts.map((a) => (
            <option key={a.id} value={a.id}>
              {a.name}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className={fieldLabel}>Cartão</label>
        <select className={fieldInput} {...register("cardId", { setValueAs: (v) => v || undefined })}>
          <option value="">Nenhum</option>
          {cards.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </div>

      {watch("method") === "CREDIT" && (
        <div>
          <label className={fieldLabel}>Fatura</label>
          <select className={fieldInput} {...register("invoiceId", { setValueAs: (v) => v || undefined })}>
            <option value="">Nenhuma</option>
            {invoices.map((inv) => (
              <option key={inv.id} value={inv.id}>
                {inv.card?.name ?? "—"} · {new Date(inv.referenceMonth).toLocaleDateString("pt-BR", { month: "short", year: "numeric", timeZone: "UTC" })}
              </option>
            ))}
          </select>
        </div>
      )}

      <div className="col-span-full flex gap-3">
        <button
          type="submit"
          disabled={isSubmitting}
          className="rounded-md bg-accent px-4 py-2 font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-50"
        >
          {editing ? "Salvar" : "Adicionar"}
        </button>
        {editing && (
          <button
            type="button"
            onClick={onCancel}
            className="rounded-md border border-line px-4 py-2 text-muted transition-colors hover:text-ink"
          >
            Cancelar
          </button>
        )}
      </div>
    </form>
  );
}
