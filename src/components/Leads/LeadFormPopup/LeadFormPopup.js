// src/components/Leads/LeadFormPopup.js

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
  // ---------- Local state for form fields ----------
  const [customerName, setCustomerName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [email, setEmail] = useState('');

  const [selectedCompany, setSelectedCompany] = useState('');
  const [selectedSource, setSelectedSource] = useState('');
  const [selectedTypeOfService, setSelectedTypeOfService] = useState('');
  const [selectedSalesRep, setSelectedSalesRep] = useState('');

  // Move date (if you want to store it)
  const [showCalendar, setShowCalendar] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedMoveDate, setSelectedMoveDate] = useState('');
  const [daysArray, setDaysArray] = useState([]);

  const [assignSalesRep, setAssignSalesRep] = useState(false);

  // ---------- Pre-populate if editingLead is provided ----------
  useEffect(() => {
    if (editingLead) {
      setCustomerName(editingLead.customer_name || '');
      setPhoneNumber(editingLead.customer_phone_number || '');
      setEmail(editingLead.customer_email || '');
      setSelectedCompany(editingLead.company_name || '');
      setSelectedSource(editingLead.source || '');
      setSelectedTypeOfService(editingLead.service_type || 'Moving');
      setSelectedSalesRep(editingLead.sales_name || '');
      // If there's a sales rep, we might enable the toggle
      setAssignSalesRep(!!editingLead.sales_name);
      // For moveDate or additional fields => replicate logic if you have them
    } else {
      // If brand new => clear everything
      setCustomerName('');
      setPhoneNumber('');
      setEmail('');
      setSelectedCompany('');
      setSelectedSource('');
      setSelectedTypeOfService('');
      setSelectedSalesRep('');
      setAssignSalesRep(false);
      setSelectedMoveDate('');
    }
  }, [editingLead]);

  // ---------- Company Dropdown Handlers ----------
  const [showCompanyDropdown, setShowCompanyDropdown] = useState(false);
  const handleToggleCompanyDropdown = () => setShowCompanyDropdown((prev) => !prev);
  const handleSelectCompany = (companyName) => {
    setSelectedCompany(companyName);
    setShowCompanyDropdown(false);
  };

  // ---------- Source Dropdown Handlers ----------
  const [showSourceDropdown, setShowSourceDropdown] = useState(false);
  const handleToggleSourceDropdown = () => setShowSourceDropdown((prev) => !prev);
  const handleSelectSource = (sourceName) => {
    setSelectedSource(sourceName);
    setShowSourceDropdown(false);
  };

  // ---------- Type of Service Dropdown Handlers ----------
  const [showTypeOfServiceDropdown, setShowTypeOfServiceDropdown] = useState(false);
  const handleToggleTypeOfServiceDropdown = () => setShowTypeOfServiceDropdown((prev) => !prev);
  const handleSelectTypeOfService = (serviceName) => {
    setSelectedTypeOfService(serviceName);
    setShowTypeOfServiceDropdown(false);
  };

  // ---------- Calendar / Move Date ----------
  const today = new Date();
  const getDaysInMonth = (month, year) => new Date(year, month + 1, 0).getDate();

  useEffect(() => {
    const month = currentMonth.getMonth();
    const year = currentMonth.getFullYear();
    const daysInMonth = getDaysInMonth(month, year);

    const temp = [];
    for (let i = 1; i <= daysInMonth; i++) {
      temp.push(i);
    }
    setDaysArray(temp);
  }, [currentMonth]);

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

  const handleToggleCalendar = () => setShowCalendar((prev) => !prev);

  const moveDateTextClass = selectedMoveDate
    ? styles.moveDateSelectedText
    : styles.moveDatePlaceholderText;

  // ---------- Sales Rep Toggle + Dropdown ----------
  const handleToggleSalesRep = (newValue) => {
    setAssignSalesRep(newValue);
    if (!newValue) {
      setSelectedSalesRep('');
    }
  };

  const [showSalesRepDropdown, setShowSalesRepDropdown] = useState(false);
  const handleToggleSalesRepDropdown = () => setShowSalesRepDropdown((prev) => !prev);
  const handleSelectSalesRep = (repName) => {
    setSelectedSalesRep(repName);
    setShowSalesRepDropdown(false);
  };

  // ---------- Save Handler: create or update ----------
  const handleSave = async () => {
    try {
      // Gather user-changeable fields
      const updates = {
        customer_name: customerName,
        customer_phone_number: phoneNumber,
        customer_email: email,
        company_name: selectedCompany,
        source: selectedSource,
        service_type: selectedTypeOfService || 'Moving',
        sales_name: selectedSalesRep,
      };

      // If editingLead => update, else create
      if (editingLead) {
        // do not modify IDs or read-only fields
        const updatedLead = await updateLead(editingLead.lead_id, updates);
        if (onLeadUpdated) {
          onLeadUpdated(updatedLead);
        }
        console.log('Lead updated successfully:', updatedLead);
      } else {
        // brand new lead => create
        const newLeadData = {
          ...updates,
          rate_type: 'Hourly Rate',
          lead_status: 'New Lead',
          lead_activity: '',
          next_action: '',
          is_new: true,
        };
        const createdLead = await createLead(newLeadData);
        if (onLeadCreated) {
          onLeadCreated(createdLead);
        }
        console.log('Lead created successfully:', createdLead);
      }

      // Close the popup
      onClose();
    } catch (err) {
      console.error('Failed to save lead:', err);
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

          {/* COMPANY NAME */}
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
                  const isSelected = selectedCompany === company.name;
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
            <div className={styles.inputContainer}>
              <input
                className={styles.activityInput}
                type="text"
                placeholder="Customer Name"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
              />
            </div>

            <div className={styles.inputContainer}>
              <input
                className={styles.activityInput}
                type="text"
                placeholder="Phone Number"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
              />
            </div>

            <div className={styles.inputContainer}>
              <input
                className={styles.activityInput}
                type="text"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            {/* SOURCE */}
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
                  {LeadSourceChoices.map((source) => {
                    const isSelected = selectedSource === source.name;
                    return (
                      <li
                        key={source.id}
                        className={`${styles.option} ${isSelected ? styles.selected : ''}`}
                        role="option"
                        aria-selected={isSelected}
                        onClick={() => handleSelectSource(source.name)}
                        tabIndex={0}
                      >
                        {source.name}
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          </div>

          {/* SERVICE SET */}
          <div className={styles.serviceSet}>
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
                    const isSelected = selectedTypeOfService === service.name;
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

            <div className={styles.inputContainer}>
              <input
                className={styles.activityInput}
                type="text"
                placeholder="From Zip"
              />
            </div>

            <div className={styles.inputContainer}>
              <input
                className={styles.activityInput}
                type="text"
                placeholder="To Zip"
              />
            </div>

            {/* MOVE DATE (OPTIONAL) */}
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
                    <button type="button" onClick={handlePrevMonth}>
                      Prev
                    </button>
                    <span>
                      {currentMonth.toLocaleString('default', { month: 'long' })}{' '}
                      {currentMonth.getFullYear()}
                    </span>
                    <button type="button" onClick={handleNextMonth}>
                      Next
                    </button>
                  </div>
                  <div className={styles.calendarGrid}>
                    {daysArray.map((day) => {
                      const dayDate = new Date(
                        currentMonth.getFullYear(),
                        currentMonth.getMonth(),
                        day
                      );
                      const disabled = dayDate < today.setHours(0, 0, 0, 0);
                      const isSelectedDay =
                        dayDate.toDateString() === selectedMoveDate;

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

          {/* Sales Rep dropdown if toggled ON */}
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
                    const isSelected = selectedSalesRep === rep.name;
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

        {/* STICKY FOOTER */}
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
