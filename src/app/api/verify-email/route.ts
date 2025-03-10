import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    const token = searchParams.get("token");

    if (!token) {
        return NextResponse.json({ error: "Token is required" }, { status: 400 });
    }

    const verificationToken = await prisma.verificationToken.findUnique({
        where: { token },
    });

    if (!verificationToken || verificationToken.expires < new Date()) {
        return NextResponse.json({ error: "Invalid or expired token" }, { status: 400 });
    }

    await prisma.user.update({
        where: { email: verificationToken.email! },
        data: { emailVerified: true }, 
    });

    await prisma.verificationToken.delete({
        where: { id: verificationToken.id },
    });

    return NextResponse.json({ success: "Email verified! You can now log in." });
}
