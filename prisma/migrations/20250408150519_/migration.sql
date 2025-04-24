/*
  Warnings:

  - You are about to drop the column `destTimeRestrictionOptions` on the `Destinations` table. All the data in the column will be lost.
  - You are about to drop the column `destTimeRestrictionTypes` on the `Destinations` table. All the data in the column will be lost.
  - You are about to drop the column `originTimeRestrictionOptions` on the `Origins` table. All the data in the column will be lost.
  - You are about to drop the column `originTimeRestrictionTypes` on the `Origins` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Destinations" DROP COLUMN "destTimeRestrictionOptions",
DROP COLUMN "destTimeRestrictionTypes",
ADD COLUMN     "destTimeRestriction" BOOLEAN,
ADD COLUMN     "destTimeRestrictionEndTime" TEXT,
ADD COLUMN     "destTimeRestrictionOption" TEXT,
ADD COLUMN     "destTimeRestrictionStartTime" TEXT,
ADD COLUMN     "destTimeRestrictionType" TEXT;

-- AlterTable
ALTER TABLE "Origins" DROP COLUMN "originTimeRestrictionOptions",
DROP COLUMN "originTimeRestrictionTypes",
ADD COLUMN     "originTimeRestriction" BOOLEAN,
ADD COLUMN     "originTimeRestrictionEndTime" TEXT,
ADD COLUMN     "originTimeRestrictionOption" TEXT,
ADD COLUMN     "originTimeRestrictionStartTime" TEXT,
ADD COLUMN     "originTimeRestrictionType" TEXT;
