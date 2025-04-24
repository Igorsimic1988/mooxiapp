/*
  Warnings:

  - You are about to drop the `Estimate` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `MovingDay` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `PackingDay` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Estimate" DROP CONSTRAINT "Estimate_leadId_fkey";

-- DropForeignKey
ALTER TABLE "MovingDay" DROP CONSTRAINT "MovingDay_leadId_fkey";

-- DropForeignKey
ALTER TABLE "PackingDay" DROP CONSTRAINT "PackingDay_leadId_fkey";

-- AlterTable
ALTER TABLE "Lead" ADD COLUMN     "assignSalesRep" BOOLEAN,
ADD COLUMN     "fromZip" TEXT,
ADD COLUMN     "moveDate" TIMESTAMP(3),
ADD COLUMN     "move_date" TIMESTAMP(3),
ADD COLUMN     "toZip" TEXT,
ALTER COLUMN "rateType" DROP NOT NULL,
ALTER COLUMN "serviceType" DROP NOT NULL,
ALTER COLUMN "source" DROP NOT NULL,
ALTER COLUMN "leadStatus" DROP NOT NULL,
ALTER COLUMN "leadActivity" DROP NOT NULL,
ALTER COLUMN "nextAction" DROP NOT NULL,
ALTER COLUMN "salesName" DROP NOT NULL,
ALTER COLUMN "isNew" DROP NOT NULL,
ALTER COLUMN "inventoryOption" DROP NOT NULL,
ALTER COLUMN "addStorage" DROP NOT NULL,
ALTER COLUMN "timePromised" DROP NOT NULL;

-- DropTable
DROP TABLE "Estimate";

-- DropTable
DROP TABLE "MovingDay";

-- DropTable
DROP TABLE "PackingDay";
