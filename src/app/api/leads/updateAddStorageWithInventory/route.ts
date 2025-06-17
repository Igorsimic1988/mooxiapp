import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { generateGroupingKey } from "src/utils/generateGroupingKey";

const prisma = new PrismaClient();

export async function PATCH(req: Request) {
  try {
    const { id, addStorage, storageItems } = await req.json();

    if (!id) {
      return NextResponse.json({ error: "ID is required" }, { status: 400 });
    }

    const existingLead = await prisma.lead.findUnique({
      where: { id },
      include: {
        origins: true,
        destinations: true,
      },
    });

    if (!existingLead) {
      return NextResponse.json({ error: "Lead not found" }, { status: 404 });
    }

    const shouldUpdateTagInventory = ['More than half', 'Almost all', 'All items'].includes(storageItems);

    const updatedLead = await prisma.lead.update({
      where: { id },
      data: {
        addStorage,
        storageItems,
        deliveryDate: addStorage ? existingLead.deliveryDate : '',
      },
    });

    if (shouldUpdateTagInventory) {
      const originIds = existingLead.origins.map((o) => o.id);
      const destinationIds = existingLead.destinations.map((d) => d.id);

      const relevantItems = await prisma.inventoryItem.findMany({
        where: {
          OR: [
            { originId: { in: originIds } },
            { destinationId: { in: destinationIds } },
          ],
        },
      });

      const updatedItems: typeof relevantItems = [];

      for (const item of relevantItems) {
        const alreadyTagged = item.tags.includes('item_for_company_storage');
        const updatedTags = alreadyTagged ? item.tags : [...item.tags, 'item_for_company_storage'];
        const updatedGroupingKey = generateGroupingKey({ ...item, tags: updatedTags });

        try {
          const updatedItem = await prisma.inventoryItem.update({
            where: { id: item.id },
            data: {
              tags: { set: updatedTags },
              groupingKey: updatedGroupingKey,
            },
          });

          updatedItems.push(updatedItem);
        } catch (err) {
          console.error(`❌ Error updating item ${item.id}:`, err);
        }
      }

      // Helper to group items by room
      const groupByRoom = (items: typeof updatedItems) => {
        return items.reduce((acc, item) => {
          if (!item.roomId) return acc;
          if (!acc[item.roomId]) acc[item.roomId] = [];
          acc[item.roomId].push(item);
          return acc;
        }, {} as Record<number, typeof updatedItems>);
      };

      const originItems = updatedItems.filter((item) => item.originId && originIds.includes(item.originId));
      const destinationItems = updatedItems.filter((item) => item.destinationId && destinationIds.includes(item.destinationId));

      const groupedOriginItems = groupByRoom(originItems);
      const groupedDestinationItems = groupByRoom(destinationItems);

      for (const originId of originIds) {
        await prisma.origins.update({
          where: { id: originId },
          data: {
            itemsByRoom: groupedOriginItems,
          },
        });
      }

      for (const destId of destinationIds) {
        await prisma.destinations.update({
          where: { id: destId },
          data: {
            itemsByRoom: groupedDestinationItems,
          },
        });
      }
    }

    return NextResponse.json({ success: "Lead updated!", lead: updatedLead });

  } catch (error) {
    console.error("Error updating lead:", error);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
