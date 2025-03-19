/*
  Warnings:

  - You are about to drop the column `packing` on the `FurnitureItem` table. All the data in the column will be lost.
  - Added the required column `packingQuantity` to the `FurnitureItem` table without a default value. This is not possible if the table is not empty.
  - Added the required column `packingType` to the `FurnitureItem` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "FurnitureItem" DROP COLUMN "packing",
ADD COLUMN     "packingQuantity" INTEGER NOT NULL,
ADD COLUMN     "packingType" TEXT NOT NULL;
