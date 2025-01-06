import React, { useState, useEffect, useRef, useCallback } from 'react';
import { ReactComponent as TruckCouchIcon } from '../../../../assets/icons/truckcouch.svg';
import { ReactComponent as NotebookIcon } from '../../../../assets/icons/notebook.svg';
import { ReactComponent as EmailWithDotIcon } from '../../../../assets/icons/emailwithdot.svg';
import { ReactComponent as CalendarIcon } from '../../../../assets/icons/calendar.svg';
import { ReactComponent as MoreIcon } from '../../../../assets/icons/unfoldmore.svg';
import { ReactComponent as ClockIcon } from '../../../../assets/icons/clock.svg';

import SimpleToggle from '../../SimpleToggle/SimpleToggle';
import OriginDetails from './OriginDetails/OriginDetails';
import DestinationDetails from './DestinationDetails/DestinationDetails';
import styles from './MoveDetailsPanel.module.css';

/** Generate time slots from 7:00 AM to 9:00 PM in 15-min increments */
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

// Example dropdown data
const typeOfServiceChoices = [
  { id: 1, name: 'Moving' },
  { id: 2, name: 'Move items within premises' },
  { id: 3, name: 'Junk removal' },
  { id: 4, name: 'Help with packing' },
];
const etaRequestOptions = ['Flexible', 'Morning', 'Midday', 'Afternoon', 'Late Afternoon'];
const storageOptions = [
  'Few items',
  'Less than half',
  'Half of the items',
  'More than half',
  'Almost all',
  'All items',
];

