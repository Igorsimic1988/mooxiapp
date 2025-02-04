// src/components/Leads/LeadManagementPanel/MoveDetailsPanel/OriginDetails/OriginDetails.js

import React, { useEffect, useState, useRef } from 'react';
import { ReactComponent as LocationIcon } from '../../../../../assets/icons/location.svg';
import { ReactComponent as PlaceIcon } from '../../../../../assets/icons/place1.svg';
import { ReactComponent as AccessIcon } from '../../../../../assets/icons/access1.svg';
import { ReactComponent as ServicesIcon } from '../../../../../assets/icons/services1.svg';
import { ReactComponent as UnfoldMoreIcon } from '../../../../../assets/icons/unfoldmore.svg';
import { ReactComponent as MyInventoryIcon } from '../../../../../assets/icons/myinventory.svg';

import SimpleToggle from '../../../SimpleToggle/SimpleToggle';
import styles from './OriginDetails.module.css';

// The three popups
import PlacePopup from './PlacePopup/PlacePopup';
import AccessPopup from './AccessPopup/AccessPopup';
import ServicesPopup from './ServicesPopup/ServicesPopup';

// Reusable row of stops
import MainAndStopOffs from './MainAndStopOffs/MainAndStopOffs';

/** Generate 15-min increments from 7:00 AM to 12:00 AM, excluding midnight duplication */
function generateTimeOptions() {
  const times = [];
  let startMinutes = 7 * 60; // 7:00 AM
  const endMinutes = 24 * 60; // 1440

  while (startMinutes < endMinutes) {
    const hh = Math.floor(startMinutes / 60);
    const mm = startMinutes % 60;
    const suffix = hh >= 12 ? 'PM' : 'AM';
    let displayHour = hh % 12;
    if (displayHour === 0) displayHour = 12;
    const displayMin = String(mm).padStart(2, '0');
    times.push(`${displayHour}:${displayMin} ${suffix}`);

    startMinutes += 15;
  }
  return times;
}

