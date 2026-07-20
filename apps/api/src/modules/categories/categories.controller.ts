import { Body, Controller, Delete, Get, HttpCode, Param, Patch, Post } from "@nestjs/common";
import {
  createCategorySchema,
  updateCategorySchema,
  type CreateCategoryInput,
  type UpdateCategoryInput,
} from "@hubassistent/shared-types";
import { ZodValidationPipe } from "../../common/pipes/zod-validation.pipe";
import { CurrentUser, type AuthenticatedUser } from "../../common/decorators/current-user.decorator";
import { CategoriesService } from "./categories.service";

@Controller("categories")
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Get()
  list(@CurrentUser() user: AuthenticatedUser) {
    return this.categoriesService.list(user.id);
  }

  @Post()
  create(
    @CurrentUser() user: AuthenticatedUser,
    @Body(new ZodValidationPipe(createCategorySchema)) body: CreateCategoryInput,
  ) {
    return this.categoriesService.create(user.id, body);
  }

  @Patch(":id")
  update(
    @CurrentUser() user: AuthenticatedUser,
    @Param("id") id: string,
    @Body(new ZodValidationPipe(updateCategorySchema)) body: UpdateCategoryInput,
  ) {
    return this.categoriesService.update(user.id, id, body);
  }

  @Delete(":id")
  @HttpCode(204)
  remove(@CurrentUser() user: AuthenticatedUser, @Param("id") id: string) {
    return this.categoriesService.remove(user.id, id);
  }
}
