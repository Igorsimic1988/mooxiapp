"use client";

import React from 'react';
import styles from './SimpleToggle.module.css';

function SimpleToggle({ isToggled, onToggle }) {
  const handleToggle = () => {
    if (onToggle) {
      onToggle(!isToggled);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleToggle();
    }
  };

  return (
    <div
      className={`${styles.toggleSwitch} ${isToggled ? styles.toggled : ''}`}
      onClick={handleToggle}
      role="switch"
      aria-checked={isToggled}
      tabIndex={0}
      onKeyPress={handleKeyPress}
      aria-label={isToggled ? 'Toggle is on' : 'Toggle is off'}
    >
      <div className={styles.toggleTrack}>
        <div className={styles.toggleThumb}></div>
      </div>
    </div>
  );
}

export default SimpleToggle;
