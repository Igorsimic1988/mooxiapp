import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { defaultTenantSettings } from "src/app/lib/defaultTenantSettings";

const prisma = new PrismaClient();

export async function PATCH(req: Request) {
  try {
    const { id, name } = await req.json();

    if (!id || !name ) {
      return NextResponse.json({ error: "ID and name are required" }, { status: 400 });
    }

    const existingTenant = await prisma.tenant.findUnique({
      where: { id },
    });

    if (!existingTenant) {
      return NextResponse.json({ error: "Tenant not found" }, { status: 404 });
    }

    const updatedTenant = await prisma.tenant.update({
      where: { id },
      data: { 
        name
      },
    });

    await defaultTenantSettings(updatedTenant.id)

    return NextResponse.json({ success: "Tenant updated!", tenant: updatedTenant });
  } catch (error) {
    console.error("Error updating tenant:", error);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
