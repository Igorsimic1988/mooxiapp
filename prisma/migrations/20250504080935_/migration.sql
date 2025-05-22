/*
  Warnings:

  - The `packingNeeds` column on the `InventoryItem` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "InventoryItem" DROP COLUMN "packingNeeds",
ADD COLUMN     "packingNeeds" JSONB;
