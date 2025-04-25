/*
  Warnings:

  - You are about to drop the column `hasInvioce` on the `Lead` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Lead" DROP COLUMN "hasInvioce",
ADD COLUMN     "hasInvoice" BOOLEAN DEFAULT false,
ALTER COLUMN "isNew" SET DEFAULT true,
ALTER COLUMN "addStorage" SET DEFAULT false,
ALTER COLUMN "assignSalesRep" SET DEFAULT false,
ALTER COLUMN "activeDay" SET DEFAULT 'moving',
ALTER COLUMN "hasPackingDay" SET DEFAULT false;
