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
        const user = await prisma.user.findUnique({
            where: { id },
        });
  
      if (!user) {
        return NextResponse.json({ error: "User not found" }, { status: 404 });
      }
  
      return NextResponse.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
    }
  }
  