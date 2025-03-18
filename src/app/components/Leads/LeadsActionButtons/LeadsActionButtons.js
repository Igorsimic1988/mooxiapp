import React from 'react';
import styles from './LeadsActionButtons.module.css';
import Icon from '../../Icon';

/**
 * Props:
 *   onOpenFilterPopup - function to open the filter popup
 *   filterCount       - number indicating how many filters are active (default: 0)
 */
function LeadsActionButtons({ onOpenFilterPopup, filterCount = 0 }) {
  const hasFilters = filterCount > 0;

  return (
    <div className={styles.container}>
      {/* FILTER BUTTON */}
      <button
        className={styles.button}
        aria-label="Filter"
        onClick={onOpenFilterPopup}
      >
        <div
          className={
            hasFilters
              ? `${styles.iconBackground} ${styles.iconBackgroundActive}`
              : styles.iconBackground
          }
        >
          {/* If filters are active, show a badge with the count */}
          {hasFilters && (
            <span className={styles.badge}>{filterCount}</span>
          )}

          <Icon
            name="Filter"
            className={
              hasFilters
                ? `${styles.icon} ${styles.iconActive}`
                : styles.icon
            }
          />
        </div>
      </button>

      {/* TRANSFER BUTTON */}
      <button className={styles.button} aria-label="Transfer Lead">
        <div className={styles.iconBackground}>
          <Icon name="Transfer" className={styles.icon} />
        </div>
      </button>
    </div>
  );
}

export default LeadsActionButtons;
