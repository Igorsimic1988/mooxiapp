/*
  Warnings:

  - You are about to drop the column `itemsToBeTakenApart` on the `Destinations` table. All the data in the column will be lost.
  - You are about to drop the column `packingOption` on the `Destinations` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Destinations" DROP COLUMN "itemsToBeTakenApart",
DROP COLUMN "packingOption",
ADD COLUMN     "itemsToBeAssembled" BOOLEAN,
ADD COLUMN     "unpackingOption" TEXT;
