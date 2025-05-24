import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { validateToken } from "src/app/lib/validateToken";
import { FurnitureSchema } from "src/app/schemas";
import allItems from "src/app/data/constants/funitureItems";


const prisma = new PrismaClient();

export async function POST(req: Request) {
  try {
    const user = await validateToken(req);

    const account = await prisma.tenantAccount.findFirst({
      where: {
        userId: user.id,
      },
    });

    if (!account) {
      return NextResponse.json({ error: "Only login account can create furniture items" }, { status: 403 });
    }

    const body = await req.json();
    const validatedBody = FurnitureSchema.parse(body);

    const { brandId, ...rest } = validatedBody;
    const brand = await prisma.brand.findFirst({
      where: { id: brandId },
    });
    
    if (!brand) {
      return NextResponse.json({ error: "Brand not found" }, { status: 404 });
    }
    const furnitureItems = allItems.map((item) => ({
      name: item.name,
      imageName: item.src,
      rooms: item.rooms ?? [], 
      letters: item.letters ?? [], 
      cuft: item.cuft ?? null, 
      lbs: item.lbs ?? null,
      search: item.search === "Y" ? true : item.search === "N" ? false : null,
      tags: item.tags ?? [],
      packingType: item.packing.length > 0 ? item.packing[0].type : null,
      packingQuantity: item.packing.length > 1 ? item.packing[1].quantity : null,
      brandId: brand.id, 
    }));

    await prisma.furnitureItem.createMany({
      data: furnitureItems
    });

    return NextResponse.json(furnitureItems, { status: 201 });
  } catch (error) {
    console.log(`${error}`)
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
