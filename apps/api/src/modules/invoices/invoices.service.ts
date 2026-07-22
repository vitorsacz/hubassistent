import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import type {
  CreateInvoiceInput,
  ImportInvoiceInput,
  ListInvoicesQuery,
  UpdateInvoiceInput,
} from "@hubassistent/shared-types";
import { Prisma } from "@prisma/client";
import { PrismaService } from "../../prisma/prisma.service";

function monthRange(month: string) {
  const [yearStr, monthStr] = month.split("-");
  const year = Number(yearStr);
  const monthIndex = Number(monthStr);
  const start = new Date(Date.UTC(year, monthIndex - 1, 1));
  const end = new Date(Date.UTC(year, monthIndex, 1));
  return { gte: start, lt: end };
}

@Injectable()
export class InvoicesService {
  constructor(private readonly prisma: PrismaService) {}

  list(userId: string, query: ListInvoicesQuery) {
    const where: Prisma.InvoiceWhereInput = { userId };

    if (query.cardId) where.cardId = query.cardId;
    if (query.month) where.referenceMonth = monthRange(query.month);
    if (query.bank) where.card = { bank: query.bank };

    return this.prisma.invoice.findMany({
      where,
      include: { card: true },
      orderBy: { referenceMonth: "desc" },
    });
  }

  async findOne(userId: string, id: string) {
    const invoice = await this.prisma.invoice.findFirst({ where: { id, userId }, include: { card: true } });
    if (!invoice) {
      throw new NotFoundException("Fatura não encontrada");
    }
    return invoice;
  }

  async create(userId: string, input: CreateInvoiceInput) {
    await this.assertCardBelongsToUser(userId, input.cardId);
    return this.prisma.invoice.create({
      data: { ...input, userId },
    });
  }

  async update(userId: string, id: string, input: UpdateInvoiceInput) {
    await this.findOne(userId, id);
    return this.prisma.invoice.update({
      where: { id },
      data: input,
    });
  }

  async remove(userId: string, id: string) {
    await this.findOne(userId, id);
    await this.prisma.invoice.delete({ where: { id } });
  }

  async importParsed(userId: string, input: ImportInvoiceInput) {
    await this.assertCardBelongsToUser(userId, input.cardId);

    const total = input.items.reduce((sum, item) => sum + item.amount, 0);
    const monthStart = new Date(
      Date.UTC(input.referenceMonth.getUTCFullYear(), input.referenceMonth.getUTCMonth(), 1),
    );
    const monthEnd = new Date(
      Date.UTC(input.referenceMonth.getUTCFullYear(), input.referenceMonth.getUTCMonth() + 1, 1),
    );

    const existing = await this.prisma.invoice.findFirst({
      where: { userId, cardId: input.cardId, referenceMonth: { gte: monthStart, lt: monthEnd } },
    });

    const invoice = existing
      ? await this.prisma.invoice.update({
          where: { id: existing.id },
          data: { dueDate: input.dueDate, amount: total },
        })
      : await this.prisma.invoice.create({
          data: {
            userId,
            cardId: input.cardId,
            referenceMonth: monthStart,
            dueDate: input.dueDate,
            amount: total,
          },
        });

    await this.prisma.transaction.createMany({
      data: input.items.map((item) => ({
        userId,
        cardId: input.cardId,
        invoiceId: invoice.id,
        type: "EXPENSE" as const,
        method: "CREDIT" as const,
        source: "IMPORT" as const,
        amount: item.amount,
        description: item.description,
        date: item.date,
        categoryId: item.categoryId,
        installmentNumber: item.installmentNumber,
        installmentTotal: item.installmentTotal,
      })),
    });

    return this.findOne(userId, invoice.id);
  }

  private async assertCardBelongsToUser(userId: string, cardId?: string) {
    if (!cardId) return;
    const card = await this.prisma.card.findFirst({ where: { id: cardId, userId } });
    if (!card) throw new BadRequestException("Cartão inválido");
  }
}
