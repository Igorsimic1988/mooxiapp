import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { validateToken } from "src/app/lib/validateToken";


const prisma = new PrismaClient();

export async function POST(req: Request) {
  try {
    const user = await validateToken(req);
        const account = await prisma.tenantAccount.findFirst({
          where: {
            userId: user.id,
            role: { in: ["OWNER", "ADMIN"] },
          },
        });
    //proveriti role
        if (!account){
          return NextResponse.json({ error: "Only OWNERS and ADMINS can create new lead" }, { status: 403 });
        }
        const body = await req.json();

        const {brandId, ...inObject} = body;
        const lastLead = await prisma.lead.findFirst({
          orderBy: { jobNumber: 'desc' }, 
          select: { jobNumber: true },
        });
        const nextJobNumber = (lastLead?.jobNumber ?? 0) + 1;

        const newLead = await prisma.lead.create({
            data: {
              ...inObject,
              jobNumber: nextJobNumber,
              brand: {
                connect: {id: brandId}
              },
              origins: {
                create: [
                  {
                      address: '',
                      apt: '',
                      city: '',
                      state: '',
                      zipCode: '',
                  }
                ],
              },
              destinations: {
                create:  [
                  {
                    postStorage: false,
                    isActive: true,
                    address: '',
                    apt: '',
                    city: '',
                    state: '',
                    zipCode: '',
                  },
                  {
                    postStorage: true,
                    isActive: false,
                    address: '',
                    apt: '',
                    city: '',
                    state: '',
                    zipCode: '',
                  }
                ]
              },
              statusHistory: {
                create: [{
                  leadStatus: inObject.leadStatus || '',
                  leadActivity: inObject.leadActivity || '',
                  nextAction: inObject.nextAction || '',
                }]
              }
            },
              include: {
                origins: true,
                destinations: true,
                statusHistory: true,
              }
  });
  
    return NextResponse.json(newLead, { status: 201 });
  } catch (error) {
    console.log(`${error}`)
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
