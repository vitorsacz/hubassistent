import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const DEFAULT_CATEGORIES = [
  { name: "Alimentação", type: "EXPENSE", icon: "🍽️", color: "#f97316" },
  { name: "Transporte", type: "EXPENSE", icon: "🚗", color: "#3b82f6" },
  { name: "Moradia", type: "EXPENSE", icon: "🏠", color: "#8b5cf6" },
  { name: "Saúde", type: "EXPENSE", icon: "💊", color: "#ef4444" },
  { name: "Lazer", type: "EXPENSE", icon: "🎮", color: "#ec4899" },
  { name: "Educação", type: "EXPENSE", icon: "📚", color: "#14b8a6" },
  { name: "Compras", type: "EXPENSE", icon: "🛍️", color: "#a855f7" },
  { name: "Outros gastos", type: "EXPENSE", icon: "📦", color: "#64748b" },
  { name: "Salário", type: "INCOME", icon: "💰", color: "#22c55e" },
  { name: "Investimentos", type: "INCOME", icon: "📈", color: "#0ea5e9" },
  { name: "Outras entradas", type: "INCOME", icon: "💵", color: "#84cc16" },
] as const;

async function main() {
  for (const category of DEFAULT_CATEGORIES) {
    const existing = await prisma.category.findFirst({
      where: { userId: null, name: category.name },
    });
    if (!existing) {
      await prisma.category.create({ data: category });
    }
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
