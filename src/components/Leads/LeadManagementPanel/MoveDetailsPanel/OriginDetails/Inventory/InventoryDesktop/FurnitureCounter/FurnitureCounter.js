// src/components/Inventory/FurnitureCounter/FurnitureCounter.js

import React, { useMemo } from 'react';
import styles from './FurnitureCounter.module.css';

// Move boxItemIds outside of the component function
const boxItemIds = [
  '127', '128', '129', '130', '131', '438',
  ...Array.from({ length: 20 }, (_, i) => (529 + i).toString()), // '530' to '549'
];

function FurnitureCounter({ roomItemSelections, displayedRooms }) {
  const { totalFurniture, totalBoxes, totalCuft, totalLbs } = useMemo(() => {
    let totalItems = 0;
    let totalBoxes = 0;
    let totalCuft = 0;
    let totalLbs = 0;

    Object.keys(roomItemSelections).forEach((roomId) => {
      if (!displayedRooms.some((room) => room.id.toString() === roomId)) return;

      const items = roomItemSelections[roomId];

      items.forEach((itemInstance) => {
        const itemId = itemInstance.itemId;
        const cuft = parseFloat(itemInstance.cuft) || 0;
        const lbs = parseFloat(itemInstance.lbs) || 0;

        totalItems += 1;
        totalCuft += cuft;
        totalLbs += lbs;

        if (boxItemIds.includes(itemId)) {
          totalBoxes += 1;
        }
      });
    });

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
