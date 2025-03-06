import { NextResponse } from "next/server";
import { generateResetToken } from "src/app/lib/token";
import { sendResetEmail } from "src/app/lib/resend";
import { getUserByEmail } from "../../../utils/user";

 

export async function POST(req: Request){
    try{
        const { email } = await req.json();
        const existingUser = await getUserByEmail(email);
        
        if (!existingUser) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }
        const resetToken = await generateResetToken(email);

        await sendResetEmail(email, resetToken.token);
        return NextResponse.json({message:"Password reset link sent to email"});
    }catch(error){
        console.error("Error in password reset request:", error);
        return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
    }
}