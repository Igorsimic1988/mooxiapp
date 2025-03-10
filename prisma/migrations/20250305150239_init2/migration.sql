-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_TenantAccount" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "role" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    CONSTRAINT "TenantAccount_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "TenantAccount_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_TenantAccount" ("id", "role", "tenantId", "userId") SELECT "id", "role", "tenantId", "userId" FROM "TenantAccount";
DROP TABLE "TenantAccount";
ALTER TABLE "new_TenantAccount" RENAME TO "TenantAccount";
CREATE UNIQUE INDEX "TenantAccount_tenantId_key" ON "TenantAccount"("tenantId");
CREATE UNIQUE INDEX "TenantAccount_userId_key" ON "TenantAccount"("userId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
