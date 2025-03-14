import React from 'react';
import styles from './LeadsActionButtons.module.css';
import Icon from '../../Icon'

function LeadsActionButtons({ onOpenFilterPopup }) {
  return (
    <div className={styles.container}>
      <button
        className={styles.button}
        aria-label="Filter"
        onClick={onOpenFilterPopup}    // ← Add this callback
      >
        <div className={styles.iconBackground}>
          <Icon name="Filter" className={styles.icon} />
        </div>
      </button>

      <button className={styles.button} aria-label="Transfer Lead">
        <div className={styles.iconBackground}>
          <Icon name="Transfer" className={styles.icon} />
        </div>
      </button>
    </div>
  );
}

export default LeadsActionButtons;
