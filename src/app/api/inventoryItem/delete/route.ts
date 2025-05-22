import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function DELETE(req: Request) {
  try {
    const { id } = await req.json();

    const item = await prisma.inventoryItem.findUnique({ where: { id } });

    if (!item) {
      return NextResponse.json({ error: "Item not found" }, { status: 404 });
    }

    if (item.count > 1) {
      const updatedItem = await prisma.inventoryItem.update({
        where: { id },
        data: {
          count: { decrement: 1 },
        },
      });

      return NextResponse.json(
        { item: updatedItem, message: "Count decremented" },
        { status: 200 }
      );
    }

    await prisma.inventoryItem.delete({ where: { id } });

    return NextResponse.json(
      { item: null, message: "InventoryItem deleted" },
      { status: 200 }
    );
  } catch (error) {
    console.log(`${error}`);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
