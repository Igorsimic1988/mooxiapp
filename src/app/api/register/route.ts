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

        const invitation = await prisma.invitation.findUnique({
            where: { email },
          });
      
          if (!invitation) {
            return NextResponse.json({ error: "Invalid invite" }, { status: 403 });
          }
        const currentTime = new Date();
        if (invitation.expiresAt && currentTime > invitation.expiresAt) {
            return NextResponse.json({ error: "Invitation expired" }, { status: 403 });
        }

        const newUser = await prisma.user.create({
            data:{
                email,
                password: hashedPassword,
                name,
            },
        });
        await prisma.tenantAccount.create({
            data: {
              role: invitation.role,
              tenantId: invitation.tenantId,
              userId: newUser.id,
            },
          });
      
          await prisma.invitation.delete({
            where: { email },
          });
          //dodati default tenantsettings
        const verificationToken = await generateVerificationToken(email);
        await sendVerificationEmail(email, verificationToken.token);

        return NextResponse.json({ success: "Confirmation email sent!" }, { status: 201 });
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}