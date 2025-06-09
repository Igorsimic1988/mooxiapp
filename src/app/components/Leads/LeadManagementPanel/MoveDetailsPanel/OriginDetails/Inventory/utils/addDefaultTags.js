const storageLevels = ['More than half', 'Almost all', 'All items'];


export function addDefaultTags(item, roomId, lead) {
    const tags = Array.isArray(item.tags) ? [...item.tags] : [];
  
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
  
    return tags;
}
  