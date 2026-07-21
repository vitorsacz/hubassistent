import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { registerSchema, type RegisterInput } from "@hubassistent/shared-types";
import { apiClient, ApiError } from "@/lib/api-client";
import { useAuth } from "@/lib/auth-context";

export function RegisterPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [formError, setFormError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterInput>({ resolver: zodResolver(registerSchema) });

  const onSubmit = async (data: RegisterInput) => {
    setFormError(null);
    try {
      const result = await apiClient.post<{ accessToken: string }>("/auth/register", data);
      await login(result.accessToken);
      navigate("/", { replace: true });
    } catch (err) {
      setFormError(err instanceof ApiError ? err.message : "Erro ao criar conta");
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-app px-4">
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="w-full max-w-sm space-y-5 rounded-lg border border-line bg-surface p-8"
      >
        <h1 className="font-display text-2xl italic text-ink">Criar conta</h1>

        <div>
          <label className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-muted">
            Nome
          </label>
          <input
            type="text"
            className="w-full rounded-md border border-line bg-app px-3 py-2 text-ink outline-none transition-colors focus:border-accent"
            {...register("name")}
          />
        </div>

        <div>
          <label className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-muted">
            E-mail
          </label>
          <input
            type="email"
            className="w-full rounded-md border border-line bg-app px-3 py-2 text-ink outline-none transition-colors focus:border-accent"
            {...register("email")}
          />
          {errors.email && <p className="mt-1.5 text-sm text-bad">{errors.email.message}</p>}
        </div>

        <div>
          <label className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-muted">
            Senha
          </label>
          <input
            type="password"
            className="w-full rounded-md border border-line bg-app px-3 py-2 text-ink outline-none transition-colors focus:border-accent"
            {...register("password")}
          />
          {errors.password && <p className="mt-1.5 text-sm text-bad">{errors.password.message}</p>}
        </div>

        {formError && <p className="text-sm text-bad">{formError}</p>}

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full rounded-md bg-accent py-2 font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-50"
        >
          {isSubmitting ? "Criando…" : "Criar conta"}
        </button>

        <p className="text-center text-sm text-muted">
          Já tem conta?{" "}
          <Link to="/login" className="text-accent hover:underline">
            Entrar
          </Link>
        </p>
      </form>
    </div>
  );
}
