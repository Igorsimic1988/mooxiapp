import { NextResponse } from "next/server";
import { PrismaClient, Prisma } from "@prisma/client";
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
        origins: true,        
        destinations: true, 
      }
    });

    const events = await prisma.event.findMany({
      where: {
        data: {
          path: ['leadId'],
          not: Prisma.JsonNull,
        },
      },
    });

    const eventsByLeadId = events.reduce((acc: { [key: string]: typeof events[number][] }, event) => {
      const data = event.data as { leadId?: string };
      const leadId = data?.leadId;
      if (leadId) {
        if (!acc[leadId]) acc[leadId] = [];
        acc[leadId].push(event);
      }
      return acc;
    }, {});

    const leadsWithEvents = leads.map(lead => ({
      ...lead,
      events: eventsByLeadId[lead.id] || [],
    }));

    return NextResponse.json({ leads: leadsWithEvents });
  } catch (error) {
    console.log(`${error}`)
    return NextResponse.json(
      { error: "Something went wrong while fetching leads" },
      { status: 500 }
    );
  }
}

