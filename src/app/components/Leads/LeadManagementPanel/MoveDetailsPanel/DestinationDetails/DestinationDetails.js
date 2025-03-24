"use client";

import React, { useEffect, useState, useRef, useMemo } from 'react';

import Icon from '../../../../Icon'

import SimpleToggle from '../../../SimpleToggle/SimpleToggle';
import MainAndStopOffs from '../OriginDetails/MainAndStopOffs/MainAndStopOffs';

import PlacePopup from '../OriginDetails/PlacePopup/PlacePopup';
import AccessPopup from '../OriginDetails/AccessPopup/AccessPopup';
import ServicesPopup from '../OriginDetails/ServicesPopup/ServicesPopup';

import styles from './DestinationDetails.module.css';

/** Generate 15-min increments from 7:00 AM to midnight. */
function generateTimeOptions() {
  const result = [];
  let totalMinutes = 7 * 60; // Start at 7:00 AM
  while (totalMinutes < 24 * 60) {
    const suffix = totalMinutes >= 12 * 60 ? 'PM' : 'AM';

    // Get the hour (integer) and minute
    const hourVal = Math.floor(totalMinutes / 60);
    const mm = totalMinutes % 60;

    // Convert hourVal to 12-hour format
    let displayHour = hourVal % 12;
    if (displayHour === 0) displayHour = 12;

    const mmStr = String(mm).padStart(2, '0');
    result.push(`${displayHour}:${mmStr} ${suffix}`);
    totalMinutes += 15;
  }
  return result;
}
const timeOptions = generateTimeOptions();

/**
 * DestinationDetails
 * ------------------
 * For controlling / editing all "destinationStops".
 */
