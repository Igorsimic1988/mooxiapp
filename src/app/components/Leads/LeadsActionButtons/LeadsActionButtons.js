"use client";

import React, { useState } from 'react';
import styles from './LeadsActionButtons.module.css';
import Icon from '../../Icon';
import PossibleSalesReps from '../../../data/constants/PossibleSalesReps';

/**
 * Props:
 *   onOpenFilterPopup - function to open the filter popup
 *   filterCount       - number indicating how many filters are active (default: 0)
 *   onTransferLead    - function to handle lead transfer with selected sales rep
 *   onTransferModeChange - function to notify parent when transfer mode is toggled
 */
function LeadsActionButtons({ onOpenFilterPopup, filterCount = 0, onTransferLead, onTransferModeChange }) {
  const hasFilters = filterCount > 0;
  
  // State for transfer dropdown
  const [showTransferOptions, setShowTransferOptions] = useState(false);
  const [selectedSalesRep, setSelectedSalesRep] = useState('');
  const [showSalesRepDropdown, setShowSalesRepDropdown] = useState(false);

  // Toggle the transfer options visibility
  const handleToggleTransferOptions = () => {
    const newState = !showTransferOptions;
    setShowTransferOptions(newState);
    
    // Notify parent component of the state change
    if (onTransferModeChange) {
      onTransferModeChange(newState);
    }
    
    // Reset dropdown state when hiding transfer options
    if (showTransferOptions) {
      setShowSalesRepDropdown(false);
    }
  };

  // Handle the sales rep dropdown
  const handleToggleSalesRepDropdown = () => setShowSalesRepDropdown(prev => !prev);
  
  // Handle selecting a sales rep
  const handleSelectSalesRep = (repName) => {
    setSelectedSalesRep(repName);
    setShowSalesRepDropdown(false);
    // If we have an onTransferLead callback, call it with the selected rep
    if (onTransferLead) {
      onTransferLead(repName);
    }
  };

  return (
    <div className={styles.container}>
      {/* FILTER BUTTON */}
      <button
        className={styles.button}
        aria-label="Filter"
        onClick={onOpenFilterPopup}
      >
        <div
          className={
            hasFilters
              ? `${styles.iconBackground} ${styles.iconBackgroundActive}`
              : styles.iconBackground
          }
        >
          {/* If filters are active, show a badge with the count */}
          {hasFilters && (
            <span className={styles.badge}>{filterCount}</span>
          )}

          <span className={hasFilters ? `${styles.buttonText} ${styles.buttonTextActive}` : styles.buttonText}>
            Filter
          </span>
          <Icon
            name="Filter"
            className={
              hasFilters
                ? `${styles.icon} ${styles.iconActive}`
                : styles.icon
            }
          />
        </div>
      </button>

      {/* TRANSFER BUTTON */}
      <button 
        className={styles.button} 
        aria-label="Transfer Lead"
        onClick={handleToggleTransferOptions}
      >
        <div className={
          showTransferOptions
            ? `${styles.iconBackground} ${styles.transferBackgroundActive}`
            : styles.iconBackground
        }>
          {/* Add exclamation mark badge when transfer is active */}
          {showTransferOptions && (
            <span className={styles.transferBadge}>!</span>
          )}

          <span className={showTransferOptions ? `${styles.buttonText} ${styles.buttonTextActive}` : styles.buttonText}>
            Transfer Lead
          </span>
          <Icon 
            name="Transfer" 
            className={
              showTransferOptions
                ? `${styles.icon} ${styles.transferIconActive}`
                : styles.icon
            } 
          />
        </div>
      </button>

      {/* SALES REP DROPDOWN - Only show when transfer options are visible */}
      {showTransferOptions && (
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
            <Icon name="UnfoldMore" className={styles.dropdownIcon} />
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
  );
}

export default LeadsActionButtons;