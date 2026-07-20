import { Injectable, NotFoundException } from "@nestjs/common";
import type { CreateAccountInput, UpdateAccountInput } from "@hubassistent/shared-types";
import { PrismaService } from "../../prisma/prisma.service";

@Injectable()
export class AccountsService {
  constructor(private readonly prisma: PrismaService) {}

  list(userId: string) {
    return this.prisma.account.findMany({
      where: { userId },
      orderBy: { createdAt: "asc" },
    });
  }

  async findOne(userId: string, id: string) {
    const account = await this.prisma.account.findFirst({ where: { id, userId } });
    if (!account) {
      throw new NotFoundException("Conta não encontrada");
    }
    return account;
  }

  create(userId: string, input: CreateAccountInput) {
    return this.prisma.account.create({
      data: { ...input, userId },
    });
  }

  async update(userId: string, id: string, input: UpdateAccountInput) {
    await this.findOne(userId, id);
    return this.prisma.account.update({
      where: { id },
      data: input,
    });
  }

  async remove(userId: string, id: string) {
    await this.findOne(userId, id);
    await this.prisma.account.delete({ where: { id } });
  }
}
