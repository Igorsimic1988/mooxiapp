// src/components/Inventory/ItemSelection/ItemList/ItemList.js

import React from 'react';
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
}) {
  if (!Array.isArray(items) || items.length === 0) {
    return <p className={styles.noItems}>No items found.</p>;
  }

  return (
    <ul className={styles.itemList}>
      {items.map((itemData) => {
        let key, item, count, itemInstance;

        if (isMyItemsActive) {
          key = itemData.groupingKey; // Use groupingKey as the key
          item = itemData.item;
          count = itemData.count || 1; // Use itemData.count
          itemInstance = itemData; // The grouped item data
        } else {
          const itemIdStr = itemData.id.toString(); // Ensure key is a string
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
            onItemClick={() => onItemClick(itemData)}
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
  );
}

export default ItemList;
