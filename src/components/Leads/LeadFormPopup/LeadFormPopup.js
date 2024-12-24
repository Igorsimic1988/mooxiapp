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

function LeadFormPopup({ onClose }) {
  // ---------- Basic text fields ----------
  const [customerName, setCustomerName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [email, setEmail] = useState('');

  // ---------- COMPANY NAME ----------
  const [showCompanyDropdown, setShowCompanyDropdown] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState('');

  const handleToggleCompanyDropdown = () => {
    setShowCompanyDropdown((prev) => !prev);
  };

  const handleSelectCompany = (companyName) => {
    setSelectedCompany(companyName);
    setShowCompanyDropdown(false);
  };

  // ---------- SOURCE ----------
  const [showSourceDropdown, setShowSourceDropdown] = useState(false);
  const [selectedSource, setSelectedSource] = useState('');

  const handleToggleSourceDropdown = () => {
    setShowSourceDropdown((prev) => !prev);
  };

  const handleSelectSource = (sourceName) => {
    setSelectedSource(sourceName);
    setShowSourceDropdown(false);
  };

  // ---------- MOVE DATE ----------
  const [showCalendar, setShowCalendar] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedMoveDate, setSelectedMoveDate] = useState('');
  const [daysArray, setDaysArray] = useState([]);

  const today = new Date();

  // Helper: days in current month
  const getDaysInMonth = (month, year) => {
    return new Date(year, month + 1, 0).getDate();
  };

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
    const chosenDate = new Date(
      currentMonth.getFullYear(),
      currentMonth.getMonth(),
      day
    );
    if (chosenDate < today.setHours(0, 0, 0, 0)) return;

    setSelectedMoveDate(chosenDate.toDateString());
    setShowCalendar(false);
  };

  const handleToggleCalendar = () => {
    setShowCalendar((prev) => !prev);
  };

  // Decide style for "Move Date" placeholder vs selected
  const moveDateTextClass = selectedMoveDate
    ? styles.moveDateSelectedText
    : styles.moveDatePlaceholderText;

  // ---------- ASSIGN SALES REP TOGGLE + DROPDOWN ----------
  const [assignSalesRep, setAssignSalesRep] = useState(false);
  const [showSalesRepDropdown, setShowSalesRepDropdown] = useState(false);
  const [selectedSalesRep, setSelectedSalesRep] = useState('');

  const handleToggleSalesRep = (newValue) => {
    setAssignSalesRep(newValue);
  };

  const handleToggleSalesRepDropdown = () => {
    setShowSalesRepDropdown((prev) => !prev);
  };

  const handleSelectSalesRep = (repName) => {
    setSelectedSalesRep(repName);
    setShowSalesRepDropdown(false);
  };

  // ---------- Saving (Placeholder: can attach logic) ----------
  const handleSave = () => {
    // Insert actual "Save" logic here:
    // e.g., send fields to API or Redux store
    console.log('Save clicked:', {
      customerName,
      phoneNumber,
      email,
      selectedCompany,
      selectedSource,
      selectedMoveDate,
      assignSalesRep,
      selectedSalesRep,
    });
  };

  return (
    <div className={styles.popup} onClick={onClose}>
      <div className={styles.popupContent} onClick={(e) => e.stopPropagation()}>
        
        {/* ---------- HEADER ---------- */}
        <div className={styles.header}>
          <div className={styles.title}>
            <CustomerUserIcon
              className={styles.customerUserIcon}
              width={24}
              height={24}
            />
            <p>New Lead</p>
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
                  <span className={styles.dropdownSelected}>
                    {selectedCompany}
                  </span>
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
                      className={`${styles.option} ${
                        isSelected ? styles.selected : ''
                      }`}
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
                    <span className={styles.dropdownSelected}>
                      {selectedSource}
                    </span>
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
                        className={`${styles.option} ${
                          isSelected ? styles.selected : ''
                        }`}
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
            <button type="button" className={styles.serviceButton}>
              <div className={styles.dropdownLabel}>
                <span className={styles.dropdownPrefix}>Type of Service:</span>
                <span className={styles.dropdownPlaceholder}>Moving</span>
              </div>
              <UnfoldMoreIcon className={styles.dropdownIcon} />
            </button>

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

            {/* MOVE DATE */}
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
                      {currentMonth.toLocaleString('default', {
                        month: 'long',
                      })}{' '}
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

          {/* ---------- ASSIGN SALES REP TOGGLE ---------- */}
          <div className={styles.assignSalesToggleContainer}>
            <span className={styles.assignSalesToggleLabel}>Assign Sales Rep</span>
            <SimpleToggle
              isToggled={assignSalesRep}
              onToggle={handleToggleSalesRep}
            />
          </div>

          {/* If toggle is ON, show the Sales Rep dropdown 12px below */}
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
                    <span className={styles.dropdownSelected}>
                      {selectedSalesRep}
                    </span>
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
                        className={`${styles.option} ${
                          isSelected ? styles.selected : ''
                        }`}
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

        {/* ---------- STICKY FOOTER with SAVE BUTTON + "Previous requests" ---------- */}
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
