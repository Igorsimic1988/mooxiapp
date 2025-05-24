/*
  Warnings:

  - You are about to drop the `StatusHistory` table. If the table is not empty, all the data it contains will be lost.
  - Changed the type of `type` on the `Event` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "Events" AS ENUM ('LEAD_STATUS_CHANGED', 'LEAD_ACTIVITY_CHANGED', 'NEXT_ACTION_CHANGED');

-- DropForeignKey
ALTER TABLE "StatusHistory" DROP CONSTRAINT "StatusHistory_leadId_fkey";

-- AlterTable
ALTER TABLE "Event" DROP COLUMN "type",
ADD COLUMN     "type" "Events" NOT NULL;

-- DropTable
DROP TABLE "StatusHistory";
