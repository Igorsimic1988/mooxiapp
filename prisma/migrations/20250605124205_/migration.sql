/*
  Warnings:

  - You are about to drop the column `packing` on the `FurnitureItem` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "FurnitureItem" DROP COLUMN "packing",
ADD COLUMN     "packingNeeds" JSONB;
