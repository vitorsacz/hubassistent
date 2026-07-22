-- AlterTable
ALTER TABLE "Card" ADD COLUMN     "bank" TEXT;

-- AlterTable
ALTER TABLE "Transaction" ADD COLUMN     "installmentNumber" INTEGER,
ADD COLUMN     "installmentTotal" INTEGER;
