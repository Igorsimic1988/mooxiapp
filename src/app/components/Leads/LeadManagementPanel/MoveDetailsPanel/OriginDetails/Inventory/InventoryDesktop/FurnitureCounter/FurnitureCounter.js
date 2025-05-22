"use client";

import React, { useMemo } from 'react';
import styles from './FurnitureCounter.module.css';

// The IDs of items that should be counted as "Boxes"
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
        const itemId = itemInstance.id;
        const cuftVal = parseFloat(itemInstance.cuft) || 0;
        const lbsVal = parseFloat(itemInstance.lbs) || 0;

        totalItems += 1;
        totalCuft += cuftVal;
        totalLbs += lbsVal;

        if (boxItemIds.includes(itemId)) {
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
