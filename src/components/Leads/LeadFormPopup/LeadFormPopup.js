// src/components/Leads/LeadFormPopup.js
import React, { useState } from 'react';
import styles from './LeadFormPopup.module.css';

import { ReactComponent as CloseIcon } from '../../../assets/icons/Close.svg';
import { ReactComponent as CustomerUserIcon } from '../../../assets/icons/customeruser.svg';
import { ReactComponent as UnfoldMoreIcon } from '../../../assets/icons/unfoldmore.svg';

// 1) Import your constants
import CompanyChoices from '../../../data/constants/CompanyChoices';
import LeadSourceChoices from '../../../data/constants/LeadSourceChoices';

function LeadFormPopup({ onClose }) {
  // Local state for text fields
  const [customerName, setCustomerName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [email, setEmail] = useState('');

  // COMPANY NAME DROPDOWN
  const [showCompanyDropdown, setShowCompanyDropdown] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState('');

  const handleToggleCompanyDropdown = (e) => {
    e.stopPropagation();
    setShowCompanyDropdown((prev) => !prev);
  };

  const handleSelectCompany = (companyName) => {
    setSelectedCompany(companyName);
    setShowCompanyDropdown(false);
  };

  // SOURCE DROPDOWN
  const [showSourceDropdown, setShowSourceDropdown] = useState(false);
  const [selectedSource, setSelectedSource] = useState('');

  const handleToggleSourceDropdown = (e) => {
    e.stopPropagation();
    setShowSourceDropdown((prev) => !prev);
  };

  const handleSelectSource = (sourceName) => {
    setSelectedSource(sourceName);
    setShowSourceDropdown(false);
  };

  return (
    <div className={styles.popup} onClick={onClose}>
      <div className={styles.popupContent} onClick={(e) => e.stopPropagation()}>
        
        {/* Header */}
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

        {/* Main content area */}
        <div className={styles.content}>

          {/* ====== COMPANY NAME ====== */}
          <div className={styles.companySelectWrapper}>
            <button
              type="button"
              className={styles.companyNameButton}
              onClick={handleToggleCompanyDropdown}
              aria-haspopup="listbox"
              aria-expanded={showCompanyDropdown}
            >
              <div className={styles.companyNameContent}>
                <span className={styles.companyNameLabel}>Company Name:</span>
                <span className={styles.companyNameValue}>
                  {selectedCompany || 'Select'}
                </span>
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
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSelectCompany(company.name);
                      }}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          handleSelectCompany(company.name);
                        }
                      }}
                      tabIndex={0}
                    >
                      {company.name}
                    </li>
                  );
                })}
              </ul>
            )}
          </div>

          {/* TEXT FIELDS */}
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

            {/* ====== SOURCE ====== */}
            <div className={styles.sourceSelectWrapper}>
              <button
                type="button"
                className={styles.companyNameButton}
                onClick={handleToggleSourceDropdown}
                aria-haspopup="listbox"
                aria-expanded={showSourceDropdown}
              >
                <div className={styles.companyNameContent}>
                  <span className={styles.companyNameLabel}>Source:</span>
                  <span className={styles.companyNameValue}>
                    {selectedSource || 'Select'}
                  </span>
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
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSelectSource(source.name);
                        }}
                        onKeyPress={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            handleSelectSource(source.name);
                          }
                        }}
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
        </div>
      </div>
    </div>
  );
}

export default LeadFormPopup;
