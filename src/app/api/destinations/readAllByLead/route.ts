import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const leadId = searchParams.get("leadId"); 

    if (!leadId) {
      return NextResponse.json({ error: "leadId is required" }, { status: 400 });
    }

    const destinations = await prisma.destinations.findMany({
      where: { leadId }, 
    }); 

    return NextResponse.json({ destinations });
  } catch (error) {
    console.error("Error fetching origins:", error);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
