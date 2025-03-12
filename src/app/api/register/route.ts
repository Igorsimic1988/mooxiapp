import { NextResponse } from "next/server";
import { PrismaClient } from '@prisma/client'
import bcrypt from "bcryptjs";
import { generateVerificationToken } from "src/app/lib/token";
import { sendVerificationEmail } from "src/app/lib/resend";
import { RegisterSchema } from "src/app/schemas";
import { getUserByEmail } from "../../utils/user";

 
const prisma = new PrismaClient();

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const parsedBody = RegisterSchema.safeParse(body);

        if (!parsedBody.success){
            return NextResponse.json({ error: "Invalid input", details: parsedBody.error.errors }, { status: 400 });
        }

        const {email, name, password} = parsedBody.data;
        const hashedPassword = await bcrypt.hash(password, 10);
        const existingUser = await getUserByEmail(email);

        if (existingUser) {
            return NextResponse.json({ error: "User already exists" }, { status: 400 });
        }

        await prisma.user.create({
            data:{
                email,
                password: hashedPassword,
                name,
                emailVerified: false, //proveriti
            },
        });

        const verificationToken = await generateVerificationToken(email);
        await sendVerificationEmail(email, verificationToken.token);

        return NextResponse.json({ success: "Confirmation email sent!" }, { status: 201 });
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}