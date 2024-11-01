import React from 'react';
import styles from './Item.module.css';
import { ReactComponent as ThreeDots } from '../../../../assets/icons/more.svg';

function Item({ item, clickCount, onItemClick }) {
  return (
    <li className={styles.item}>
      <button className={styles.card} onClick={onItemClick}>
        {clickCount > 0 && (
          <div className={styles.numberBadge}>
            {clickCount}
          </div>
        )}
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
