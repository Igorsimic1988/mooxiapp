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
import {  createDestination } from 'src/app/services/destinationsService';
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

  // Add rate type awareness
  const rateType = lead?.rateType || 'Hourly Rate';
  const isWeightOrVolumeBased = rateType === 'Weight Based' || rateType === 'Volume Based';

  const createDestinationMutation = useMutation({
    mutationFn: (newDestinationData) =>createDestination({destinationsData: newDestinationData, leadId:lead.id,  token: token}),
    onSuccess:(createdDestination) => {
      console.log("New destination created:", createdDestination);
    },
    onError: (err) => {
      console.log(err)
    }
  });

  // Enhanced selection logic with fallback
  useEffect(() => {
    const visibleStops = destinationStops.filter(s => s.isVisible !== false && s.isActive !== false);
    const visibleNormalStops = visibleStops.filter(s => !s.postStorage);
    const visiblePostStorageStops = visibleStops.filter(s => s.postStorage);
    
    if (visibleStops.length > 0) {
      // If nothing is selected
      if (!selectedDestinationStopId) {
        // If storage is toggled and we have post-storage stops, select the first one
        if (isStorageToggled && visiblePostStorageStops.length > 0) {
          setSelectedDestinationStopId(visiblePostStorageStops[0].id);
        } else if (visibleNormalStops.length > 0) {
          // Otherwise select the first normal stop (Main Drop off)
          setSelectedDestinationStopId(visibleNormalStops[0].id);
        }
      } else {
        // Check if the currently selected stop is still visible and active
        const currentlySelected = visibleStops.find(s => s.id === selectedDestinationStopId);
        if (!currentlySelected) {
          // If not, fallback based on storage toggle
          if (isStorageToggled && visiblePostStorageStops.length > 0) {
            setSelectedDestinationStopId(visiblePostStorageStops[0].id);
          } else if (visibleNormalStops.length > 0) {
            setSelectedDestinationStopId(visibleNormalStops[0].id);
          }
        }
      }
    }
  }, [destinationStops, selectedDestinationStopId, isStorageToggled, setSelectedDestinationStopId]);

  const handleAddNormalStop = () => {
    const reusableStop = destinationStops.find(
      (s) => !s.postStorage && s.isVisible === false
    );

    if (reusableStop) {
      onDestinationUpdated(reusableStop.id, {
        isVisible: true,
        isActive: true,
      });

      setDestinationStops((prev) =>
        prev.map((s) =>
          s.id === reusableStop.id
            ? { ...s, isVisible: true, isActive: true }
            : s
        )
      );

      setSelectedDestinationStopId(reusableStop.id);
      return;
    }
    const newStop = {
      address: '',
      apt: '',
      city: '',
      state: '',
      zipCode: '',
      isActive: true,
      isVisible: true,
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
    const reusableStop = destinationStops.find(
      (s) => s.postStorage && s.isVisible === false
    );

    if (reusableStop) {
      onDestinationUpdated(reusableStop.id, {
        isVisible: true,
        isActive: true,
      });

      setDestinationStops((prev) =>
        prev.map((s) =>
          s.id === reusableStop.id
            ? { ...s, isVisible: true, isActive: true }
            : s
        )
      );

      setSelectedDestinationStopId(reusableStop.id);
      return;
    }
    const newStop = {
      address: '',
      apt: '',
      city: '',
      state: '',
      zipCode: '',
      isActive: true,
      isVisible: true,
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

  // Toggle open/close
  const toggleCollapse = () => setIsDestinationCollapsed((prev) => !prev);

  // Popups
  const [isPlacePopupOpen, setIsPlacePopupOpen] = useState(false);
  const [isAccessPopupOpen, setIsAccessPopupOpen] = useState(false);
  const [isServicesPopupOpen, setIsServicesPopupOpen] = useState(false);

  // Update hideNormalStops logic to consider rate type
  // For Weight/Volume based quotes, never hide normal stops just because of storage
  const hideNormalStops =
    !isWeightOrVolumeBased && // Only hide for Hourly Rate
    isStorageToggled && 
    lead.storageItems === 'All items';

  function usePrevious(value) {
    const ref = useRef();
    useEffect(() => {
      ref.current = value;
    }, [value]);
    return ref.current;
  }
  const prevIsStorageToggled = usePrevious(isStorageToggled);

  // Update the main useEffect that handles stop visibility
  useEffect(() => {
    if (!destinationStops.length) return;

    const updatedStops = [...destinationStops];
    let changed = false;

    // For Weight/Volume Based quotes, handle differently
    if (isWeightOrVolumeBased) {
      // Weight/Volume Based: normal stops are always active
      // Post-storage stops are active only if storage is toggled
      updatedStops.forEach((stop, i) => {
        if (stop.isVisible !== false) {
          if (stop.postStorage) {
            const shouldBeActive = isStorageToggled;
            if (stop.isActive !== shouldBeActive) {
              updatedStops[i] = { ...stop, isActive: shouldBeActive };
              changed = true;
            }
          } else {
            // Normal stops always active for Weight/Volume based
            if (stop.isActive !== true) {
              updatedStops[i] = { ...stop, isActive: true };
              changed = true;
            }
          }
        }
      });
    } else {
      // Hourly Rate: existing logic
      if (hideNormalStops) {
        updatedStops.forEach((stop, i) => {
          if (stop.isVisible !== false) {
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
          }
        });
      } else if (isStorageToggled) {
        updatedStops.forEach((stop, i) => {
          if (stop.isVisible !== false && !stop.isActive) {
            updatedStops[i] = { ...stop, isActive: true };
            changed = true;
          }
        });
      } else {
        // storage off => normal => active, post => inactive
        updatedStops.forEach((stop, i) => {
          if (stop.isVisible !== false) {
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
          }
        });
      }
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
  }, [hideNormalStops, isStorageToggled, isWeightOrVolumeBased]);

  // Update the auto-selection logic when expanded & normal hidden
  useEffect(() => {
    if (!isDestinationCollapsed && hideNormalStops && destinationStops.length > 0) {
      const curStop = destinationStops.find((s) => s.id === selectedDestinationStopId);
      if (curStop && !curStop.postStorage) {
        const activePostStorageStops = postStorageStops.filter(s => s.isActive !== false);
        const firstActivePostStorage = activePostStorageStops[0];
        if (firstActivePostStorage && firstActivePostStorage.id !== selectedDestinationStopId) {
          setSelectedDestinationStopId(firstActivePostStorage.id);
        }
      }
    }
  }, [isDestinationCollapsed, hideNormalStops, destinationStops, selectedDestinationStopId, postStorageStops]);

  // Update the selection logic when storage toggles
  useEffect(() => {
    if (!destinationStops.length) return;
  
    const current = destinationStops.find((s) => s.id === selectedDestinationStopId);
    const activeNormalStops = normalStops.filter(s => s.isActive !== false);
    const activePostStorageStops = postStorageStops.filter(s => s.isActive !== false);
  
    // If storage turned off and currently on a post-storage stop
    if (prevIsStorageToggled && !isStorageToggled && current?.postStorage) {
      const firstActiveNormal = activeNormalStops[0];
      if (firstActiveNormal) {
        setSelectedDestinationStopId(firstActiveNormal.id);
      }
    }
  
    // If storage turned on and currently on a normal stop
    // For Weight/Volume based, keep normal stop selected since both are active
    if (!prevIsStorageToggled && isStorageToggled && !current?.postStorage) {
      // Only auto-switch for Hourly Rate when normal stops will be hidden
      if (!isWeightOrVolumeBased && lead.storageItems === 'All items') {
        const firstActivePostStorage = activePostStorageStops[0];
        if (firstActivePostStorage) {
          setSelectedDestinationStopId(firstActivePostStorage.id);
        }
      }
    }
  }, [
    isStorageToggled,
    destinationStops,
    selectedDestinationStopId,
    prevIsStorageToggled,
    postStorageStops,
    normalStops,
    isWeightOrVolumeBased,
    lead.storageItems,
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
    
    // Filter for only visible stops in the same group
    const visibleGroupStops = destinationStops.filter(
      s => s.postStorage === isPostStorage && s.isVisible !== false
    );
    
    const groupIndex = visibleGroupStops.findIndex(s => s.id === currentStop.id);
    
    // Can't remove the first stop in its group
    if (groupIndex === 0) {
      return;
    }
    
    // First update the state locally
    setDestinationStops((prev) =>
      prev.map((s) =>
        s.id === currentStop.id
          ? { ...s, isVisible: false, isActive: false }
          : s
      )
    );
    
    // Then notify the parent component
    onDestinationUpdated(currentStop.id, {
      isVisible: false,
      isActive: false,
    });
  
    // Select the previous visible stop in the same group
    const nextStopInGroup = visibleGroupStops[groupIndex - 1];
    if (nextStopInGroup?.id) {
      setSelectedDestinationStopId(nextStopInGroup.id);
    }
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
      ? destinationStops.filter(s => s.postStorage && s.isVisible !== false).findIndex(s => s.id === currentStop.id) === 0
      : destinationStops.filter(s => !s.postStorage && s.isVisible !== false).findIndex(s => s.id === currentStop.id) === 0;

  const isDeactivateVisible = !isFirstStopInGroup; 
  const visibleDestinationStops = destinationStops.filter((s) => s.isVisible !== false);

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
            stops={visibleDestinationStops}
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
          destinationStops={visibleDestinationStops}
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
          destinationStops={visibleDestinationStops}
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
          destinationStops={visibleDestinationStops}
          defaultTab="destination"
          originStops={originStops} 
          defaultStopId={selectedDestinationStopId}
        />
      )}
    </div>
  );
}

export default DestinationDetails;