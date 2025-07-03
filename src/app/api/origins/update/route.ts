import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { validateToken } from "src/app/lib/validateToken";

const prisma = new PrismaClient();

export async function PATCH(req: Request) {
  try {
    const body = await req.json();
    const { id, ...updateData } = body;

    if (!id) {
      return NextResponse.json({ error: "Origin ID is required" }, { status: 400 });
    }

    const user = await validateToken(req);

    const account = await prisma.tenantAccount.findFirst({
      where: {
        userId: user.id,
        role: { in: ["OWNER", "ADMIN"] },
      },
    });

    if (!account) {
      return NextResponse.json({ error: "Only OWNER and ADMIN can update origins" }, { status: 403 });
    }

    const existingOrigin = await prisma.origins.findUnique({ 
      where: { id: id } 
    });

    if (!existingOrigin) {
      return NextResponse.json({ error: "Origin not found" }, { status: 404 });
    }

    // Only update the fields that were sent, don't merge with existing data
    const updatedOrigins = await prisma.origins.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json({ success: true, origins: updatedOrigins });
  } catch (error) {
    console.log(`${error}`)
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}