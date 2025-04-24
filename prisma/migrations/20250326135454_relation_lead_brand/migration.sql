/*
  Warnings:

  - You are about to drop the column `tenantId` on the `Lead` table. All the data in the column will be lost.
  - Added the required column `brandId` to the `Lead` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Lead" DROP CONSTRAINT "Lead_tenantId_fkey";

-- AlterTable
ALTER TABLE "Lead" DROP COLUMN "tenantId",
ADD COLUMN     "brandId" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "Lead" ADD CONSTRAINT "Lead_brandId_fkey" FOREIGN KEY ("brandId") REFERENCES "Brand"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
