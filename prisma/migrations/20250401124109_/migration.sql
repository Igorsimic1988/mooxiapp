/*
  Warnings:

  - You are about to drop the column `rateType` on the `Lead` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Lead" DROP COLUMN "rateType",
ADD COLUMN     "activeDay" TEXT,
ADD COLUMN     "activeOption" TEXT,
ADD COLUMN     "additionalServices" TEXT,
ADD COLUMN     "balanceDue" TEXT,
ADD COLUMN     "deliveryDate" TEXT,
ADD COLUMN     "deliveryWindow" TEXT,
ADD COLUMN     "discount" TEXT,
ADD COLUMN     "earliestDeliveryDate" TEXT,
ADD COLUMN     "estimatePacking" TEXT,
ADD COLUMN     "estimateRateType" TEXT,
ADD COLUMN     "etaRequest" TEXT,
ADD COLUMN     "fuelSurcharge" TEXT,
ADD COLUMN     "grandTotal" TEXT,
ADD COLUMN     "hasInvioce" BOOLEAN,
ADD COLUMN     "hasPackingDay" BOOLEAN,
ADD COLUMN     "hourlyRate" INTEGER,
ADD COLUMN     "logisticsRateType" TEXT,
ADD COLUMN     "maxHours" TEXT,
ADD COLUMN     "minHours" TEXT,
ADD COLUMN     "minimumCuft" DOUBLE PRECISION,
ADD COLUMN     "minimumLbs" INTEGER,
ADD COLUMN     "movingMin" TEXT,
ADD COLUMN     "numMovers" INTEGER,
ADD COLUMN     "numPackers" INTEGER,
ADD COLUMN     "numTrucks" INTEGER,
ADD COLUMN     "packingHourlyRate" INTEGER,
ADD COLUMN     "packingMaxHours" TEXT,
ADD COLUMN     "packingMinHours" TEXT,
ADD COLUMN     "packingMinimum" TEXT,
ADD COLUMN     "packingTravelTime" TEXT,
ADD COLUMN     "payment" TEXT,
ADD COLUMN     "pickupWindow" TEXT,
ADD COLUMN     "pricePerCuft" DOUBLE PRECISION,
ADD COLUMN     "pricePerLbs" DOUBLE PRECISION,
ADD COLUMN     "quote" TEXT,
ADD COLUMN     "travelTime" TEXT,
ADD COLUMN     "valuation" TEXT,
ADD COLUMN     "volume" INTEGER,
ADD COLUMN     "weight" INTEGER;

-- CreateTable
CREATE TABLE "Origins" (
    "id" TEXT NOT NULL,
    "leadId" TEXT NOT NULL,
    "originAddress" TEXT,
    "originApt" TEXT,
    "originCity" TEXT,
    "originState" TEXT,
    "originZipCode" TEXT,
    "originTypeOfPlace" TEXT,
    "originMoveSize" TEXT,
    "originHowManyStories" TEXT,
    "originFeatures" TEXT[],
    "originFurnishingStyle" TEXT,
    "originNeedsCOI" BOOLEAN,
    "originBiggestTruckAccess" TEXT,
    "originShuttleTruckRequired" BOOLEAN,
    "originParkingAccess" TEXT,
    "originDistanceDoorTruck" TEXT,
    "originHowManySteps" TEXT,
    "originTerrainDoorTruck" TEXT,
    "originElevatorAtStop" BOOLEAN,
    "originElevatorExclusive" BOOLEAN,
    "originElevatorFloors" TEXT,
    "originElevatorSize" TEXT,
    "originWhatsMoving" TEXT,
    "originPackingOption" TEXT,
    "originItemsToBeTakenApart" BOOLEAN,
    "originHoistItems" BOOLEAN,
    "originCraneNeeded" BOOLEAN,
    "originBlanketsOption" TEXT,
    "originAdditionalServices" TEXT[],
    "originTimeRestrictionOptions" BOOLEAN,
    "originTimeRestrictionTypes" TEXT,

    CONSTRAINT "Origins_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Destinations" (
    "id" TEXT NOT NULL,
    "leadId" TEXT NOT NULL,
    "destAddress" TEXT,
    "destApt" TEXT,
    "destCity" TEXT,
    "destState" TEXT,
    "destZipCode" TEXT,
    "destTypeOfPlace" TEXT,
    "destMoveSize" TEXT,
    "destHowManyStories" TEXT,
    "destFeatures" TEXT[],
    "destFurnishingStyle" TEXT,
    "destNeedsCOI" BOOLEAN,
    "destBiggestTruckAccess" TEXT,
    "destShuttleTruckRequired" BOOLEAN,
    "destParkingAccess" TEXT,
    "destDistanceDoorTruck" TEXT,
    "destHowManySteps" TEXT,
    "destTerrainDoorTruck" TEXT,
    "destElevatorAtStop" BOOLEAN,
    "destElevatorExclusive" BOOLEAN,
    "destElevatorFloors" TEXT,
    "destElevatorSize" TEXT,
    "destWhatsMoving" TEXT,
    "destPackingOption" TEXT,
    "destItemsToBeTakenApart" BOOLEAN,
    "destHoistItems" BOOLEAN,
    "destCraneNeeded" BOOLEAN,
    "destBlanketsOption" TEXT,
    "destAdditionalServices" TEXT[],
    "destTimeRestrictionOptions" BOOLEAN,
    "destTimeRestrictionTypes" TEXT,

    CONSTRAINT "Destinations_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Origins" ADD CONSTRAINT "Origins_leadId_fkey" FOREIGN KEY ("leadId") REFERENCES "Lead"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Destinations" ADD CONSTRAINT "Destinations_leadId_fkey" FOREIGN KEY ("leadId") REFERENCES "Lead"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
