import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url); 
    const id = Number(searchParams.get("id"));

    if (!id) {
      return NextResponse.json({ error: "ID is required" }, { status: 400 });
    }

    const furnitureItem = await prisma.furnitureItem.findUnique({
      where: { id },
    });

    return NextResponse.json({ furnitureItem });
  } catch (error) {
    console.error("Error fetching furniture items:", error);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
