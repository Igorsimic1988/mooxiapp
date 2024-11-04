// components/ItemCard/ItemCard.js
import React from 'react';
import styles from './ItemCard.module.css';
import { ReactComponent as CheckmarkIcon } from '../../../../../assets/icons/checksmall.svg'; // Adjust the path as needed

function ItemCard({ id, item, onItemClick, isSelected }) {
  return (
    <li className={styles.item}>
      <button
        className={styles.cardButton}
        onClick={onItemClick}
        aria-pressed={isSelected}
        aria-label={`Select ${item.name}`}
      >
        {/* Checkmark Badge */}
        {isSelected && (
          <div className={styles.checkmarkBadge}>
            <CheckmarkIcon />
          </div>
        )}
        
        {/* Item Image */}
        <div className={styles.imageWrapper}>
          <img src={item.src} alt={item.name} className={styles.itemImage} />
        </div>
        
        {/* Item Name */}
        <div className={styles.itemName}>
          {item.name}
        </div>
      </button>
    </li>
  );
}

export default ItemCard;
