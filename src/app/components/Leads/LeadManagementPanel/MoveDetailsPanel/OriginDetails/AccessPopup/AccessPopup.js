import React, { useEffect, useRef, useCallback, useState } from 'react';
import styles from './AccessPopup.module.css';

import Icon from '../../.././../../Icon';

import MainAndStopOffs from '../MainAndStopOffs/MainAndStopOffs';
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

function AccessPopup({
  lead,
  onLeadUpdated,
  setIsAccessPopupVisible,
  defaultTab = 'origin',
  defaultStopIndex = 0,
}) {
  const popupContentRef = useRef(null);

  // local arrays for origin & destination
  const [localOriginStops, setLocalOriginStops] = useState([]);
  const [localDestinationStops, setLocalDestinationStops] = useState([]);

  // 'origin' or 'destination'
  const [selectedPlace, setSelectedPlace] = useState(defaultTab);

  // separate indexes
  const [selectedStopIndexOrigin, setSelectedStopIndexOrigin] = useState(
    defaultTab === 'origin' ? defaultStopIndex : 0
  );
  const [selectedStopIndexDest, setSelectedStopIndexDest] = useState(
    defaultTab === 'destination' ? defaultStopIndex : 0
  );

  // Copy from lead
  useEffect(() => {
    const originStops = Array.isArray(lead.originStops) && lead.originStops.length > 0
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

    const destinationStops = Array.isArray(lead.destinationStops) && lead.destinationStops.length > 0
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

  // Close if clicked outside
  const handleClose = useCallback(() => {
    setIsAccessPopupVisible(false);
  }, [setIsAccessPopupVisible]);

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

  // *** Auto-select first post if "destination" + "All items" hides normal stops ***
  useEffect(() => {
    if (selectedPlace === 'destination') {
      const hideNormal = lead.add_storage && lead.storage_items === 'All items';
      if (hideNormal) {
        const stopsArr = localDestinationStops;
        const curStop = stopsArr[selectedStopIndexDest];
        if (curStop && !curStop.postStorage) {
          // find first post-storage
          const idx = stopsArr.findIndex((s) => s.postStorage);
          if (idx !== -1 && idx !== selectedStopIndexDest) {
            setSelectedStopIndexDest(idx);
          }
        }
      }
    }
  }, [
    selectedPlace,
    lead.add_storage,
    lead.storage_items,
    localDestinationStops,
    selectedStopIndexDest,
  ]);

  // Decide which array + index
  const currentStops =
    selectedPlace === 'origin' ? localOriginStops : localDestinationStops;

  const selectedStopIndex =
    selectedPlace === 'origin' ? selectedStopIndexOrigin : selectedStopIndexDest;

  // setSelectedStopIndex => we track origin & dest separately
  function setSelectedStopIndexGlobal(idx) {
    if (selectedPlace === 'origin') {
      setSelectedStopIndexOrigin(idx);
    } else {
      setSelectedStopIndexDest(idx);
    }
  }

  function handleStopsLocalUpdated(newStops) {
    if (selectedPlace === 'origin') {
      setLocalOriginStops(newStops);
    } else {
      setLocalDestinationStops(newStops);
    }
  }

  const stop = currentStops[selectedStopIndex] || {};

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

  // toggles
  function toggleShuttleTruckRequired() {
    setStopField('shuttleTruckRequired', !stop.shuttleTruckRequired);
  }
  function handleElevatorToggle(value) {
    setStopField('elevatorAtStop', value);
  }
  function toggleElevatorExclusive() {
    setStopField('elevatorExclusive', !stop.elevatorExclusive);
  }

  // dropdown states
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
      <button type="button" className={styles.dropdownButton} onClick={onClick}>
        <span className={styles.oneLineEllipsis}>
          <span className={styles.dropdownPrefix}>{label}</span>
          <span className={styles.dropdownSelected}>{displayValue}</span>
        </span>
        <Icon name="UnfoldMore" className={styles.rightIcon} />
      </button>
    );
  }

  // If user picks "destination" + lead.add_storage + "All items" => hide normal stops
  const hideNormalStops =
    selectedPlace === 'destination' &&
    !!lead.add_storage &&
    lead.storage_items === 'All items';

  // Filter out inactive stops
  const activeStops = currentStops.filter((s) => s.isActive !== false);

  return (
    <div className={styles.popup}>
      <div className={styles.popupContent} ref={popupContentRef}>
        {/* HEADER */}
        <div className={styles.header}>
          <div className={styles.title}>
            <Icon name="Access1" color="white" className={styles.icon} />
            <p>Access</p>
          </div>
          <div className={styles.closeButton}>
            <button onClick={handleClose} aria-label="Close">
              <Icon name="Close" className={styles.closeIcon} />
            </button>
          </div>
        </div>

        {/* TOP SECTION => radio + stops */}
        <div className={styles.topSection}>
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

          {/* Only show .stopOffsPaddingWrapper if more than 1 *active* stop */}
          {activeStops.length > 1 && (
            <div className={styles.stopOffsPaddingWrapper}>
              <MainAndStopOffs
                stops={currentStops}
                onStopsUpdated={handleStopsLocalUpdated}
                selectedStopIndex={selectedStopIndex}
                setSelectedStopIndex={setSelectedStopIndexGlobal}
                placeType={selectedPlace}
                isStorageToggled={selectedPlace === 'destination' && !!lead.add_storage}
                hideNormalStops={hideNormalStops}

                /* Hide the plus buttons: */
                hidePlusButtons
              />
            </div>
          )}
        </div>

        {/* MAIN SCROLLABLE CONTENT => fields */}
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

            {/* Shuttle Truck? */}
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

            {/* Parking Access */}
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

            {/* Distance Door->Truck */}
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

            {/* Steps */}
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

            {/* Terrain */}
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

            {/* Elevator Toggle */}
            <div style={{ height: '25px' }} />
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

            {stop.elevatorAtStop && (
              <div className={styles.elevatorFieldsWrapper}>
                {/* Exclusive use */}
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

                {/* Elevator floors */}
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

                {/* Elevator Size */}
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
