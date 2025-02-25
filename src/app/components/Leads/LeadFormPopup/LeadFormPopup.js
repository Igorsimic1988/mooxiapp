import React, { useState, useEffect } from 'react';
import styles from './LeadFormPopup.module.css';
import Image from 'next/image';
// Icons
import CloseIcon from '../../../assets/icons/Close.svg';
import CustomerUserIcon from '../../../assets/icons/customeruser.svg';
import  UnfoldMoreIcon from '../../../assets/icons/unfoldmore.svg';
import CalendarIcon from '../../../assets/icons/calendar.svg';

// Toggles
import SimpleToggle from '../SimpleToggle/SimpleToggle';

// Data
import CompanyChoices from '../../../data/constants/CompanyChoices';
import LeadSourceChoices from '../../../data/constants/LeadSourceChoices';
import PossibleSalesReps from '../../../data/constants/PossibleSalesReps';
import typeOfServiceChoices from '../../../data/constants/typeOfServiceChoices';

// Services
import { createLead, updateLead } from '../../../services/leadService';

/**
 * Props:
 *   onClose        - function to close the popup
 *   onLeadCreated  - callback to parent if we create a new lead
 *   editingLead    - if present, we're editing an existing lead
 *   onLeadUpdated  - callback to parent if we update an existing lead
 */
