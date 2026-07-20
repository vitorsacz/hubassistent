# HubAssistent

App pessoal para controlar finanças (gastos, entradas, faturas, cartões, pix, extrato) e, futuramente, organizar rotina (calendário, agendamentos, exercícios). Construído com arquitetura modular para eventualmente virar um produto multiusuário.

## Stack

- **Monorepo:** pnpm workspaces + Turborepo
- **Backend:** NestJS + Prisma + PostgreSQL (`apps/api`)
- **Frontend:** React + Vite + Tailwind + TanStack Query (`apps/web`)
- **Compartilhado:** schemas Zod em `packages/shared-types`, usados tanto nos DTOs do backend quanto nos formulários do frontend

## Estrutura

```
apps/
  api/     # NestJS — auth, e futuramente contas/cartões/transações/faturas
  web/     # React (Vite) — login, registro, dashboard
packages/
  shared-types/    # schemas Zod compartilhados (fonte de verdade do contrato de API)
  eslint-config/    # config ESLint compartilhada (flat config)
  tsconfig/         # tsconfigs base compartilhados
```

## Rodando localmente

Pré-requisitos: Node 20+, pnpm.

```bash
pnpm install
```

### Banco de dados

Não é necessário Docker. Crie um projeto gratuito no [Supabase](https://supabase.com), pegue a `DATABASE_URL` (Settings → Database → Connection string) e use-a tanto localmente quanto em produção. Alternativa: instalar PostgreSQL localmente.

Copie `.env.example` para `.env` dentro de `apps/api` e preencha:

```bash
cp .env.example apps/api/.env
```

Depois rode as migrations:

```bash
pnpm db:migrate
```

### Variáveis de ambiente

`apps/api/.env`:
- `DATABASE_URL` — connection string do Postgres (Supabase)
- `JWT_ACCESS_SECRET` / `JWT_REFRESH_SECRET` — strings aleatórias longas
- `PORT` — porta da API (padrão 3000)
- `CORS_ORIGIN` — origem do frontend (padrão `http://localhost:5173`)

`apps/web/.env`:
- `VITE_API_URL` — URL da API (padrão `http://localhost:3000`)

### Desenvolvimento

```bash
pnpm dev
```

Sobe a API em `http://localhost:3000` e o frontend em `http://localhost:5173`.

### Outros comandos

```bash
pnpm lint        # lint em todos os pacotes
pnpm typecheck   # typecheck em todos os pacotes
pnpm build       # build de produção de todos os pacotes
```

## Deploy (100% gratuito)

| Componente | Serviço |
|---|---|
| Frontend (`apps/web`) | Vercel |
| PostgreSQL | Supabase |
| API (`apps/api`) | Render (free web service — "dorme" após inatividade) |

## Roadmap

- [x] Fase 0 — scaffold do monorepo
- [x] Fase 1 — autenticação (registro, login, refresh token)
- [ ] Fase 2 — núcleo financeiro (contas, cartões, categorias, transações)
- [ ] Fase 3 — faturas/contas a pagar + dashboard
- [ ] Fase 4 — módulo de rotina/calendário
- [ ] Fase 5 — importação Open Finance
