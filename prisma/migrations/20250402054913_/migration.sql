/*
  Warnings:

  - You are about to drop the column `estimateRateType` on the `Lead` table. All the data in the column will be lost.
  - You are about to drop the column `invioceRateType` on the `Lead` table. All the data in the column will be lost.
  - You are about to drop the column `logisticsRateType` on the `Lead` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Lead" DROP COLUMN "estimateRateType",
DROP COLUMN "invioceRateType",
DROP COLUMN "logisticsRateType",
ADD COLUMN     "RateType" TEXT;
