import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Patch,
  Post,
  Query,
  UploadedFile,
  UseInterceptors,
} from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import { memoryStorage } from "multer";
import {
  createInvoiceSchema,
  importInvoiceSchema,
  listInvoicesQuerySchema,
  updateInvoiceSchema,
  type CreateInvoiceInput,
  type ImportInvoiceInput,
  type ListInvoicesQuery,
  type UpdateInvoiceInput,
} from "@hubassistent/shared-types";
import { ZodValidationPipe } from "../../common/pipes/zod-validation.pipe";
import { CurrentUser, type AuthenticatedUser } from "../../common/decorators/current-user.decorator";
import { InvoicesService } from "./invoices.service";
import { InvoicePdfParserService } from "./invoice-pdf-parser.service";

@Controller("invoices")
export class InvoicesController {
  constructor(
    private readonly invoicesService: InvoicesService,
    private readonly pdfParserService: InvoicePdfParserService,
  ) {}

  @Get()
  list(
    @CurrentUser() user: AuthenticatedUser,
    @Query(new ZodValidationPipe(listInvoicesQuerySchema)) query: ListInvoicesQuery,
  ) {
    return this.invoicesService.list(user.id, query);
  }

  @Get(":id")
  findOne(@CurrentUser() user: AuthenticatedUser, @Param("id") id: string) {
    return this.invoicesService.findOne(user.id, id);
  }

  @Post()
  create(
    @CurrentUser() user: AuthenticatedUser,
    @Body(new ZodValidationPipe(createInvoiceSchema)) body: CreateInvoiceInput,
  ) {
    return this.invoicesService.create(user.id, body);
  }

  @Post("parse-pdf")
  @UseInterceptors(
    FileInterceptor("file", {
      storage: memoryStorage(),
      limits: { fileSize: 15 * 1024 * 1024 },
      fileFilter: (_req, file, callback) => {
        callback(null, file.mimetype === "application/pdf");
      },
    }),
  )
  async parsePdf(@UploadedFile() file?: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException("Envie um arquivo PDF");
    }
    return this.pdfParserService.parse(file.buffer);
  }

  @Post("import")
  import(
    @CurrentUser() user: AuthenticatedUser,
    @Body(new ZodValidationPipe(importInvoiceSchema)) body: ImportInvoiceInput,
  ) {
    return this.invoicesService.importParsed(user.id, body);
  }

  @Patch(":id")
  update(
    @CurrentUser() user: AuthenticatedUser,
    @Param("id") id: string,
    @Body(new ZodValidationPipe(updateInvoiceSchema)) body: UpdateInvoiceInput,
  ) {
    return this.invoicesService.update(user.id, id, body);
  }

  @Delete(":id")
  @HttpCode(204)
  remove(@CurrentUser() user: AuthenticatedUser, @Param("id") id: string) {
    return this.invoicesService.remove(user.id, id);
  }
}
