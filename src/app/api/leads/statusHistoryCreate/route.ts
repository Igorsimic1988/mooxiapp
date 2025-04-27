import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { validateToken } from "src/app/lib/validateToken";

const prisma = new PrismaClient();

export async function POST(req: Request) {
  try {
    const user = await validateToken(req);

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const body = await req.json();

    const { leadId, leadStatus, leadActivity, nextAction } = body;

    if (!leadId) {
      return NextResponse.json({ error: "Missing leadId" }, { status: 400 });
    }

    const newStatus = await prisma.statusHistory.create({
      data: {
        leadId,
        leadStatus: leadStatus || "",
        leadActivity: leadActivity || "",
        nextAction: nextAction || "",
      },
    });

    return NextResponse.json(newStatus, { status: 201 });

  } catch (error) {
    console.error("Error creating status history:", error);
    return NextResponse.json(
      { error: "Something went wrong while creating status history" },
      { status: 500 }
    );
  }
}
