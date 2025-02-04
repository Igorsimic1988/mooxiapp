// src/components/Leads/LeadManagementPanel/MoveDetailsPanel/OriginDetails/MainAndStopOffs/MainAndStopOffs.js

import React from 'react';
import styles from './MainAndStopOffs.module.css';

/**
 * MainAndStopOffs
 * ---------------
 * PROPS:
 *   - stops: the array of stops (e.g. lead.originStops or lead.destinationStops)
 *   - onStopsUpdated: function(newStops) => pass updated array up
 *   - selectedStopIndex: which index is currently selected
 *   - setSelectedStopIndex: function => sets the current stop index
 *   - placeType: either "origin" or "destination" (optional; default "origin")
 */
function MainAndStopOffs({
  stops,
  onStopsUpdated,
  selectedStopIndex,
  setSelectedStopIndex,
  placeType = 'origin', // 'origin' or 'destination'
}) {
  // If the passed-in array is empty, create an initial main label (depending on placeType).
  if (!Array.isArray(stops) || stops.length === 0) {
    const mainLabel = (placeType === 'destination') ? 'Main Drop off' : 'Main Address';
    stops = [
      { label: mainLabel, address: '', apt: '', city: '', state: '', zip: '' },
    ];
  }

  // For highlighting
  const isSelected = (index) => index === selectedStopIndex;
  const getButtonClass = (index) =>
    isSelected(index)
      ? `${styles.mainAddressButton} ${styles.buttonSelected}`
      : `${styles.mainAddressButton} ${styles.buttonUnselected}`;

  // 1) Add a new stop
  const handleAddStopOff = () => {
    const newStopCount = stops.length; // e.g. if we already have 1 stop
    let newLabel = '';

    if (placeType === 'destination') {
      // All new stops => "Drop off 2, Drop off 3, etc."
      newLabel = `Drop off ${newStopCount + 1}`;
    } else {
      // All new stops => "Stop off 2, Stop off 3, etc."
      newLabel = `Stop off ${newStopCount + 1}`;
    }

    const newStop = {
      label: newLabel,
      address: '',
      apt: '',
      city: '',
      state: '',
      zip: '',
    };

    const updatedStops = [...stops, newStop];
    onStopsUpdated(updatedStops);

    // Switch selected index to the newly added stop
    setSelectedStopIndex(updatedStops.length - 1);
  };

  // 2) Switch between existing stops
  const handleSelectStopIndex = (index) => {
    setSelectedStopIndex(index);
  };

  return (
    <div className={styles.addressRow}>
      <div className={styles.addressContainer}>
        <div className={styles.addressButtonsWrapper}>
          {stops.map((stopObj, idx) => (
            <button
              key={idx}
              className={getButtonClass(idx)}
              onClick={() => handleSelectStopIndex(idx)}
            >
              {stopObj.label}
            </button>
          ))}
        </div>
        <button className={styles.plusButton} onClick={handleAddStopOff}>
          +
        </button>
      </div>
    </div>
  );
}

export default MainAndStopOffs;
