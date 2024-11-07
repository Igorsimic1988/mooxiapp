// src/components/Inventory/ItemSelection/Item/Item.js

import React, { useState, useRef } from 'react';
import styles from './Item.module.css';
import { ReactComponent as ThreeDots } from '../../../../assets/icons/more.svg';
import ItemPopup from './ItemPopup/ItemPopup'; // Import the popup component

function Item({ item, clickCount, onItemClick, isMyItemsActive }) {
  const [isPopupVisible, setIsPopupVisible] = useState(false);
  const timerRef = useRef(null);

  // Handlers for long press
  const handleMouseDown = (e) => {
    if (!isMyItemsActive) return; // Only activate if isMyItemsActive is true
    e.preventDefault();
    timerRef.current = setTimeout(() => {
      setIsPopupVisible(true);
    }, 500); // Long press duration
  };

  const handleMouseUp = () => {
    clearTimeout(timerRef.current);
  };

  const handleMouseLeave = () => {
    clearTimeout(timerRef.current);
  };

  const handleTouchStart = () => {
    if (!isMyItemsActive) return; // Only activate if isMyItemsActive is true
    timerRef.current = setTimeout(() => {
      setIsPopupVisible(true);
    }, 500);
  };

  const handleTouchEnd = () => {
    clearTimeout(timerRef.current);
  };

  // Handle menu icon click
  const handleMenuIconClick = (e) => {
    e.stopPropagation();
    if (!isMyItemsActive) return; // Only activate if isMyItemsActive is true
    setIsPopupVisible(true);
  };

  // Close popup handler
  const handleClosePopup = () => {
    setIsPopupVisible(false);
  };

  return (
    <li className={styles.item}>
      <button
        className={styles.card}
        onClick={onItemClick}
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseLeave}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        {clickCount > 0 && (
          <div className={styles.numberBadge}>{clickCount}</div>
        )}
        {isMyItemsActive && (
          <div className={styles.menuIcon} onClick={handleMenuIconClick}>
            <ThreeDots />
          </div>
        )}
        <div className={styles.itemImagewrapper}>
          <img
            src={item.src}
            alt={item.name}
            className={styles.itemImage}
          />
        </div>
        <div className={styles.itemName}>{item.name}</div>
      </button>

      {isPopupVisible && (
        <ItemPopup
          item={item}
          onClose={handleClosePopup}
        />
      )}
    </li>
  );
}

export default Item;
