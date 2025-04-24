import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { validateToken } from "src/app/lib/validateToken";
import type { Lead } from "@prisma/client";

const prisma = new PrismaClient();

export async function PATCH(req: Request) {
  try {
    const body = await req.json();
    const { id, ...updateData } = body;

    if (!id) {
      return NextResponse.json({ error: "Lead ID is required" }, { status: 400 });
    }

    const user = await validateToken(req);

    const account = await prisma.tenantAccount.findFirst({
      where: {
        userId: user.id,
        role: { in: ["OWNER", "ADMIN"] },
      },
    });

    if (!account) {
      return NextResponse.json({ error: "Only OWNER and ADMIN can update leads" }, { status: 403 });
    }

    const existingLead = await prisma.lead.findUnique({ 
      where: { id: id } 
    }) as Lead;

    if (!existingLead) {
      return NextResponse.json({ error: "Lead not found" }, { status: 404 });
    }

    const mergedData: Partial <Lead> = {};
    for (const key in existingLead) {
      if (key === "id") continue;
      mergedData[key as keyof Lead] =
        updateData[key as keyof typeof updateData] !== undefined
          ? updateData[key as keyof typeof updateData]
          : existingLead[key as keyof Lead];
    }
    const updatedLead = await prisma.lead.update({
      where: { id },
      data: mergedData,
    });

    return NextResponse.json({ success: true, lead: updatedLead });
  } catch (error) {
    console.log(`${error}`)
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
