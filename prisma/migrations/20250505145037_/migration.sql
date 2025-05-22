-- AlterTable
ALTER TABLE "InventoryItem" ADD COLUMN     "imageName" TEXT,
ADD COLUMN     "letters" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "name" TEXT,
ADD COLUMN     "search" TEXT,
ALTER COLUMN "autoAdded" SET DEFAULT false;

-- AlterTable
ALTER TABLE "Origins" ADD COLUMN     "displayedRooms" INTEGER[] DEFAULT ARRAY[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13]::INTEGER[],
ADD COLUMN     "itemsByRoom" JSONB DEFAULT '{}';
