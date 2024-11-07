// src/components/Inventory/ItemSelection/ItemList/ItemList.js

import React from 'react';
import styles from './ItemList.module.css';
import Item from '../Item/Item';

function ItemList({ items, itemClickCounts, onItemClick, isMyItemsActive }) {
  if (!Array.isArray(items) || items.length === 0) {
    return <p className={styles.noItems}>No items found.</p>;
  }

  return (
    <ul className={styles.itemList}>
      {items.map((itemData) => {
        let key, item, count;

        if (isMyItemsActive) {
          key = `${itemData.itemId}-${itemData.tags.sort().join(',')}`;
          item = itemData.item;
          count = itemData.count;
        } else {
          key = itemData.id;
          item = itemData;
          count = itemClickCounts[itemData.id.toString()] || 0;
        }

        return (
          <Item
            key={key}
            item={item}
            clickCount={count}
            onItemClick={() => onItemClick(itemData)}
            isMyItemsActive={isMyItemsActive}
          />
        );
      })}
    </ul>
  );
}

export default ItemList;
