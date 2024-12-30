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

/** Activity options by status */
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

/** Generate 15-min time slots from 7:00 AM to 9:00 PM */
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

/**
 * The statuses that must hide NextAction AND also set next_action to empty.
 * So if we ever change to one of these statuses, we override next_action = "".
 */
const HIDDEN_STATUSES = ['Bad Lead', 'Declined', 'Booked', 'Move on Hold', 'Cancaled'];

/**
 * LeadManagementPanel
 * 
 * Props:
 *  - lead: the current lead object
 *  - onClose: (optional) close the panel
 *  - onEditLead: invoked if user clicks the Edit icon
 *  - onLeadUpdated: invoked whenever lead's status/activity/nextAction changes
 */
function LeadManagementPanel({ lead, onClose, onEditLead, onLeadUpdated }) {
  const [showInventory, setShowInventory] = useState(false);

  // Local states
  const [leadStatus, setLeadStatus]   = useState(lead.lead_status);
  const [leadActivity, setLeadActivity] = useState(lead.lead_activity || 'Contacting');
  const [nextAction, setNextAction]   = useState(lead.next_action || '—');
  const [hideNextActionAfterSurvey, setHideNextActionAfterSurvey] = useState(false);

  // show/hide dropdowns
  const [showStatusDropdown, setShowStatusDropdown] = useState(false);
  const [showActivityDropdown, setShowActivityDropdown] = useState(false);

  // Refs for outside-click detection
  const statusContainerRef = useRef(null);
  const activityContainerRef = useRef(null);

  // Estimator/Date/Time
  const [showEstimatorDropdown, setShowEstimatorDropdown] = useState(false);
  const [selectedEstimator, setSelectedEstimator] = useState('');

  const [showCalendar, setShowCalendar] = useState(false);
  const [calendarMonth, setCalendarMonth] = useState(new Date());
  const [daysInMonth, setDaysInMonth] = useState([]);
  const [selectedDate, setSelectedDate] = useState('');

  const [showTimeDropdown, setShowTimeDropdown] = useState(false);
  const [selectedTime, setSelectedTime] = useState('');

  // Build days array whenever `calendarMonth` changes
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

  // Outside click => close dropdowns
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

  // If we show Inventory
  if (showInventory) {
    return <Inventory onCloseInventory={() => setShowInventory(false)} />;
  }

  /** handle clicking "Edit" => onEditLead(...) */
  const handleEditClick = () => {
    if (onEditLead) onEditLead(lead);
  };

  /** Status dropdown toggle */
  const handleToggleStatusDropdown = () => {
    setShowStatusDropdown((prev) => !prev);
  };

  /** Activity dropdown toggle */
  const handleToggleActivityDropdown = () => {
    setShowActivityDropdown((prev) => !prev);
  };

  /**
   * handle user picking a new status
   */
  const handleSelectStatus = (option) => {
    if (option.isDisabled) return;
    setShowStatusDropdown(false);

    const newStatus = option.label;
    let newActivity = getActivityOptions(newStatus)[0] || '';
    let newNextAction = nextAction; // might be overridden

    // If we are picking a "hidden" status => nextAction = ""
    if (HIDDEN_STATUSES.includes(newStatus)) {
      newNextAction = '';
    }
    // If user picks "In Progress" => nextAction="Attempt 1"
    else if (newStatus === 'In Progress') {
      newNextAction = 'Attempt 1';
      setHideNextActionAfterSurvey(false);
    }
    // If "Quoted" => nextAction="Follow up 1"
    else if (newStatus === 'Quoted') {
      newNextAction = 'Follow up 1';
      setHideNextActionAfterSurvey(false);
    }

    setLeadStatus(newStatus);
    setLeadActivity(newActivity);
    setNextAction(newNextAction);

    // call onLeadUpdated
    if (onLeadUpdated) {
      onLeadUpdated({
        ...lead,
        lead_status: newStatus,
        lead_activity: newActivity,
        next_action: newNextAction,
      });
    }
  };

  /**
   * handle user picking a new activity
   */
  const handleSelectActivity = (activityValue) => {
    setShowActivityDropdown(false);

    // If (In Progress + "In Home Estimate"/"Virtual Estimate") => nextAction="Schedule Survey"
    let newNextAction = nextAction;
    if (
      leadStatus === 'In Progress' &&
      (activityValue === 'In Home Estimate' || activityValue === 'Virtual Estimate')
    ) {
      newNextAction = 'Schedule Survey';
      setHideNextActionAfterSurvey(false);
    }

    setLeadActivity(activityValue);
    setNextAction(newNextAction);

    // call onLeadUpdated
    if (onLeadUpdated) {
      onLeadUpdated({
        ...lead,
        lead_status: leadStatus,
        lead_activity: activityValue,
        next_action: newNextAction,
      });
    }
  };

  /**
   * handle Next Action click => cycle Attempt or Follow up
   * or handle "Schedule Survey" => "Survey Completed"
   */
  const handleNextActionClick = () => {
    // If nextAction is "Schedule Survey" => next => "Survey Completed"
    if (nextAction === 'Schedule Survey') {
      setNextAction('Survey Completed');
      if (onLeadUpdated) {
        onLeadUpdated({
          ...lead,
          lead_status: leadStatus,
          lead_activity: leadActivity,
          next_action: 'Survey Completed',
        });
      }
      return;
    }

    // If nextAction is "Survey Completed" => hide
    if (nextAction === 'Survey Completed') {
      setHideNextActionAfterSurvey(true);
      if (onLeadUpdated) {
        onLeadUpdated({
          ...lead,
          lead_status: leadStatus,
          lead_activity: leadActivity,
          next_action: 'Survey Completed',
        });
      }
      return;
    }

    // Otherwise handle standard logic
    let newStatus = leadStatus;
    let newActivity = leadActivity;
    let newNextAction = nextAction;

    if (leadStatus === 'New Lead') {
      if (nextAction === 'Attempt 1') {
        newStatus = 'In Progress';
        newActivity = 'Contacting';
        newNextAction = 'Attempt 2';
      } else if (nextAction.startsWith('Attempt')) {
        const attemptNum = parseInt(nextAction.replace('Attempt ', ''), 10);
        if (attemptNum >= 6) {
          newStatus = 'Bad Lead'; // sets nextAction = ""
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
          newStatus = 'Bad Lead'; // sets nextAction = ""
          newActivity = getActivityOptions('Bad Lead')[0] || '';
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
          newStatus = 'Declined'; // sets nextAction = ""
          newActivity = getActivityOptions('Declined')[0] || '';
          newNextAction = '—';
        } else {
          newNextAction = `Follow up ${fuNum + 1}`;
        }
      }
    }

    setLeadStatus(newStatus);
    setLeadActivity(newActivity);

    // If the new status is in hidden statuses => nextAction = ""
    if (HIDDEN_STATUSES.includes(newStatus)) {
      newNextAction = '';
      setNextAction('');
    } else {
      setNextAction(newNextAction);
    }

    // call onLeadUpdated
    if (onLeadUpdated) {
      onLeadUpdated({
        ...lead,
        lead_status: newStatus,
        lead_activity: newActivity,
        next_action: newNextAction,
      });
    }
  };

  /** Estimator dropdown toggle */
  const handleToggleEstimatorDropdown = () => {
    setShowEstimatorDropdown((prev) => !prev);
  };
  const handleSelectEstimator = (repName) => {
    setSelectedEstimator(repName);
    setShowEstimatorDropdown(false);
  };

  /** Calendar toggles */
  const handleToggleCalendar = () => setShowCalendar((prev) => !prev);
  const goPrevMonth = () => {
    setCalendarMonth((prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  };
  const goNextMonth = () => {
    setCalendarMonth((prev) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
  };
  const handleDayClick = (dayNum) => {
    const dateObj = new Date(calendarMonth.getFullYear(), calendarMonth.getMonth(), dayNum);
    setSelectedDate(dateObj.toDateString());
    setShowCalendar(false);
  };

  /** Time toggle */
  const handleToggleTimeDropdown = () => {
    setShowTimeDropdown((prev) => !prev);
  };
  const handleSelectTime = (timeStr) => {
    setSelectedTime(timeStr);
    setShowTimeDropdown(false);
  };

  // Derive color/icon for the current status
  const currentStatusObj = statusOptions.find((opt) => opt.label === leadStatus);
  const statusColor = currentStatusObj ? currentStatusObj.color : '#59B779';
  const statusIcon = currentStatusObj ? currentStatusObj.icon : null;

  // Hide Next Action if the status is in HIDDEN_STATUSES or user has pressed "Survey Completed"
  const hideNextAction =
    HIDDEN_STATUSES.includes(leadStatus) || hideNextActionAfterSurvey;

  // Hide activity button if "Move on Hold"
  const hideActivityButton = (leadStatus === 'Move on Hold');

  // The available activities for current leadStatus
  const activityOptions = getActivityOptions(leadStatus);

  // Show Estimator/Date/Time fields if status=In Progress + activity=In Home/Virtual
  const showEstimatorDateTimeInputs =
    leadStatus === 'In Progress' &&
    (leadActivity === 'In Home Estimate' || leadActivity === 'Virtual Estimate');


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
                    const isSelected = (option.label === leadStatus);
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
                    const isSelected = (act === leadActivity);
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

        {/* 
          If (status=In Progress + activity=In Home Estimate/Virtual Estimate):
          show Estimator + Date + Time + Next Action.
        */}
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
                className={styles.nextActionButton}
                onClick={handleNextActionClick}
              >
                <span className={styles.nextActionLabel}>Next Action:</span>
                <span className={styles.nextActionValue}>{nextAction}</span>
              </button>
            )}
          </div>
        )}

        {/* If not in "In Home/Virtual" but still have a Next Action => show button here */}
        {!showEstimatorDateTimeInputs && !hideNextAction && (
          <button
            className={styles.nextActionButton}
            style={{ marginTop: '10px' }}
            onClick={handleNextActionClick}
          >
            <span className={styles.nextActionLabel}>Next Action:</span>
            <span className={styles.nextActionValue}>{nextAction}</span>
          </button>
        )}

        {/* ---- Source & Previous Requests ---- */}
        <div className={styles.sourceSection}>
          <span className={styles.sourceLabel}>Source:</span>
          <span className={styles.sourceValue}>
            {lead.source || 'Yelp'}
          </span>
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
