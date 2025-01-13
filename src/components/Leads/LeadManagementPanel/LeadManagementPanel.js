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

// Other icons
import { ReactComponent as UnfoldMoreIcon } from '../../../assets/icons/unfoldmore.svg';
import { ReactComponent as UserIcon } from '../../../assets/icons/user.svg';
import { ReactComponent as SpecialHIcon } from '../../../assets/icons/specialh.svg';
import { ReactComponent as CalendarIcon } from '../../../assets/icons/calendar.svg';

import MoveDetailsPanel from './MoveDetailsPanel/MoveDetailsPanel';
import Inventory from './MoveDetailsPanel/OriginDetails/Inventory/Inventory';
import styles from './LeadManagementPanel.module.css';

import PossibleSalesReps from '../../../data/constants/PossibleSalesReps';

/** Status definitions */
const statusOptions = [
  { label: 'New Lead',    color: '#59B779', icon: null,               isDisabled: true },
  { label: 'In Progress', color: '#FAA61A', icon: <InProgressIcon />, isDisabled: false },
  { label: 'Quoted',      color: '#FFC61E', icon: <QuotedIcon />,      isDisabled: false },
  { label: 'Bad Lead',    color: '#f65676', icon: <BadLeadIcon />,     isDisabled: false },
  { label: 'Declined',    color: '#D9534F', icon: <DeclinedIcon />,    isDisabled: false },
  { label: 'Booked',      color: '#3fa9f5', icon: <BookedIcon />,      isDisabled: false },
  { label: 'Move on Hold',color: '#616161', icon: <OnHoldIcon />,      isDisabled: false },
  { label: 'Cancaled',    color: '#2f3236', icon: <CanceledIcon />,    isDisabled: false },
];

/** Activities by status */
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
      return ['Not Reachable', 'Pricing Issue', 'Chose Competitor', 'Timing Conflict', 'Service Not Needed'];
    case 'Booked':
      return ['Regular Booked', 'Booked on 1st Call', 'Booked Online'];
    case 'Cancaled':
      return ['Customer Canceled', 'Company Canceled'];
    default:
      // "Move on Hold" => no activity
      return [];
  }
}

/** Time slots from 7:00 AM to 9:00 PM */
function generateTimeSlots() {
  const slots = [];
  let hour = 7;
  let minute = 0;
  while (hour < 21) {
    const suffix = hour >= 12 ? 'PM' : 'AM';
    let displayHour = hour % 12;
    if (displayHour === 0) displayHour = 12;

    const mm = minute.toString().padStart(2, '0');
    slots.push(`${displayHour}:${mm} ${suffix}`);

    minute += 15;
    if (minute >= 60) {
      minute = 0;
      hour += 1;
    }
  }
  return slots;
}
const timeSlots = generateTimeSlots();

/** HIDDEN_STATUSES => hide NextAction */
const HIDDEN_STATUSES = ['Bad Lead', 'Declined', 'Booked', 'Move on Hold', 'Cancaled'];

/** The inventory dropdown options */
const inventoryDropdownOptions = [
  {
    label: 'Detailed Inventory Quote',
    textColor: '#3FA9F5',
    iconBg: '#3FA9F5',
  },
  {
    label: 'Quick Estimate',
    textColor: '#faa612',
    iconBg: '#faa612',
  },
  {
    label: 'I Know My Shipment Size',
    textColor: '#616161',
    iconBg: '#90a4b7',
  },
];

/**
 * Helper to format a 10-digit phone string (e.g. "6789091876") as "(678) 909-1876".
 * If phone is shorter or longer, we do a best-effort approach.
 */
function formatPhoneNumber(digits) {
  if (!digits) return '';
  const raw = digits.replace(/\D/g, ''); // ensure only digits
  if (!raw) return '';

  // up to 10 digits
  let trimmed = raw;
  if (trimmed.length > 10) {
    trimmed = trimmed.slice(-10); // just the last 10 digits
  }

  // For display: (xxx) xxx-xxxx
  const area = trimmed.slice(0, 3);
  const mid  = trimmed.slice(3, 6);
  const last = trimmed.slice(6);
  if (!area) return '';
  if (!mid)  return `(${area}`;
  if (!last) return `(${area}) ${mid}`;
  return `(${area}) ${mid}-${last}`;
}

