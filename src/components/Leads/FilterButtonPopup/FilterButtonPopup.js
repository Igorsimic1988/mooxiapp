import React, { useState } from 'react';
import styles from './FilterButtonPopup.module.css';

// Icons
import { ReactComponent as CloseIcon } from '../../../assets/icons/Close.svg';
import { ReactComponent as FilterIcon } from '../../../assets/icons/filter.svg';
import { ReactComponent as UnfoldMoreIcon } from '../../../assets/icons/unfoldmore.svg';

// Data
import CompanyChoices from '../../../data/constants/CompanyChoices';
import PossibleSalesReps from '../../../data/constants/PossibleSalesReps';

/**
 * Props:
 *   onClose - function to close the popup
 */
function FilterButtonPopup({ onClose }) {
  // === "By Company" dropdown ===
  const [showCompanyDropdown, setShowCompanyDropdown] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState('All companies');

  // === "By sales person" dropdown ===
  const [showSalesDropdown, setShowSalesDropdown] = useState(false);
  const [selectedSalesRep, setSelectedSalesRep] = useState('All sales');

  // === Toggle: By Workflow / By Date ===
  const [selectedMode, setSelectedMode] = useState('workflow'); // default "By Workflow"

  // === "Workflow" dropdown (only if selectedMode === 'workflow') ===
  const [showWorkflowDropdown, setShowWorkflowDropdown] = useState(false);
  const [selectedWorkflow, setSelectedWorkflow] = useState('Show All');

  // Hard-coded workflow options
  const workflowOptions = [
    'Show All',
    'Today workflow',
    'Tomorrow workflow',
    'Next 7 days',
    'Current Month',
    'Next Month',
  ];

  // ============ HANDLERS ============

  // By Company
  const handleToggleCompanyDropdown = () => {
    setShowCompanyDropdown((prev) => !prev);
  };
  const handleSelectCompany = (companyName) => {
    setSelectedCompany(companyName);
    setShowCompanyDropdown(false);
  };

  // By Sales Person
  const handleToggleSalesDropdown = () => {
    setShowSalesDropdown((prev) => !prev);
  };
  const handleSelectSalesRep = (salesName) => {
    setSelectedSalesRep(salesName);
    setShowSalesDropdown(false);
  };

  // Mode Toggle
  const handleSelectMode = (mode) => {
    setSelectedMode(mode);
  };

  // Workflow Dropdown
  const handleToggleWorkflowDropdown = () => {
    setShowWorkflowDropdown((prev) => !prev);
  };
  const handleSelectWorkflow = (wf) => {
    setSelectedWorkflow(wf);
    setShowWorkflowDropdown(false);
  };

  // Footer
  const handleApplyFilters = () => {
    // You could gather all chosen filters, then pass them to a parent or store.
    console.log('Applying filters with:');
    console.log('Company:', selectedCompany);
    console.log('Sales rep:', selectedSalesRep);
    console.log('Mode:', selectedMode);
    if (selectedMode === 'workflow') {
      console.log('Workflow selected:', selectedWorkflow);
    } else {
      console.log('(Date-based filter placeholder)');
    }
    // Close
    onClose();
  };

  const handleResetAll = () => {
    // Reset to defaults
    setSelectedCompany('All companies');
    setSelectedSalesRep('All sales');
    setSelectedMode('workflow');
    setSelectedWorkflow('Show All');
    console.log('All filters reset');
  };

  // ============ RENDER ============

  return (
    <div className={styles.popup} onClick={onClose}>
      <div className={styles.popupContent} onClick={(e) => e.stopPropagation()}>
        
        {/* ---------- HEADER ---------- */}
        <div className={styles.header}>
          <div className={styles.title}>
            <FilterIcon className={styles.filterIcon} width={24} height={24} />
            <p>Filters</p>
          </div>
          <div className={styles.closeButton}>
            <button type="button" onClick={onClose} aria-label="Close">
              <CloseIcon className={styles.closeIcon} />
            </button>
          </div>
        </div>

        {/* ---------- BODY CONTENT ---------- */}
        <div className={styles.content}>

          {/* === Company Dropdown === */}
          <div className={styles.dropdownContainer}>
            <button
              type="button"
              className={styles.dropdownButton}
              onClick={handleToggleCompanyDropdown}
            >
              <div className={styles.dropdownLabel}>
                <span className={styles.dropdownPrefix}>By company:</span>
                <span
                  className={
                    selectedCompany === 'All companies'
                      ? styles.dropdownPlaceholder
                      : styles.dropdownSelected
                  }
                >
                  {selectedCompany}
                </span>
              </div>
              <UnfoldMoreIcon className={styles.dropdownIcon} />
            </button>

            {showCompanyDropdown && (
              <ul className={styles.optionsList} role="listbox">
                {/* "All companies" at top */}
                <li
                  className={
                    selectedCompany === 'All companies' ? styles.selected : ''
                  }
                  onClick={() => handleSelectCompany('All companies')}
                >
                  All companies
                </li>
                {/* Then load from CompanyChoices */}
                {CompanyChoices.map((company) => {
                  const isSelected = selectedCompany === company.name;
                  return (
                    <li
                      key={company.id}
                      className={isSelected ? styles.selected : ''}
                      onClick={() => handleSelectCompany(company.name)}
                    >
                      {company.name}
                    </li>
                  );
                })}
              </ul>
            )}
          </div>

          {/* === Sales Rep Dropdown === */}
          <div className={styles.dropdownContainer}>
            <button
              type="button"
              className={styles.dropdownButton}
              onClick={handleToggleSalesDropdown}
            >
              <div className={styles.dropdownLabel}>
                <span className={styles.dropdownPrefix}>By sales person:</span>
                <span
                  className={
                    selectedSalesRep === 'All sales'
                      ? styles.dropdownPlaceholder
                      : styles.dropdownSelected
                  }
                >
                  {selectedSalesRep}
                </span>
              </div>
              <UnfoldMoreIcon className={styles.dropdownIcon} />
            </button>

            {showSalesDropdown && (
              <ul className={styles.optionsList} role="listbox">
                {/* "All sales" at top */}
                <li
                  className={
                    selectedSalesRep === 'All sales' ? styles.selected : ''
                  }
                  onClick={() => handleSelectSalesRep('All sales')}
                >
                  All sales
                </li>
                {/* Then load from PossibleSalesReps */}
                {PossibleSalesReps.map((rep) => {
                  const isSelected = selectedSalesRep === rep.name;
                  return (
                    <li
                      key={rep.id}
                      className={isSelected ? styles.selected : ''}
                      onClick={() => handleSelectSalesRep(rep.name)}
                    >
                      {rep.name}
                    </li>
                  );
                })}
              </ul>
            )}
          </div>

          {/* 20px gap */}
          <div style={{ height: '10px' }} />

          {/* === The toggle buttons container (By Workflow / By Date) === */}
          <div className={styles.modeToggleContainer}>
            <button
              type="button"
              className={
                selectedMode === 'workflow'
                  ? styles.dayButtonSelected
                  : styles.dayButtonUnselected
              }
              onClick={() => handleSelectMode('workflow')}
            >
              By Workflow
            </button>
            <button
              type="button"
              className={
                selectedMode === 'date'
                  ? styles.dayButtonSelected
                  : styles.dayButtonUnselected
              }
              onClick={() => handleSelectMode('date')}
            >
              By Date
            </button>
          </div>

          {/* If "By Workflow" => show the Workflow dropdown */}
          {selectedMode === 'workflow' && (
            <div className={styles.dropdownContainer}>
              <button
                type="button"
                className={styles.dropdownButton}
                onClick={handleToggleWorkflowDropdown}
              >
                <div className={styles.dropdownLabel}>
                  <span className={styles.dropdownPrefix}>Workflow:</span>
                  <span
                    className={
                      selectedWorkflow === 'Show All'
                        ? styles.dropdownPlaceholder
                        : styles.dropdownSelected
                    }
                  >
                    {selectedWorkflow}
                  </span>
                </div>
                <UnfoldMoreIcon className={styles.dropdownIcon} />
              </button>

              {showWorkflowDropdown && (
                <ul className={styles.optionsList} role="listbox">
                  {workflowOptions.map((opt, idx) => {
                    const isSelected = selectedWorkflow === opt;
                    return (
                      <li
                        key={idx}
                        className={isSelected ? styles.selected : ''}
                        onClick={() => handleSelectWorkflow(opt)}
                      >
                        {opt}
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          )}

          {/* If "By Date" => show placeholder (you'll add date pickers later) */}
          {selectedMode === 'date' && (
            <div className={styles.datePlaceholder}>
              <p style={{ margin: 0, fontStyle: 'italic' }}>
                (Date-based filter placeholder)
              </p>
            </div>
          )}
        </div>

        {/* ---------- FOOTER ---------- */}
        <div className={styles.footer}>
          <button
            type="button"
            className={styles.applyButton}
            onClick={handleApplyFilters}
          >
            Apply Filters (3)
          </button>
          <button
            type="button"
            className={styles.resetButton}
            onClick={handleResetAll}
          >
            Reset All
          </button>
        </div>
      </div>
    </div>
  );
}

export default FilterButtonPopup;
