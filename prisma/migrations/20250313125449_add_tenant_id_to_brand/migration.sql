/*
  Warnings:

  - A unique constraint covering the columns `[brandId]` on the table `BrandSettings` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[tenantId]` on the table `TenantSettings` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `tenantId` to the `Brand` table without a default value. This is not possible if the table is not empty.
  - Added the required column `brandId` to the `BrandSettings` table without a default value. This is not possible if the table is not empty.
  - Added the required column `tenantId` to the `TenantSettings` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Brand" DROP CONSTRAINT "Brand_id_fkey";

-- DropForeignKey
ALTER TABLE "BrandSettings" DROP CONSTRAINT "BrandSettings_id_fkey";

-- DropForeignKey
ALTER TABLE "TenantSettings" DROP CONSTRAINT "TenantSettings_id_fkey";

-- DropIndex
DROP INDEX "TenantAccount_tenantId_key";

-- AlterTable
ALTER TABLE "Brand" ADD COLUMN     "tenantId" TEXT;

-- AlterTable
ALTER TABLE "BrandSettings" ADD COLUMN     "brandId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "TenantSettings" ADD COLUMN     "tenantId" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "BrandSettings_brandId_key" ON "BrandSettings"("brandId");

-- CreateIndex
CREATE UNIQUE INDEX "TenantSettings_tenantId_key" ON "TenantSettings"("tenantId");

-- AddForeignKey
ALTER TABLE "TenantSettings" ADD CONSTRAINT "TenantSettings_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Brand" ADD CONSTRAINT "Brand_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BrandSettings" ADD CONSTRAINT "BrandSettings_brandId_fkey" FOREIGN KEY ("brandId") REFERENCES "Brand"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
