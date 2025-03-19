import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const brandId = searchParams.get("brandId"); 

    if (!brandId) {
      return NextResponse.json({ error: "brandId is required" }, { status: 400 });
    }

    const furnitureItems = await prisma.furnitureItem.findMany({
      where: { brandId }, 
    }); 

    return NextResponse.json({ furnitureItems });
  } catch (error) {
    console.error("Error fetching furniture items:", error);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
