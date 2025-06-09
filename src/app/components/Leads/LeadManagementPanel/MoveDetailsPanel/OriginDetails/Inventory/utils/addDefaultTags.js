export function addDefaultTags(item, roomId) {
    const tags = Array.isArray(item.tags) ? [...item.tags] : [];
  
    if (roomId === 45 && !tags.includes('disposal')) {
      tags.push('disposal');
    }
  
    return tags;
}
  