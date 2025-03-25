import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { validateToken } from "src/app/lib/validateToken";

const prisma = new PrismaClient();

export async function DELETE(req: Request) {
  try {
    const { id } = await req.json();
    const user = await validateToken(req);
    const account = await prisma.tenantAccount.findFirst({
      where: {
        userId: user.id,
        role: { in: ["OWNER", "ADMIN"] },
      },
    });
    
    if (!account){
      return NextResponse.json({ error: "Only OWNERS and ADMINS can delete brand" }, { status: 404 });
    }

    await prisma.brand.delete({
        where: { id },
    })

    return NextResponse.json({ message: "User deleted successfully" });
  } catch (error) {
    console.error("Error deleting brand:", error);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
