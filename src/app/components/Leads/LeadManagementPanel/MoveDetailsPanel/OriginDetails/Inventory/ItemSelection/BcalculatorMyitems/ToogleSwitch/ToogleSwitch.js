// src/components/BcalculatorMyitems/ToggleSwitch/ToggleSwitch.js

import React from 'react';
import styles from './ToogleSwitch.module.css';

function ToggleSwitch({ isToggled, onToggle }) {
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
    <div className={styles.toggleSwitchContainer}>
      <span className={styles.filterText}>
        Boxes Auto
        <br />
        Calculator
      </span>
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
    </div>
  );
}

export default ToggleSwitch;