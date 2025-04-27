import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { validateToken } from "src/app/lib/validateToken";

const prisma = new PrismaClient();

export async function GET(req: Request) {
  try {
    const user = await validateToken(req);
    
        const account = await prisma.tenantAccount.findUnique({
          where: { userId: user.id },
        });
    
        if (!account) {
          return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
        }
    const leads = await prisma.lead.findMany({
      include: {
        brand: true, 
        inventoryItems: true, 
        origins: true,        
        destinations: true, 
        statusHistory: {
          orderBy:{
            changedAt: 'desc',
          }
        },
      }
    });

    return NextResponse.json({ leads });
  } catch (error) {
    console.error("Error fetching leads:", error);
    return NextResponse.json(
      { error: "Something went wrong while fetching leads" },
      { status: 500 }
    );
  }
}

