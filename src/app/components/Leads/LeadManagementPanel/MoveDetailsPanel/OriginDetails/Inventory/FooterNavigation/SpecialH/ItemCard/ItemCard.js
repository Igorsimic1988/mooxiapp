"use client";

import React from 'react';
import Image from 'next/image';
import styles from './ItemCard.module.css';
import Icon from '../../../../../../../../Icon';

function ItemCard({ 
  item, 
  name,      // Direct prop for compatibility
  imageName, // Direct prop for compatibility
  onItemClick, 
  isSelected 
}) {
  // Support both direct props and nested item structure
  const displayName = name || item?.name || 'Item';
  const imageSource = imageName || item?.imageName || item?.src || '/placeholder-image.png';

  return (
    <li className={styles.item}>
      <button
        className={`${styles.cardButton} ${isSelected ? styles.selected : ''}`}
        onClick={onItemClick}
        aria-pressed={isSelected}
        aria-label={`Select ${displayName}`}
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
            src={imageSource} 
            alt={displayName} 
            className={styles.itemImage}
            width={100}  // Adjust based on your design requirements
            height={100} // Adjust based on your design requirements
          />
        </div>
        
        {/* Item Name */}
        <div className={styles.itemName}>
          {displayName}
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