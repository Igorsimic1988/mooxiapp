"use client";

import React from 'react';
import Image from 'next/image';
import styles from './ItemCard.module.css';
import Icon from '../../../../../../../../Icon';

function ItemCard({ item, onItemClick, isSelected }) {
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
            <Icon 
      name="CheckSmallAlt" 
      width={24}
      height={24}
      color="#fff"
    />
          </div>
        )}
        
        {/* Item Image */}
        <div className={styles.imageWrapper}>
        <Image 
  src={item.imageName} 
  alt={item.name} 
  className={styles.itemImage}
  width={100}  // Adjust based on your design requirements
  height={100} // Adjust based on your design requirements
/>
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
