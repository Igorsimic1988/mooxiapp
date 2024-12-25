// src/components/Leads/LeadsList/LeadsList.js

import React from 'react';
import styles from './LeadsList.module.css';
import { ReactComponent as InProgressIcon } from '../../../assets/icons/inProgress.svg';

/**
 * Helper to format date as MM/DD/YYYY
 * @param {string} isoString - an ISO date string
 * @returns {string} formatted date e.g. "12/25/2024"
 */
function formatDate(isoString) {
  if (!isoString) return '';
  const dateObj = new Date(isoString);
  const month = String(dateObj.getMonth() + 1).padStart(2, '0'); // 0-11 => 1-12
  const day = String(dateObj.getDate()).padStart(2, '0');
  const year = dateObj.getFullYear();
  return `${month}/${day}/${year}`;
}

/**
 * Helper to format phone as (XXX) XXX-XXXX
 * If it's not exactly 10 digits (after removing non-digits),
 * we just return the original string.
 * @param {string} phone - the raw phone string
 * @returns {string} e.g. "(123) 456-7890"
 */
function formatPhone(phone) {
  if (!phone) return '';
  // Remove non-digit characters
  const raw = phone.replace(/\D/g, '');
  if (raw.length === 10) {
    return `(${raw.slice(0, 3)}) ${raw.slice(3, 6)}-${raw.slice(6)}`;
  }
  // fallback
  return phone;
}

function LeadsList({ leads, onLeadClick }) {
  // **No sorting here**, because we've already sorted in the parent (Leads.js).
  // We simply display the leads in the order they're given.
  return (
    <div className={styles.listContainer}>
      {leads.map((lead) => (
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
              <span className={`${styles.truncate} ${styles.leadStatus}`}>
                {lead.lead_status}
              </span>
              <InProgressIcon className={styles.statusIcon} />
            </div>
            <div className={`${styles.truncate} ${styles.nextAction}`}>
              {lead.next_action}
            </div>
            <div className={`${styles.truncate} ${styles.salesName}`}>
              {lead.sales_name}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export default LeadsList;
