/*
  Warnings:

  - You are about to drop the column `invioceDeposit` on the `Lead` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Lead" DROP COLUMN "invioceDeposit",
ADD COLUMN     "invoiceDeposit" DOUBLE PRECISION;
