import React, { useState } from 'react';
import styles from './LeadsFilterBar.module.css';

function LeadsFilterBar() {
  const tabs = ["Active Leads", "Closed Leads", "My Appointments", "Pending", "Booked"];
  const [activeTab, setActiveTab] = useState(tabs[0]);

  return (
    <div className={styles.filterBarContainer}>
      <div className={styles.tabsContainer}>
        {tabs.map((tab) => (
          <button 
            key={tab} 
            className={`${styles.tabItem} ${activeTab === tab ? styles.active : ''}`} 
            onClick={() => setActiveTab(tab)}
          >
            {tab}
            {activeTab === tab && <div className={styles.activeIndicator}></div>}
          </button>
        ))}
      </div>
    </div>
  );
}

export default LeadsFilterBar;
