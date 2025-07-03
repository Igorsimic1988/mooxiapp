"use client";

import React, { useState, useEffect, useRef } from 'react';

import MoveDetailsPanel from './MoveDetailsPanel/MoveDetailsPanel';
import styles from './LeadManagementPanel.module.css';

// 1) IMPORT THE updateLead SERVICE
import Icon from '../../Icon';
import { useForm } from 'react-hook-form';
import { getSalesmen } from 'src/app/services/userService';
import { useQuery } from '@tanstack/react-query';
import { useAccessToken } from 'src/app/lib/useAccessToken';

const statusOptions = [
  {
    label: 'New Lead',
    color: '#59B779',
    icon: null,
    isDisabled: true,
  },
  {
    label: 'In Progress',
    color: '#FAA61A',
    icon: {
      name: 'InProgress',
      width: 20,
      height: 20,
    },
    isDisabled: false,
  },
  {
    label: 'Quoted',
    color: '#FFC61E',
    icon: {
      name: 'Quoted',
      width: 24,
      height: 24,
    },
    isDisabled: false,
  },
  {
    label: 'Bad Lead',
    color: '#f65676',
    icon: {
      name: 'BadLead',
      width: 16,
      height: 16,
    },
    isDisabled: false,
  },
  {
    label: 'Declined',
    color: '#D9534F',
    icon: {
      name: 'Declined',
      width: 24,
      height: 24,
    },
    isDisabled: false,
  },
  {
    label: 'Booked',
    color: '#3fa9f5',
    icon: {
      name: 'Booked',
      width: 20,
      height: 20,
    },
    isDisabled: false,
  },
  {
    label: 'Move on Hold',
    color: '#616161',
    icon: {
      name: 'OnHold',
      width: 20,
      height: 20,
    },
    isDisabled: false,
  },
  {
    label: 'Canceled',
    color: '#2f3236',
    icon: {
      name: 'Canceled',
      width: 14,
      height: 14,
    },
    isDisabled: false,
  },
];

// Rate Type options for the new button
const rateTypeOptions = [
  {
    label: 'Hourly Rate Quote',
    value: 'Hourly Rate',
    color: '#59B779',
    iconBg: '#59B779'
  },
  {
    label: 'Volume Based Quote',
    value: 'Volume Based',
    color: '#3FA9F5',
    iconBg: '#3FA9F5'
  },
  {
    label: 'Weight Based Quote',
    value: 'Weight Based',
    color: '#FAA61A',
    iconBg: '#FAA61A'
  }
];

// Which activities belong to which status
function getActivityOptions(status) {
  switch (status) {
    case 'New Lead':     return ['Contacting'];
    case 'In Progress':  return ['Contacting', 'Info Gathering', 'In Home Estimate', 'Virtual Estimate'];
    case 'Quoted':       return ['Quote Follow Up', 'Awaiting Decision', 'Negotiation'];
    case 'Bad Lead':     return ['Invalid Contact', 'Duplicate Lead', 'Not Qulified', 'Spam'];
    case 'Declined':     return ['Not Reachable', 'Pricing Issue', 'Chose Competitor', 'Timing Conflict', 'Service Not Needed'];
    case 'Booked':       return ['Regular Booked', 'Booked on 1st Call', 'Booked Online'];
    case 'Canceled':     return ['Customer Canceled', 'Company Canceled'];
    case 'Move on Hold': return [];
    default:             return [];
  }
}

// We also hide NextAction if lead is in these statuses
const HIDDEN_STATUSES = ['Bad Lead', 'Declined', 'Booked', 'Move on Hold', 'Canceled'];

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

const inventoryDropdownOptions = [
  { label: 'Detailed Inventory Estimate', textColor: '#3FA9F5', iconBg: '#3FA9F5' },
  { label: 'Quick Estimate',           textColor: '#faa612', iconBg: '#faa612' },
  { label: 'I Know My Shipment Size',  textColor: '#616161', iconBg: '#90a4b7' },
];

/** Format phone number */
function formatPhoneNumber(digits) {
  if (!digits) return '';
  const raw = digits.replace(/\D/g, '');
  if (!raw) return '';
  let trimmed = raw;
  if (trimmed.length > 10) trimmed = trimmed.slice(-10);
  const area = trimmed.slice(0, 3);
  const mid = trimmed.slice(3, 6);
  const last = trimmed.slice(6);
  if (!area) return '';
  if (!mid) return `(${area}`;
  if (!last) return `(${area}) ${mid}`;
  return `(${area}) ${mid}-${last}`;
}

