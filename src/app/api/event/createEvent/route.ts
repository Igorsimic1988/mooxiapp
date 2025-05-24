import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { validateToken } from "src/app/lib/validateToken";

const prisma = new PrismaClient();

export async function POST(req: Request) {
  try {
    const user = await validateToken(req);

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const {type, data} = await req.json();


    const newEvent = await prisma.event.create({
      data: {
        type,
        data,
      },
    });

    return NextResponse.json(newEvent, { status: 201 });

  } catch (error) {
      console.log(`${error}`)
      return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
