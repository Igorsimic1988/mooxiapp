import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { validateToken } from "src/app/lib/validateToken";
import type { Destinations } from "@prisma/client";

const prisma = new PrismaClient();

export async function PATCH(req: Request) {
  try {
    const body = await req.json();
    const { id, ...updateData } = body;

    if (!id) {
      return NextResponse.json({ error: "Destination ID is required" }, { status: 400 });
    }

    const user = await validateToken(req);

    const account = await prisma.tenantAccount.findFirst({
      where: {
        userId: user.id,
        role: { in: ["OWNER", "ADMIN"] },
      },
    });

    if (!account) {
      return NextResponse.json({ error: "Only OWNER and ADMIN can update destinations" }, { status: 403 });
    }

    const existingDestination = await prisma.destinations.findUnique({ 
      where: { id: id } 
    }) as Destinations;

    if (!existingDestination) {
      return NextResponse.json({ error: "Destination not found" }, { status: 404 });
    }

    const mergedData: Partial <Destinations> = {};
    for (const key in existingDestination) {
      if (key === "id") continue;
      mergedData[key as keyof Destinations] =
        updateData[key as keyof typeof updateData] !== undefined
          ? updateData[key as keyof typeof updateData]
          : existingDestination[key as keyof Destinations];
    }
    const updatedDestinations = await prisma.destinations.update({
      where: { id },
      data: mergedData,
    });

    return NextResponse.json({ success: true, destinations: updatedDestinations });
  } catch (error) {
    console.log(`${error}`)
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
