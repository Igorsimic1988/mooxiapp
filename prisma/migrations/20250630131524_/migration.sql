-- AlterTable
ALTER TABLE "Lead" ADD COLUMN     "moveInDeliveryWindow" TEXT,
ADD COLUMN     "moveInHourlyRate" INTEGER,
ADD COLUMN     "moveInMaxHours" TEXT,
ADD COLUMN     "moveInMinHours" TEXT,
ADD COLUMN     "moveInMinimumCuft" DOUBLE PRECISION,
ADD COLUMN     "moveInMinimumLbs" INTEGER,
ADD COLUMN     "moveInMovingMin" TEXT,
ADD COLUMN     "moveInNumMovers" INTEGER,
ADD COLUMN     "moveInNumTrucks" INTEGER,
ADD COLUMN     "moveInPickupWindow" TEXT,
ADD COLUMN     "moveInPricePerCuft" DOUBLE PRECISION,
ADD COLUMN     "moveInPricePerLbs" DOUBLE PRECISION,
ADD COLUMN     "moveInTravelTime" TEXT;
