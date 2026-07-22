import { useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import type { Card } from "@/features/cards/api";
import { useImportInvoice, useParseInvoicePdf } from "./api";

const fieldLabel = "mb-1.5 block text-xs font-medium uppercase tracking-wide text-muted";
const fieldInput =
  "w-full rounded-md border border-line bg-app px-2.5 py-1.5 text-sm text-ink outline-none transition-colors focus:border-accent";

interface ImportFormValues {
  cardId: string;
  referenceMonth: string;
  dueDate: string;
  items: {
    date: string;
    description: string;
    amount: number;
    installmentNumber?: number;
    installmentTotal?: number;
  }[];
}

function toMonthInput(iso: string | null): string {
  return iso ? iso.slice(0, 7) : "";
}

function toDateInput(iso: string | null): string {
  return iso ? iso.slice(0, 10) : "";
}

export function InvoicePdfImport({ cards }: { cards: Card[] }) {
  const creditCards = cards.filter((c) => c.type === "CREDIT");
  const [file, setFile] = useState<File | null>(null);
  const [hasPreview, setHasPreview] = useState(false);

  const parsePdf = useParseInvoicePdf();
  const importInvoice = useImportInvoice();

  const { register, control, handleSubmit, reset, watch } = useForm<ImportFormValues>({
    defaultValues: { cardId: "", referenceMonth: "", dueDate: "", items: [] },
  });
  const { fields, append, remove } = useFieldArray({ control, name: "items" });
  const cardId = watch("cardId");

  function handleAnalyze() {
    if (!file || !cardId) return;
    parsePdf.mutate(
      { file, cardId },
      {
        onSuccess: (preview) => {
          reset({
            cardId,
            referenceMonth: toMonthInput(preview.referenceMonth),
            dueDate: toDateInput(preview.dueDate),
            items: preview.items.map((item) => ({
              date: toDateInput(item.date),
              description: item.description,
              amount: item.amount ?? 0,
              installmentNumber: item.installmentNumber,
              installmentTotal: item.installmentTotal,
            })),
          });
          setHasPreview(true);
        },
      },
    );
  }

  function onConfirm(values: ImportFormValues) {
    importInvoice.mutate(
      {
        cardId: values.cardId,
        referenceMonth: new Date(`${values.referenceMonth}-01`),
        dueDate: new Date(values.dueDate),
        items: values.items.map((item) => ({
          date: new Date(item.date),
          description: item.description,
          amount: Number(item.amount),
          installmentNumber: item.installmentNumber || undefined,
          installmentTotal: item.installmentTotal || undefined,
        })),
      },
      {
        onSuccess: () => {
          setHasPreview(false);
          setFile(null);
          reset({ cardId: "", referenceMonth: "", dueDate: "", items: [] });
        },
      },
    );
  }

  const total = fields.reduce((sum, _field, i) => sum + (watch(`items.${i}.amount`) || 0), 0);

  return (
    <section className="space-y-4 rounded border border-line bg-surface p-6">
      <h2 className="font-display text-lg italic text-ink">Importar fatura em PDF</h2>

      {!hasPreview && (
        <div className="flex flex-wrap items-end gap-3">
          <div>
            <label className={fieldLabel}>Cartão</label>
            <select className={fieldInput} {...register("cardId")}>
              <option value="">Selecione…</option>
              {creditCards.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.bank ? `${c.bank} · ` : ""}
                  {c.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={fieldLabel}>Arquivo PDF</label>
            <input
              type="file"
              accept="application/pdf"
              onChange={(e) => setFile(e.target.files?.[0] ?? null)}
              className="text-sm text-muted"
            />
          </div>
          <button
            type="button"
            onClick={handleAnalyze}
            disabled={!file || !cardId || parsePdf.isPending}
            className="rounded-md bg-accent px-4 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-50"
          >
            {parsePdf.isPending ? "Analisando…" : "Analisar PDF"}
          </button>
          {parsePdf.isError && (
            <p className="text-sm text-bad">Não foi possível ler o PDF. Tente outro arquivo.</p>
          )}
        </div>
      )}

      {hasPreview && (
        <form onSubmit={handleSubmit(onConfirm)} className="space-y-4">
          <p className="text-sm text-muted">
            Confira os itens extraídos do PDF antes de confirmar — ajuste o que estiver errado ou remova
            linhas incorretas.
          </p>

          <div className="flex flex-wrap gap-3">
            <div>
              <label className={fieldLabel}>Mês de referência</label>
              <input type="month" className={fieldInput} {...register("referenceMonth", { required: true })} />
            </div>
            <div>
              <label className={fieldLabel}>Vencimento</label>
              <input type="date" className={fieldInput} {...register("dueDate", { required: true })} />
            </div>
          </div>

          <div className="overflow-x-auto rounded border border-line">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="bg-app">
                  <th className="border-b border-line px-3 py-2 text-xs font-semibold uppercase tracking-wide text-muted">
                    Data
                  </th>
                  <th className="border-b border-line px-3 py-2 text-xs font-semibold uppercase tracking-wide text-muted">
                    Descrição
                  </th>
                  <th className="border-b border-line px-3 py-2 text-xs font-semibold uppercase tracking-wide text-muted">
                    Parcela
                  </th>
                  <th className="border-b border-line px-3 py-2 text-right text-xs font-semibold uppercase tracking-wide text-muted">
                    Valor
                  </th>
                  <th className="border-b border-line px-3 py-2"></th>
                </tr>
              </thead>
              <tbody>
                {fields.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-3 py-6 text-center text-muted">
                      Nenhum item reconhecido no PDF. Adicione manualmente se necessário.
                    </td>
                  </tr>
                )}
                {fields.map((field, index) => (
                  <tr key={field.id} className="border-b border-line last:border-0">
                    <td className="px-3 py-2">
                      <input type="date" className={fieldInput} {...register(`items.${index}.date`, { required: true })} />
                    </td>
                    <td className="px-3 py-2">
                      <input
                        type="text"
                        className={fieldInput}
                        {...register(`items.${index}.description`, { required: true })}
                      />
                    </td>
                    <td className="px-3 py-2">
                      <div className="flex items-center gap-1">
                        <input
                          type="number"
                          min={1}
                          placeholder="—"
                          className={`${fieldInput} w-14`}
                          {...register(`items.${index}.installmentNumber`, { valueAsNumber: true })}
                        />
                        <span className="text-muted">/</span>
                        <input
                          type="number"
                          min={1}
                          placeholder="—"
                          className={`${fieldInput} w-14`}
                          {...register(`items.${index}.installmentTotal`, { valueAsNumber: true })}
                        />
                      </div>
                    </td>
                    <td className="px-3 py-2">
                      <input
                        type="number"
                        step="0.01"
                        className={`${fieldInput} tabular text-right`}
                        {...register(`items.${index}.amount`, { required: true, valueAsNumber: true })}
                      />
                    </td>
                    <td className="px-3 py-2 text-right">
                      <button type="button" onClick={() => remove(index)} className="text-xs text-bad hover:underline">
                        Remover
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={() => append({ date: "", description: "", amount: 0 })}
              className="text-sm text-accent hover:underline"
            >
              + adicionar item
            </button>
            <p className="tabular text-sm text-muted">
              Total: {total.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
            </p>
          </div>

          <div className="flex gap-3">
            <button
              type="submit"
              disabled={fields.length === 0 || importInvoice.isPending}
              className="rounded-md bg-accent px-4 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-50"
            >
              {importInvoice.isPending ? "Importando…" : "Confirmar importação"}
            </button>
            <button
              type="button"
              onClick={() => {
                setHasPreview(false);
                setFile(null);
              }}
              className="rounded-md border border-line px-4 py-2 text-sm text-muted hover:text-ink"
            >
              Cancelar
            </button>
          </div>
        </form>
      )}
    </section>
  );
}
