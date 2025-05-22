/*
  Warnings:

  - The `cameraImages` column on the `InventoryItem` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `packingNeeds` column on the `InventoryItem` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `uploadedImages` column on the `InventoryItem` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "InventoryItem" DROP COLUMN "cameraImages",
ADD COLUMN     "cameraImages" TEXT[] DEFAULT ARRAY[]::TEXT[],
DROP COLUMN "packingNeeds",
ADD COLUMN     "packingNeeds" JSONB,
DROP COLUMN "uploadedImages",
ADD COLUMN     "uploadedImages" TEXT[] DEFAULT ARRAY[]::TEXT[];