function OriginDetails({ lead, onLeadUpdated, onShowInventory }) {
  // ---------- ORIGIN STOPS ----------
  const [selectedStopIndex, setSelectedStopIndex] = useState(0);

  // Collapsible
  const [isCollapsed, setIsCollapsed] = useState(false);
  const toggleCollapse = () => setIsCollapsed((prev) => !prev);

  // ---------- TIME RESTRICTIONS UI ----------
  const timeRestrictionOptions = ['Not allowed', 'Allowed'];
  const timeRestrictionTypes = [
    'Elevator Usage',
    'Place Access',
    'Operating Hours',
    'Permit Requests',
    'Personal Plans',
    'Loading Zone',
    'Parking Zone',
    'Community Rules',
    'Other',
  ];
  const timeOptions = generateTimeOptions();

  // ---------- POPUPS ----------
  const [isPlacePopupOpen, setIsPlacePopupOpen] = useState(false);
  const [isAccessPopupOpen, setIsAccessPopupOpen] = useState(false);
  const [isServicesPopupOpen, setIsServicesPopupOpen] = useState(false);

  // ---------- ENSURE ORIGIN/DEST STOPS EXIST ----------
  useEffect(() => {
    if (!Array.isArray(lead.originStops) || lead.originStops.length === 0) {
      const defaultStops = [
        {
          label: 'Main Address',
          address: '',
          apt: '',
          city: '',
          state: '',
          zip: '',
          timeRestrictions: {
            isEnabled: false,
            option: 'Select',
            restrictionType: 'Select',
            startTime: '',
            endTime: '',
          },
        },
      ];
      onLeadUpdated({ ...lead, originStops: defaultStops });
    }

    if (!Array.isArray(lead.destinationStops)) {
      onLeadUpdated({
        ...lead,
        destinationStops: [
          {
            label: 'Main Address',
            address: '',
            apt: '',
            city: '',
            state: '',
            zip: '',
          },
        ],
      });
    }
  }, [lead, onLeadUpdated]);

  // ---------- Current Stop ----------
  const originStops = lead.originStops || [];
  const currentStop = originStops[selectedStopIndex] || {};

  /**
   * PLACE => remove dotted if typeOfPlace, moveSize, howManyStories all set
   */
  function isPlaceDataComplete(stop) {
    return (
      stop.typeOfPlace?.trim() &&
      stop.moveSize?.trim() &&
      stop.howManyStories?.trim()
    );
  }

  /**
   * ACCESS => remove dotted if parkingAccess, distanceDoorTruck, howManySteps are set
   */
  function isAccessDataComplete(stop) {
    return (
      stop.parkingAccess?.trim() &&
      stop.distanceDoorTruck?.trim() &&
      stop.howManySteps?.trim()
    );
  }

  /**
   * SERVICES => remove dotted if packingOption is set
   * (per your request: "for the dotted line to disappear on SERVICES there should be the input in packingOption")
   */
  function isServicesDataComplete(stop) {
    return !!stop.packingOption?.trim();
  }

  // If user changes an address field => update that stop
  const handleStopFieldChange = (fieldName, newValue) => {
    const updatedStops = [...originStops];
    const stopCopy = { ...updatedStops[selectedStopIndex] };
    stopCopy[fieldName] = newValue;
    updatedStops[selectedStopIndex] = stopCopy;
    onLeadUpdated({ ...lead, originStops: updatedStops });
  };

  // ---------- Time restrictions ----------
  function getCurrentStopRestrictions() {
    if (!currentStop.timeRestrictions) {
      return {
        isEnabled: false,
        option: 'Select',
        restrictionType: 'Select',
        startTime: '',
        endTime: '',
      };
    }
    return currentStop.timeRestrictions;
  }
  const currentTR = getCurrentStopRestrictions();

  const optionDropdownRef = useRef(null);
  const typeDropdownRef = useRef(null);
  const startDropdownRef = useRef(null);
  const endDropdownRef = useRef(null);

  const [optionDropdownOpen, setOptionDropdownOpen] = useState(false);
  const [typeDropdownOpen, setTypeDropdownOpen] = useState(false);
  const [startDropdownOpen, setStartDropdownOpen] = useState(false);
  const [endDropdownOpen, setEndDropdownOpen] = useState(false);

  useEffect(() => {
    function handleClickOutside(e) {
      if (optionDropdownOpen && optionDropdownRef.current && !optionDropdownRef.current.contains(e.target)) {
        setOptionDropdownOpen(false);
      }
      if (typeDropdownOpen && typeDropdownRef.current && !typeDropdownRef.current.contains(e.target)) {
        setTypeDropdownOpen(false);
      }
      if (startDropdownOpen && startDropdownRef.current && !startDropdownRef.current.contains(e.target)) {
        setStartDropdownOpen(false);
      }
      if (endDropdownOpen && endDropdownRef.current && !endDropdownRef.current.contains(e.target)) {
        setEndDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [
    optionDropdownOpen,
    typeDropdownOpen,
    startDropdownOpen,
    endDropdownOpen
  ]);

  const updateCurrentStopRestrictions = (partialObj) => {
    const updatedStops = [...originStops];
    const stopCopy = { ...updatedStops[selectedStopIndex] };

    let tr = stopCopy.timeRestrictions || {
      isEnabled: false,
      option: 'Select',
      restrictionType: 'Select',
      startTime: '',
      endTime: '',
    };
    tr = { ...tr, ...partialObj };
    stopCopy.timeRestrictions = tr;

    updatedStops[selectedStopIndex] = stopCopy;
    onLeadUpdated({ ...lead, originStops: updatedStops });
  };

  const handleToggleTimeRestrictions = (value) => {
    updateCurrentStopRestrictions({ isEnabled: value });
  };
  const handleSelectTimeRestrictionsOption = (opt) => {
    setOptionDropdownOpen(false);
    updateCurrentStopRestrictions({ option: opt });
  };
  const handleSelectTimeRestrictionsType = (typ) => {
    setTypeDropdownOpen(false);
    updateCurrentStopRestrictions({ restrictionType: typ });
  };
  const handleSelectTimeRestrictionsStart = (startVal) => {
    setStartDropdownOpen(false);
    updateCurrentStopRestrictions({ startTime: startVal });
  };
  const handleSelectTimeRestrictionsEnd = (endVal) => {
    setEndDropdownOpen(false);
    updateCurrentStopRestrictions({ endTime: endVal });
  };

  /**
   * PLACE Summary
   * -------------
   * line1 => typeOfPlace
   * line2 => moveSize - howManyStories
   * line3 => features + "COI"
   */
  function renderPlaceSummary(stop) {
    const { typeOfPlace, moveSize, howManyStories, features, needsCOI } = stop || {};

    // line1
    const line1 = typeOfPlace?.trim() || '';
    // line2
    let line2 = '';
    if (moveSize?.trim() && howManyStories?.trim()) {
      line2 = `${moveSize} - ${howManyStories}`;
    } else if (moveSize?.trim()) {
      line2 = moveSize;
    } else if (howManyStories?.trim()) {
      line2 = howManyStories;
    }
    // line3
    const feats = Array.isArray(features) ? [...features] : [];
    if (needsCOI) feats.push('COI');
    const line3 = feats.join(', ');

    if (!line1 && !line2 && !line3) return null;

    const lines = [];
    if (line1) lines.push(line1);
    if (line2) lines.push(line2);
    if (line3) lines.push(line3);

    return (
      <div className={styles.placeSummaryContainer}>
        {lines.map((text, idx) => (
          <React.Fragment key={idx}>
            <div className={styles.placeSummaryLine}>{text}</div>
            <div style={{ height: '11px' }} />
            <div className={styles.placeSummaryDivider} />
            <div style={{ height: '9px' }} />
          </React.Fragment>
        ))}
      </div>
    );
  }

  /**
   * ACCESS Summary
   * -------------
   * line1 => biggestTruckAccess + " + shuttle" if shuttleTruckRequired
   * line2 => parkingAccess + ", Elevator" if elevatorAtStop
   * line3 => distanceDoorTruck + ", howManySteps"
   */
  function renderAccessSummary(stop) {
    const {
      biggestTruckAccess,
      shuttleTruckRequired,
      parkingAccess,
      elevatorAtStop,
      distanceDoorTruck,
      howManySteps,
    } = stop || {};

    // line1
    let line1 = biggestTruckAccess?.trim() || '';
    if (line1 && shuttleTruckRequired) {
      line1 += ' + shuttle';
    }

    // line2
    let line2 = parkingAccess?.trim() || '';
    if (line2 && elevatorAtStop) {
      line2 += ', Elevator';
    } else if (!line2 && elevatorAtStop) {
      line2 = 'Elevator';
    }

    // line3
    let line3 = distanceDoorTruck?.trim() || '';
    if (line3 && howManySteps?.trim()) {
      line3 += `, ${howManySteps}`;
    } else if (!line3 && howManySteps?.trim()) {
      line3 = howManySteps;
    }

    if (!line1 && !line2 && !line3) return null;

    const lines = [];
    if (line1) lines.push(line1);
    if (line2) lines.push(line2);
    if (line3) lines.push(line3);

    return (
      <div className={styles.placeSummaryContainer}>
        {lines.map((text, idx) => (
          <React.Fragment key={idx}>
            <div className={styles.placeSummaryLine}>{text}</div>
            <div style={{ height: '11px' }} />
            <div className={styles.placeSummaryDivider} />
            <div style={{ height: '9px' }} />
          </React.Fragment>
        ))}
      </div>
    );
  }

  /**
   * SERVICES Summary
   * ---------------
   * line1 => whatsMoving + ", " + packingOption (if both)
   * line2 => if itemsToBeTakenApart => "Dissasambely", if hoistItems => "Hoisting", if craneNeeded => "Crane"
   * line3 => a list of additionalServices, each prefixed with "+", separated by ", "
   */
  function renderServicesSummary(stop) {
    const {
      whatsMoving,
      packingOption,
      itemsToBeTakenApart,
      hoistItems,
      craneNeeded,
      additionalServices,
    } = stop || {};

    // line1
    let line1 = '';
    if (whatsMoving?.trim() && packingOption?.trim()) {
      line1 = `${whatsMoving}, ${packingOption}`;
    } else if (whatsMoving?.trim()) {
      line1 = whatsMoving;
    } else if (packingOption?.trim()) {
      line1 = packingOption;
    }

    // line2 => from booleans
    const bits = [];
    if (itemsToBeTakenApart) bits.push('Disassembly');
    if (hoistItems) bits.push('Hoisting');
    if (craneNeeded) bits.push('Crane');
    const line2 = bits.join(', ');

    // line3 => additionalServices => each item with a "+" prefix
    let line3 = '';
    if (Array.isArray(additionalServices) && additionalServices.length > 0) {
      const plusList = additionalServices.map((svc) => `+${svc}`);
      line3 = plusList.join(', ');
    }

    // If everything is empty => no summary
    if (!line1 && !line2 && !line3) return null;

    const lines = [];
    if (line1) lines.push(line1);
    if (line2) lines.push(line2);
    if (line3) lines.push(line3);

    return (
      <div className={styles.placeSummaryContainer}>
        {lines.map((text, idx) => (
          <React.Fragment key={idx}>
            <div className={styles.placeSummaryLine}>{text}</div>
            <div style={{ height: '11px' }} />
            <div className={styles.placeSummaryDivider} />
            <div style={{ height: '9px' }} />
          </React.Fragment>
        ))}
      </div>
    );
  }

  // Summaries
  const placeSummaryElement = renderPlaceSummary(currentStop);
  const accessSummaryElement = renderAccessSummary(currentStop);
  const servicesSummaryElement = renderServicesSummary(currentStop);

  // Classes to remove dotted border
  const removeDottedPlace = isPlaceDataComplete(currentStop) ? styles.placeNoDotted : '';
  const removeDottedAccess = isAccessDataComplete(currentStop) ? styles.accessNoDotted : '';
  // Per your request => "for the dotted line to disappear on the SERVICES there should be the input in packingOption"
  const removeDottedServices = isServicesDataComplete(currentStop) ? styles.servicesNoDotted : '';

  return (
    <div className={styles.originContainer}>
      <div className={styles.originHeader}>
        <span className={styles.originTitle}>Origin</span>
        <button className={styles.minusButton} onClick={toggleCollapse}>
          {isCollapsed ? '+' : '-'}
        </button>
      </div>

      {!isCollapsed && (
        <>
          {/* Row of origin stops + plus button */}
          <MainAndStopOffs
            stops={originStops}
            onStopsUpdated={(newStops) => {
              onLeadUpdated({ ...lead, originStops: newStops });
            }}
            selectedStopIndex={selectedStopIndex}
            setSelectedStopIndex={setSelectedStopIndex}
          />

          {/* Address Inputs */}
          <div className={styles.propertySection}>
            <span className={styles.propertyAddressText}>Property Address</span>

            <div className={styles.inputContainer}>
              <input
                type="text"
                className={styles.addressInput}
                placeholder="Property Address"
                value={currentStop.address || ''}
                onChange={(e) => handleStopFieldChange('address', e.target.value)}
              />
              <div className={styles.inputIconContainer}>
                <LocationIcon className={styles.inputIcon} />
              </div>
            </div>

            <div className={styles.twoInputsRow}>
              <div className={styles.inputContainer}>
                <input
                  type="text"
                  className={styles.addressInput}
                  placeholder="Apt/Suite"
                  value={currentStop.apt || ''}
                  onChange={(e) => handleStopFieldChange('apt', e.target.value)}
                />
              </div>
              <div className={styles.inputContainer}>
                <input
                  type="text"
                  className={styles.addressInput}
                  placeholder="City"
                  value={currentStop.city || ''}
                  onChange={(e) => handleStopFieldChange('city', e.target.value)}
                />
              </div>
            </div>

            <div className={styles.twoInputsRow}>
              <div className={styles.inputContainer}>
                <input
                  type="text"
                  className={styles.addressInput}
                  placeholder="State"
                  value={currentStop.state || ''}
                  onChange={(e) => handleStopFieldChange('state', e.target.value)}
                />
              </div>
              <div className={styles.inputContainer}>
                <input
                  type="text"
                  className={styles.addressInput}
                  placeholder="Zip code"
                  value={currentStop.zip || ''}
                  onChange={(e) => handleStopFieldChange('zip', e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Property Info Section */}
          <div className={styles.propertyInfoSection}>
            <span className={styles.propertyText}>Property</span>

            {/* PLACE card => entire area clickable */}
            <div
              className={`${styles.propertyItem} ${styles.propertyItemPlace} ${removeDottedPlace}`}
              onClick={() => {
                setIsPlacePopupOpen(true);
              }}
            >
              <div className={styles.propertyItemLeft}>
                <PlaceIcon className={styles.propertyItemIcon} />
                <span className={styles.propertyItemText}>PLACE</span>
              </div>
              <button
                className={`${styles.propertyItemPlusButton} ${styles.propertyItemPlaceButton}`}
              >
                +
              </button>
            </div>

            {/* The Place Summary */}
            {placeSummaryElement}

            {/* ACCESS => entire area clickable */}
            <div
              className={`${styles.propertyItem} ${styles.propertyItemAccess} ${removeDottedAccess}`}
              onClick={() => {
                setIsAccessPopupOpen(true);
              }}
            >
              <div className={styles.propertyItemLeft}>
                <AccessIcon className={styles.propertyItemIcon} />
                <span className={styles.propertyItemText}>ACCESS</span>
              </div>
              <button
                className={`${styles.propertyItemPlusButton} ${styles.propertyItemAccessButton}`}
              >
                +
              </button>
            </div>

            {/* The Access Summary */}
            {accessSummaryElement}

            {/* SERVICES => entire area clickable */}
            <div
              className={`${styles.propertyItem} ${styles.propertyItemServices} ${removeDottedServices}`}
              onClick={() => {
                setIsServicesPopupOpen(true);
              }}
            >
              <div className={styles.propertyItemLeft}>
                <ServicesIcon className={styles.propertyItemIcon} />
                <span className={styles.propertyItemText}>SERVICES</span>
              </div>
              <button
                className={`${styles.propertyItemPlusButton} ${styles.propertyItemServicesButton}`}
              >
                +
              </button>
            </div>

            {/* The Services Summary */}
            {servicesSummaryElement}
          </div>

          {/* Time Restrictions - per stop */}
          <div className={styles.timeRestrictionsContainer}>
            <div className={styles.timeRestrictionsRow}>
              <span className={styles.timeRestrictionsText}>Time restrictions</span>
              <div className={styles.timeRestrictionsToggle}>
                <SimpleToggle
                  isToggled={currentTR.isEnabled}
                  onToggle={handleToggleTimeRestrictions}
                />
              </div>
            </div>

            {currentTR.isEnabled && (
              <div className={styles.timeRestrictionsContent}>
                <div className={styles.timeRestrictionsInputsColumn}>
                  {/* Option dropdown */}
                  <div
                    className={`${styles.inputContainer} ${styles.dropdownWrapper}`}
                    ref={optionDropdownRef}
                  >
                    <div
                      className={styles.clickableArea}
                      onClick={() => {
                        setOptionDropdownOpen(!optionDropdownOpen);
                        setTypeDropdownOpen(false);
                        setStartDropdownOpen(false);
                        setEndDropdownOpen(false);
                      }}
                    >
                      <span className={styles.inputLabel}>
                        Option:{' '}
                        <span className={styles.inputValueText}>
                          {currentTR.option}
                        </span>
                      </span>
                      <UnfoldMoreIcon className={styles.moreIcon} />
                    </div>
                    {optionDropdownOpen && (
                      <div className={styles.dropdownMenu}>
                        {timeRestrictionOptions.map((opt) => (
                          <div
                            key={opt}
                            className={styles.dropdownOption}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleSelectTimeRestrictionsOption(opt);
                            }}
                          >
                            {opt}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Type dropdown */}
                  <div
                    className={`${styles.inputContainer} ${styles.dropdownWrapper}`}
                    ref={typeDropdownRef}
                  >
                    <div
                      className={styles.clickableArea}
                      onClick={() => {
                        setTypeDropdownOpen(!typeDropdownOpen);
                        setOptionDropdownOpen(false);
                        setStartDropdownOpen(false);
                        setEndDropdownOpen(false);
                      }}
                    >
                      <span className={styles.inputLabel}>
                        Type:{' '}
                        <span className={styles.inputValueText}>
                          {currentTR.restrictionType}
                        </span>
                      </span>
                      <UnfoldMoreIcon className={styles.moreIcon} />
                    </div>
                    {typeDropdownOpen && (
                      <div className={styles.dropdownMenu}>
                        {timeRestrictionTypes.map((typ) => (
                          <div
                            key={typ}
                            className={styles.dropdownOption}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleSelectTimeRestrictionsType(typ);
                            }}
                          >
                            {typ}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Start time dropdown */}
                  <div
                    className={`${styles.inputContainer} ${styles.dropdownWrapper}`}
                    ref={startDropdownRef}
                  >
                    <div
                      className={styles.clickableArea}
                      onClick={() => {
                        setStartDropdownOpen(!startDropdownOpen);
                        setOptionDropdownOpen(false);
                        setTypeDropdownOpen(false);
                        setEndDropdownOpen(false);
                      }}
                    >
                      <span className={styles.inputLabel}>
                        Start time:{' '}
                        <span className={styles.inputValueText}>
                          {currentTR.startTime || 'Select'}
                        </span>
                      </span>
                      <UnfoldMoreIcon className={styles.moreIcon} />
                    </div>
                    {startDropdownOpen && (
                      <div className={styles.dropdownMenu}>
                        {timeOptions.map((t) => (
                          <div
                            key={t}
                            className={styles.dropdownOption}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleSelectTimeRestrictionsStart(t);
                            }}
                          >
                            {t}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* End time dropdown */}
                  <div
                    className={`${styles.inputContainer} ${styles.dropdownWrapper}`}
                    ref={endDropdownRef}
                  >
                    <div
                      className={styles.clickableArea}
                      onClick={() => {
                        setEndDropdownOpen(!endDropdownOpen);
                        setOptionDropdownOpen(false);
                        setTypeDropdownOpen(false);
                        setStartDropdownOpen(false);
                      }}
                    >
                      <span className={styles.inputLabel}>
                        End time:{' '}
                        <span className={styles.inputValueText}>
                          {currentTR.endTime || 'Select'}
                        </span>
                      </span>
                      <UnfoldMoreIcon className={styles.moreIcon} />
                    </div>
                    {endDropdownOpen && (
                      <div className={styles.dropdownMenu}>
                        {timeOptions.map((t) => (
                          <div
                            key={t}
                            className={styles.dropdownOption}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleSelectTimeRestrictionsEnd(t);
                            }}
                          >
                            {t}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Inventory Section */}
          <div className={styles.inventorySection}>
            <span className={styles.inventoryTitle}>Inventory</span>
            <div className={styles.inventoryButtons}>
              <button
                className={styles.inventoryButtonPrimary}
                onClick={onShowInventory}
              >
                <span className={styles.inventoryButtonText}>Inventory</span>
                <MyInventoryIcon className={styles.myInventoryIcon} />
              </button>
              <button className={styles.inventoryButtonSecondary}>
                <span className={styles.inventoryButtonTextSecondary}>
                  Special Handling
                </span>
              </button>
            </div>
          </div>
        </>
      )}

      {/* POPUPS */}
      {isPlacePopupOpen && (
        <PlacePopup
          lead={lead}
          onLeadUpdated={onLeadUpdated}
          setIsPlacePopupVisible={setIsPlacePopupOpen}
          defaultTab="origin"
          defaultStopIndex={selectedStopIndex}
        />
      )}

      {isAccessPopupOpen && (
        <AccessPopup
          lead={lead}
          onLeadUpdated={onLeadUpdated}
          setIsAccessPopupVisible={setIsAccessPopupOpen}
          defaultTab="origin"
          defaultStopIndex={selectedStopIndex}
        />
      )}

      {isServicesPopupOpen && (
        <ServicesPopup
          lead={lead}
          onLeadUpdated={onLeadUpdated}
          setIsServicesPopupVisible={setIsServicesPopupOpen}
          defaultTab="origin"
          defaultStopIndex={selectedStopIndex}
        />
      )}
    </div>
  );
}

export default OriginDetails;
