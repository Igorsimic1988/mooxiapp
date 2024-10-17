import React from 'react';
import styles from './Item.css';

function Item({ item }) {
  return (
    <li className={styles.item}>
      {item.name}
    </li>
  );
}

export default Item;