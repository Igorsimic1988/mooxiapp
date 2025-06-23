import { generateGroupingKey } from "./generateGroupingKey";
import { addDefaultTags } from "./addDefaultTags";

// 📦 Generate new autoAdded boxes based on weight increase only
export function generateAutoBoxes({
  inventoryItems,
  allItems,
  prevTotalLbs,
  stopId,
  lead,
  processedThresholds = [],
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

  // Calculate total weight (excluding boxes)
  // Since items are individual, just sum their weights
  inventoryItems.forEach((itm) => {
    if (itm.roomId === excludedRoomId) return;
    if (!excludedNames.includes(itm.name?.trim())) {
      const lbsVal = parseFloat(itm.lbs || itm.furnitureItem?.lbs);
      if (!isNaN(lbsVal)) {
        totalLbs += lbsVal; // No multiplication by count needed
      }
    }
  });

  console.log(prevTotalLbs, totalLbs, ' iz generate');

  // If weight hasn't changed, no need to do anything
  if (prevTotalLbs === totalLbs) return null;

  // Calculate which 200lb thresholds we've crossed
  const currentThreshold = Math.floor(totalLbs / 200);
  const prevThreshold = Math.floor((prevTotalLbs || 0) / 200);

  // Clone the processed thresholds array
  const newProcessedThresholds = [...processedThresholds];

  // If weight decreased or no new threshold crossed, just return the updated state
  if (currentThreshold <= prevThreshold) {
    const currentBoxes = inventoryItems.filter((itm) => itm.roomId === 13);
    const manualBoxes = currentBoxes.filter((itm) => !itm.autoAdded);
    const autoBoxes = currentBoxes.filter((itm) => itm.autoAdded);
    
    return {
      updatedRoom13: [...autoBoxes, ...manualBoxes],
      autoBoxes: autoBoxes,
      totalLbs,
      newProcessedThresholds,
      removedBoxIds: [],
    };
  }

  // We have new thresholds to process
  const boxesPer200lbs = 3;
  const newThresholds = [];
  
  // Identify which thresholds are new
  for (let i = prevThreshold + 1; i <= currentThreshold; i++) {
    if (!newProcessedThresholds.includes(i)) {
      newThresholds.push(i);
      newProcessedThresholds.push(i);
    }
  }

  // Calculate boxes only for NEW thresholds
  const newBoxesCount = newThresholds.length * boxesPer200lbs;

  const distribution = [
    { percent: 0.10, name: "Box Dishpack" },
    { percent: 0.05, name: "Box Wardrobe 12cuft" },
    { percent: 0.20, name: "Box Large 4,5 cuft" },
    { percent: 0.45, name: "Box Medium 3 cuft" },
    { percent: 0.20, name: "Box Small 1,5 cuft" },
  ];

  const boxesToAdd = distribution.map((dist) => ({
    name: dist.name,
    count: Math.round(newBoxesCount * dist.percent),
  }));

  // Get existing boxes
  const currentBoxes = inventoryItems.filter((itm) => itm.roomId === 13);
  const manualBoxes = currentBoxes.filter((itm) => !itm.autoAdded);
  const existingAutoBoxes = currentBoxes.filter((itm) => itm.autoAdded);

  const newAutoBoxes = [];

  // Add individual box items
  boxesToAdd.forEach((bx) => {
    if (bx.count === 0) return;
    
    const itemData = allItems.find((it) => it.name.trim() === bx.name.trim());
    if (!itemData) return;
       const { tags, packingNeeds } = addDefaultTags(itemData, 13, lead, stopId);




    // Create individual box items
    for (let i = 0; i < bx.count; i++) {
      const groupingKey = generateGroupingKey({
        furnitureItemId: itemData.id,
        roomId: 13,
        tags,
        notes: "",
        cuft: itemData.cuft || "",
        lbs: itemData.lbs || "",
        packingNeeds,
        uploadedImages: [],
        cameraImages: [],
      });

      const newBox = {
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
        count: 1, // Always 1 for individual items
      };
      newAutoBoxes.push(newBox);
    }
  });

  const allAutoBoxes = [...existingAutoBoxes, ...newAutoBoxes];
  const finalRoom13 = [...allAutoBoxes, ...manualBoxes];

  return {
    updatedRoom13: finalRoom13,
    autoBoxes: allAutoBoxes,
    totalLbs,
    newProcessedThresholds,
    removedBoxIds: [],
  };
}


