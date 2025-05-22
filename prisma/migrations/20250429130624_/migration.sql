/*
  Warnings:

  - You are about to drop the column `notes` on the `FurnitureItem` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "FurnitureItem" DROP COLUMN "notes";

-- AlterTable
ALTER TABLE "InventoryItem" ADD COLUMN     "notes" TEXT,
ALTER COLUMN "cameraImages" DROP NOT NULL,
ALTER COLUMN "displayedRooms" SET DEFAULT ARRAY[]::INTEGER[],
ALTER COLUMN "groupingKey" DROP NOT NULL,
ALTER COLUMN "link" DROP NOT NULL,
ALTER COLUMN "packingNeeds" SET DEFAULT ARRAY[]::TEXT[],
ALTER COLUMN "roomId" DROP NOT NULL,
ALTER COLUMN "uploadedImages" DROP NOT NULL;
