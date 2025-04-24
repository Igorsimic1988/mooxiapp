import { NextResponse } from "next/server";
import { LoginSchema } from "src/app/schemas";
import { PrismaClient } from '@prisma/client';
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";

const prisma = new PrismaClient();

export async function POST( req: Request) {
    try{
        const body = await req.json();
        const parsedBody = LoginSchema.safeParse(body);
        if (!parsedBody.success){
            return NextResponse.json({ error: "Invalid input data", details: parsedBody.error.errors }, { status: 400 });
        }

        const { email, password } = parsedBody.data;
        const user = await prisma.user.findUnique({
            where: { email },
          });
      
          if (!user || !user.password) {
            return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
          }
      
          // const isValid = await bcrypt.compare(password, user.password);
          // if (!isValid) {
          //   return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
          // }
      
          if (!user.emailVerified) {
            return NextResponse.json({ error: "Email not verified" }, { status: 403 });
          }
      
          const accessToken = jwt.sign(
            { sub: user.id, email: user.email },
            process.env.ACCESS_TOKEN_SECRET!,
            { expiresIn: "30d" }
          );

          const refreshToken = jwt.sign(
            { email },
            process.env.REFRESH_TOKEN_SECRET!,
            { expiresIn: "30d" }
          );
        
          (await cookies()).set("refresh-token", refreshToken, {
            httpOnly: true,
            secure: false,
            maxAge: 30 * 24 * 60 * 60, // 7 dana, pitati je l to ok
            path: "/",
          });
      
          return NextResponse.json({ token: accessToken });
        } catch (error) {
            console.error("Login error:", error); 
            return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
        }
}