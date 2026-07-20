import { Injectable, NotFoundException } from "@nestjs/common";
import type { CreateCategoryInput, UpdateCategoryInput } from "@hubassistent/shared-types";
import { PrismaService } from "../../prisma/prisma.service";

@Injectable()
export class CategoriesService {
  constructor(private readonly prisma: PrismaService) {}

  list(userId: string) {
    return this.prisma.category.findMany({
      where: { OR: [{ userId }, { userId: null }] },
      orderBy: { name: "asc" },
    });
  }

  async findOwned(userId: string, id: string) {
    const category = await this.prisma.category.findFirst({ where: { id, userId } });
    if (!category) {
      throw new NotFoundException("Categoria não encontrada");
    }
    return category;
  }

  create(userId: string, input: CreateCategoryInput) {
    return this.prisma.category.create({
      data: { ...input, userId },
    });
  }

  async update(userId: string, id: string, input: UpdateCategoryInput) {
    await this.findOwned(userId, id);
    return this.prisma.category.update({
      where: { id },
      data: input,
    });
  }

  async remove(userId: string, id: string) {
    await this.findOwned(userId, id);
    await this.prisma.category.delete({ where: { id } });
  }
}
