import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { validateToken } from "src/app/lib/validateToken";


const prisma = new PrismaClient();

export async function POST(req: Request) {
  try {
    const user = await validateToken(req);

    const account = await prisma.tenantAccount.findFirst({
      where: {
        userId: user.id,
      },
    });

    if (!account) {
      return NextResponse.json({ error: "Only login account can create inventory items" }, { status: 403 });
    }

    const body = await req.json();


    const { originId, furnitureItemId, groupingKey, ...rest } = body;
    const existingItem = await prisma.inventoryItem.findFirst({
      where: {
        originId: originId,
        groupingKey: groupingKey,
      },
    });
    

     
    if (existingItem) {
      const updatedItem = await prisma.inventoryItem.update({
        where: { id: existingItem.id },
        data: {
          count: { increment: 1 },
        },
      });

      return NextResponse.json(updatedItem, { status: 200 });
    }

const newInventoryItem = await prisma.inventoryItem.create({
  data: {
    ...rest,
    groupingKey,
    origins: {
      connect: { id: originId },
    },
    furnitureItem: {
      connect: { id: furnitureItemId },
    },
  },
});

    return NextResponse.json(newInventoryItem, { status: 201 });
  } catch (error) {
    console.log(`${error}`)
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
