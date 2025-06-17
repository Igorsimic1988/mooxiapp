// src/utils/generateGroupingKey.js

/**
 * Generates a unique grouping key based on the properties of an item instance.
 *
 * @param {Object} instance - The item instance object.
 * @param {string} instance.itemId - The ID of the item.
 * @param {Array<string>} instance.tags - An array of tags associated with the item.
 * @param {string} [instance.notes] - Optional notes for the item.
 * @param {string} [instance.cuft] - Optional cubic feet measurement.
 * @param {string} [instance.lbs] - Optional pounds measurement.
 * @param {Object} [instance.packingNeedsCounts] - Optional packing needs counts.
 * @param {string} [instance.link] - Optional link associated with the item.
 * @param {Array<string>} [instance.uploadedImages] - Array of uploaded image data.
 * @param {Array<string>} [instance.cameraImages] - Array of camera image data.
 * @returns {string} The generated grouping key.
 */

export const generateGroupingKey = (instance) => {
    console.log('usaooo')
    const tagsKey = Array.isArray(instance.tags) ? instance.tags.sort().join(',') : '';
      const notesKey = instance.notes || '';
      const cuftKey = instance.cuft || '';
      const lbsKey = instance.lbs || '';
      const packingNeedsArray = Array.isArray(instance.packingNeeds) ? instance.packingNeeds : [];
      const packingNeedsKey = packingNeedsArray
        .slice()
        .sort((a, b) => a.type.localeCompare(b.type))
        .map(({ type, quantity }) => `${type}:${quantity}`)
        .join(',');
    
      const linkKey = instance.link || '';
    
      // Generate a combined string of all images
      const uploadedImagesData = (instance.uploadedImages || []).join('');
      const cameraImagesData = (instance.cameraImages || []).join('');
    
      // Generate hashes of the images data
      const uploadedImagesHash = simpleHash(uploadedImagesData);
      const cameraImagesHash = simpleHash(cameraImagesData);
    
      const imagesKey = `${uploadedImagesHash}-${cameraImagesHash}`;
      const baseId = instance.furnitureItemId ?? instance.id;
      const roomKey = instance.roomId || '';
    
      // Now include link and imagesKey in the grouping key
      return `${baseId}-${roomKey}-${tagsKey}-${notesKey}-${cuftKey}-${lbsKey}-${packingNeedsKey}-${linkKey}-${imagesKey}`;
    };
    
    // Simple hash function
    function simpleHash(str) {
      let hash = 0,
        i,
        chr;
      if (str.length === 0) return hash.toString();
      for (i = 0; i < str.length; i++) {
        chr = str.charCodeAt(i);
        hash = (hash << 5) - hash + chr;
        hash |= 0; // Convert to 32bit integer
      }
      return hash.toString();
    }
    