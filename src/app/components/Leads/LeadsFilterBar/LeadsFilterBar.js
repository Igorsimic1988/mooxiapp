// src/components/Leads/LeadsFilterBar/LeadsFilterBar.js

import React from 'react';
import styles from './LeadsFilterBar.module.css';

function LeadsFilterBar({ activeTab, onTabChange }) {
  const tabs = ["Active Leads", "Closed Leads", "My Appointments", "Pending", "Booked"];

  return (
    <div className={styles.filterBarContainer}>
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
  );
}

export default LeadsFilterBar;
