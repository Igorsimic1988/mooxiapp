import React from 'react';
import styles from './Leads.module.css'; // CSS modules import
import HeaderDashboard from './HeadrerDashboard.js/HeaderDashboard';
import LeadsFilterBar from './LeadsFilterBar/LeadsFilterBar';
import LeadsSearchBar from './LeadsSearchBar/LeadsSearchBar';
import LeadsActionButtons from './LeadsActionButtons/LeadsActionButtons';
import AddNewLeadButton from './AddNewLeadButton/AddNewLeadButton';


function Leads() {
    return (
      <div className={styles.container}>
        <HeaderDashboard />
        <LeadsFilterBar />
        <LeadsSearchBar />
  
        {/* New row with left and right elements */}
        <div className={styles.actionsContainer}>
          <LeadsActionButtons />
          <AddNewLeadButton />
        </div>

      </div>
    );
  }
  
  export default Leads;