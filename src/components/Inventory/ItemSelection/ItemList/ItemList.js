// src/components/Inventory/ItemSelection/ItemList/ItemList.js

import React from 'react';
import styles from './ItemList.module.css';
import Item from '../Item/Item';

function ItemList({ items, itemClickCounts, onItemClick, isMyItemsActive, isDeleteActive, onUpdateItem }) {
  if (!Array.isArray(items) || items.length === 0) {
    return <p className={styles.noItems}>No items found.</p>;
  }

  return (
    <ul className={styles.itemList}>
      {items.map((itemData) => {
        let key, item, count, itemInstance;

        if (isMyItemsActive) {
          key = `${itemData.itemId}-${itemData.tags.sort().join(',')}`;
          item = itemData.item;
          count = itemData.count;
          itemInstance = itemData; // The grouped item data
        } else {
          key = itemData.id;
          item = itemData;
          count = itemClickCounts[itemData.id.toString()] || 0;
          itemInstance = null; // No itemInstance when not in My Items
        }

        return (
          <Item
            key={key}
            item={item}
            clickCount={count}
            onItemClick={() => onItemClick(itemData)}
            isMyItemsActive={isMyItemsActive}
            isDeleteActive={isDeleteActive}
            onUpdateItem={onUpdateItem} // **Pass the onUpdateItem function**
            itemInstance={itemInstance} // **Pass the item instance**
          />
        );
      })}
    </ul>
  );
}

export default ItemList;
