// src/components/Inventory/ItemSelection/Item/Item.js

import React, { useState, useRef } from 'react';
import styles from './Item.module.css';
import { ReactComponent as ThreeDots } from '../../../../assets/icons/more.svg';

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
  isDesktop = false,
  isMoved = false,
  onOpenPopup, // Added prop
}) {
  const [isBadgeExpanded, setIsBadgeExpanded] = useState(false);
  const timerRef = useRef(null);
  const eventRef = useRef(null);

  const [startX, setStartX] = useState(null);
  const [startY, setStartY] = useState(null);
  const moveThreshold = 10; // Adjust as needed


  const handleItemClick = (e) => {
    if (isMoved) return;
    const action = isDeleteActive ? 'decrease' : 'increase';
    onItemClick(action, isMyItemsActive);
  };

  // Handlers for long press with movement detection
  const handleMouseDown = (e) => {
    if (!isMyItemsActive) return;
    eventRef.current = e;
    timerRef.current = setTimeout(() => {
      eventRef.current.preventDefault();
      onOpenPopup(item, itemInstance);
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
      onOpenPopup(item, itemInstance);
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
    onOpenPopup(item, itemInstance);
  };

  return (
    <li className={styles.item}>
      <button
        className={styles.card}
        onClick={handleItemClick}
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
              <div
                className={styles.minusButton}
                onClick={(e) => {
                  e.stopPropagation();
                  onItemClick('decrease');
                }}
                role="button"
                tabIndex={0}
                aria-label="Decrease count"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    onItemClick('decrease');
                  }
                }}
              >
                -
              </div>
            )}
            <span className={styles.badgeNumber}>{clickCount}</span>
            {isBadgeExpanded && (
              <div
                className={styles.plusButton}
                onClick={(e) => {
                  e.stopPropagation();
                  onItemClick('increase');
                }}
                role="button"
                tabIndex={0}
                aria-label="Increase count"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    onItemClick('increase');
                  }
                }}
              >
                +
              </div>
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
    </li>
  );
}

export default Item;
