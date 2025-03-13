import React, { useState, useRef, useEffect } from 'react';
import styles from './LogisticsDetails.module.css';

// Icon for dropdown only
import Icon from 'src/app/components/Icon';
import PackingDay from './PackingDay/PackingDay';

/** Rate Type Options (used for the Moving day) */
const RATE_TYPE_OPTIONS = ['Hourly Rate', 'Volume Based', 'Weight Based'];


/** Generate 15-min increments ("1.00 h", "1.15 h", etc.) up to 24:00 h */
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

/** "Moving minimum" => integer hours: 1h, 2h, ... 24h */
function generateWholeHours(from, to) {
  const arr = [];
  for (let i = from; i <= to; i++) {
    arr.push(`${i}h`);
  }
  return arr;
}
const MOVING_MINIMUM_OPTIONS = generateWholeHours(1, 24);

/** Some additional constants for pickup/delivery windows */
const PICKUP_WINDOW_OPTIONS = ['1 day', '2 days', '3 days'];


function generateDeliveryWindowOptions() {
  const arr = [];
  for (let i = 1; i <= 30; i++) {
    arr.push(`${i} day${i > 1 ? 's' : ''}`);
  }
  return arr;
}
const DELIVERY_WINDOW_OPTIONS = generateDeliveryWindowOptions();

/** Parse a string like "2.45 h" => numeric hours (2.75) */
function parseQuarterHours(str) {
  const core = str.replace(' h', '');  
  const [h, m] = core.split('.');
  const hour = Number(h) || 0;
  const decimalPart = m ? Number(m) : 0;
  return hour + decimalPart / 60;
}
/** Format date as "Mmm dd yyyy" */
function formatDate(date) {
  if (!date) return '';
  const dateObj = new Date(date);
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const month = months[dateObj.getMonth()];
  const day = String(dateObj.getDate()).padStart(2, '0');
  const year = dateObj.getFullYear();
  return `${month} ${day} ${year}`;
}

/** On-focus => select all text in the input */
function handleFocusSelectAll(e) {
  e.target.select();
}

