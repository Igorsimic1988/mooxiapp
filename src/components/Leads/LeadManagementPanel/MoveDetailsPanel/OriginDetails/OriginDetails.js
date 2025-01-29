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

  // Use < instead of <= to avoid duplicating 12:00
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

  // ---------- For the Time Restrictions UI ----------
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

  // ---------- PLACE/ACCESS/SERVICES POPUPS ----------
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
          // Initialize timeRestrictions for each stop:
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

  // Safely get the "current" origin stop
  const originStops = lead.originStops || [];
  const currentStop = originStops[selectedStopIndex] || {};

  // If user types in an address field => update just that origin stop
  const handleStopFieldChange = (fieldName, newValue) => {
    const updatedStops = [...originStops];
    const stopCopy = { ...updatedStops[selectedStopIndex] };

    stopCopy[fieldName] = newValue;
    updatedStops[selectedStopIndex] = stopCopy;

    onLeadUpdated({ ...lead, originStops: updatedStops });
  };

  // Helper: ensure there's a `timeRestrictions` object on the current stop
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

  // ---------- TIME RESTRICTIONS: All handled per-stop ----------
  const currentTR = getCurrentStopRestrictions(); // currentStop's timeRestrictions

  // Dropdown open states + refs
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

  // A helper to update the timeRestrictions object in the current stop
  const updateCurrentStopRestrictions = (partialObj) => {
    const updatedStops = [...originStops];
    let stopCopy = { ...updatedStops[selectedStopIndex] };

    // Ensure timeRestrictions is an object
    let tr = stopCopy.timeRestrictions || {
      isEnabled: false,
      option: 'Select',
      restrictionType: 'Select',
      startTime: '',
      endTime: '',
    };

    // Merge partial updates
    tr = { ...tr, ...partialObj };
    stopCopy.timeRestrictions = tr;

    updatedStops[selectedStopIndex] = stopCopy;
    onLeadUpdated({ ...lead, originStops: updatedStops });
  };

  // Toggle
  const handleToggleTimeRestrictions = (value) => {
    updateCurrentStopRestrictions({ isEnabled: value });
  };

  // Option
  const handleSelectTimeRestrictionsOption = (opt) => {
    setOptionDropdownOpen(false);
    updateCurrentStopRestrictions({ option: opt });
  };

  // Type
  const handleSelectTimeRestrictionsType = (typ) => {
    setTypeDropdownOpen(false);
    updateCurrentStopRestrictions({ restrictionType: typ });
  };

  // Start
  const handleSelectTimeRestrictionsStart = (startVal) => {
    setStartDropdownOpen(false);
    updateCurrentStopRestrictions({ startTime: startVal });
  };

  // End
  const handleSelectTimeRestrictionsEnd = (endVal) => {
    setEndDropdownOpen(false);
    updateCurrentStopRestrictions({ endTime: endVal });
  };

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
              className={`${styles.propertyItem} ${styles.propertyItemPlace}`}
              onClick={() => {
                // Open PlacePopup with the "origin" tab, focusing on same selectedStopIndex
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

            {/* ACCESS => entire area clickable */}
            <div
              className={`${styles.propertyItem} ${styles.propertyItemAccess}`}
              onClick={() => {
                // Open AccessPopup with same tab & stop index
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

            {/* SERVICES => entire area clickable */}
            <div
              className={`${styles.propertyItem} ${styles.propertyItemServices}`}
              onClick={() => {
                // Open ServicesPopup with same tab & stop index
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
          </div>

          {/* Time Restrictions - now per stop */}
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
                {/* AddButtonWrapper was removed as requested */}
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

      {/* The popup for "Place" */}
      {isPlacePopupOpen && (
        <PlacePopup
          lead={lead}
          onLeadUpdated={onLeadUpdated}
          setIsPlacePopupVisible={setIsPlacePopupOpen}
          defaultTab="origin"
          defaultStopIndex={selectedStopIndex}
        />
      )}

      {/* The popup for "Access" */}
      {isAccessPopupOpen && (
        <AccessPopup
          lead={lead}
          onLeadUpdated={onLeadUpdated}
          setIsAccessPopupVisible={setIsAccessPopupOpen}
          defaultTab="origin"
          defaultStopIndex={selectedStopIndex}
        />
      )}

      {/* The popup for "Services" */}
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
