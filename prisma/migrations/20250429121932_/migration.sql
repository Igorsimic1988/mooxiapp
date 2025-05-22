/*
  Warnings:

  - You are about to drop the column `furnitureItemId` on the `InventoryItem` table. All the data in the column will be lost.
  - You are about to drop the column `leadId` on the `InventoryItem` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[originId]` on the table `InventoryItem` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `inventoryItemId` to the `FurnitureItem` table without a default value. This is not possible if the table is not empty.
  - Added the required column `notes` to the `FurnitureItem` table without a default value. This is not possible if the table is not empty.
  - Added the required column `autoAdded` to the `InventoryItem` table without a default value. This is not possible if the table is not empty.
  - Added the required column `cameraImages` to the `InventoryItem` table without a default value. This is not possible if the table is not empty.
  - Added the required column `groupingKey` to the `InventoryItem` table without a default value. This is not possible if the table is not empty.
  - Added the required column `link` to the `InventoryItem` table without a default value. This is not possible if the table is not empty.
  - Added the required column `originId` to the `InventoryItem` table without a default value. This is not possible if the table is not empty.
  - Added the required column `roomId` to the `InventoryItem` table without a default value. This is not possible if the table is not empty.
  - Added the required column `uploadedImages` to the `InventoryItem` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "InventoryItem" DROP CONSTRAINT "InventoryItem_furnitureItemId_fkey";

-- DropForeignKey
ALTER TABLE "InventoryItem" DROP CONSTRAINT "InventoryItem_leadId_fkey";

-- DropIndex
DROP INDEX "InventoryItem_furnitureItemId_key";

-- AlterTable
ALTER TABLE "FurnitureItem" ADD COLUMN     "inventoryItemId" TEXT NOT NULL,
ADD COLUMN     "notes" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "InventoryItem" DROP COLUMN "furnitureItemId",
DROP COLUMN "leadId",
ADD COLUMN     "autoAdded" BOOLEAN NOT NULL,
ADD COLUMN     "cameraImages" TEXT NOT NULL,
ADD COLUMN     "displayedRooms" INTEGER[],
ADD COLUMN     "groupingKey" TEXT NOT NULL,
ADD COLUMN     "link" TEXT NOT NULL,
ADD COLUMN     "originId" TEXT NOT NULL,
ADD COLUMN     "packingNeeds" TEXT[],
ADD COLUMN     "roomId" INTEGER NOT NULL,
ADD COLUMN     "uploadedImages" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "InventoryItem_originId_key" ON "InventoryItem"("originId");

-- AddForeignKey
ALTER TABLE "InventoryItem" ADD CONSTRAINT "InventoryItem_originId_fkey" FOREIGN KEY ("originId") REFERENCES "Origins"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FurnitureItem" ADD CONSTRAINT "FurnitureItem_inventoryItemId_fkey" FOREIGN KEY ("inventoryItemId") REFERENCES "InventoryItem"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
