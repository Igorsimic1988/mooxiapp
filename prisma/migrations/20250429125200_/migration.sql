/*
  Warnings:

  - You are about to drop the column `inventoryItemId` on the `FurnitureItem` table. All the data in the column will be lost.
  - Added the required column `furnitureItemId` to the `InventoryItem` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "FurnitureItem" DROP CONSTRAINT "FurnitureItem_inventoryItemId_fkey";

-- AlterTable
ALTER TABLE "FurnitureItem" DROP COLUMN "inventoryItemId";

-- AlterTable
ALTER TABLE "InventoryItem" ADD COLUMN     "cuft" INTEGER,
ADD COLUMN     "furnitureItemId" INTEGER NOT NULL,
ADD COLUMN     "lbs" INTEGER,
ADD COLUMN     "tags" TEXT[];

-- AddForeignKey
ALTER TABLE "InventoryItem" ADD CONSTRAINT "InventoryItem_furnitureItemId_fkey" FOREIGN KEY ("furnitureItemId") REFERENCES "FurnitureItem"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
