import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function PATCH(req: Request) {
  try {
    const { id, name } = await req.json();

    if (!id || !name ) {
      return NextResponse.json({ error: "ID and name are required" }, { status: 400 });
    }

    const existingBrand = await prisma.brand.findUnique({
      where: { id },
    });

    if (!existingBrand) {
      return NextResponse.json({ error: "Brand not found" }, { status: 404 });
    }

    const updatedBrand = await prisma.brand.update({
      where: { id },
      data: { 
        name
      },
    });

    return NextResponse.json({ success: "Brand updated!", brand: updatedBrand });
  } catch (error) {
    console.error("Error updating brand:", error);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
