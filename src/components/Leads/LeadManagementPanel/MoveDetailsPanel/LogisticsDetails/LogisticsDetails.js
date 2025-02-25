import React, { useState, useRef, useEffect } from 'react';
import styles from './LogisticsDetails.module.css';

import { ReactComponent as UnfoldMoreIcon } from '../../../../../assets/icons/unfoldmore.svg';
import { ReactComponent as CalendarIcon } from '../../../../../assets/icons/calendar.svg';

import PackingDay from './PackingDay/PackingDay';

// Rate Type and Truck Size Options
const RATE_TYPE_OPTIONS = ['Hourly Rate', 'Volume Based', 'Weight Based'];
const TRUCK_SIZE_OPTIONS = [
  '12 ft', '16 ft', '22 ft', '26 ft', '28 ft', '48 ft', '53 ft'
];

/** Generate 15-min increments from 0.15 h up to 24.00 h */
function generateQuarterHourOptions() {
  const result = [];
  for (let hour = 0; hour <= 24; hour++) {
    for (let quarter = 0; quarter < 4; quarter++) {
      const totalMinutes = hour * 60 + quarter * 15;
      if (totalMinutes === 0) continue;  // skip 0 min
      if (totalMinutes > 24 * 60) break; // up to 24.00 h

      const hPart = Math.floor(totalMinutes / 60);
      const mPart = totalMinutes % 60;
      const label =
        mPart === 0
          ? `${hPart}.00 h`
          : `${hPart}.${String(mPart).padStart(2, '0')} h`;
      result.push(label);
    }
  }
  return result;
}
const QUARTER_HOUR_OPTIONS = generateQuarterHourOptions();

/** "Moving minimum" => integer hours from 1h to 24h */
function generateWholeHours(from, to) {
  const arr = [];
  for (let i = from; i <= to; i++) {
    arr.push(`${i}h`);
  }
  return arr;
}
const MOVING_MINIMUM_OPTIONS = generateWholeHours(1, 24);

/** Pickup window => 1 day, 2 days, 3 days */
const PICKUP_WINDOW_OPTIONS = ['1 day', '2 days', '3 days'];

/** Delivery window => 1 day to 30 days */
function generateDeliveryWindowOptions() {
  const arr = [];
  for (let i = 1; i <= 30; i++) {
    arr.push(`${i} day${i > 1 ? 's' : ''}`);
  }
  return arr;
}
const DELIVERY_WINDOW_OPTIONS = generateDeliveryWindowOptions();

/**
 * Helper: parse "1.30 h" => numeric hours (float)
 */
function parseQuarterHours(str) {
  const core = str.replace(' h', '');   // e.g. "2.45"
  const [h, m] = core.split('.');
  const hour = Number(h);
  const decimalPart = m ? Number(m) : 0; // e.g. 45 => 0.75 hour
  return hour + decimalPart / 60;
}

/**
 * Helper: onFocus => select all text in the input
 */
function handleFocusSelectAll(e) {
  e.target.select();
}

