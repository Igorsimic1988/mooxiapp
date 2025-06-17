"use client";

import React, { useEffect, useState, useRef } from 'react';

import Icon from '../../../../Icon';

import SimpleToggle from '../../../SimpleToggle/SimpleToggle';
import styles from './OriginDetails.module.css';

// The three popups
import PlacePopup from './PlacePopup/PlacePopup';
import AccessPopup from './AccessPopup/AccessPopup';
import ServicesPopup from './ServicesPopup/ServicesPopup';

// Reusable row of stops
import MainAndStopOffs from './MainAndStopOffs/MainAndStopOffs';
import { useUiState } from '../UiStateContext';
import { useInventoryContext } from '../InventoryContext';
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createOrigin } from 'src/app/services/originsService';
import { useAccessToken } from "src/app/lib/useAccessToken";


/** Generate 15-min increments from 7:00 AM to midnight, excluding midnight duplication */
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

function OriginDetails({
  lead,
  onShowInventory, 
  onDestinationUpdated,
  onOriginUpdated,
  destinationStops,
  setOriginStops,
  originStops,
}) {
    const token = useAccessToken();
    const queryClient = useQueryClient();
  const createOriginMutation = useMutation({
    mutationFn: (newOriginData) =>createOrigin({originsData: newOriginData, leadId:lead.id,  token: token}),
    onSuccess:(createdOrigin) => {
      console.log("New origin created:", createdOrigin);
    },
    onError: (err) => {
      console.log(err)
    }
  });

  const handleAddNormalStop = () => {
    const reusableStop = originStops.find(
      (s) => s.isVisible === false
    );
  
    if (reusableStop) {
      onOriginUpdated(reusableStop.id, {
        isVisible: true,
        isActive: true,
      });
  
      setOriginStops((prev) =>
        prev.map((s) =>
          s.id === reusableStop.id
            ? { ...s, isVisible: true, isActive: true }
            : s
        )
      );
  
      setSelectedOriginStopId(reusableStop.id);
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
    };
    createOriginMutation.mutate(newStop, {
      onSuccess: (createdOrigin) => {
        console.log("New origin created:", createdOrigin);
        setOriginStops((prev) => [...prev, createdOrigin]);
        setSelectedOriginStopId(createdOrigin.id);
        queryClient.invalidateQueries(['origins']);
      },
      onError: (err) => {
        console.error('Failed to create origin stop', err);
      }
    });
  }
  // ---------- ORIGIN STOPS ----------
  const { inventoryByStop } = useInventoryContext();
  
  // Calculate totals across all stops
  const inventoryTotals = React.useMemo(() => {
    let totalFurniture = 0;
    let totalBoxes = 0;
    let totalCuft = 0;
    let totalLbs = 0;
    
    // Box items identified by name and ID
    const boxItemNames = [
      'Plastic Tote Large',
      'Plastic Tote Medium',
      'Plastic Tote Small',
      'Plastic Tote Flat',
      'Box Wardrobe 12cuft',
      'Box Wardrobe Short',
      'Box Lamp Large',
      'Box Extra Large 6 cuft',
      'Box Dishpack',
      'Box Large 4,5 cuft',
      'Box Medium 3 cuft',
      'Box Small 1,5 cuft',
      'Box Book ',
      'Box File Large',
      'Box File Small',
      'Box Mirror Picture Large',
      'Box Mirror Picture Small',
      'Box TV 60 - 75 inch',
      'Box TV 50 - 60 inch',
      'Box TV 32 - 49 inch',
      'Box TV 14 - 32 inch',
      'Box TV Large',
      'Box TV Medium',
      'Box TV Small',
    ];
    
    const boxItemIds = [
      '127', '128', '129', '130', '131', '438',
      ...Array.from({ length: 20 }, (_, i) => (529 + i).toString()),
    ];
    
    // Calculate across all stops
    Object.values(inventoryByStop).forEach((stopData) => {
      const itemsByRoom = stopData.itemsByRoom || {};
      
      Object.values(itemsByRoom).forEach((items) => {
        items.forEach((itemInstance) => {
          const cuftVal = parseFloat(itemInstance.cuft) || 0;
          const lbsVal = parseFloat(itemInstance.lbs) || 0;
          
          totalCuft += cuftVal;
          totalLbs += lbsVal;
          
          const itemName = itemInstance.name || itemInstance.item?.name || '';
          const itemId = (itemInstance.furnitureItemId || itemInstance.itemId || '').toString();
          
          if (boxItemNames.includes(itemName) || boxItemIds.includes(itemId)) {
            totalBoxes += 1;
          } else {
            totalFurniture += 1;
          }
        });
      });
    });
    
    return {
      totalFurniture,
      totalBoxes,
      totalCuft: Math.round(totalCuft),
      totalLbs: Math.round(totalLbs),
    };
  }, [inventoryByStop]);

  // Instead of local useState, we read isCollapsed from props:
  const {selectedOriginStopId, setSelectedOriginStopId, isOriginCollapsed, setIsOriginCollapsed} = useUiState();
  const toggleCollapse = () => setIsOriginCollapsed((prev) => !prev);
  
  // Enhanced selection logic with fallback
  useEffect(() => {
    const visibleStops = originStops.filter(s => s.isVisible !== false && s.isActive !== false);
    
    // If we have visible stops
    if (visibleStops.length > 0) {
      // If nothing is selected, select the first visible stop (Main Address)
      if (!selectedOriginStopId) {
        setSelectedOriginStopId(visibleStops[0].id);
      } else {
        // Check if the currently selected stop is still visible and active
        const currentlySelected = visibleStops.find(s => s.id === selectedOriginStopId);
        if (!currentlySelected) {
          // If not, fallback to the first visible stop (Main Address)
          setSelectedOriginStopId(visibleStops[0].id);
        }
      }
    }
  }, [originStops, selectedOriginStopId, setSelectedOriginStopId]);

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

  // ---------- INPUT FOCUS STATES ----------
  const [focusedAddressInput, setFocusedAddressInput] = useState(null);
  const [optionDropdownActive, setOptionDropdownActive] = useState(false);
  const [typeDropdownActive, setTypeDropdownActive] = useState(false);
  const [startDropdownActive, setStartDropdownActive] = useState(false);
  const [endDropdownActive, setEndDropdownActive] = useState(false);


  // ---------- Current Stop ----------
  const currentStop = originStops.find((s) => s.id === selectedOriginStopId) || {};


  /**
   * Deactivate => remove this stop, unless it's "Main Address"
   */
  const [fallbackOriginStopId, setFallbackOriginStopId] = useState(null);

  function handleDeactivateThisStop() {
    if (!currentStop?.id) return;
    
    // Filter for only visible stops
    const visibleStops = originStops.filter(s => s.isVisible !== false);
    const originIndex = visibleStops.findIndex(s => s.id === currentStop.id);
    
    // Can't remove the first stop (Main Address)
    if (originIndex === 0) return;
    
    const nextStop = visibleStops[originIndex - 1];
    onOriginUpdated(currentStop.id, { isVisible: false, isActive: false});
    setOriginStops((prev) =>
      prev.map((s) =>
        s.id === currentStop.id
          ? { ...s, isVisible: false, isActive: false }
          : s
      )
    );
  
    if (nextStop?.id) {
      setSelectedOriginStopId(nextStop.id);
    }    
   }
   useEffect(() => {
    if (fallbackOriginStopId) {
      setSelectedOriginStopId(fallbackOriginStopId);
      setFallbackOriginStopId(null); 
    }
  }, [fallbackOriginStopId]);
  

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
   */
  function isServicesDataComplete(stop) {
    return !!stop.packingOption?.trim();
  }

  // If user changes an address field => update that stop
  const handleStopFieldChange = (fieldName, newValue) => {
    const stop = originStops.find((s) => s.id === selectedOriginStopId);
    if (!stop?.id) return;
  const updatedStop = { ...stop, [fieldName]: newValue };
  setOriginStops((prev) =>
    prev.map((s) => (s.id === selectedOriginStopId ? updatedStop : s))
  );
  onOriginUpdated(stop.id, { [fieldName]: newValue });
  };

  // ---------- Time restrictions ----------

  function getCurrentStopRestrictions() {
    return {
      isEnabled: currentStop.timeRestriction ?? false,
      option: currentStop.timeRestrictionOption || 'Select',
      restrictionType: currentStop.timeRestrictionType || 'Select',
      startTime: currentStop.timeRestrictionStartTime || '',
      endTime: currentStop.timeRestrictionEndTime || '',
    };
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
      
      // Reset focus state if clicking outside any input
      if (!e.target.closest(`.${styles.inputContainer}`)) {
        setFocusedAddressInput(null);
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

  // Set active states when dropdowns open
  useEffect(() => {
    setOptionDropdownActive(optionDropdownOpen);
    setTypeDropdownActive(typeDropdownOpen);
    setStartDropdownActive(startDropdownOpen);
    setEndDropdownActive(endDropdownOpen);
  }, [optionDropdownOpen, typeDropdownOpen, startDropdownOpen, endDropdownOpen]);

  const updateCurrentStopRestrictions = (partialObj) => {
    if (!currentStop?.id) return;
    const updates = {};
    if ('isEnabled' in partialObj)
      updates.timeRestriction = partialObj.isEnabled;
    if ('option' in partialObj)
      updates.timeRestrictionOption = partialObj.option;
    if ('restrictionType' in partialObj)
      updates.timeRestrictionType = partialObj.restrictionType;
    if ('startTime' in partialObj)
      updates.timeRestrictionStartTime = partialObj.startTime;
    if ('endTime' in partialObj)
      updates.timeRestrictionEndTime = partialObj.endTime;
    setOriginStops((prev) =>
      prev.map((stop) =>
        stop.id === selectedOriginStopId ? { ...stop, ...updates } : stop
      )
    );
    onOriginUpdated(currentStop.id, updates);
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
   * line1 => typeOfPlace
   * line2 => moveSize - howManyStories
   * line3 => features + "COI"
   */
  function renderPlaceSummary(stop) {
    const { typeOfPlace, moveSize, howManyStories, features, needsCOI } = stop || {};

    const line1 = typeOfPlace?.trim() || '';
    let line2 = '';
    if (moveSize?.trim() && howManyStories?.trim()) {
      line2 = `${moveSize} - ${howManyStories}`;
    } else if (moveSize?.trim()) {
      line2 = moveSize;
    } else if (howManyStories?.trim()) {
      line2 = howManyStories;
    }

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

  /**
   * SERVICES Summary
   * line1 => packingOption
   * line2 => itemsToBeTakenApart => "Disassembly", hoistItems => "Hoisting", craneNeeded => "Crane"
   * line3 => additionalServices => each prefixed "+"
   */
  function renderServicesSummary(stop) {
    const {
      packingOption,
      itemsToBeTakenApart,
      hoistItems,
      craneNeeded,
      additionalServices,
    } = stop || {};

    const line1 = packingOption?.trim() || '';

    const bits = [];
    if (itemsToBeTakenApart) bits.push('Disassembly');
    if (hoistItems) bits.push('Hoisting');
    if (craneNeeded) bits.push('Crane');
    const line2 = bits.join(', ');

    let line3 = '';
    if (Array.isArray(additionalServices) && additionalServices.length > 0) {
      line3 = additionalServices.map((svc) => `+${svc}`).join(', ');
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

  // Summaries
  const placeSummaryElement = renderPlaceSummary(currentStop);
  const accessSummaryElement = renderAccessSummary(currentStop);
  const servicesSummaryElement = renderServicesSummary(currentStop);

  // Classes to remove dotted border
  const removeDottedPlace = isPlaceDataComplete(currentStop) ? styles.placeNoDotted : '';
  const removeDottedAccess = isAccessDataComplete(currentStop) ? styles.accessNoDotted : '';
  const removeDottedServices = isServicesDataComplete(currentStop) ? styles.servicesNoDotted : '';

  // Decide if "Deactivate" is visible => hide if "Main Address"
  const canDeactivate =
  originStops.filter(s => s.isVisible !== false).findIndex((s) => s.id === selectedOriginStopId) !== 0;
  const visibleOriginStops = originStops.filter((s) => s.isVisible !== false);

  return (
    <div className={styles.originContainer}>
      <div className={styles.originHeader}>
        <span className={styles.originTitle}>Origin</span>
        <button className={styles.minusButton} onClick={toggleCollapse}>
          {isOriginCollapsed ? '+' : '-'}
        </button>
      </div>

      {!isOriginCollapsed && (
        <>
          {/* Row of origin stops + plus button */}
          <MainAndStopOffs
            stops={visibleOriginStops}
            onAddNormalStop={handleAddNormalStop}
            placeType="origin"
          />

          {/* Address Inputs */}
          <div className={styles.propertySection}>
            <div className={styles.propertySectionHeader}>
              <span className={styles.propertyAddressText}>Property Address</span>

              {/* Deactivate link => hidden if "Main Address" */}
              {canDeactivate && (
                <button
                  type="button"
                  className={styles.deactivateStopLink}
                  onClick={handleDeactivateThisStop}
                >
                  Remove this stop
                </button>
              )}
            </div>

            <div className={`${styles.inputContainer} ${focusedAddressInput === 'address' ? styles.activeInput : ''}`}>
              <input
                type="text"
                className={styles.addressInput}
                placeholder="Property Address"
                value={currentStop.address || ''}
                onChange={(e) => handleStopFieldChange('address', e.target.value)}
                onFocus={() => setFocusedAddressInput('address')}
              />
              <div className={styles.inputIconContainer}>
                <Icon name="Location" className={styles.inputIcon} />
              </div>
            </div>

            <div className={styles.twoInputsRow}>
              <div className={`${styles.inputContainer} ${focusedAddressInput === 'apt' ? styles.activeInput : ''}`}>
                <input
                  type="text"
                  className={styles.addressInput}
                  placeholder="Apt/Suite"
                  value={currentStop.apt || ''}
                  onChange={(e) => handleStopFieldChange('apt', e.target.value)}
                  onFocus={() => setFocusedAddressInput('apt')}
                />
              </div>
              <div className={`${styles.inputContainer} ${focusedAddressInput === 'city' ? styles.activeInput : ''}`}>
                <input
                  type="text"
                  className={styles.addressInput}
                  placeholder="City"
                  value={currentStop.city || ''}
                  onChange={(e) => handleStopFieldChange('city', e.target.value)}
                  onFocus={() => setFocusedAddressInput('city')}
                />
              </div>
            </div>

            <div className={styles.twoInputsRow}>
              <div className={`${styles.inputContainer} ${focusedAddressInput === 'state' ? styles.activeInput : ''}`}>
                <input
                  type="text"
                  className={styles.addressInput}
                  placeholder="State"
                  value={currentStop.state || ''}
                  onChange={(e) => handleStopFieldChange('state', e.target.value)}
                  onFocus={() => setFocusedAddressInput('state')}
                />
              </div>
              <div className={`${styles.inputContainer} ${focusedAddressInput === 'zip' ? styles.activeInput : ''}`}>
                <input
                  type="text"
                  className={styles.addressInput}
                  placeholder="Zip code"
                  value={currentStop.zipCode || ''}
                  onChange={(e) => handleStopFieldChange('zipCode', e.target.value)}
                  onFocus={() => setFocusedAddressInput('zipCode')}
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
                <Icon name="Place1" className={styles.propertyItemIcon} />
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
                <Icon name="Access1" color="#FAA61A" className={styles.propertyItemIcon} />
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
                <Icon name="Services1" color="#F65676" className={styles.propertyItemIcon} />
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
                    className={`${styles.inputContainer} ${styles.dropdownWrapper} ${optionDropdownActive ? styles.activeInput : ''}`}
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
                      <Icon name="UnfoldMore" className={styles.moreIcon} />
                    </div>
                    {optionDropdownOpen && (
                      <div className={styles.dropdownMenu}>
                        {timeRestrictionOptions.map((opt) => (
                          <div
                            key={opt}
                            className={`${styles.dropdownOption} ${currentTR.option === opt ? styles.selectedOption : ''}`}
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
                    className={`${styles.inputContainer} ${styles.dropdownWrapper} ${typeDropdownActive ? styles.activeInput : ''}`}
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
                      <Icon name="UnfoldMore" className={styles.moreIcon} />
                    </div>
                    {typeDropdownOpen && (
                      <div className={styles.dropdownMenu}>
                        {timeRestrictionTypes.map((typ) => (
                          <div
                            key={typ}
                            className={`${styles.dropdownOption} ${currentTR.restrictionType === typ ? styles.selectedOption : ''}`}
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
                    className={`${styles.inputContainer} ${styles.dropdownWrapper} ${startDropdownActive ? styles.activeInput : ''}`}
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
                      <Icon name="UnfoldMore" className={styles.moreIcon} />
                    </div>
                    {startDropdownOpen && (
                      <div className={styles.dropdownMenu}>
                        {timeOptions.map((t) => (
                          <div
                            key={t}
                            className={`${styles.dropdownOption} ${currentTR.startTime === t ? styles.selectedOption : ''}`}
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
                    className={`${styles.inputContainer} ${styles.dropdownWrapper} ${endDropdownActive ? styles.activeInput : ''}`}
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
                      <Icon name="UnfoldMore" className={styles.moreIcon} />
                    </div>
                    {endDropdownOpen && (
                      <div className={styles.dropdownMenu}>
                        {timeOptions.map((t) => (
                          <div
                            key={t}
                            className={`${styles.dropdownOption} ${currentTR.endTime === t ? styles.selectedOption : ''}`}
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
                <Icon name="MyInventory" className={styles.myInventoryIcon} />
              </button>
            </div>
            <div className={styles.inventorySummary}>
              <div>Volume (cu ft): {inventoryTotals.totalCuft}</div>
              <div>Weight (lbs): {inventoryTotals.totalLbs}</div>
              <div>Total furniture: {inventoryTotals.totalFurniture}</div>
              <div>Total boxes: {inventoryTotals.totalBoxes}</div>
            </div>
          </div>
        </>
      )}

      {/* POPUPS */}
      {isPlacePopupOpen && originStops.length > 0 && selectedOriginStopId &&(
        <PlacePopup
          lead={lead}
          onOriginUpdated={onOriginUpdated}
          onDestinationUpdated={onDestinationUpdated}
          setIsPlacePopupVisible={setIsPlacePopupOpen}
          originStops={visibleOriginStops}
          destinationStops={destinationStops}
          defaultTab="origin"
          defaultStopId={selectedOriginStopId}
        />
      )}
      {isAccessPopupOpen &&  originStops.length > 0 && selectedOriginStopId &&(
        <AccessPopup
          lead={lead}
          onOriginUpdated={onOriginUpdated}
          onDestinationUpdated={onDestinationUpdated}
          setIsAccessPopupVisible={setIsAccessPopupOpen}
          originStops={visibleOriginStops}
          destinationStops={destinationStops}
          defaultTab="origin"
          defaultStopId={selectedOriginStopId}
        />
      )}
      {isServicesPopupOpen && originStops.length > 0 && selectedOriginStopId && (
        <ServicesPopup
          lead={lead}
          onOriginUpdated={onOriginUpdated}
          onDestinationUpdated={onDestinationUpdated}
          setIsServicesPopupVisible={setIsServicesPopupOpen}
          originStops={visibleOriginStops}
          destinationStops={destinationStops}
          defaultTab="origin"
          defaultStopId={selectedOriginStopId}
        />
      )}
    </div>
  );
}

export default OriginDetails;