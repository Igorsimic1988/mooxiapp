"use client";

import React, { useRef } from 'react';
import styles from './ItemList.module.css';
import Item from '../Item/Item';

function ItemList({
  items,
  itemClickCounts,  // Object with counts for regular furniture items
  itemInstances = [], // Array of individual item instances
  onItemClick,
  isMyItemsActive,
  isDeleteActive,
  onUpdateItem,
  onAddItem,
  onStartFresh,
  setIsMyItemsActive,
  onBackToRooms,
  isDesktop = false,
  onOpenPopup,
}) {
  const touchStartXRef = useRef(null);
  const touchEndXRef = useRef(null);

  const scrollContainerRef = useRef(null);
  const isDragging = useRef(false);
  const isMoved = useRef(false);
  const dragThreshold = 5;
  const startY = useRef(0);
  const scrollTop = useRef(0);

  const handleMouseDown = (e) => {
    if (!isDesktop) return;
    if (e.type === 'touchstart' || e.pointerType === 'touch') return;

    isDragging.current = true;
    isMoved.current = false;
    startY.current = e.pageY - scrollContainerRef.current.getBoundingClientRect().top;
    scrollTop.current = scrollContainerRef.current.scrollTop;
  };

  const handleMouseMove = (e) => {
    if (!isDesktop || !isDragging.current) return;
    if (e.type === 'touchmove' || e.pointerType === 'touch') return;

    e.preventDefault();
    const y = e.pageY - scrollContainerRef.current.getBoundingClientRect().top;
    const walk = (y - startY.current) * 1;
    scrollContainerRef.current.scrollTop = scrollTop.current - walk;

    if (!isMoved.current && Math.abs(walk) > dragThreshold) {
      isMoved.current = true;
    }
  };

  const handleMouseUp = (e) => {
    if (!isDesktop) return;
    if (e.type === 'touchend' || e.pointerType === 'touch') return;

    isDragging.current = false;
    isMoved.current = false;
  };

  const handleMouseOut = (e) => {
    if (!isDesktop) return;
    if (e.type === 'touchcancel' || e.pointerType === 'touch') return;

    isDragging.current = false;
    isMoved.current = false;
  };

  const handleTouchStart = (e) => {
    if (isDesktop) return;
    touchStartXRef.current = e.touches[0].clientX;
  };

  const handleTouchMove = (e) => {
    if (isDesktop) return;
    touchEndXRef.current = e.touches[0].clientX;
  };

  const handleTouchEnd = () => {
    if (isDesktop) return;
    if (touchStartXRef.current === null || touchEndXRef.current === null) return;

    const deltaX = touchEndXRef.current - touchStartXRef.current;
    const minSwipeDistance = 50;

    if (Math.abs(deltaX) > minSwipeDistance) {
      if (deltaX < 0) {
        if (!isMyItemsActive) {
          setIsMyItemsActive(true);
        }
      } else {
        if (isMyItemsActive) {
          setIsMyItemsActive(false);
        } else {
          onBackToRooms();
        }
      }
    }

    touchStartXRef.current = null;
    touchEndXRef.current = null;
  };

  return (
    <div
      className={styles.itemListContainer}
      ref={scrollContainerRef}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseOut={handleMouseOut}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {Array.isArray(items) && items.length > 0 ? (
        <ul className={styles.itemList}>
         {items.map((itemData) => {
  let key, item, count, itemInstance;

  if (isMyItemsActive) {
    // For grouped items, use the groupingKey as the React key
    key = itemData.groupingKey || itemData.id;
    item = itemData.item || itemData;
    count = itemData.count || 1;
    itemInstance = itemData;
  } else {
    // For regular furniture items, use the furniture item ID
    const itemIdStr = itemData.id?.toString();
    key = itemIdStr;
    item = itemData;
    count = itemClickCounts[itemIdStr] || 0;
    itemInstance = itemInstances.find(inst => 
      (inst.furnitureItemId || inst.itemId)?.toString() === itemIdStr
    ) || null;
  }

  return (
    <Item
      key={key}
      item={item}
      clickCount={count}
      onItemClick={(action) => onItemClick(itemData, action)}
      isMyItemsActive={isMyItemsActive}
      isDeleteActive={isDeleteActive}
      onUpdateItem={onUpdateItem}
      onAddItem={onAddItem}
      itemInstance={itemInstance}
      onStartFresh={onStartFresh}
      isDesktop={isDesktop}
      isMoved={isMoved.current}
      onOpenPopup={onOpenPopup}
    />
  );
})}
        </ul>
      ) : (
        <p className={styles.noItems}>Start adding items to your room.</p>
      )}
    </div>
  );
}

export default ItemList;