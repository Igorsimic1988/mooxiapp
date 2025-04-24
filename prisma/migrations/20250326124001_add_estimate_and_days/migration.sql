-- CreateTable
CREATE TABLE "Estimate" (
    "id" TEXT NOT NULL,
    "leadId" TEXT NOT NULL,
    "rateType" TEXT NOT NULL,
    "deposit" TEXT NOT NULL,
    "quote" TEXT NOT NULL,
    "fuelSurcharge" TEXT NOT NULL,
    "valuation" TEXT NOT NULL,
    "packing" TEXT NOT NULL,
    "additionalServices" TEXT NOT NULL,
    "discount" TEXT NOT NULL,
    "grandTotal" TEXT NOT NULL,
    "payment" TEXT NOT NULL,
    "balanceDue" TEXT NOT NULL,

    CONSTRAINT "Estimate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MovingDay" (
    "id" TEXT NOT NULL,
    "leadId" TEXT NOT NULL,
    "rateType" TEXT NOT NULL,
    "numTrucks" TEXT NOT NULL,
    "numMovers" TEXT NOT NULL,
    "hourlyRate" TEXT NOT NULL,
    "volume" TEXT NOT NULL,
    "weight" TEXT NOT NULL,
    "pricePerCuft" TEXT NOT NULL,
    "pricePerLbs" TEXT NOT NULL,
    "travelTime" TEXT NOT NULL,
    "movingMin" TEXT NOT NULL,
    "minimumCuft" TEXT NOT NULL,
    "minimumLbs" TEXT NOT NULL,
    "pickupWindow" TEXT NOT NULL,
    "earliestDeliveryDate" TEXT NOT NULL,
    "deliveryWindow" TEXT NOT NULL,
    "minHours" TEXT NOT NULL,
    "maxHours" TEXT NOT NULL,

    CONSTRAINT "MovingDay_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PackingDay" (
    "id" TEXT NOT NULL,
    "leadId" TEXT NOT NULL,
    "numPackers" TEXT NOT NULL,
    "packingHourlyRate" TEXT NOT NULL,
    "packingTravelTime" TEXT NOT NULL,
    "packingMinimum" TEXT NOT NULL,
    "packingMinHours" TEXT NOT NULL,
    "packingMaxHours" TEXT NOT NULL,

    CONSTRAINT "PackingDay_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Estimate_leadId_key" ON "Estimate"("leadId");

-- CreateIndex
CREATE UNIQUE INDEX "MovingDay_leadId_key" ON "MovingDay"("leadId");

-- CreateIndex
CREATE UNIQUE INDEX "PackingDay_leadId_key" ON "PackingDay"("leadId");

-- AddForeignKey
ALTER TABLE "Estimate" ADD CONSTRAINT "Estimate_leadId_fkey" FOREIGN KEY ("leadId") REFERENCES "Lead"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MovingDay" ADD CONSTRAINT "MovingDay_leadId_fkey" FOREIGN KEY ("leadId") REFERENCES "Lead"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PackingDay" ADD CONSTRAINT "PackingDay_leadId_fkey" FOREIGN KEY ("leadId") REFERENCES "Lead"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
