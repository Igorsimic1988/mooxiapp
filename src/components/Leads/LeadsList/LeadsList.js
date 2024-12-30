// src/components/Leads/LeadsList/LeadsList.js

import React from 'react';
import styles from './LeadsList.module.css';

// Import status icons
import { ReactComponent as InProgressIcon } from '../../../assets/icons/inProgress.svg';
import { ReactComponent as QuotedIcon } from '../../../assets/icons/quoted.svg';
import { ReactComponent as BadLeadIcon } from '../../../assets/icons/badlead.svg';
import { ReactComponent as DeclinedIcon } from '../../../assets/icons/declined.svg';
import { ReactComponent as BookedIcon } from '../../../assets/icons/booked.svg';
import { ReactComponent as OnHoldIcon } from '../../../assets/icons/onhold.svg';
import { ReactComponent as CanceledIcon } from '../../../assets/icons/canceled.svg';

function formatDate(isoString) {
  if (!isoString) return '';
  const d = new Date(isoString);
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  const yy = d.getFullYear();
  return `${mm}/${dd}/${yy}`;
}

function formatPhone(phone) {
  if (!phone) return '';
  const raw = phone.replace(/\D/g, '');
  if (raw.length === 10) {
    return `(${raw.slice(0,3)}) ${raw.slice(3,6)}-${raw.slice(6)}`;
  }
  return phone;
}

const statusMapping = {
  'New Lead':     { color: '#59B779', Icon: null },
  'In Progress':  { color: '#FAA61A', Icon: InProgressIcon },
  'Quoted':       { color: '#FFC61E', Icon: QuotedIcon },
  'Bad Lead':     { color: '#f65676', Icon: BadLeadIcon },
  'Declined':     { color: '#D9534F', Icon: DeclinedIcon },
  'Booked':       { color: '#3fa9f5', Icon: BookedIcon },
  'Move on Hold': { color: '#616161', Icon: OnHoldIcon },
  'Cancaled':     { color: '#2f3236', Icon: CanceledIcon },
};

function LeadsList({ leads, onLeadClick, activeTab }) {
  return (
    <div className={styles.listContainer}>
      {leads.map((lead) => {
        const { color, Icon } = statusMapping[lead.lead_status] || {
          color: '#FAA61A',
          Icon: InProgressIcon,
        };

        // Decide which text to show on the middle line of the 3rd column:
        // If "Active Leads" => show lead.next_action
        // else => show lead.lead_activity
        const middleLineText =
          activeTab === 'Active Leads' ? lead.next_action : lead.lead_activity;

        return (
          <div
            className={styles.card}
            key={lead.job_number}
            onClick={() => onLeadClick(lead)}
          >
            {/* Column 1: Company + JobNum + Date */}
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

            {/* Column 2: Customer info */}
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

            {/* Column 3: lead status + (next action OR activity) + sales rep */}
            <div className={styles.leadStatusInfo}>
              <div className={styles.statusRow}>
                <span
                  className={`${styles.truncate} ${styles.leadStatus}`}
                  style={{ color }}
                >
                  {lead.lead_status}
                </span>
                {Icon && (
                  <Icon className={styles.statusIcon} style={{ color }}/>
                )}
              </div>

              {/* Middle line: depends on Active Tab */}
              <div className={`${styles.truncate} ${styles.nextAction}`}>
                {middleLineText}
              </div>

              {/* Third line: Sales Rep */}
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
