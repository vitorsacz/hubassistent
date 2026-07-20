import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  createAccountSchema,
  createCategorySchema,
  type CreateAccountInput,
  type CreateCategoryInput,
} from "@hubassistent/shared-types";
import { useAccounts, useCreateAccount, useDeleteAccount } from "@/features/accounts/api";
import { useCategories, useCreateCategory, useDeleteCategory } from "@/features/categories/api";

function AccountsSection() {
  const { data: accounts = [], isLoading } = useAccounts();
  const createAccount = useCreateAccount();
  const deleteAccount = useDeleteAccount();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CreateAccountInput>({
    resolver: zodResolver(createAccountSchema),
    defaultValues: { type: "CHECKING", currency: "BRL" },
  });

  function onSubmit(data: CreateAccountInput) {
    createAccount.mutate(data, { onSuccess: () => reset({ type: "CHECKING", currency: "BRL" }) });
  }

  return (
    <section className="space-y-4">
      <h2 className="text-xl font-semibold">Contas</h2>

      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-wrap items-end gap-3 rounded-xl bg-slate-900 p-6">
        <div>
          <label className="mb-1 block text-sm text-slate-300">Nome</label>
          <input
            type="text"
            placeholder="Nubank Conta"
            className="rounded-md border border-slate-700 bg-slate-800 px-3 py-2"
            {...register("name")}
          />
          {errors.name && <p className="mt-1 text-sm text-red-400">{errors.name.message}</p>}
        </div>
        <div>
          <label className="mb-1 block text-sm text-slate-300">Tipo</label>
          <select className="rounded-md border border-slate-700 bg-slate-800 px-3 py-2" {...register("type")}>
            <option value="CHECKING">Conta corrente</option>
            <option value="SAVINGS">Poupança</option>
            <option value="CASH">Dinheiro</option>
            <option value="WALLET">Carteira</option>
          </select>
        </div>
        <button
          type="submit"
          disabled={createAccount.isPending}
          className="rounded-md bg-indigo-600 px-4 py-2 font-medium hover:bg-indigo-500 disabled:opacity-50"
        >
          Adicionar
        </button>
      </form>

      <div className="rounded-xl bg-slate-900 p-2">
        {isLoading && <p className="p-4 text-slate-500">Carregando…</p>}
        {!isLoading && accounts.length === 0 && <p className="p-4 text-slate-500">Nenhuma conta ainda.</p>}
        {accounts.map((account) => (
          <div key={account.id} className="flex items-center justify-between rounded-md px-4 py-3 hover:bg-slate-800/50">
            <span>{account.name}</span>
            <button onClick={() => deleteAccount.mutate(account.id)} className="text-red-400 hover:underline">
              Excluir
            </button>
          </div>
        ))}
      </div>
    </section>
  );
}

function CategoriesSection() {
  const { data: categories = [], isLoading } = useCategories();
  const createCategory = useCreateCategory();
  const deleteCategory = useDeleteCategory();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CreateCategoryInput>({
    resolver: zodResolver(createCategorySchema),
    defaultValues: { type: "EXPENSE" },
  });

  function onSubmit(data: CreateCategoryInput) {
    createCategory.mutate(data, { onSuccess: () => reset({ type: "EXPENSE" }) });
  }

  return (
    <section className="space-y-4">
      <h2 className="text-xl font-semibold">Categorias</h2>

      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-wrap items-end gap-3 rounded-xl bg-slate-900 p-6">
        <div>
          <label className="mb-1 block text-sm text-slate-300">Nome</label>
          <input
            type="text"
            placeholder="Assinaturas"
            className="rounded-md border border-slate-700 bg-slate-800 px-3 py-2"
            {...register("name")}
          />
          {errors.name && <p className="mt-1 text-sm text-red-400">{errors.name.message}</p>}
        </div>
        <div>
          <label className="mb-1 block text-sm text-slate-300">Tipo</label>
          <select className="rounded-md border border-slate-700 bg-slate-800 px-3 py-2" {...register("type")}>
            <option value="EXPENSE">Saída</option>
            <option value="INCOME">Entrada</option>
          </select>
        </div>
        <button
          type="submit"
          disabled={createCategory.isPending}
          className="rounded-md bg-indigo-600 px-4 py-2 font-medium hover:bg-indigo-500 disabled:opacity-50"
        >
          Adicionar
        </button>
      </form>

      <div className="rounded-xl bg-slate-900 p-2">
        {isLoading && <p className="p-4 text-slate-500">Carregando…</p>}
        {categories.map((category) => (
          <div key={category.id} className="flex items-center justify-between rounded-md px-4 py-3 hover:bg-slate-800/50">
            <span>
              {category.icon} {category.name}
              {category.userId === null && (
                <span className="ml-2 text-xs text-slate-500">(padrão)</span>
              )}
            </span>
            {category.userId !== null && (
              <button onClick={() => deleteCategory.mutate(category.id)} className="text-red-400 hover:underline">
                Excluir
              </button>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}

export function SettingsPage() {
  return (
    <div className="space-y-10">
      <h1 className="text-2xl font-semibold">Configurações</h1>
      <AccountsSection />
      <CategoriesSection />
    </div>
  );
}
