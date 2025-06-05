import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url); 
    const destinationId = searchParams.get("destinationId");

    if (!destinationId) {
      return NextResponse.json({ error: "destinationId is required" }, { status: 400 });
    }

    const destination = await prisma.destinations.findUnique({
      where: { id: destinationId },
      include: {
        inventoryItems: {
          include: {
            furnitureItem: true,
          },
        },
      },
    });
    if (!destination) {
      return NextResponse.json({ error: "Destination not found" }, { status: 404 });
    }

    return NextResponse.json({  inventoryItems: destination.inventoryItems,
      itemsByRoom: destination.itemsByRoom ?? {},      
      displayedRooms: destination.displayedRooms ?? [], });
  } catch (error) {
    console.error("Error fetching inventory for destination:", error);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
