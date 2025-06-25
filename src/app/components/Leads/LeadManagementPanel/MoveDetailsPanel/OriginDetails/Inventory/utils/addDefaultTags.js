const storageLevels = ['More than half', 'Almost all', 'All items'];
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


export function addDefaultTags(item, roomId, lead, stop) {
    const tags = Array.isArray(item.tags) ? [...item.tags] : [];
    const packingNeeds = Array.isArray(item.packingNeeds) ? [...item.packingNeeds] : [];
  
    if (roomId === 45 && !tags.includes('disposal')) {
      tags.push('disposal');
    }

    if (
      lead?.addStorage &&
      storageLevels.includes(lead.storageItems) &&
      !tags.includes('item_for_company_storage')
    ) {
      tags.push('item_for_company_storage');
    }
  
    const packingOption = stop?.packingOption;

  if (packingOption === 'No Packing') {
    const cpIndex = tags.indexOf('cp_packed_by_movers');
    if (cpIndex !== -1) {
      tags[cpIndex] = 'pbo_packed_by_customer';
    }

    if (excludedNames.includes(item.name?.trim())&& !tags.includes('pbo_packed_by_customer') && roomId !== 13) {
      tags.push('pbo_packed_by_customer');
    }
  } else if (packingOption === 'Full Packing') {
    if (excludedNames.includes(item.name?.trim()) && roomId !== 13) {
      const pboIndex = tags.indexOf('pbo_packed_by_customer');
      if (pboIndex !== -1) tags.splice(pboIndex, 1);
      if (!tags.includes('cp_packed_by_movers')) tags.push('cp_packed_by_movers');
    }

  } else {
    if (excludedNames.includes(item.name?.trim()) && !tags.includes('pbo_packed_by_customer') && roomId !== 13) {
      tags.push('pbo_packed_by_customer'); 
    }
  }

  if (stop?.itemsToBeTakenApart === false) {
    const disIndex = tags.indexOf('disassembly');
    if (disIndex !== -1) {
      tags.splice(disIndex, 1);
    }
  }

  const blanketsOption = stop?.blanketsOption;

  if (blanketsOption === 'Blankets not needed') {
    const index = tags.indexOf('blanket_wrapped');
    if (index !== -1) tags.splice(index, 1);
  
  } else if (blanketsOption === 'Paper Blankets') {
    const oldIndex = tags.indexOf('blanket_wrapped');
    if (oldIndex !== -1) tags.splice(oldIndex, 1);
  
    if (!tags.includes('paper_blanket_wrapped')) tags.push('paper_blanket_wrapped');
    console.log(packingNeeds)
    const alreadyAdded = packingNeeds.some(p => p.type === 'paper_blanket_wrapped');
    if (!alreadyAdded) {
      packingNeeds.push({
        type: 'paper_blanket_wrapped',
        quantity: 1, 
      });
    }
  }

  // === UNPACKING ===
const unpacking = stop?.unpackingOption;
if (unpacking === 'Full Unpacking' && tags.includes('cp_packed_by_movers')) {
  if (!tags.includes('unpacking')) {
    tags.push('unpacking');
  }
}

// === ASSEMBLY ===
if (stop?.itemsToBeAssembled) {
  if (!tags.includes('assembly')) {
    tags.push('assembly');
  }
} else {
  const index = tags.indexOf('assembly');
  if (index !== -1) tags.splice(index, 1);
}

  return {
    tags,
    packingNeeds,
  };
}
  