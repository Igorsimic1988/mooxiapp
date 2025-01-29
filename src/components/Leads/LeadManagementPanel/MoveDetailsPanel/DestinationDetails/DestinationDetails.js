// src/components/Leads/LeadManagementPanel/MoveDetailsPanel/DestinationDetails/DestinationDetails.js

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

function DestinationDetails({ lead, onLeadUpdated }) {
  // ---------- DESTINATION STOPS ----------
  const [selectedStopIndex, setSelectedStopIndex] = useState(0);

  const [isCollapsed, setIsCollapsed] = useState(true);
  const toggleCollapse = () => setIsCollapsed((prev) => !prev);

  // ---------- TIME RESTRICTIONS ----------
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

  // ---------- POPUPS FOR PLACE / ACCESS / SERVICES ----------
  const [isPlacePopupOpen, setIsPlacePopupOpen] = useState(false);
  const [isAccessPopupOpen, setIsAccessPopupOpen] = useState(false);
  const [isServicesPopupOpen, setIsServicesPopupOpen] = useState(false);

  // ---------- ENSURE DESTINATION STOPS EXIST ----------
  useEffect(() => {
    if (!Array.isArray(lead.destinationStops) || lead.destinationStops.length === 0) {
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
        },
      ];
      onLeadUpdated({ ...lead, destinationStops: defaultStops });
    }
  }, [lead, onLeadUpdated]);

  // Safely get the current stop
  const destinationStops = lead.destinationStops || [];
  const currentStop = destinationStops[selectedStopIndex] || {};

  // If user types in an address field => update just that destination stop
  function handleStopFieldChange(fieldName, newValue) {
    const updatedStops = [...destinationStops];
    const stopCopy = { ...updatedStops[selectedStopIndex] };
    stopCopy[fieldName] = newValue;
    updatedStops[selectedStopIndex] = stopCopy;
    onLeadUpdated({ ...lead, destinationStops: updatedStops });
  }

  // Helper => ensure there's a timeRestrictions object
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

  // ---------- Time Restrictions handlers ----------
  function updateCurrentStopRestrictions(partialObj) {
    const updatedStops = [...destinationStops];
    let stopCopy = { ...updatedStops[selectedStopIndex] };

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
    onLeadUpdated({ ...lead, destinationStops: updatedStops });
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
  function handleSelectTimeRestrictionsStart(start) {
    setStartDropdownOpen(false);
    updateCurrentStopRestrictions({ startTime: start });
  }
  function handleSelectTimeRestrictionsEnd(end) {
    setEndDropdownOpen(false);
    updateCurrentStopRestrictions({ endTime: end });
  }

  // Dropdown states + refs for outside click
  const [optionDropdownOpen, setOptionDropdownOpen] = useState(false);
  const [typeDropdownOpen, setTypeDropdownOpen] = useState(false);
  const [startDropdownOpen, setStartDropdownOpen] = useState(false);
  const [endDropdownOpen, setEndDropdownOpen] = useState(false);

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
  }, [optionDropdownOpen, typeDropdownOpen, startDropdownOpen, endDropdownOpen]);

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
          {/* Row of destination stops */}
          <MainAndStopOffs
            stops={destinationStops}
            onStopsUpdated={(newStops) => {
              onLeadUpdated({ ...lead, destinationStops: newStops });
            }}
            selectedStopIndex={selectedStopIndex}
            setSelectedStopIndex={setSelectedStopIndex}
            placeType="destination"
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
              className={`${styles.propertyItem} ${styles.propertyItemPlace}`}
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

            {/* ACCESS */}
            <div
              className={`${styles.propertyItem} ${styles.propertyItemAccess}`}
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

            {/* SERVICES */}
            <div
              className={`${styles.propertyItem} ${styles.propertyItemServices}`}
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
                  {/* Option dropdown */}
                  <div
                    className={`${styles.inputContainer} ${styles.dropdownWrapper}`}
                    ref={optionRef}
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
                    ref={typeRef}
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
                    ref={startRef}
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
                    ref={endRef}
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
                {/* No "Add" button (addButtonWrapper) */}
              </div>
            )}
          </div>
        </>
      )}

      {/* The "Place" popup */}
      {isPlacePopupOpen && (
        <PlacePopup
          lead={lead}
          onLeadUpdated={onLeadUpdated}
          setIsPlacePopupVisible={setIsPlacePopupOpen}
          defaultTab="destination"      // <-- open on "destination" tab
          defaultStopIndex={selectedStopIndex}
        />
      )}

      {/* The "Access" popup */}
      {isAccessPopupOpen && (
        <AccessPopup
          lead={lead}
          onLeadUpdated={onLeadUpdated}
          setIsAccessPopupVisible={setIsAccessPopupOpen}
          defaultTab="destination"      // <-- open on "destination" tab
          defaultStopIndex={selectedStopIndex}
        />
      )}

      {/* The "Services" popup */}
      {isServicesPopupOpen && (
        <ServicesPopup
          lead={lead}
          onLeadUpdated={onLeadUpdated}
          setIsServicesPopupVisible={setIsServicesPopupOpen}
          defaultTab="destination"      // <-- open on "destination" tab
          defaultStopIndex={selectedStopIndex}
        />
      )}
    </div>
  );
}

export default DestinationDetails;