function LogisticsDetails({
  lead,
  onLeadUpdated,
  isCollapsed,
  setIsCollapsed,
}) {
  const toggleCollapse = () => setIsCollapsed((prev) => !prev);

  // 1) Suppose your `PackingDay` (or lead data) has something like: `hasPackingDay`
  //    If it's true => we show the "Packing" inputs. Otherwise => no packing section.
  //    Example fallback if lead.hasPackingDay not found:
  const hasPackingDay = lead?.hasPackingDay ?? false;

  // Rate Type
  const [rateType, setRateType] = useState('Hourly Rate');
  const [showRateTypeDropdown, setShowRateTypeDropdown] = useState(false);
  const rateTypeDropdownRef = useRef(null);

  // Truck Size
  const [truckSize, setTruckSize] = useState('26 ft');
  const [showTruckSizeDropdown, setShowTruckSizeDropdown] = useState(false);
  const truckSizeDropdownRef = useRef(null);

  // ----- MOVING day fields -----
  const [numTrucks, setNumTrucks]   = useState('1');
  const [numMovers, setNumMovers]   = useState('2');
  const [hourlyRate, setHourlyRate] = useState('180');
  const [volume, setVolume]         = useState('1000');
  const [weight, setWeight]         = useState('7000');
  const [pricePerCuft, setPricePerCuft] = useState('4.50');
  const [pricePerLbs, setPricePerLbs]   = useState('0.74');

  // Travel Time => 15-min increments
  const [travelTime, setTravelTime] = useState('1.00 h');
  const [showTravelTimeDropdown, setShowTravelTimeDropdown] = useState(false);

  // Work time minimum => 1h to 24h
  const [movingMin, setMovingMin] = useState('3h');
  const [showMovingMinDropdown, setShowMovingMinDropdown] = useState(false);

  // If volume/weight => pickupWindow, earliestDeliveryDate, deliveryWindow
  const [pickupWindow, setPickupWindow] = useState('1 day');
  const [showPickupWindowDropdown, setShowPickupWindowDropdown] = useState(false);

  const [earliestDeliveryDate, setEarliestDeliveryDate] = useState('');
  const [showEarliestDeliveryCalendar, setShowEarliestDeliveryCalendar] = useState(false);
  const earliestCalRef = useRef(null);

  const [deliveryWindow, setDeliveryWindow] = useState('7 days');
  const [showDeliveryWindowDropdown, setShowDeliveryWindowDropdown] = useState(false);

  // Work time => minHours, maxHours => for moving day
  const [minHours, setMinHours]     = useState('1.00 h');
  const [maxHours, setMaxHours]     = useState('2.00 h');
  const [showMinHoursDropdown, setShowMinHoursDropdown] = useState(false);
  const [showMaxHoursDropdown, setShowMaxHoursDropdown] = useState(false);

  const [showWorkTimeDetails, setShowWorkTimeDetails] = useState(false);

  // ----- PACKING day fields -----
  // (only shown if hasPackingDay === true)
  const [numPackers, setNumPackers]          = useState('2');
  const [packingHourlyRate, setPackingHourlyRate] = useState('120');
  const [packingTravelTime, setPackingTravelTime] = useState('0.45 h');
  const [showPackingTravelTimeDropdown, setShowPackingTravelTimeDropdown] = useState(false);

  const [packingMinimum, setPackingMinimum] = useState('2h');
  const [showPackingMinDropdown, setShowPackingMinDropdown] = useState(false);

  // "Packers Work time"
  const [packingMinHours, setPackingMinHours] = useState('1.00 h');
  const [packingMaxHours, setPackingMaxHours] = useState('2.00 h');
  const [showPackingMinHoursDropdown, setShowPackingMinHoursDropdown] = useState(false);
  const [showPackingMaxHoursDropdown, setShowPackingMaxHoursDropdown] = useState(false);
  const [showPackingDetails, setShowPackingDetails] = useState(false);

  // Condition checks
  const isHourly = (rateType === 'Hourly Rate');
  const isVolume = (rateType === 'Volume Based');
  const isWeight = (rateType === 'Weight Based');

  // =========== MOVING: numeric handlers ===========
  function handleNumTrucksChange(e) {
    let val = e.target.value.replace(/\D+/g, '');
    setNumTrucks(val || '0');
  }
  function handleNumMoversChange(e) {
    let val = e.target.value.replace(/\D+/g, '');
    setNumMovers(val || '0');
  }
  function handleHourlyRateChange(e) {
    let val = e.target.value.replace(/[^0-9.]/g, '');
    setHourlyRate(val || '0');
  }
  function handleVolumeChange(e) {
    let val = e.target.value.replace(/\D+/g, '');
    setVolume(val || '0');
  }
  function handleWeightChange(e) {
    let val = e.target.value.replace(/\D+/g, '');
    setWeight(val || '0');
  }
  function handlePricePerCuftChange(e) {
    let val = e.target.value.replace(/[^0-9.]/g, '');
    setPricePerCuft(val || '0');
  }
  function handlePricePerLbsChange(e) {
    let val = e.target.value.replace(/[^0-9.]/g, '');
    setPricePerLbs(val || '0');
  }

  // ---------- Min/Max Hours => clamp for moving day ----------
  function handleSelectMinHours(label) {
    const oldMax = maxHours;
    setMinHours(label);

    const minValue = parseQuarterHours(label);
    const maxValue = parseQuarterHours(oldMax);
    if (maxValue < minValue) {
      setMaxHours(label);
    }
  }
  function handleSelectMaxHours(label) {
    const oldMin = minHours;
    setMaxHours(label);

    const newMaxValue = parseQuarterHours(label);
    const minValue = parseQuarterHours(oldMin);
    if (newMaxValue < minValue) {
      setMinHours(label);
    }
  }

  // =========== PACKING: numeric handlers ===========
  function handleNumPackersChange(e) {
    let val = e.target.value.replace(/\D+/g, '');
    setNumPackers(val || '0');
  }
  function handlePackingHourlyRateChange(e) {
    let val = e.target.value.replace(/[^0-9.]/g, '');
    setPackingHourlyRate(val || '0');
  }

  // ---------- Min/Max Hours => clamp for packing day ----------
  function handleSelectPackingMinHours(label) {
    const oldMax = packingMaxHours;
    setPackingMinHours(label);

    const minValue = parseQuarterHours(label);
    const maxValue = parseQuarterHours(oldMax);
    if (maxValue < minValue) {
      setPackingMaxHours(label);
    }
  }
  function handleSelectPackingMaxHours(label) {
    const oldMin = packingMinHours;
    setPackingMaxHours(label);

    const newMaxValue = parseQuarterHours(label);
    const minValue = parseQuarterHours(oldMin);
    if (newMaxValue < minValue) {
      setPackingMinHours(label);
    }
  }

  // ---------- small calendar for earliestDeliveryDate ----------
  const [calendarMonth, setCalendarMonth] = useState(new Date());
  const [daysInMonth, setDaysInMonth] = useState([]);
  useEffect(() => {
    const y = calendarMonth.getFullYear();
    const m = calendarMonth.getMonth();
    const totalDays = new Date(y, m + 1, 0).getDate();
    const arr = [];
    for (let i = 1; i <= totalDays; i++) {
      arr.push(i);
    }
    setDaysInMonth(arr);
  }, [calendarMonth]);

  function handlePrevMonth() {
    setCalendarMonth((prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  }
  function handleNextMonth() {
    setCalendarMonth((prev) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
  }
  function handleSelectEarliestDate(dateObj) {
    setEarliestDeliveryDate(dateObj.toDateString());
    setShowEarliestDeliveryCalendar(false);
  }

  // ---------- Close dropdowns if user clicks outside ----------
  useEffect(() => {
    function handleClickOutside(e) {
      // Rate type
      if (
        showRateTypeDropdown &&
        rateTypeDropdownRef.current &&
        !rateTypeDropdownRef.current.contains(e.target)
      ) {
        setShowRateTypeDropdown(false);
      }
      // Truck size
      if (
        showTruckSizeDropdown &&
        truckSizeDropdownRef.current &&
        !truckSizeDropdownRef.current.contains(e.target)
      ) {
        setShowTruckSizeDropdown(false);
      }
      // Travel time => moving
      if (showTravelTimeDropdown && !e.target.closest('#travelTimeDropdown')) {
        setShowTravelTimeDropdown(false);
      }
      // movingMin
      if (showMovingMinDropdown && !e.target.closest('#movingMinDropdown')) {
        setShowMovingMinDropdown(false);
      }
      // pickupWindow
      if (showPickupWindowDropdown && !e.target.closest('#pickupWindowDropdown')) {
        setShowPickupWindowDropdown(false);
      }
      // earliestDeliveryDate
      if (
        showEarliestDeliveryCalendar &&
        earliestCalRef.current &&
        !earliestCalRef.current.contains(e.target)
      ) {
        setShowEarliestDeliveryCalendar(false);
      }
      // deliveryWindow
      if (showDeliveryWindowDropdown && !e.target.closest('#deliveryWindowDropdown')) {
        setShowDeliveryWindowDropdown(false);
      }
      // minHours & maxHours => moving
      if (showMinHoursDropdown && !e.target.closest('#minHoursDropdown')) {
        setShowMinHoursDropdown(false);
      }
      if (showMaxHoursDropdown && !e.target.closest('#maxHoursDropdown')) {
        setShowMaxHoursDropdown(false);
      }

      // packing => travelTime
      if (showPackingTravelTimeDropdown && !e.target.closest('#packingTravelTimeDropdown')) {
        setShowPackingTravelTimeDropdown(false);
      }
      // packing => minimum
      if (showPackingMinDropdown && !e.target.closest('#packingMinDropdown')) {
        setShowPackingMinDropdown(false);
      }
      // packing => min/max hours
      if (showPackingMinHoursDropdown && !e.target.closest('#packingMinHoursDropdown')) {
        setShowPackingMinHoursDropdown(false);
      }
      if (showPackingMaxHoursDropdown && !e.target.closest('#packingMaxHoursDropdown')) {
        setShowPackingMaxHoursDropdown(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [
    showRateTypeDropdown,
    showTruckSizeDropdown,
    showTravelTimeDropdown,
    showMovingMinDropdown,
    showPickupWindowDropdown,
    showEarliestDeliveryCalendar,
    showDeliveryWindowDropdown,
    showMinHoursDropdown,
    showMaxHoursDropdown,
    showPackingTravelTimeDropdown,
    showPackingMinDropdown,
    showPackingMinHoursDropdown,
    showPackingMaxHoursDropdown
  ]);

  return (
    <div className={styles.logisticsContainer}>
      <div className={styles.logisticsHeader}>
        <span className={styles.logisticsTitle}>Logistics</span>
        <button className={styles.minusButton} onClick={toggleCollapse}>
          {isCollapsed ? '+' : '-'}
        </button>
      </div>

      {!isCollapsed && (
        <div className={styles.innerContent}>

          {/* 1) Render the existing PackingDay component (which might have its own logic) */}
          <div className={styles.packingDayWrapper}>
            <PackingDay />
          </div>

          <div className={styles.extraInputsContainer}>

            {/* ---------------------------
                Row 0: Rate Type
            --------------------------- */}
            <div className={styles.row}>
              <div className={styles.rateTypeWrapper} ref={rateTypeDropdownRef}>
                <button
                  type="button"
                  className={styles.logisticsButton}
                  onClick={() => setShowRateTypeDropdown((p) => !p)}
                >
                  <div className={styles.dropdownLabel}>
                    <span className={styles.dropdownPrefix}>Rate Type:</span>
                    <span className={styles.dropdownSelected}>{rateType}</span>
                  </div>
                  <UnfoldMoreIcon className={styles.dropdownIcon} />
                </button>
                {showRateTypeDropdown && (
                  <ul className={styles.rateTypeDropdown}>
                    {RATE_TYPE_OPTIONS.map((opt) => {
                      const isSelected = (opt === rateType);
                      return (
                        <li
                          key={opt}
                          className={
                            isSelected
                              ? `${styles.rateTypeOption} ${styles.selectedOption}`
                              : styles.rateTypeOption
                          }
                          onClick={() => {
                            setRateType(opt);
                            setShowRateTypeDropdown(false);
                          }}
                        >
                          {opt}
                        </li>
                      );
                    })}
                  </ul>
                )}
              </div>
            </div>

            {/* ---------------------------
                Row 1: Truck Size
            --------------------------- */}
            <div className={styles.row}>
              <div className={styles.truckSizeWrapper} ref={truckSizeDropdownRef}>
                <button
                  type="button"
                  className={styles.logisticsButton}
                  onClick={() => setShowTruckSizeDropdown((p) => !p)}
                >
                  <div className={styles.dropdownLabel}>
                    <span className={styles.dropdownPrefix}>Truck Size:</span>
                    <span className={styles.dropdownSelected}>{truckSize}</span>
                  </div>
                  <UnfoldMoreIcon className={styles.dropdownIcon} />
                </button>
                {showTruckSizeDropdown && (
                  <ul className={styles.rateTypeDropdown}>
                    {TRUCK_SIZE_OPTIONS.map((opt) => {
                      const isSelected = (opt === truckSize);
                      return (
                        <li
                          key={opt}
                          className={
                            isSelected
                              ? `${styles.rateTypeOption} ${styles.selectedOption}`
                              : styles.rateTypeOption
                          }
                          onClick={() => {
                            setTruckSize(opt);
                            setShowTruckSizeDropdown(false);
                          }}
                        >
                          {opt}
                        </li>
                      );
                    })}
                  </ul>
                )}
              </div>
            </div>

            {/* =====================================================
                MOVING DAY INPUTS (always shown unless you want
                to conditionally hide them)
            ===================================================== */}
            <div className={styles.row}>
              <div className={styles.logisticsInputContainer}>
                <label className={styles.inputLabel}>
                  Number of Trucks:
                  <input
                    className={styles.logisticsInput}
                    value={numTrucks}
                    onFocus={handleFocusSelectAll}
                    onChange={handleNumTrucksChange}
                  />
                </label>
              </div>

              <div className={styles.logisticsInputContainer}>
                <label className={styles.inputLabel}>
                  Number of Movers:
                  <input
                    className={styles.logisticsInput}
                    value={numMovers}
                    onFocus={handleFocusSelectAll}
                    onChange={handleNumMoversChange}
                  />
                </label>
              </div>

              {isHourly && (
                <div className={styles.logisticsInputContainer}>
                  <label className={styles.inputLabel}>
                    Hourly Rate ($):
                    <input
                      className={styles.logisticsInput}
                      value={hourlyRate}
                      onFocus={handleFocusSelectAll}
                      onChange={handleHourlyRateChange}
                    />
                  </label>
                </div>
              )}
            </div>

            {(isHourly || isVolume || isWeight) && (
              <div className={styles.row}>
                <div className={styles.logisticsInputContainer}>
                  <label className={styles.inputLabel}>
                    Volume (cu ft):
                    <input
                      className={styles.logisticsInput}
                      value={volume}
                      onFocus={handleFocusSelectAll}
                      onChange={handleVolumeChange}
                    />
                  </label>
                </div>

                <div className={styles.logisticsInputContainer}>
                  <label className={styles.inputLabel}>
                    Weight (lbs):
                    <input
                      className={styles.logisticsInput}
                      value={weight}
                      onFocus={handleFocusSelectAll}
                      onChange={handleWeightChange}
                    />
                  </label>
                </div>

                {isVolume && (
                  <div className={styles.logisticsInputContainer}>
                    <label className={styles.inputLabel}>
                      Price per Cuft ($):
                      <input
                        className={styles.logisticsInput}
                        value={pricePerCuft}
                        onFocus={handleFocusSelectAll}
                        onChange={handlePricePerCuftChange}
                      />
                    </label>
                  </div>
                )}

                {isWeight && (
                  <div className={styles.logisticsInputContainer}>
                    <label className={styles.inputLabel}>
                      Price per lbs ($):
                      <input
                        className={styles.logisticsInput}
                        value={pricePerLbs}
                        onFocus={handleFocusSelectAll}
                        onChange={handlePricePerLbsChange}
                      />
                    </label>
                  </div>
                )}
              </div>
            )}

            {isHourly && (
              <div className={styles.row}>
                <div
                  className={styles.logisticsButton}
                  style={{ position: 'relative' }}
                  id="travelTimeDropdown"
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowTravelTimeDropdown((p) => !p);
                  }}
                >
                  <div className={styles.dropdownLabel}>
                    <span className={styles.dropdownPrefix}>Travel Time (h):</span>
                    <span className={styles.dropdownSelected}>{travelTime}</span>
                  </div>
                  <UnfoldMoreIcon className={styles.dropdownIcon} />

                  {showTravelTimeDropdown && (
                    <ul className={styles.rateTypeDropdown}>
                      {QUARTER_HOUR_OPTIONS.map((opt) => {
                        const isSelected = (opt === travelTime);
                        return (
                          <li
                            key={opt}
                            className={
                              isSelected
                                ? `${styles.rateTypeOption} ${styles.selectedOption}`
                                : styles.rateTypeOption
                            }
                            onClick={(evt) => {
                              evt.stopPropagation();
                              setTravelTime(opt);
                              setShowTravelTimeDropdown(false);
                            }}
                          >
                            {opt}
                          </li>
                        );
                      })}
                    </ul>
                  )}
                </div>
              </div>
            )}

            <div className={styles.row}>
              <div
                className={styles.logisticsButton}
                style={{ position: 'relative' }}
                id="movingMinDropdown"
                onClick={(e) => {
                  e.stopPropagation();
                  setShowMovingMinDropdown((p) => !p);
                }}
              >
                <div className={styles.dropdownLabel}>
                  <span className={styles.dropdownPrefix}>Work time minimum:</span>
                  <span className={styles.dropdownSelected}>{movingMin}</span>
                </div>
                <UnfoldMoreIcon className={styles.dropdownIcon} />

                {showMovingMinDropdown && (
                  <ul className={styles.rateTypeDropdown}>
                    {MOVING_MINIMUM_OPTIONS.map((opt) => {
                      const isSelected = (opt === movingMin);
                      return (
                        <li
                          key={opt}
                          className={
                            isSelected
                              ? `${styles.rateTypeOption} ${styles.selectedOption}`
                              : styles.rateTypeOption
                          }
                          onClick={(evt) => {
                            evt.stopPropagation();
                            setMovingMin(opt);
                            setShowMovingMinDropdown(false);
                          }}
                        >
                          {opt}
                        </li>
                      );
                    })}
                  </ul>
                )}
              </div>
            </div>

            {(isVolume || isWeight) && (
              <div className={styles.row} style={{ flexDirection: 'column', gap: '10px' }}>
                <div
                  className={styles.logisticsButton}
                  style={{ position: 'relative' }}
                  id="pickupWindowDropdown"
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowPickupWindowDropdown((p) => !p);
                  }}
                >
                  <div className={styles.dropdownLabel}>
                    <span className={styles.dropdownPrefix}>Pickup window:</span>
                    <span className={styles.dropdownSelected}>{pickupWindow}</span>
                  </div>
                  <UnfoldMoreIcon className={styles.dropdownIcon} />
                  {showPickupWindowDropdown && (
                    <ul className={styles.rateTypeDropdown}>
                      {PICKUP_WINDOW_OPTIONS.map((opt) => {
                        const isSelected = (opt === pickupWindow);
                        return (
                          <li
                            key={opt}
                            className={
                              isSelected
                                ? `${styles.rateTypeOption} ${styles.selectedOption}`
                                : styles.rateTypeOption
                            }
                            onClick={(evt) => {
                              evt.stopPropagation();
                              setPickupWindow(opt);
                              setShowPickupWindowDropdown(false);
                            }}
                          >
                            {opt}
                          </li>
                        );
                      })}
                    </ul>
                  )}
                </div>

                <div
                  className={styles.logisticsButton}
                  style={{ position: 'relative' }}
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowEarliestDeliveryCalendar((p) => !p);
                  }}
                >
                  <div className={styles.dropdownLabel}>
                    <span className={styles.dropdownPrefix}>Earliest Delivery Date:</span>
                    <span className={styles.dropdownSelected}>
                      {earliestDeliveryDate || 'Select'}
                    </span>
                  </div>
                  <div className={styles.calendarRightIconWrapper}>
                    <CalendarIcon className={styles.calendarIcon} />
                  </div>

                  {showEarliestDeliveryCalendar && (
                    <div
                      className={styles.calendarPopup}
                      ref={earliestCalRef}
                      onClick={(evt) => evt.stopPropagation()}
                    >
                      <div className={styles.calendarHeader}>
                        <button
                          onClick={(evt) => {
                            evt.stopPropagation();
                            handlePrevMonth();
                          }}
                        >
                          Prev
                        </button>
                        <span>
                          {calendarMonth.toLocaleString('default', { month: 'long' })}{' '}
                          {calendarMonth.getFullYear()}
                        </span>
                        <button
                          onClick={(evt) => {
                            evt.stopPropagation();
                            handleNextMonth();
                          }}
                        >
                          Next
                        </button>
                      </div>
                      <div className={styles.calendarGrid}>
                        {daysInMonth.map((day) => {
                          const dateObj = new Date(
                            calendarMonth.getFullYear(),
                            calendarMonth.getMonth(),
                            day
                          );
                          const isSelected =
                            earliestDeliveryDate &&
                            new Date(earliestDeliveryDate).toDateString() ===
                              dateObj.toDateString();
                          return (
                            <button
                              key={day}
                              type="button"
                              className={`
                                ${styles.calendarDay}
                                ${isSelected ? styles.selectedDay : ''}
                              `}
                              onClick={() => handleSelectEarliestDate(dateObj)}
                            >
                              {day}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>

                <div
                  className={styles.logisticsButton}
                  style={{ position: 'relative' }}
                  id="deliveryWindowDropdown"
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowDeliveryWindowDropdown((p) => !p);
                  }}
                >
                  <div className={styles.dropdownLabel}>
                    <span className={styles.dropdownPrefix}>Delivery Window:</span>
                    <span className={styles.dropdownSelected}>{deliveryWindow}</span>
                  </div>
                  <UnfoldMoreIcon className={styles.dropdownIcon} />
                  {showDeliveryWindowDropdown && (
                    <ul className={styles.rateTypeDropdown}>
                      {DELIVERY_WINDOW_OPTIONS.map((opt) => {
                        const isSelected = (opt === deliveryWindow);
                        return (
                          <li
                            key={opt}
                            className={
                              isSelected
                                ? `${styles.rateTypeOption} ${styles.selectedOption}`
                                : styles.rateTypeOption
                            }
                            onClick={(evt) => {
                              evt.stopPropagation();
                              setDeliveryWindow(opt);
                              setShowDeliveryWindowDropdown(false);
                            }}
                          >
                            {opt}
                          </li>
                        );
                      })}
                    </ul>
                  )}
                </div>
              </div>
            )}

            <div className={styles.divider} />

            {isHourly && (
              <>
                <div className={styles.workTimeHeadline}>Work time</div>
                <div className={styles.row} style={{ flexDirection: 'column', gap: '10px' }}>
                  <div
                    className={styles.logisticsButton}
                    style={{ position: 'relative' }}
                    id="minHoursDropdown"
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowMinHoursDropdown((p) => !p);
                    }}
                  >
                    <div className={styles.dropdownLabel}>
                      <span className={styles.dropdownPrefix}>Min. hours:</span>
                      <span className={styles.dropdownSelected}>{minHours}</span>
                    </div>
                    <UnfoldMoreIcon className={styles.dropdownIcon} />
                    {showMinHoursDropdown && (
                      <ul className={styles.rateTypeDropdown}>
                        {QUARTER_HOUR_OPTIONS.map((opt) => {
                          const isSelected = (opt === minHours);
                          return (
                            <li
                              key={opt}
                              className={
                                isSelected
                                  ? `${styles.rateTypeOption} ${styles.selectedOption}`
                                  : styles.rateTypeOption
                              }
                              onClick={(evt) => {
                                evt.stopPropagation();
                                handleSelectMinHours(opt);
                                setShowMinHoursDropdown(false);
                              }}
                            >
                              {opt}
                            </li>
                          );
                        })}
                      </ul>
                    )}
                  </div>

                  <div
                    className={styles.logisticsButton}
                    style={{ position: 'relative' }}
                    id="maxHoursDropdown"
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowMaxHoursDropdown((p) => !p);
                    }}
                  >
                    <div className={styles.dropdownLabel}>
                      <span className={styles.dropdownPrefix}>Max. hours:</span>
                      <span className={styles.dropdownSelected}>{maxHours}</span>
                    </div>
                    <UnfoldMoreIcon className={styles.dropdownIcon} />
                    {showMaxHoursDropdown && (
                      <ul className={styles.rateTypeDropdown}>
                        {QUARTER_HOUR_OPTIONS.map((opt) => {
                          const isSelected = (opt === maxHours);
                          return (
                            <li
                              key={opt}
                              className={
                                isSelected
                                  ? `${styles.rateTypeOption} ${styles.selectedOption}`
                                  : styles.rateTypeOption
                              }
                              onClick={(evt) => {
                                evt.stopPropagation();
                                handleSelectMaxHours(opt);
                                setShowMaxHoursDropdown(false);
                              }}
                            >
                              {opt}
                            </li>
                          );
                        })}
                      </ul>
                    )}
                  </div>
                </div>
              </>
            )}

            <div className={styles.detailsRow}>
              <button
                type="button"
                className={styles.detailsButton}
                onClick={() => setShowWorkTimeDetails((prev) => !prev)}
              >
                <div className={styles.dropdownLabel}>
                  <span className={styles.dropdownPrefix}>Details</span>
                </div>
                <div className={styles.plusMinusIcon}>
                  {showWorkTimeDetails ? '-' : '+'}
                </div>
              </button>
            </div>

            {showWorkTimeDetails && (
              <div className={styles.dummyDataBox}>
                <p>This is some detail about the MOVING day work time, etc.</p>
              </div>
            )}

            {/* =====================================================
                PACKING DAY INPUTS => only shown if hasPackingDay
            ===================================================== */}
            {hasPackingDay && (
              <>
                <div className={styles.divider} />

                {/* PACKING day headline */}
                <div className={styles.workTimeHeadline}>Packing Day</div>

                <div className={styles.row}>
                  <div className={styles.logisticsInputContainer}>
                    <label className={styles.inputLabel}>
                      Number of Packers:
                      <input
                        className={styles.logisticsInput}
                        value={numPackers}
                        onFocus={handleFocusSelectAll}
                        onChange={handleNumPackersChange}
                      />
                    </label>
                  </div>

                  {isHourly && (
                    <div className={styles.logisticsInputContainer}>
                      <label className={styles.inputLabel}>
                        Packing Hourly Rate ($):
                        <input
                          className={styles.logisticsInput}
                          value={packingHourlyRate}
                          onFocus={handleFocusSelectAll}
                          onChange={handlePackingHourlyRateChange}
                        />
                      </label>
                    </div>
                  )}
                </div>

                {isHourly && (
                  <>
                    <div className={styles.row}>
                      <div
                        className={styles.logisticsButton}
                        style={{ position: 'relative' }}
                        id="packingTravelTimeDropdown"
                        onClick={(e) => {
                          e.stopPropagation();
                          setShowPackingTravelTimeDropdown((p) => !p);
                        }}
                      >
                        <div className={styles.dropdownLabel}>
                          <span className={styles.dropdownPrefix}>
                            Packers Travel Time (h):
                          </span>
                          <span className={styles.dropdownSelected}>{packingTravelTime}</span>
                        </div>
                        <UnfoldMoreIcon className={styles.dropdownIcon} />
                        {showPackingTravelTimeDropdown && (
                          <ul className={styles.rateTypeDropdown}>
                            {QUARTER_HOUR_OPTIONS.map((opt) => {
                              const isSelected = (opt === packingTravelTime);
                              return (
                                <li
                                  key={opt}
                                  className={
                                    isSelected
                                      ? `${styles.rateTypeOption} ${styles.selectedOption}`
                                      : styles.rateTypeOption
                                  }
                                  onClick={(evt) => {
                                    evt.stopPropagation();
                                    setPackingTravelTime(opt);
                                    setShowPackingTravelTimeDropdown(false);
                                  }}
                                >
                                  {opt}
                                </li>
                              );
                            })}
                          </ul>
                        )}
                      </div>
                    </div>

                    <div className={styles.row}>
                      <div
                        className={styles.logisticsButton}
                        style={{ position: 'relative' }}
                        id="packingMinDropdown"
                        onClick={(e) => {
                          e.stopPropagation();
                          setShowPackingMinDropdown((p) => !p);
                        }}
                      >
                        <div className={styles.dropdownLabel}>
                          <span className={styles.dropdownPrefix}>Packing time minimum:</span>
                          <span className={styles.dropdownSelected}>{packingMinimum}</span>
                        </div>
                        <UnfoldMoreIcon className={styles.dropdownIcon} />
                        {showPackingMinDropdown && (
                          <ul className={styles.rateTypeDropdown}>
                            {MOVING_MINIMUM_OPTIONS.map((opt) => {
                              const isSelected = (opt === packingMinimum);
                              return (
                                <li
                                  key={opt}
                                  className={
                                    isSelected
                                      ? `${styles.rateTypeOption} ${styles.selectedOption}`
                                      : styles.rateTypeOption
                                  }
                                  onClick={(evt) => {
                                    evt.stopPropagation();
                                    setPackingMinimum(opt);
                                    setShowPackingMinDropdown(false);
                                  }}
                                >
                                  {opt}
                                </li>
                              );
                            })}
                          </ul>
                        )}
                      </div>
                    </div>
                  </>
                )}

                <div className={styles.workTimeHeadline}>Packers Work time</div>
                <div className={styles.row} style={{ flexDirection: 'column', gap: '10px' }}>
                  <div
                    className={styles.logisticsButton}
                    style={{ position: 'relative' }}
                    id="packingMinHoursDropdown"
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowPackingMinHoursDropdown((p) => !p);
                    }}
                  >
                    <div className={styles.dropdownLabel}>
                      <span className={styles.dropdownPrefix}>Packing Min. hours:</span>
                      <span className={styles.dropdownSelected}>{packingMinHours}</span>
                    </div>
                    <UnfoldMoreIcon className={styles.dropdownIcon} />
                    {showPackingMinHoursDropdown && (
                      <ul className={styles.rateTypeDropdown}>
                        {QUARTER_HOUR_OPTIONS.map((opt) => {
                          const isSelected = (opt === packingMinHours);
                          return (
                            <li
                              key={opt}
                              className={
                                isSelected
                                  ? `${styles.rateTypeOption} ${styles.selectedOption}`
                                  : styles.rateTypeOption
                              }
                              onClick={(evt) => {
                                evt.stopPropagation();
                                handleSelectPackingMinHours(opt);
                                setShowPackingMinHoursDropdown(false);
                              }}
                            >
                              {opt}
                            </li>
                          );
                        })}
                      </ul>
                    )}
                  </div>

                  <div
                    className={styles.logisticsButton}
                    style={{ position: 'relative' }}
                    id="packingMaxHoursDropdown"
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowPackingMaxHoursDropdown((p) => !p);
                    }}
                  >
                    <div className={styles.dropdownLabel}>
                      <span className={styles.dropdownPrefix}>Packing Max. hours:</span>
                      <span className={styles.dropdownSelected}>{packingMaxHours}</span>
                    </div>
                    <UnfoldMoreIcon className={styles.dropdownIcon} />
                    {showPackingMaxHoursDropdown && (
                      <ul className={styles.rateTypeDropdown}>
                        {QUARTER_HOUR_OPTIONS.map((opt) => {
                          const isSelected = (opt === packingMaxHours);
                          return (
                            <li
                              key={opt}
                              className={
                                isSelected
                                  ? `${styles.rateTypeOption} ${styles.selectedOption}`
                                  : styles.rateTypeOption
                              }
                              onClick={(evt) => {
                                evt.stopPropagation();
                                handleSelectPackingMaxHours(opt);
                                setShowPackingMaxHoursDropdown(false);
                              }}
                            >
                              {opt}
                            </li>
                          );
                        })}
                      </ul>
                    )}
                  </div>
                </div>

                <div className={styles.detailsRow}>
                  <button
                    type="button"
                    className={styles.detailsButton}
                    onClick={() => setShowPackingDetails((prev) => !prev)}
                  >
                    <div className={styles.dropdownLabel}>
                      <span className={styles.dropdownPrefix}>Details</span>
                    </div>
                    <div className={styles.plusMinusIcon}>
                      {showPackingDetails ? '-' : '+'}
                    </div>
                  </button>
                </div>

                {showPackingDetails && (
                  <div className={styles.dummyDataBox}>
                    <p>This is some detail about PACKING day or extra info.</p>
                  </div>
                )}
              </>
            )}

          </div>
        </div>
      )}
    </div>
  );
}

export default LogisticsDetails;
