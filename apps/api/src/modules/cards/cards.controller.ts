import { Body, Controller, Delete, Get, HttpCode, Param, Patch, Post } from "@nestjs/common";
import {
  createCardSchema,
  updateCardSchema,
  type CreateCardInput,
  type UpdateCardInput,
} from "@hubassistent/shared-types";
import { ZodValidationPipe } from "../../common/pipes/zod-validation.pipe";
import { CurrentUser, type AuthenticatedUser } from "../../common/decorators/current-user.decorator";
import { CardsService } from "./cards.service";

@Controller("cards")
export class CardsController {
  constructor(private readonly cardsService: CardsService) {}

  @Get()
  list(@CurrentUser() user: AuthenticatedUser) {
    return this.cardsService.list(user.id);
  }

  @Get(":id")
  findOne(@CurrentUser() user: AuthenticatedUser, @Param("id") id: string) {
    return this.cardsService.findOne(user.id, id);
  }

  @Post()
  create(
    @CurrentUser() user: AuthenticatedUser,
    @Body(new ZodValidationPipe(createCardSchema)) body: CreateCardInput,
  ) {
    return this.cardsService.create(user.id, body);
  }

  @Patch(":id")
  update(
    @CurrentUser() user: AuthenticatedUser,
    @Param("id") id: string,
    @Body(new ZodValidationPipe(updateCardSchema)) body: UpdateCardInput,
  ) {
    return this.cardsService.update(user.id, id, body);
  }

  @Delete(":id")
  @HttpCode(204)
  remove(@CurrentUser() user: AuthenticatedUser, @Param("id") id: string) {
    return this.cardsService.remove(user.id, id);
  }
}
