import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import allItems from "src/app/data/constants/funitureItems";
import { validateToken } from "src/app/lib/validateToken";


const prisma = new PrismaClient();

export async function POST(req: Request) {
  try {
    const user = await validateToken(req);
    const { nameOfBrand } = await req.json();
    const ownerAccount = await prisma.tenantAccount.findFirst({
      where: {
        userId: user.id,
        role: "OWNER",
      },
    });

    if (!ownerAccount){
      return NextResponse.json({ error: "Only OWNERS can create brand" }, { status: 404 });
    }

    const tenantId = ownerAccount.tenantId;


    const existingBrand = await prisma.brand.findFirst({ 
      where: { 
        name: nameOfBrand, 
        tenantId,
       }, 
      });

    if (existingBrand) {
      return NextResponse.json({ error: "Brand already exists" }, { status: 400 });
    }

    const newBrand = await prisma.brand.create({
      data: {
        name: nameOfBrand,
        tenantId
      },
    });

    await prisma.brandSettings.create({
      data: {
        brandId: newBrand.id,
      },
    });


    const furnitureItems = allItems.map((item) => ({
      name: item.name,
      imageName: item.src,
      rooms: item.rooms ?? [], 
      letters: item.letters ?? [], 
      cuft: item.cuft ?? null, 
      lbs: item.lbs ?? null,
      search: item.search ?? null,
      tags: item.tags ?? [],
      packingType: item.packing.length > 0 ? item.packing[0].type : null,
      packingQuantity: item.packing.length > 1 ? item.packing[1].quantity : null,
      brandId: newBrand.id, 
    }));

    await prisma.furnitureItem.createMany({
      data: furnitureItems
    });


    return NextResponse.json(newBrand, { status: 201 });
  } catch (error) {
    console.error("Error creating brand:", error);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
