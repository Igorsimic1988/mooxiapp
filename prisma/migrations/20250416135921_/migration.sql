/*
  Warnings:

  - You are about to drop the column `estimateBalanceDueMax` on the `Lead` table. All the data in the column will be lost.
  - You are about to drop the column `estimateBalanceDueMin` on the `Lead` table. All the data in the column will be lost.
  - You are about to drop the column `estimateGrandTotalMax` on the `Lead` table. All the data in the column will be lost.
  - You are about to drop the column `estimateGrandTotalMin` on the `Lead` table. All the data in the column will be lost.
  - You are about to drop the column `estimateQuoteMax` on the `Lead` table. All the data in the column will be lost.
  - You are about to drop the column `estimateQuoteMin` on the `Lead` table. All the data in the column will be lost.
  - You are about to drop the column `invoiceBalanceDueMax` on the `Lead` table. All the data in the column will be lost.
  - You are about to drop the column `invoiceBalanceDueMin` on the `Lead` table. All the data in the column will be lost.
  - You are about to drop the column `invoiceGrandTotalMax` on the `Lead` table. All the data in the column will be lost.
  - You are about to drop the column `invoiceGrandTotalMin` on the `Lead` table. All the data in the column will be lost.
  - You are about to drop the column `invoiceQuoteMax` on the `Lead` table. All the data in the column will be lost.
  - You are about to drop the column `invoiceQuoteMin` on the `Lead` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Lead" DROP COLUMN "estimateBalanceDueMax",
DROP COLUMN "estimateBalanceDueMin",
DROP COLUMN "estimateGrandTotalMax",
DROP COLUMN "estimateGrandTotalMin",
DROP COLUMN "estimateQuoteMax",
DROP COLUMN "estimateQuoteMin",
DROP COLUMN "invoiceBalanceDueMax",
DROP COLUMN "invoiceBalanceDueMin",
DROP COLUMN "invoiceGrandTotalMax",
DROP COLUMN "invoiceGrandTotalMin",
DROP COLUMN "invoiceQuoteMax",
DROP COLUMN "invoiceQuoteMin",
ADD COLUMN     "estimateBalanceDue" DOUBLE PRECISION,
ADD COLUMN     "estimateGrandTotal" DOUBLE PRECISION,
ADD COLUMN     "estimateQuote" DOUBLE PRECISION,
ADD COLUMN     "invoiceBalanceDue" DOUBLE PRECISION,
ADD COLUMN     "invoiceGrandTotal" DOUBLE PRECISION,
ADD COLUMN     "invoiceQuote" DOUBLE PRECISION;