function LogisticsDetails({
  lead,            // The entire lead object
  onLeadUpdated,   // Callback to update the lead in the parent
  isCollapsed,
  setIsCollapsed,
}) {
  const toggleCollapse = () => setIsCollapsed((prev) => !prev);
// If the lead has a packing day stored, we want to show that initially
  // We also check if the user had "Moving" or "Packing" as last day, or default to "Moving"
  const [activeDay, setActiveDay] = useState(
    lead?.activeDay === 'Packing' ? 'Packing' : 'Moving'
  );

  // If lead.hasPackingDay is true, we let the user see "Packing" day, otherwise they only see "Moving"
  // We'll pass "hasPackingDay" to <PackingDay>, which can change it by calling onLeadUpdated
  const hasPackingDay = Boolean(lead?.hasPackingDay);

  // ---------- MOVING SECTION measurements (so the container doesn't shrink) ----------
  const movingSectionRef = useRef(null);
  const [movingHeight, setMovingHeight] = useState(0);

  useEffect(() => {
    if (movingSectionRef.current) {
      setMovingHeight(movingSectionRef.current.offsetHeight);
    }
  }, []);


  // =========== MOVING: Rate Type ===========
  const [rateType, setRateType] = useState(lead?.rateType ?? 'Hourly Rate');
  const [showRateTypeDropdown, setShowRateTypeDropdown] = useState(false);
  const rateTypeDropdownRef = useRef(null);

  // =========== MOVING day fields ===========
  const [numTrucks, setNumTrucks] = useState(lead?.numTrucks ?? '1');
  const [numMovers, setNumMovers] = useState(lead?.numMovers ?? '2');
  const [hourlyRate, setHourlyRate] = useState(lead?.hourlyRate ?? '180');
  const [volume, setVolume] = useState(lead?.volume ?? '1000');
  const [weight, setWeight] = useState(lead?.weight ?? '7000');
  const [pricePerCuft, setPricePerCuft] = useState(lead?.pricePerCuft ?? '4.50');
  const [pricePerLbs, setPricePerLbs] = useState(lead?.pricePerLbs ?? '0.74');

  const [travelTime, setTravelTime] = useState(lead?.travelTime ?? '1.00 h');
  const [showTravelTimeDropdown, setShowTravelTimeDropdown] = useState(false);

  // For "Hourly Rate" => a 'Work time minimum' dropdown,
  // For "Volume Based" => "Minimum Cuft" input,
  // For "Weight Based" => "Minimum Lbs" input
  const [movingMin, setMovingMin] = useState(lead?.movingMin ?? '3h');
  const [showMovingMinDropdown, setShowMovingMinDropdown] = useState(false);

  // For "Minimum Cuft"
  const [minimumCuft, setMinimumCuft] = useState(lead?.minimumCuft ?? '0.00');
  function handleMinimumCuftChange(e) {
    let val = e.target.value;
    val = val.replace(/[^0-9.]/g, '');
    const parts = val.split('.');
    if (parts.length > 2) {
      val = parts[0] + '.' + parts[1];
    }
    const [intPart, fracPart] = val.split('.');
    if (fracPart?.length > 2) {
      val = intPart + '.' + fracPart.slice(0, 2);
    }
    if (!val) val = '0.00';
    setMinimumCuft(val);
    // Also update the lead
    if (onLeadUpdated) {
      onLeadUpdated({ ...lead, minimumCuft: val });
    }
  }

  // For "Minimum Lbs"
  const [minimumLbs, setMinimumLbs] = useState(lead?.minimumLbs ?? '0');
  function handleMinimumLbsChange(e) {
    let val = e.target.value.replace(/\D+/g, '');
    if (!val) val = '0';
    setMinimumLbs(val);
    if (onLeadUpdated) {
      onLeadUpdated({ ...lead, minimumLbs: val });
    }
  }

  // For volume/weight => pickupWindow, earliestDeliveryDate, deliveryWindow
  const [pickupWindow, setPickupWindow] = useState(lead?.pickupWindow ?? '1 day');
  const [showPickupWindowDropdown, setShowPickupWindowDropdown] = useState(false);

  const [earliestDeliveryDate, setEarliestDeliveryDate] = useState(lead?.earliestDeliveryDate ?? '');
    const [showEarliestDeliveryCalendar, setShowEarliestDeliveryCalendar] = useState(false);
  const earliestCalRef = useRef(null);

  const [deliveryWindow, setDeliveryWindow] = useState(lead?.deliveryWindow ?? '7 days');
  const [showDeliveryWindowDropdown, setShowDeliveryWindowDropdown] = useState(false);

  // "Work time" => minHours, maxHours (only for Hourly)
  const [minHours, setMinHours] = useState(lead?.minHours ?? '1.00 h');
  const [maxHours, setMaxHours] = useState(lead?.maxHours ?? '2.00 h');
  const [showMinHoursDropdown, setShowMinHoursDropdown] = useState(false);
  const [showMaxHoursDropdown, setShowMaxHoursDropdown] = useState(false);
  const [showWorkTimeDetails, setShowWorkTimeDetails] = useState(false);

  // =========== PACKING day fields ===========
  // Only relevant if lead.hasPackingDay === true
  const [numPackers, setNumPackers] = useState(lead?.numPackers ?? '2');
  const [packingHourlyRate, setPackingHourlyRate] = useState(lead?.packingHourlyRate ?? '120');
  const [packingTravelTime, setPackingTravelTime] = useState(lead?.packingTravelTime ?? '0.45 h');
  const [showPackingTravelTimeDropdown, setShowPackingTravelTimeDropdown] = useState(false);

  const [packingMinimum, setPackingMinimum] = useState(lead?.packingMinimum ?? '2h');
  const [showPackingMinDropdown, setShowPackingMinDropdown] = useState(false);

  // "Packers Work time"
  const [packingMinHours, setPackingMinHours] = useState(lead?.packingMinHours ??'1.00 h');
  const [packingMaxHours, setPackingMaxHours] = useState(lead?.packingMaxHours ??'2.00 h');
  const [showPackingMinHoursDropdown, setShowPackingMinHoursDropdown] = useState(false);
  const [showPackingMaxHoursDropdown, setShowPackingMaxHoursDropdown] = useState(false);
  const [showPackingDetails, setShowPackingDetails] = useState(false);

  // Determine if "Hourly", "Volume", or "Weight"
  const isHourly = rateType === 'Hourly Rate';
  const isVolume = rateType === 'Volume Based';
  const isWeight = rateType === 'Weight Based';
  // ---------- Handlers for onChange => update lead in parent ----------

  function handleUpdateLeadField(fieldName, value) {
    if (onLeadUpdated) {
      onLeadUpdated({
        ...lead,
        [fieldName]: value,
      });
    }
  }

  // MOVING numeric handlers

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
    handleUpdateLeadField('pricePerLbs', val || '0');
  }
  function handlePricePerLbsChange(e) {
    let val = e.target.value.replace(/[^0-9.]/g, '');
    setPricePerLbs(val || '0');
  }

  // For the old clamp min/max hours => MOVING (Hourly)
    function handleSelectMinHours(label) {
    setMinHours(label);
    handleUpdateLeadField('minHours', label);

    const minValue = parseQuarterHours(label);
    const maxValue = parseQuarterHours(maxHours);
    if (maxValue < minValue) {
      setMaxHours(label);
      handleUpdateLeadField('maxHours', label);
    }
  }
  function handleSelectMaxHours(label) {
    setMaxHours(label);
    handleUpdateLeadField('maxHours', label);

    const newMaxValue = parseQuarterHours(label);
    const minValue = parseQuarterHours(minHours);
    if (newMaxValue < minValue) {
      setMinHours(label);
      handleUpdateLeadField('minHours', label);
    }
  }

  // PACKING numeric handlers
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

  // clamp min/max for packing
  function handleSelectPackingMinHours(label) {
    setPackingMinHours(label);
    handleUpdateLeadField('packingMinHours', label);

    const minValue = parseQuarterHours(label);
    const maxValue = parseQuarterHours(packingMaxHours);
    if (maxValue < minValue) {
      setPackingMaxHours(label);
      handleUpdateLeadField('packingMaxHours', label);
    }
  }
  function handleSelectPackingMaxHours(label) {
    setPackingMaxHours(label);
    handleUpdateLeadField('packingMaxHours', label);

    const newMaxValue = parseQuarterHours(label);
    const minValue = parseQuarterHours(packingMinHours);
    if (newMaxValue < minValue) {
      setPackingMinHours(label);
      handleUpdateLeadField('packingMinHours', label);
    }
  }

  // ---------- Calendar for earliestDeliveryDate ----------
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
    const dateStr = dateObj.toDateString();
    setEarliestDeliveryDate(dateStr);
    setShowEarliestDeliveryCalendar(false);
    handleUpdateMovingDay({ earliestDeliveryDate: dateStr });
    }

    const formattedEarliestDeliveryDate = earliestDeliveryDate ? formatDate(earliestDeliveryDate) : 'Select';

  // ---------- Close all dropdowns if user clicks outside ----------

  useEffect(() => {
    function handleClickOutside(e) {
            // Rate Type
      if (
        showRateTypeDropdown &&
        rateTypeDropdownRef.current &&
        !rateTypeDropdownRef.current.contains(e.target)
      ) {
        setShowRateTypeDropdown(false);
      }
            
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

  // Determine if we are showing "Moving" or "Packing" (only if hasPackingDay)
  const showMovingSection = !hasPackingDay || activeDay === 'Moving';
  const showPackingSection = hasPackingDay && activeDay === 'Packing';

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
        style={{ minHeight: movingHeight ? `${movingHeight}px` : 'auto' }}
      >
        {/* "Add Packing Day" or highlight "Moving"/"Packing" */}
          <div className={styles.packingDayWrapper}>
          <PackingDay
              lead={lead}
              onDaySelected={(day) => {
                setActiveDay(day);
                // Optionally store the activeDay in the lead
                if (onLeadUpdated) {
                  onLeadUpdated({ ...lead, activeDay: day });
                }
              }}
              onLeadUpdated={onLeadUpdated} // so that "hasPackingDay" can be toggled
            />
          </div>

          <div className={styles.extraInputsContainer}>
            {/* ================= MOVING SECTION ================= */}
            <div
              ref={movingSectionRef}
              style={{ display: showMovingSection ? 'block' : 'none' }}
            >
              {/* Rate Type dropdown */}
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
                    <Icon name="UnfoldMore" className={styles.dropdownIcon} />
                  </button>

                  {showRateTypeDropdown && (
                    <ul className={styles.rateTypeDropdown}>
                      {RATE_TYPE_OPTIONS.map((opt) => {
                        const isSelected = opt === rateType;
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
                    onClick={(evt) => {
                      evt.stopPropagation();
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
                              className={
                                isSelected
                                  ? `${styles.rateTypeOption} ${styles.selectedOption}`
                                  : styles.rateTypeOption
                              }
                              onClick={(e) => {
                                e.stopPropagation();
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

              {isHourly && (
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
                    <Icon name="UnfoldMore" className={styles.dropdownIcon} />
                    {showMovingMinDropdown && (
                      <ul className={styles.rateTypeDropdown}>
                        {MOVING_MINIMUM_OPTIONS.map((opt) => {
                          const isSelected = opt === movingMin;
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
              {(isVolume || isWeight) && (
                <div className={styles.row} style={{ flexDirection: 'column', gap: '10px' }}>
                  <div
                    className={styles.logisticsButton}
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
                              className={
                                isSelected
                                  ? `${styles.rateTypeOption} ${styles.selectedOption}`
                                  : styles.rateTypeOption
                              }
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

                  <div
                    className={styles.logisticsButton}
                    style={{ position: 'relative' }}
                    onClick={(evt) => {
                      evt.stopPropagation();
                      setShowEarliestDeliveryCalendar((p) => !p);
                    }}
                  >
                    <div className={styles.dropdownLabel}>
                      <span className={styles.dropdownPrefix}>Earliest Del.:</span>
                      <span className={styles.dropdownSelected}>
                      {formattedEarliestDeliveryDate}
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
                                className={
                                  isSelected
                                    ? `${styles.calendarDay} ${styles.selectedDay}`
                                    : styles.calendarDay
                                }
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
                              className={
                                isSelected
                                  ? `${styles.rateTypeOption} ${styles.selectedOption}`
                                  : styles.rateTypeOption
                              }
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
            {isHourly && (
                <>
                <div className={styles.divider}></div>
                  <div className={styles.workTimeHeadline}>Work time</div>
                  <div className={styles.row} style={{ flexDirection: 'column', gap: '10px' }}>
                    <div
                      className={styles.logisticsButton}
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
                                className={
                                  isSelected
                                    ? `${styles.rateTypeOption} ${styles.selectedOption}`
                                    : styles.rateTypeOption
                                }
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
                      className={styles.logisticsButton}
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
                                className={
                                  isSelected
                                    ? `${styles.rateTypeOption} ${styles.selectedOption}`
                                    : styles.rateTypeOption
                                }
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
            {/* ================= PACKING SECTION ================= */}
            {showPackingSection && (
              <div style={{ marginTop: '20px' }}>
                {/* (We removed the old divider) */}

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
                                  className={
                                    isSelected
                                      ? `${styles.rateTypeOption} ${styles.selectedOption}`
                                      : styles.rateTypeOption
                                  }
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
                        className={styles.logisticsButton}
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
                                  className={
                                    isSelected
                                      ? `${styles.rateTypeOption} ${styles.selectedOption}`
                                      : styles.rateTypeOption
                                  }
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
                    className={styles.logisticsButton}
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
                              className={
                                isSelected
                                  ? `${styles.rateTypeOption} ${styles.selectedOption}`
                                  : styles.rateTypeOption
                              }
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
                    className={styles.logisticsButton}
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
                              className={
                                isSelected
                                  ? `${styles.rateTypeOption} ${styles.selectedOption}`
                                  : styles.rateTypeOption
                              }
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
