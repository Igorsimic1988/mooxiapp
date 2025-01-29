// src/components/Leads/LeadManagementPanel/MoveDetailsPanel/OriginDetails/AccessPopup/AccessPopup.js

import React, { useEffect, useRef, useCallback, useState } from 'react';
import styles from './AccessPopup.module.css';

// Icons
import { ReactComponent as HouseIcon } from '../../../../../../assets/icons/house.svg';
import { ReactComponent as CloseIcon } from '../../../../../../assets/icons/Close.svg';

// Reuse the MainAndStopOffs component
import MainAndStopOffs from '../MainAndStopOffs/MainAndStopOffs';

// Import the toggle
import SimpleToggle from '../../../../SimpleToggle/SimpleToggle';

// Dropdown options
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

// Elevator-related dropdowns
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
 * New props:
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

  // local arrays for origin & destination stops
  const [localOriginStops, setLocalOriginStops] = useState([]);
  const [localDestinationStops, setLocalDestinationStops] = useState([]);

  // which place: 'origin' or 'destination'
  const [selectedPlace, setSelectedPlace] = useState(defaultTab);

  // track selectedStopIndex for each place
  const [selectedStopIndexOrigin, setSelectedStopIndexOrigin] = useState(
    defaultTab === 'origin' ? defaultStopIndex : 0
  );
  const [selectedStopIndexDest,   setSelectedStopIndexDest]   = useState(
    defaultTab === 'destination' ? defaultStopIndex : 0
  );

  // On mount => copy from lead
  useEffect(() => {
    const originStops =
      Array.isArray(lead.originStops) && lead.originStops.length > 0
        ? lead.originStops
        : [
            {
              label: 'Main Address',
              address: '',
              apt: '',
              city: '',
              state: '',
              zip: '',
            },
          ];

    const destinationStops =
      Array.isArray(lead.destinationStops) && lead.destinationStops.length > 0
        ? lead.destinationStops
        : [
            {
              label: 'Main Address',
              address: '',
              apt: '',
              city: '',
              state: '',
              zip: '',
            },
          ];

    // Map them to ensure each has the new Access fields
    const mappedOrigin = originStops.map((stop) => ({
      ...stop,
      biggestTruckAccess: stop.biggestTruckAccess || '',
      shuttleTruckRequired: !!stop.shuttleTruckRequired,
      parkingAccess: stop.parkingAccess || '',
      distanceDoorTruck: stop.distanceDoorTruck || '',
      howManySteps: stop.howManySteps || '',
      terrainDoorTruck: stop.terrainDoorTruck || '',

      // Elevator fields
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

  // Clicking outside => close
  const handleClose = useCallback(() => {
    setIsAccessPopupVisible(false);
  }, [setIsAccessPopupVisible]);

  // Outside click detection
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

  // Decide which array of stops to show
  const currentStops = selectedPlace === 'origin' ? localOriginStops : localDestinationStops;

  // Decide which selectedStopIndex
  const selectedStopIndex =
    selectedPlace === 'origin' ? selectedStopIndexOrigin : selectedStopIndexDest;

  function setSelectedStopIndex(idx) {
    if (selectedPlace === 'origin') {
      setSelectedStopIndexOrigin(idx);
    } else {
      setSelectedStopIndexDest(idx);
    }
  }

  // When user modifies the array of stops
  function handleStopsLocalUpdated(newStops) {
    if (selectedPlace === 'origin') {
      setLocalOriginStops(newStops);
    } else {
      setLocalDestinationStops(newStops);
    }
  }

  // The "current" stop object
  const stop = currentStops[selectedStopIndex] || {};

  // A helper to set a field in the current stop
  function setStopField(fieldName, value) {
    const updatedStops = [...currentStops];
    const clonedStop = { ...updatedStops[selectedStopIndex] };
    clonedStop[fieldName] = value;
    updatedStops[selectedStopIndex] = clonedStop;

    if (selectedPlace === 'origin') {
      setLocalOriginStops(updatedStops);
    } else {
      setLocalDestinationStops(updatedStops);
    }
  }

  // Toggling checkboxes & toggles
  function toggleShuttleTruckRequired() {
    setStopField('shuttleTruckRequired', !stop.shuttleTruckRequired);
  }
  function handleElevatorToggle(newValue) {
    setStopField('elevatorAtStop', newValue);
  }
  function toggleElevatorExclusive() {
    setStopField('elevatorExclusive', !stop.elevatorExclusive);
  }

  // Save => update lead
  function handleSave() {
    // Merge back into lead
    onLeadUpdated({
      ...lead,
      originStops: localOriginStops,
      destinationStops: localDestinationStops,
    });
    setIsAccessPopupVisible(false);
  }

  // Dropdown states
  const [showTruckAccessDropdown, setShowTruckAccessDropdown] = useState(false);
  const [showParkingDropdown, setShowParkingDropdown] = useState(false);
  const [showDistanceDropdown, setShowDistanceDropdown] = useState(false);
  const [showStepsDropdown, setShowStepsDropdown] = useState(false);
  const [showTerrainDropdown, setShowTerrainDropdown] = useState(false);
  const [showElevatorFloorsDropdown, setShowElevatorFloorsDropdown] = useState(false);
  const [showElevatorSizeDropdown, setShowElevatorSizeDropdown] = useState(false);

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
            />
          </div>
        </div>

        {/* MAIN SCROLLABLE CONTENT => the fields */}
        <div className={styles.scrollableContent}>
          <div className={styles.formFieldsWrapper}>
            {/* 1) Biggest Truck Access */}
            <div className={styles.inputWrapper}>
              <button
                type="button"
                className={styles.dropdownButton}
                onClick={() => {
                  setShowTruckAccessDropdown((prev) => !prev);
                  setShowParkingDropdown(false);
                  setShowDistanceDropdown(false);
                  setShowStepsDropdown(false);
                  setShowTerrainDropdown(false);
                }}
              >
                <div className={styles.dropdownLabel}>
                  {stop.biggestTruckAccess ? (
                    <span className={styles.dropdownSelected}>
                      {stop.biggestTruckAccess}
                    </span>
                  ) : (
                    <>
                      <span className={styles.dropdownPrefix}>Biggest Truck Access:</span>
                      <span className={styles.dropdownPlaceholder}>Select</span>
                    </>
                  )}
                </div>
              </button>

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
            <div
              className={styles.shuttleCheckboxWrapper}
              style={{ margin: '21px 0' }}
            >
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
              <button
                type="button"
                className={styles.dropdownButton}
                onClick={() => {
                  setShowParkingDropdown((prev) => !prev);
                  setShowTruckAccessDropdown(false);
                  setShowDistanceDropdown(false);
                  setShowStepsDropdown(false);
                  setShowTerrainDropdown(false);
                }}
              >
                <div className={styles.dropdownLabel}>
                  {stop.parkingAccess ? (
                    <span className={styles.dropdownSelected}>
                      {stop.parkingAccess}
                    </span>
                  ) : (
                    <>
                      <span className={styles.dropdownPrefix}>Parking Access:</span>
                      <span className={styles.dropdownPlaceholder}>Select</span>
                    </>
                  )}
                </div>
              </button>

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
              <button
                type="button"
                className={styles.dropdownButton}
                onClick={() => {
                  setShowDistanceDropdown((prev) => !prev);
                  setShowTruckAccessDropdown(false);
                  setShowParkingDropdown(false);
                  setShowStepsDropdown(false);
                  setShowTerrainDropdown(false);
                }}
              >
                <div className={styles.dropdownLabel}>
                  {stop.distanceDoorTruck ? (
                    <span className={styles.dropdownSelected}>
                      {stop.distanceDoorTruck}
                    </span>
                  ) : (
                    <>
                      <span className={styles.dropdownPrefix}>Distance door to truck:</span>
                      <span className={styles.dropdownPlaceholder}>Select</span>
                    </>
                  )}
                </div>
              </button>

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
              <button
                type="button"
                className={styles.dropdownButton}
                onClick={() => {
                  setShowStepsDropdown((prev) => !prev);
                  setShowTruckAccessDropdown(false);
                  setShowParkingDropdown(false);
                  setShowDistanceDropdown(false);
                  setShowTerrainDropdown(false);
                }}
              >
                <div className={styles.dropdownLabel}>
                  {stop.howManySteps ? (
                    <span className={styles.dropdownSelected}>
                      {stop.howManySteps}
                    </span>
                  ) : (
                    <>
                      <span className={styles.dropdownPrefix}>How Many Steps:</span>
                      <span className={styles.dropdownPlaceholder}>Select</span>
                    </>
                  )}
                </div>
              </button>

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
              <button
                type="button"
                className={styles.dropdownButton}
                onClick={() => {
                  setShowTerrainDropdown((prev) => !prev);
                  setShowTruckAccessDropdown(false);
                  setShowParkingDropdown(false);
                  setShowDistanceDropdown(false);
                  setShowStepsDropdown(false);
                }}
              >
                <div className={styles.dropdownLabel}>
                  {stop.terrainDoorTruck ? (
                    <span className={styles.dropdownSelected}>
                      {stop.terrainDoorTruck}
                    </span>
                  ) : (
                    <>
                      <span className={styles.dropdownPrefix}>Terrain from door to truck:</span>
                      <span className={styles.dropdownPlaceholder}>Select</span>
                    </>
                  )}
                </div>
              </button>

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

            {/* ---------- 25px space before Elevator toggle ---------- */}
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
                  <button
                    type="button"
                    className={styles.dropdownButton}
                    onClick={() => {
                      setShowElevatorFloorsDropdown((prev) => !prev);
                      setShowElevatorSizeDropdown(false);
                    }}
                  >
                    <div className={styles.dropdownLabel}>
                      {stop.elevatorFloors ? (
                        <span className={styles.dropdownSelected}>
                          {stop.elevatorFloors}
                        </span>
                      ) : (
                        <>
                          <span className={styles.dropdownPrefix}>Elevator floors:</span>
                          <span className={styles.dropdownPlaceholder}>Select</span>
                        </>
                      )}
                    </div>
                  </button>

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
                  <button
                    type="button"
                    className={styles.dropdownButton}
                    onClick={() => {
                      setShowElevatorSizeDropdown((prev) => !prev);
                      setShowElevatorFloorsDropdown(false);
                    }}
                  >
                    <div className={styles.dropdownLabel}>
                      {stop.elevatorSize ? (
                        <span className={styles.dropdownSelected}>
                          {stop.elevatorSize}
                        </span>
                      ) : (
                        <>
                          <span className={styles.dropdownPrefix}>Elevator Size:</span>
                          <span className={styles.dropdownPlaceholder}>Select</span>
                        </>
                      )}
                    </div>
                  </button>

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
