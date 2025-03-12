import { NextResponse } from "next/server";
import { PrismaClient } from '@prisma/client'
import bcrypt from "bcryptjs";
import { getUserByEmail } from "../../../utils/user";

 
const prisma = new PrismaClient();

export async function POST(req: Request){
    try{
        const { token, newPassword } = await req.json();
        const resetToken = await prisma.verificationToken.findUnique({
            where:{token},
        });

        if (!resetToken || resetToken.identifier !== "password-reset" || resetToken.expires < new Date()){
            return NextResponse.json({error: "Invalid or expired token"}, {status: 400});
        }

        const user = await getUserByEmail(resetToken.email!);
        if (!user) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);

        await prisma.user.update({
            where: {id: user.id},
            data: {password: hashedPassword},
        });

        await prisma.verificationToken.delete({
            where: { id: resetToken.id },
        });
        
        return NextResponse.json({ message: "Password reset successful!" });
    }catch(error){
        console.error("Error resetting password:", error);
        return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
    }
}