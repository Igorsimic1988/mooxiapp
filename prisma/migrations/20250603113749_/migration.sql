/*
  Warnings:

  - Added the required column `destinationId` to the `InventoryItem` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Destinations" ADD COLUMN     "displayedRooms" INTEGER[] DEFAULT ARRAY[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13]::INTEGER[],
ADD COLUMN     "itemsByRoom" JSONB DEFAULT '{}';

-- AlterTable
ALTER TABLE "InventoryItem" ADD COLUMN     "destinationId" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "InventoryItem" ADD CONSTRAINT "InventoryItem_destinationId_fkey" FOREIGN KEY ("destinationId") REFERENCES "Destinations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
