// src/components/Inventory/ItemSelection/Item/QuickPopup/QuickPopup.js

import React, { useState } from 'react';
import styles from './QuickPopup.module.css';

function QuickPopup(props) {
    const {
      item,
      onClose,
      onAddItem,
      existingItemInstances,
      totalItemCount,
      onUpdateItem,
    } = props;
  
    const [count, setCount] = useState(totalItemCount || 1);
  
    const handleSave = () => {
      const countDifference = count - totalItemCount;
  
      if (countDifference > 0) {
        // Need to add new instances
        for (let i = 0; i < countDifference; i++) {
          const newItemInstance = {
            itemId: item.id.toString(),
            item: { ...item },
            tags: [], // Default tags
            notes: '',
            cuft: item.cuft || '',
            lbs: item.lbs || '',
            packingNeedsCounts: {},
            count: 1,
          };
          onAddItem(newItemInstance);
        }
      } else if (countDifference < 0) {
        // Need to remove instances
        let remainingToRemove = -countDifference;
        const instancesCopy = [...existingItemInstances];
  
        while (remainingToRemove > 0 && instancesCopy.length > 0) {
          const instance = instancesCopy.pop();
          const instanceCount = instance.count || 1;
  
          if (instanceCount <= remainingToRemove) {
            // Remove the whole instance
            onUpdateItem(null, instance);
            remainingToRemove -= instanceCount;
          } else {
            // Decrease the count of the instance
            const updatedInstance = {
              ...instance,
              count: instanceCount - remainingToRemove,
            };
            onUpdateItem(updatedInstance, instance);
            remainingToRemove = 0;
          }
        }
      }
  
      onClose();
    };

  return (
    <div className={styles.popupOverlay}>
      <div className={styles.popup}>
        <h3>{item.name}</h3>
        <div className={styles.countControls}>
          <button onClick={() => setCount(Math.max(1, count - 1))}>-</button>
          <span>{count}</span>
          <button onClick={() => setCount(count + 1)}>+</button>
        </div>
        <div className={styles.buttonGroup}>
          <button onClick={handleSave}>Save</button>
          <button onClick={onClose}>X</button>
        </div>
      </div>
    </div>
  );
}

export default QuickPopup;
