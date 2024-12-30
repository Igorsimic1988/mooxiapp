// src/components/Leads/LeadFormPopup/LeadFormPopup.js

import React, { useState, useEffect } from 'react';
import styles from './LeadFormPopup.module.css';

// Icons
import { ReactComponent as CloseIcon } from '../../../assets/icons/Close.svg';
import { ReactComponent as CustomerUserIcon } from '../../../assets/icons/customeruser.svg';
import { ReactComponent as UnfoldMoreIcon } from '../../../assets/icons/unfoldmore.svg';
import { ReactComponent as CalendarIcon } from '../../../assets/icons/calendar.svg';

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
  const [phoneNumber, setPhoneNumber] = useState('');
  const [email, setEmail] = useState('');

  const [selectedCompany, setSelectedCompany] = useState('');
  const [selectedSource, setSelectedSource] = useState('');
  const [selectedTypeOfService, setSelectedTypeOfService] = useState('');
  const [selectedSalesRep, setSelectedSalesRep] = useState('');

  // ---------- Additional fields for Survey / Estimator ----------
  const [estimator, setEstimator] = useState('');       // e.g. "Bob Smith"
  const [surveyDate, setSurveyDate] = useState('');     // e.g. "2024-12-25" or some string
  const [surveyTime, setSurveyTime] = useState('');     // e.g. "10:00 AM"

  // ---------- Move date (optional) ----------
  const [showCalendar, setShowCalendar] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedMoveDate, setSelectedMoveDate] = useState('');
  const [daysArray, setDaysArray] = useState([]);

  // ---------- Assign Sales Rep toggle ----------
  const [assignSalesRep, setAssignSalesRep] = useState(false);

  // ---------- If editingLead is provided, pre-populate ----------
  useEffect(() => {
    if (editingLead) {
      setCustomerName(editingLead.customer_name || '');
      setPhoneNumber(editingLead.customer_phone_number || '');
      setEmail(editingLead.customer_email || '');
      setSelectedCompany(editingLead.company_name || '');
      setSelectedSource(editingLead.source || '');
      setSelectedTypeOfService(editingLead.service_type || 'Moving');
      setSelectedSalesRep(editingLead.sales_name || '');
      setAssignSalesRep(!!editingLead.sales_name);

      // Additional fields from the lead (if present):
      setEstimator(editingLead.estimator || '');
      setSurveyDate(editingLead.survey_date || '');
      setSurveyTime(editingLead.survey_time || '');

      setSelectedMoveDate(''); // If you store a date, do it here
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

      // Additional fields reset to empty for new leads:
      setEstimator('');
      setSurveyDate('');
      setSurveyTime('');

      setSelectedMoveDate('');
      console.log('[LeadFormPopup] Creating a brand new lead');
    }
  }, [editingLead]);

  // ---------- build days array whenever currentMonth changes ----------
  useEffect(() => {
    function getDaysInMonth(month, year) {
      return new Date(year, month + 1, 0).getDate();
    }
    const month = currentMonth.getMonth();
    const year = currentMonth.getFullYear();
    const daysInMonth = getDaysInMonth(month, year);

    const temp = [];
    for (let i = 1; i <= daysInMonth; i++) {
      temp.push(i);
    }
    setDaysArray(temp);
  }, [currentMonth]);

  // ---------- Dropdown toggles ----------
  const [showCompanyDropdown, setShowCompanyDropdown] = useState(false);
  const [showSourceDropdown, setShowSourceDropdown] = useState(false);
  const [showTypeOfServiceDropdown, setShowTypeOfServiceDropdown] = useState(false);
  const [showSalesRepDropdown, setShowSalesRepDropdown] = useState(false);

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

  // ---------- Calendar for move date ----------
  const today = new Date();
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
    if (chosenDate < today.setHours(0, 0, 0, 0)) return;
    setSelectedMoveDate(chosenDate.toDateString());
    setShowCalendar(false);
  };

  const moveDateTextClass = selectedMoveDate
    ? styles.moveDateSelectedText
    : styles.moveDatePlaceholderText;

  // ---------- Sales Rep Toggle + Dropdown ----------
  const handleToggleSalesRep = (newValue) => {
    setAssignSalesRep(newValue);
    if (!newValue) setSelectedSalesRep('');
  };

  const handleToggleSalesRepDropdown = () => setShowSalesRepDropdown((prev) => !prev);
  const handleSelectSalesRep = (repName) => {
    setSelectedSalesRep(repName);
    setShowSalesRepDropdown(false);
  };

  // ---------- Save Handler ----------
  const handleSave = async () => {
    try {
      // Build the object of user-changeable fields
      const updates = {
        customer_name: customerName,
        customer_phone_number: phoneNumber,
        customer_email: email,
        company_name: selectedCompany,
        source: selectedSource,
        service_type: selectedTypeOfService || 'Moving',
        sales_name: selectedSalesRep,

        // Additional fields for the lead
        estimator,
        survey_date: surveyDate,
        survey_time: surveyTime,

        // If you want to store the "move date", add it here
        // move_date: selectedMoveDate ? new Date(selectedMoveDate).toISOString() : null,
      };

      // If editing an existing lead => update
      if (editingLead) {
        console.log('[LeadFormPopup] Attempting update with lead_id:', editingLead.lead_id);
        const updatedLead = await updateLead(editingLead.lead_id, updates);
        console.log('[LeadFormPopup] updateLead result:', updatedLead);
        if (onLeadUpdated) {
          onLeadUpdated(updatedLead);
        }
      }
      // Otherwise create a brand-new lead
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

      // Finally, close the popup
      onClose();
    } catch (err) {
      console.error('Failed to save lead:', err);
      // Could be: "Error: Lead with id X not found"
      // or an issue with multiple versions of @emotion/react, etc.
    }
  };

  return (
    <div className={styles.popup} onClick={onClose}>
      <div className={styles.popupContent} onClick={(e) => e.stopPropagation()}>
        
        {/* ---------- HEADER ---------- */}
        <div className={styles.header}>
          <div className={styles.title}>
            <CustomerUserIcon className={styles.customerUserIcon} width={24} height={24} />
            {editingLead ? <p>Edit Lead</p> : <p>New Lead</p>}
          </div>
          <div className={styles.closeButton}>
            <button type="button" onClick={onClose} aria-label="Close">
              <CloseIcon className={styles.closeIcon} />
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
              <UnfoldMoreIcon className={styles.dropdownIcon} />
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

            {/* Phone Number */}
            <div className={styles.inputContainer}>
              <input
                className={styles.activityInput}
                type="text"
                placeholder="Phone Number"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
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
                <UnfoldMoreIcon className={styles.dropdownIcon} />
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
                <UnfoldMoreIcon className={styles.dropdownIcon} />
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
                  <CalendarIcon className={styles.calendarIcon} />
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
                      const disabled = (dayDate < today.setHours(0, 0, 0, 0));
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
            <span className={styles.assignSalesToggleLabel}>Assign Sales Rep</span>
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
