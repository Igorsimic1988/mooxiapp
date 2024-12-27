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
// (Removed CompletedIcon)

// Other icons
import { ReactComponent as UnfoldMoreIcon } from '../../../assets/icons/unfoldmore.svg';
import { ReactComponent as UserIcon } from '../../../assets/icons/user.svg';
import { ReactComponent as SpecialHIcon } from '../../../assets/icons/specialh.svg';
import { ReactComponent as CalendarIcon } from '../../../assets/icons/calendar.svg';

import MoveDetailsPanel from './MoveDetailsPanel/MoveDetailsPanel';
import Inventory from './MoveDetailsPanel/OriginDetails/Inventory/Inventory';
import styles from './LeadManagementPanel.module.css';

// A list of possible Estimators (like your "PossibleSalesReps")
import PossibleSalesReps from '../../../data/constants/PossibleSalesReps';

/** The status definitions */
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

/**
 * Based on the status, decide which activity options to show.
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
      // For "Move on Hold" or unknown => no activity
      return [];
  }
}

/**
 * Generate 15-minute time slots from 7:00 AM to 9:00 PM.
 */
function generateTimeSlots() {
  const slots = [];
  let hour = 7;   // Start at 7 AM
  let minute = 0;
  while (hour < 21) { // up to 9 PM
    const suffix = hour >= 12 ? 'PM' : 'AM';
    let displayHour = hour % 12;
    if (displayHour === 0) displayHour = 12; // handle "12 PM"

    const displayMinute = minute.toString().padStart(2, '0');
    slots.push(`${displayHour}:${displayMinute} ${suffix}`);

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
 * Next Action logic (cyclical):
 * - Hidden if status ∈ [Bad Lead, Declined, Booked, Move on Hold, Cancaled].
 * - If status=New Lead => "Attempt 1..6" => then => status=Bad Lead.
 * - If status=In Progress => "Attempt 2..6" => then => status=Bad Lead,
 *      except if activity is "In Home Estimate"/"Virtual Estimate", nextAction => "Survey Completed".
 * - If nextAction="Survey Completed" and user clicks => hide Next Action button.
 * - If status=Quoted => "Follow up 1..6" => then => status=Declined.
 * - If user picks "In Progress" => nextAction="Attempt 1".
 * - If user picks "Quoted" => nextAction="Follow up 1".
 * - If user picks "In Home Estimate" or "Virtual Estimate" => show Estimator/Date/Time fields.
 *
 * We want Next Action to remain visible unless:
 *   (1) status in HIDDEN_STATUSES, OR
 *   (2) nextAction = "Survey Completed" was clicked.
 */
function LeadManagementPanel({ lead, onClose, onEditLead }) {
  const [showInventory, setShowInventory] = useState(false);

  // status, activity, nextAction
  const [leadStatus, setLeadStatus]   = useState(lead.lead_status);
  const [leadActivity, setLeadActivity] = useState(lead.lead_activity || 'Contacting');
  const [nextAction, setNextAction]   = useState(lead.next_action || '—');
  const [hideNextActionAfterSurvey, setHideNextActionAfterSurvey] = useState(false);

  // show/hide status & activity dropdowns
  const [showStatusDropdown, setShowStatusDropdown] = useState(false);
  const [showActivityDropdown, setShowActivityDropdown] = useState(false);

  // Refs for outside click
  const statusContainerRef = useRef(null);
  const activityContainerRef = useRef(null);

  // Estimator / Date / Time states
  const [showEstimatorDropdown, setShowEstimatorDropdown] = useState(false);
  const [selectedEstimator, setSelectedEstimator] = useState('');

  const [showCalendar, setShowCalendar] = useState(false);
  const [calendarMonth, setCalendarMonth] = useState(new Date());
  const [daysInMonth, setDaysInMonth] = useState([]);
  const [selectedDate, setSelectedDate] = useState('');

  const [showTimeDropdown, setShowTimeDropdown] = useState(false);
  const [selectedTime, setSelectedTime] = useState('');

  // build daysInMonth whenever `calendarMonth` changes
  useEffect(() => {
    const y = calendarMonth.getFullYear();
    const m = calendarMonth.getMonth();
    const totalDays = new Date(y, m + 1, 0).getDate();
    const arr = [];
    for (let i = 1; i <= totalDays; i++) arr.push(i);
    setDaysInMonth(arr);
  }, [calendarMonth]);

  // close status/activity dropdowns if user clicks outside
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

  // If we are showing Inventory
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

  // pick a new status
  const handleSelectStatus = (option) => {
    if (option.isDisabled) return;
    setLeadStatus(option.label);
    setShowStatusDropdown(false);

    // reset activity
    const newActs = getActivityOptions(option.label);
    setLeadActivity(newActs[0] || '');

    // if user picks "In Progress" => Attempt 1
    if (option.label === 'In Progress') {
      setNextAction('Attempt 1');
      setHideNextActionAfterSurvey(false);
    }
    // if user picks "Quoted" => Follow up 1
    else if (option.label === 'Quoted') {
      setNextAction('Follow up 1');
      setHideNextActionAfterSurvey(false);
    }
  };

  // pick a new activity
  const handleSelectActivity = (activityValue) => {
    setLeadActivity(activityValue);
    setShowActivityDropdown(false);

    // "In Progress" + "In Home Estimate"/"Virtual Estimate" => nextAction="Survey Completed"
    if (
      leadStatus === 'In Progress' &&
      (activityValue === 'In Home Estimate' || activityValue === 'Virtual Estimate')
    ) {
      setNextAction('Survey Completed');
      setHideNextActionAfterSurvey(false);
    }
  };

  // Next Action cyclical logic
  const handleNextActionClick = () => {
    if (nextAction === 'Survey Completed') {
      // Once user clicks => hide the Next Action
      setHideNextActionAfterSurvey(true);
      return;
    }

    if (leadStatus === 'New Lead') {
      if (nextAction === 'Attempt 1') {
        // next => In Progress, Attempt 2
        setLeadStatus('In Progress');
        setLeadActivity('Contacting');
        setNextAction('Attempt 2');
      } else if (nextAction.startsWith('Attempt')) {
        const attemptNum = parseInt(nextAction.replace('Attempt ', ''), 10);
        if (attemptNum >= 6) {
          setLeadStatus('Bad Lead');
          const badOps = getActivityOptions('Bad Lead');
          setLeadActivity(badOps[0] || '');
          setNextAction('—');
        } else {
          setNextAction(`Attempt ${attemptNum + 1}`);
        }
      } else {
        setNextAction('Attempt 1');
      }
      return;
    }

    if (leadStatus === 'In Progress') {
      if (!nextAction.startsWith('Attempt')) {
        setNextAction('Attempt 2');
      } else {
        const attemptNum = parseInt(nextAction.replace('Attempt ', ''), 10);
        if (attemptNum >= 6) {
          setLeadStatus('Bad Lead');
          const badOps = getActivityOptions('Bad Lead');
          setLeadActivity(badOps[0] || '');
          setNextAction('—');
        } else {
          setNextAction(`Attempt ${attemptNum + 1}`);
        }
      }
      return;
    }

    if (leadStatus === 'Quoted') {
      if (!nextAction.startsWith('Follow up')) {
        setNextAction('Follow up 1');
      } else {
        const fuNum = parseInt(nextAction.replace('Follow up ', ''), 10);
        if (fuNum >= 6) {
          setLeadStatus('Declined');
          const decOps = getActivityOptions('Declined');
          setLeadActivity(decOps[0] || '');
          setNextAction('—');
        } else {
          setNextAction(`Follow up ${fuNum + 1}`);
        }
      }
      return;
    }
  };

  // Estimator
  const handleToggleEstimatorDropdown = () => {
    setShowEstimatorDropdown((prev) => !prev);
  };
  const handleSelectEstimator = (repName) => {
    setSelectedEstimator(repName);
    setShowEstimatorDropdown(false);
  };

  // Date
  const handleToggleCalendar = () => setShowCalendar((prev) => !prev);
  const goPrevMonth = () => {
    setCalendarMonth((prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  };
  const goNextMonth = () => {
    setCalendarMonth((prev) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
  };
  const handleDayClick = (dayNum) => {
    const chosenDate = new Date(calendarMonth.getFullYear(), calendarMonth.getMonth(), dayNum);
    setSelectedDate(chosenDate.toDateString());
    setShowCalendar(false);
  };

  // Time
  const handleToggleTimeDropdown = () => {
    setShowTimeDropdown((prev) => !prev);
  };
  const handleSelectTime = (timeStr) => {
    setSelectedTime(timeStr);
    setShowTimeDropdown(false);
  };

  // figure out color/icon for current status
  const currentStatusObj = statusOptions.find((opt) => opt.label === leadStatus);
  const statusColor = currentStatusObj ? currentStatusObj.color : '#59B779';
  const statusIcon = currentStatusObj ? currentStatusObj.icon : null;

  // Should Next Action be hidden?
  const HIDDEN_STATUSES = ['Bad Lead', 'Declined', 'Booked', 'Move on Hold', 'Cancaled'];
  const hideNextAction = HIDDEN_STATUSES.includes(leadStatus) || hideNextActionAfterSurvey;

  // hide activity if "Move on Hold"
  const hideActivityButton = (leadStatus === 'Move on Hold');

  // get the list of possible activities
  const activityOptions = getActivityOptions(leadStatus);

  // show Estimator/Date/Time if In Progress + [In Home Estimate/Virtual Estimate]
  const showEstimatorDateTimeInputs =
    leadStatus === 'In Progress' &&
    (leadActivity === 'In Home Estimate' || leadActivity === 'Virtual Estimate');


  const source = lead.source || 'Yelp';

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

        {/* ---------- Buttons Row (Status + Activity) ---------- */}
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
                        className={`${styles.statusOption} ${isSelected ? styles.selectedOption : ''}`}
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

          {/* ACTIVITY (hide if Move on Hold) */}
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
                        className={`${styles.activityOption} ${isSelected ? styles.selectedOption : ''}`}
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
          ---- If "In Home Estimate" / "Virtual Estimate" => show Estimator/Date/Time, 
               and we also place Next Action here 
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

            {/* Next Action button, but only if not hidden by status or "Survey Completed" */}
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

        {/* If user’s activity is NOT In Home/Virtual => we still might want Next Action 
            to appear. So handle it here separately: 
        */}
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

        {/* ---------- Source & Previous Requests ---------- */}
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
