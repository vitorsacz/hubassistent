import { Body, Controller, Delete, Get, HttpCode, Param, Patch, Post, Query } from "@nestjs/common";
import {
  createTransactionSchema,
  listTransactionsQuerySchema,
  updateTransactionSchema,
  type CreateTransactionInput,
  type ListTransactionsQuery,
  type UpdateTransactionInput,
} from "@hubassistent/shared-types";
import { ZodValidationPipe } from "../../common/pipes/zod-validation.pipe";
import { CurrentUser, type AuthenticatedUser } from "../../common/decorators/current-user.decorator";
import { TransactionsService } from "./transactions.service";

@Controller("transactions")
export class TransactionsController {
  constructor(private readonly transactionsService: TransactionsService) {}

  @Get()
  list(
    @CurrentUser() user: AuthenticatedUser,
    @Query(new ZodValidationPipe(listTransactionsQuerySchema)) query: ListTransactionsQuery,
  ) {
    return this.transactionsService.list(user.id, query);
  }

  @Get(":id")
  findOne(@CurrentUser() user: AuthenticatedUser, @Param("id") id: string) {
    return this.transactionsService.findOne(user.id, id);
  }

  @Post()
  create(
    @CurrentUser() user: AuthenticatedUser,
    @Body(new ZodValidationPipe(createTransactionSchema)) body: CreateTransactionInput,
  ) {
    return this.transactionsService.create(user.id, body);
  }

  @Patch(":id")
  update(
    @CurrentUser() user: AuthenticatedUser,
    @Param("id") id: string,
    @Body(new ZodValidationPipe(updateTransactionSchema)) body: UpdateTransactionInput,
  ) {
    return this.transactionsService.update(user.id, id, body);
  }

  @Delete(":id")
  @HttpCode(204)
  remove(@CurrentUser() user: AuthenticatedUser, @Param("id") id: string) {
    return this.transactionsService.remove(user.id, id);
  }
}
