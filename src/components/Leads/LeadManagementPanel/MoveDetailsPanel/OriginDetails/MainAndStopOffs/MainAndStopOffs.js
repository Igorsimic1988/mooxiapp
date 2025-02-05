import React, { useMemo } from 'react';
import styles from './MainAndStopOffs.module.css';

/**
 * MainAndStopOffs
 * ---------------
 * PROPS:
 *   - stops: the array of stops (e.g. lead.originStops or lead.destinationStops)
 *   - onStopsUpdated: function(newStops) => pass updated array up
 *   - selectedStopIndex: which index in the full stops array is currently selected
 *   - setSelectedStopIndex: function => sets the current stop index (in the full array)
 *   - placeType: either "origin" or "destination" (optional; default "origin")
 *   - isStorageToggled: boolean => if true (for destination), show the "Post Storage" row
 *   - hideNormalStops: boolean => if true, do NOT show the normal stops row (only postStorage)
 *
 * We separate the "normal" stops from the "postStorage" stops, but we do NOT reorder them
 * in the actual array. Instead, we keep track of their real array index for correct selection.
 */
function MainAndStopOffs({
  stops,
  onStopsUpdated,
  selectedStopIndex,
  setSelectedStopIndex,
  placeType = 'origin',
  isStorageToggled = false,
  hideNormalStops = false,
}) {
  // Ensure stops is an array
  if (!Array.isArray(stops)) stops = [];

  /**
   * We map each stop => { originalStopObject, realIndex, postStorage: boolean }
   * Then filter out normal vs. postStorage. This way we can display them in
   * separate rows but still know their realIndex in the array.
   */
  const mappedStops = useMemo(() => {
    return stops.map((stopObj, realIndex) => ({
      ...stopObj,
      realIndex,
    }));
  }, [stops]);

  const normalStops = mappedStops.filter((s) => !s.postStorage);
  const postStorageStops = mappedStops.filter((s) => s.postStorage);

  // Function: isSelected => compare with the "full array" selectedStopIndex
  function isSelected(realIndex) {
    return realIndex === selectedStopIndex;
  }

  // Button classes for normal vs postStorage
  function getNormalButtonClass(realIndex) {
    return isSelected(realIndex)
      ? `${styles.mainAddressButton} ${styles.buttonSelected}`
      : `${styles.mainAddressButton} ${styles.buttonUnselected}`;
  }
  function getPostStorageButtonClass(realIndex) {
    return isSelected(realIndex)
      ? `${styles.mainAddressButtonRed} ${styles.buttonSelectedRed}`
      : `${styles.mainAddressButtonRed} ${styles.buttonUnselectedRed}`;
  }

  // Handle adding a new normal stop
  const handleAddNormalStop = () => {
    const updatedStops = [...stops];
    // We'll push at the end. So newStop gets the largest index = updatedStops.length.
    const newStopCount = normalStops.length;

    let newLabel = '';
    if (placeType === 'destination') {
      if (newStopCount === 0) {
        newLabel = 'Main Drop off';
      } else {
        newLabel = `Drop off ${newStopCount + 1}`;
      }
    } else {
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

    updatedStops.push(newStop);            // appended at end => new index = updatedStops.length-1
    onStopsUpdated(updatedStops);

    // Make that newly created stop the selected index
    setSelectedStopIndex(updatedStops.length - 1);
  };

  // Handle adding a new post-storage stop
  const handleAddPostStorageStop = () => {
    const updatedStops = [...stops];
    const newStopCount = postStorageStops.length;

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

    // The newly created is last => index = updatedStops.length - 1
    setSelectedStopIndex(updatedStops.length - 1);
  };

  // On click normal => select that stop's realIndex
  function handleSelectNormalStop(sObj) {
    setSelectedStopIndex(sObj.realIndex);
  }

  // On click postStorage => select that stop's realIndex
  function handleSelectPostStorageStop(sObj) {
    setSelectedStopIndex(sObj.realIndex);
  }

  return (
    <div className={styles.addressRow}>
      <div className={styles.addressContainer}>

        {/* If NOT hiding normal stops => render normal row + plus */}
        {!hideNormalStops && (
          <>
            <div className={styles.addressButtonsWrapper}>
              {normalStops.map((sObj) => (
                <button
                  key={`normal-${sObj.realIndex}`}
                  className={getNormalButtonClass(sObj.realIndex)}
                  onClick={() => handleSelectNormalStop(sObj)}
                >
                  {sObj.label}
                </button>
              ))}
            </div>
            <button className={styles.plusButton} onClick={handleAddNormalStop}>
              +
            </button>
          </>
        )}

        {/* If placeType="destination" and isStorageToggled => show "Post Storage" row */}
        {placeType === 'destination' && isStorageToggled && (
          <>
            <div
              className={styles.addressButtonsWrapper}
              style={{ marginLeft: hideNormalStops ? '0' : '8px' }}
            >
              {postStorageStops.map((sObj) => (
                <button
                  key={`post-${sObj.realIndex}`}
                  className={getPostStorageButtonClass(sObj.realIndex)}
                  onClick={() => handleSelectPostStorageStop(sObj)}
                >
                  {sObj.label}
                </button>
              ))}
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
