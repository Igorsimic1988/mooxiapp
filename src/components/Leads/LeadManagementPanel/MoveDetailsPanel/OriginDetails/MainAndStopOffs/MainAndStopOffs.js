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
 *   - isStorageToggled: boolean => if true (for destination), show the "Post Storage" row
 *
 * This component now supports TWO sets of stops in "destination":
 *   1) Normal stops (postStorage === false)
 *   2) Post-storage stops (postStorage === true), displayed in red.
 * 
 * The "Post Storage" row only appears if placeType="destination" AND isStorageToggled=true.
 * By default, "Post Storage Main Drop off" is present (index 0 of the postStorage group).
 */
function MainAndStopOffs({
  stops,
  onStopsUpdated,
  selectedStopIndex,
  setSelectedStopIndex,
  placeType = 'origin',
  isStorageToggled = false,
}) {
  // Ensure stops is an array
  if (!Array.isArray(stops)) stops = [];

  // Filter out the two sets:
  const normalStops = stops.filter((s) => !s.postStorage);
  const postStorageStops = stops.filter((s) => s.postStorage);

  // Current "selected" logic for highlighting
  const isSelected = (globalIndex) => globalIndex === selectedStopIndex;

  // We'll do "normalStops" first, then "postStorageStops".
  function getGlobalIndexForNormal(i) {
    return i; 
  }
  function getGlobalIndexForPostStorage(i) {
    return normalStops.length + i; 
  }

  // Button classes
  function getNormalButtonClass(globalIndex) {
    return isSelected(globalIndex)
      ? `${styles.mainAddressButton} ${styles.buttonSelected}`
      : `${styles.mainAddressButton} ${styles.buttonUnselected}`;
  }
  function getPostStorageButtonClass(globalIndex) {
    return isSelected(globalIndex)
      ? `${styles.mainAddressButtonRed} ${styles.buttonSelectedRed}`
      : `${styles.mainAddressButtonRed} ${styles.buttonUnselectedRed}`;
  }

  // Handle adding a new normal stop
  const handleAddNormalStop = () => {
    const updatedStops = [...stops];
    const newStopCount = normalStops.length;

    let newLabel = '';
    if (placeType === 'destination') {
      // If no normal stops => call it "Main Drop off" else "Drop off #"
      if (newStopCount === 0) {
        newLabel = 'Main Drop off';
      } else {
        newLabel = `Drop off ${newStopCount + 1}`;
      }
    } else {
      // For origin
      if (newStopCount === 0) {
        newLabel = 'Main Address';
      } else {
        newLabel = `Stop off ${newStopCount + 1}`;
      }
    }

    const newStop = {
      label: newLabel,
      address: '',
      apt: '',
      city: '',
      state: '',
      zip: '',
      postStorage: false,
    };

    updatedStops.push(newStop);
    onStopsUpdated(updatedStops);
    setSelectedStopIndex(updatedStops.length - 1);
  };

  // Handle adding a new post-storage stop
  const handleAddPostStorageStop = () => {
    const updatedStops = [...stops];
    const newStopCount = postStorageStops.length;

    // The 0th is "Post Storage Main Drop off" by default (created in DestinationDetails).
    // subsequent => "Post Storage Drop off #"
    const newLabel = `Post Storage Drop off ${newStopCount + 1}`;

    const newStop = {
      label: newLabel,
      address: '',
      apt: '',
      city: '',
      state: '',
      zip: '',
      postStorage: true,
    };

    updatedStops.push(newStop);
    onStopsUpdated(updatedStops);
    setSelectedStopIndex(updatedStops.length - 1);
  };

  // On click normal button => setSelectedStopIndex
  function handleSelectNormalStop(i) {
    const globalIndex = getGlobalIndexForNormal(i);
    setSelectedStopIndex(globalIndex);
  }

  // On click postStorage button => setSelectedStopIndex
  function handleSelectPostStorageStop(i) {
    const globalIndex = getGlobalIndexForPostStorage(i);
    setSelectedStopIndex(globalIndex);
  }

  return (
    <div className={styles.addressRow}>
      <div className={styles.addressContainer}>
        {/* Normal stops + plus */}
        <div className={styles.addressButtonsWrapper}>
          {normalStops.map((stopObj, i) => {
            const globalIndex = getGlobalIndexForNormal(i);
            return (
              <button
                key={`normal-${i}`}
                className={getNormalButtonClass(globalIndex)}
                onClick={() => handleSelectNormalStop(i)}
              >
                {stopObj.label}
              </button>
            );
          })}
        </div>
        <button className={styles.plusButton} onClick={handleAddNormalStop}>
          +
        </button>

        {/* If placeType="destination" and isStorageToggled => show "Post Storage" row */}
        {placeType === 'destination' && isStorageToggled && (
          <>
            <div className={styles.addressButtonsWrapper} style={{ marginLeft: '5px' }}>
              {postStorageStops.map((stopObj, i) => {
                const globalIndex = getGlobalIndexForPostStorage(i);
                return (
                  <button
                    key={`post-${i}`}
                    className={getPostStorageButtonClass(globalIndex)}
                    onClick={() => handleSelectPostStorageStop(i)}
                  >
                    {stopObj.label}
                  </button>
                );
              })}
            </div>
            <button className={styles.plusButtonRed} onClick={handleAddPostStorageStop}>
              +
            </button>
          </>
        )}
      </div>
    </div>
  );
}

export default MainAndStopOffs;
