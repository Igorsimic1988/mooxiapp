import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { validateToken } from "src/app/lib/validateToken";


const prisma = new PrismaClient();

export async function POST(req: Request) {
  try {
    const user = await validateToken(req);
        const account = await prisma.tenantAccount.findFirst({
          where: {
            userId: user.id,
            role: { in: ["OWNER", "ADMIN"] },
          },
        });
    //proveriti role
        if (!account){
          return NextResponse.json({ error: "Only OWNERS and ADMINS can create new destination" }, { status: 404 });
        }
        const { body, leadId } = await req.json();
        const newDestination = await prisma.destinations.create({
            data: { ...body ,
            lead: {
                connect: {id: leadId}
              },
            },
        });
    return NextResponse.json(newDestination, { status: 201 });
  } catch (error) {
    console.log(`${error}`)
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
