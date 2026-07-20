import { Injectable, NotFoundException } from "@nestjs/common";
import type { CreateCardInput, UpdateCardInput } from "@hubassistent/shared-types";
import { PrismaService } from "../../prisma/prisma.service";

@Injectable()
export class CardsService {
  constructor(private readonly prisma: PrismaService) {}

  list(userId: string) {
    return this.prisma.card.findMany({
      where: { userId },
      orderBy: { createdAt: "asc" },
    });
  }

  async findOne(userId: string, id: string) {
    const card = await this.prisma.card.findFirst({ where: { id, userId } });
    if (!card) {
      throw new NotFoundException("Cartão não encontrado");
    }
    return card;
  }

  create(userId: string, input: CreateCardInput) {
    return this.prisma.card.create({
      data: { ...input, userId },
    });
  }

  async update(userId: string, id: string, input: UpdateCardInput) {
    await this.findOne(userId, id);
    return this.prisma.card.update({
      where: { id },
      data: input,
    });
  }

  async remove(userId: string, id: string) {
    await this.findOne(userId, id);
    await this.prisma.card.delete({ where: { id } });
  }
}
