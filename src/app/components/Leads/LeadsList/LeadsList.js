"use client";

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
  'New Lead': {
    color: '#59B779',
    icon: () => null // no icon for new leads
  },
  'In Progress': {
    color: '#FAA61A',
    icon: () => (
      <Icon
        name="InProgress"
        className={styles.statusIcon}
        // We pass the color below so the SVG picks it up
        color="#FAA61A"
        width={18}
        height={18}
      />
    ),
  },
  'Quoted': {
    color: '#FFC61E',
    icon: () => (
      <Icon
        name="Quoted"
        className={styles.statusIcon}
        color="#FFC61E"
      />
    ),
  },
  'Bad Lead': {
    color: '#f65676',
    icon: () => (
      <Icon
        name="BadLead"
        className={styles.statusIcon}
        color="#f65676"
        width={14}
        height={14}
      />
    ),
  },
  'Declined': {
    color: '#D9534F',
    icon: () => (
      <Icon
        name="Declined"
        className={styles.statusIcon}
        color="#D9534F"
      />
    ),
  },
  'Booked': {
    color: '#3fa9f5',
    icon: () => (
      <Icon
        name="Booked"
        className={styles.statusIcon}
        color="#3fa9f5"
      />
    ),
  },
  'Move on Hold': {
    color: '#616161',
    icon: () => (
      <Icon
        name="OnHold"
        className={styles.statusIcon}
        color="#616161"
      />
    ),
  },
  'Canceled': {
    color: '#2f3236',
    icon: () => (
      <Icon
        name="Canceled"
        className={styles.statusIcon}
        color="#2f3236"
        width={12}
        height={12}
      />
    ),
  },
};

function LeadsList({ 
  leads, 
  onLeadClick, 
  activeTab, 
  leadsListRef, 
  onScroll, 
  transferModeActive, 
  selectedLeadJobNumber,
  recentlyUpdatedLeadId // NEW PROP FOR ANIMATION
}) {
  const isSearchResults = activeTab === 'Search Results';

  if (leads.length === 0) {
    return (
      <div className={styles.listContainer} ref={leadsListRef} onScroll={onScroll}>
        <div className={styles.emptyState}>
          {isSearchResults ? (
            <>
              
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
        // fallback to InProgress style if status is unknown
        const { color, icon } = statusMapping[lead.leadStatus] || {
          color: '#FAA61A',
          icon: () => (
            <Icon
              name="InProgress"
              className={styles.statusIcon}
              color="#FAA61A"
            />
          ),
        };

        // Check if this lead was recently updated
        const wasRecentlyUpdated = recentlyUpdatedLeadId === lead.id;

        // Default top/middle/bottom
        let topLineText     = lead.leadStatus;
        let showTopLineIcon = true;
        let middleLineText  = (activeTab === 'Active Leads')
          ? lead.nextAction
          : lead.leadActivity;
        let bottomLineText  = lead.salesName;

        // We'll handle adding a .completedText class if needed:
        let bottomLineClasses = `${styles.truncate} ${styles.salesName}`;
        
        // Add animation class if this lead was recently updated
        if (wasRecentlyUpdated) {
          bottomLineClasses += ` ${styles.salesNameUpdated}`;
        }

        // My Appointments
        if (activeTab === 'My Appointments') {
          topLineText     = lead.leadActivity || '';
          showTopLineIcon = false;
          middleLineText  = `${formatMonthDay(lead.surveyDate)} ${lead.surveyTime || ''}`.trim();

          // If next_action === "Completed" => bottom line is "Completed" in #3fa9f5
          if (lead.next_action === 'Completed') {
            bottomLineText    = 'Completed';
            bottomLineClasses = `${styles.truncate} ${styles.salesName} ${styles.completedText}`;
            // Still add animation if recently updated
            if (wasRecentlyUpdated) {
              bottomLineClasses += ` ${styles.salesNameUpdated}`;
            }
          } else {
            bottomLineText = lead.estimator || '';
          }
        }

        // Determine card class based on mode
        let cardClass = styles.card;

        // Only show selected card styling if NOT in search mode and NOT in transfer mode
        const showSelectedStyling = !isSearchResults && !transferModeActive;

        if (showSelectedStyling && lead.jobNumber === selectedLeadJobNumber) {
          cardClass = `${styles.card} ${styles.selectedCard}`;
        } else if (transferModeActive) {
          cardClass = `${styles.card} ${styles.transferCard}`;
        } else if (isSearchResults) {
          cardClass = `${styles.card} ${styles.searchResult}`;
        }

        return (
          <div
            className={cardClass}
            key={lead.jobNumber}
            onClick={() => onLeadClick(lead)}
          >
            {/* Column 1 */}
            <div className={styles.companyInfo}>
              <div className={`${styles.truncate} ${styles.companyName}`}>
                {lead.companyName}
              </div>
              <div className={`${styles.truncate} ${styles.jobNumber}`}>
                {lead.jobNumber}
              </div>
              <div className={styles.dateContainer}>
                <span className={`${styles.truncate} ${styles.dateText}`}>
                  {formatDate(lead.creationDateTime)}
                </span>
              </div>
            </div>

            {/* Column 2 */}
            <div className={styles.customerInfo}>
              <div className={styles.customerRow}>
                {lead.isNew ? (
                  <div className={styles.greenDot} />
                ) : (
                  <div className={styles.greenDotPlaceholder} />
                )}
                <div className={`${styles.truncate} ${styles.customerName}`}>
                  {lead.customerName}
                </div>
              </div>
              <div className={styles.customerRow}>
                <div className={styles.greenDotPlaceholder} />
                <div className={`${styles.truncate} ${styles.moveType}`}>
                  {lead.RateType}
                </div>
              </div>
              <div className={styles.customerRow}>
                <div className={styles.greenDotPlaceholder} />
                <div className={`${styles.truncate} ${styles.customerPhone}`}>
                  {formatPhone(lead.customerPhoneNumber)}
                </div>
              </div>
            </div>

            {/* Column 3 */}
            <div className={styles.leadStatusInfo}>
              <div className={styles.statusRow}>
                <span
                 className={styles.leadStatus}
                  // Apply the text color for the status
                  style={{ color }}
                >
                  {topLineText}
                </span>
                {/* Show icon if needed */}
                {showTopLineIcon && icon()}
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