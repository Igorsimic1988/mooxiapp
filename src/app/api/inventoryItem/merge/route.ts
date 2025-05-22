import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";


const prisma = new PrismaClient();

export async function PATCH(req: Request) {
  try {

    const { fromId, intoId } = await req.json();
    const from = await prisma.inventoryItem.findUnique({ where: { id: fromId } });
    const into = await prisma.inventoryItem.findUnique({ where: { id: intoId } });

    if (!from || !into) {
        return NextResponse.json({ error: 'One or both items not found' }, { status: 404 });
    }
    const mergedCount = from.count  + into.count;

    const [_, updatedInventoryItem] = await prisma.$transaction([
        prisma.inventoryItem.delete({ where: { id: fromId } }),
        prisma.inventoryItem.update({
          where: { id: intoId },
          data: { count: mergedCount },
        }),
      ]);
    

    return NextResponse.json(updatedInventoryItem, { status: 200 });

  } catch (error) {
    console.log(`${error}`)
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
