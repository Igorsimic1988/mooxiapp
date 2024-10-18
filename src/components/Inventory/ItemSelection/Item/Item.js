import React from 'react';
import styles from './Item.module.css';
import { ReactComponent as ThreeDots } from '../../../../assets/icons/more.svg';

function Item({ item, number, imageUrl, name }) {
  return (
    <li className={styles.item}>
      <button className={styles.card}>
      <div className={styles.numberBadge}>
        {number}
      </div>
      <div className={styles.menuIcon}>
        <ThreeDots />
      </div>
      <div className={styles.itemImagewrapper}>
      <img src={item.src} alt={item.name} className={styles.itemImage} />
      </div>
      <div className={styles.itemName}>
       {item.name}
      </div>   
      </button>
    </li>
  );
}

export default Item;