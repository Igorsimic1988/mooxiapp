import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function PATCH(req: Request) {
    try {
      const { id, name, lastName, password } = await req.json();

      if (!id ) {
        return NextResponse.json({ error: "ID is required" }, { status: 400 });
      }
  
      const existingUser = await prisma.user.findUnique({
        where: { id },
      });
  
      if (!existingUser) {
        return NextResponse.json({ error: "User not found" }, { status: 404 });
      }
  
      const updatedUser = await prisma.user.update({
        where: { id },
        data: {
          ...(name && { name }),
          ...(lastName && { lastName }),
          ...(password && { password }), 
        },
      });
  
      return NextResponse.json(updatedUser);
    } catch (error) {
      console.error("Error updating user:", error);
      return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
    }
  }
  