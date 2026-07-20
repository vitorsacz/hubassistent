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
    <div className="flex min-h-screen items-center justify-center bg-slate-950 px-4">
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="w-full max-w-sm space-y-4 rounded-xl bg-slate-900 p-8 shadow-lg"
      >
        <h1 className="text-xl font-semibold text-white">Criar conta</h1>

        <div>
          <label className="mb-1 block text-sm text-slate-300">Nome</label>
          <input
            type="text"
            className="w-full rounded-md border border-slate-700 bg-slate-800 px-3 py-2 text-white"
            {...register("name")}
          />
        </div>

        <div>
          <label className="mb-1 block text-sm text-slate-300">E-mail</label>
          <input
            type="email"
            className="w-full rounded-md border border-slate-700 bg-slate-800 px-3 py-2 text-white"
            {...register("email")}
          />
          {errors.email && <p className="mt-1 text-sm text-red-400">{errors.email.message}</p>}
        </div>

        <div>
          <label className="mb-1 block text-sm text-slate-300">Senha</label>
          <input
            type="password"
            className="w-full rounded-md border border-slate-700 bg-slate-800 px-3 py-2 text-white"
            {...register("password")}
          />
          {errors.password && <p className="mt-1 text-sm text-red-400">{errors.password.message}</p>}
        </div>

        {formError && <p className="text-sm text-red-400">{formError}</p>}

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full rounded-md bg-indigo-600 py-2 font-medium text-white hover:bg-indigo-500 disabled:opacity-50"
        >
          {isSubmitting ? "Criando…" : "Criar conta"}
        </button>

        <p className="text-center text-sm text-slate-400">
          Já tem conta?{" "}
          <Link to="/login" className="text-indigo-400 hover:underline">
            Entrar
          </Link>
        </p>
      </form>
    </div>
  );
}
