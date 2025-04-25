/*
  Warnings:

  - A unique constraint covering the columns `[jobNumber]` on the table `Lead` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Lead_jobNumber_key" ON "Lead"("jobNumber");
