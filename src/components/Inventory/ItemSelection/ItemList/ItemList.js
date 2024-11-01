import React from 'react';
import styles from './ItemList.module.css';
import Item from '../Item/Item';

function ItemList({ items, itemClickCounts, onItemClick }) {
  if (!Array.isArray(items) || items.length === 0) {
    return <p className={styles.noItems}>No items found.</p>;
  }

  return (
    <ul className={styles.itemList}>
      {items.map((item) => {
        const count = itemClickCounts[item.id]?.count || 0; // Access the count from itemClickCounts

        return (
          <Item
            key={item.id}
            item={item}
            clickCount={count} // Pass the click count to Item component
            onItemClick={() => onItemClick(item)} // Pass the entire item object
          />
        );
      })}
    </ul>
  );
}

export default ItemList;
