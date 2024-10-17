import React from 'react';
import styles from './ItemList.module.css';
import Item from '../Item/Item';

function ItemList({ items }) {
  if (!Array.isArray(items) || items.length === 0) {
    return <p className={styles.noItems}>No items found.</p>;
  }

  return (
    <ul className={styles.itemList}>
      {items.map((item) => (
        <Item key={item.id} item={item} />
      ))}
    </ul>
  );
}

export default ItemList;
