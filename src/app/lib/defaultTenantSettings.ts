import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function defaultTenantSettings(tenantId: string) {
  let tenantSettings = await prisma.tenantSettings.findUnique({
    where: { tenantId },
  });

  if (!tenantSettings) {
    tenantSettings = await prisma.tenantSettings.create({
      data: { tenantId },
    });
  }

  return tenantSettings;
}
