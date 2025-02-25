// src/components/SpecialH/ItemCard/ItemCard.js

import React from 'react';
import styles from './ItemCard.module.css';
import { ReactComponent as CheckmarkIcon } from '../../../../../../../../../assets/icons/checksmall.svg'; // Adjust the path as needed

function ItemCard({ id, item, tags, onItemClick, isSelected }) {
  return (
    <li className={styles.item}>
      <button
        className={`${styles.cardButton} ${isSelected ? styles.selected : ''}`}
        onClick={onItemClick}
        aria-pressed={isSelected}
        aria-label={`Select ${item.name}`}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            onItemClick();
          }
        }}
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

        {/* Optionally, display tags */}
        {/* Uncomment if needed
        {
          tags && tags.length > 0 && (
            <div className={styles.tagsContainer}>
              {tags.map((tag, index) => (
                <span key={index} className={styles.tag}>
                  {tag}
                </span>
              ))}
            </div>
          )
        }
        */}
      </button>
    </li>
  );
}

export default ItemCard;
