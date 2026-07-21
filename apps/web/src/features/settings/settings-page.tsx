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

const fieldLabel = "mb-1.5 block text-xs font-medium uppercase tracking-wide text-muted";
const fieldInput =
  "rounded-md border border-line bg-app px-3 py-2 text-ink outline-none transition-colors focus:border-accent";

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
      <h2 className="font-display text-xl italic text-ink">Contas</h2>

      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-wrap items-end gap-3 rounded border border-line bg-surface p-6">
        <div>
          <label className={fieldLabel}>Nome</label>
          <input type="text" placeholder="Nubank Conta" className={fieldInput} {...register("name")} />
          {errors.name && <p className="mt-1.5 text-sm text-bad">{errors.name.message}</p>}
        </div>
        <div>
          <label className={fieldLabel}>Tipo</label>
          <select className={fieldInput} {...register("type")}>
            <option value="CHECKING">Conta corrente</option>
            <option value="SAVINGS">Poupança</option>
            <option value="CASH">Dinheiro</option>
            <option value="WALLET">Carteira</option>
          </select>
        </div>
        <button
          type="submit"
          disabled={createAccount.isPending}
          className="rounded-md bg-accent px-4 py-2 font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-50"
        >
          Adicionar
        </button>
      </form>

      <div className="rounded border border-line bg-surface">
        {isLoading && <p className="p-4 text-muted">Carregando…</p>}
        {!isLoading && accounts.length === 0 && <p className="p-4 text-muted">Nenhuma conta ainda.</p>}
        {accounts.map((account, i) => (
          <div
            key={account.id}
            className={`flex items-center justify-between px-5 py-3 ${i > 0 ? "border-t border-line" : ""}`}
          >
            <span className="text-ink">{account.name}</span>
            <button onClick={() => deleteAccount.mutate(account.id)} className="text-xs text-bad hover:underline">
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
      <h2 className="font-display text-xl italic text-ink">Categorias</h2>

      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-wrap items-end gap-3 rounded border border-line bg-surface p-6">
        <div>
          <label className={fieldLabel}>Nome</label>
          <input type="text" placeholder="Assinaturas" className={fieldInput} {...register("name")} />
          {errors.name && <p className="mt-1.5 text-sm text-bad">{errors.name.message}</p>}
        </div>
        <div>
          <label className={fieldLabel}>Tipo</label>
          <select className={fieldInput} {...register("type")}>
            <option value="EXPENSE">Saída</option>
            <option value="INCOME">Entrada</option>
          </select>
        </div>
        <button
          type="submit"
          disabled={createCategory.isPending}
          className="rounded-md bg-accent px-4 py-2 font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-50"
        >
          Adicionar
        </button>
      </form>

      <div className="rounded border border-line bg-surface">
        {isLoading && <p className="p-4 text-muted">Carregando…</p>}
        {categories.map((category, i) => (
          <div
            key={category.id}
            className={`flex items-center justify-between px-5 py-3 ${i > 0 ? "border-t border-line" : ""}`}
          >
            <span className="text-ink">
              {category.icon} {category.name}
              {category.userId === null && <span className="ml-2 text-xs text-muted">(padrão)</span>}
            </span>
            {category.userId !== null && (
              <button onClick={() => deleteCategory.mutate(category.id)} className="text-xs text-bad hover:underline">
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
      <h1 className="font-display text-2xl italic text-ink">Configurações</h1>
      <AccountsSection />
      <CategoriesSection />
    </div>
  );
}
