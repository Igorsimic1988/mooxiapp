// src/components/Leads/LeadManagementPanel/LeadManagementPanel.js

import React, { useState, useEffect, useRef } from 'react';
import { ReactComponent as CustomerUserIcon } from '../../../assets/icons/customeruser.svg';
import { ReactComponent as MoreIcon } from '../../../assets/icons/more.svg';
import { ReactComponent as EditIcon } from '../../../assets/icons/edit.svg';

// Status icons
import { ReactComponent as InProgressIcon } from '../../../assets/icons/inProgress.svg';
import { ReactComponent as QuotedIcon } from '../../../assets/icons/quoted.svg';
import { ReactComponent as BadLeadIcon } from '../../../assets/icons/badlead.svg';
import { ReactComponent as DeclinedIcon } from '../../../assets/icons/declined.svg';
import { ReactComponent as OnHoldIcon } from '../../../assets/icons/onhold.svg';
import { ReactComponent as CanceledIcon } from '../../../assets/icons/canceled.svg';
import { ReactComponent as BookedIcon } from '../../../assets/icons/booked.svg';
// Removed CompletedIcon import since we’re removing “Completed”

// Other icons
import { ReactComponent as UnfoldMoreIcon } from '../../../assets/icons/unfoldmore.svg';
import { ReactComponent as UserIcon } from '../../../assets/icons/user.svg';
import { ReactComponent as SpecialHIcon } from '../../../assets/icons/specialh.svg';

import MoveDetailsPanel from './MoveDetailsPanel/MoveDetailsPanel';
import Inventory from './MoveDetailsPanel/OriginDetails/Inventory/Inventory';
import styles from './LeadManagementPanel.module.css';

/**
 * Status definitions with label, color, icon, and isDisabled
 * "New Lead" is included but isDisabled (we'll hide it from the dropdown).
 * COMPLETELY REMOVE "Completed"
 */
const statusOptions = [
  { label: 'New Lead',      color: '#59B779', icon: null,             isDisabled: true },
  { label: 'In Progress',   color: '#FAA61A', icon: <InProgressIcon />, isDisabled: false },
  { label: 'Quoted',        color: '#FFC61E', icon: <QuotedIcon />,    isDisabled: false },
  { label: 'Bad Lead',      color: '#f65676', icon: <BadLeadIcon />,   isDisabled: false },
  { label: 'Declined',      color: '#D9534F', icon: <DeclinedIcon />,  isDisabled: false },
  { label: 'Booked',        color: '#3fa9f5', icon: <BookedIcon />,    isDisabled: false },
  { label: 'Move on Hold',  color: '#616161', icon: <OnHoldIcon />,    isDisabled: false },
  { label: 'Cancaled',      color: '#2f3236', icon: <CanceledIcon />,  isDisabled: false },
  // Removed the "Completed" entry entirely
];

/**
 * Decide which Activity options appear based on leadStatus.
 * REMOVED the "case 'Completed': ..." 
 */
function getActivityOptions(status) {
  switch (status) {
    case 'New Lead':
      return ['Contacting'];
    case 'In Progress':
      return ['Contacting', 'Info Gathering', 'In Home Estimate', 'Virtual Estimate'];
    case 'Quoted':
      return ['Quote Follow Up', 'Awaiting Decision', 'Negotiation'];
    case 'Bad Lead':
      return ['Invalid Contact', 'Duplicate Lead', 'Not Qulified', 'Spam'];
    case 'Declined':
      return ['Pricing Issue', 'Chose Competitor', 'Timing Conflict', 'Service Not Needed'];
    case 'Booked':
      return ['Regular Booked', 'Booked on 1st Call', 'Booked Online'];
    case 'Cancaled':
      return ['Customer Canceled', 'Company Canceled'];
    default:
      // For "Move on Hold", we hide the Activity button 
      // or if unknown, return empty.
      return [];
  }
}

