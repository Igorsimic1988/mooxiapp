"use client";

import React, { useRef, useEffect } from 'react';
import styles from './LeadsFilterBar.module.css';

function LeadsFilterBar({ activeTab, onTabChange }) {
  const tabs = ["Active Leads", "Closed Leads", "My Appointments", "Pending", "Booked"];
  const containerRef = useRef(null);
  const isDraggingRef = useRef(false);
  const startXRef = useRef(0);
  const startScrollLeftRef = useRef(0);
  const clickTimeRef = useRef(0);

  useEffect(() => {
    if (!containerRef.current) return;

    const container = containerRef.current;
    
    // Set initial cursor style
    container.style.cursor = 'grab';
    
    function mouseDownHandler(e) {
      isDraggingRef.current = true;
      startXRef.current = e.pageX;
      startScrollLeftRef.current = container.scrollLeft;
      clickTimeRef.current = new Date().getTime();
      
      container.style.cursor = 'grabbing';
      container.style.userSelect = 'none';
    }

    function mouseUpHandler() {
      isDraggingRef.current = false;
      container.style.cursor = 'grab';
      container.style.removeProperty('user-select');
    }

    function mouseMoveHandler(e) {
      if (!isDraggingRef.current) return;
      
      // Calculate distance
      const x = e.pageX;
      const distance = x - startXRef.current;
      
      // Update scroll position
      container.scrollLeft = startScrollLeftRef.current - distance;
    }

    function clickHandler(e) {
      // Prevent the click from being processed if we were dragging
      // We determine this by checking if the mouse moved a significant distance
      // or if enough time passed during the mouse down/up cycle
      const moveTime = new Date().getTime() - clickTimeRef.current;
      
      // If we've been holding the mouse down for more than 150ms, it's probably a drag
      if (moveTime > 150) {
        e.stopPropagation();
      }
    }

    // Add event listeners
    container.addEventListener('mousedown', mouseDownHandler);
    window.addEventListener('mouseup', mouseUpHandler);
    window.addEventListener('mousemove', mouseMoveHandler);
    container.addEventListener('click', clickHandler, true);

    // Add touch event support for mobile
    container.addEventListener('touchstart', (e) => {
      isDraggingRef.current = true;
      startXRef.current = e.touches[0].pageX;
      startScrollLeftRef.current = container.scrollLeft;
      clickTimeRef.current = new Date().getTime();
    }, { passive: false });
    
    container.addEventListener('touchend', () => {
      isDraggingRef.current = false;
    });
    
    container.addEventListener('touchmove', (e) => {
      if (!isDraggingRef.current) return;
      
      const x = e.touches[0].pageX;
      const distance = x - startXRef.current;
      
      container.scrollLeft = startScrollLeftRef.current - distance;
      
      // Prevent page scrolling while dragging the filter
      e.preventDefault();
    }, { passive: false });

    // Clean up event listeners on unmount
    return () => {
      container.removeEventListener('mousedown', mouseDownHandler);
      window.removeEventListener('mouseup', mouseUpHandler);
      window.removeEventListener('mousemove', mouseMoveHandler);
      container.removeEventListener('click', clickHandler, true);
      
      container.removeEventListener('touchstart', mouseDownHandler);
      window.removeEventListener('touchend', mouseUpHandler);
      window.removeEventListener('touchmove', mouseMoveHandler);
    };
  }, []);


  return (
    <div className={styles.filterBarWrapper}>
      {/* Top curved bar component */}
      <div className={styles.topBarBack}>
        <div className={styles.topBar} />
      </div>
      
      {/* Original filter bar content */}
      <div className={styles.filterBarContainer} ref={containerRef}>
        <div className={styles.tabsContainer}>
          {tabs.map((tab) => {
            const isActive = (tab === activeTab);
            return (
              <button
                key={tab}
                className={`${styles.tabItem} ${isActive ? styles.active : ''}`}
                onClick={() => onTabChange(tab)}
              >
                {tab}
                {isActive && <div className={styles.activeIndicator}></div>}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default LeadsFilterBar;