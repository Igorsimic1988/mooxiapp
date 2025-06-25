import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import type { InventoryItemInput } from "src/app/services/types";

const prisma = new PrismaClient();

export async function PATCH(req: Request) {
  try {
    const body = await req.json();
    const { stopId, stopType, updatedInventoryItems } = body;

    if (!stopId || !stopType || !Array.isArray(updatedInventoryItems)) {
        return NextResponse.json({ error: "Missing or invalid data" }, { status: 400 });
      }

      const updatePromises = updatedInventoryItems.map(async (item: Partial<InventoryItemInput>) => {
        const whereClause = { id: item.id };
  
        const dataToUpdate = {
          tags: item.tags,
          groupingKey: item.groupingKey,
        };
  
        return prisma.inventoryItem.update({
          where: whereClause,
          data: dataToUpdate,
        });
      });
  
      const results = await Promise.all(updatePromises);

      const groupedByRoom = updatedInventoryItems.reduce((acc, item) => {
        if (!item.roomId) return acc;
        if (!acc[item.roomId]) acc[item.roomId] = [];
        acc[item.roomId].push(item);
        return acc;
      }, {} as Record<number, any[]>);
  
      if (stopType === 'origin') {
        await prisma.origins.update({
          where: { id: stopId },
          data: {
            itemsByRoom: groupedByRoom,
          },
        });
      } else {
        await prisma.destinations.update({
          where: { id: stopId },
          data: {
            itemsByRoom: groupedByRoom,
          },
        });
      }

    return NextResponse.json({ success: true, updatedItems: results });
  } catch (error) {
    console.log(`${error}`)
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}