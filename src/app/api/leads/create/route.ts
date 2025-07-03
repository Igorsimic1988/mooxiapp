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
    if (!account) {
      return NextResponse.json({ error: "Only OWNERS and ADMINS can create new lead" }, { status: 403 });
    }
    
    const body = await req.json();

    // Extract place-related fields that belong to Origins
    const {
      brandId,
      typeOfPlace,
      moveSize,
      howManyStories,
      features,
      ...leadData // Everything else goes to Lead
    } = body;

    // Get the next job number
    const lastLead = await prisma.lead.findFirst({
      orderBy: { jobNumber: 'desc' },
      select: { jobNumber: true },
    });
    const nextJobNumber = (lastLead?.jobNumber ?? 0) + 1;

    // Create the lead with origins
    const newLead = await prisma.lead.create({
      data: {
        ...leadData,
        jobNumber: nextJobNumber,
        brand: {
          connect: { id: brandId }
        },
        origins: {
          create: [
            {
              address: '',
              apt: '',
              city: '',
              state: '',
              zipCode: body.fromZip || '',
              // Add the place-related fields here
              typeOfPlace: typeOfPlace || '',
              moveSize: moveSize || '',
              howManyStories: howManyStories || '',
              features: features || [],
              // Set default values for required fields
              isActive: true,
              isVisible: true,
            }
          ],
        },
        destinations: {
          create: [
            {
              postStorage: false,
              isActive: true,
              isVisible: true,
              address: '',
              apt: '',
              city: '',
              state: '',
              zipCode: body.toZip || '',
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

    // Create events for status changes
    const eventPayloads = [];

    if (leadData.leadStatus) {
      eventPayloads.push({
        type: Events.LEAD_STATUS_CHANGED,
        data: {
          leadId: newLead.id,
          field: "leadStatus",
          oldValue: null,
          newValue: leadData.leadStatus,
        },
      });
    }

    if (leadData.leadActivity) {
      eventPayloads.push({
        type: Events.LEAD_ACTIVITY_CHANGED,
        data: {
          leadId: newLead.id,
          field: "leadActivity",
          oldValue: null,
          newValue: leadData.leadActivity,
        },
      });
    }

    if (leadData.nextAction) {
      eventPayloads.push({
        type: Events.NEXT_ACTION_CHANGED,
        data: {
          leadId: newLead.id,
          field: "nextAction",
          oldValue: null,
          newValue: leadData.nextAction,
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
    console.error('Error creating lead:', error);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}