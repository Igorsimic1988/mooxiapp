-- CreateTable
CREATE TABLE "InventoryItem" (
    "id" TEXT NOT NULL,
    "leadId" TEXT NOT NULL,
    "furnitureItemId" INTEGER NOT NULL,

    CONSTRAINT "InventoryItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Lead" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "companyName" TEXT NOT NULL,
    "jobNumber" INTEGER NOT NULL,
    "creationDateTime" TIMESTAMP(3) NOT NULL,
    "customerName" TEXT NOT NULL,
    "customerPhoneNumber" TEXT NOT NULL,
    "customerEmail" TEXT NOT NULL,
    "rateType" TEXT NOT NULL,
    "serviceType" TEXT NOT NULL,
    "source" TEXT NOT NULL,
    "leadStatus" TEXT NOT NULL,
    "leadActivity" TEXT NOT NULL,
    "nextAction" TEXT NOT NULL,
    "salesName" TEXT NOT NULL,
    "isNew" BOOLEAN NOT NULL,
    "estimator" TEXT,
    "surveyDate" TIMESTAMP(3),
    "surveyTime" TEXT,
    "inventoryOption" TEXT NOT NULL,
    "addStorage" BOOLEAN NOT NULL,
    "timePromised" BOOLEAN NOT NULL,
    "storageItems" TEXT,
    "arrivalTime" TEXT,

    CONSTRAINT "Lead_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "InventoryItem_furnitureItemId_key" ON "InventoryItem"("furnitureItemId");

-- AddForeignKey
ALTER TABLE "InventoryItem" ADD CONSTRAINT "InventoryItem_leadId_fkey" FOREIGN KEY ("leadId") REFERENCES "Lead"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InventoryItem" ADD CONSTRAINT "InventoryItem_furnitureItemId_fkey" FOREIGN KEY ("furnitureItemId") REFERENCES "FurnitureItem"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Lead" ADD CONSTRAINT "Lead_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
