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
 */
function MainAndStopOffs({
  stops,
  onStopsUpdated,
  selectedStopIndex,
  setSelectedStopIndex,
}) {
  // If the passed-in array is empty, give at least one default
  if (!Array.isArray(stops) || stops.length === 0) {
    stops = [
      { label: 'Main Address', address: '', apt: '', city: '', state: '', zip: '' },
    ];
  }

  // Add a new stop
  const handleAddStopOff = () => {
    const newStopNumber = stops.length;
    const newLabel =
      newStopNumber === 1 ? 'Stop off 1' : `Stop off ${newStopNumber}`;

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

  // Switch to a different stop
  const handleSelectStopIndex = (index) => {
    setSelectedStopIndex(index);
  };

  // For highlighting
  const isSelected = (index) => index === selectedStopIndex;
  const getButtonClass = (index) =>
    isSelected(index)
      ? `${styles.mainAddressButton} ${styles.buttonSelected}`
      : `${styles.mainAddressButton} ${styles.buttonUnselected}`;

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