function LeadManagementPanel({ lead, onClose, onEditLead }) {
  // Show/Hide the Inventory modal
  const [showInventory, setShowInventory] = useState(false);

  // Status
  const [showStatusDropdown, setShowStatusDropdown] = useState(false);
  const [leadStatus, setLeadStatus] = useState(lead.lead_status);

  // Activity
  const [showActivityDropdown, setShowActivityDropdown] = useState(false);
  const [leadActivity, setLeadActivity] = useState(lead.lead_activity || 'Contacting');

  // Refs for outside-click detection
  const statusContainerRef = useRef(null);
  const activityContainerRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(e) {
      if (showStatusDropdown && statusContainerRef.current && !statusContainerRef.current.contains(e.target)) {
        setShowStatusDropdown(false);
      }
      if (showActivityDropdown && activityContainerRef.current && !activityContainerRef.current.contains(e.target)) {
        setShowActivityDropdown(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showStatusDropdown, showActivityDropdown]);

  // If we are showing the Inventory panel, do that first
  if (showInventory) {
    return <Inventory onCloseInventory={() => setShowInventory(false)} />;
  }

  const handleEditClick = () => {
    if (onEditLead) {
      onEditLead(lead);
    }
  };

  const handleToggleStatusDropdown = () => {
    setShowStatusDropdown((prev) => !prev);
  };

  const handleToggleActivityDropdown = () => {
    setShowActivityDropdown((prev) => !prev);
  };

  const handleSelectStatus = (option) => {
    if (option.isDisabled) return;
    setLeadStatus(option.label);
    setShowStatusDropdown(false);

    // Also reset Activity to the first option for the new status
    const newActivities = getActivityOptions(option.label);
    setLeadActivity(newActivities[0] || '');
  };

  const handleSelectActivity = (activityValue) => {
    setLeadActivity(activityValue);
    setShowActivityDropdown(false);
  };

  // Figure out color & icon
  const currentStatusObj = statusOptions.find((opt) => opt.label === leadStatus);
  const statusColor = currentStatusObj ? currentStatusObj.color : '#59B779';
  const statusIcon = currentStatusObj ? currentStatusObj.icon : null;

  // Activity options
  const activityOptions = getActivityOptions(leadStatus);
  // Hide the Activity button entirely for "Move on Hold"
  const hideActivityButton = (leadStatus === 'Move on Hold');

  const source = lead.source || 'Yelp';

  return (
    <div className={styles.wrapper}>
      <div className={styles.panelContainer}>
        {/* Top Row */}
        <div className={styles.topRow}>
          <div className={styles.leftSection}>
            <CustomerUserIcon className={styles.customerIcon} />
            <span className={styles.customerName}>{lead.customer_name}</span>
          </div>
          <div className={styles.rightSection}>
            <div className={styles.scoreContainer}>
              <span className={styles.scoreLabel}>Score: </span>
              <span className={styles.scoreValue}>40</span>
            </div>
            <button className={styles.moreButton}>
              <MoreIcon className={styles.moreIcon} />
            </button>
          </div>
        </div>

        {/* Contact Row */}
        <div className={styles.contactRow}>
          <div className={styles.infoChip}>{lead.customer_phone_number}</div>
          <div className={styles.emailRow}>
            <div className={styles.infoChip}>
              {lead.customer_email || 'No Email'}
            </div>
            <button className={styles.editButton} onClick={handleEditClick}>
              <EditIcon className={styles.editIcon} />
            </button>
          </div>
        </div>

        {/* Buttons Row */}
        <div className={styles.buttonsRow}>
          {/* STATUS */}
          <div ref={statusContainerRef} style={{ position: 'relative', width: '100%' }}>
            <button
              type="button"
              className={styles.statusButton}
              onClick={handleToggleStatusDropdown}
            >
              <div className={styles.statusContent}>
                <span className={styles.statusTextLabel}>Status:</span>
                <span
                  className={styles.statusTextValue}
                  style={{ color: statusColor }}
                >
                  {leadStatus}
                </span>
              </div>
              {/* Hide the icon container if it's "New Lead" */}
              {leadStatus !== 'New Lead' && (
                <div className={styles.statusIconContainer}>
                  {statusIcon}
                </div>
              )}
            </button>

            {showStatusDropdown && (
              <ul className={styles.statusDropdown}>
                {/* Filter out "New Lead" from the dropdown */}
                {statusOptions
                  .filter((opt) => opt.label !== 'New Lead')
                  .map((option) => {
                    const isSelected = (option.label === leadStatus);
                    return (
                      <li
                        key={option.label}
                        className={`${styles.statusOption} ${
                          isSelected ? styles.selectedOption : ''
                        }`}
                        style={{ color: option.color }}
                        onClick={() => handleSelectStatus(option)}
                      >
                        {option.label}
                      </li>
                    );
                  })}
              </ul>
            )}
          </div>

          {/* ACTIVITY */}
          {!hideActivityButton && (
            <div ref={activityContainerRef} style={{ position: 'relative', width: '100%' }}>
              <button
                type="button"
                className={styles.activityButton}
                onClick={handleToggleActivityDropdown}
              >
                <div className={styles.activityContent}>
                  <span className={styles.activityLabel}>Activity:</span>
                  <span className={styles.activityValue}>{leadActivity}</span>
                </div>
                <UnfoldMoreIcon className={styles.unfoldIcon} />
              </button>
              {showActivityDropdown && (
                <ul className={styles.activityDropdown}>
                  {activityOptions.map((activityName) => {
                    const isSelected = (activityName === leadActivity);
                    return (
                      <li
                        key={activityName}
                        className={`${styles.activityOption} ${
                          isSelected ? styles.selectedOption : ''
                        }`}
                        onClick={() => handleSelectActivity(activityName)}
                      >
                        {activityName}
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          )}

          {/* NEXT ACTION */}
          <button className={styles.nextActionButton}>
            <span className={styles.nextActionLabel}>Next Action:</span>
            <span className={styles.nextActionValue}>
              {lead.next_action || '—'}
            </span>
          </button>
        </div>

        {/* Source & Previous Requests */}
        <div className={styles.sourceSection}>
          <span className={styles.sourceLabel}>Source:</span>
          <span className={styles.sourceValue}>{source}</span>
        </div>
        <div className={styles.previousRequestsLabel}>Previous Requests:</div>
        <div className={styles.requestsButtonsContainer}>
          <button className={styles.inviteButton}>
            <span className={styles.inviteText}>Invite Customer</span>
            <div className={styles.inviteIconContainer}>
              <UserIcon className={styles.userIcon} />
            </div>
          </button>

          <button className={styles.inventoryButton}>
            <span className={styles.inventoryText}>Detailed Inventory Quote</span>
            <div className={styles.inventoryIconContainer}>
              <SpecialHIcon className={styles.specialHIcon} />
            </div>
          </button>
        </div>
      </div>

      <MoveDetailsPanel onShowInventory={() => setShowInventory(true)} />
    </div>
  );
}

export default LeadManagementPanel;
