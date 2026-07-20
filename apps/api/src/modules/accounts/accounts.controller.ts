import { Body, Controller, Delete, Get, HttpCode, Param, Patch, Post } from "@nestjs/common";
import {
  createAccountSchema,
  updateAccountSchema,
  type CreateAccountInput,
  type UpdateAccountInput,
} from "@hubassistent/shared-types";
import { ZodValidationPipe } from "../../common/pipes/zod-validation.pipe";
import { CurrentUser, type AuthenticatedUser } from "../../common/decorators/current-user.decorator";
import { AccountsService } from "./accounts.service";

@Controller("accounts")
export class AccountsController {
  constructor(private readonly accountsService: AccountsService) {}

  @Get()
  list(@CurrentUser() user: AuthenticatedUser) {
    return this.accountsService.list(user.id);
  }

  @Get(":id")
  findOne(@CurrentUser() user: AuthenticatedUser, @Param("id") id: string) {
    return this.accountsService.findOne(user.id, id);
  }

  @Post()
  create(
    @CurrentUser() user: AuthenticatedUser,
    @Body(new ZodValidationPipe(createAccountSchema)) body: CreateAccountInput,
  ) {
    return this.accountsService.create(user.id, body);
  }

  @Patch(":id")
  update(
    @CurrentUser() user: AuthenticatedUser,
    @Param("id") id: string,
    @Body(new ZodValidationPipe(updateAccountSchema)) body: UpdateAccountInput,
  ) {
    return this.accountsService.update(user.id, id, body);
  }

  @Delete(":id")
  @HttpCode(204)
  remove(@CurrentUser() user: AuthenticatedUser, @Param("id") id: string) {
    return this.accountsService.remove(user.id, id);
  }
}
