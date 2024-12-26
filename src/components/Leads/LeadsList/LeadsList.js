// src/components/Leads/LeadsList/LeadsList.js

import React from 'react';
import styles from './LeadsList.module.css';

// Import all the status icons we need:
import { ReactComponent as InProgressIcon } from '../../../assets/icons/inProgress.svg';
import { ReactComponent as QuotedIcon } from '../../../assets/icons/quoted.svg';
import { ReactComponent as BadLeadIcon } from '../../../assets/icons/badlead.svg';
import { ReactComponent as DeclinedIcon } from '../../../assets/icons/declined.svg';
import { ReactComponent as BookedIcon } from '../../../assets/icons/booked.svg';
import { ReactComponent as OnHoldIcon } from '../../../assets/icons/onhold.svg';
import { ReactComponent as CanceledIcon } from '../../../assets/icons/canceled.svg';

/**
 * Helper to format date as MM/DD/YYYY
 */
function formatDate(isoString) {
  if (!isoString) return '';
  const dateObj = new Date(isoString);
  const month = String(dateObj.getMonth() + 1).padStart(2, '0');
  const day = String(dateObj.getDate()).padStart(2, '0');
  const year = dateObj.getFullYear();
  return `${month}/${day}/${year}`;
}

/**
 * Helper to format phone as (XXX) XXX-XXXX
 * If it's not exactly 10 digits, return original string
 */
function formatPhone(phone) {
  if (!phone) return '';
  const raw = phone.replace(/\D/g, '');
  if (raw.length === 10) {
    return `(${raw.slice(0, 3)}) ${raw.slice(3, 6)}-${raw.slice(6)}`;
  }
  return phone;
}

/**
 * A small map from lead_status to color + Icon component
 */
const statusMapping = {
  'New Lead': {
    color: '#59B779',
    Icon: null
  },
  'In Progress': {
    color: '#FAA61A',
    Icon: InProgressIcon
  },
  'Quoted': {
    color: '#FFC61E',
    Icon: QuotedIcon
  },
  'Bad Lead': {
    color: '#f65676',
    Icon: BadLeadIcon
  },
  'Declined': {
    color: '#D9534F',
    Icon: DeclinedIcon
  },
  'Booked': {
    color: '#3fa9f5',
    Icon: BookedIcon
  },
  'Move on Hold': {
    color: '#616161',
    Icon: OnHoldIcon
  },
  'Cancaled': {
    color: '#2f3236',
    Icon: CanceledIcon
  }
};

function LeadsList({ leads, onLeadClick }) {
  return (
    <div className={styles.listContainer}>
      {leads.map((lead) => {
        // Figure out the color & icon for the current lead_status
        const { color, Icon } = statusMapping[lead.lead_status] || {
          color: '#FAA61A', // fallback
          Icon: InProgressIcon // fallback
        };

        return (
          <div
            className={styles.card}
            key={lead.job_number}
            onClick={() => onLeadClick(lead)}
          >
            <div className={styles.companyInfo}>
              <div className={`${styles.truncate} ${styles.companyName}`}>
                {lead.company_name}
              </div>
              <div className={`${styles.truncate} ${styles.jobNumber}`}>
                {lead.job_number}
              </div>
              <div className={styles.dateContainer}>
                <span className={`${styles.truncate} ${styles.dateText}`}>
                  {formatDate(lead.creation_date_time)}
                </span>
              </div>
            </div>

            <div className={styles.customerInfo}>
              <div className={styles.customerRow}>
                {lead.is_new ? (
                  <div className={styles.greenDot} />
                ) : (
                  <div className={styles.greenDotPlaceholder} />
                )}
                <div className={`${styles.truncate} ${styles.customerName}`}>
                  {lead.customer_name}
                </div>
              </div>
              <div className={styles.customerRow}>
                <div className={styles.greenDotPlaceholder} />
                <div className={`${styles.truncate} ${styles.moveType}`}>
                  {lead.rate_type}
                </div>
              </div>
              <div className={styles.customerRow}>
                <div className={styles.greenDotPlaceholder} />
                <div className={`${styles.truncate} ${styles.customerPhone}`}>
                  {formatPhone(lead.customer_phone_number)}
                </div>
              </div>
            </div>

            <div className={styles.leadStatusInfo}>
              <div className={styles.statusRow}>
                {/* Apply dynamic color to the status text */}
                <span
                  className={`${styles.truncate} ${styles.leadStatus}`}
                  style={{ color }}
                >
                  {lead.lead_status}
                </span>
                {/* If there's an icon, render it with the same color */}
                {Icon && (
                  <Icon
                    className={styles.statusIcon}
                    style={{ color }}
                  />
                )}
              </div>
              <div className={`${styles.truncate} ${styles.nextAction}`}>
                {lead.next_action}
              </div>
              <div className={`${styles.truncate} ${styles.salesName}`}>
                {lead.sales_name}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default LeadsList;
