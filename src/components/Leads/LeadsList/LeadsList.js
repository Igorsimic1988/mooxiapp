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

/**
 * Format creation_date_time as mm/dd/yyyy
 */
function formatDate(isoString) {
  if (!isoString) return '';
  const d = new Date(isoString);
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  const yy = d.getFullYear();
  return `${mm}/${dd}/${yy}`;
}

/**
 * Format phone number, e.g. (555) 123-4567
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
 * Format survey_date as "Jul 23" (month + day, no year).
 */
function formatMonthDay(isoString) {
  if (!isoString) return '';
  const d = new Date(isoString);
  if (isNaN(d)) return ''; 
  const monthNames = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  const month = monthNames[d.getMonth()];
  const day   = d.getDate();
  return `${month} ${day}`;
}

/**
 * Color/icon for each lead_status
 */
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
        // Default color/icon if not found
        const { color, Icon } = statusMapping[lead.lead_status] || {
          color: '#FAA61A',
          Icon: InProgressIcon,
        };

        // By default:
        //  - top line => lead_status + icon
        //  - middle line => next_action if "Active Leads", else lead_activity
        //  - bottom line => sales_name
        let topLineText     = lead.lead_status;
        let showTopLineIcon = true;
        let middleLineText  = (activeTab === 'Active Leads') 
                                ? lead.next_action 
                                : lead.lead_activity;
        let bottomLineText  = lead.sales_name;

        // For "My Appointments":
        //  - top line => lead_activity (NO ICON).
        //    => This can be "In Home Estimate" or "Virtual Estimate" or anything else your data might have.
        //  - middle line => "Jul 23 10:00 AM" => formatMonthDay + survey_time
        //  - bottom line => lead.estimator
        if (activeTab === 'My Appointments') {
          topLineText     = lead.lead_activity || '';
          showTopLineIcon = false;
          middleLineText  = `${formatMonthDay(lead.survey_date)} ${lead.survey_time || ''}`.trim();
          bottomLineText  = lead.estimator || '';
        }

        return (
          <div
            className={styles.card}
            key={lead.job_number}
            onClick={() => onLeadClick(lead)}
          >
            {/* ---- Column 1: Company + JobNum + Date ---- */}
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

            {/* ---- Column 2: Customer info ---- */}
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

            {/* ---- Column 3: Top / Middle / Bottom lines ---- */}
            <div className={styles.leadStatusInfo}>
              {/* top line => either lead_status + icon, or lead_activity alone */}
              <div className={styles.statusRow}>
                <span
                  className={`${styles.truncate} ${styles.leadStatus}`}
                  style={{ color }}
                >
                  {topLineText}
                </span>
                {showTopLineIcon && Icon && (
                  <Icon className={styles.statusIcon} style={{ color }}/>
                )}
              </div>

              {/* middle line => depends on tab */}
              <div className={`${styles.truncate} ${styles.nextAction}`}>
                {middleLineText}
              </div>

              {/* bottom line => either sales_name or estimator */}
              <div className={`${styles.truncate} ${styles.salesName}`}>
                {bottomLineText}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default LeadsList;
