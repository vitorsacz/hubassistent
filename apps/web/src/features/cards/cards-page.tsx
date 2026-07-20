import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createCardSchema, type CreateCardInput } from "@hubassistent/shared-types";
import { useAccounts } from "@/features/accounts/api";
import { useCards, useCreateCard, useDeleteCard } from "./api";

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
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Cartões</h1>

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="grid grid-cols-1 gap-4 rounded-xl bg-slate-900 p-6 sm:grid-cols-2"
      >
        <h2 className="col-span-full text-lg font-semibold">Novo cartão</h2>

        <div>
          <label className="mb-1 block text-sm text-slate-300">Nome</label>
          <input
            type="text"
            placeholder="Nubank Roxinho"
            className="w-full rounded-md border border-slate-700 bg-slate-800 px-3 py-2"
            {...register("name")}
          />
          {errors.name && <p className="mt-1 text-sm text-red-400">{errors.name.message}</p>}
        </div>

        <div>
          <label className="mb-1 block text-sm text-slate-300">Tipo</label>
          <select
            className="w-full rounded-md border border-slate-700 bg-slate-800 px-3 py-2"
            {...register("type")}
          >
            <option value="CREDIT">Crédito</option>
            <option value="DEBIT">Débito</option>
          </select>
        </div>

        <div>
          <label className="mb-1 block text-sm text-slate-300">Conta vinculada</label>
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
          <label className="mb-1 block text-sm text-slate-300">Limite</label>
          <input
            type="number"
            step="0.01"
            className="w-full rounded-md border border-slate-700 bg-slate-800 px-3 py-2"
            {...register("limit", { setValueAs: (v) => (v === "" ? undefined : Number(v)) })}
          />
        </div>

        <div>
          <label className="mb-1 block text-sm text-slate-300">Dia de fechamento</label>
          <input
            type="number"
            min={1}
            max={31}
            className="w-full rounded-md border border-slate-700 bg-slate-800 px-3 py-2"
            {...register("closingDay", { setValueAs: (v) => (v === "" ? undefined : Number(v)) })}
          />
        </div>

        <div>
          <label className="mb-1 block text-sm text-slate-300">Dia de vencimento</label>
          <input
            type="number"
            min={1}
            max={31}
            className="w-full rounded-md border border-slate-700 bg-slate-800 px-3 py-2"
            {...register("dueDay", { setValueAs: (v) => (v === "" ? undefined : Number(v)) })}
          />
        </div>

        <div className="col-span-full">
          <button
            type="submit"
            disabled={createCard.isPending}
            className="rounded-md bg-indigo-600 px-4 py-2 font-medium hover:bg-indigo-500 disabled:opacity-50"
          >
            Adicionar
          </button>
        </div>
      </form>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {isLoading && <p className="text-slate-500">Carregando…</p>}
        {!isLoading && cards.length === 0 && <p className="text-slate-500">Nenhum cartão ainda.</p>}
        {cards.map((card) => (
          <div key={card.id} className="rounded-xl bg-slate-900 p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="font-semibold">{card.name}</p>
                <p className="text-sm text-slate-400">
                  {card.type === "CREDIT" ? "Crédito" : "Débito"}
                  {card.limit ? ` · limite ${Number(card.limit).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}` : ""}
                </p>
              </div>
              <button onClick={() => deleteCard.mutate(card.id)} className="text-red-400 hover:underline">
                Excluir
              </button>
            </div>
            {(card.closingDay || card.dueDay) && (
              <p className="mt-2 text-sm text-slate-500">
                Fecha dia {card.closingDay ?? "—"} · vence dia {card.dueDay ?? "—"}
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
