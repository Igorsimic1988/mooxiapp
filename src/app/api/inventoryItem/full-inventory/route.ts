import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";


const prisma = new PrismaClient();


export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { stopId, stopType, displayedRooms, itemsByRoom, inventoryItems, autoBoxEnabled } = body;

    if (!stopId || !stopType) {
      return NextResponse.json({ error: "Stop ID and stopType are required" }, { status: 400 });
    }

    if (stopType === 'origin') {
      const originExists = await prisma.origins.findUnique({ where: { id: stopId } });
      if (!originExists) {
        return NextResponse.json({ error: "Origin stop not found" }, { status: 404 });
      }
    
      await prisma.origins.update({
        where: { id: stopId },
        data: {
          displayedRooms,
          itemsByRoom,
          autoBoxEnabled,
        },
      });
    } else {
      const destinationExists = await prisma.destinations.findUnique({ where: { id: stopId } });
      if (!destinationExists) {
        return NextResponse.json({ error: "Destination stop not found" }, { status: 404 });
      }
      await prisma.destinations.update({
        where: { id: stopId },
        data: {
          displayedRooms,
          itemsByRoom,
          autoBoxEnabled,
        },
      });
    }

    for (const item of inventoryItems) {
      const { id, furnitureItemId, destinationId, originId, ...rest } = item;
      

      const relationField = stopType === 'origin' ? 'origins' : 'destinations';

      const baseData = {
        ...rest,
        [relationField]: {
          connect: { id: stopId },
        },
        furnitureItem: {
          connect: { id: furnitureItemId },
        },
      };

      if (id) {
        const updateData = {
          ...baseData,
          [stopType === 'origin' ? 'destinations' : 'origins']: {
            disconnect: true,
          },
        };

        await prisma.inventoryItem.update({
          where: { id },
          data: updateData,
        });
      } else {
        await prisma.inventoryItem.create({
          data: baseData,
        });
      }
    }
  

    return NextResponse.json({ success: true });
  } catch (error) {
    console.log(`${error}`)
    return NextResponse.json({ error: "Something went wrong during inventory sync" }, { status: 500 });
  }
}
