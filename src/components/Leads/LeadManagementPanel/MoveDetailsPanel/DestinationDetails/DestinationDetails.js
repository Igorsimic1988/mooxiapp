import React, { useEffect, useState, useRef } from 'react';
import { ReactComponent as LocationIcon } from '../../../../../assets/icons/location.svg';
import { ReactComponent as PlaceIcon } from '../../../../../assets/icons/place1.svg';
import { ReactComponent as AccessIcon } from '../../../../../assets/icons/access1.svg';
import { ReactComponent as ServicesIcon } from '../../../../../assets/icons/services1.svg';
import { ReactComponent as UnfoldMoreIcon } from '../../../../../assets/icons/unfoldmore.svg';

import SimpleToggle from '../../../SimpleToggle/SimpleToggle';
import MainAndStopOffs from '../OriginDetails/MainAndStopOffs/MainAndStopOffs';

import PlacePopup from '../OriginDetails/PlacePopup/PlacePopup';
import AccessPopup from '../OriginDetails/AccessPopup/AccessPopup';
import ServicesPopup from '../OriginDetails/ServicesPopup/ServicesPopup';

import styles from './DestinationDetails.module.css';

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

function DestinationDetails({ lead, onLeadUpdated, isStorageToggled }) {
  // ---------- DESTINATION STOPS ----------
  const [selectedStopIndex, setSelectedStopIndex] = useState(0);

  // Collapsible
  const [isCollapsed, setIsCollapsed] = useState(true);
  const toggleCollapse = () => setIsCollapsed((prev) => !prev);

  // Pop-up states -- define them so we won't get "not defined" errors
  const [isPlacePopupOpen, setIsPlacePopupOpen] = useState(false);
  const [isAccessPopupOpen, setIsAccessPopupOpen] = useState(false);
  const [isServicesPopupOpen, setIsServicesPopupOpen] = useState(false);

  // Decide if we should hide normal stops => user selected "All items" in storage
  const hideNormalStops = isStorageToggled && lead.storage_items === 'All items';

  // On mount or toggling => ensure we have a default normal stop + post‐storage if needed
  useEffect(() => {
    if (!Array.isArray(lead.destinationStops) || lead.destinationStops.length === 0) {
      // If no stops at all => create one normal stop
      const defaultStops = [
        {
          label: 'Main Drop off',
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
          postStorage: false,
        },
      ];
      onLeadUpdated({ ...lead, destinationStops: defaultStops });
    } else {
      // If we have some stops, see if we need to create a Post Storage Main Drop off
      // whenever isStorageToggled is true
      if (isStorageToggled) {
        const existing = lead.destinationStops;
        const hasPostStorage = existing.some((s) => s.postStorage === true);
        if (!hasPostStorage) {
          const newStop = {
            label: 'Post Storage Main Drop off',
            address: '',
            apt: '',
            city: '',
            state: '',
            zip: '',
            postStorage: true,
            timeRestrictions: {
              isEnabled: false,
              option: 'Select',
              restrictionType: 'Select',
              startTime: '',
              endTime: '',
            },
          };
          const updated = [...existing, newStop];
          onLeadUpdated({ ...lead, destinationStops: updated });
        }
      }
    }
  }, [lead, onLeadUpdated, isStorageToggled]);

  // If panel is expanded and hideNormalStops is true => auto‐select the first post‐storage stop
  useEffect(() => {
    if (
      !isCollapsed &&
      hideNormalStops &&
      Array.isArray(lead.destinationStops)
    ) {
      const psIndex = lead.destinationStops.findIndex((s) => s.postStorage === true);
      if (psIndex >= 0 && psIndex !== selectedStopIndex) {
        setSelectedStopIndex(psIndex);
      }
    }
  }, [isCollapsed, hideNormalStops, lead.destinationStops, selectedStopIndex]);

  // Gather stops
  const destinationStops = Array.isArray(lead.destinationStops) ? lead.destinationStops : [];
  // The currently selected stop
  const currentStop = destinationStops[selectedStopIndex] || {};

  // Generate time options for restrictions
  const timeOptions = generateTimeOptions();

  // ---------- Functions to check completeness ----------
  function isPlaceDataComplete(stop) {
    return !!(stop.typeOfPlace?.trim() && stop.howManyStories?.trim());
  }
  function isAccessDataComplete(stop) {
    return (
      stop.parkingAccess?.trim() &&
      stop.distanceDoorTruck?.trim() &&
      stop.howManySteps?.trim()
    );
  }
  function isServicesDataComplete(stop) {
    return !!stop.unpackingOption?.trim();
  }

  // For address changes
  function handleStopFieldChange(fieldName, newValue) {
    const updated = [...destinationStops];
    const copy = { ...updated[selectedStopIndex] };
    copy[fieldName] = newValue;
    updated[selectedStopIndex] = copy;
    onLeadUpdated({ ...lead, destinationStops: updated });
  }

  // ---------- Time Restrictions ----------
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

  function updateCurrentStopRestrictions(partialObj) {
    const updated = [...destinationStops];
    const stopCopy = { ...updated[selectedStopIndex] };

    let tr = stopCopy.timeRestrictions || {
      isEnabled: false,
      option: 'Select',
      restrictionType: 'Select',
      startTime: '',
      endTime: '',
    };
    tr = { ...tr, ...partialObj };
    stopCopy.timeRestrictions = tr;

    updated[selectedStopIndex] = stopCopy;
    onLeadUpdated({ ...lead, destinationStops: updated });
  }

  function handleToggleTimeRestrictions(value) {
    updateCurrentStopRestrictions({ isEnabled: value });
  }
  function handleSelectTimeRestrictionsOption(opt) {
    setOptionDropdownOpen(false);
    updateCurrentStopRestrictions({ option: opt });
  }
  function handleSelectTimeRestrictionsType(typ) {
    setTypeDropdownOpen(false);
    updateCurrentStopRestrictions({ restrictionType: typ });
  }
  function handleSelectTimeRestrictionsStart(startVal) {
    setStartDropdownOpen(false);
    updateCurrentStopRestrictions({ startTime: startVal });
  }
  function handleSelectTimeRestrictionsEnd(endVal) {
    setEndDropdownOpen(false);
    updateCurrentStopRestrictions({ endTime: endVal });
  }

  // Summaries
  function renderPlaceSummary(stop) {
    const { typeOfPlace, howManyStories, features, needsCOI } = stop || {};
    const line1 = typeOfPlace?.trim() || '';
    const line2 = howManyStories?.trim() || '';

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
        {lines.map((txt, idx) => (
          <React.Fragment key={idx}>
            <div className={styles.placeSummaryLine}>{txt}</div>
            <div style={{ height: '11px' }} />
            <div className={styles.placeSummaryDivider} />
            <div style={{ height: '9px' }} />
          </React.Fragment>
        ))}
      </div>
    );
  }

  function renderAccessSummary(stop) {
    const {
      biggestTruckAccess,
      shuttleTruckRequired,
      parkingAccess,
      elevatorAtStop,
      distanceDoorTruck,
      howManySteps,
    } = stop || {};

    let line1 = biggestTruckAccess?.trim() || '';
    if (line1 && shuttleTruckRequired) {
      line1 += ' + shuttle';
    }

    let line2 = parkingAccess?.trim() || '';
    if (line2 && elevatorAtStop) {
      line2 += ', Elevator';
    } else if (!line2 && elevatorAtStop) {
      line2 = 'Elevator';
    }

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

  function renderServicesSummary(stop) {
    const {
      unpackingOption,
      itemsToBeAssembled,
      hoistItems,
      craneNeeded,
      additionalServices,
    } = stop || {};

    const line1 = unpackingOption?.trim() || '';

    const line2Parts = [];
    if (itemsToBeAssembled) line2Parts.push('Assembly');
    if (hoistItems) line2Parts.push('Hoisting');
    if (craneNeeded) line2Parts.push('Crane');
    const line2 = line2Parts.join(', ');

    let line3 = '';
    if (Array.isArray(additionalServices) && additionalServices.length) {
      const plusList = additionalServices.map((s) => `+${s}`);
      line3 = plusList.join(', ');
    }

    if (!line1 && !line2 && !line3) return null;

    const lines = [];
    if (line1) lines.push(line1);
    if (line2) lines.push(line2);
    if (line3) lines.push(line3);

    return (
      <div className={styles.placeSummaryContainer}>
        {lines.map((txt, idx) => (
          <React.Fragment key={idx}>
            <div className={styles.placeSummaryLine}>{txt}</div>
            <div style={{ height: '11px' }} />
            <div className={styles.placeSummaryDivider} />
            <div style={{ height: '9px' }} />
          </React.Fragment>
        ))}
      </div>
    );
  }

  const placeSummary = renderPlaceSummary(currentStop);
  const accessSummary = renderAccessSummary(currentStop);
  const servicesSummary = renderServicesSummary(currentStop);

  // Classes to remove dotted borders if certain fields are complete
  const removePlaceDotted = isPlaceDataComplete(currentStop) ? styles.placeNoDotted : '';
  const removeAccessDotted = isAccessDataComplete(currentStop) ? styles.accessNoDotted : '';
  const removeServicesDotted = isServicesDataComplete(currentStop) ? styles.servicesNoDotted : '';

  // States for time restriction dropdowns
  const [optionDropdownOpen, setOptionDropdownOpen] = useState(false);
  const [typeDropdownOpen, setTypeDropdownOpen] = useState(false);
  const [startDropdownOpen, setStartDropdownOpen] = useState(false);
  const [endDropdownOpen, setEndDropdownOpen] = useState(false);

  // Refs for outside click detection
  const optionRef = useRef(null);
  const typeRef = useRef(null);
  const startRef = useRef(null);
  const endRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(e) {
      if (optionDropdownOpen && optionRef.current && !optionRef.current.contains(e.target)) {
        setOptionDropdownOpen(false);
      }
      if (typeDropdownOpen && typeRef.current && !typeRef.current.contains(e.target)) {
        setTypeDropdownOpen(false);
      }
      if (startDropdownOpen && startRef.current && !startRef.current.contains(e.target)) {
        setStartDropdownOpen(false);
      }
      if (endDropdownOpen && endRef.current && !endRef.current.contains(e.target)) {
        setEndDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [
    optionDropdownOpen,
    typeDropdownOpen,
    startDropdownOpen,
    endDropdownOpen
  ]);

  return (
    <div className={styles.destinationContainer}>
      <div className={styles.destinationHeader}>
        <span className={styles.destinationTitle}>Destination</span>
        <button className={styles.minusButton} onClick={toggleCollapse}>
          {isCollapsed ? '+' : '-'}
        </button>
      </div>

      {!isCollapsed && (
        <>
          {/* 
            Row of destination stops 
            If hideNormalStops => we only show the postStorage row
          */}
          <MainAndStopOffs
            stops={destinationStops}
            onStopsUpdated={(updatedStops) => {
              onLeadUpdated({ ...lead, destinationStops: updatedStops });
            }}
            selectedStopIndex={selectedStopIndex}
            setSelectedStopIndex={setSelectedStopIndex}
            placeType="destination"
            isStorageToggled={isStorageToggled}
            hideNormalStops={hideNormalStops}
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

            {/* PLACE */}
            <div
              className={`${styles.propertyItem} ${styles.propertyItemPlace} ${removePlaceDotted}`}
              onClick={() => setIsPlacePopupOpen(true)}
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
            {placeSummary}

            {/* ACCESS */}
            <div
              className={`${styles.propertyItem} ${styles.propertyItemAccess} ${removeAccessDotted}`}
              onClick={() => setIsAccessPopupOpen(true)}
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
            {accessSummary}

            {/* SERVICES */}
            <div
              className={`${styles.propertyItem} ${styles.propertyItemServices} ${removeServicesDotted}`}
              onClick={() => setIsServicesPopupOpen(true)}
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
            {servicesSummary}
          </div>

          {/* Time Restrictions */}
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

                  {/* Option */}
                  <div
                    className={`${styles.inputContainer} ${styles.dropdownWrapper}`}
                    ref={optionRef}
                  >
                    <div
                      className={styles.clickableArea}
                      onClick={() => {
                        setOptionDropdownOpen((prev) => !prev);
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
                        {['Not allowed', 'Allowed'].map((opt) => (
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

                  {/* Type */}
                  <div
                    className={`${styles.inputContainer} ${styles.dropdownWrapper}`}
                    ref={typeRef}
                  >
                    <div
                      className={styles.clickableArea}
                      onClick={() => {
                        setTypeDropdownOpen((prev) => !prev);
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
                        {[
                          'Elevator Usage',
                          'Place Access',
                          'Operating Hours',
                          'Permit Requests',
                          'Personal Plans',
                          'Loading Zone',
                          'Parking Zone',
                          'Community Rules',
                          'Other',
                        ].map((typ) => (
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

                  {/* Start time */}
                  <div
                    className={`${styles.inputContainer} ${styles.dropdownWrapper}`}
                    ref={startRef}
                  >
                    <div
                      className={styles.clickableArea}
                      onClick={() => {
                        setStartDropdownOpen((prev) => !prev);
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

                  {/* End time */}
                  <div
                    className={`${styles.inputContainer} ${styles.dropdownWrapper}`}
                    ref={endRef}
                  >
                    <div
                      className={styles.clickableArea}
                      onClick={() => {
                        setEndDropdownOpen((prev) => !prev);
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
        </>
      )}

      {/* Popups */}
      {isPlacePopupOpen && (
        <PlacePopup
          lead={lead}
          onLeadUpdated={onLeadUpdated}
          setIsPlacePopupVisible={setIsPlacePopupOpen}
          defaultTab="destination"
          defaultStopIndex={selectedStopIndex}
        />
      )}
      {isAccessPopupOpen && (
        <AccessPopup
          lead={lead}
          onLeadUpdated={onLeadUpdated}
          setIsAccessPopupVisible={setIsAccessPopupOpen}
          defaultTab="destination"
          defaultStopIndex={selectedStopIndex}
        />
      )}
      {isServicesPopupOpen && (
        <ServicesPopup
          lead={lead}
          onLeadUpdated={onLeadUpdated}
          setIsServicesPopupVisible={setIsServicesPopupOpen}
          defaultTab="destination"
          defaultStopIndex={selectedStopIndex}
        />
      )}
    </div>
  );
}

export default DestinationDetails;
