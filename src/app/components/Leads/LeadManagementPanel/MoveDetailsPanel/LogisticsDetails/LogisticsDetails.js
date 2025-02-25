import React, { useState, useRef, useEffect } from 'react';
import styles from './LogisticsDetails.module.css';

// Icon for dropdown only
import UnfoldMoreIcon from '../../../../../assets/icons/unfoldmore.svg';
import PackingDay from './PackingDay/PackingDay';

// Rate Type and Truck Size Options
const RATE_TYPE_OPTIONS = ['Hourly Rate', 'Volume Based', 'Weight Based'];
const TRUCK_SIZE_OPTIONS = ['12 ft', '16 ft', '22 ft', '26 ft', '28 ft', '48 ft', '53 ft'];

function LogisticsDetails({ lead, onLeadUpdated, isCollapsed, setIsCollapsed }) {
  const toggleCollapse = () => setIsCollapsed((prev) => !prev);

  // ================ RATE TYPE DROPDOWN ================
  const [rateType, setRateType] = useState('Hourly Rate');
  const [showRateTypeDropdown, setShowRateTypeDropdown] = useState(false);
  const rateTypeDropdownRef = useRef(null);

  // ================ TRUCK SIZE DROPDOWN ================
  const [truckSize, setTruckSize] = useState('26 ft');
  const [showTruckSizeDropdown, setShowTruckSizeDropdown] = useState(false);
  const truckSizeDropdownRef = useRef(null);

  // ================ Editable Fields ================
  // We'll store them as strings internally for easy formatting
  const [numTrucks, setNumTrucks] = useState('1');           // integer only
  const [numMan, setNumMan] = useState('2');                 // integer only
  const [hourlyRate, setHourlyRate] = useState('180');       // will display as $180
  const [volume, setVolume] = useState('1000');              // display as "1000 cuft"
  const [weight, setWeight] = useState('7000');              // display as "7000 lbs"
  const [pricePerCuft, setPricePerCuft] = useState('4.50');  // display as $4.50
  const [pricePerLbs, setPricePerLbs] = useState('0.74');    // display as $0.74

  // ================ Expand/Collapse "Details" ================
  const [showWorkTimeDetails, setShowWorkTimeDetails] = useState(false);

  // Close dropdowns if user clicks outside
  useEffect(() => {
    function handleClickOutside(e) {
      if (
        showRateTypeDropdown &&
        rateTypeDropdownRef.current &&
        !rateTypeDropdownRef.current.contains(e.target)
      ) {
        setShowRateTypeDropdown(false);
      }
      if (
        showTruckSizeDropdown &&
        truckSizeDropdownRef.current &&
        !truckSizeDropdownRef.current.contains(e.target)
      ) {
        setShowTruckSizeDropdown(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showRateTypeDropdown, showTruckSizeDropdown]);

  // ============== HANDLERS ==============
  // Toggle Rate Type dropdown
  const handleToggleRateTypeDropdown = () => {
    setShowRateTypeDropdown((prev) => !prev);
    setShowTruckSizeDropdown(false);
  };
  const handleSelectRateType = (option) => {
    setRateType(option);
    setShowRateTypeDropdown(false);
  };

  // Toggle Truck Size dropdown
  const handleToggleTruckSizeDropdown = () => {
    setShowTruckSizeDropdown((prev) => !prev);
    setShowRateTypeDropdown(false);
  };
  const handleSelectTruckSize = (option) => {
    setTruckSize(option);
    setShowTruckSizeDropdown(false);
  };

  // For each numeric input => select all onFocus, numeric validation onChange
  // Number of Trucks => integer only
  const handleNumTrucksFocus = (e) => e.target.select();
  const handleNumTrucksChange = (e) => {
    let val = e.target.value.replace(/\D+/g, ''); // strip non-digits
    if (!val) val = '0'; // or empty
    setNumTrucks(val);
  };

  // Number of Man => integer only
  const handleNumManFocus = (e) => e.target.select();
  const handleNumManChange = (e) => {
    let val = e.target.value.replace(/\D+/g, '');
    if (!val) val = '0';
    setNumMan(val);
  };

  // Hourly Rate => prefix with $, integer or decimal
  // We'll store as string of numeric, show as $<value>
  const handleHourlyRateFocus = (e) => e.target.select();
  const handleHourlyRateChange = (e) => {
    // allow digits plus optional decimal + digits
    let val = e.target.value.replace(/[^0-9.]/g, '');
    // optionally strip multiple decimals
    const parts = val.split('.');
    if (parts.length > 2) {
      // if user typed multiple periods, we keep only first
      val = parts[0] + '.' + parts.slice(1).join('');
    }
    setHourlyRate(val || '0');
  };

  // Volume => always "number" + " cuft"
  const handleVolumeFocus = (e) => e.target.select();
  const handleVolumeChange = (e) => {
    let val = e.target.value.replace(/\D+/g, '');
    if (!val) val = '0';
    setVolume(val);
  };

  // Weight => always "number" + " lbs"
  const handleWeightFocus = (e) => e.target.select();
  const handleWeightChange = (e) => {
    let val = e.target.value.replace(/\D+/g, '');
    if (!val) val = '0';
    setWeight(val);
  };

  // Price per Cuft => $ + up to 2 decimals
  const handlePricePerCuftFocus = (e) => e.target.select();
  const handlePricePerCuftChange = (e) => {
    let val = e.target.value.replace(/[^0-9.]/g, '');
    // limit to single decimal point
    const parts = val.split('.');
    if (parts.length > 2) {
      val = parts[0] + '.' + parts.slice(1).join('');
    }
    // limit to 2 decimals
    if (parts[1] && parts[1].length > 2) {
      parts[1] = parts[1].slice(0,2);
      val = parts.join('.');
    }
    setPricePerCuft(val || '0');
  };

  // Price per lbs => $ + up to 2 decimals
  const handlePricePerLbsFocus = (e) => e.target.select();
  const handlePricePerLbsChange = (e) => {
    let val = e.target.value.replace(/[^0-9.]/g, '');
    // limit to single decimal point
    const parts = val.split('.');
    if (parts.length > 2) {
      val = parts[0] + '.' + parts.slice(1).join('');
    }
    // limit to 2 decimals
    if (parts[1] && parts[1].length > 2) {
      parts[1] = parts[1].slice(0,2);
      val = parts.join('.');
    }
    setPricePerLbs(val || '0');
  };

  const toggleWorkTimeDetails = () => {
    setShowWorkTimeDetails((prev) => !prev);
  };

  // Conditionals for Rate Type
  const isHourly = rateType === 'Hourly Rate';
  const isVolume = rateType === 'Volume Based';
  const isWeight = rateType === 'Weight Based';

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
          {/* 1) Packing Day */}
          <div className={styles.packingDayWrapper}>
            <PackingDay />
          </div>

          <div className={styles.extraInputsContainer}>

            {/* 2) Rate Type dropdown */}
            <div className={styles.row}>
              <div
                className={styles.rateTypeWrapper}
                style={{ position: 'relative', width: '100%' }}
                ref={rateTypeDropdownRef}
              >
                <button
                  type="button"
                  className={styles.logisticsButton}
                  onClick={handleToggleRateTypeDropdown}
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
                      const isSelected = opt === rateType;
                      return (
                        <li
                          key={opt}
                          className={`${styles.rateTypeOption} ${
                            isSelected ? styles.selectedOption : ''
                          }`}
                          onClick={() => handleSelectRateType(opt)}
                        >
                          {opt}
                        </li>
                      );
                    })}
                  </ul>
                )}
              </div>
            </div>

            {/* 3) Truck Size dropdown */}
            <div className={styles.row}>
              <div
                className={styles.truckSizeWrapper}
                style={{ position: 'relative', width: '100%' }}
                ref={truckSizeDropdownRef}
              >
                <button
                  type="button"
                  className={styles.logisticsButton}
                  onClick={handleToggleTruckSizeDropdown}
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
                      const isSelected = opt === truckSize;
                      return (
                        <li
                          key={opt}
                          className={`${styles.rateTypeOption} ${
                            isSelected ? styles.selectedOption : ''
                          }`}
                          onClick={() => handleSelectTruckSize(opt)}
                        >
                          {opt}
                        </li>
                      );
                    })}
                  </ul>
                )}
              </div>
            </div>

            {/* 4) Number of Trucks, Number of Man, Hourly Rate (conditional) */}
            <div className={styles.row}>
              {/* Number of Trucks => integer-only input, no icon */}
              <div className={styles.logisticsInputContainer}>
                <span className={styles.inputPrefix}>Number of Trucks:</span>
                <input
                  className={styles.logisticsInput}
                  value={numTrucks}
                  onFocus={handleNumTrucksFocus}
                  onChange={handleNumTrucksChange}
                />
              </div>

              {/* Number of Man => integer-only input */}
              <div className={styles.logisticsInputContainer}>
                <span className={styles.inputPrefix}>Number of Man:</span>
                <input
                  className={styles.logisticsInput}
                  value={numMan}
                  onFocus={handleNumManFocus}
                  onChange={handleNumManChange}
                />
              </div>

              {/* Hourly Rate => only if Hourly Rate selected */}
              {isHourly && (
                <div className={styles.logisticsInputContainer}>
                  <span className={styles.inputPrefix}>Hourly Rate:</span>
                  <input
                    className={styles.logisticsInput}
                    value={hourlyRate}
                    onFocus={handleHourlyRateFocus}
                    onChange={handleHourlyRateChange}
                  />
                  <span className={styles.inputSuffixDollar}>$</span>
                </div>
              )}
            </div>

            {/* 5) Volume, Weight, Price per Cuft, Price per lbs */}
            <div className={styles.row}>
              {/* Volume => all rate types => integer + " cuft" */}
              {(isHourly || isVolume || isWeight) && (
                <div className={styles.logisticsInputContainer}>
                  <span className={styles.inputPrefix}>Volume:</span>
                  <input
                    className={styles.logisticsInput}
                    value={volume}
                    onFocus={handleVolumeFocus}
                    onChange={handleVolumeChange}
                  />
                  <span className={styles.inputSuffix}>cuft</span>
                </div>
              )}

              {/* Weight => all rate types => integer + " lbs" */}
              {(isHourly || isVolume || isWeight) && (
                <div className={styles.logisticsInputContainer}>
                  <span className={styles.inputPrefix}>Weight:</span>
                  <input
                    className={styles.logisticsInput}
                    value={weight}
                    onFocus={handleWeightFocus}
                    onChange={handleWeightChange}
                  />
                  <span className={styles.inputSuffix}>lbs</span>
                </div>
              )}

              {/* Price per Cuft => only if Volume => $ + up to 2 decimals */}
              {isVolume && (
                <div className={styles.logisticsInputContainer}>
                  <span className={styles.inputPrefix}>Price/Cuft:</span>
                  <input
                    className={styles.logisticsInput}
                    value={pricePerCuft}
                    onFocus={handlePricePerCuftFocus}
                    onChange={handlePricePerCuftChange}
                  />
                  <span className={styles.inputSuffixDollar}>$</span>
                </div>
              )}

              {/* Price per Lbs => only if Weight => $ + up to 2 decimals */}
              {isWeight && (
                <div className={styles.logisticsInputContainer}>
                  <span className={styles.inputPrefix}>Price/lbs:</span>
                  <input
                    className={styles.logisticsInput}
                    value={pricePerLbs}
                    onFocus={handlePricePerLbsFocus}
                    onChange={handlePricePerLbsChange}
                  />
                  <span className={styles.inputSuffixDollar}>$</span>
                </div>
              )}
            </div>

            {/* 6) Travel Time => only if Hourly Rate */}
            {isHourly && (
              <div className={styles.row}>
                <div className={styles.logisticsInputContainer}>
                  <span className={styles.inputPrefix}>Travel Time:</span>
                  <input
                    className={styles.logisticsInput}
                    value="1h" /* example, you can refine later */
                    onFocus={(e) => e.target.select()}
                    onChange={() => {}}
                  />
                </div>
              </div>
            )}

            {/* 7) Moving minimum => shown in all rate types */}
            <div className={styles.row}>
              <div className={styles.logisticsInputContainer}>
                <span className={styles.inputPrefix}>Moving minimum:</span>
                <input
                  className={styles.logisticsInput}
                  value="3h" /* example, refine or make numeric? */
                  onFocus={(e) => e.target.select()}
                  onChange={() => {}}
                />
              </div>
            </div>

            {/* 8) Pickup window, Earliest Delivery Date, Delivery Window => if Volume or Weight */}
            {(isVolume || isWeight) && (
              <div className={styles.row}>
                <div className={styles.logisticsInputContainer}>
                  <span className={styles.inputPrefix}>Pickup window:</span>
                  <input
                    className={styles.logisticsInput}
                    value="2 days"
                    onFocus={(e) => e.target.select()}
                    onChange={() => {}}
                  />
                </div>

                <div className={styles.logisticsInputContainer}>
                  <span className={styles.inputPrefix}>Earliest Delivery Date:</span>
                  <input
                    className={styles.logisticsInput}
                    value="03/28/2025"
                    onFocus={(e) => e.target.select()}
                    onChange={() => {}}
                  />
                </div>

                <div className={styles.logisticsInputContainer}>
                  <span className={styles.inputPrefix}>Delivery Window:</span>
                  <input
                    className={styles.logisticsInput}
                    value="7 days"
                    onFocus={(e) => e.target.select()}
                    onChange={() => {}}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Divider */}
          <div className={styles.divider} />

          {/* Work time => only if Hourly Rate */}
          {isHourly && (
            <>
              <div className={styles.workTimeHeadline}>Work time</div>
              <div className={styles.workTimeRow}>
                <div className={styles.logisticsInputContainer}>
                  <span className={styles.inputPrefix}>Min. hours:</span>
                  <input
                    className={styles.logisticsInput}
                    value="3:15"
                    onFocus={(e) => e.target.select()}
                    onChange={() => {}}
                  />
                </div>

                <div className={styles.logisticsInputContainer}>
                  <span className={styles.inputPrefix}>Max. hours:</span>
                  <input
                    className={styles.logisticsInput}
                    value="4:30"
                    onFocus={(e) => e.target.select()}
                    onChange={() => {}}
                  />
                </div>
              </div>
            </>
          )}

          {/* "Details" button always visible */}
          <div className={styles.detailsRow}>
            <button
              type="button"
              className={styles.detailsButton}
              onClick={toggleWorkTimeDetails}
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
              <p>This is some dummy expanded detail about the work time.</p>
              <p>You could store these new input values in the lead object if desired.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default LogisticsDetails;
