import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createCardSchema, type CreateCardInput } from "@hubassistent/shared-types";
import { useAccounts } from "@/features/accounts/api";
import { useCards, useCreateCard, useDeleteCard } from "./api";

const fieldLabel = "mb-1.5 block text-xs font-medium uppercase tracking-wide text-muted";
const fieldInput =
  "w-full rounded-md border border-line bg-app px-3 py-2 text-ink outline-none transition-colors focus:border-accent";

export function CardsPage() {
  const { data: cards = [], isLoading } = useCards();
  const { data: accounts = [] } = useAccounts();
  const createCard = useCreateCard();
  const deleteCard = useDeleteCard();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CreateCardInput>({
    resolver: zodResolver(createCardSchema),
    defaultValues: { type: "CREDIT" },
  });

  function onSubmit(data: CreateCardInput) {
    createCard.mutate(data, { onSuccess: () => reset({ type: "CREDIT" }) });
  }

  return (
    <div className="space-y-8">
      <h1 className="font-display text-2xl italic text-ink">Cartões</h1>

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="grid grid-cols-1 gap-4 rounded border border-line bg-surface p-6 sm:grid-cols-2"
      >
        <h2 className="col-span-full font-display text-lg italic text-ink">Novo cartão</h2>

        <div>
          <label className={fieldLabel}>Nome</label>
          <input type="text" placeholder="Nubank Roxinho" className={fieldInput} {...register("name")} />
          {errors.name && <p className="mt-1.5 text-sm text-bad">{errors.name.message}</p>}
        </div>

        <div>
          <label className={fieldLabel}>Tipo</label>
          <select className={fieldInput} {...register("type")}>
            <option value="CREDIT">Crédito</option>
            <option value="DEBIT">Débito</option>
          </select>
        </div>

        <div>
          <label className={fieldLabel}>Conta vinculada</label>
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
          <label className={fieldLabel}>Limite</label>
          <input
            type="number"
            step="0.01"
            className={fieldInput}
            {...register("limit", { setValueAs: (v) => (v === "" ? undefined : Number(v)) })}
          />
        </div>

        <div>
          <label className={fieldLabel}>Dia de fechamento</label>
          <input
            type="number"
            min={1}
            max={31}
            className={fieldInput}
            {...register("closingDay", { setValueAs: (v) => (v === "" ? undefined : Number(v)) })}
          />
        </div>

        <div>
          <label className={fieldLabel}>Dia de vencimento</label>
          <input
            type="number"
            min={1}
            max={31}
            className={fieldInput}
            {...register("dueDay", { setValueAs: (v) => (v === "" ? undefined : Number(v)) })}
          />
        </div>

        <div className="col-span-full">
          <button
            type="submit"
            disabled={createCard.isPending}
            className="rounded-md bg-accent px-4 py-2 font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-50"
          >
            Adicionar
          </button>
        </div>
      </form>

      <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2 lg:grid-cols-3">
        {isLoading && <p className="text-muted">Carregando…</p>}
        {!isLoading && cards.length === 0 && <p className="text-muted">Nenhum cartão ainda.</p>}
        {cards.map((card) => (
          <div key={card.id} className="rounded border border-line bg-surface p-5">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="font-medium text-ink">{card.name}</p>
                <p className="mt-0.5 text-sm text-muted">
                  {card.type === "CREDIT" ? "Crédito" : "Débito"}
                  {card.limit
                    ? ` · limite ${Number(card.limit).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}`
                    : ""}
                </p>
              </div>
              <button onClick={() => deleteCard.mutate(card.id)} className="shrink-0 text-xs text-bad hover:underline">
                Excluir
              </button>
            </div>
            {(card.closingDay || card.dueDay) && (
              <p className="tabular mt-3 border-t border-line pt-3 text-sm text-muted">
                Fecha dia {card.closingDay ?? "—"} · vence dia {card.dueDay ?? "—"}
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
