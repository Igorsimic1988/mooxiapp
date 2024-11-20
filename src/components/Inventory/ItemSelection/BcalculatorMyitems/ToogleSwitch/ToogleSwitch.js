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
    <div
      className={styles.toggleSwitch}
      onClick={handleToggle}
      role="switch"
      aria-checked={isToggled}
      tabIndex={0}
      onKeyPress={handleKeyPress}
      aria-label={isToggled ? 'Toggle is on' : 'Toggle is off'}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="48"
        height="24"
        viewBox="0 0 48 24"
        fill="none"
      >
        <rect
          x="0.5"
          y="0.5"
          width="47"
          height="23"
          rx="11.5"
          fill={isToggled ? "#C5E5FC" : "white"}
          stroke="#D8DCE0"
        />
        <circle
          cx={isToggled ? 36 : 12}
          cy="12"
          r="11"
          fill={isToggled ? "#3FA9F5" : "#90A4B7"}
          className={styles.toggleCircle}
        />
      </svg>
    </div>
  );
}

export default ToggleSwitch;