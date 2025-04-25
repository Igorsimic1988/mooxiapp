"use client";

import React from 'react';
import styles from './BcalculatorMyitems.module.css';
import ToggleSwitch from './ToogleSwitch/ToogleSwitch';

function BcalculatorMyitems({ isToggled, onToggle, itemCount, onActionClick, isMyItemsActive }) {
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
        <div className={styles.itemCount}>
          <p>{itemCount}</p>
        </div>
      </button>
    </div>
  );
}

export default BcalculatorMyitems;
