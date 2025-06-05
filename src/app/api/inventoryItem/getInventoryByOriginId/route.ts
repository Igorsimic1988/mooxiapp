import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url); 
    const originId = searchParams.get("originId");

    if (!originId) {
      return NextResponse.json({ error: "originId is required" }, { status: 400 });
    }

    const origin = await prisma.origins.findUnique({
      where: { id: originId },
      include: {
        inventoryItems: {
          include: {
            furnitureItem: true,
          },
        },
      },
    });
    if (!origin) {
      return NextResponse.json({ error: "Origin not found" }, { status: 404 });
    }

    return NextResponse.json({  inventoryItems: origin.inventoryItems,
      itemsByRoom: origin.itemsByRoom ?? {},      // Ovo mora postojati u modelu!
      displayedRooms: origin.displayedRooms ?? [], });
  } catch (error) {
    console.error("Error fetching inventory for origin:", error);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
