"use client";

import React, { useMemo } from 'react';
import styles from './FurnitureCounter.module.css';

// Box items identified by name (better for backend integration)
const boxItemNames = [
  'Plastic Tote Large',
  'Plastic Tote Medium',
  'Plastic Tote Small',
  'Plastic Tote Flat',
  'Box Wardrobe 12cuft',
  'Box Wardrobe Short',
  'Box Lamp Large',
  'Box Extra Large 6 cuft',
  'Box Dishpack',
  'Box Large 4,5 cuft',
  'Box Medium 3 cuft',
  'Box Small 1,5 cuft',
  'Box Book ',
  'Box File Large',
  'Box File Small',
  'Box Mirror Picture Large',
  'Box Mirror Picture Small',
  'Box TV 60 - 75 inch',
  'Box TV 50 - 60 inch',
  'Box TV 32 - 49 inch',
  'Box TV 14 - 32 inch',
  'Box TV Large',
  'Box TV Medium',
  'Box TV Small',
];

// Legacy box IDs for backward compatibility
const boxItemIds = [
  '127', '128', '129', '130', '131', '438',
  ...Array.from({ length: 20 }, (_, i) => (529 + i).toString()), // '529'..'548'
];

/**
 * FurnitureCounter
 *
 * Displays total furniture, boxes, lbs, and cuft
 *
 * Props:
 *  - roomItemSelections: { [roomId]: arrayOfItemInstances } - each item is individual
 *  - displayedRooms: can be either:
 *       A) array of objects like [ { id: 1, name: '...'}, ... ]
 *       B) array of numeric IDs (or strings) like [1,2,13] 
 */
function FurnitureCounter({ roomItemSelections, displayedRooms }) {
  const { totalFurniture, totalBoxes, totalCuft, totalLbs } = useMemo(() => {
    let totalItems = 0;
    let totalBoxes = 0;
    let totalCuft = 0;
    let totalLbs = 0;

    // For each roomId in the roomItemSelections object:
    Object.keys(roomItemSelections).forEach((roomId) => {
      // Check if that "roomId" is included in displayedRooms:
      const isDisplayed = displayedRooms.some((entry) => {
        if (entry === null || entry === undefined) {
          return false;
        }
        
        // If it's an object with an 'id' property, use that.
        // Otherwise, assume entry is a raw ID (number or string).
        const displayedId = (typeof entry === 'object' && entry !== null && 'id' in entry)
          ? entry.id
          : entry;
        
        return String(displayedId) === roomId; 
      });

      if (!isDisplayed) {
        // If this roomId is not in the set of displayedRooms, skip
        return;
      }

      // Otherwise => count up items
      const items = roomItemSelections[roomId] || [];
      items.forEach((itemInstance) => {
        // For individual items, each instance counts as 1
        const cuftVal = parseFloat(itemInstance.cuft) || 0;
        const lbsVal = parseFloat(itemInstance.lbs) || 0;

        totalItems += 1;
        totalCuft += cuftVal;
        totalLbs += lbsVal;

        // Check if it's a box by name (preferred) or by ID (legacy)
        const itemName = itemInstance.name || itemInstance.item?.name || '';
        const itemId = (itemInstance.furnitureItemId || itemInstance.itemId || '').toString();
        
        if (boxItemNames.includes(itemName) || boxItemIds.includes(itemId)) {
          totalBoxes += 1;
        }
      });
    });

    // furniture = total items minus boxes
    const totalFurniture = totalItems - totalBoxes;

    return {
      totalFurniture,
      totalBoxes,
      totalCuft,
      totalLbs,
    };
  }, [roomItemSelections, displayedRooms]);

  return (
    <div className={styles.counterContainer}>
      <div className={styles.counterItem}>
        <div className={styles.counterNumber}>{totalFurniture}</div>
        <div className={styles.counterLabel}>Furniture</div>
      </div>
      <div className={styles.counterItem}>
        <div className={styles.counterNumber}>{totalBoxes}</div>
        <div className={styles.counterLabel}>Boxes</div>
      </div>
      <div className={styles.counterItem}>
        <div className={styles.counterNumber}>{Math.round(totalLbs)}</div>
        <div className={styles.counterLabel}>Lbs</div>
      </div>
      <div className={styles.counterItem}>
        <div className={styles.counterNumber}>{Math.round(totalCuft)}</div>
        <div className={styles.counterLabel}>Cuft</div>
      </div>
    </div>
  );
}

export default FurnitureCounter;