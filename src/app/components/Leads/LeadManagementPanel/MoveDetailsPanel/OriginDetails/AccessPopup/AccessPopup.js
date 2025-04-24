import React, { useEffect, useRef, useCallback, useState } from 'react';
import styles from './AccessPopup.module.css';

import Icon from '../../.././../../Icon';

import MainAndStopOffs from '../MainAndStopOffs/MainAndStopOffs';
import SimpleToggle from '../../../../SimpleToggle/SimpleToggle';
import { useUiState } from '../../UiStateContext';

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
  onDestinationUpdated,
  onOriginUpdated ,
  setIsAccessPopupVisible,
  defaultTab = 'origin',
  destinationStops = [],
  originStops = [],
}) {
  const popupContentRef = useRef(null);
  // 'origin' or 'destination'
  const [selectedPlace, setSelectedPlace] = useState(defaultTab);
  const [localStop, setLocalStop] = useState({});
  const {
    selectedOriginStopId,
    setSelectedOriginStopId,
    selectedDestinationStopId,
    setSelectedDestinationStopId,
  } = useUiState();
  
  console.log(selectedDestinationStopId, ' destination')
  console.log(selectedOriginStopId, ' origin')


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

  // Decide which array + index
  const currentStops =
    selectedPlace === 'origin' ? originStops : destinationStops;

  const selectedStopId =
    selectedPlace === 'origin' ? selectedOriginStopId : selectedDestinationStopId;

  function setSelectedStopIdGlobal(id) {
    if (selectedPlace === 'origin') {
      setSelectedOriginStopId(id);
    } else {
      setSelectedDestinationStopId(id);
    }
  }
  useEffect(() => {
    if (!selectedStopId) return;
  
    const found = currentStops.find((s) => s.id === selectedStopId);
    if (found) {
      setLocalStop(found);
    }
  }, [selectedStopId, currentStops, selectedPlace]);
  

  // cc23 postStor je u active ali je stop normal c3d4
  // 18b7 je origin

  useEffect(() => {
    if (selectedPlace === 'origin' && originStops.length > 0) {
      setSelectedOriginStopId((prev) => {
        const exists = originStops.find(s => s.id === prev);
        return exists ? prev : originStops[0].id;
      });
    }
  
    if (selectedPlace === 'destination' && destinationStops.length > 0) {
      const hideNormal = lead.addStorage && lead.storageItems === 'All items';
      const stopsToUse = hideNormal
        ? destinationStops.filter(s => s.postStorage)
        : destinationStops;
  
        setSelectedDestinationStopId((prev) => {
        const exists = stopsToUse.find(s => s.id === prev);
        return exists ? prev : stopsToUse[0]?.id || null;
      });
    }
  }, [selectedPlace, originStops, destinationStops, lead.addStorage, lead.storageItems, setSelectedDestinationStopId, setSelectedOriginStopId]);
  

  function setStopField(fieldName, newValue) {
    if (!selectedStopId) return;
    setLocalStop((prev) => ({
      ...prev,
      [fieldName]: newValue,
  }));
  }
  

  // Save => update lead
  function handleSave() {
    if (!localStop?.id) return;

  if (selectedPlace === 'origin') {
    onOriginUpdated(localStop.id, localStop);
  } else {
    onDestinationUpdated(localStop.id, localStop);
  }
  
    setIsAccessPopupVisible(false);
  }

  // toggles
  function toggleShuttleTruckRequired() {
    setStopField('shuttleTruckRequired', !localStop.shuttleTruckRequired);
  }
  function handleElevatorToggle(value) {
    setStopField('elevatorAtStop', value);
  }
  function toggleElevatorExclusive() {
    setStopField('elevatorExclusive', !localStop.elevatorExclusive);
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
    !!lead.addStorage &&
    lead.storageItems === 'All items';

  // Filter out inactive stops
  const activeStops = (currentStops || []).filter((s) => s.isActive !== false);
  console.log(activeStops, '   active')
  console.log('originStops:', originStops);
console.log('active origin stops:', originStops.filter(s => s.isActive !== false));

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
                onChange={() => {
                  setSelectedPlace('origin');
                  const originToUse = originStops.find(s => s.id === selectedOriginStopId);
                  if (originToUse) {
                    setLocalStop(originToUse);
                  }
                }}
              />
              <span className={styles.radioText}>Origin</span>
            </label>
            <label className={styles.radioLabel}>
              <input
                type="radio"
                name="placeAccess"
                className={styles.radioInput}
                checked={selectedPlace === 'destination'}
                onChange={() => {console.log('change to desti');setSelectedPlace('destination');}}
              />
              <span className={styles.radioText}>Destination</span>
            </label>
          </div>

          {/* Only show .stopOffsPaddingWrapper if more than 1 *active* stop */}
          {activeStops.length > 1 && (
            <div className={styles.stopOffsPaddingWrapper}>
              <MainAndStopOffs
                stops={currentStops}
                selectedStopId={selectedStopId}
                setSelectedStopId={setSelectedStopIdGlobal}
                placeType={selectedPlace}
                isStorageToggled={selectedPlace === 'destination' && !!lead.addStorage}
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
                value={localStop.biggestTruckAccess}
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
                    const isSelected = localStop.biggestTruckAccess === option;
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
                  checked={!!localStop.shuttleTruckRequired}
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
                value={localStop.parkingAccess}
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
                    const isSelected = localStop.parkingAccess === option;
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
                value={localStop.distanceDoorTruck}
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
                    const isSelected = localStop.distanceDoorTruck === option;
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
                value={localStop.howManySteps}
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
                    const isSelected = localStop.howManySteps === option;
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
                value={localStop.terrainDoorTruck}
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
                    const isSelected = localStop.terrainDoorTruck === option;
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
                isToggled={localStop.elevatorAtStop}
                onToggle={handleElevatorToggle}
              />
            </div>

            {localStop.elevatorAtStop && (
              <div className={styles.elevatorFieldsWrapper}>
                {/* Exclusive use */}
                <div className={styles.exclusiveCheckbox}>
                  <label className={styles.featureCheckbox}>
                    <input
                      type="checkbox"
                      className={styles.hiddenCheckbox}
                      checked={!!localStop.elevatorExclusive}
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
                    value={localStop.elevatorFloors}
                    onClick={() => {
                      setShowElevatorFloorsDropdown(!showElevatorFloorsDropdown);
                      setShowElevatorSizeDropdown(false);
                    }}
                  />
                  {showElevatorFloorsDropdown && (
                    <ul className={styles.optionsList}>
                      {elevatorFloorsOptions.map((option) => {
                        const isSelected = localStop.elevatorFloors === option;
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
                    value={localStop.elevatorSize}
                    onClick={() => {
                      setShowElevatorSizeDropdown(!showElevatorSizeDropdown);
                      setShowElevatorFloorsDropdown(false);
                    }}
                  />
                  {showElevatorSizeDropdown && (
                    <ul className={styles.optionsList}>
                      {elevatorSizeOptions.map((option) => {
                        const isSelected = localStop.elevatorSize === option;
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
