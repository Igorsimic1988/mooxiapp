// src/components/Inventory/ItemSelection/Item/Item.js

import React, { useState, useRef } from 'react';
import styles from './Item.module.css';
import { ReactComponent as ThreeDots } from '../../../../assets/icons/more.svg';
import ItemPopup from './ItemPopup/ItemPopup';

function Item({
  item,
  clickCount,
  onItemClick,
  isMyItemsActive,
  isDeleteActive,
  onUpdateItem,
  onAddItem,
  itemInstance,
  onStartFresh,
}) {
  const [isPopupVisible, setIsPopupVisible] = useState(false);
  const [isBadgeExpanded, setIsBadgeExpanded] = useState(false);
  const timerRef = useRef(null);
  const eventRef = useRef(null);

  const [startX, setStartX] = useState(null);
  const [startY, setStartY] = useState(null);
  const moveThreshold = 10; // Adjust as needed

  // Handlers for long press with movement detection
  const handleMouseDown = (e) => {
    if (!isMyItemsActive) return;
    eventRef.current = e;
    timerRef.current = setTimeout(() => {
      eventRef.current.preventDefault();
      setIsPopupVisible(true);
    }, 500);
    setStartX(e.clientX);
    setStartY(e.clientY);
  };

  const handleMouseMove = (e) => {
    if (startX !== null && startY !== null) {
      const deltaX = Math.abs(e.clientX - startX);
      const deltaY = Math.abs(e.clientY - startY);
      if (deltaX > moveThreshold || deltaY > moveThreshold) {
        clearTimeout(timerRef.current);
      }
    }
  };

  const handleMouseUp = () => {
    clearTimeout(timerRef.current);
    setStartX(null);
    setStartY(null);
    eventRef.current = null;
  };

  const handleTouchStart = (e) => {
    if (!isMyItemsActive) return;
    eventRef.current = e;
    timerRef.current = setTimeout(() => {
      eventRef.current.preventDefault();
      setIsPopupVisible(true);
    }, 500);
    const touch = e.touches[0];
    setStartX(touch.clientX);
    setStartY(touch.clientY);
  };

  const handleTouchMove = (e) => {
    if (startX !== null && startY !== null) {
      const touch = e.touches[0];
      const deltaX = Math.abs(touch.clientX - startX);
      const deltaY = Math.abs(touch.clientY - startY);
      if (deltaX > moveThreshold || deltaY > moveThreshold) {
        clearTimeout(timerRef.current);
      }
    }
  };

  const handleTouchEnd = () => {
    clearTimeout(timerRef.current);
    setStartX(null);
    setStartY(null);
    eventRef.current = null;
  };

  // Handle menu icon click
  const handleMenuIconClick = (e) => {
    e.stopPropagation();
    if (!isMyItemsActive) return;
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
        onClick={() => onItemClick()}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {clickCount > 0 && (
          <div
            className={`${styles.numberBadge} ${
              isDeleteActive ? styles.numberBadgeRed : ''
            } ${isBadgeExpanded ? styles.numberBadgeExpanded : ''}`}
            onMouseEnter={() => setIsBadgeExpanded(true)}
            onMouseLeave={() => setIsBadgeExpanded(false)}
            onClick={(e) => {
              e.stopPropagation();
              setIsBadgeExpanded(true);
            }}
          >
            {isBadgeExpanded && (
              <button
                className={styles.minusButton}
                onClick={(e) => {
                  e.stopPropagation();
                  onItemClick('decrease'); // Decrease item count
                }}
              >
                -
              </button>
            )}
            <span className={styles.badgeNumber}>{clickCount}</span>
            {isBadgeExpanded && (
              <button
                className={styles.plusButton}
                onClick={(e) => {
                  e.stopPropagation();
                  onItemClick('increase'); // Increase item count
                }}
              >
                +
              </button>
            )}
          </div>
        )}
        {isMyItemsActive && (
          <div className={styles.menuIcon} onClick={handleMenuIconClick}>
            <ThreeDots />
          </div>
        )}
        <div className={styles.itemImagewrapper}>
          <img src={item.src} alt={item.name} className={styles.itemImage} />
        </div>
        <div className={styles.itemName}>{item.name}</div>
      </button>

      {isPopupVisible && (
        <ItemPopup
          item={item}
          onClose={handleClosePopup}
          onUpdateItem={onUpdateItem}
          onAddItem={onAddItem}
          itemInstance={itemInstance}
          onStartFresh={onStartFresh}
        />
      )}
    </li>
  );
}

export default Item;
