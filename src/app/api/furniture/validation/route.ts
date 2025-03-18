import { NextResponse } from "next/server";
import { FurnitureSchema } from "src/app/schemas";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsedBody = FurnitureSchema.safeParse(body);
    
    if (!parsedBody.success) {
      return NextResponse.json({ error: "Invalid data", details: parsedBody.error.errors }, { status: 400 });
    }

    return NextResponse.json("Valid data");
  } catch (error) {
    console.error("Error creating furniture item:", error);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