function LeadManagementPanel({
  lead,
  onEditLead,
  onLeadUpdated,
  onInventoryFullScreen,
}) {
  const {
    watch,
    setValue,
    getValues,
    reset,
  } = useForm({
    defaultValues: {
      leadStatus: lead.leadStatus || '',
      leadActivity: lead.leadActivity || 'Contacting',
      nextAction: lead.nextAction || '',
      estimator: lead.estimator || '',
      surveyDate: lead.surveyDate || '',
      surveyTime: lead.surveyTime || '',
      inventoryOption: lead.inventoryOption || 'Detailed Inventory Estimate',
      rateType: lead.rateType || 'Hourly Rate', // Add rateType to form defaults
    },
  });
  const token = useAccessToken();
  const leadStatus = watch('leadStatus');
  const leadActivity = watch('leadActivity');
  const nextAction = watch('nextAction');
  const selectedEstimator = watch('estimator');
  const selectedDate = watch('surveyDate');
  const selectedTime = watch('surveyTime');
  const inventoryOption = watch('inventoryOption');
  const rateType = watch('rateType');

  const [hideNextActionAfterSurvey, setHideNextActionAfterSurvey] = useState(false);
  const [animateNextAction, setAnimateNextAction] = useState(false);

  const [showInventoryDropdown, setShowInventoryDropdown] = useState(false);
  const [showStatusDropdown, setShowStatusDropdown] = useState(false);
  const [showActivityDropdown, setShowActivityDropdown] = useState(false);
  const [showEstimatorDropdown, setShowEstimatorDropdown] = useState(false);
  const [showCalendar, setShowCalendar] = useState(false);
  const [calendarMonth, setCalendarMonth] = useState(new Date());
  const [daysInMonth, setDaysInMonth] = useState([]);
  const [showTimeDropdown, setShowTimeDropdown] = useState(false);
  const [showRateTypeDropdown, setShowRateTypeDropdown] = useState(false);

  // ADD THIS: State for tracking component width
  const [isWideLayout, setIsWideLayout] = useState(false);

  const inventoryRef = useRef(null);
  const statusContainerRef = useRef(null);
  const activityContainerRef = useRef(null);
  const rateTypeRef = useRef(null);
  
  // ADD THIS: Ref for the panel container
  const panelContainerRef = useRef(null);

  const { data: users = [], } = useQuery({
    queryKey: ['users', token],
    queryFn: () => getSalesmen(token),
    enabled: !!token,
  })

  // Helper function to check if we should show survey details instead of input buttons
  const shouldShowSurveyDetails = () => {
    // Show survey details when:
    // 1. Status is "Quoted" (after clicking Survey Completed)
    // 2. OR we're not in estimate mode anymore but have survey data
    if (leadStatus === 'Quoted' && (lead.surveyDate || lead.surveyTime)) {
      return true;
    }
    // Also show if we have survey data but are no longer in estimate mode
    if (!isEstimateMode && (lead.surveyDate || lead.surveyTime)) {
      return true;
    }
    return false;
  };

  // Get survey data from either form or lead
  const getSurveyData = () => {
    return {
      estimator: selectedEstimator || lead.estimator || '',
      date: selectedDate || lead.surveyDate || '',
      time: selectedTime || lead.surveyTime || ''
    };
  };

  // FIXED: Update form when lead changes
  useEffect(() => {
    if (lead) {
      reset({
        leadStatus: lead.leadStatus || '',
        leadActivity: lead.leadActivity || 'Contacting',
        nextAction: lead.nextAction || '',
        estimator: lead.estimator || '',
        surveyDate: lead.surveyDate || '',
        surveyTime: lead.surveyTime || '',
        inventoryOption: lead.inventoryOption || 'Detailed Inventory Estimate',
        rateType: lead.rateType || 'Hourly Rate',
      });
    }
  }, [lead, reset]);

  // ADD THIS: ResizeObserver effect
  useEffect(() => {
    if (!panelContainerRef.current) return;

    const resizeObserver = new ResizeObserver((entries) => {
      for (let entry of entries) {
        const width = entry.contentRect.width;
        // Check if component width is more than 872px
        setIsWideLayout(width > 872);
      }
    });

    resizeObserver.observe(panelContainerRef.current);

    // Initial check
    const initialWidth = panelContainerRef.current.offsetWidth;
    setIsWideLayout(initialWidth > 872);

    // Cleanup
    return () => {
      resizeObserver.disconnect();
    };
  }, []);

  // Build days array
  useEffect(() => {
    const y = calendarMonth.getFullYear();
    const m = calendarMonth.getMonth();
    const totalDays = new Date(y, m + 1, 0).getDate();
    const arr = [];
    for (let i = 1; i <= totalDays; i++) arr.push(i);
    setDaysInMonth(arr);
  }, [calendarMonth]);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(e) {
      if (showStatusDropdown && statusContainerRef.current && !statusContainerRef.current.contains(e.target)) {
        setShowStatusDropdown(false);
      }
      if (showActivityDropdown && activityContainerRef.current && !activityContainerRef.current.contains(e.target)) {
        setShowActivityDropdown(false);
      }
      if (showInventoryDropdown && inventoryRef.current && !inventoryRef.current.contains(e.target)) {
        setShowInventoryDropdown(false);
      }
      if (showRateTypeDropdown && rateTypeRef.current && !rateTypeRef.current.contains(e.target)) {
        setShowRateTypeDropdown(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showStatusDropdown, showActivityDropdown, showInventoryDropdown, showRateTypeDropdown]);

  // Actually call updateLead => get updated lead => call parent onLeadUpdated
  async function doUpdateLead(updatedFields = {}) {
    if (!lead?.id || !onLeadUpdated) {
      console.warn("Lead nema ID! Neće se poslati update.");
      return;
    }
    
    try {
      if (onLeadUpdated) {
        await onLeadUpdated(lead.id,{
          ...getValues(),
          ...updatedFields,
        });
      }
    } catch (err) {
      console.error('Failed to update lead:', err);
    }
  }

  const handleEditClick = () => {
    if (onEditLead) onEditLead(lead);
  };

  // STATUS
  const handleToggleStatusDropdown = () => setShowStatusDropdown((prev) => !prev);

  const handleSelectStatus = async (option) => {
    if (option.isDisabled) return;
    setShowStatusDropdown(false);
    const newStatus = option.label;
    let newActivity = getActivityOptions(newStatus)[0] || '';
    let newNextAction = nextAction || '';

    if (HIDDEN_STATUSES.includes(newStatus)) {
      newNextAction = '';
    } else if (newStatus === 'In Progress') {
      newNextAction = 'Attempt 1';
      setHideNextActionAfterSurvey(false);
    } else if (newStatus === 'Quoted') {
      newNextAction = 'Send Estimate'; // Set Send Estimate as first action
      setHideNextActionAfterSurvey(false);
    }
    setValue('leadStatus', newStatus);
    setValue('leadActivity', newActivity);
    setValue('nextAction', newNextAction);
    setShowStatusDropdown(false);

    await doUpdateLead({
      leadStatus: newStatus,
      leadActivity: newActivity,
      nextAction: newNextAction,
    });
  };

  // ACTIVITY
  const handleToggleActivityDropdown = () => setShowActivityDropdown((prev) => !prev);

  const handleSelectActivity = async (activityValue) => {
    if (activityValue === leadActivity) return;
    setShowActivityDropdown(false);

    const oldActivity = leadActivity;
    let newNextAction = nextAction;

    if (
      leadStatus === 'In Progress' &&
      ['In Home Estimate', 'Virtual Estimate'].includes(activityValue)
    ) {
      newNextAction = 'Schedule Survey';
      setHideNextActionAfterSurvey(false);
    } else if (
      leadStatus === 'In Progress' &&
      ['In Home Estimate', 'Virtual Estimate'].includes(oldActivity) &&
      !['In Home Estimate', 'Virtual Estimate'].includes(activityValue)
    ) {
      newNextAction = 'Attempt 1';
    }
    setValue('leadActivity', activityValue);
    setValue('nextAction', newNextAction);

    await doUpdateLead({
      leadActivity: activityValue,
      nextAction: newNextAction,
    });
  };

  // NEXT ACTION
  const handleNextActionClick = async () => {
    // Validate before completing survey
    if (nextAction === 'Survey Completed' && !canCompleteSurvey()) {
      alert('Please select Date and Time before completing the survey.');
      return;
    }

    setAnimateNextAction(true);
    setTimeout(() => setAnimateNextAction(false), 600);

    if (nextAction === 'Schedule Survey') {
      setValue('nextAction', 'Survey Completed');
      await doUpdateLead({
        nextAction: 'Survey Completed',
      });
      return;
    }

    // If nextAction === 'Survey Completed', change to Quoted status with Send Estimate
    if (nextAction === 'Survey Completed') {
      setValue('leadStatus', 'Quoted');
      setValue('leadActivity', 'Quote Follow Up');
      setValue('nextAction', 'Send Estimate');
      
      // Get current form values to preserve survey data
      const currentValues = getValues();
      
      await doUpdateLead({
        leadStatus: 'Quoted',
        leadActivity: 'Quote Follow Up',
        nextAction: 'Send Estimate',
        // Include the survey data in the update
        estimator: currentValues.estimator,
        surveyDate: currentValues.surveyDate,
        surveyTime: currentValues.surveyTime,
      });
      return;
    }

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
          newStatus = 'Bad Lead';
          newActivity = getActivityOptions('Bad Lead')[0] || '';
          newNextAction = '';
        } else {
          newNextAction = `Attempt ${attemptNum + 1}`;
        }
      } else {
        newNextAction = 'Attempt 1';
      }
    } else if (leadStatus === 'In Progress') {
      if (!nextAction.startsWith('Attempt')) {
        newNextAction = 'Attempt 2';
      } else {
        const attemptNum = parseInt(nextAction.replace('Attempt ', ''), 10);
        if (attemptNum >= 6) {
          newStatus = 'Bad Lead';
          newActivity = getActivityOptions('Bad Lead')[0] || '';
          newNextAction = '';
        } else {
          newNextAction = `Attempt ${attemptNum + 1}`;
        }
      }
    } else if (leadStatus === 'Quoted') {
      // Handle Send Estimate as first action
      if (nextAction === 'Send Estimate') {
        newNextAction = 'Follow up 1';
      } else if (!nextAction.startsWith('Follow up')) {
        newNextAction = 'Follow up 1';
      } else {
        const fuNum = parseInt(nextAction.replace('Follow up ', ''), 10);
        if (fuNum >= 6) {
          newStatus = 'Declined';
          newActivity = getActivityOptions('Declined')[0] || '';
          newNextAction = '';
        } else {
          newNextAction = `Follow up ${fuNum + 1}`;
        }
      }
    }

    if (HIDDEN_STATUSES.includes(newStatus)) {
      newNextAction = '';
    }
    setValue('leadStatus', newStatus);
    setValue('leadActivity', newActivity);
    setValue('nextAction', newNextAction);

    await doUpdateLead({
      leadStatus: newStatus,
      leadActivity: newActivity,
      nextAction: newNextAction,
    });
  };

  // ESTIMATOR
  const handleToggleEstimatorDropdown = () => setShowEstimatorDropdown((prev) => !prev);

  const handleSelectEstimator = async (repName) => {
    if (repName === selectedEstimator) return;
    setValue('estimator', repName);
    setShowEstimatorDropdown(false);

    await doUpdateLead({
      estimator: repName,
    });
  };

  // CALENDAR
  const handleToggleCalendar = () => setShowCalendar((prev) => !prev);

  const goPrevMonth = () => {
    setCalendarMonth((prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  };
  const goNextMonth = () => {
    setCalendarMonth((prev) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
  };

  const handleDayClick = async (dayNum) => {
    const dateObj = new Date(calendarMonth.getFullYear(), calendarMonth.getMonth(), dayNum);
    const newDateString = dateObj.toDateString();

    if (newDateString === selectedDate) return;
    setValue('surveyDate', newDateString);
    setShowCalendar(false);

    await doUpdateLead({
      surveyDate: newDateString,
    });
  };

  // TIME
  const handleSelectTime = async (timeStr) => {
    if (timeStr === selectedTime) return;
    setValue('surveyTime', timeStr);
    setShowTimeDropdown(false);

    await doUpdateLead({
      surveyTime: timeStr,
    });
  };

  // INVENTORY
  const handleSelectInventoryOption = async (opt) => {
    if (opt.label === inventoryOption) return;
    setValue('inventoryOption', opt.label);
    setShowInventoryDropdown(false);

    await doUpdateLead({
      inventoryOption: opt.label,
    });
  };

  // RATE TYPE
  const handleSelectRateType = async (opt) => {
    if (opt.value === rateType) return;
    setValue('rateType', opt.value);
    setShowRateTypeDropdown(false);

    await doUpdateLead({
      rateType: opt.value,
    });
  };

  const currentStatusObj = statusOptions.find((opt) => opt.label === leadStatus);
  const statusColor = currentStatusObj ? currentStatusObj.color : '#59B779';
  const currentRateType = rateTypeOptions.find((opt) => opt.value === rateType) || rateTypeOptions[0];

  // We hide Next Action if it's a hidden status or "Completed" was set
  const hideNextAction =
    HIDDEN_STATUSES.includes(leadStatus) ||
    hideNextActionAfterSurvey ||
    nextAction === 'Completed';

  const hideActivityButton = leadStatus === 'Move on Hold';
  const activityOptions = getActivityOptions(leadStatus);

  const rawPhone = lead.customerPhoneNumber || '';
  const displayPhone = formatPhoneNumber(rawPhone);

  // Check if we're in estimate mode
  const isEstimateMode = leadStatus === 'In Progress' && 
    (leadActivity === 'In Home Estimate' || leadActivity === 'Virtual Estimate');

  // Check if survey fields are filled for validation (only date and time are mandatory)
  const canCompleteSurvey = () => {
    return selectedDate && selectedTime;
  };

  // Get the survey data to display
  const surveyData = getSurveyData();

  return (
    <div className={styles.wrapper}>
      {/* Simplified blue bar with curved corner */}
      <div className={styles.topBarContainer}>
        <div className={styles.topBarBack}></div>
      </div>
      
      {/* UPDATED: Add ref to panelContainer */}
      <div className={styles.panelContainer} ref={panelContainerRef}>
        {/* ~ Top Row ~ */}
        <div className={styles.topRow}>
          <div className={styles.leftSection}>
            <Icon name="CustomerUser" className={styles.customerIcon} />
            <span className={styles.customerName}>{lead.customerName}</span>
          </div>
          <div className={styles.rightSection}>
            <div className={styles.scoreContainer}>
              <span className={styles.scoreLabel}>Score: </span>
              <span className={styles.scoreValue}>40</span>
            </div>
            <button className={styles.moreButton}>
              <Icon
                name="More"
                className={styles.moreIcon}
                width={14}
                height={24}
                color="#90A4B7"
              />
            </button>
          </div>
        </div>

        {/* ~ Contact Row ~ */}
        <div className={styles.contactRow}>
          <div className={styles.infoChip}>{displayPhone}</div>
          <div className={styles.emailRow}>
            <div className={styles.infoChip}>
              {lead.customerEmail || 'No Email'}
            </div>
            <button className={styles.editButton} onClick={handleEditClick}>
              <Icon name="Edit" className={styles.editIcon} />
            </button>
          </div>
        </div>

        {/* ~ Status + Activity + Next Action ~ */}
        {/* UPDATED: Add conditional class based on isWideLayout */}
        <div className={`${styles.buttonsRow} ${isWideLayout ? styles.wideLayout : ''}`}>
          {/* Status */}
          <div ref={statusContainerRef} className={styles.buttonWrapper}>
            <button
              type="button"
              className={styles.statusButton}
              onClick={handleToggleStatusDropdown}
            >
              <div className={styles.statusContent}>
                <span className={styles.statusTextLabel}>Status:</span>
                <span className={styles.statusTextValue} style={{ color: statusColor }}>
                  {leadStatus}
                </span>
              </div>
              {leadStatus !== 'New Lead' && currentStatusObj?.icon && (
                <div className={styles.statusIconContainer}>
                  <Icon
                    name={currentStatusObj.icon.name}
                    width={currentStatusObj.icon.width}
                    height={currentStatusObj.icon.height}
                    color="#FFF"
                  />
                </div>
              )}
            </button>

            {showStatusDropdown && (
              <ul className={styles.statusDropdown}>
                {statusOptions
                  .filter((o) => o.label !== 'New Lead')
                  .map((option) => {
                    return (
                      <li
                        key={option.label}
                        className={`${styles.statusOption} ${leadStatus === option.label ? styles.selectedOption : ''}`}
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

          {/* Activity */}
          {!hideActivityButton && (
            <div ref={activityContainerRef} className={styles.buttonWrapper}>
              <button
                type="button"
                className={styles.activityButton}
                onClick={handleToggleActivityDropdown}
              >
                <div className={styles.activityContent}>
                  <span className={styles.activityLabel}>Activity:</span>
                  <span className={styles.activityValue}>{leadActivity}</span>
                </div>
                <Icon name='UnfoldMore' className={styles.moreIcon} />
              </button>

              {showActivityDropdown && (
                <ul className={styles.activityDropdown}>
                  {activityOptions.map((act) => {
                    return (
                      <li
                        key={act}
                        className={`${styles.activityOption} ${act === leadActivity ? styles.selectedOption : ''}`}
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

          {/* UPDATED: Next Action - show based on isWideLayout instead of viewport */}
          {!hideNextAction && (isWideLayout || !isEstimateMode) && (
            <div className={styles.buttonWrapper}>
              <button
                className={`${styles.nextActionButton} ${
                  animateNextAction ? styles.animateNextAction : ''
                } ${
                  nextAction === 'Survey Completed' && !canCompleteSurvey() ? styles.disabledButton : ''
                }`}
                onClick={handleNextActionClick}
                disabled={nextAction === 'Survey Completed' && !canCompleteSurvey()}
                title={
                  nextAction === 'Survey Completed' && !canCompleteSurvey()
                    ? 'Please select Date and Time before completing survey'
                    : ''
                }
              >
                <span className={styles.nextActionLabel}>Next Action:</span>
                <span className={styles.nextActionValue}>{nextAction}</span>
              </button>
            </div>
          )}
        </div>

        {/* ~ Estimator / Survey Date/Time ~ */}
        {isEstimateMode && (
            <div className={`${styles.estimateExtraContainer} ${isWideLayout ? styles.wideEstimateLayout : ''}`}>
              {nextAction === 'Survey Completed' && !canCompleteSurvey() && (
                <div className={styles.requiredFieldsMessage}>
                  Please select Date and Time to complete the survey
                </div>
              )}
              <div className={`${styles.estimateButtonsRow} ${isWideLayout ? styles.wideEstimateButtonsRow : ''}`}>
                {/* Estimator */}
                <div className={styles.inputContainer}>
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
                    <Icon name="User" className={styles.userIcon} />
                  </button>
                  {showEstimatorDropdown && (
                    <ul className={styles.estimatorDropdown}>
                      {users.map((rep) => (
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

                {/* Survey Date */}
                <div className={styles.inputContainer}>
                  <button
                    type="button"
                    className={`${styles.estimatorDateButton} ${
                      nextAction === 'Survey Completed' && !selectedDate ? styles.requiredField : ''
                    }`}
                    onClick={handleToggleCalendar}
                  >
                    <span className={selectedDate ? styles.dateSelected : styles.datePlaceholder}>
                      {selectedDate || 'Date'}
                    </span>
                    <div className={styles.calendarRightIconWrapper}>
                      <Icon name="Calendar" className={styles.calendarIcon} />
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
                        {daysInMonth.map((dayNum) => {
                          // Check if this day matches the selected date
                          const currentDate = new Date(calendarMonth.getFullYear(), calendarMonth.getMonth(), dayNum);
                          const isSelected = selectedDate === currentDate.toDateString();
                          
                          return (
                            <button
                              key={dayNum}
                              type="button"
                              className={`${styles.calendarDay} ${isSelected ? styles.selected : ''}`}
                              onClick={() => handleDayClick(dayNum)}
                            >
                              {dayNum}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>

                {/* Survey Time */}
                <div className={styles.inputContainer}>
                  <button
                    type="button"
                    className={`${styles.estimatorTimeButton} ${
                      nextAction === 'Survey Completed' && !selectedTime ? styles.requiredField : ''
                    }`}
                    onClick={() => setShowTimeDropdown((p) => !p)}
                  >
                    <span className={selectedTime ? styles.timeSelected : styles.timePlaceholder}>
                      {selectedTime || 'Time'}
                    </span>
                    <Icon name="UnfoldMore" className={styles.unfoldIcon} />
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
              </div>

              {/* UPDATED: Next Action for narrow layout only when in estimate mode */}
              {!hideNextAction && !isWideLayout && (
                <div className={styles.nextActionMobileOnly}>
                  <button
                    className={`${styles.nextActionButton} ${
                      animateNextAction ? styles.animateNextAction : ''
                    } ${
                      nextAction === 'Survey Completed' && !canCompleteSurvey() ? styles.disabledButton : ''
                    }`}
                    onClick={handleNextActionClick}
                    disabled={nextAction === 'Survey Completed' && !canCompleteSurvey()}
                    title={
                      nextAction === 'Survey Completed' && !canCompleteSurvey()
                        ? 'Please select Date and Time before completing survey'
                        : ''
                    }
                  >
                    <span className={styles.nextActionLabel}>Next Action:</span>
                    <span className={styles.nextActionValue}>{nextAction}</span>
                  </button>
                </div>
              )}
            </div>
          )}

        {/* UPDATED: Show survey details BEFORE source section when survey is completed - only for narrow layout */}
        {shouldShowSurveyDetails() && !isWideLayout && (
          <div className={styles.surveyDetailsSection}>
            <span className={styles.surveyCompletedLabel}>Survey Completed/</span>
            {surveyData.estimator && (
              <div className={styles.surveyDetailItem}>
                <span className={styles.surveyDetailLabel}>Estimator:</span>
                <span className={styles.surveyDetailValue}>{surveyData.estimator}</span>
              </div>
            )}
            <div className={styles.surveyDetailItem}>
              <span className={styles.surveyDetailLabel}>Date:</span>
              <span className={styles.surveyDetailValue}>
                {surveyData.date ? (
                  surveyData.date instanceof Date 
                    ? surveyData.date.toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric'
                      })
                    : new Date(surveyData.date).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric'
                      })
                ) : ''}
              </span>
            </div>
            <div className={styles.surveyDetailItem}>
              <span className={styles.surveyDetailLabel}>Time:</span>
              <span className={styles.surveyDetailValue}>{surveyData.time}</span>
            </div>
          </div>
        )}

        {/* UPDATED: Conditional rendering based on isWideLayout */}
        {isWideLayout ? (
          // Wide layout: Source and Previous Requests on left, buttons on right
          <div className={styles.sourceAndRequestsWrapper}>
            <div className={styles.sourceAndPreviousSection}>
              {shouldShowSurveyDetails() && (
                <div className={styles.surveyDetailsSection}>
                  <span className={styles.surveyCompletedLabel}>Survey Completed/</span>
                  {surveyData.estimator && (
                    <div className={styles.surveyDetailItem}>
                      <span className={styles.surveyDetailLabel}>Estimator:</span>
                      <span className={styles.surveyDetailValue}>{surveyData.estimator}</span>
                    </div>
                  )}
                  <div className={styles.surveyDetailItem}>
                    <span className={styles.surveyDetailLabel}>Date:</span>
                    <span className={styles.surveyDetailValue}>
                      {surveyData.date ? (
                        surveyData.date instanceof Date 
                          ? surveyData.date.toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric'
                            })
                          : new Date(surveyData.date).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric'
                            })
                      ) : ''}
                    </span>
                  </div>
                  <div className={styles.surveyDetailItem}>
                    <span className={styles.surveyDetailLabel}>Time:</span>
                    <span className={styles.surveyDetailValue}>{surveyData.time}</span>
                  </div>
                </div>
              )}
              <div className={styles.sourceSection}>
                <span className={styles.sourceLabel}>Source:</span>
                <span className={styles.sourceValue}>{lead.source || 'Yelp'}</span>
              </div>
              <div className={styles.previousRequestsLabel}>Previous Requests:</div>
            </div>

            <div className={styles.requestsButtonsContainer}>
              {/* Rate Type Button */}
              <div
                className={styles.rateTypeButton}
                style={{ position: 'relative' }}
                ref={rateTypeRef}
                onClick={(e) => {
                  e.stopPropagation();
                  setShowRateTypeDropdown(!showRateTypeDropdown);
                }}
              >
                <span
                  className={styles.rateTypeText}
                  style={{ color: currentRateType.color }}
                >
                  {currentRateType.label}
                </span>
                <div
                  className={styles.rateTypeIconContainer}
                  style={{ backgroundColor: currentRateType.iconBg }}
                >
                  <Icon
                    name="Terminal"
                    className={styles.terminalIcon}
                    width={28}
                    height={28}
                    color="#FFF"
                  />
                </div>

                {showRateTypeDropdown && (
                  <ul className={styles.rateTypeDropdown}>
                    {rateTypeOptions.map((opt) => {
                      const isSelected = opt.value === rateType;
                      return (
                        <li
                          key={opt.value}
                          className={`${styles.rateTypeOption} ${
                            isSelected ? styles.selectedOption : ''
                          }`}
                          onClick={() => handleSelectRateType(opt)}
                        >
                          {opt.label}
                        </li>
                      );
                    })}
                  </ul>
                )}
              </div>

              {/* Inventory Option */}
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
                  style={{
                    color:
                      inventoryDropdownOptions.find((o) => o.label === inventoryOption)?.textColor ||
                      '#3FA9F5',
                  }}
                >
                  {inventoryOption}
                </span>
                <div
                  className={styles.inventoryIconContainer}
                  style={{
                    backgroundColor:
                      inventoryDropdownOptions.find((o) => o.label === inventoryOption)?.iconBg ||
                      '#3FA9F5',
                  }}
                >
                  <Icon
                    name="SpecialH"
                    className={styles.specialIcon}
                    width={18}
                    height={18}
                    color="#FFF"
                  />
                </div>

                {showInventoryDropdown && (
                  <ul className={styles.inventoryDropdown}>
                    {inventoryDropdownOptions.map((opt) => {
                      const isSelected = opt.label === inventoryOption;
                      return (
                        <li
                          key={opt.label}
                          className={`${styles.inventoryOption} ${
                            isSelected ? styles.selectedOption : ''
                          }`}
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
        ) : (
          // Narrow layout: Original vertical layout
          <>
            <div className={styles.sourceSection}>
              <span className={styles.sourceLabel}>Source:</span>
              <span className={styles.sourceValue}>{lead.source || 'Yelp'}</span>
            </div>
            <div className={styles.previousRequestsLabel}>Previous Requests:</div>

            <div className={styles.requestsButtonsContainer}>
              {/* Rate Type Button (Previously Invite Customer) */}
              <div
                className={styles.rateTypeButton}
                style={{ position: 'relative' }}
                ref={rateTypeRef}
                onClick={(e) => {
                  e.stopPropagation();
                  setShowRateTypeDropdown(!showRateTypeDropdown);
                }}
              >
                <span
                  className={styles.rateTypeText}
                  style={{ color: currentRateType.color }}
                >
                  {currentRateType.label}
                </span>
                <div
                  className={styles.rateTypeIconContainer}
                  style={{ backgroundColor: currentRateType.iconBg }}
                >
                  <Icon
                    name="Terminal"
                    className={styles.terminalIcon}
                    width={28}
                    height={28}
                    color="#FFF"
                  />
                </div>

                {showRateTypeDropdown && (
                  <ul className={styles.rateTypeDropdown}>
                    {rateTypeOptions.map((opt) => {
                      const isSelected = opt.value === rateType;
                      return (
                        <li
                          key={opt.value}
                          className={`${styles.rateTypeOption} ${
                            isSelected ? styles.selectedOption : ''
                          }`}
                          onClick={() => handleSelectRateType(opt)}
                        >
                          {opt.label}
                        </li>
                      );
                    })}
                  </ul>
                )}
              </div>

              {/* Inventory Option */}
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
                  style={{
                    color:
                      inventoryDropdownOptions.find((o) => o.label === inventoryOption)?.textColor ||
                      '#3FA9F5',
                  }}
                >
                  {inventoryOption}
                </span>
                <div
                  className={styles.inventoryIconContainer}
                  style={{
                    backgroundColor:
                      inventoryDropdownOptions.find((o) => o.label === inventoryOption)?.iconBg ||
                      '#3FA9F5',
                  }}
                >
                  <Icon
                    name="SpecialH"
                    className={styles.specialIcon}
                    width={18}
                    height={18}
                    color="#FFF"
                  />
                </div>

                {showInventoryDropdown && (
                  <ul className={styles.inventoryDropdown}>
                    {inventoryDropdownOptions.map((opt) => {
                      const isSelected = opt.label === inventoryOption;
                      return (
                        <li
                          key={opt.label}
                          className={`${styles.inventoryOption} ${
                            isSelected ? styles.selectedOption : ''
                          }`}
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
          </>
        )}
      </div>
      <MoveDetailsPanel
        onShowInventory={onInventoryFullScreen}
        lead={lead}
        onLeadUpdated={onLeadUpdated}
        isWideLayout={isWideLayout}
      />
    </div>
  );
}

export default LeadManagementPanel;