function MoveDetailsPanel({ onShowInventory }) {
  // Tabs
  const [selectedIndex, setSelectedIndex] = useState(0);
  const isSelected = (idx) => idx === selectedIndex;

  // ---------- Move/Delivery Date ----------
  const [moveDate, setMoveDate] = useState('');
  const [deliveryDate, setDeliveryDate] = useState('');
  const [showMoveCalendar, setShowMoveCalendar] = useState(false);
  const [showDeliveryCalendar, setShowDeliveryCalendar] = useState(false);

  const [calendarMonth, setCalendarMonth] = useState(new Date());
  const [daysInMonth, setDaysInMonth] = useState([]);

  // ---------- Type of Service ----------
  const [typeOfService, setTypeOfService] = useState('Moving');
  const [showTypeOfServiceDropdown, setShowTypeOfServiceDropdown] = useState(false);

  // ---------- ETA Request ----------
  const [etaRequest, setEtaRequest] = useState('Flexible');
  const [showETARequestDropdown, setShowETARequestDropdown] = useState(false);

  // ---------- "Add storage" toggle + items dropdown ----------
  const [isStorageToggled, setIsStorageToggled] = useState(false);
  const [storageDropdownOpen, setStorageDropdownOpen] = useState(false);
  const [selectedStorage, setSelectedStorage] = useState('All items');

  // ---------- Time Promised (Arrival Time) ----------
  const [isTimePromisedToggled, setIsTimePromisedToggled] = useState(false);
  const [arrivalTime, setArrivalTime] = useState('');
  const [arrivalStart, setArrivalStart] = useState('');
  const [showStartTimeDropdown, setShowStartTimeDropdown] = useState(false);
  const [showIncrementsGrid, setShowIncrementsGrid] = useState(false);

  // For the calendars
  const today = new Date();
  useEffect(() => {
    const y = calendarMonth.getFullYear();
    const m = calendarMonth.getMonth();
    const totalDays = new Date(y, m + 1, 0).getDate();
    const arr = [];
    for (let i = 1; i <= totalDays; i++) arr.push(i);
    setDaysInMonth(arr);
  }, [calendarMonth]);

  const goPrevMonth = () => {
    setCalendarMonth((prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  };
  const goNextMonth = () => {
    setCalendarMonth((prev) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
  };

  // ============ Refs for each popup (to detect outside clicks) ============
  const moveCalendarRef        = useRef(null);
  const deliveryCalendarRef    = useRef(null);
  const typeOfServiceRef       = useRef(null);
  const etaRequestRef          = useRef(null);
  const storageRef             = useRef(null);
  const startTimeDropdownRef   = useRef(null);
  const incrementsGridRef      = useRef(null);

  // Helper => default to +2h if user didn't select increment
  // define as stable callback => reference won't change each render => linter is happy
  const defaultToTwoHours = useCallback(() => {
    if (!arrivalStart) return; // no start => do nothing

    // parse e.g. "10:15 AM"
    const [hhmm, ampm] = arrivalStart.split(' ');
    const [hS, mS] = hhmm.split(':');
    let hh = Number(hS);
    let mm = Number(mS);
    let suffix = ampm;
    // +2 hours
    hh += 2;
    while (hh > 12) {
      hh -= 12;
      suffix = suffix === 'AM' ? 'PM' : 'AM';
    }
    if (hh === 0) hh = 12;
    const mmStr = mm.toString().padStart(2, '0');
    const endTime = `${hh}:${mmStr} ${suffix}`;
    setArrivalTime(`${arrivalStart} - ${endTime}`);
  }, [arrivalStart]);

  // Outside click => close popups
  useEffect(() => {
    function handleClickOutside(e) {
      // If the moveCalendar is open & user clicked outside moveCalendarRef => close
      if (showMoveCalendar && moveCalendarRef.current && !moveCalendarRef.current.contains(e.target)) {
        setShowMoveCalendar(false);
      }
      // same for delivery
      if (showDeliveryCalendar && deliveryCalendarRef.current && !deliveryCalendarRef.current.contains(e.target)) {
        setShowDeliveryCalendar(false);
      }
      // same for typeOfService
      if (showTypeOfServiceDropdown && typeOfServiceRef.current && !typeOfServiceRef.current.contains(e.target)) {
        setShowTypeOfServiceDropdown(false);
      }
      // same for ETA
      if (showETARequestDropdown && etaRequestRef.current && !etaRequestRef.current.contains(e.target)) {
        setShowETARequestDropdown(false);
      }
      // same for storage
      if (storageDropdownOpen && storageRef.current && !storageRef.current.contains(e.target)) {
        setStorageDropdownOpen(false);
      }

      // For arrival time increments
      if (showIncrementsGrid && arrivalStart && !arrivalTime) {
        // If user clicked outside incrementsGridRef => default to 2h & close
        if (incrementsGridRef.current && !incrementsGridRef.current.contains(e.target)) {
          defaultToTwoHours();
          setShowIncrementsGrid(false);
        }
      }
      // If the startTime dropdown is open but user clicked outside => close it
      if (showStartTimeDropdown && startTimeDropdownRef.current && !startTimeDropdownRef.current.contains(e.target)) {
        setShowStartTimeDropdown(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [
    showMoveCalendar,
    showDeliveryCalendar,
    showTypeOfServiceDropdown,
    showETARequestDropdown,
    storageDropdownOpen,
    showStartTimeDropdown,
    showIncrementsGrid,
    arrivalStart,
    arrivalTime,
    defaultToTwoHours
  ]);

  return (
    <div className={styles.panelContainer}>
      {/* ---------- TABS ---------- */}
      <div className={styles.sectionsRow}>
        <div
          className={`${styles.sectionItem} ${isSelected(0) ? styles.selected : ''}`}
          onClick={() => setSelectedIndex(0)}
        >
          <TruckCouchIcon
            className={`${styles.sectionIcon} ${isSelected(0) ? styles.iconActive : ''}`}
          />
          <span className={`${styles.sectionText} ${isSelected(0) ? styles.textActive : ''}`}>
            Move
          </span>
        </div>

        <div
          className={`${styles.sectionItem} ${isSelected(1) ? styles.selected : ''}`}
          onClick={() => setSelectedIndex(1)}
        >
          <NotebookIcon
            className={`${styles.sectionIcon} ${isSelected(1) ? styles.iconActive : ''}`}
          />
          <span className={`${styles.sectionText} ${isSelected(1) ? styles.textActive : ''}`}>
            Notes
          </span>
        </div>

        <div
          className={`${styles.sectionItem} ${isSelected(2) ? styles.selected : ''}`}
          onClick={() => setSelectedIndex(2)}
        >
          <EmailWithDotIcon
            className={`${styles.sectionIcon} ${isSelected(2) ? styles.iconActive : ''}`}
          />
          <span className={`${styles.sectionText} ${isSelected(2) ? styles.textActive : ''}`}>
            Email
          </span>
        </div>

        <div
          className={`${styles.sectionItem} ${isSelected(3) ? styles.selected : ''}`}
          onClick={() => setSelectedIndex(3)}
        >
          <div className={styles.greenDot}></div>
          <span className={`${styles.sectionText} ${isSelected(3) ? styles.textActive : ''}`}>
            Availability
          </span>
        </div>
      </div>

      {/* ---------- MOVE DATE ---------- */}
      <div className={styles.inputContainer} style={{ position: 'relative' }}>
        <button
          type="button"
          className={styles.dateButton}
          onClick={() => {
            setShowMoveCalendar((prev) => !prev);
            setShowDeliveryCalendar(false);
          }}
        >
          <span className={styles.dateLabelPrefix}>Move Date:</span>
          <span className={moveDate ? styles.dateSelected : styles.datePlaceholder}>
            {moveDate || ''}
          </span>
          <div className={styles.calendarRightIconWrapper}>
            <CalendarIcon className={styles.calendarIcon} />
          </div>
        </button>

        {showMoveCalendar && (
          <div className={styles.calendarPopup} ref={moveCalendarRef}>
            <div className={styles.calendarHeader}>
              <button onClick={goPrevMonth}>Prev</button>
              <span>
                {calendarMonth.toLocaleString('default', { month: 'long' })}{' '}
                {calendarMonth.getFullYear()}
              </span>
              <button onClick={goNextMonth}>Next</button>
            </div>
            <div className={styles.calendarGrid}>
              {daysInMonth.map((day) => {
                const dayDate = new Date(calendarMonth.getFullYear(), calendarMonth.getMonth(), day);
                const disabled = dayDate < today.setHours(0, 0, 0, 0);
                return (
                  <button
                    key={day}
                    type="button"
                    className={styles.calendarDay}
                    style={{
                      opacity: disabled ? 0.4 : 1,
                      cursor: disabled ? 'not-allowed' : 'pointer',
                    }}
                    onClick={() => {
                      if (!disabled) {
                        const dateObj = new Date(
                          calendarMonth.getFullYear(),
                          calendarMonth.getMonth(),
                          day
                        );
                        setMoveDate(dateObj.toDateString());
                        setShowMoveCalendar(false);
                      }
                    }}
                  >
                    {day}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* ---------- TYPE OF SERVICE (DROPDOWN) ---------- */}
      <div
        className={styles.storageDropdown}
        style={{ marginTop: '10px' }}
        onClick={() => {
          setShowTypeOfServiceDropdown((prev) => !prev);
          setShowETARequestDropdown(false);
          setStorageDropdownOpen(false);
          setShowMoveCalendar(false);
          setShowDeliveryCalendar(false);
        }}
        ref={typeOfServiceRef}
      >
        <span className={styles.inputLabel}>
          Type of Service:
          <span className={styles.inputValue}> {typeOfService}</span>
        </span>
        <MoreIcon className={styles.moreIcon} />

        {showTypeOfServiceDropdown && (
          <div className={styles.dropdownMenu}>
            {typeOfServiceChoices.map((svc) => (
              <div
                key={svc.id}
                className={styles.dropdownOption}
                onClick={(e) => {
                  e.stopPropagation();
                  setTypeOfService(svc.name);
                  setShowTypeOfServiceDropdown(false);
                }}
              >
                {svc.name}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ---------- ADD STORAGE TOGGLE ---------- */}
      <div className={styles.storageContainer}>
        <span className={styles.addStorageText}>Add storage</span>
        <SimpleToggle isToggled={isStorageToggled} onToggle={setIsStorageToggled} />
      </div>

      {/* If toggled => show Storage dropdown */}
      {isStorageToggled && (
        <div
          className={styles.storageDropdown}
          onClick={() => {
            setStorageDropdownOpen((prev) => !prev);
            setShowTypeOfServiceDropdown(false);
            setShowETARequestDropdown(false);
            setShowMoveCalendar(false);
            setShowDeliveryCalendar(false);
          }}
          ref={storageRef}
        >
          <span className={styles.inputLabel}>
            Items in storage:
            <span className={styles.inputValue}> {selectedStorage}</span>
          </span>
          <MoreIcon className={styles.moreIcon} />

          {storageDropdownOpen && (
            <div className={styles.dropdownMenu}>
              {storageOptions.map((option) => (
                <div
                  key={option}
                  className={styles.dropdownOption}
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedStorage(option);
                    setStorageDropdownOpen(false);
                  }}
                >
                  {option}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      <div className={styles.spacing30}></div>

      {/* ---------- DELIVERY DATE ---------- */}
      <div className={styles.inputContainer} style={{ position: 'relative' }}>
        <button
          type="button"
          className={styles.dateButton}
          onClick={() => {
            setShowDeliveryCalendar((prev) => !prev);
            setShowMoveCalendar(false);
          }}
        >
          <span className={styles.dateLabelPrefix}>Delivery Date:</span>
          <span className={deliveryDate ? styles.dateSelected : styles.datePlaceholder}>
            {deliveryDate || ''}
          </span>
          <div className={styles.calendarRightIconWrapper}>
            <CalendarIcon className={styles.calendarIcon} />
          </div>
        </button>

        {showDeliveryCalendar && (
          <div className={styles.calendarPopup} ref={deliveryCalendarRef}>
            <div className={styles.calendarHeader}>
              <button onClick={goPrevMonth}>Prev</button>
              <span>
                {calendarMonth.toLocaleString('default', { month: 'long' })}{' '}
                {calendarMonth.getFullYear()}
              </span>
              <button onClick={goNextMonth}>Next</button>
            </div>
            <div className={styles.calendarGrid}>
              {daysInMonth.map((day) => {
                const dayDate = new Date(calendarMonth.getFullYear(), calendarMonth.getMonth(), day);
                const disabled = dayDate < today.setHours(0, 0, 0, 0);
                return (
                  <button
                    key={day}
                    type="button"
                    className={styles.calendarDay}
                    style={{
                      opacity: disabled ? 0.4 : 1,
                      cursor: disabled ? 'not-allowed' : 'pointer',
                    }}
                    onClick={() => {
                      if (!disabled) {
                        const dateObj = new Date(
                          calendarMonth.getFullYear(),
                          calendarMonth.getMonth(),
                          day
                        );
                        setDeliveryDate(dateObj.toDateString());
                        setShowDeliveryCalendar(false);
                      }
                    }}
                  >
                    {day}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* ---------- ETA REQUEST (DROPDOWN) ---------- */}
      <div
        className={styles.storageDropdown}
        style={{ marginTop: '10px' }}
        onClick={() => {
          setShowETARequestDropdown((prev) => !prev);
          setShowTypeOfServiceDropdown(false);
          setStorageDropdownOpen(false);
          setShowMoveCalendar(false);
          setShowDeliveryCalendar(false);
        }}
        ref={etaRequestRef}
      >
        <span className={styles.inputLabel}>
          ETA Request:
          <span className={styles.inputValue}> {etaRequest}</span>
        </span>
        <MoreIcon className={styles.moreIcon} />

        {showETARequestDropdown && (
          <div className={styles.dropdownMenu}>
            {etaRequestOptions.map((opt) => (
              <div
                key={opt}
                className={styles.dropdownOption}
                onClick={(e) => {
                  e.stopPropagation();
                  setEtaRequest(opt);
                  setShowETARequestDropdown(false);
                }}
              >
                {opt}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ---------- TIME PROMISED TOGGLE ---------- */}
      <div className={styles.timePromisedRow}>
        <span className={styles.timePromisedText}>Time promised</span>
        <SimpleToggle isToggled={isTimePromisedToggled} onToggle={setIsTimePromisedToggled} />
      </div>

      {/* If time promised => ARRIVAL TIME */}
      {isTimePromisedToggled && (
        <div
          className={styles.arrivalTimeInput}
          onClick={() => {
            const newVal = !showStartTimeDropdown;
            // if we are closing & user didn't pick increment => default 2h
            if (!newVal && arrivalStart && !arrivalTime && showIncrementsGrid) {
              defaultToTwoHours();
            }
            setShowStartTimeDropdown(newVal);
            setShowIncrementsGrid(false);
          }}
        >
          <span className={styles.inputLabel}>
            Arrival Time:
            <span className={styles.inputValue}> {arrivalTime || 'Select'}</span>
          </span>
          <div className={styles.inputIconContainer}>
            <ClockIcon className={styles.inputIcon} />
          </div>

          {/* Start Time dropdown */}
          {showStartTimeDropdown && (
            <div
              className={styles.timeDropdown}
              ref={startTimeDropdownRef}
              onClick={(e) => e.stopPropagation()}
            >
              {timeSlots.map((slot) => (
                <div
                  key={slot}
                  className={styles.timeOption}
                  onClick={(e) => {
                    e.stopPropagation();
                    setArrivalStart(slot);
                    setArrivalTime('');
                    setShowIncrementsGrid(true);
                    setShowStartTimeDropdown(false);
                  }}
                >
                  {slot}
                </div>
              ))}
            </div>
          )}

          {/* 2x2 grid => +2h, +4h, +6h, +8h */}
          {showIncrementsGrid && (
            <div
              className={styles.addHoursGrid}
              ref={incrementsGridRef}
              onClick={(e) => e.stopPropagation()}
            >
              {[2, 4, 6, 8].map((inc) => (
                <button
                  key={inc}
                  className={styles.addHoursButton}
                  onClick={(e) => {
                    e.stopPropagation();

                    const [hhmm, ampm] = arrivalStart.split(' ');
                    const [hS, mS] = hhmm.split(':');
                    let hh = Number(hS);
                    let mm = Number(mS);
                    let suffix = ampm;

                    hh += inc;
                    while (hh > 12) {
                      hh -= 12;
                      suffix = suffix === 'AM' ? 'PM' : 'AM';
                    }
                    if (hh === 0) hh = 12;
                    const mmStr = mm.toString().padStart(2, '0');
                    setArrivalTime(`${arrivalStart} - ${hh}:${mmStr} ${suffix}`);
                    setShowIncrementsGrid(false);
                  }}
                >
                  +{inc}h
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      <div className={styles.spacing20}></div>
      <OriginDetails onShowInventory={onShowInventory} />
      <DestinationDetails />
    </div>
  );
}

export default MoveDetailsPanel;
