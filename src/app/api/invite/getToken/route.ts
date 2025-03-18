// import { NextResponse } from "next/server";
// import { PrismaClient } from "@prisma/client";

// const prisma = new PrismaClient();
// export async function POST(req: Request) {
//     try {
//         const { email } = await req.json();

//         if (!email) {
//             return NextResponse.json({ error: "Email is required" }, { status: 400 });
//         }

//         const invitation = await prisma.invitation.findFirst({
//             where: { email },
//             //orderBy: { createdAt: "desc" } // Ako postoji više, uzimamo najnoviju
//         });

//         if (!invitation) {
//             return NextResponse.json({ error: "No invitation found" }, { status: 404 });
//         }

//         return NextResponse.json({ token: invitation.token }, { status: 200 });

//     } catch (error) {
//         console.error("Error fetching invitation:", error);
//         return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
//     }
// }
