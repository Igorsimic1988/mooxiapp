"use client";

import React, { useEffect, useRef, useState } from 'react';
import styles from './BcalculatorMyitems.module.css';
import ToggleSwitch from './ToogleSwitch/ToogleSwitch';

function BcalculatorMyitems({ isToggled, onToggle, itemCount, onActionClick, isMyItemsActive }) {
  const [shouldAnimate, setShouldAnimate] = useState(false);
  const prevCountRef = useRef(itemCount);
  const timeoutRef = useRef(null);

  useEffect(() => {
    // Check if this is not the initial render and the count changed
    if (prevCountRef.current !== undefined && itemCount !== prevCountRef.current) {
      // Clear any existing timeout
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      // Reset animation
      setShouldAnimate(false);
      
      // Force a reflow by reading a layout property
      void document.body.offsetHeight;
      
      // Start animation on next tick
      setTimeout(() => {
        setShouldAnimate(true);
        
        // Remove animation class after it completes
        timeoutRef.current = setTimeout(() => {
          setShouldAnimate(false);
        }, 600);
      }, 10);
    }
    
    prevCountRef.current = itemCount;
    
    // Cleanup
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [itemCount]);

  return (
    <div className={styles.filterHeader}>
      <div className={styles.leftSection}>
        {/* Removed the text from here */}
        <ToggleSwitch isToggled={isToggled} onToggle={onToggle} />
      </div>
      <button
        className={`${styles.actionButton} ${isMyItemsActive ? styles.activeButton : ''}`}
        onClick={onActionClick}
      >
        <p>My Items</p>
        <div className={`${styles.itemCount} ${shouldAnimate ? styles.pulse : ''}`}>
          <p>{itemCount}</p>
        </div>
      </button>
    </div>
  );
}

export default BcalculatorMyitems;