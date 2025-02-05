// src/components/Leads/LeadManagementPanel/MoveDetailsPanel/OriginDetails/AccessPopup/AccessPopup.js

import React, { useEffect, useRef, useCallback, useState } from 'react';
import styles from './AccessPopup.module.css';

// Icons
import { ReactComponent as HouseIcon } from '../../../../../../assets/icons/house.svg';
import { ReactComponent as CloseIcon } from '../../../../../../assets/icons/Close.svg';
import { ReactComponent as UnfoldMoreIcon } from '../../../../../../assets/icons/unfoldmore.svg';

// Reuse the MainAndStopOffs component
import MainAndStopOffs from '../MainAndStopOffs/MainAndStopOffs';

// Import the toggle
import SimpleToggle from '../../../../SimpleToggle/SimpleToggle';

/** Dropdown options */
const biggestTruckAccessOptions = [
  'Semi-trailer',
  'Large 20-26 feet',
  'Medium 14-17 feet',
  'Small 9-12 feet',
];

const parkingAccessOptions = [
  'Private Parking',
  'Curb Side Parking',
  'Curb Side Across Street',
  'Loading Dock Parking',
  'Back Alley',
];

const distanceDoorTruckOptions = [
  'A few feet',
  '20 - 75 ft',
  '76 - 150 ft',
  '151- 225 ft',
  '226 ft - 300 ft',
  '301 - 450 ft',
  '451 - 600 ft',
  '600 ft +',
];

const howManyStepsOptions = [
  'No Steps',
  '1-10 steps',
  '11-20 steps',
  '21-30 steps',
  '31- 40 steps',
  '41+ steps',
];

const terrainOptions = [
  'Flat',
  'Moderate Downhill/ Uphill',
  'Steep Uphill/ Downhill',
];

const elevatorFloorsOptions = [
  '1–5 floors',
  '6–10 floors',
  '11–20 floors',
  '21+ floors',
];

const elevatorSizeOptions = [
  'Small (Up to 4 People)',
  'Medium (5-8 People)',
  'Large (9+ People)',
];

/**
 * AccessPopup
 * -----------
 * Allows editing "Access" info for both Origin & Destination stops.
 *
 * PROPS:
 *   - lead                   => The entire lead object
 *   - onLeadUpdated          => Function(updatedLead)
 *   - setIsAccessPopupVisible => to close the popup
 *   - defaultTab: "origin" or "destination" => which tab to open first
 *   - defaultStopIndex: number => which stop is highlighted initially
 */
