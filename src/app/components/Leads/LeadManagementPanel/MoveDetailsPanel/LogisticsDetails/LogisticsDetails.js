"use client";

import React, { useState, useRef, useEffect } from 'react';
import styles from './LogisticsDetails.module.css';
import Icon from 'src/app/components/Icon';  // or adjust import path if needed

// The "Add Packing Day" or "Moving/Packing" day selector
import PackingDay from './PackingDay/PackingDay';

// Rate Type Options (used for the "Moving" section)
const RATE_TYPE_OPTIONS = ['Hourly Rate', 'Volume Based', 'Weight Based'];

// Generate quarter-hour increments ("1.00 h", "1.15 h", ..., up to 24h)
function generateQuarterHourOptions() {
  const result = [];
  for (let hour = 0; hour <= 24; hour++) {
    for (let quarter = 0; quarter < 4; quarter++) {
      const totalMinutes = hour * 60 + quarter * 15;
      if (totalMinutes === 0) continue;
      if (totalMinutes > 24 * 60) break;

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

// "Moving minimum" => integer hours: 1h, 2h, ..., 24h
function generateWholeHours(from, to) {
  const arr = [];
  for (let i = from; i <= to; i++) {
    arr.push(`${i}h`);
  }
  return arr;
}
const MOVING_MINIMUM_OPTIONS = generateWholeHours(1, 24);

// For pickup/delivery windows
const PICKUP_WINDOW_OPTIONS = ['1 day', '2 days', '3 days'];
function generateDeliveryWindowOptions() {
  const arr = [];
  for (let i = 1; i <= 30; i++) {
    arr.push(`${i} day${i > 1 ? 's' : ''}`);
  }
  return arr;
}
const DELIVERY_WINDOW_OPTIONS = generateDeliveryWindowOptions();

/**
 * Parse a string like "2.45 h" into numeric hours (e.g. "2.45 h" => 2.75).
 */
function parseQuarterHours(str) {
  if (!str) return 0;
  const core = str.replace(' h', '');
  const [h, m] = core.split('.');
  const hour = Number(h) || 0;
  const decimalPart = m ? Number(m) : 0;
  return hour + decimalPart / 60;
}

/**
 * Format a date string into "Mmm dd yyyy" (e.g. "Apr 04 2025").
 */
function formatDate(date) {
  if (!date) return '';
  const dateObj = new Date(date);
  if (isNaN(dateObj)) return '';
  const months = ['Jan','Feb','Mar','Apr','May','Jun',
                  'Jul','Aug','Sep','Oct','Nov','Dec'];
  const month = months[dateObj.getMonth()];
  const day = String(dateObj.getDate()).padStart(2, '0');
  const year = dateObj.getFullYear();
  return `${month} ${day} ${year}`;
}

// On focus => select all text in the input
function handleFocusSelectAll(e) {
  e.target.select();
}

function LogisticsDetails({
  lead,
  onLeadUpdated,
  isCollapsed,
  setIsCollapsed,
}) {
  // Toggle the entire panel open/closed
  const toggleCollapse = () => setIsCollapsed((prev) => !prev);

  // Check if lead hasPackingDay, then see if lead.activeDay is "packing" or "moving"
  const [activeDay, setActiveDay] = useState(
    lead?.activeDay === 'packing' ? 'packing' : 'moving'
  );
  const hasPackingDay = Boolean(lead?.hasPackingDay);

  // We measure the height of the MOVING section so it doesn't "jump" when toggling.
  const movingSectionRef = useRef(null);
  const [movingHeight, setMovingHeight] = useState(0);

  useEffect(() => {
    if (movingSectionRef.current) {
      setMovingHeight(movingSectionRef.current.offsetHeight);
    }
  }, []);

  // -------------------- MOVING fields --------------------
  const [rateType, setRateType] = useState(lead?.rateType ?? 'Hourly Rate');
  const [showRateTypeDropdown, setShowRateTypeDropdown] = useState(false);
  const rateTypeDropdownRef = useRef(null);

  // Basic numeric fields
  const [numTrucks, setNumTrucks] = useState(lead?.numTrucks ?? '1');
  const [numMovers, setNumMovers] = useState(lead?.numMovers ?? '2');
  const [hourlyRate, setHourlyRate] = useState(lead?.hourlyRate ?? '180');

  // Volume/Weight fields
  const [volume, setVolume] = useState(lead?.volume ?? '1000');
  const [weight, setWeight] = useState(lead?.weight ?? '7000');
  const [pricePerCuft, setPricePerCuft] = useState(lead?.pricePerCuft ?? '4.50');
  const [pricePerLbs, setPricePerLbs] = useState(lead?.pricePerLbs ?? '0.74');

  // Travel time
  const [travelTime, setTravelTime] = useState(lead?.travelTime ?? '1.00 h');
  const [showTravelTimeDropdown, setShowTravelTimeDropdown] = useState(false);

  // Work time minimum (for Hourly)
  const [movingMin, setMovingMin] = useState(lead?.movingMin ?? '3h');
  const [showMovingMinDropdown, setShowMovingMinDropdown] = useState(false);

  // Minimum cuft/lbs if Volume/Weight
  const [minimumCuft, setMinimumCuft] = useState(lead?.minimumCuft ?? '0.00');
  const [minimumLbs, setMinimumLbs] = useState(lead?.minimumLbs ?? '0');

  // pickup/delivery fields
  const [pickupWindow, setPickupWindow] = useState(lead?.pickupWindow ?? '1 day');
  const [showPickupWindowDropdown, setShowPickupWindowDropdown] = useState(false);

  const [earliestDeliveryDate, setEarliestDeliveryDate] = useState(lead?.earliestDeliveryDate ?? '');
  const [showEarliestDeliveryCalendar, setShowEarliestDeliveryCalendar] = useState(false);
  const earliestCalRef = useRef(null);

  const [deliveryWindow, setDeliveryWindow] = useState(lead?.deliveryWindow ?? '7 days');
  const [showDeliveryWindowDropdown, setShowDeliveryWindowDropdown] = useState(false);

  // Additional min/max hours for the "Work time" if Hourly
  const [minHours, setMinHours] = useState(lead?.minHours ?? '1.00 h');
  const [maxHours, setMaxHours] = useState(lead?.maxHours ?? '2.00 h');
  const [showMinHoursDropdown, setShowMinHoursDropdown] = useState(false);
  const [showMaxHoursDropdown, setShowMaxHoursDropdown] = useState(false);
  const [showWorkTimeDetails, setShowWorkTimeDetails] = useState(false);

  // -------------------- PACKING fields --------------------
  const [numPackers, setNumPackers] = useState(lead?.numPackers ?? '2');
  const [packingHourlyRate, setPackingHourlyRate] =
    useState(lead?.packingHourlyRate ?? '120');
  const [packingTravelTime, setPackingTravelTime] =
    useState(lead?.packingTravelTime ?? '0.45 h');
  const [showPackingTravelTimeDropdown, setShowPackingTravelTimeDropdown] = useState(false);

  const [packingMinimum, setPackingMinimum] =
    useState(lead?.packingMinimum ?? '2h');
  const [showPackingMinDropdown, setShowPackingMinDropdown] = useState(false);

  const [packingMinHours, setPackingMinHours] =
    useState(lead?.packingMinHours ?? '1.00 h');
  const [packingMaxHours, setPackingMaxHours] =
    useState(lead?.packingMaxHours ?? '2.00 h');
  const [showPackingMinHoursDropdown, setShowPackingMinHoursDropdown] = useState(false);
  const [showPackingMaxHoursDropdown, setShowPackingMaxHoursDropdown] = useState(false);
  const [showPackingDetails, setShowPackingDetails] = useState(false);

  // Are we "Hourly", "Volume", or "Weight"?
  const isHourly = rateType === 'Hourly Rate';
  const isVolume = rateType === 'Volume Based';
  const isWeight = rateType === 'Weight Based';

  // Helper to tell the parent that a field changed
  function handleUpdateLeadField(fieldName, value) {
    if (onLeadUpdated) {
      onLeadUpdated({
        ...lead,
        [fieldName]: value,
      });
    }
  }

  // -------------- MOVING handlers --------------
  function handleNumTrucksChange(e) {
    const val = e.target.value.replace(/\D+/g, '');
    setNumTrucks(val || '0');
    handleUpdateLeadField('numTrucks', val || '0');
  }
  function handleNumMoversChange(e) {
    const val = e.target.value.replace(/\D+/g, '');
    setNumMovers(val || '0');
    handleUpdateLeadField('numMovers', val || '0');
  }
  function handleHourlyRateChange(e) {
    const val = e.target.value.replace(/[^0-9.]/g, '');
    setHourlyRate(val || '0');
    handleUpdateLeadField('hourlyRate', val || '0');
  }

  // volume/weight changes
  function handleVolumeChange(e) {
    const val = e.target.value.replace(/\D+/g, '');
    setVolume(val || '0');
    handleUpdateLeadField('volume', val || '0');
  }
  function handleWeightChange(e) {
    const val = e.target.value.replace(/\D+/g, '');
    setWeight(val || '0');
    handleUpdateLeadField('weight', val || '0');
  }
  function handlePricePerCuftChange(e) {
    const val = e.target.value.replace(/[^0-9.]/g, '');
    setPricePerCuft(val || '0');
    handleUpdateLeadField('pricePerCuft', val || '0');
  }
  function handlePricePerLbsChange(e) {
    const val = e.target.value.replace(/[^0-9.]/g, '');
    setPricePerLbs(val || '0');
    handleUpdateLeadField('pricePerLbs', val || '0');
  }

  // min/max hours for "Work time"
  function handleSelectMinHours(label) {
    setMinHours(label);
    handleUpdateLeadField('minHours', label);
    // clamp
    const minVal = parseQuarterHours(label);
    const maxVal = parseQuarterHours(maxHours);
    if (maxVal < minVal) {
      setMaxHours(label);
      handleUpdateLeadField('maxHours', label);
    }
  }
  function handleSelectMaxHours(label) {
    setMaxHours(label);
    handleUpdateLeadField('maxHours', label);
    // clamp
    const newMax = parseQuarterHours(label);
    const oldMin = parseQuarterHours(minHours);
    if (newMax < oldMin) {
      setMinHours(label);
      handleUpdateLeadField('minHours', label);
    }
  }

  // Volume => min cuft
  function handleMinimumCuftChange(e) {
    let val = e.target.value.replace(/[^0-9.]/g, '');
    const parts = val.split('.');
    if (parts.length > 2) val = parts[0] + '.' + parts[1];
    const [intPart, fracPart] = val.split('.');
    if (fracPart && fracPart.length > 2) {
      val = intPart + '.' + fracPart.slice(0, 2);
    }
    if (!val) val = '0.00';
    setMinimumCuft(val);
    handleUpdateLeadField('minimumCuft', val);
  }

  // Weight => min lbs
  function handleMinimumLbsChange(e) {
    let val = e.target.value.replace(/\D+/g, '');
    if (!val) val = '0';
    setMinimumLbs(val);
    handleUpdateLeadField('minimumLbs', val);
  }

  // -------------- PACKING handlers --------------
  function handleNumPackersChange(e) {
    const val = e.target.value.replace(/\D+/g, '');
    setNumPackers(val || '0');
    handleUpdateLeadField('numPackers', val || '0');
  }
  function handlePackingHourlyRateChange(e) {
    const val = e.target.value.replace(/[^0-9.]/g, '');
    setPackingHourlyRate(val || '0');
    handleUpdateLeadField('packingHourlyRate', val || '0');
  }

  function handleSelectPackingMinHours(label) {
    setPackingMinHours(label);
    handleUpdateLeadField('packingMinHours', label);
    const minVal = parseQuarterHours(label);
    const maxVal = parseQuarterHours(packingMaxHours);
    if (maxVal < minVal) {
      setPackingMaxHours(label);
      handleUpdateLeadField('packingMaxHours', label);
    }
  }
  function handleSelectPackingMaxHours(label) {
    setPackingMaxHours(label);
    handleUpdateLeadField('packingMaxHours', label);
    const newMax = parseQuarterHours(label);
    const oldMin = parseQuarterHours(packingMinHours);
    if (newMax < oldMin) {
      setPackingMinHours(label);
      handleUpdateLeadField('packingMinHours', label);
    }
  }

  // -------------- pickup/delivery => earliestDelivery calendar --------------
  const [calendarMonth, setCalendarMonth] = useState(new Date());
  const [daysInMonth, setDaysInMonth] = useState([]);
  useEffect(() => {
    const y = calendarMonth.getFullYear();
    const m = calendarMonth.getMonth();
    const totalDays = new Date(y, m + 1, 0).getDate();
    const arr = [];
    for (let i = 1; i <= totalDays; i++) arr.push(i);
    setDaysInMonth(arr);
  }, [calendarMonth]);

  function handlePrevMonth() {
    setCalendarMonth((prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  }
  function handleNextMonth() {
    setCalendarMonth((prev) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
  }
  function handleSelectEarliestDate(dateObj) {
    const dateStr = dateObj.toDateString();
    setEarliestDeliveryDate(dateStr);
    setShowEarliestDeliveryCalendar(false);
    handleUpdateLeadField('earliestDeliveryDate', dateStr);
  }

  // -------------- close any open dropdowns if user clicks outside --------------
  useEffect(() => {
    function handleClickOutside(e) {
      // Rate type dropdown
      if (
        showRateTypeDropdown &&
        rateTypeDropdownRef.current &&
        !rateTypeDropdownRef.current.contains(e.target)
      ) {
        setShowRateTypeDropdown(false);
      }
      // Travel Time => MOVING
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
      // earliestDeliveryDate calendar
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
      // minHours & maxHours => MOVING
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
      // packing => min
      if (showPackingMinDropdown && !e.target.closest('#packingMinDropdown')) {
        setShowPackingMinDropdown(false);
      }
      // packing => minHours & maxHours
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

  // We show the "Moving" section if hasPackingDay===false OR if activeDay==="moving".
  const showMovingSection = !hasPackingDay || activeDay === 'moving';
  // We show the "Packing" section if hasPackingDay===true AND activeDay==="packing".
  const showPackingSection = hasPackingDay && activeDay === 'packing';

  return (
    <div className={styles.logisticsContainer}>
      <div className={styles.logisticsHeader}>
        <span className={styles.logisticsTitle}>Logistics</span>
        <button className={styles.minusButton} onClick={toggleCollapse}>
          {isCollapsed ? '+' : '-'}
        </button>
      </div>

      {!isCollapsed && (
        <div
          className={styles.innerContent}
          // If we know the moving section height, keep minHeight so it doesn't jump
          style={{ minHeight: movingHeight ? `${movingHeight}px` : 'auto' }}
        >
          {/* "Add Packing Day" or "Packing/Moving Day" toggle */}
          <div className={styles.packingDayWrapper}>
            <PackingDay
              lead={lead}
              onDaySelected={(day) => {
                // Just update local state
                setActiveDay(day);
              }}
              onLeadUpdated={(updatedLead) => {
                // Pass the full updated lead to parent
                if (onLeadUpdated) {
                  console.log("Updating lead from PackingDay:", updatedLead);
                  onLeadUpdated(updatedLead);
                }
              }}
            />
          </div>

          <div className={styles.extraInputsContainer}>
            {/* ============ MOVING SECTION ============ */}
            <div
              ref={movingSectionRef}
              style={{ display: showMovingSection ? 'block' : 'none' }}
            >
              {/* Rate Type dropdown */}
              <div className={styles.row}>
                <div className={styles.rateTypeWrapper} ref={rateTypeDropdownRef}>
                  <button
                    type="button"
                    className={`${styles.logisticsButton} ${showRateTypeDropdown ? styles.activeInput : ''}`}
                    onClick={() => setShowRateTypeDropdown((p) => !p)}
                  >
                    <div className={styles.dropdownLabel}>
                      <span className={styles.dropdownPrefix}>Rate Type:</span>
                      <span className={styles.dropdownSelected}>{rateType}</span>
                    </div>
                    <Icon name="UnfoldMore" className={styles.dropdownIcon} />
                  </button>

                  {showRateTypeDropdown && (
                    <ul className={styles.rateTypeDropdown}>
                      {RATE_TYPE_OPTIONS.map((opt) => {
                        const isSelected = opt === rateType;
                        return (
                          <li
                            key={opt}
                            className={`${styles.rateTypeOption} ${isSelected ? styles.selectedOption : ''}`}
                            onClick={() => {
                              setRateType(opt);
                              setShowRateTypeDropdown(false);
                              handleUpdateLeadField('rateType', opt);
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

              {/* Number of Trucks / Movers / Hourly Rate */}
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

              {/* volume/weight row */}
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

              {/* Travel Time (Hourly) */}
              {isHourly && (
                <div className={styles.row}>
                  <div
                    className={`${styles.logisticsButton} ${showTravelTimeDropdown ? styles.activeInput : ''}`}
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
                    <Icon name="UnfoldMore" className={styles.dropdownIcon} />

                    {showTravelTimeDropdown && (
                      <ul className={styles.rateTypeDropdown}>
                        {QUARTER_HOUR_OPTIONS.map((opt) => {
                          const isSelected = opt === travelTime;
                          return (
                            <li
                              key={opt}
                              className={`${styles.rateTypeOption} ${isSelected ? styles.selectedOption : ''}`}
                              onClick={(evt) => {
                                evt.stopPropagation();
                                setTravelTime(opt);
                                setShowTravelTimeDropdown(false);
                                handleUpdateLeadField('travelTime', opt);
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

              {/* Work time minimum (Hourly) */}
              {isHourly && (
                <div className={styles.row}>
                  <div
                    className={`${styles.logisticsButton} ${showMovingMinDropdown ? styles.activeInput : ''}`}
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
                    <Icon name="UnfoldMore" className={styles.dropdownIcon} />

                    {showMovingMinDropdown && (
                      <ul className={styles.rateTypeDropdown}>
                        {MOVING_MINIMUM_OPTIONS.map((opt) => {
                          const isSelected = opt === movingMin;
                          return (
                            <li
                              key={opt}
                              className={`${styles.rateTypeOption} ${isSelected ? styles.selectedOption : ''}`}
                              onClick={(evt) => {
                                evt.stopPropagation();
                                setMovingMin(opt);
                                setShowMovingMinDropdown(false);
                                handleUpdateLeadField('movingMin', opt);
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

              {/* Minimum cuft / lbs if Volume or Weight */}
              {isVolume && (
                <div className={styles.row}>
                  <div className={styles.logisticsInputContainer}>
                    <label className={styles.inputLabel}>
                      Minimum Cuft:
                      <input
                        className={styles.logisticsInput}
                        value={minimumCuft}
                        onFocus={handleFocusSelectAll}
                        onChange={handleMinimumCuftChange}
                      />
                    </label>
                  </div>
                </div>
              )}
              {isWeight && (
                <div className={styles.row}>
                  <div className={styles.logisticsInputContainer}>
                    <label className={styles.inputLabel}>
                      Minimum Lbs:
                      <input
                        className={styles.logisticsInput}
                        value={minimumLbs}
                        onFocus={handleFocusSelectAll}
                        onChange={handleMinimumLbsChange}
                      />
                    </label>
                  </div>
                </div>
              )}

              {/* Pickup window / Earliest Delivery / Delivery Window (for Volume/Weight) */}
              {(isVolume || isWeight) && (
                <div className={styles.row} style={{ flexDirection: 'column', gap: '10px' }}>
                  <div
                    className={`${styles.logisticsButton} ${showPickupWindowDropdown ? styles.activeInput : ''}`}
                    style={{ position: 'relative' }}
                    id="pickupWindowDropdown"
                    onClick={(evt) => {
                      evt.stopPropagation();
                      setShowPickupWindowDropdown((p) => !p);
                    }}
                  >
                    <div className={styles.dropdownLabel}>
                      <span className={styles.dropdownPrefix}>Pickup window:</span>
                      <span className={styles.dropdownSelected}>{pickupWindow}</span>
                    </div>
                    <Icon name="UnfoldMore" className={styles.dropdownIcon} />

                    {showPickupWindowDropdown && (
                      <ul className={styles.rateTypeDropdown}>
                        {PICKUP_WINDOW_OPTIONS.map((opt) => {
                          const isSelected = opt === pickupWindow;
                          return (
                            <li
                              key={opt}
                              className={`${styles.rateTypeOption} ${isSelected ? styles.selectedOption : ''}`}
                              onClick={(e) => {
                                e.stopPropagation();
                                setPickupWindow(opt);
                                setShowPickupWindowDropdown(false);
                                handleUpdateLeadField('pickupWindow', opt);
                              }}
                            >
                              {opt}
                            </li>
                          );
                        })}
                      </ul>
                    )}
                  </div>

                  {/* Earliest Delivery Calendar */}
                  <div
                    className={`${styles.logisticsButton} ${showEarliestDeliveryCalendar ? styles.activeInput : ''}`}
                    style={{ position: 'relative' }}
                    onClick={(evt) => {
                      evt.stopPropagation();
                      setShowEarliestDeliveryCalendar((p) => !p);
                    }}
                  >
                    <div className={styles.dropdownLabel}>
                      <span className={styles.dropdownPrefix}>Earliest Del.:</span>
                      <span className={styles.dropdownSelected}>
                        {earliestDeliveryDate ? formatDate(earliestDeliveryDate) : 'Select'}
                      </span>
                    </div>
                    <div className={styles.calendarRightIconWrapper}>
                      <Icon name="Calendar" className={styles.calendarIcon} />
                    </div>

                    {showEarliestDeliveryCalendar && (
                      <div
                        className={styles.calendarPopup}
                        ref={earliestCalRef}
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div className={styles.calendarHeader}>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
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
                            onClick={(e) => {
                              e.stopPropagation();
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
                                className={`${styles.calendarDay} ${isSelected ? styles.selectedDay : ''}`}
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
                    className={`${styles.logisticsButton} ${showDeliveryWindowDropdown ? styles.activeInput : ''}`}
                    style={{ position: 'relative' }}
                    id="deliveryWindowDropdown"
                    onClick={(evt) => {
                      evt.stopPropagation();
                      setShowDeliveryWindowDropdown((p) => !p);
                    }}
                  >
                    <div className={styles.dropdownLabel}>
                      <span className={styles.dropdownPrefix}>Delivery Window:</span>
                      <span className={styles.dropdownSelected}>{deliveryWindow}</span>
                    </div>
                    <Icon name="UnfoldMore" className={styles.dropdownIcon} />

                    {showDeliveryWindowDropdown && (
                      <ul className={styles.rateTypeDropdown}>
                        {DELIVERY_WINDOW_OPTIONS.map((opt) => {
                          const isSelected = opt === deliveryWindow;
                          return (
                            <li
                              key={opt}
                              className={`${styles.rateTypeOption} ${isSelected ? styles.selectedOption : ''}`}
                              onClick={(e) => {
                                e.stopPropagation();
                                setDeliveryWindow(opt);
                                setShowDeliveryWindowDropdown(false);
                                handleUpdateLeadField('deliveryWindow', opt);
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

              {/* Hourly => extra "Work time" min/max hours */}
              {isHourly && (
                <>
                  <div className={styles.divider}></div>
                  <div className={styles.workTimeHeadline}>Work time</div>
                  <div className={styles.row} style={{ flexDirection: 'column', gap: '10px' }}>
                    <div
                      className={`${styles.logisticsButton} ${showMinHoursDropdown ? styles.activeInput : ''}`}
                      style={{ position: 'relative' }}
                      id="minHoursDropdown"
                      onClick={(evt) => {
                        evt.stopPropagation();
                        setShowMinHoursDropdown((p) => !p);
                      }}
                    >
                      <div className={styles.dropdownLabel}>
                        <span className={styles.dropdownPrefix}>Min. hours:</span>
                        <span className={styles.dropdownSelected}>{minHours}</span>
                      </div>
                      <Icon name="UnfoldMore" className={styles.dropdownIcon} />

                      {showMinHoursDropdown && (
                        <ul className={styles.rateTypeDropdown}>
                          {QUARTER_HOUR_OPTIONS.map((opt) => {
                            const isSelected = opt === minHours;
                            return (
                              <li
                                key={opt}
                                className={`${styles.rateTypeOption} ${isSelected ? styles.selectedOption : ''}`}
                                onClick={(e) => {
                                  e.stopPropagation();
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
                      className={`${styles.logisticsButton} ${showMaxHoursDropdown ? styles.activeInput : ''}`}
                      style={{ position: 'relative' }}
                      id="maxHoursDropdown"
                      onClick={(evt) => {
                        evt.stopPropagation();
                        setShowMaxHoursDropdown((p) => !p);
                      }}
                    >
                      <div className={styles.dropdownLabel}>
                        <span className={styles.dropdownPrefix}>Max. hours:</span>
                        <span className={styles.dropdownSelected}>{maxHours}</span>
                      </div>
                      <Icon name="UnfoldMore" className={styles.dropdownIcon} />

                      {showMaxHoursDropdown && (
                        <ul className={styles.rateTypeDropdown}>
                          {QUARTER_HOUR_OPTIONS.map((opt) => {
                            const isSelected = opt === maxHours;
                            return (
                              <li
                                key={opt}
                                className={`${styles.rateTypeOption} ${isSelected ? styles.selectedOption : ''}`}
                                onClick={(e) => {
                                  e.stopPropagation();
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
            </div>

            {/* ============ PACKING SECTION ============ */}
            {showPackingSection && (
              <div style={{ marginTop: '20px' }}>
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
                        className={`${styles.logisticsButton} ${showPackingTravelTimeDropdown ? styles.activeInput : ''}`}
                        style={{ position: 'relative' }}
                        id="packingTravelTimeDropdown"
                        onClick={(evt) => {
                          evt.stopPropagation();
                          setShowPackingTravelTimeDropdown((p) => !p);
                        }}
                      >
                        <div className={styles.dropdownLabel}>
                          <span className={styles.dropdownPrefix}>Packers Travel Time (h):</span>
                          <span className={styles.dropdownSelected}>{packingTravelTime}</span>
                        </div>
                        <Icon name="UnfoldMore" className={styles.dropdownIcon} />

                        {showPackingTravelTimeDropdown && (
                          <ul className={styles.rateTypeDropdown}>
                            {QUARTER_HOUR_OPTIONS.map((opt) => {
                              const isSelected = opt === packingTravelTime;
                              return (
                                <li
                                  key={opt}
                                  className={`${styles.rateTypeOption} ${isSelected ? styles.selectedOption : ''}`}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setPackingTravelTime(opt);
                                    setShowPackingTravelTimeDropdown(false);
                                    handleUpdateLeadField('packingTravelTime', opt);
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
                        className={`${styles.logisticsButton} ${showPackingMinDropdown ? styles.activeInput : ''}`}
                        style={{ position: 'relative' }}
                        id="packingMinDropdown"
                        onClick={(evt) => {
                          evt.stopPropagation();
                          setShowPackingMinDropdown((p) => !p);
                        }}
                      >
                        <div className={styles.dropdownLabel}>
                          <span className={styles.dropdownPrefix}>Packing time minimum:</span>
                          <span className={styles.dropdownSelected}>{packingMinimum}</span>
                        </div>
                        <Icon name="UnfoldMore" className={styles.dropdownIcon} />

                        {showPackingMinDropdown && (
                          <ul className={styles.rateTypeDropdown}>
                            {MOVING_MINIMUM_OPTIONS.map((opt) => {
                              const isSelected = opt === packingMinimum;
                              return (
                                <li
                                  key={opt}
                                  className={`${styles.rateTypeOption} ${isSelected ? styles.selectedOption : ''}`}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setPackingMinimum(opt);
                                    setShowPackingMinDropdown(false);
                                    handleUpdateLeadField('packingMinimum', opt);
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

                <div className={styles.divider}></div>
                <div className={styles.workTimeHeadline}>Packers Work time</div>
                <div className={styles.row} style={{ flexDirection: 'column', gap: '10px' }}>
                  <div
                    className={`${styles.logisticsButton} ${showPackingMinHoursDropdown ? styles.activeInput : ''}`}
                    style={{ position: 'relative' }}
                    id="packingMinHoursDropdown"
                    onClick={(evt) => {
                      evt.stopPropagation();
                      setShowPackingMinHoursDropdown((p) => !p);
                    }}
                  >
                    <div className={styles.dropdownLabel}>
                      <span className={styles.dropdownPrefix}>Packing Min. hours:</span>
                      <span className={styles.dropdownSelected}>{packingMinHours}</span>
                    </div>
                    <Icon name="UnfoldMore" className={styles.dropdownIcon} />

                    {showPackingMinHoursDropdown && (
                      <ul className={styles.rateTypeDropdown}>
                        {QUARTER_HOUR_OPTIONS.map((opt) => {
                          const isSelected = opt === packingMinHours;
                          return (
                            <li
                              key={opt}
                              className={`${styles.rateTypeOption} ${isSelected ? styles.selectedOption : ''}`}
                              onClick={(e) => {
                                e.stopPropagation();
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
                    className={`${styles.logisticsButton} ${showPackingMaxHoursDropdown ? styles.activeInput : ''}`}
                    style={{ position: 'relative' }}
                    id="packingMaxHoursDropdown"
                    onClick={(evt) => {
                      evt.stopPropagation();
                      setShowPackingMaxHoursDropdown((p) => !p);
                    }}
                  >
                    <div className={styles.dropdownLabel}>
                      <span className={styles.dropdownPrefix}>Packing Max. hours:</span>
                      <span className={styles.dropdownSelected}>{packingMaxHours}</span>
                    </div>
                    <Icon name="UnfoldMore" className={styles.dropdownIcon} />

                    {showPackingMaxHoursDropdown && (
                      <ul className={styles.rateTypeDropdown}>
                        {QUARTER_HOUR_OPTIONS.map((opt) => {
                          const isSelected = opt === packingMaxHours;
                          return (
                            <li
                              key={opt}
                              className={`${styles.rateTypeOption} ${isSelected ? styles.selectedOption : ''}`}
                              onClick={(e) => {
                                e.stopPropagation();
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
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default LogisticsDetails;