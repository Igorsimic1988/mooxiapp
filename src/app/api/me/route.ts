import { NextResponse } from "next/server";
import  jwt  from "jsonwebtoken";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(req: Request){
    try {
        const authHeader = req.headers.get("authorization");

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET!) as {email: string};

    if (!decoded.email){
        return NextResponse.json({error: "Invalid token"}, {status: 401});
    }

    const user = await prisma.user.findUnique({
        where: {email: decoded.email},
        select:{
            id: true,
            name: true,
            email: true,
            emailVerified: true,
        },
    });
    if (!user) {
        return NextResponse.json({ error: "User not found" }, { status: 404 });
      }

    return NextResponse.json({ user });
    }catch(error){
        console.log(error)
        return NextResponse.json({error: "Unauthorized"}, {status: 401});
    }
}