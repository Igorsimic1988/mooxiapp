import { NextResponse } from "next/server";
import  jwt, { JwtPayload }  from "jsonwebtoken";
import { cookies } from "next/headers";

export async function GET(){
    try{
        const refreshToken = (await cookies()).get("refresh-token")?.value;
        if (!refreshToken){
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET!) as JwtPayload;

        const newAccessToken = jwt.sign(
            { sub: decoded.sub, email: decoded.email },
            process.env.ACCESS_TOKEN_SECRET!,
            {expiresIn: "1h"}
        );

        return NextResponse.json({ accessToken: newAccessToken });
    }catch (error){
        console.log(error)
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
}