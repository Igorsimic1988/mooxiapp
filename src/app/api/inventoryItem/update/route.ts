import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import type { InventoryItem } from "@prisma/client";

const prisma = new PrismaClient();

export async function PATCH(req: Request) {
  try {
    const body = await req.json();
    const { id, ...updateData } = body;

    if (!id) {
      return NextResponse.json({ error: "Inventory item ID is required" }, { status: 400 });
    }

    const existingInventoryItem = await prisma.inventoryItem.findUnique({ 
      where: { id: id } 
    }) as InventoryItem;

    if (!existingInventoryItem) {
      return NextResponse.json({ error: "Inventory Item not found" }, { status: 404 });
    }

    const mergedData: Partial <InventoryItem> = {};
    for (const key in existingInventoryItem) {
      if (key === "id") continue;
      mergedData[key as keyof InventoryItem] =
        updateData[key as keyof typeof updateData] !== undefined
          ? updateData[key as keyof typeof updateData]
          : existingInventoryItem[key as keyof InventoryItem];
    }
    console.log('Updating inventoryItem with ID:', id);
console.log('Merged data:', mergedData);

    const updatedInventoryItem = await prisma.inventoryItem.update({
      where: { id },
      data: mergedData,
    });

    return NextResponse.json({ success: true, inventoryItem: updatedInventoryItem });
  } catch (error) {
    console.log(`${error}`)
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
