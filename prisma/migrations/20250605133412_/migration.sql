-- AlterTable
ALTER TABLE "Destinations" ADD COLUMN     "autoBoxEnabled" BOOLEAN NOT NULL DEFAULT true;

-- AlterTable
ALTER TABLE "Origins" ADD COLUMN     "autoBoxEnabled" BOOLEAN NOT NULL DEFAULT true;
