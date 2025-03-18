/*
  Warnings:

  - You are about to drop the column `tenantId` on the `FurnitureItem` table. All the data in the column will be lost.
  - Added the required column `brandId` to the `FurnitureItem` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "FurnitureItem" DROP CONSTRAINT "FurnitureItem_tenantId_fkey";

-- AlterTable
ALTER TABLE "FurnitureItem" DROP COLUMN "tenantId",
ADD COLUMN     "brandId" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "FurnitureItem" ADD CONSTRAINT "FurnitureItem_brandId_fkey" FOREIGN KEY ("brandId") REFERENCES "Brand"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