/**
 * LeadManagementPanel
 *
 * Props:
 *  - lead: the current lead object
 *  - onClose: (optional) close the panel
 *  - onEditLead: invoked if user clicks the Edit icon
 *  - onLeadUpdated: invoked whenever the lead is updated
 */
function LeadManagementPanel({ lead, onClose, onEditLead, onLeadUpdated }) {
  const [showInventory, setShowInventory] = useState(false);

  // status, activity, nextAction
  const [leadStatus, setLeadStatus]     = useState(lead.lead_status);
  const [leadActivity, setLeadActivity] = useState(lead.lead_activity || 'Contacting');
  const [nextAction, setNextAction]     = useState(lead.next_action || '—');
  const [hideNextActionAfterSurvey, setHideNextActionAfterSurvey] = useState(false);

  // [ANIMATION] nextAction bounce
  const [animateNextAction, setAnimateNextAction] = useState(false);

  // parse date/time
  function convertToDateString(possibleDate) {
    if (!possibleDate) return '';
    const d = new Date(possibleDate);
    return isNaN(d) ? '' : d.toDateString();
  }
  const [selectedEstimator, setSelectedEstimator] = useState(lead.estimator || '');
  const [selectedDate, setSelectedDate]           = useState(convertToDateString(lead.survey_date));
  const [selectedTime, setSelectedTime]           = useState(lead.survey_time || '');

  // inventory option => read from lead.inventory_option
  const [inventoryOption, setInventoryOption] = useState(
    lead.inventory_option || 'Detailed Inventory Quote'
  );
  const [showInventoryDropdown, setShowInventoryDropdown] = useState(false);
  const inventoryRef = useRef(null);

  // show/hide dropdowns
  const [showStatusDropdown, setShowStatusDropdown] = useState(false);
  const [showActivityDropdown, setShowActivityDropdown] = useState(false);
  const [showEstimatorDropdown, setShowEstimatorDropdown] = useState(false);

  // Refs for outside-click detection
  const statusContainerRef   = useRef(null);
  const activityContainerRef = useRef(null);

  // Calendar
  const [showCalendar, setShowCalendar]   = useState(false);
  const [calendarMonth, setCalendarMonth] = useState(new Date());
  const [daysInMonth, setDaysInMonth]     = useState([]);

  // Time
  const [showTimeDropdown, setShowTimeDropdown] = useState(false);

  // Build days array whenever user changes month
  useEffect(() => {
    const y = calendarMonth.getFullYear();
    const m = calendarMonth.getMonth();
    const totalDays = new Date(y, m + 1, 0).getDate();
    const arr = [];
    for (let i = 1; i <= totalDays; i++) {
      arr.push(i);
    }
    setDaysInMonth(arr);
  }, [calendarMonth]);

  // Click outside => close dropdowns
  useEffect(() => {
    function handleClickOutside(e) {
      if (
        showStatusDropdown &&
        statusContainerRef.current &&
        !statusContainerRef.current.contains(e.target)
      ) {
        setShowStatusDropdown(false);
      }
      if (
        showActivityDropdown &&
        activityContainerRef.current &&
        !activityContainerRef.current.contains(e.target)
      ) {
        setShowActivityDropdown(false);
      }
      if (
        showInventoryDropdown &&
        inventoryRef.current &&
        !inventoryRef.current.contains(e.target)
      ) {
        setShowInventoryDropdown(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [
    showStatusDropdown,
    showActivityDropdown,
    showInventoryDropdown,
  ]);

  // If user opens Inventory overlay
  if (showInventory) {
    return <Inventory onCloseInventory={() => setShowInventory(false)} />;
  }

  // "Edit" => pop up form
  const handleEditClick = () => {
    if (onEditLead) onEditLead(lead);
  };

  // -----------
  // Status logic
  // -----------
  const handleToggleStatusDropdown = () => {
    setShowStatusDropdown((prev) => !prev);
  };
  const handleSelectStatus = (option) => {
    if (option.isDisabled) return;
    setShowStatusDropdown(false);

    const newStatus = option.label;
    let newActivity = getActivityOptions(newStatus)[0] || '';
    let newNextAction = nextAction;

    if (HIDDEN_STATUSES.includes(newStatus)) {
      newNextAction = '';
    } else if (newStatus === 'In Progress') {
      newNextAction = 'Attempt 1';
      setHideNextActionAfterSurvey(false);
    } else if (newStatus === 'Quoted') {
      newNextAction = 'Follow up 1';
      setHideNextActionAfterSurvey(false);
    }

    setLeadStatus(newStatus);
    setLeadActivity(newActivity);
    setNextAction(newNextAction);

    if (onLeadUpdated) {
      onLeadUpdated({
        ...lead,
        lead_status: newStatus,
        lead_activity: newActivity,
        next_action: newNextAction,
        estimator: selectedEstimator,
        survey_date: selectedDate,
        survey_time: selectedTime,
        inventory_option: inventoryOption,
      });
    }
  };

  // -----------
  // Activity logic
  // -----------
  const handleToggleActivityDropdown = () => {
    setShowActivityDropdown((prev) => !prev);
  };
  const handleSelectActivity = (activityValue) => {
    setShowActivityDropdown(false);

    // Remember the old
    const oldActivity = leadActivity;
    let newNextAction = nextAction;

    // If user picks "In Home Estimate" or "Virtual Estimate" in "In Progress" => NextAction = "Schedule Survey"
    if (
      leadStatus === 'In Progress' &&
      (activityValue === 'In Home Estimate' || activityValue === 'Virtual Estimate')
    ) {
      newNextAction = 'Schedule Survey';
      setHideNextActionAfterSurvey(false);
    }
    else if (
      leadStatus === 'In Progress' &&
      (oldActivity === 'In Home Estimate' || oldActivity === 'Virtual Estimate') &&
      (activityValue !== 'In Home Estimate' && activityValue !== 'Virtual Estimate')
    ) {
      newNextAction = 'Attempt 1';
    }

    setLeadActivity(activityValue);
    setNextAction(newNextAction);

    if (onLeadUpdated) {
      onLeadUpdated({
        ...lead,
        lead_status: leadStatus,
        lead_activity: activityValue,
        next_action: newNextAction,
        estimator: selectedEstimator,
        survey_date: selectedDate,
        survey_time: selectedTime,
        inventory_option: inventoryOption,
      });
    }
  };

  // -----------
  // NextAction logic
  // -----------
  const handleNextActionClick = () => {
    setAnimateNextAction(true);
    setTimeout(() => setAnimateNextAction(false), 600);

    if (nextAction === 'Schedule Survey') {
      setNextAction('Survey Completed');
      if (onLeadUpdated) {
        onLeadUpdated({
          ...lead,
          lead_status: leadStatus,
          lead_activity: leadActivity,
          next_action: 'Survey Completed',
          estimator: selectedEstimator,
          survey_date: selectedDate,
          survey_time: selectedTime,
          inventory_option: inventoryOption,
        });
      }
      return;
    }
    if (nextAction === 'Survey Completed') {
      setHideNextActionAfterSurvey(true);
      if (onLeadUpdated) {
        onLeadUpdated({
          ...lead,
          lead_status: leadStatus,
          lead_activity: leadActivity,
          next_action: 'Survey Completed',
          estimator: selectedEstimator,
          survey_date: selectedDate,
          survey_time: selectedTime,
          inventory_option: inventoryOption,
        });
      }
      return;
    }

    let newStatus    = leadStatus;
    let newActivity  = leadActivity;
    let newNextAction= nextAction;

    if (leadStatus === 'New Lead') {
      if (nextAction === 'Attempt 1') {
        newStatus    = 'In Progress';
        newActivity  = 'Contacting';
        newNextAction= 'Attempt 2';
      } else if (nextAction.startsWith('Attempt')) {
        const attemptNum = parseInt(nextAction.replace('Attempt ', ''), 10);
        if (attemptNum >= 6) {
          newStatus   = 'Bad Lead';
          newActivity = getActivityOptions('Bad Lead')[0] || '';
          newNextAction = '—';
        } else {
          newNextAction = `Attempt ${attemptNum + 1}`;
        }
      } else {
        newNextAction = 'Attempt 1';
      }
    }
    else if (leadStatus === 'In Progress') {
      if (!nextAction.startsWith('Attempt')) {
        newNextAction = 'Attempt 2';
      } else {
        const attemptNum = parseInt(nextAction.replace('Attempt ', ''), 10);
        if (attemptNum >= 6) {
          newStatus     = 'Bad Lead';
          newActivity   = getActivityOptions('Bad Lead')[0] || '';
          newNextAction = '—';
        } else {
          newNextAction = `Attempt ${attemptNum + 1}`;
        }
      }
    }
    else if (leadStatus === 'Quoted') {
      if (!nextAction.startsWith('Follow up')) {
        newNextAction = 'Follow up 1';
      } else {
        const fuNum = parseInt(nextAction.replace('Follow up ', ''), 10);
        if (fuNum >= 6) {
          newStatus     = 'Declined';
          newActivity   = getActivityOptions('Declined')[0] || '';
          newNextAction = '—';
        } else {
          newNextAction = `Follow up ${fuNum + 1}`;
        }
      }
    }

    setLeadStatus(newStatus);
    setLeadActivity(newActivity);

    if (HIDDEN_STATUSES.includes(newStatus)) {
      newNextAction = '';
    }

    setNextAction(newNextAction);

    if (onLeadUpdated) {
      onLeadUpdated({
        ...lead,
        lead_status: newStatus,
        lead_activity: newActivity,
        next_action: newNextAction,
        estimator: selectedEstimator,
        survey_date: selectedDate,
        survey_time: selectedTime,
        inventory_option: inventoryOption,
      });
    }
  };

  // -----------
  // Estimator logic
  // -----------
  const handleToggleEstimatorDropdown = () => {
    setShowEstimatorDropdown((prev) => !prev);
  };
  const handleSelectEstimator = (repName) => {
    setSelectedEstimator(repName);
    setShowEstimatorDropdown(false);

    if (onLeadUpdated) {
      onLeadUpdated({
        ...lead,
        lead_status: leadStatus,
        lead_activity: leadActivity,
        next_action: nextAction,
        estimator: repName,
        survey_date: selectedDate,
        survey_time: selectedTime,
        inventory_option: inventoryOption,
      });
    }
  };

  // -----------
  // Calendar for "Survey Date"
  // -----------
  const handleToggleCalendar = () => {
    setShowCalendar((prev) => !prev);
  };
  const goPrevMonth = () => {
    setCalendarMonth((prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  };
  const goNextMonth = () => {
    setCalendarMonth((prev) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
  };
  const handleDayClick = (dayNum) => {
    const dateObj       = new Date(calendarMonth.getFullYear(), calendarMonth.getMonth(), dayNum);
    const newDateString = dateObj.toDateString();
    setSelectedDate(newDateString);
    setShowCalendar(false);

    if (onLeadUpdated) {
      onLeadUpdated({
        ...lead,
        lead_status: leadStatus,
        lead_activity: leadActivity,
        next_action: nextAction,
        estimator: selectedEstimator,
        survey_date: newDateString,
        survey_time: selectedTime,
        inventory_option: inventoryOption,
      });
    }
  };

  // -----------
  // Time (Survey Time)
  // -----------
  const handleToggleTimeDropdown = () => {
    setShowTimeDropdown((prev) => !prev);
  };
  const handleSelectTime = (timeStr) => {
    setSelectedTime(timeStr);
    setShowTimeDropdown(false);

    if (onLeadUpdated) {
      onLeadUpdated({
        ...lead,
        lead_status: leadStatus,
        lead_activity: leadActivity,
        next_action: nextAction,
        estimator: selectedEstimator,
        survey_date: selectedDate,
        survey_time: timeStr,
        inventory_option: inventoryOption,
      });
    }
  };

  // figure out lead status color/icon
  const currentStatusObj = statusOptions.find((opt) => opt.label === leadStatus);
  const statusColor = currentStatusObj ? currentStatusObj.color : '#59B779';
  const statusIcon  = currentStatusObj ? currentStatusObj.icon : null;

  // hide nextAction if status in HIDDEN_STATUSES or "Survey Completed"
  const hideNextAction = HIDDEN_STATUSES.includes(leadStatus) || hideNextActionAfterSurvey;
  const hideActivityButton = leadStatus === 'Move on Hold';

  // possible activity options
  const activityOptions = getActivityOptions(leadStatus);

  // show estimator/date/time if needed
  const showEstimatorDateTimeInputs =
    leadStatus === 'In Progress' &&
    (leadActivity === 'In Home Estimate' || leadActivity === 'Virtual Estimate');

  // handle inventory dropdown
  const handleSelectInventoryOption = (opt) => {
    setInventoryOption(opt.label);
    setShowInventoryDropdown(false);

    if (onLeadUpdated) {
      onLeadUpdated({
        ...lead,
        inventory_option: opt.label,
        lead_status: leadStatus,
        lead_activity: leadActivity,
        next_action: nextAction,
        estimator: selectedEstimator,
        survey_date: selectedDate,
        survey_time: selectedTime,
      });
    }
  };

  // figure out color for the text + icon container
  const selectedInvObj = inventoryDropdownOptions.find(o => o.label === inventoryOption)
    || inventoryDropdownOptions[0];
  const inventoryTextColor = selectedInvObj.textColor;
  const inventoryIconBg    = selectedInvObj.iconBg;

  // Here we format the phone number for display
  const displayPhone = formatPhoneNumber(lead.customer_phone_number);

  return (
    <div className={styles.wrapper}>
      <div className={styles.panelContainer}>

        {/* ---------- Top Row ---------- */}
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

        {/* ---------- Contact Row ---------- */}
        <div className={styles.contactRow}>
          {/* Display phone number in a user-friendly format */}
          <div className={styles.infoChip}>
            {displayPhone}
          </div>
          <div className={styles.emailRow}>
            <div className={styles.infoChip}>
              {lead.customer_email || 'No Email'}
            </div>
            <button className={styles.editButton} onClick={handleEditClick}>
              <EditIcon className={styles.editIcon} />
            </button>
          </div>
        </div>

        {/* ---------- Status + Activity Buttons ---------- */}
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
              {leadStatus !== 'New Lead' && (
                <div className={styles.statusIconContainer}>
                  {statusIcon}
                </div>
              )}
            </button>

            {showStatusDropdown && (
              <ul className={styles.statusDropdown}>
                {statusOptions
                  .filter((opt) => opt.label !== 'New Lead')
                  .map((option) => {
                    const isSelected = option.label === leadStatus;
                    return (
                      <li
                        key={option.label}
                        className={`
                          ${styles.statusOption}
                          ${isSelected ? styles.selectedOption : ''}
                        `}
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

          {/* ACTIVITY (hidden if Move on Hold) */}
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
                  {activityOptions.map((act) => {
                    const isSelected = act === leadActivity;
                    return (
                      <li
                        key={act}
                        className={`
                          ${styles.activityOption}
                          ${isSelected ? styles.selectedOption : ''}
                        `}
                        onClick={() => handleSelectActivity(act)}
                      >
                        {act}
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          )}
        </div>

        {/* If (status=In Progress + "In Home"/"Virtual") => show Estimator + Date + Time */}
        {showEstimatorDateTimeInputs && (
          <div className={styles.estimateExtraContainer}>

            {/* Estimator */}
            <div className={styles.inputContainer} style={{ position: 'relative' }}>
              <button
                type="button"
                className={styles.estimatorButton}
                onClick={handleToggleEstimatorDropdown}
              >
                <div className={styles.estimatorLeft}>
                  <span className={styles.estimatorLabel}>Estimator:</span>
                  <span className={styles.estimatorValue}>
                    {selectedEstimator || 'Select'}
                  </span>
                </div>
                <UnfoldMoreIcon className={styles.unfoldIcon} />
              </button>
              {showEstimatorDropdown && (
                <ul className={styles.estimatorDropdown}>
                  {PossibleSalesReps.map((rep) => (
                    <li
                      key={rep.id}
                      className={styles.estimatorOption}
                      onClick={() => handleSelectEstimator(rep.name)}
                    >
                      {rep.name}
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Date */}
            <div className={styles.inputContainer} style={{ position: 'relative' }}>
              <button
                type="button"
                className={styles.estimatorDateButton}
                onClick={handleToggleCalendar}
              >
                <span className={selectedDate ? styles.dateSelected : styles.datePlaceholder}>
                  {selectedDate || 'Date'}
                </span>
                <div className={styles.calendarRightIconWrapper}>
                  <CalendarIcon className={styles.calendarIcon} />
                </div>
              </button>
              {showCalendar && (
                <div className={styles.calendarPopup}>
                  <div className={styles.calendarHeader}>
                    <button onClick={goPrevMonth}>Prev</button>
                    <span>
                      {calendarMonth.toLocaleString('default', { month: 'long' })}{' '}
                      {calendarMonth.getFullYear()}
                    </span>
                    <button onClick={goNextMonth}>Next</button>
                  </div>
                  <div className={styles.calendarGrid}>
                    {daysInMonth.map((dayNum) => (
                      <button
                        key={dayNum}
                        type="button"
                        className={styles.calendarDay}
                        onClick={() => handleDayClick(dayNum)}
                      >
                        {dayNum}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Time */}
            <div className={styles.inputContainer} style={{ position: 'relative' }}>
              <button
                type="button"
                className={styles.estimatorTimeButton}
                onClick={handleToggleTimeDropdown}
              >
                <span className={selectedTime ? styles.timeSelected : styles.timePlaceholder}>
                  {selectedTime || 'Time'}
                </span>
                <UnfoldMoreIcon className={styles.unfoldIcon} />
              </button>
              {showTimeDropdown && (
                <ul className={styles.timeDropdown}>
                  {timeSlots.map((ts) => (
                    <li
                      key={ts}
                      className={styles.timeOption}
                      onClick={() => handleSelectTime(ts)}
                    >
                      {ts}
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Next Action if not hidden */}
            {!hideNextAction && (
              <button
                className={`
                  ${styles.nextActionButton}
                  ${animateNextAction ? styles.animateNextAction : ''}
                `}
                onClick={handleNextActionClick}
              >
                <span className={styles.nextActionLabel}>Next Action:</span>
                <span className={styles.nextActionValue}>{nextAction}</span>
              </button>
            )}
          </div>
        )}

        {/* If not in "In Home/Virtual" but still have Next Action => show button */}
        {!showEstimatorDateTimeInputs && !hideNextAction && (
          <button
            className={`
              ${styles.nextActionButton}
              ${animateNextAction ? styles.animateNextAction : ''}
            `}
            style={{ marginTop: '10px' }}
            onClick={handleNextActionClick}
          >
            <span className={styles.nextActionLabel}>Next Action:</span>
            <span className={styles.nextActionValue}>{nextAction}</span>
          </button>
        )}

        {/* Source & Previous Requests */}
        <div className={styles.sourceSection}>
          <span className={styles.sourceLabel}>Source:</span>
          <span className={styles.sourceValue}>
            {lead.source || 'Yelp'}
          </span>
        </div>
        <div className={styles.previousRequestsLabel}>Previous Requests:</div>

        <div className={styles.requestsButtonsContainer}>

          {/* Hide "Invite Customer" via CSS */}
          <button className={`${styles.inviteButton} ${styles.hiddenButton}`}>
            <span className={styles.inviteText}>Invite Customer</span>
            <div className={styles.inviteIconContainer}>
              <UserIcon className={styles.userIcon} />
            </div>
          </button>

          {/* Inventory Button => small dropdown for 3 options */}
          <div
            className={styles.inventoryButton}
            style={{ position: 'relative' }}
            ref={inventoryRef}
            onClick={(e) => {
              e.stopPropagation();
              setShowInventoryDropdown(!showInventoryDropdown);
            }}
          >
            <span
              className={styles.inventoryText}
              style={{ color: inventoryTextColor }}
            >
              {inventoryOption}
            </span>
            <div
              className={styles.inventoryIconContainer}
              style={{ backgroundColor: inventoryIconBg }}
            >
              <SpecialHIcon className={styles.specialHIcon} />
            </div>

            {showInventoryDropdown && (
              <ul
                style={{
                  position: 'absolute',
                  top: '55px',
                  left: 0,
                  width: '100%',
                  background: '#fff',
                  border: '1px solid #ccc',
                  borderRadius: '12px',
                  padding: '8px 0',
                  maxHeight: '220px',
                  overflowY: 'auto',
                  zIndex: 3100,
                }}
              >
                {inventoryDropdownOptions.map((opt) => {
                  const isSelected = opt.label === inventoryOption;
                  return (
                    <li
                      key={opt.label}
                      style={{
                        padding: '10px 15px',
                        cursor: 'pointer',
                        fontFamily: 'Satoshi, sans-serif',
                        fontSize: '16px',
                        fontWeight: 700,
                        background: isSelected ? 'rgba(0,0,0,0.05)' : '#FFF',
                        color: '#2F3236',
                      }}
                      onClick={() => handleSelectInventoryOption(opt)}
                    >
                      {opt.label}
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </div>
      </div>

      <MoveDetailsPanel
  onShowInventory={() => setShowInventory(true)}
  lead={lead}            // pass the lead object down
  onLeadUpdated={onLeadUpdated}  // pass the callback down
/>
    </div>
  );
}

export default LeadManagementPanel;
