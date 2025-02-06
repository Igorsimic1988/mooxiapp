import React from 'react';
import styles from './LogisticsDetails.module.css';

/**
 * This component is very similar to DestinationDetails,
 * but for now we keep it minimal. We can expand the inner
 * content later as needed.
 */
function LogisticsDetails({ lead, onLeadUpdated, isCollapsed, setIsCollapsed }) {
  const toggleCollapse = () => setIsCollapsed((prev) => !prev);

  return (
    <div className={styles.logisticsContainer}>
      <div className={styles.logisticsHeader}>
        <span className={styles.logisticsTitle}>Logistics</span>
        <button className={styles.minusButton} onClick={toggleCollapse}>
          {isCollapsed ? '+' : '-'}
        </button>
      </div>

      {!isCollapsed && (
        <div className={styles.innerContent}>
          <p className={styles.placeholderText}>
            Logistics details go here. 
            (We will implement actual fields later.)
          </p>
        </div>
      )}
    </div>
  );
}

export default LogisticsDetails;