function DestinationDetails({
  lead,
  onLeadUpdated,
  isStorageToggled,
  isCollapsed,       // from parent
  setIsCollapsed,    // from parent
}) {
  // Index of the currently selected stop
  const [selectedStopIndex, setSelectedStopIndex] = useState(0);

  // Toggle open/close
  const toggleCollapse = () => setIsCollapsed((prev) => !prev);

  // Popups
  const [isPlacePopupOpen, setIsPlacePopupOpen] = useState(false);
  const [isAccessPopupOpen, setIsAccessPopupOpen] = useState(false);
  const [isServicesPopupOpen, setIsServicesPopupOpen] = useState(false);

  // If "Add storage" is ON + user picked 'All items' => hide normal stops
  const hideNormalStops =
    isStorageToggled && lead.storage_items === 'All items';

  /**
   * 1) If no stops => create a normal "Main Drop off"
   *    If storage toggled => ensure "Post Storage Main Drop off"
   */
  useEffect(() => {
    const existingStops = lead.destinationStops;
    if (!Array.isArray(existingStops) || existingStops.length === 0) {
      const initial = [
        {
          label: 'Main Drop off',
          address: '',
          apt: '',
          city: '',
          state: '',
          zip: '',
          postStorage: false,
          isActive: true,
          timeRestrictions: {
            isEnabled: false,
            option: 'Select',
            restrictionType: 'Select',
            startTime: '',
            endTime: '',
          },
        },
      ];
      onLeadUpdated({ ...lead, destinationStops: initial });
      return;
    }

    if (isStorageToggled) {
      const alreadyHasPS = existingStops.some((s) => s.postStorage === true);
      if (!alreadyHasPS) {
        const psStop = {
          label: 'Post Storage Main Drop off',
          address: '',
          apt: '',
          city: '',
          state: '',
          zip: '',
          postStorage: true,
          isActive: true,
          timeRestrictions: {
            isEnabled: false,
            option: 'Select',
            restrictionType: 'Select',
            startTime: '',
            endTime: '',
          },
        };
        onLeadUpdated({
          ...lead,
          destinationStops: [...existingStops, psStop],
        });
      }
    }
  }, [lead, onLeadUpdated, isStorageToggled]);

  // 2) Memo the array for performance
  const destinationStops = useMemo(() => {
    return Array.isArray(lead.destinationStops) ? lead.destinationStops : [];
  }, [lead.destinationStops]);

  /**
   * 3) Hide normal stops if "All items"; or activate all if partial, etc.
   */
  useEffect(() => {
    if (!destinationStops.length) return;

    const updatedStops = [...destinationStops];
    let changed = false;

    if (hideNormalStops) {
      // "All items" => normal => inactive, post => active
      updatedStops.forEach((stop, i) => {
        if (stop.postStorage) {
          if (stop.isActive !== true) {
            updatedStops[i] = { ...stop, isActive: true };
            changed = true;
          }
        } else {
          if (stop.isActive !== false) {
            updatedStops[i] = { ...stop, isActive: false };
            changed = true;
          }
        }
      });
    } else if (isStorageToggled) {
      // partial => everything => active
      updatedStops.forEach((stop, i) => {
        if (!stop.isActive) {
          updatedStops[i] = { ...stop, isActive: true };
          changed = true;
        }
      });
    } else {
      // storage off => normal => active, post => inactive
      updatedStops.forEach((stop, i) => {
        if (stop.postStorage) {
          if (stop.isActive !== false) {
            updatedStops[i] = { ...stop, isActive: false };
            changed = true;
          }
        } else {
          if (!stop.isActive) {
            updatedStops[i] = { ...stop, isActive: true };
            changed = true;
          }
        }
      });
    }

    if (changed) {
      onLeadUpdated({ ...lead, destinationStops: updatedStops });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hideNormalStops, isStorageToggled, destinationStops]);

  /**
   * 4) If expanded & normal hidden => auto-select the *first post‐storage* if current is normal
   */
  useEffect(() => {
    if (!isCollapsed && hideNormalStops && destinationStops.length > 0) {
      const curStop = destinationStops[selectedStopIndex];
      if (curStop && !curStop.postStorage) {
        const postIdx = destinationStops.findIndex((s) => s.postStorage);
        if (postIdx !== -1 && postIdx !== selectedStopIndex) {
          setSelectedStopIndex(postIdx);
        }
      }
    }
  }, [isCollapsed, hideNormalStops, destinationStops, selectedStopIndex]);

  /**
   * 5) If user turns OFF storage => if current is post => select 0
   */
  useEffect(() => {
    if (!isStorageToggled && destinationStops.length > 0) {
      const current = destinationStops[selectedStopIndex];
      if (current && current.postStorage) {
        setSelectedStopIndex(0);
      }
    }
  }, [isStorageToggled, destinationStops, selectedStopIndex]);

  // Currently selected
  const currentStop = destinationStops[selectedStopIndex] || {};

  // Update a field on the current stop
  function handleStopFieldChange(fieldName, newValue) {
    const updated = [...destinationStops];
    const copy = { ...updated[selectedStopIndex] };
    copy[fieldName] = newValue;
    updated[selectedStopIndex] = copy;
    onLeadUpdated({ ...lead, destinationStops: updated });
  }

  // Deactivate => remove from array
  function handleDeactivateThisStop() {
    if (!currentStop) return;
    if (
      currentStop.label === 'Main Drop off' ||
      currentStop.label === 'Post Storage Main Drop off'
    ) {
      return;
    }

    const updated = [...destinationStops];
    updated.splice(selectedStopIndex, 1);

    let newIndex = selectedStopIndex;
    if (newIndex >= updated.length) {
      newIndex = updated.length - 1;
    }
    if (newIndex < 0) newIndex = 0;

    onLeadUpdated({ ...lead, destinationStops: updated });

    if (updated.length > 0) {
      setSelectedStopIndex(newIndex);
    } else {
      setSelectedStopIndex(0);
    }
  }

  // Time Restrictions
  function updateCurrentStopRestrictions(partial) {
    const updated = [...destinationStops];
    const stopCopy = { ...updated[selectedStopIndex] };
    const oldTR = stopCopy.timeRestrictions || {
      isEnabled: false,
      option: 'Select',
      restrictionType: 'Select',
      startTime: '',
      endTime: '',
    };
    stopCopy.timeRestrictions = { ...oldTR, ...partial };
    updated[selectedStopIndex] = stopCopy;

    onLeadUpdated({ ...lead, destinationStops: updated });
  }
  const currentTR = currentStop.timeRestrictions || {
    isEnabled: false,
    option: 'Select',
    restrictionType: 'Select',
    startTime: '',
    endTime: '',
  };

  // Summaries
  function isPlaceDataComplete(st) {
    return st.typeOfPlace?.trim() && st.howManyStories?.trim();
  }
  const placeNoDotted = isPlaceDataComplete(currentStop)
    ? styles.placeNoDotted
    : '';

  function isAccessDataComplete(st) {
    return (
      st.parkingAccess?.trim() &&
      st.distanceDoorTruck?.trim() &&
      st.howManySteps?.trim()
    );
  }
  const accessNoDotted = isAccessDataComplete(currentStop)
    ? styles.accessNoDotted
    : '';

  function isServicesDataComplete(st) {
    return !!st.unpackingOption?.trim();
  }
  const servicesNoDotted = isServicesDataComplete(currentStop)
    ? styles.servicesNoDotted
    : '';

  // For the Time Restriction dropdowns
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
      if (
        optionDropdownOpen &&
        optionRef.current &&
        !optionRef.current.contains(e.target)
      ) {
        setOptionDropdownOpen(false);
      }
      if (
        typeDropdownOpen &&
        typeRef.current &&
        !typeRef.current.contains(e.target)
      ) {
        setTypeDropdownOpen(false);
      }
      if (
        startDropdownOpen &&
        startRef.current &&
        !startRef.current.contains(e.target)
      ) {
        setStartDropdownOpen(false);
      }
      if (
        endDropdownOpen &&
        endRef.current &&
        !endRef.current.contains(e.target)
      ) {
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
    endDropdownOpen,
  ]);

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
  function handleSelectTimeRestrictionsStart(val) {
    setStartDropdownOpen(false);
    updateCurrentStopRestrictions({ startTime: val });
  }
  function handleSelectTimeRestrictionsEnd(val) {
    setEndDropdownOpen(false);
    updateCurrentStopRestrictions({ endTime: val });
  }

  // Decide if "Deactivate this stop" is visible
  const isDeactivateVisible =
    currentStop?.label !== 'Main Drop off' &&
    currentStop?.label !== 'Post Storage Main Drop off';

  return (
    <div className={styles.destinationContainer}>
      {/* HEADER */}
      <div className={styles.destinationHeader}>
        <span className={styles.destinationTitle}>Destination</span>
        <button className={styles.minusButton} onClick={toggleCollapse}>
          {isCollapsed ? '+' : '-'}
        </button>
      </div>

      {!isCollapsed && (
        <>
          {/* The row of stops (normal + postStorage) */}
          <MainAndStopOffs
            stops={destinationStops}
            onStopsUpdated={(updatedStops) =>
              onLeadUpdated({ ...lead, destinationStops: updatedStops })
            }
            selectedStopIndex={selectedStopIndex}
            setSelectedStopIndex={setSelectedStopIndex}
            placeType="destination"
            isStorageToggled={isStorageToggled}
            hideNormalStops={hideNormalStops}
          />

          {/* Address Fields */}
          <div className={styles.propertySection}>
            <div className={styles.propertySectionHeader}>
              <span className={styles.propertyAddressText}>Property Address</span>
              {isDeactivateVisible && (
                <button
                  type="button"
                  className={styles.deactivateStopLink}
                  onClick={handleDeactivateThisStop}
                >
                  Remove this stop
                </button>
              )}
            </div>

            <div className={styles.inputContainer}>
              <input
                type="text"
                className={styles.addressInput}
                placeholder="Property Address"
                value={currentStop.address || ''}
                onChange={(e) =>
                  handleStopFieldChange('address', e.target.value)
                }
              />
              <div className={styles.inputIconContainer}>
                <Icon name="Location" className={styles.inputIcon} />
              </div>
            </div>

            <div className={styles.twoInputsRow}>
              <div className={styles.inputContainer}>
                <input
                  type="text"
                  className={styles.addressInput}
                  placeholder="Apt/Suite"
                  value={currentStop.apt || ''}
                  onChange={(e) =>
                    handleStopFieldChange('apt', e.target.value)
                  }
                />
              </div>
              <div className={styles.inputContainer}>
                <input
                  type="text"
                  className={styles.addressInput}
                  placeholder="City"
                  value={currentStop.city || ''}
                  onChange={(e) =>
                    handleStopFieldChange('city', e.target.value)
                  }
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
                  onChange={(e) =>
                    handleStopFieldChange('state', e.target.value)
                  }
                />
              </div>
              <div className={styles.inputContainer}>
                <input
                  type="text"
                  className={styles.addressInput}
                  placeholder="Zip code"
                  value={currentStop.zip || ''}
                  onChange={(e) =>
                    handleStopFieldChange('zip', e.target.value)
                  }
                />
              </div>
            </div>
          </div>

          {/* Property Info: PLACE / ACCESS / SERVICES */}
          <div className={styles.propertyInfoSection}>
            <span className={styles.propertyText}>Property</span>

            {/* PLACE */}
            <div
              className={`${styles.propertyItem} ${styles.propertyItemPlace} ${placeNoDotted}`}
              onClick={() => setIsPlacePopupOpen(true)}
            >
              <div className={styles.propertyItemLeft}>
                <Icon name="Place1" className={styles.propertyItemIcon} />
                <span className={styles.propertyItemText}>PLACE</span>
              </div>
              <button
                className={`${styles.propertyItemPlusButton} ${styles.propertyItemPlaceButton}`}
              >
                +
              </button>
            </div>
            {/* Place summary */}
            {(() => {
              if (!currentStop) return null;
              const { typeOfPlace, howManyStories, features, needsCOI } =
                currentStop;
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
            })()}

            {/* ACCESS */}
            <div
              className={`${styles.propertyItem} ${styles.propertyItemAccess} ${accessNoDotted}`}
              onClick={() => setIsAccessPopupOpen(true)}
            >
              <div className={styles.propertyItemLeft}>
                <Icon name="Access1" color="#FAA61A" className={styles.propertyItemIcon} />
                <span className={styles.propertyItemText}>ACCESS</span>
              </div>
              <button
                className={`${styles.propertyItemPlusButton} ${styles.propertyItemAccessButton}`}
              >
                +
              </button>
            </div>
            {/* Access summary */}
            {(() => {
              if (!currentStop) return null;
              const {
                biggestTruckAccess,
                shuttleTruckRequired,
                parkingAccess,
                elevatorAtStop,
                distanceDoorTruck,
                howManySteps,
              } = currentStop;

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
            })()}

            {/* SERVICES */}
            <div
              className={`${styles.propertyItem} ${styles.propertyItemServices} ${servicesNoDotted}`}
              onClick={() => setIsServicesPopupOpen(true)}
            >
              <div className={styles.propertyItemLeft}>
                <Icon name="Services1" color="#F65676" className={styles.propertyItemIcon} />
                <span className={styles.propertyItemText}>SERVICES</span>
              </div>
              <button
                className={`${styles.propertyItemPlusButton} ${styles.propertyItemServicesButton}`}
              >
                +
              </button>
            </div>
            {/* Services summary */}
            {(() => {
              if (!currentStop) return null;
              const {
                unpackingOption,
                itemsToBeAssembled,
                hoistItems,
                craneNeeded,
                additionalServices,
              } = currentStop;

              const line1 = unpackingOption?.trim() || '';
              const line2Parts = [];
              if (itemsToBeAssembled) line2Parts.push('Assembly');
              if (hoistItems) line2Parts.push('Hoisting');
              if (craneNeeded) line2Parts.push('Crane');
              const line2 = line2Parts.join(', ');

              let line3 = '';
              if (
                Array.isArray(additionalServices) &&
                additionalServices.length > 0
              ) {
                line3 = additionalServices.map((svc) => `+${svc}`).join(', ');
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
            })()}
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
                      <Icon name="UnfoldMore" className={styles.moreIcon} />
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
                      <Icon name='UnfoldMore' className={styles.moreIcon}/>
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
                        ].map((t) => (
                          <div
                            key={t}
                            className={styles.dropdownOption}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleSelectTimeRestrictionsType(t);
                            }}
                          >
                            {t}
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
                      <Icon name="UnfoldMore" className={styles.moreIcon} />
                    </div>
                    {startDropdownOpen && (
                      <div className={styles.dropdownMenu}>
                        {timeOptions.map((val) => (
                          <div
                            key={val}
                            className={styles.dropdownOption}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleSelectTimeRestrictionsStart(val);
                            }}
                          >
                            {val}
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
                      <Icon name="UnfoldMore" className={styles.moreIcon} />
                    </div>
                    {endDropdownOpen && (
                      <div className={styles.dropdownMenu}>
                        {timeOptions.map((val) => (
                          <div
                            key={val}
                            className={styles.dropdownOption}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleSelectTimeRestrictionsEnd(val);
                            }}
                          >
                            {val}
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
