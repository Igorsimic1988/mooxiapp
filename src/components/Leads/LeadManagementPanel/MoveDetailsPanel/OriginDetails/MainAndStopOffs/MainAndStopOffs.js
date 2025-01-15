// src/components/OriginDetails/MainAndStopOffs/MainAndStopOffs.js

import React from 'react';
import styles from './MainAndStopOffs.module.css';

/**
 * MainAndStopOffs
 * ---------------
 * Reusable component for:
 *   - A "Main Address" button
 *   - A row of "Stop off #X" buttons
 *   - A plus (+) button to add more stops
 *
 * PROPS:
 *   stopOffs: array of strings (stop-off labels)
 *   onAddStopOff: function to add a new stop-off
 *   selectedStop: string (currently selected label)
 *   setSelectedStop: function to update which is selected
 */
function MainAndStopOffs({ stopOffs, onAddStopOff, selectedStop, setSelectedStop }) {

  // Called when user clicks "+"
  const handleAddStopOff = () => {
    onAddStopOff(); 
    // The parent will add a new label to the array, 
    // and possibly select it automatically
  };

  // Helper to decide if a label is selected
  const isSelected = (label) => label === selectedStop;

  // Generate combined class for each button
  const getButtonClass = (label) => {
    return isSelected(label)
      ? `${styles.mainAddressButton} ${styles.buttonSelected}`
      : `${styles.mainAddressButton} ${styles.buttonUnselected}`;
  };

  // When user clicks a button, update parent's selectedStop
  const handleSelectStop = (label) => {
    setSelectedStop(label);
  };

  return (
    <div className={styles.addressRow}>
      <div className={styles.addressContainer}>
        <div className={styles.addressButtonsWrapper}>
          {/* "Main Address" */}
          <button
            className={getButtonClass('Main Address')}
            onClick={() => handleSelectStop('Main Address')}
          >
            Main Address
          </button>

          {/* Stop-offs */}
          {stopOffs.map((stopLabel, idx) => (
            <button
              key={idx}
              className={getButtonClass(stopLabel)}
              onClick={() => handleSelectStop(stopLabel)}
            >
              {stopLabel}
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
