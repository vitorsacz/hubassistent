import { Module } from "@nestjs/common";
import { InvoicesController } from "./invoices.controller";
import { InvoicesService } from "./invoices.service";
import { InvoicePdfParserService } from "./invoice-pdf-parser.service";

@Module({
  controllers: [InvoicesController],
  providers: [InvoicesService, InvoicePdfParserService],
  exports: [InvoicesService],
})
export class InvoicesModule {}
