/*
  Warnings:

  - You are about to drop the column `additionalServices` on the `Lead` table. All the data in the column will be lost.
  - You are about to drop the column `balanceDue` on the `Lead` table. All the data in the column will be lost.
  - You are about to drop the column `discount` on the `Lead` table. All the data in the column will be lost.
  - You are about to drop the column `fuelSurcharge` on the `Lead` table. All the data in the column will be lost.
  - You are about to drop the column `grandTotal` on the `Lead` table. All the data in the column will be lost.
  - You are about to drop the column `payment` on the `Lead` table. All the data in the column will be lost.
  - You are about to drop the column `quote` on the `Lead` table. All the data in the column will be lost.
  - You are about to drop the column `valuation` on the `Lead` table. All the data in the column will be lost.
  - The `estimatePacking` column on the `Lead` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "Lead" DROP COLUMN "additionalServices",
DROP COLUMN "balanceDue",
DROP COLUMN "discount",
DROP COLUMN "fuelSurcharge",
DROP COLUMN "grandTotal",
DROP COLUMN "payment",
DROP COLUMN "quote",
DROP COLUMN "valuation",
ADD COLUMN     "estimateAdditionalServices" DOUBLE PRECISION,
ADD COLUMN     "estimateBalanceDueMax" DOUBLE PRECISION,
ADD COLUMN     "estimateBalanceDueMin" DOUBLE PRECISION,
ADD COLUMN     "estimateDiscount" DOUBLE PRECISION,
ADD COLUMN     "estimateFuelSurcharge" DOUBLE PRECISION,
ADD COLUMN     "estimateGrandTotalMax" DOUBLE PRECISION,
ADD COLUMN     "estimateGrandTotalMin" DOUBLE PRECISION,
ADD COLUMN     "estimatePayment" DOUBLE PRECISION,
ADD COLUMN     "estimateQuoteMax" DOUBLE PRECISION,
ADD COLUMN     "estimateQuoteMin" DOUBLE PRECISION,
ADD COLUMN     "estimateValuation" DOUBLE PRECISION,
ADD COLUMN     "invioceRateType" TEXT,
ADD COLUMN     "invoiceAdditionalServices" DOUBLE PRECISION,
ADD COLUMN     "invoiceBalanceDueMax" DOUBLE PRECISION,
ADD COLUMN     "invoiceBalanceDueMin" DOUBLE PRECISION,
ADD COLUMN     "invoiceDiscount" DOUBLE PRECISION,
ADD COLUMN     "invoiceFuelSurcharge" DOUBLE PRECISION,
ADD COLUMN     "invoiceGrandTotalMax" DOUBLE PRECISION,
ADD COLUMN     "invoiceGrandTotalMin" DOUBLE PRECISION,
ADD COLUMN     "invoicePacking" DOUBLE PRECISION,
ADD COLUMN     "invoicePayment" DOUBLE PRECISION,
ADD COLUMN     "invoiceQuoteMax" DOUBLE PRECISION,
ADD COLUMN     "invoiceQuoteMin" DOUBLE PRECISION,
ADD COLUMN     "invoiceValuation" DOUBLE PRECISION,
DROP COLUMN "estimatePacking",
ADD COLUMN     "estimatePacking" DOUBLE PRECISION;