function AccessPopup({
  lead,
  onLeadUpdated,
  setIsAccessPopupVisible,
  defaultTab = 'origin',
  defaultStopIndex = 0,
}) {
  const popupContentRef = useRef(null);

  // Local arrays for origin & destination
  const [localOriginStops, setLocalOriginStops] = useState([]);
  const [localDestinationStops, setLocalDestinationStops] = useState([]);

  // Which place? 'origin' or 'destination'
  const [selectedPlace, setSelectedPlace] = useState(defaultTab);

  // Separate selectedStopIndex for origin vs destination
  const [selectedStopIndexOrigin, setSelectedStopIndexOrigin] = useState(
    defaultTab === 'origin' ? defaultStopIndex : 0
  );
  const [selectedStopIndexDest, setSelectedStopIndexDest] = useState(
    defaultTab === 'destination' ? defaultStopIndex : 0
  );

  // On mount => copy from lead into local arrays
  useEffect(() => {
    const originStops = Array.isArray(lead.originStops) && lead.originStops.length > 0
      ? lead.originStops
      : [{
          label: 'Main Address',
          address: '',
          apt: '',
          city: '',
          state: '',
          zip: '',
        }];

    const destinationStops = Array.isArray(lead.destinationStops) && lead.destinationStops.length > 0
      ? lead.destinationStops
      : [{
          label: 'Main Address',
          address: '',
          apt: '',
          city: '',
          state: '',
          zip: '',
        }];

    // Map them to ensure each has the Access fields
    const mappedOrigin = originStops.map((stop) => ({
      ...stop,
      biggestTruckAccess: stop.biggestTruckAccess || '',
      shuttleTruckRequired: !!stop.shuttleTruckRequired,
      parkingAccess: stop.parkingAccess || '',
      distanceDoorTruck: stop.distanceDoorTruck || '',
      howManySteps: stop.howManySteps || '',
      terrainDoorTruck: stop.terrainDoorTruck || '',
      elevatorAtStop: !!stop.elevatorAtStop,
      elevatorExclusive: !!stop.elevatorExclusive,
      elevatorFloors: stop.elevatorFloors || '',
      elevatorSize: stop.elevatorSize || '',
    }));

    const mappedDestination = destinationStops.map((stop) => ({
      ...stop,
      biggestTruckAccess: stop.biggestTruckAccess || '',
      shuttleTruckRequired: !!stop.shuttleTruckRequired,
      parkingAccess: stop.parkingAccess || '',
      distanceDoorTruck: stop.distanceDoorTruck || '',
      howManySteps: stop.howManySteps || '',
      terrainDoorTruck: stop.terrainDoorTruck || '',
      elevatorAtStop: !!stop.elevatorAtStop,
      elevatorExclusive: !!stop.elevatorExclusive,
      elevatorFloors: stop.elevatorFloors || '',
      elevatorSize: stop.elevatorSize || '',
    }));

    setLocalOriginStops(mappedOrigin);
    setLocalDestinationStops(mappedDestination);
  }, [lead]);

  // If user clicks outside => close popup
  const handleClose = useCallback(() => {
    setIsAccessPopupVisible(false);
  }, [setIsAccessPopupVisible]);

  // Outside-click detection
  useEffect(() => {
    function handleClickOutside(e) {
      if (
        popupContentRef.current &&
        !popupContentRef.current.contains(e.target)
      ) {
        handleClose();
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [handleClose]);

  // Decide which array & selectedStopIndex
  const currentStops =
    selectedPlace === 'origin' ? localOriginStops : localDestinationStops;

  const selectedStopIndex =
    selectedPlace === 'origin' ? selectedStopIndexOrigin : selectedStopIndexDest;

  // A helper to switch indexes
  function setSelectedStopIndex(idx) {
    if (selectedPlace === 'origin') {
      setSelectedStopIndexOrigin(idx);
    } else {
      setSelectedStopIndexDest(idx);
    }
  }

  // A helper to update the local stops array
  function handleStopsLocalUpdated(newStops) {
    if (selectedPlace === 'origin') {
      setLocalOriginStops(newStops);
    } else {
      setLocalDestinationStops(newStops);
    }
  }

  // The "current" stop
  const stop = currentStops[selectedStopIndex] || {};

  // A helper to set a field
  function setStopField(fieldName, newValue) {
    const updated = [...currentStops];
    const cloned = { ...updated[selectedStopIndex] };
    cloned[fieldName] = newValue;
    updated[selectedStopIndex] = cloned;

    if (selectedPlace === 'origin') {
      setLocalOriginStops(updated);
    } else {
      setLocalDestinationStops(updated);
    }
  }

  // Save => update lead
  function handleSave() {
    onLeadUpdated({
      ...lead,
      originStops: localOriginStops,
      destinationStops: localDestinationStops,
    });
    setIsAccessPopupVisible(false);
  }

  // Toggling checkboxes
  function toggleShuttleTruckRequired() {
    setStopField('shuttleTruckRequired', !stop.shuttleTruckRequired);
  }
  function handleElevatorToggle(value) {
    setStopField('elevatorAtStop', value);
  }
  function toggleElevatorExclusive() {
    setStopField('elevatorExclusive', !stop.elevatorExclusive);
  }

  // ---------- Dropdown show/hide states ----------
  const [showTruckAccessDropdown, setShowTruckAccessDropdown] = useState(false);
  const [showParkingDropdown, setShowParkingDropdown] = useState(false);
  const [showDistanceDropdown, setShowDistanceDropdown] = useState(false);
  const [showStepsDropdown, setShowStepsDropdown] = useState(false);
  const [showTerrainDropdown, setShowTerrainDropdown] = useState(false);
  const [showElevatorFloorsDropdown, setShowElevatorFloorsDropdown] = useState(false);
  const [showElevatorSizeDropdown, setShowElevatorSizeDropdown] = useState(false);

  function DropdownButton({ label, value, onClick }) {
    const displayValue = value ? value : 'Select';
    return (
      <button
        type="button"
        className={styles.dropdownButton}
        onClick={onClick}
      >
        <span className={styles.oneLineEllipsis}>
          <span className={styles.dropdownPrefix}>{label}</span>
          <span className={styles.dropdownSelected}>{displayValue}</span>
        </span>
        <UnfoldMoreIcon className={styles.rightIcon} />
      </button>
    );
  }

  return (
    <div className={styles.popup}>
      <div className={styles.popupContent} ref={popupContentRef}>
        
        {/* HEADER => pinned at top */}
        <div className={styles.header}>
          <div className={styles.title}>
            <HouseIcon className={styles.icon} />
            <p>Access</p>
          </div>
          <div className={styles.closeButton}>
            <button onClick={handleClose} aria-label="Close">
              <CloseIcon className={styles.closeIcon} />
            </button>
          </div>
        </div>

        {/* TOP SECTION => pinned below header => radio + stopoffs */}
        <div className={styles.topSection}>
          {/* Radio => origin/destination */}
          <div className={styles.radioGroup}>
            <label className={styles.radioLabel}>
              <input
                type="radio"
                name="placeAccess"
                className={styles.radioInput}
                checked={selectedPlace === 'origin'}
                onChange={() => setSelectedPlace('origin')}
              />
              <span className={styles.radioText}>Origin</span>
            </label>

            <label className={styles.radioLabel}>
              <input
                type="radio"
                name="placeAccess"
                className={styles.radioInput}
                checked={selectedPlace === 'destination'}
                onChange={() => setSelectedPlace('destination')}
              />
              <span className={styles.radioText}>Destination</span>
            </label>
          </div>

          {/* Stop-offs */}
          <div className={styles.stopOffsPaddingWrapper}>
            <MainAndStopOffs
              stops={currentStops}
              onStopsUpdated={handleStopsLocalUpdated}
              selectedStopIndex={selectedStopIndex}
              setSelectedStopIndex={setSelectedStopIndex}
              placeType={selectedPlace}
              // If user picks "destination" and lead.add_storage => show post-storage row
              isStorageToggled={selectedPlace === 'destination' && !!lead.add_storage}
            />
          </div>
        </div>

        {/* MAIN SCROLLABLE CONTENT => the fields */}
        <div className={styles.scrollableContent}>
          <div className={styles.formFieldsWrapper}>

            {/* 1) Biggest Truck Access */}
            <div className={styles.inputWrapper}>
              <DropdownButton
                label="Biggest Truck:"
                value={stop.biggestTruckAccess}
                onClick={() => {
                  setShowTruckAccessDropdown(!showTruckAccessDropdown);
                  setShowParkingDropdown(false);
                  setShowDistanceDropdown(false);
                  setShowStepsDropdown(false);
                  setShowTerrainDropdown(false);
                  setShowElevatorFloorsDropdown(false);
                  setShowElevatorSizeDropdown(false);
                }}
              />
              {showTruckAccessDropdown && (
                <ul className={styles.optionsList}>
                  {biggestTruckAccessOptions.map((option) => {
                    const isSelected = stop.biggestTruckAccess === option;
                    return (
                      <li
                        key={option}
                        className={`${styles.option} ${isSelected ? styles.selected : ''}`}
                        onClick={() => {
                          setStopField('biggestTruckAccess', option);
                          setShowTruckAccessDropdown(false);
                        }}
                      >
                        {option}
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>

            {/* 2) Shuttle Truck Required => checkbox */}
            <div className={styles.shuttleCheckboxWrapper}>
              <label className={styles.featureCheckbox}>
                <input
                  type="checkbox"
                  className={styles.hiddenCheckbox}
                  checked={!!stop.shuttleTruckRequired}
                  onChange={toggleShuttleTruckRequired}
                />
                <span className={styles.customBox} />
                <span className={styles.featureLabel}>Shuttle Truck Required</span>
              </label>
            </div>

            {/* 3) Parking Access */}
            <div className={styles.inputWrapper}>
              <DropdownButton
                label="Parking:"
                value={stop.parkingAccess}
                onClick={() => {
                  setShowParkingDropdown(!showParkingDropdown);
                  setShowTruckAccessDropdown(false);
                  setShowDistanceDropdown(false);
                  setShowStepsDropdown(false);
                  setShowTerrainDropdown(false);
                  setShowElevatorFloorsDropdown(false);
                  setShowElevatorSizeDropdown(false);
                }}
              />
              {showParkingDropdown && (
                <ul className={styles.optionsList}>
                  {parkingAccessOptions.map((option) => {
                    const isSelected = stop.parkingAccess === option;
                    return (
                      <li
                        key={option}
                        className={`${styles.option} ${isSelected ? styles.selected : ''}`}
                        onClick={() => {
                          setStopField('parkingAccess', option);
                          setShowParkingDropdown(false);
                        }}
                      >
                        {option}
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>

            {/* 4) Distance door to truck */}
            <div className={styles.inputWrapper}>
              <DropdownButton
                label="Door to truck:"
                value={stop.distanceDoorTruck}
                onClick={() => {
                  setShowDistanceDropdown(!showDistanceDropdown);
                  setShowTruckAccessDropdown(false);
                  setShowParkingDropdown(false);
                  setShowStepsDropdown(false);
                  setShowTerrainDropdown(false);
                  setShowElevatorFloorsDropdown(false);
                  setShowElevatorSizeDropdown(false);
                }}
              />
              {showDistanceDropdown && (
                <ul className={styles.optionsList}>
                  {distanceDoorTruckOptions.map((option) => {
                    const isSelected = stop.distanceDoorTruck === option;
                    return (
                      <li
                        key={option}
                        className={`${styles.option} ${isSelected ? styles.selected : ''}`}
                        onClick={() => {
                          setStopField('distanceDoorTruck', option);
                          setShowDistanceDropdown(false);
                        }}
                      >
                        {option}
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>

            {/* 5) How Many Steps */}
            <div className={styles.inputWrapper}>
              <DropdownButton
                label="How Many Steps:"
                value={stop.howManySteps}
                onClick={() => {
                  setShowStepsDropdown(!showStepsDropdown);
                  setShowTruckAccessDropdown(false);
                  setShowParkingDropdown(false);
                  setShowDistanceDropdown(false);
                  setShowTerrainDropdown(false);
                  setShowElevatorFloorsDropdown(false);
                  setShowElevatorSizeDropdown(false);
                }}
              />
              {showStepsDropdown && (
                <ul className={styles.optionsList}>
                  {howManyStepsOptions.map((option) => {
                    const isSelected = stop.howManySteps === option;
                    return (
                      <li
                        key={option}
                        className={`${styles.option} ${isSelected ? styles.selected : ''}`}
                        onClick={() => {
                          setStopField('howManySteps', option);
                          setShowStepsDropdown(false);
                        }}
                      >
                        {option}
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>

            {/* 6) Terrain from door to truck */}
            <div className={styles.inputWrapper}>
              <DropdownButton
                label="Door to truck Terrain:"
                value={stop.terrainDoorTruck}
                onClick={() => {
                  setShowTerrainDropdown(!showTerrainDropdown);
                  setShowTruckAccessDropdown(false);
                  setShowParkingDropdown(false);
                  setShowDistanceDropdown(false);
                  setShowStepsDropdown(false);
                  setShowElevatorFloorsDropdown(false);
                  setShowElevatorSizeDropdown(false);
                }}
              />
              {showTerrainDropdown && (
                <ul className={styles.optionsList}>
                  {terrainOptions.map((option) => {
                    const isSelected = stop.terrainDoorTruck === option;
                    return (
                      <li
                        key={option}
                        className={`${styles.option} ${isSelected ? styles.selected : ''}`}
                        onClick={() => {
                          setStopField('terrainDoorTruck', option);
                          setShowTerrainDropdown(false);
                        }}
                      >
                        {option}
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>

            {/* Extra spacing before Elevator toggle */}
            <div style={{ height: '25px' }} />

            {/* Elevator Toggle (SimpleToggle) */}
            <div className={styles.elevatorToggleRow}>
              <span className={styles.elevatorToggleLabel}>
                {selectedPlace === 'origin'
                  ? 'Elevator at the Origin'
                  : 'Elevator at the Destination'}
              </span>
              <SimpleToggle
                isToggled={stop.elevatorAtStop}
                onToggle={handleElevatorToggle}
              />
            </div>

            {/* If elevatorAtStop => show "Exclusive use", Elevator floors, Elevator size */}
            {stop.elevatorAtStop && (
              <div className={styles.elevatorFieldsWrapper}>
                {/* 1) Exclusive use checkbox */}
                <div className={styles.exclusiveCheckbox}>
                  <label className={styles.featureCheckbox}>
                    <input
                      type="checkbox"
                      className={styles.hiddenCheckbox}
                      checked={!!stop.elevatorExclusive}
                      onChange={toggleElevatorExclusive}
                    />
                    <span className={styles.customBox} />
                    <span className={styles.featureLabel}>Exclusive use</span>
                  </label>
                </div>

                {/* 2) Elevator floors => dropdown */}
                <div className={styles.inputWrapper}>
                  <DropdownButton
                    label="Elevator floors:"
                    value={stop.elevatorFloors}
                    onClick={() => {
                      setShowElevatorFloorsDropdown(!showElevatorFloorsDropdown);
                      setShowElevatorSizeDropdown(false);
                    }}
                  />
                  {showElevatorFloorsDropdown && (
                    <ul className={styles.optionsList}>
                      {elevatorFloorsOptions.map((option) => {
                        const isSelected = stop.elevatorFloors === option;
                        return (
                          <li
                            key={option}
                            className={`${styles.option} ${isSelected ? styles.selected : ''}`}
                            onClick={() => {
                              setStopField('elevatorFloors', option);
                              setShowElevatorFloorsDropdown(false);
                            }}
                          >
                            {option}
                          </li>
                        );
                      })}
                    </ul>
                  )}
                </div>

                {/* 3) Elevator size => dropdown */}
                <div className={styles.inputWrapper}>
                  <DropdownButton
                    label="Elevator Size:"
                    value={stop.elevatorSize}
                    onClick={() => {
                      setShowElevatorSizeDropdown(!showElevatorSizeDropdown);
                      setShowElevatorFloorsDropdown(false);
                    }}
                  />
                  {showElevatorSizeDropdown && (
                    <ul className={styles.optionsList}>
                      {elevatorSizeOptions.map((option) => {
                        const isSelected = stop.elevatorSize === option;
                        return (
                          <li
                            key={option}
                            className={`${styles.option} ${isSelected ? styles.selected : ''}`}
                            onClick={() => {
                              setStopField('elevatorSize', option);
                              setShowElevatorSizeDropdown(false);
                            }}
                          >
                            {option}
                          </li>
                        );
                      })}
                    </ul>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* STICKY FOOTER => Save button */}
        <div className={styles.stickyFooter}>
          <button
            type="button"
            className={styles.saveButton}
            onClick={handleSave}
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}

export default AccessPopup;