function LeadFormPopup({
  onClose,
  onLeadCreated,
  editingLead,
  onLeadUpdated
}) {
  // ---------- Local state for basic form fields ----------
  const [customerName, setCustomerName] = useState('');
  const [phoneNumber, setPhoneNumber]   = useState('');
  const [email, setEmail]               = useState('');

  const [selectedCompany, setSelectedCompany]         = useState('');
  const [selectedSource, setSelectedSource]           = useState('');
  const [selectedTypeOfService, setSelectedTypeOfService] = useState('');
  const [selectedSalesRep, setSelectedSalesRep]       = useState('');

  // ---------- Additional fields for Survey / Estimator ----------
  const [estimator, setEstimator]   = useState('');
  const [surveyDate, setSurveyDate] = useState('');
  const [surveyTime, setSurveyTime] = useState('');

  // ---------- Move date (optional) ----------
  const [showCalendar, setShowCalendar]         = useState(false);
  const [currentMonth, setCurrentMonth]         = useState(new Date());
  const [selectedMoveDate, setSelectedMoveDate] = useState('');
  const [daysArray, setDaysArray]               = useState([]);

  // ---------- Assign Sales Rep toggle ----------
  const [assignSalesRep, setAssignSalesRep] = useState(false);

  // If editing => label says "Reassign Sales Rep"
  const salesRepLabel = editingLead ? 'Reassign Sales Rep' : 'Assign Sales Rep';

  // =========================
  // 1) Pre-populate if editing
  // =========================
  useEffect(() => {
    if (editingLead) {
      setCustomerName(editingLead.customer_name || '');
      // Because editingLead.phone might be stored as digits,
      //   we can format it for display here:
      setPhoneNumber(formatPhoneForDisplay(editingLead.customer_phone_number || ''));
      setEmail(editingLead.customer_email || '');
      setSelectedCompany(editingLead.company_name || '');
      setSelectedSource(editingLead.source || '');
      setSelectedTypeOfService(editingLead.service_type || 'Moving');
      setSelectedSalesRep(editingLead.sales_name || '');
      setAssignSalesRep(false);

      setEstimator(editingLead.estimator || '');
      setSurveyDate(editingLead.survey_date || '');
      setSurveyTime(editingLead.survey_time || '');

      setSelectedMoveDate('');
      console.log('[LeadFormPopup] Editing existing lead:', editingLead);
    } else {
      // If brand-new => reset everything
      setCustomerName('');
      setPhoneNumber('');
      setEmail('');
      setSelectedCompany('');
      setSelectedSource('');
      setSelectedTypeOfService('');
      setSelectedSalesRep('');
      setAssignSalesRep(false);

      setEstimator('');
      setSurveyDate('');
      setSurveyTime('');

      setSelectedMoveDate('');
      console.log('[LeadFormPopup] Creating a brand new lead');
    }
  }, [editingLead]);

  // =========================
  // 2) Build days array
  // =========================
  useEffect(() => {
    function getDaysInMonth(month, year) {
      return new Date(year, month + 1, 0).getDate();
    }
    const month = currentMonth.getMonth();
    const year  = currentMonth.getFullYear();
    const daysInMonth = getDaysInMonth(month, year);

    const temp = [];
    for (let i = 1; i <= daysInMonth; i++) {
      temp.push(i);
    }
    setDaysArray(temp);
  }, [currentMonth]);

  // ---------- Dropdown toggles ----------
  const [showCompanyDropdown, setShowCompanyDropdown]         = useState(false);
  const [showSourceDropdown, setShowSourceDropdown]           = useState(false);
  const [showTypeOfServiceDropdown, setShowTypeOfServiceDropdown] = useState(false);
  const [showSalesRepDropdown, setShowSalesRepDropdown]       = useState(false);

  // ==============
  //  PHONE LOGIC
  // ==============
  // As the user types, we update phoneNumber in a formatted style => (xxx) xxx-xxxx
  // If user typed 1 or +1, we remove it and only store the next 10 digits (US only).
  function handlePhoneChange(e) {
    const raw  = e.target.value;
    const nums = raw.replace(/\D/g, ''); // strip all non-digits

    let trimmed = nums;
    // If it starts with '1' and has more than 10 digits, remove the leading '1'
    if (trimmed.startsWith('1') && trimmed.length > 10) {
      trimmed = trimmed.slice(1);
    }
    // If there's still more than 10 => slice
    if (trimmed.length > 10) {
      trimmed = trimmed.slice(0, 10);
    }

    const display = formatPhoneForDisplay(trimmed);
    setPhoneNumber(display);
  }

  // Helper => format "6789091876" => "(678) 909-1876"
  function formatPhoneForDisplay(digits) {
    if (!digits) return '';

    let result = '';
    // area code
    if (digits.length <= 3) {
      result = `(${digits}`;
    } else {
      result = `(${digits.slice(0, 3)})`;
    }
    // next 3
    if (digits.length > 3) {
      result += ` ${digits.slice(3, 6)}`;
    }
    // last 4
    if (digits.length > 6) {
      result += `-${digits.slice(6)}`;
    }
    return result;
  }

  // ==============
  //  Save Handler
  // ==============
  const handleSave = async () => {
    try {
      // Before storing, convert the phoneNumber (which is in display format)
      //   to raw digits only. E.g. "(678) 909-1876" => "6789091876"
      let finalPhoneDigits = phoneNumber.replace(/\D/g, '');
      // If it starts with '1' and is > 10 => remove leading '1'
      if (finalPhoneDigits.startsWith('1') && finalPhoneDigits.length > 10) {
        finalPhoneDigits = finalPhoneDigits.slice(1);
      }

      const updates = {
        customer_name: customerName,
        // store the digits only
        customer_phone_number: finalPhoneDigits,
        customer_email: email,
        company_name: selectedCompany,
        source: selectedSource,
        service_type: selectedTypeOfService || 'Moving',
        sales_name: selectedSalesRep,

        // Additional fields for the lead
        estimator,
        survey_date: surveyDate,
        survey_time: surveyTime,
      };

      // If editing => update
      if (editingLead) {
        console.log('[LeadFormPopup] Attempting update with lead_id:', editingLead.lead_id);
        const updatedLead = await updateLead(editingLead.lead_id, updates);
        console.log('[LeadFormPopup] updateLead result:', updatedLead);
        if (onLeadUpdated) {
          onLeadUpdated(updatedLead);
        }
      }
      // Else create new
      else {
        const newLeadData = {
          ...updates,
          rate_type: 'Hourly Rate',
          lead_status: 'New Lead',
          lead_activity: '',
          next_action: '',
          is_new: true,
        };
        const createdLead = await createLead(newLeadData);
        console.log('[LeadFormPopup] createLead result:', createdLead);
        if (onLeadCreated) {
          onLeadCreated(createdLead);
        }
      }

      // close popup
      onClose();
    } catch (err) {
      console.error('Failed to save lead:', err);
    }
  };

  // ================
  //  Company, Source, TypeOfService, SalesRep, etc.
  // ================
  const handleToggleCompanyDropdown = () => setShowCompanyDropdown((prev) => !prev);
  const handleSelectCompany = (companyName) => {
    setSelectedCompany(companyName);
    setShowCompanyDropdown(false);
  };

  const handleToggleSourceDropdown = () => setShowSourceDropdown((prev) => !prev);
  const handleSelectSource = (sourceName) => {
    setSelectedSource(sourceName);
    setShowSourceDropdown(false);
  };

  const handleToggleTypeOfServiceDropdown = () => setShowTypeOfServiceDropdown((prev) => !prev);
  const handleSelectTypeOfService = (serviceName) => {
    setSelectedTypeOfService(serviceName);
    setShowTypeOfServiceDropdown(false);
  };

  const handleToggleSalesRep = (newValue) => {
    setAssignSalesRep(newValue);
    if (!newValue) setSelectedSalesRep('');
  };
  const handleToggleSalesRepDropdown = () => setShowSalesRepDropdown((prev) => !prev);
  const handleSelectSalesRep = (repName) => {
    setSelectedSalesRep(repName);
    setShowSalesRepDropdown(false);
  };

  // ================
  //  Move Date Calendar
  // ================
  const handleToggleCalendar = () => setShowCalendar((prev) => !prev);

  const handlePrevMonth = () => {
    setCurrentMonth((prevDate) => {
      const newMonth = prevDate.getMonth() - 1;
      return new Date(prevDate.getFullYear(), newMonth, 1);
    });
  };
  const handleNextMonth = () => {
    setCurrentMonth((prevDate) => {
      const newMonth = prevDate.getMonth() + 1;
      return new Date(prevDate.getFullYear(), newMonth, 1);
    });
  };
  const handleDayClick = (day) => {
    const chosenDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
    const today = new Date();
    if (chosenDate < new Date(today.setHours(0,0,0,0))) return;

    setSelectedMoveDate(chosenDate.toDateString());
    setShowCalendar(false);
  };

  const moveDateTextClass = selectedMoveDate
    ? styles.moveDateSelectedText
    : styles.moveDatePlaceholderText;

  return (
    <div className={styles.popup} onClick={onClose}>
      <div className={styles.popupContent} onClick={(e) => e.stopPropagation()}>

        {/* ---------- HEADER ---------- */}
        <div className={styles.header}>
          <div className={styles.title}>
            <Image src={CustomerUserIcon} alt="Customer User" className={styles.customerUserIcon} />
            {editingLead ? <p>Edit Lead</p> : <p>New Lead</p>}
          </div>
          <div className={styles.closeButton}>
            <button type="button" onClick={onClose} aria-label="Close">
              <Image src={CloseIcon} alt="Close" className={styles.closeIcon} />
            </button>
          </div>
        </div>

        {/* ---------- MAIN CONTENT ---------- */}
        <div className={styles.content}>

          {/* COMPANY NAME dropdown */}
          <div className={styles.companySelectWrapper}>
            <button
              type="button"
              className={styles.dropdownButton}
              onClick={handleToggleCompanyDropdown}
            >
              <div className={styles.dropdownLabel}>
                {selectedCompany === '' ? (
                  <>
                    <span className={styles.dropdownPrefix}>Company Name:</span>
                    <span className={styles.dropdownPlaceholder}>Select</span>
                  </>
                ) : (
                  <span className={styles.dropdownSelected}>{selectedCompany}</span>
                )}
              </div>
              <Image src={CustomerUserIcon} alt="Customer User" className={styles.customerUserIcon} />
            </button>

            {showCompanyDropdown && (
              <ul className={styles.optionsList} role="listbox">
                {CompanyChoices.map((company) => {
                  const isSelected = (selectedCompany === company.name);
                  return (
                    <li
                      key={company.id}
                      className={`${styles.option} ${isSelected ? styles.selected : ''}`}
                      role="option"
                      aria-selected={isSelected}
                      onClick={() => handleSelectCompany(company.name)}
                      tabIndex={0}
                    >
                      {company.name}
                    </li>
                  );
                })}
              </ul>
            )}
          </div>

          {/* BASIC INPUT FIELDS */}
          <div className={styles.inputSet}>
            {/* Customer Name */}
            <div className={styles.inputContainer}>
              <input
                className={styles.activityInput}
                type="text"
                placeholder="Customer Name"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
              />
            </div>

            {/* Phone Number (formatted) */}
            <div className={styles.inputContainer}>
              <input
                className={styles.activityInput}
                type="text"
                placeholder="Phone Number"
                value={phoneNumber}
                onChange={handlePhoneChange}
              />
            </div>

            {/* Email */}
            <div className={styles.inputContainer}>
              <input
                className={styles.activityInput}
                type="text"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            {/* SOURCE Dropdown */}
            <div className={styles.sourceSelectWrapper}>
              <button
                type="button"
                className={styles.dropdownButton}
                onClick={handleToggleSourceDropdown}
              >
                <div className={styles.dropdownLabel}>
                  {selectedSource === '' ? (
                    <>
                      <span className={styles.dropdownPrefix}>Source:</span>
                      <span className={styles.dropdownPlaceholder}>Select</span>
                    </>
                  ) : (
                    <span className={styles.dropdownSelected}>{selectedSource}</span>
                  )}
                </div>
                <Image src={CustomerUserIcon} alt="Customer User" className={styles.customerUserIcon} />
              </button>

              {showSourceDropdown && (
                <ul className={styles.optionsList} role="listbox">
                  {LeadSourceChoices.map((src) => {
                    const isSelected = (selectedSource === src.name);
                    return (
                      <li
                        key={src.id}
                        className={`${styles.option} ${isSelected ? styles.selected : ''}`}
                        role="option"
                        aria-selected={isSelected}
                        onClick={() => handleSelectSource(src.name)}
                        tabIndex={0}
                      >
                        {src.name}
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          </div>

          {/* SERVICE SET (Type of Service, fromZip, toZip, etc.) */}
          <div className={styles.serviceSet}>

            {/* Type of Service dropdown */}
            <div className={styles.typeOfServiceSelectWrapper}>
              <button
                type="button"
                className={styles.dropdownButton}
                onClick={handleToggleTypeOfServiceDropdown}
              >
                <div className={styles.dropdownLabel}>
                  <span className={styles.dropdownPrefix}>Type of Service:</span>
                  {selectedTypeOfService ? (
                    <span className={styles.dropdownSelected}>
                      {selectedTypeOfService}
                    </span>
                  ) : (
                    <span className={styles.dropdownPlaceholder}>Select</span>
                  )}
                </div>
                <Image src={CustomerUserIcon} alt="Customer User" className={styles.customerUserIcon} />
              </button>

              {showTypeOfServiceDropdown && (
                <ul className={styles.optionsList} role="listbox">
                  {typeOfServiceChoices.map((service) => {
                    const isSelected = (selectedTypeOfService === service.name);
                    return (
                      <li
                        key={service.id}
                        className={`${styles.option} ${isSelected ? styles.selected : ''}`}
                        role="option"
                        aria-selected={isSelected}
                        onClick={() => handleSelectTypeOfService(service.name)}
                        tabIndex={0}
                      >
                        {service.name}
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>

            {/* From Zip */}
            <div className={styles.inputContainer}>
              <input
                className={styles.activityInput}
                type="text"
                placeholder="From Zip"
              />
            </div>

            {/* To Zip */}
            <div className={styles.inputContainer}>
              <input
                className={styles.activityInput}
                type="text"
                placeholder="To Zip"
              />
            </div>

            {/* Optional: Move Date */}
            <div className={styles.moveDateWrapper}>
              <button
                type="button"
                className={styles.moveDateButton}
                onClick={handleToggleCalendar}
              >
                <span className={moveDateTextClass}>
                  {selectedMoveDate || 'Move Date'}
                </span>
                <div className={styles.calendarIconWrapper}>
                  <Image src={CalendarIcon} alt="Calendar" className={styles.calendarIcon} />
                </div>
              </button>

              {showCalendar && (
                <div className={styles.calendarPopup}>
                  <div className={styles.calendarHeader}>
                    <button type="button" onClick={handlePrevMonth}>Prev</button>
                    <span>
                      {currentMonth.toLocaleString('default', { month: 'long' })}{' '}
                      {currentMonth.getFullYear()}
                    </span>
                    <button type="button" onClick={handleNextMonth}>Next</button>
                  </div>
                  <div className={styles.calendarGrid}>
                    {daysArray.map((day) => {
                      const dayDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
                      const disabled = (dayDate < new Date().setHours(0, 0, 0, 0));
                      const isSelectedDay = (dayDate.toDateString() === selectedMoveDate);

                      return (
                        <button
                          key={day}
                          type="button"
                          className={`${styles.calendarDay} ${
                            disabled
                              ? styles.dayDisabled
                              : isSelectedDay
                              ? styles.daySelected
                              : ''
                          }`}
                          onClick={() => {
                            if (!disabled) handleDayClick(day);
                          }}
                          disabled={disabled}
                        >
                          {day}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* ASSIGN SALES REP TOGGLE */}
          <div className={styles.assignSalesToggleContainer}>
            <span className={styles.assignSalesToggleLabel}>{salesRepLabel}</span>
            <SimpleToggle
              isToggled={assignSalesRep}
              onToggle={handleToggleSalesRep}
            />
          </div>

          {/* If toggled ON => Sales Rep dropdown */}
          {assignSalesRep && (
            <div className={styles.salesRepSelectWrapper}>
              <button
                type="button"
                className={styles.dropdownButton}
                onClick={handleToggleSalesRepDropdown}
              >
                <div className={styles.dropdownLabel}>
                  {selectedSalesRep === '' ? (
                    <>
                      <span className={styles.dropdownPrefix}>Sales Rep:</span>
                      <span className={styles.dropdownPlaceholder}>Select</span>
                    </>
                  ) : (
                    <span className={styles.dropdownSelected}>{selectedSalesRep}</span>
                  )}
                </div>
                <UnfoldMoreIcon className={styles.dropdownIcon} />
              </button>

              {showSalesRepDropdown && (
                <ul className={styles.optionsList} role="listbox">
                  {PossibleSalesReps.map((rep) => {
                    const isSelected = (selectedSalesRep === rep.name);
                    return (
                      <li
                        key={rep.id}
                        className={`${styles.option} ${isSelected ? styles.selected : ''}`}
                        role="option"
                        aria-selected={isSelected}
                        onClick={() => handleSelectSalesRep(rep.name)}
                        tabIndex={0}
                      >
                        {rep.name}
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          )}
        </div>

        {/* ---------- FOOTER ---------- */}
        <div className={styles.stickyFooter}>
          <button
            type="button"
            className={styles.saveButton}
            onClick={handleSave}
          >
            Save
          </button>
          <div className={styles.previousRequests}>
            Previous requests:
          </div>
        </div>
      </div>
    </div>
  );
}

export default LeadFormPopup;
