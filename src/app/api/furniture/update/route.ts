import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { validateToken } from "src/app/lib/validateToken";

const prisma = new PrismaClient();

export async function PATCH(req: Request) {
  try {
    const { id, lbs, cuft } = await req.json();
    const user = await validateToken(req);

    const account = await prisma.tenantAccount.findFirst({
      where: {
        userId: user.id,
        role: { in: ["OWNER", "ADMIN"] },
      },
    });
    
    if (!account){
      return NextResponse.json({ error: "Only OWNERS and ADMINS can update items" }, { status: 404 });
    }
    

    if (!id ) {
      return NextResponse.json({ error: "ID is required" }, { status: 400 });
    }

    const existingItem = await prisma.furnitureItem.findUnique({
      where: { id },
    });
    if (!existingItem) {
      return NextResponse.json({ error: "Item not found" }, { status: 404 });
    }

    const updatedItem = await prisma.furnitureItem.update({
      where: { id },
      data: { 
        lbs: lbs !== undefined ? lbs : existingItem.lbs,
        cuft: cuft !== undefined ? cuft : existingItem.cuft,
      },
    });

    return NextResponse.json({ success: "Item updated!", item: updatedItem });
  } catch (error) {
    console.error("Error updating item:", error);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
