import { NextResponse } from "next/server";
import { PrismaClient, Events } from "@prisma/client";
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
                    isVisible: true,
                    address: '',
                    apt: '',
                    city: '',
                    state: '',
                    zipCode: '',
                  },
                  {
                    postStorage: true,
                    isActive: false,
                    isVisible: true,
                    address: '',
                    apt: '',
                    city: '',
                    state: '',
                    zipCode: '',
                  }
                ]
              },
            },
              include: {
                origins: true,
                destinations: true,
              }
  });
  const eventPayloads = [];

if (inObject.leadStatus) {
  eventPayloads.push({
    type: Events.LEAD_STATUS_CHANGED,
    data: {
      leadId: newLead.id,
      field: "leadStatus",
      oldValue: null,
      newValue: inObject.leadStatus,
    },
  });
}

if (inObject.leadActivity) {
  eventPayloads.push({
    type: Events.LEAD_ACTIVITY_CHANGED,
    data: {
      leadId: newLead.id,
      field: "leadActivity",
      oldValue: null,
      newValue: inObject.leadActivity,
    },
  });
}

if (inObject.nextAction) {
  eventPayloads.push({
    type: Events.NEXT_ACTION_CHANGED,
    data: {
      leadId: newLead.id,
      field: "nextAction",
      oldValue: null,
      newValue: inObject.nextAction,
    },
  });
}

await Promise.all(
  eventPayloads.map((event) =>
    prisma.event.create({
      data: event,
    })
  )
);
  
    return NextResponse.json(newLead, { status: 201 });
  } catch (error) {
    console.log(`${error}`)
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
