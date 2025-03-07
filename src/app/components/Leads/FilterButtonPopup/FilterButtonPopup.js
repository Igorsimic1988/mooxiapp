import React, { useState, useEffect, useRef  } from 'react';
import styles from './FilterButtonPopup.module.css';

// Icons
import  CloseIcon  from '../../../assets/icons/Close.svg';
import  FilterIcon  from '../../../assets/icons/filter.svg';
import  UnfoldMoreIcon  from '../../../assets/icons/unfoldmore.svg';
import { ReactComponent as CalendarIcon } from '../../../assets/icons/calendar.svg';

// Data
import CompanyChoices from '../../../data/constants/CompanyChoices';
import PossibleSalesReps from '../../../data/constants/PossibleSalesReps';
import Image from 'next/image';

function FilterButtonPopup({
    onClose,

   // Parent states + setters
   selectedCompany,   setSelectedCompany,
   selectedSalesRep,  setSelectedSalesRep,
   selectedMode,      setSelectedMode,
   selectedWorkflow,  setSelectedWorkflow,
   selectedWhere,     setSelectedWhere,
   fromDate,          setFromDate,
   toDate,            setToDate,

 // Status
 statusOptions,
 checkedStatuses,
 setCheckedStatuses,
}) {
 // ---------------- LOCAL STATES ----------------
 const [tempCompany, setTempCompany]     = useState(selectedCompany);
 const [tempSalesRep, setTempSalesRep]   = useState(selectedSalesRep);
 const [tempMode, setTempMode]           = useState(selectedMode);
 const [tempWorkflow, setTempWorkflow]   = useState(selectedWorkflow);
 const [tempWhere, setTempWhere]         = useState(selectedWhere);
 const [tempFromDate, setTempFromDate]   = useState(fromDate);
 const [tempToDate,   setTempToDate]     = useState(toDate);
  // Copy the parent's checked statuses into local state
  const [tempCheckedStatuses, setTempCheckedStatuses] = useState([...checkedStatuses]);

  // Dropdown controls
  const [showCompanyDropdown, setShowCompanyDropdown] = useState(false);
  const [showSalesDropdown,   setShowSalesDropdown]   = useState(false);
  const [showWorkflowDropdown,setShowWorkflowDropdown]= useState(false);
  const [showWhereDropdown,   setShowWhereDropdown]   = useState(false);
  const [showFromCalendar,    setShowFromCalendar]    = useState(false);
  const [showToCalendar,      setShowToCalendar]      = useState(false);

  // "Workflow" & "Where" options
  const workflowOptions = [
    'Show All',
    'Today workflow',
    'Tomorrow workflow',
    'Next 7 days',
    'Current Month',
    'Next Month',
  ];

  const whereOptions = [
    'Creation Date',
    'Move Date',
    'Appointment Date',
    'Sales Activity',
  ];

  // For calendars
  const [fromCalendarMonth, setFromCalendarMonth] = useState(new Date());
  const [toCalendarMonth,   setToCalendarMonth]   = useState(new Date());
  const [fromDaysInMonth,   setFromDaysInMonth]   = useState([]);
  const [toDaysInMonth,     setToDaysInMonth]     = useState([]);

  // Generate calendar days each time the month changes
  useEffect(() => {
    const makeDaysArray = (year, month) => {
      const numDays = new Date(year, month + 1, 0).getDate();
      return Array.from({ length: numDays }, (_, i) => i + 1);
    };

  // fromCalendar
  const fYear = fromCalendarMonth.getFullYear();
  const fMonth = fromCalendarMonth.getMonth();
  setFromDaysInMonth(makeDaysArray(fYear, fMonth));

  // toCalendar
  const tYear = toCalendarMonth.getFullYear();
  const tMonth = toCalendarMonth.getMonth();
  setToDaysInMonth(makeDaysArray(tYear, tMonth));
}, [fromCalendarMonth, toCalendarMonth]);

// Refs for outside-click detection
const companyRef  = useRef(null);
const salesRef    = useRef(null);
const workflowRef = useRef(null);
const whereRef    = useRef(null);
const fromCalRef  = useRef(null);
const toCalRef    = useRef(null);

// Close dropdowns if user clicks outside
useEffect(() => {
  function handleClickOutside(e) {
    if (companyRef.current && !companyRef.current.contains(e.target)) {
      setShowCompanyDropdown(false);
    }
    if (salesRef.current && !salesRef.current.contains(e.target)) {
      setShowSalesDropdown(false);
    }
    if (workflowRef.current && !workflowRef.current.contains(e.target)) {
      setShowWorkflowDropdown(false);
    }
    if (whereRef.current && !whereRef.current.contains(e.target)) {
      setShowWhereDropdown(false);
    }
    if (fromCalRef.current && !fromCalRef.current.contains(e.target)) {
      setShowFromCalendar(false);
    }
    if (toCalRef.current && !toCalRef.current.contains(e.target)) {
      setShowToCalendar(false);
    }
  }
  document.addEventListener('mousedown', handleClickOutside);
  return () => {
    document.removeEventListener('mousedown', handleClickOutside);
  };
}, []);

// Toggle a status in/out of the local array
const toggleLocalStatus = (label) => {
  setTempCheckedStatuses((prev) => {
    if (prev.includes(label)) {
      return prev.filter((l) => l !== label);
    }
    return [...prev, label];
  });
  };
  const resetLocalWorkflowIfNeeded = () => {
    if (tempWorkflow !== 'Show All') {
      setTempWorkflow('Show All');
    }
  };

  /// Calendar: from
  const goPrevMonthFrom = () => {
    setFromCalendarMonth(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  };
  const goNextMonthFrom = () => {
    setFromCalendarMonth(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
  };

  const handleSelectFromDate = (day) => {
    const d = new Date(
      fromCalendarMonth.getFullYear(),
      fromCalendarMonth.getMonth(),
      day
    );
    setTempFromDate(d.toDateString());
    setShowFromCalendar(false);
    resetLocalWorkflowIfNeeded();;
  };

  // Calendar: to
  const goPrevMonthTo = () => {
    setToCalendarMonth(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  };
  const goNextMonthTo = () => {
    setToCalendarMonth(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
  };
  const handleSelectToDate = (day) => {
    const d = new Date(
      toCalendarMonth.getFullYear(),
      toCalendarMonth.getMonth(),
      day
    );
    setTempToDate(d.toDateString());
    setShowToCalendar(false);
    resetLocalWorkflowIfNeeded();
  };

  // Calculate how many active filters are in use
  const getActiveFilterCount = () => {
    let count = 0;

    // 1) By Company
    if (tempCompany !== 'All companies') {
      count++;
    }
    // 2) By Sales Person
    if (tempSalesRep !== 'All sales') {
        count++;
      }
  
      // 3) By Workflow
      if (tempWorkflow !== 'Show All') {
        count++;
      }
  
      // 4) By Date => must have where != 'Select' + from + to
      const hasFullDateFilter =
        tempWhere !== 'Select' &&
        tempFromDate !== '' &&
        tempToDate !== '';
      if (hasFullDateFilter) {
        count++;
      }
  
      // 5) By Status => if not all are checked => 1 filter
      if (tempCheckedStatuses.length < statusOptions.length) {
        count++;
      }
  
      return count;
    };
  
    // "Apply" => copy local => parent, then close
    const handleApplyFilters = () => {
      setSelectedCompany(tempCompany);
      setSelectedSalesRep(tempSalesRep);
      setSelectedMode(tempMode);
      setSelectedWorkflow(tempWorkflow);
      setSelectedWhere(tempWhere);
      setFromDate(tempFromDate);
      setToDate(tempToDate);
      setCheckedStatuses([...tempCheckedStatuses]);
    onClose();
  };

  const handleResetAll = () => {
    const defaultCompany   = 'All companies';
    const defaultSalesRep  = 'All sales';
    const defaultMode      = 'workflow';
    const defaultWorkflow  = 'Show All';
    const defaultWhere     = 'Select';
    const defaultFromDate  = '';
    const defaultToDate    = '';
    const defaultStatuses  = statusOptions.map(s => s.label);

    // Update local
    setTempCompany(defaultCompany);
    setTempSalesRep(defaultSalesRep);
    setTempMode(defaultMode);
    setTempWorkflow(defaultWorkflow);
    setTempWhere(defaultWhere);
    setTempFromDate(defaultFromDate);
    setTempToDate(defaultToDate);
    setTempCheckedStatuses(defaultStatuses);

    // Update parent
    setSelectedCompany(defaultCompany);
    setSelectedSalesRep(defaultSalesRep);
    setSelectedMode(defaultMode);
    setSelectedWorkflow(defaultWorkflow);
    setSelectedWhere(defaultWhere);
    setFromDate(defaultFromDate);
    setToDate(defaultToDate);
    setCheckedStatuses(defaultStatuses);
  };

   // Figure out how many filters are active
   const activeFilterCount = getActiveFilterCount();
   // Build the label
   const applyLabel =
     activeFilterCount > 0
       ? `Apply Filters (${activeFilterCount})`
       : 'Apply Filters';

  return (
    <div className={styles.popup} onClick={onClose}>
      <div className={styles.popupContent} onClick={(e) => e.stopPropagation()}>
        
        {/* ---------- HEADER ---------- */}
        <div className={styles.header}>
          <div className={styles.title}>
            <Image src={FilterIcon} alt='logo' className={styles.filterIcon} width={24} height={24}/>
            <p>Filters</p>
          </div>
          <div className={styles.closeButton}>
            <button type="button" onClick={onClose} aria-label="Close">
              <Image src={CloseIcon} alt='logo' className={styles.closeIcon}/>
            </button>
          </div>
        </div>

        {/* ---------- BODY ---------- */}
        <div className={styles.content}>

          {/* === By company (temp) === */}
          <div className={styles.dropdownContainer} ref={companyRef}>
            <button
              type="button"
              className={styles.dropdownButton}
              onClick={() => setShowCompanyDropdown(!showCompanyDropdown)}
            >
              <div className={styles.dropdownLabel}>
                <span className={styles.dropdownPrefix}>By company:</span>
                <span
                  className={
                    tempCompany === 'All companies'
                      ? styles.dropdownPlaceholder
                      : styles.dropdownSelected
                  }
                >
                  {tempCompany}
                </span>
              </div>
              <Image src={UnfoldMoreIcon} alt='logo' className={styles.dropdownIcon} />
            </button>

            {showCompanyDropdown && (
              <ul className={styles.optionsList} role="listbox">
                <li
                  className={tempCompany === 'All companies' ? styles.selected : ''}
                  onClick={() => {
                    setTempCompany('All companies');
                    setShowCompanyDropdown(false);
                  }}
                >
                  All companies
                </li>
                {/* Then load from CompanyChoices */}
                {CompanyChoices.map((c) => {
                  const isSelected = (c.name === tempCompany);
                  return (
                    <li
                      key={c.id}
                      className={isSelected ? styles.selected : ''}
                      onClick={() => {
                        setTempCompany(c.name);
                        setShowCompanyDropdown(false);
                      }}
                    >
                      {c.name}
                    </li>
                  );
                })}
              </ul>
            )}
          </div>

          {/* === By sales person (temp) === */}
          <div className={styles.dropdownContainer} ref={salesRef}>
            <button
              type="button"
              className={styles.dropdownButton}
              onClick={handleToggleSalesDropdown}
            >
              <div className={styles.dropdownLabel}>
                <span className={styles.dropdownPrefix}>By sales person:</span>
                <span
                  className={
                    tempSalesRep === 'All sales'
                      ? styles.dropdownPlaceholder
                      : styles.dropdownSelected
                  }
                >
                  {tempSalesRep}
                </span>
              </div>
              <Image src={UnfoldMoreIcon} alt='logo' className={styles.dropdownIcon} />
            </button>

            {showSalesDropdown && (
              <ul className={styles.optionsList} role="listbox">
                <li
                  className={tempSalesRep === 'All sales' ? styles.selected : ''}
                  onClick={() => {
                    setTempSalesRep('All sales');
                    setShowSalesDropdown(false);
                  }}
                >
                  All sales
                </li>
                {PossibleSalesReps.map((rep) => {
                  const isSelected = (rep.name === tempSalesRep);
                  return (
                    <li
                      key={rep.id}
                      className={isSelected ? styles.selected : ''}
                      onClick={() => {
                        setTempSalesRep(rep.name);
                        setShowSalesDropdown(false);
                      }}
                    >
                      {rep.name}
                    </li>
                  );
                })}
              </ul>
            )}
          </div>

          {/* Some spacing */}
          <div style={{ height: 10 }} />

          {/* === Workflow / Date toggle (temp) === */}
          <div className={styles.modeToggleContainer}>
            <button
              type="button"
              className={
                tempMode === 'workflow'
                  ? styles.dayButtonSelected
                  : styles.dayButtonUnselected
              }
              onClick={() => setTempMode('workflow')}
            >
              By Workflow
            </button>
            <button
              type="button"
              className={
                tempMode === 'date'
                  ? styles.dayButtonSelected
                  : styles.dayButtonUnselected
              }
              onClick={() => setTempMode('date')}
            >
              By Date
            </button>
          </div>

          {/* If "By Workflow" => local workflow */}
          {tempMode === 'workflow' && (
            <div className={styles.dropdownContainer} ref={workflowRef}>
              <button
                type="button"
                className={styles.dropdownButton}
                onClick={() => setShowWorkflowDropdown(!showWorkflowDropdown)}
              >
                <div className={styles.dropdownLabel}>
                  <span className={styles.dropdownPrefix}>Workflow:</span>
                  <span
                    className={
                      tempWorkflow === 'Show All'
                        ? styles.dropdownPlaceholder
                        : styles.dropdownSelected
                    }
                  >
                    {tempWorkflow}
                  </span>
                </div>
                <Image src={UnfoldMoreIcon} alt='logo' className={styles.dropdownIcon} />
              </button>

              {showWorkflowDropdown && (
                <ul className={styles.optionsList} role="listbox">
                  {workflowOptions.map((wf) => {
                    const isSelected = (wf === tempWorkflow);
                    return (
                      <li
                        key={wf}
                        className={isSelected ? styles.selected : ''}
                        onClick={() => {
                            // If user picks a workflow != 'Show All', reset By Date
                            if (wf !== 'Show All') {
                              setTempWhere('Select');
                              setTempFromDate('');
                              setTempToDate('');
                            }
                            setTempWorkflow(wf);
                            setShowWorkflowDropdown(false);
                          }}
                      >
                        {wf}
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          )}

          {/* If "By Date" => local Where + local From/To */}
          {tempMode === 'date' && (
            <>
              <div className={styles.dropdownContainer} ref={whereRef}>
                <button
                  type="button"
                  className={styles.dropdownButton}
                  onClick={() => setShowWhereDropdown(!showWhereDropdown)}
                >
                  <div className={styles.dropdownLabel}>
                    <span className={styles.dropdownPrefix}>Where:</span>
                    <span
                      className={
                        tempWhere === 'Select'
                          ? styles.dropdownPlaceholder
                          : styles.dropdownSelected
                      }
                    >
                      {tempWhere}
                    </span>
                  </div>
                  <Image src={UnfoldMoreIcon} alt='logo' className={styles.dropdownIcon} />
                </button>

                {showWhereDropdown && (
                  <ul className={styles.optionsList} role="listbox">
                    {whereOptions.map((option) => {
                      const isSelected = (option === tempWhere);
                      return (
                        <li
                          key={option}
                          className={isSelected ? styles.selected : ''}
                          onClick={() => {
                            setTempWhere(option);
                            setShowWhereDropdown(false);
                            // reset workflow if needed
                            if (tempWorkflow !== 'Show All') {
                              setTempWorkflow('Show All');
                            }
                          }}
                        >
                          {option}
                        </li>
                      );
                    })}
                  </ul>
                )}
              </div>

              {/* FROM date */}
              <div className={styles.dateInputRow}>
                <button
                  type="button"
                  className={styles.dateButton}
                  onClick={() => {
                    setShowFromCalendar(!showFromCalendar);
                    setShowToCalendar(false);
                  }}
                >
                  <div className={styles.dropdownLabel}>
                    <span className={styles.dropdownPrefix}>From:</span>
                    <span
                      className={
                        tempFromDate ? styles.dropdownSelected : styles.dropdownPlaceholder
                      }
                    >
                      {tempFromDate || 'Select'}
                    </span>
                  </div>
                  <div className={styles.calendarIconWrapper}>
                    <CalendarIcon className={styles.calIcon} />
                  </div>
                </button>
                {showFromCalendar && (
                  <div className={styles.calendarPopup} ref={fromCalRef}>
                    <div className={styles.calendarHeader}>
                      <button onClick={goPrevMonthFrom}>Prev</button>
                      <span>
                        {fromCalendarMonth.toLocaleString('default',{month:'long'})}{' '}
                        {fromCalendarMonth.getFullYear()}
                      </span>
                      <button onClick={goNextMonthFrom}>Next</button>
                    </div>
                    <div className={styles.calendarGrid}>
                      {fromDaysInMonth.map(day => (
                        <button
                          key={day}
                          type="button"
                          className={styles.calendarDay}
                          onClick={() => handleSelectFromDate(day)}
                        >
                          {day}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* TO date */}
              <div className={styles.dateInputRow}>
                <button
                  type="button"
                  className={styles.dateButton}
                  onClick={() => {
                    setShowToCalendar(!showToCalendar);
                    setShowFromCalendar(false);
                  }}
                >
                  <div className={styles.dropdownLabel}>
                    <span className={styles.dropdownPrefix}>To:</span>
                    <span
                      className={
                        tempToDate ? styles.dropdownSelected : styles.dropdownPlaceholder
                      }
                    >
                      {tempToDate || 'Select'}
                    </span>
                  </div>
                  <div className={styles.calendarIconWrapper}>
                    <CalendarIcon className={styles.calIcon} />
                  </div>
                </button>
                {showToCalendar && (
                  <div className={styles.calendarPopup} ref={toCalRef}>
                    <div className={styles.calendarHeader}>
                      <button onClick={goPrevMonthTo}>Prev</button>
                      <span>
                        {toCalendarMonth.toLocaleString('default',{month:'long'})}{' '}
                        {toCalendarMonth.getFullYear()}
                      </span>
                      <button onClick={goNextMonthTo}>Next</button>
                    </div>
                    <div className={styles.calendarGrid}>
                      {toDaysInMonth.map(day => (
                        <button
                          key={day}
                          type="button"
                          className={styles.calendarDay}
                          onClick={() => handleSelectToDate(day)}
                        >
                          {day}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </>
          )}
          {/* By Status (always) */}
          <div className={styles.byStatusHeader}>By Status</div>
          <div className={styles.statusCheckboxes}>
            {statusOptions.map((item) => {
              const isChecked = tempCheckedStatuses.includes(item.label);
              return (
                <label
                  key={item.label}
                  className={styles.statusCheckboxRow}
                  style={{ color: item.color }}
                >
                  <input
                    type="checkbox"
                    className={styles.statusCheckboxInput}
                    checked={isChecked}
                    onChange={() => toggleLocalStatus(item.label)}
                  />
                  <span className={styles.statusFakeBox} />
                  <span className={styles.statusLabel}>{item.label}</span>
                </label>
              );
            })}
          </div>
        </div>

        {/* ---------- FOOTER ---------- */}
        <div className={styles.footer}>
          <button
            type="button"
            className={styles.applyButton}
            onClick={handleApplyFilters}
          >
                        {applyLabel}
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