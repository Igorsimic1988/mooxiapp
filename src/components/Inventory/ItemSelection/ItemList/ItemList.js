import React from 'react';
import styles from './ItemList.module.css';
import Item from '../Item/Item';

function ItemList({ items, itemClickCounts, onItemClick }) {
  if (!Array.isArray(items) || items.length === 0) {
    return <p className={styles.noItems}>No items found.</p>;
  }

  return (
    <ul className={styles.itemList}>
      {items.map((item) => (
        <Item
          key={item.id}
          item={item}
          clickCount={itemClickCounts[item.id] || 0} // Pass click count for each item
          onItemClick={() => onItemClick(item.id)} // Handle item click
        />
      ))}
    </ul>
  );
}

export default ItemList;
