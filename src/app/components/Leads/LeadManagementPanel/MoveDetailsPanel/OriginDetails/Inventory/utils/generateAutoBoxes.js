import { generateGroupingKey } from "./generateGroupingKey";
import { addDefaultTags } from "./addDefaultTags";


// 📦 Generiši nove autoAdded kutije bazirano na totalnoj težini
export function generateAutoBoxes({
  inventoryItems,
  allItems,
  prevTotalLbs,
  stopId,
  lead,
}) {
  if (!inventoryItems) return null;

  let totalLbs = 0;
  const excludedRoomId = 13;
  
  const excludedNames = [
    "Box Wardrobe 12cuft",
    "Box Wardrobe Short",
    "Box Lamp Large",
    "Box Extra Large 6 cuft",
    "Box Dishpack",
    "Box Large 4,5 cuft",
    "Box Medium 3 cuft",
    "Box Small 1,5 cuft",
    "Box Book ",
  ];

  inventoryItems.forEach((itm) => {
    if (itm.roomId === excludedRoomId) return;
    if (!excludedNames.includes(itm.name?.trim())) {
      const lbsVal = parseFloat(itm.lbs || itm.furnitureItem?.lbs);
      const count = itm.count || 1;
      if (!isNaN(lbsVal)) {
        totalLbs += lbsVal * count;
      }
    }
  });

  if (prevTotalLbs === totalLbs) return null;

  const boxesPer200lbs = 3;
  const nUnits = Math.ceil(totalLbs / 200);
  const totalBoxes = nUnits * boxesPer200lbs;

  const distribution = [
    { percent: 0.10, name: "Box Dishpack" },
    { percent: 0.05, name: "Box Wardrobe 12cuft" },
    { percent: 0.20, name: "Box Large 4,5 cuft" },
    { percent: 0.45, name: "Box Medium 3 cuft" },
    { percent: 0.20, name: "Box Small 1,5 cuft" },
  ];

  const boxesToAdd = distribution.map((dist) => ({
    name: dist.name,
    count: Math.round(totalBoxes * dist.percent),
  }));

  const currentBoxes = inventoryItems.filter((itm) => itm.roomId === 13);
  const autoAdded = currentBoxes.filter((itm) => itm.autoAdded);

  const usedGroupingKeys = [];
  const updatedRoom13 = [];
  const autoBoxes = [];

  boxesToAdd.forEach((bx) => {
    const itemData = allItems.find((it) => it.name.trim() === bx.name.trim());
    if (!itemData || bx.count === 0) return;

    const groupingKey = generateGroupingKey({
      furnitureItemId: itemData.id,
      roomId: 13,
      autoAdded: true,
    });
    usedGroupingKeys.push(groupingKey);



    const existing = autoAdded.find((itm) => itm.groupingKey === groupingKey);
    const { tags, packingNeeds } = addDefaultTags(itemData, 13, lead, stopId);

    const payload = {
      furnitureItemId: itemData.id,
      roomId: 13,
      name: itemData.name,
      imageName: itemData.imageName,
      letters: [...itemData.letters],
      search: itemData.search,
      tags,
      notes: "",
      cuft: itemData.cuft || "",
      lbs: itemData.lbs || "",
      packingNeeds,
      uploadedImages: [],
      cameraImages: [],
      autoAdded: true,
      groupingKey,
      count: bx.count,
    };

    if (existing) {
      if (existing.count !== bx.count) {
        const updatedItem = { ...existing, ...payload, count: bx.count };
        updatedRoom13.push(updatedItem);
        autoBoxes.push(updatedItem);
      } else {
        updatedRoom13.push(existing);
        autoBoxes.push(existing);
      }
    } else {
      updatedRoom13.push(payload);
      autoBoxes.push(payload);
    }
  });

  const unusedAutoBoxes = autoAdded.filter(
    (itm) => !usedGroupingKeys.includes(itm.groupingKey)
  );

  const finalRoom13 = [
    ...updatedRoom13,
    ...currentBoxes.filter((itm) => !itm.autoAdded), // Zadrži ručno dodate
  ];

  return {
    updatedRoom13: finalRoom13,
    autoBoxes,
    totalLbs,
    removedBoxIds: unusedAutoBoxes.map((itm) => itm.groupingKey),
  };
}
