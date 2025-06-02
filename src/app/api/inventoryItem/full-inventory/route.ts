import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";


const prisma = new PrismaClient();

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { originId, displayedRooms, itemsByRoom, inventoryItems } = body;

    if (!originId) {
      return NextResponse.json({ error: "Origin ID is required" }, { status: 400 });
    }

    await prisma.origins.update({
      where: { id: originId },
      data: {
        displayedRooms,
        itemsByRoom,
      },
    });

    for (const item of inventoryItems) {
        const { id, originId: itemOriginId, furnitureItemId, ...rest } = item;
  
        const baseData = {
          ...rest,
          origins: {
            connect: { id: itemOriginId }, 
          },
          furnitureItem: {
            connect: { id: furnitureItemId },
          },
        };
  
        if (id) {
          await prisma.inventoryItem.update({
            where: { id },
            data: baseData,
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
