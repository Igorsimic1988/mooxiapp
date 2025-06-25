-- AlterTable
ALTER TABLE "Destinations" ALTER COLUMN "craneNeeded" SET DEFAULT false,
ALTER COLUMN "hoistItems" SET DEFAULT false,
ALTER COLUMN "itemsToBeAssembled" SET DEFAULT false;

-- AlterTable
ALTER TABLE "Origins" ALTER COLUMN "craneNeeded" SET DEFAULT false,
ALTER COLUMN "hoistItems" SET DEFAULT false,
ALTER COLUMN "itemsToBeTakenApart" SET DEFAULT false;
