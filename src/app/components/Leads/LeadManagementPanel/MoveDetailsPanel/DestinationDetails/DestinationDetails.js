import React, { useEffect, useState, useRef } from 'react';

import Icon from '../../../../Icon'

import SimpleToggle from '../../../SimpleToggle/SimpleToggle';
import MainAndStopOffs from '../OriginDetails/MainAndStopOffs/MainAndStopOffs';

import PlacePopup from '../OriginDetails/PlacePopup/PlacePopup';
import AccessPopup from '../OriginDetails/AccessPopup/AccessPopup';
import ServicesPopup from '../OriginDetails/ServicesPopup/ServicesPopup';

import styles from './DestinationDetails.module.css';
import { useUiState } from '../UiStateContext';
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {  createDestination, deleteDestination } from 'src/app/services/destinationsService';
import { useAccessToken } from "src/app/lib/useAccessToken";

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
  isStorageToggled,
  onDestinationUpdated,
  onOriginUpdated,
  destinationStops,
  setDestinationStops,
  originStops
}) {
  const {
    selectedDestinationStopId,
    setSelectedDestinationStopId,
    isDestinationCollapsed,
    setIsDestinationCollapsed,
  } = useUiState();
  
  const token = useAccessToken();
  const queryClient = useQueryClient();
  const postStorageStops = destinationStops.filter((s) => s.postStorage);
  const normalStops = destinationStops.filter((s) => !s.postStorage);

  const createDestinationMutation = useMutation({
    mutationFn: (newDestinationData) =>createDestination({destinationsData: newDestinationData, leadId:lead.id,  token: token}),
    onSuccess:(createdDestination) => {
      console.log("New destination created:", createdDestination);
    },
    onError: (err) => {
      console.log(err)
    }
  });



const deleteDestinationMutation = useMutation({
  mutationFn: deleteDestination,
  onSuccess: () => {
    console.log('Destination deleted!');
    queryClient.invalidateQueries(['destinations']);
  },
  onError: (err) => {
    console.error('Failed to delete destination', err);
  }
});



const handleAddNormalStop = () => {
  const newStop = {
    address: '',
    apt: '',
    city: '',
    state: '',
    zipCode: '',
    isActive: true,
    postStorage: false,
  };
  createDestinationMutation.mutate(newStop, {
    onSuccess: (createdDestination) => {
      console.log("New destination created:", createdDestination);
      setDestinationStops((prev) => [...prev, createdDestination]);
      setSelectedDestinationStopId(createdDestination.id);
      queryClient.invalidateQueries(['destinations']);
    },
    onError: (err) => {
      console.error('Failed to create destination stop', err);
    }
  });
}
const handleAddPostStorageStop = () => {
  const newStop = {
    address: '',
    apt: '',
    city: '',
    state: '',
    zipCode: '',
    isActive: true,
    postStorage: true,
  };
  createDestinationMutation.mutate(newStop, {
    onSuccess: (createdDestination) => {
      console.log("New destination created:", createdDestination);
      setDestinationStops((prev) => [...prev, createdDestination]);
      setSelectedDestinationStopId(createdDestination.id);
      queryClient.invalidateQueries(['destinations']);
    },
    onError: (err) => {
      console.error('Failed to create destination stop', err);
    }
  });
};
// useEffect(() => {
//   if (lead.destinations && lead.destinations.length > 0) {
//     setDestinationStops(lead.destinations);
//   }
// }, [lead.destinations]);
useEffect(() => {
  if (destinationStops.length > 0 && !selectedDestinationStopId) {
    if (isStorageToggled){
      setSelectedDestinationStopId(postStorageStops[0].id)
    }else {
      setSelectedDestinationStopId(normalStops[0].id);
    }
  }
}, [destinationStops, selectedDestinationStopId]);


  // Toggle open/close
  const toggleCollapse = () => setIsDestinationCollapsed((prev) => !prev);

  // Popups
  const [isPlacePopupOpen, setIsPlacePopupOpen] = useState(false);
  const [isAccessPopupOpen, setIsAccessPopupOpen] = useState(false);
  const [isServicesPopupOpen, setIsServicesPopupOpen] = useState(false);

  // If "Add storage" is ON + user picked 'All items' => hide normal stops
  const hideNormalStops =
    isStorageToggled && lead.storageItems === 'All items';


  function usePrevious(value) {
    const ref = useRef();
    useEffect(() => {
      ref.current = value;
    }, [value]);
    return ref.current;
  }
  const prevIsStorageToggled = usePrevious(isStorageToggled);
  useEffect(() => {
    if (!destinationStops.length) return;

    const updatedStops = [...destinationStops];
    let changed = false;

    if (hideNormalStops) {
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
      updatedStops.forEach((stop, index) => {
        const original = destinationStops[index];
        if (
          original &&
          original.id &&
          stop.isActive !== original.isActive
        ) {
          onDestinationUpdated(stop.id, {isActive: stop.isActive});
        }
      });
      setDestinationStops(updatedStops);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hideNormalStops, isStorageToggled, destinationStops]);
  // const handleDestinationUpdated = (id, updates) => {
  //   setDestinationStops((prevStops) =>
  //     prevStops.map((stop) =>
  //       stop.id === id ? { ...stop, ...updates } : stop
  //     )
  //   );
  //   onDestinationUpdated(id, updates); 
  // };
  

  /**
   * 4) If expanded & normal hidden => auto-select the *first post‐storage* if current is normal
   */
  useEffect(() => {
    if (!isDestinationCollapsed && hideNormalStops && destinationStops.length > 0) {
      const curStop = destinationStops.find((s) => s.id === selectedDestinationStopId);
      if (curStop && !curStop.postStorage) {
        const firstPostStorageStop = postStorageStops[0];
        if (firstPostStorageStop && firstPostStorageStop !== selectedDestinationStopId) {
          setSelectedDestinationStopId(firstPostStorageStop.id);
        }
      }
    }
  }, [isDestinationCollapsed, hideNormalStops, destinationStops, selectedDestinationStopId]);

  useEffect(() => {
    if (!destinationStops.length) return;
  
    const current = destinationStops.find((s) => s.id === selectedDestinationStopId);
  
    // Ako je storage isključen i trenutno selektovan postStorage stop
    if (prevIsStorageToggled && !isStorageToggled && current?.postStorage) {
      const firstNormal = normalStops[0];
      if (firstNormal) {
        setSelectedDestinationStopId(firstNormal.id);
      }
    }
  
    // Ako je storage uključen i trenutno selektovan normal stop
    if (!prevIsStorageToggled && isStorageToggled && !current?.postStorage) {
      const firstPostStorage = postStorageStops[0];
      if (firstPostStorage) {
        setSelectedDestinationStopId(firstPostStorage.id);
      }
    }
  }, [
    isStorageToggled,
    destinationStops,
    selectedDestinationStopId,
    prevIsStorageToggled,
    postStorageStops,
    normalStops,
  ]);
  

  // Currently selected
  const currentStop = destinationStops.find((s) => s.id === selectedDestinationStopId) || {};


  const handleStopFieldChange = (fieldName, newValue) => {
    const stop = destinationStops.find((s) => s.id === selectedDestinationStopId);
    if (!stop?.id) return;
    const updatedStop = { ...stop, [fieldName]: newValue };
    setDestinationStops((prev) =>
      prev.map((s) => (s.id === selectedDestinationStopId ? updatedStop : s))
    );
    onDestinationUpdated(stop.id, { [fieldName]: newValue })
  };
  function handleDeactivateThisStop() {
    if (!currentStop?.id) {
      return;
    }
    const isPostStorage = currentStop.postStorage;
    const groupStops = isPostStorage ? postStorageStops : normalStops;
    const groupIndex = groupStops.findIndex(s => s.id === currentStop.id);
    if (groupIndex === 0) {
      return;
    }
    deleteDestinationMutation.mutate(
      { id: currentStop.id },
      {
        onSuccess: () => {
          const nextStopInGroup = groupStops[groupIndex - 1];
          setDestinationStops((prev) => prev.filter((s) => s.id !== currentStop.id));
        if (nextStopInGroup?.id) {
          setSelectedDestinationStopId(nextStopInGroup.id);
        }
        queryClient.invalidateQueries(['destinations']);
      }}
    );
  }

  // Time Restrictions
  function updateCurrentStopRestrictions(partial) {
    const stop = destinationStops.find((s) => s.id === selectedDestinationStopId);
  if (!stop?.id) return;
    const updates = {};
    if ('isEnabled' in partial)
      updates.timeRestriction = partial.isEnabled;
    if ('option' in partial)
      updates.timeRestrictionOption = partial.option;
    if ('restrictionType' in partial)
      updates.timeRestrictionType = partial.restrictionType;
    if ('startTime' in partial)
      updates.timeRestrictionStartTime = partial.startTime;
    if ('endTime' in partial)
      updates.timeRestrictionEndTime = partial.endTime;
    const updatedStop = { ...stop, ...updates };
    setDestinationStops((prev) =>
      prev.map((s) => (s.id === selectedDestinationStopId ? updatedStop : s))
    );
    onDestinationUpdated(stop.id, updates);
  }
  const currentTR = {
    isEnabled: currentStop.timeRestriction ?? false,
    option: currentStop.timeRestrictionOption || 'Select',
    restrictionType: currentStop.timeRestrictionType || 'Select',
    startTime: currentStop.timeRestrictionStartTime || '',
    endTime: currentStop.timeRestrictionEndTime || '',
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
  
 
  const isFirstStopInGroup =
  currentStop?.postStorage
    ? postStorageStops.findIndex(s => s.id === currentStop.id) === 0
    : normalStops.findIndex(s => s.id === currentStop.id) === 0;

  const isDeactivateVisible  = !isFirstStopInGroup; 

  return (
    <div className={styles.destinationContainer}>
      {/* HEADER */}
      <div className={styles.destinationHeader}>
        <span className={styles.destinationTitle}>Destination</span>
        <button className={styles.minusButton} onClick={toggleCollapse}>
          {isDestinationCollapsed ? '+' : '-'}
        </button>
      </div>

      {!isDestinationCollapsed && (
        <>
          {/* The row of stops (normal + postStorage) */}
          <MainAndStopOffs
            stops={destinationStops}
            onAddNormalStop={handleAddNormalStop}
            onAddPostStorageStop={handleAddPostStorageStop}
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
                  value={currentStop.zipCode || ''}
                  onChange={(e) =>
                    handleStopFieldChange('zipCode', e.target.value)
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
      {isPlacePopupOpen && destinationStops.length > 0 &&  selectedDestinationStopId &&(
        <PlacePopup
          lead={lead}
          onDestinationUpdated={onDestinationUpdated}
          onOriginUpdated={onOriginUpdated}
          setIsPlacePopupVisible={setIsPlacePopupOpen}
          destinationStops={destinationStops}
          originStops={originStops}
          defaultTab="destination"
          defaultStopId={selectedDestinationStopId}
        />
      )}
      {isAccessPopupOpen && destinationStops.length > 0 && selectedDestinationStopId &&(
        <AccessPopup
          lead={lead}
          onDestinationUpdated={onDestinationUpdated}
          onOriginUpdated={onOriginUpdated}
          setIsAccessPopupVisible={setIsAccessPopupOpen}
          destinationStops={destinationStops}
          originStops={originStops} 
          defaultTab="destination"
        />
      )}
      {isServicesPopupOpen && destinationStops.length > 0 && selectedDestinationStopId &&(
        <ServicesPopup
          lead={lead}
          onDestinationUpdated={onDestinationUpdated}
          onOriginUpdated={onOriginUpdated}
          setIsServicesPopupVisible={setIsServicesPopupOpen}
          destinationStops={destinationStops}
          defaultTab="destination"
          originStops={originStops} 
          defaultStopId={selectedDestinationStopId}
        />
      )}
    </div>
  );
}

export default DestinationDetails;
