import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function DELETE(req: Request) {
    try {
        const { id } = await req.json();
      await prisma.user.delete({
        where: { id },
      });
  
      return NextResponse.json({ message: "User deleted successfully" });
    } catch (error) {
      console.error("Error deleting user:", error);
      return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
    }
  }
  