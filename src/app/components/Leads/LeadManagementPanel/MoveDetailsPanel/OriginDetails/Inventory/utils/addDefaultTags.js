const storageLevels = ['More than half', 'Almost all', 'All items'];
const excludedIds = ["529", "530", "531", "532", "533", "534", "535", "536", "537"];



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
    console.log(tags)
    const cpIndex = tags.indexOf('cp_packed_by_movers');
    if (cpIndex !== -1) {
      tags.splice(cpIndex, 1);
    }
    if (!tags.includes('pbo_packed_by_customer')) tags.push('pbo_packed_by_customer');

    if (excludedIds.includes(String(item.furnitureItemId))&& !tags.includes('pbo_packed_by_customer')) {
      tags.push('pbo_packed_by_customer');
    }
  } else if (packingOption === 'Full Packing') {
    if (excludedIds.includes(String(item.furnitureItemId))) {
      const pboIndex = tags.indexOf('pbo_packed_by_customer');
      if (pboIndex !== -1) tags.splice(pboIndex, 1);
      if (!tags.includes('cp_packed_by_movers')) tags.push('cp_packed_by_movers');
    }

  } else {
    if (excludedIds.includes(String(item.furnitureItemId)) && !tags.includes('pbo_packed_by_customer')) {
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
    const alreadyAdded = packingNeeds.some(p => p.type === 'paper_blanket_wrapped');
    if (!alreadyAdded) {
      packingNeeds.push({
        type: 'paper_blanket_wrapped',
        quantity: 1, 
      });
    }
  }

const unpacking = stop?.unpackingOption;
if (unpacking === 'Full Unpacking' && tags.includes('cp_packed_by_movers')) {
  if (!tags.includes('unpacking')) {
    tags.push('unpacking');
  }
}

if (stop?.itemsToBeAssembled === false) {
  const disIndex = tags.indexOf('assembly');
    if (disIndex !== -1) {
      tags.splice(disIndex, 1);
    }
}

  return {
    tags,
    packingNeeds,
  };
}
  