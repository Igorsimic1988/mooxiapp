/*
  Warnings:

  - The `search` column on the `FurnitureItem` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `search` column on the `InventoryItem` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "FurnitureItem" DROP COLUMN "search",
ADD COLUMN     "search" BOOLEAN;

-- AlterTable
ALTER TABLE "InventoryItem" DROP COLUMN "search",
ADD COLUMN     "search" BOOLEAN;
