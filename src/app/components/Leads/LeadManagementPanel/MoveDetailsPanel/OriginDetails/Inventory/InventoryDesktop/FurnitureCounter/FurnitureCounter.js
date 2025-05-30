"use client";

import React, { useMemo } from 'react';
import styles from './FurnitureCounter.module.css';

// The IDs of items that should be counted as "Boxes"
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

/**
 * FurnitureCounter
 *
 * Displays total furniture, boxes, lbs, and cuft
 *
 * Props:
 *  - roomItemSelections: { [roomId]: arrayOfItemInstances }
 *  - displayedRooms: can be either:
 *       A) array of objects like [ { id: 1, name: '...'}, ... ]
 *       B) array of numeric IDs (or strings) like [1,2,13] 
 */
function FurnitureCounter({ itemsByRoom, displayedRooms }) {
  const { totalFurniture, totalBoxes, totalCuft, totalLbs } = useMemo(() => {
    let totalItems = 0;
    let totalBoxes = 0;
    let totalCuft = 0;
    let totalLbs = 0;

    // For each roomId in the roomItemSelections object:
    Object.keys(itemsByRoom).forEach((roomId) => {
      // Check if that "roomId" is included in displayedRooms:
      // displayedRooms might be objects OR might be raw IDs:
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
      const items = itemsByRoom[roomId] || [];
      items.forEach((itemInstance) => {
        const count = parseInt(itemInstance.count) || 1;
        const cuftVal = parseFloat(itemInstance.cuft) || 0;
        const lbsVal = parseFloat(itemInstance.lbs) || 0;

        totalItems += count;
        totalCuft += cuftVal * count;
        totalLbs += lbsVal * count;

        if (boxItemNames.includes(itemInstance.name)) {
          totalBoxes += count;
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
  }, [itemsByRoom, displayedRooms]);

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
