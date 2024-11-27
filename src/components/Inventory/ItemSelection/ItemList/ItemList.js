// src/components/Inventory/ItemSelection/ItemList/ItemList.js

import React, { useRef } from 'react';
import styles from './ItemList.module.css';
import Item from '../Item/Item';

function ItemList({
  items,
  itemClickCounts,
  onItemClick,
  isMyItemsActive,
  isDeleteActive,
  onUpdateItem,
  onAddItem,
  onStartFresh,
  setIsMyItemsActive,
  onBackToRooms,
}) {
  const touchStartXRef = useRef(null);
  const touchEndXRef = useRef(null);

  const handleTouchStart = (e) => {
    touchStartXRef.current = e.touches[0].clientX;
  };

  const handleTouchMove = (e) => {
    touchEndXRef.current = e.touches[0].clientX;
  };

  const handleTouchEnd = () => {
    if (touchStartXRef.current === null || touchEndXRef.current === null) return;

    const deltaX = touchEndXRef.current - touchStartXRef.current;

    const minSwipeDistance = 50; // Adjust as needed

    if (Math.abs(deltaX) > minSwipeDistance) {
      if (deltaX < 0) {
        // Swiped left
        if (!isMyItemsActive) {
          setIsMyItemsActive(true);
        }
      } else {
        // Swiped right
        if (isMyItemsActive) {
          setIsMyItemsActive(false);
        } else {
          // Swiped right when isMyItemsActive is false, go back to Inventory.js
          onBackToRooms();
        }
      }
    }

    touchStartXRef.current = null;
    touchEndXRef.current = null;
  };

  return (
    <div
      className={styles.itemListContainer}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {Array.isArray(items) && items.length > 0 ? (
        <ul className={styles.itemList}>
          {items.map((itemData) => {
            let key, item, count, itemInstance;

            if (isMyItemsActive) {
              key = itemData.groupingKey;
              item = itemData.item;
              count = itemData.count || 1;
              itemInstance = itemData;
            } else {
              const itemIdStr = itemData.id.toString();
              key = itemIdStr;
              item = itemData;
              count = itemClickCounts[itemIdStr] || 0;
              itemInstance = null;
            }

            return (
              <Item
                key={key}
                item={item}
                clickCount={count}
                onItemClick={(action) => onItemClick(itemData, action)}
                isMyItemsActive={isMyItemsActive}
                isDeleteActive={isDeleteActive}
                onUpdateItem={onUpdateItem}
                onAddItem={onAddItem}
                itemInstance={itemInstance}
                onStartFresh={onStartFresh}
              />
            );
          })}
        </ul>
      ) : (
        <p className={styles.noItems}>Add items to see them here.</p>
      )}
    </div>
  );
}

export default ItemList;
