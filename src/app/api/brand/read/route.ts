import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url); 
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "ID is required" }, { status: 400 });
    }

    const brand = await prisma.brand.findUnique({
      where: { id },
      include: {
        tenant: true,
        settings: true,
      },
    });

    if (!brand) {
        return NextResponse.json({ error: "Brand not found" }, { status: 404 });
      }

    return NextResponse.json({ brand });
  } catch (error) {
    console.error("Error fetching brand:", error);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
