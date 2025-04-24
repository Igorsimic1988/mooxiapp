import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { validateToken } from "src/app/lib/validateToken";

const prisma = new PrismaClient();

export async function GET(req: Request) {
  try {
    const user = await validateToken(req);
    
    const account = await prisma.tenantAccount.findUnique({
        where: { userId: user.id },
    });
    
    if (!account) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }
    const { searchParams } = new URL(req.url); 
    const id = searchParams.get("id");
    
    if (!id) {
        return NextResponse.json({ error: "ID is required" }, { status: 400 });
    }
    const destination = await prisma.destinations.findUnique({
      where: { id }
    });

    return NextResponse.json({ destination });
  } catch (error) {
    console.error("Error fetching destination:", error);
    return NextResponse.json(
      { error: "Something went wrong while fetching destination" },
      { status: 500 }
    );
  }
}

