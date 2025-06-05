-- DropForeignKey
ALTER TABLE "InventoryItem" DROP CONSTRAINT "InventoryItem_destinationId_fkey";

-- DropForeignKey
ALTER TABLE "InventoryItem" DROP CONSTRAINT "InventoryItem_originId_fkey";

-- AlterTable
ALTER TABLE "InventoryItem" ALTER COLUMN "originId" DROP NOT NULL,
ALTER COLUMN "destinationId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "InventoryItem" ADD CONSTRAINT "InventoryItem_originId_fkey" FOREIGN KEY ("originId") REFERENCES "Origins"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InventoryItem" ADD CONSTRAINT "InventoryItem_destinationId_fkey" FOREIGN KEY ("destinationId") REFERENCES "Destinations"("id") ON DELETE SET NULL ON UPDATE CASCADE;
