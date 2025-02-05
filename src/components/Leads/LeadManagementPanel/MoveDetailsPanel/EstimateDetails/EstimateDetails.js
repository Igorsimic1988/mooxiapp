// src/components/Leads/LeadManagementPanel/MoveDetailsPanel/EstimateDetails/EstimateDetails.js

import React, { useState } from 'react';
import styles from './EstimateDetails.module.css';

/**
 * Clone of DestinationDetails but with "Estimate" 
 * in the header and collapsed by default.
 */
function EstimateDetails({ lead, onLeadUpdated }) {
  // Collapsible state (closed by default)
  const [isCollapsed, setIsCollapsed] = useState(true);
  const toggleCollapse = () => setIsCollapsed((prev) => !prev);

  return (
    <div className={styles.estimateContainer}>
      <div className={styles.estimateHeader}>
        <span className={styles.estimateTitle}>Estimate</span>
        <button className={styles.minusButton} onClick={toggleCollapse}>
          {isCollapsed ? '+' : '-'}
        </button>
      </div>

      {!isCollapsed && (
        <div className={styles.innerContent}>
          {/* 
            Placeholder for future estimate-related fields.
          */}
          <p className={styles.placeholderText}>
            Estimate details go here. 
            (We will implement actual fields later.)
          </p>
        </div>
      )}
    </div>
  );
}

export default EstimateDetails;
