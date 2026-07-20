import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import type {
  CreateTransactionInput,
  ListTransactionsQuery,
  UpdateTransactionInput,
} from "@hubassistent/shared-types";
import { Prisma } from "@prisma/client";
import { PrismaService } from "../../prisma/prisma.service";

type TransactionRefs = {
  accountId?: string;
  cardId?: string;
  invoiceId?: string;
  categoryId?: string;
};

@Injectable()
export class TransactionsService {
  constructor(private readonly prisma: PrismaService) {}

  list(userId: string, query: ListTransactionsQuery) {
    const where: Prisma.TransactionWhereInput = { userId };

    if (query.accountId) where.accountId = query.accountId;
    if (query.cardId) where.cardId = query.cardId;
    if (query.categoryId) where.categoryId = query.categoryId;
    if (query.dateFrom || query.dateTo) {
      where.date = {
        ...(query.dateFrom ? { gte: query.dateFrom } : {}),
        ...(query.dateTo ? { lte: query.dateTo } : {}),
      };
    }

    return this.prisma.transaction.findMany({
      where,
      orderBy: { date: "desc" },
    });
  }

  async findOne(userId: string, id: string) {
    const transaction = await this.prisma.transaction.findFirst({ where: { id, userId } });
    if (!transaction) {
      throw new NotFoundException("Transação não encontrada");
    }
    return transaction;
  }

  async create(userId: string, input: CreateTransactionInput) {
    await this.assertRefsBelongToUser(userId, input);
    return this.prisma.transaction.create({
      data: { ...input, userId },
    });
  }

  async update(userId: string, id: string, input: UpdateTransactionInput) {
    await this.findOne(userId, id);
    await this.assertRefsBelongToUser(userId, input);
    return this.prisma.transaction.update({
      where: { id },
      data: input,
    });
  }

  async remove(userId: string, id: string) {
    await this.findOne(userId, id);
    await this.prisma.transaction.delete({ where: { id } });
  }

  private async assertRefsBelongToUser(userId: string, refs: TransactionRefs) {
    const [account, card, invoice, category] = await Promise.all([
      refs.accountId
        ? this.prisma.account.findFirst({ where: { id: refs.accountId, userId } })
        : Promise.resolve(true),
      refs.cardId ? this.prisma.card.findFirst({ where: { id: refs.cardId, userId } }) : Promise.resolve(true),
      refs.invoiceId
        ? this.prisma.invoice.findFirst({ where: { id: refs.invoiceId, userId } })
        : Promise.resolve(true),
      refs.categoryId
        ? this.prisma.category.findFirst({
            where: { id: refs.categoryId, OR: [{ userId }, { userId: null }] },
          })
        : Promise.resolve(true),
    ]);

    if (!account) throw new BadRequestException("Conta inválida");
    if (!card) throw new BadRequestException("Cartão inválido");
    if (!invoice) throw new BadRequestException("Fatura inválida");
    if (!category) throw new BadRequestException("Categoria inválida");
  }
}
