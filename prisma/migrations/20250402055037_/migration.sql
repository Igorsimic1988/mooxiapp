/*
  Warnings:

  - You are about to drop the column `RateType` on the `Lead` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Lead" DROP COLUMN "RateType",
ADD COLUMN     "rateType" TEXT;
