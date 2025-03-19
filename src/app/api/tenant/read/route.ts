import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { defaultTenantSettings } from "src/app/lib/defaultTenantSettings";

const prisma = new PrismaClient();

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url); 
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "ID is required" }, { status: 400 });
    }

    const tenant = await prisma.tenant.findUnique({
      where: { id },
      include: {
        users: true,
        brands: true,
        settings: true,
      },
    });

    if (!tenant) {
        return NextResponse.json({ error: "Tenant not found" }, { status: 404 });
    }

    await defaultTenantSettings(tenant.id);

    return NextResponse.json({ tenant });
  } catch (error) {
    console.error("Error fetching tenant:", error);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
