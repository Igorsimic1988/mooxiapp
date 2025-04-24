import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { validateToken } from "src/app/lib/validateToken";
import type { Origins } from "@prisma/client";

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
    }) as Origins;

    if (!existingOrigin) {
      return NextResponse.json({ error: "Origin not found" }, { status: 404 });
    }

    const mergedData: Partial <Origins> = {};
    for (const key in existingOrigin) {
      if (key === "id") continue;
      mergedData[key as keyof Origins] =
        updateData[key as keyof typeof updateData] !== undefined
          ? updateData[key as keyof typeof updateData]
          : existingOrigin[key as keyof Origins];
    }
    const updatedOrigins = await prisma.origins.update({
      where: { id },
      data: mergedData,
    });

    return NextResponse.json({ success: true, origins: updatedOrigins });
  } catch (error) {
    console.log(`${error}`)
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
