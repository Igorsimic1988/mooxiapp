import React from 'react';
import styles from './LeadsList.module.css';
import Icon from 'src/app/components/Icon';


/**
 * Format creation_date_time => mm/dd/yyyy
 */
function formatDate(isoString) {
  if (!isoString) return '';
  const d = new Date(isoString);
  if (Number.isNaN(d.getTime())) return '';
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  const yy = d.getFullYear();
  return `${mm}/${dd}/${yy}`;
}

/**
 * Format phone => (555) 123-4567
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
  'New Lead':     { color: '#59B779', icon: () =>  null },
  'In Progress':  { color: '#FAA61A', icon: () => <Icon name="InProgress" className={styles.statusIcon}/> },
  'Quoted':       { color: '#FFC61E', icon: () => <Icon name="Quoted" className={styles.statusIcon} />},
  'Bad Lead':     { color: '#f65676', icon: () => <Icon name="BadLead" className={styles.statusIcon}/>},
  'Declined':     { color: '#D9534F', icon: () => <Icon name="Declined" className={styles.statusIcon}/> },
  'Booked':       { color: '#3fa9f5', icon: () => <Icon name="Booked" className={styles.statusIcon}/>},
  'Move on Hold': { color: '#616161', icon: () => <Icon name="OnHold" className={styles.statusIcon}/>},
  'Cancaled':     { color: '#2f3236', icon: () => <Icon name="Canceled" className={styles.statusIcon}/> },
};

function LeadsList({ leads, onLeadClick, activeTab, leadsListRef, onScroll }) {
  const isSearchResults = activeTab === 'Search Results';
  
  if (leads.length === 0) {
    return (
      <div className={styles.listContainer} ref={leadsListRef} onScroll={onScroll}>
        <div className={styles.emptyState}>
          {isSearchResults ? (
            <>
              <Icon name="Search" className={styles.emptyStateIcon} />
              <p className={styles.emptyStateText}>No results found</p>
              <p className={styles.emptyStateSubtext}>Try different search terms</p>
            </>
          ) : (
            <>
              <p className={styles.emptyStateText}>No leads found</p>
            </>
          )}
        </div>
      </div>
    );
  }
  return (
    <div
      className={styles.listContainer}
      ref={leadsListRef}
      onScroll={onScroll}
    >
      {leads.map((lead) => {
        const { color, icon } = statusMapping[lead.lead_status] || {
          color: '#FAA61A',
          icon: () => <Icon name="InProgress" className={styles.statusIcon}/>,
        };

        console.log(Icon)

        // Default top/middle/bottom
        let topLineText     = lead.lead_status;
        let showTopLineIcon = true;
        let middleLineText  = (activeTab === 'Active Leads')
          ? lead.next_action
          : lead.lead_activity;
        let bottomLineText  = lead.sales_name;

        // We'll handle adding a .completedText class if needed:
        let bottomLineClasses = `${styles.truncate} ${styles.salesName}`;

        // My Appointments
        if (activeTab === 'My Appointments') {
          topLineText     = lead.lead_activity || '';
          showTopLineIcon = false;
          middleLineText  = `${formatMonthDay(lead.survey_date)} ${lead.survey_time || ''}`.trim();

          // If next_action === "Completed" => bottom line is "Completed" in #3fa9f5
          if (lead.next_action === 'Completed') {
            bottomLineText    = 'Completed';
            bottomLineClasses = `${styles.truncate} ${styles.salesName} ${styles.completedText}`;
          } else {
            bottomLineText = lead.estimator || '';
          }
        }

        return (
          <div
            className={`${styles.card} ${isSearchResults ? styles.searchResult : ''}`}
            key={lead.job_number}
            onClick={() => onLeadClick(lead)}
          >
            {/* Column 1 */}
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

            {/* Column 2 */}
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

            {/* Column 3 */}
            <div className={styles.leadStatusInfo}>
              <div className={styles.statusRow}>
                <span
                  className={`${styles.truncate} ${styles.leadStatus}`}
                  style={{ color }}
                >
                  {topLineText}
                </span>
                {showTopLineIcon && Icon && (
                  icon()
                )}
              </div>

              <div className={`${styles.truncate} ${styles.nextAction}`}>
                {middleLineText}
              </div>

              <div className={bottomLineClasses}>
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