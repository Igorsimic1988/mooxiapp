/*
  Warnings:

  - A unique constraint covering the columns `[tenantId]` on the table `TenantAccount` will be added. If there are existing duplicate values, this will fail.
  - Made the column `tenantId` on table `Brand` required. This step will fail if there are existing NULL values in that column.
  - Changed the type of `role` on the `TenantAccount` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "Role" AS ENUM ('ADMIN', 'OWNER', 'SALESMAN', 'SALESMANAGER');

-- AlterTable
ALTER TABLE "Brand" ALTER COLUMN "tenantId" SET NOT NULL;

-- AlterTable
ALTER TABLE "TenantAccount" DROP COLUMN "role",
ADD COLUMN     "role" "Role" NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "TenantAccount_tenantId_key" ON "TenantAccount"("tenantId");
