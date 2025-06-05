/*
  Warnings:

  - You are about to drop the column `packingQuantity` on the `FurnitureItem` table. All the data in the column will be lost.
  - You are about to drop the column `packingType` on the `FurnitureItem` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "FurnitureItem" DROP COLUMN "packingQuantity",
DROP COLUMN "packingType",
ADD COLUMN     "packing" JSONB;
