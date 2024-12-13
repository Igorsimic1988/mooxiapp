import React from 'react';
import styles from './LeadsList.module.css';
import { ReactComponent as InProgressIcon } from '../../../assets/icons/inProgress.svg';

function LeadsList({ leads, onLeadClick }) {
  return (
    <div className={styles.listContainer}>
      {leads.map((lead) => (
        <div 
          className={styles.card} 
          key={lead.job_number}
          onClick={() => onLeadClick(lead)}  /* trigger the panel open */
        >
          <div className={styles.companyInfo}>
            <div className={`${styles.truncate} ${styles.companyName}`}>{lead.company_name}</div>
            <div className={`${styles.truncate} ${styles.jobNumber}`}>{lead.job_number}</div>
            <div className={styles.dateContainer}>
              <span className={`${styles.truncate} ${styles.dateText}`}>{lead.creation_date_time}</span>
            </div>
          </div>
          
          <div className={styles.customerInfo}>
            <div className={styles.customerRow}>
              {lead.is_new ? <div className={styles.greenDot}></div> : <div className={styles.greenDotPlaceholder}></div>}
              <div className={`${styles.truncate} ${styles.customerName}`}>{lead.customer_name}</div>
            </div>
            <div className={styles.customerRow}>
              <div className={styles.greenDotPlaceholder}></div>
              <div className={`${styles.truncate} ${styles.moveType}`}>{lead.move_type}</div>
            </div>
            <div className={styles.customerRow}>
              <div className={styles.greenDotPlaceholder}></div>
              <div className={`${styles.truncate} ${styles.customerPhone}`}>{lead.customer_phone_number}</div>
            </div>
          </div>
          
          <div className={styles.leadStatusInfo}>
            <div className={styles.statusRow}>
              <span className={`${styles.truncate} ${styles.leadStatus}`}>{lead.lead_status}</span>
              <InProgressIcon className={styles.statusIcon} />
            </div>
            <div className={`${styles.truncate} ${styles.nextAction}`}>{lead.next_action}</div>
            <div className={`${styles.truncate} ${styles.salesName}`}>{lead.sales_name}</div>
          </div>
        </div>
      ))}
    </div>
  );
}

export default LeadsList;
