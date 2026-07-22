import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createInvoiceSchema, type CreateInvoiceInput, type InvoiceStatus } from "@hubassistent/shared-types";
import { useCards } from "@/features/cards/api";
import { useCreateInvoice, useDeleteInvoice, useInvoices, useUpdateInvoice } from "./api";
import { InvoicePdfImport } from "./invoice-pdf-import";

const fieldLabel = "mb-1.5 block text-xs font-medium uppercase tracking-wide text-muted";
const fieldInput =
  "w-full rounded-md border border-line bg-app px-3 py-2 text-ink outline-none transition-colors focus:border-accent";

function formatCurrency(value: number) {
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function formatMonth(iso: string) {
  const label = new Date(iso).toLocaleDateString("pt-BR", { month: "long", year: "numeric", timeZone: "UTC" });
  return label.charAt(0).toUpperCase() + label.slice(1);
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("pt-BR", { timeZone: "UTC" });
}

const STATUS_LABEL: Record<InvoiceStatus, string> = {
  OPEN: "Aberta",
  PAID: "Paga",
  OVERDUE: "Vencida",
};

function statusClass(status: InvoiceStatus) {
  if (status === "PAID") return "text-good";
  if (status === "OVERDUE") return "text-bad";
  return "text-muted";
}

export function InvoicesPage() {
  const [month, setMonth] = useState("");
  const [bank, setBank] = useState("");

  const { data: cards = [] } = useCards();
  const { data: invoices = [], isLoading } = useInvoices({
    month: month || undefined,
    bank: bank || undefined,
  });

  const createInvoice = useCreateInvoice();
  const updateInvoice = useUpdateInvoice();
  const deleteInvoice = useDeleteInvoice();

  const banks = useMemo(
    () => Array.from(new Set(cards.map((c) => c.bank).filter((b): b is string => !!b))),
    [cards],
  );

  const summary = useMemo(() => {
    const byBank = new Map<string, number>();
    let total = 0;
    for (const invoice of invoices) {
      const amount = Number(invoice.amount ?? 0);
      total += amount;
      const label = invoice.card?.bank ?? "Sem banco";
      byBank.set(label, (byBank.get(label) ?? 0) + amount);
    }
    return { total, byBank: Array.from(byBank.entries()) };
  }, [invoices]);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CreateInvoiceInput>({
    resolver: zodResolver(createInvoiceSchema),
  });

  function onSubmit(data: CreateInvoiceInput) {
    createInvoice.mutate(data, { onSuccess: () => reset({}) });
  }

  function markAsPaid(id: string) {
    updateInvoice.mutate({ id, input: { status: "PAID", paidAt: new Date() } });
  }

  return (
    <div className="space-y-8">
      <h1 className="font-display text-2xl italic text-ink">Faturas</h1>

      <div className="flex flex-wrap items-end gap-3">
        <div>
          <label className={fieldLabel}>Mês</label>
          <input type="month" value={month} onChange={(e) => setMonth(e.target.value)} className={fieldInput} />
        </div>
        <div>
          <label className={fieldLabel}>Banco</label>
          <select value={bank} onChange={(e) => setBank(e.target.value)} className={fieldInput}>
            <option value="">Todos</option>
            {banks.map((b) => (
              <option key={b} value={b}>
                {b}
              </option>
            ))}
          </select>
        </div>
        {(month || bank) && (
          <button
            onClick={() => {
              setMonth("");
              setBank("");
            }}
            className="text-sm text-accent hover:underline"
          >
            Limpar filtros
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-3">
        <div className="rounded border border-transparent bg-accent-soft p-5">
          <p className="text-xs uppercase tracking-wide text-muted">Total no período</p>
          <p className="tabular mt-2 font-display text-3xl italic text-ink">{formatCurrency(summary.total)}</p>
        </div>
        {summary.byBank.map(([label, amount]) => (
          <div key={label} className="rounded border border-line bg-app p-5">
            <p className="text-xs uppercase tracking-wide text-muted">{label}</p>
            <p className="tabular mt-2 font-display text-2xl italic text-ink">{formatCurrency(amount)}</p>
          </div>
        ))}
      </div>

      <InvoicePdfImport cards={cards} />

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="grid grid-cols-1 gap-4 rounded border border-line bg-surface p-6 sm:grid-cols-2 lg:grid-cols-4"
      >
        <h2 className="col-span-full font-display text-lg italic text-ink">Nova fatura manual</h2>

        <div>
          <label className={fieldLabel}>Cartão</label>
          <select className={fieldInput} {...register("cardId", { setValueAs: (v) => v || undefined })}>
            <option value="">Selecione…</option>
            {cards.map((c) => (
              <option key={c.id} value={c.id}>
                {c.bank ? `${c.bank} · ` : ""}
                {c.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className={fieldLabel}>Mês de referência</label>
          <input type="month" className={fieldInput} {...register("referenceMonth")} />
          {errors.referenceMonth && <p className="mt-1.5 text-sm text-bad">Obrigatório</p>}
        </div>

        <div>
          <label className={fieldLabel}>Vencimento</label>
          <input type="date" className={fieldInput} {...register("dueDate")} />
          {errors.dueDate && <p className="mt-1.5 text-sm text-bad">Obrigatório</p>}
        </div>

        <div>
          <label className={fieldLabel}>Valor</label>
          <input
            type="number"
            step="0.01"
            className={fieldInput}
            {...register("amount", { setValueAs: (v) => (v === "" ? undefined : Number(v)) })}
          />
        </div>

        <div className="col-span-full">
          <button
            type="submit"
            disabled={createInvoice.isPending}
            className="rounded-md bg-accent px-4 py-2 font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-50"
          >
            Adicionar
          </button>
        </div>
      </form>

      <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2 lg:grid-cols-3">
        {isLoading && <p className="text-muted">Carregando…</p>}
        {!isLoading && invoices.length === 0 && <p className="text-muted">Nenhuma fatura ainda.</p>}
        {invoices.map((invoice) => (
          <div key={invoice.id} className="rounded border border-line bg-surface p-5">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="font-medium text-ink">
                  {invoice.card?.bank ? `${invoice.card.bank} · ` : ""}
                  {invoice.card?.name ?? "—"}
                </p>
                <p className="mt-0.5 text-sm text-muted">{formatMonth(invoice.referenceMonth)}</p>
              </div>
              <span className={`shrink-0 text-xs font-medium uppercase tracking-wide ${statusClass(invoice.status)}`}>
                {STATUS_LABEL[invoice.status]}
              </span>
            </div>

            <p className="tabular mt-3 border-t border-line pt-3 font-display text-2xl italic text-ink">
              {formatCurrency(Number(invoice.amount ?? 0))}
            </p>
            <p className="mt-1 text-sm text-muted">Vence em {formatDate(invoice.dueDate)}</p>

            <div className="mt-4 flex items-center justify-between text-xs">
              {invoice.status !== "PAID" ? (
                <button onClick={() => markAsPaid(invoice.id)} className="text-accent hover:underline">
                  Marcar como paga
                </button>
              ) : (
                <span />
              )}
              <button onClick={() => deleteInvoice.mutate(invoice.id)} className="text-bad hover:underline">
                Excluir
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
