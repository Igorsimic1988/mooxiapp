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
 * We separate "normal" stops from "postStorage" stops, but keep their real index for selection.
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

  // Map each => { ...stop, realIndex }
  const mappedStops = useMemo(() => {
    return stops.map((stopObj, realIndex) => ({
      ...stopObj,
      realIndex,
    }));
  }, [stops]);

  // Normal vs. postStorage
  const normalStops = mappedStops.filter((s) => !s.postStorage);
  const postStorageStops = mappedStops.filter((s) => s.postStorage);

  function isSelected(realIndex) {
    return realIndex === selectedStopIndex;
  }

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

  // -------- Add normal stop --------
  const handleAddNormalStop = () => {
    const updatedStops = [...stops];
    const newStopCount = normalStops.length;

    let newLabel;
    if (placeType === 'destination') {
      newLabel =
        newStopCount === 0 ? 'Main Drop off' : `Drop off ${newStopCount + 1}`;
    } else {
      newLabel =
        newStopCount === 0 ? 'Main Address' : `Stop off ${newStopCount + 1}`;
    }

    const newStop = {
      label: newLabel,
      address: '',
      apt: '',
      city: '',
      state: '',
      zip: '',
      postStorage: false,
      isActive: true,
    };
    updatedStops.push(newStop);
    onStopsUpdated(updatedStops);
    setSelectedStopIndex(updatedStops.length - 1);
  };

  // -------- Add post-storage stop --------
  const handleAddPostStorageStop = () => {
    const updatedStops = [...stops];
    const newStopCount = postStorageStops.length;

    // If none => create "Post Storage Main Drop off"
    if (newStopCount === 0) {
      const newStop = {
        label: 'Post Storage Main Drop off',
        address: '',
        apt: '',
        city: '',
        state: '',
        zip: '',
        postStorage: true,
        isActive: true,
      };
      updatedStops.push(newStop);
    } else {
      // If already have 1 => create "Post Storage Drop off N"
      const newLabel = `Post Storage Drop off ${newStopCount + 1}`;
      updatedStops.push({
        label: newLabel,
        address: '',
        apt: '',
        city: '',
        state: '',
        zip: '',
        postStorage: true,
        isActive: true,
      });
    }

    onStopsUpdated(updatedStops);
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

        {/* If NOT hiding normal => show them + plus */}
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

        {/* If "destination" + storage => show post‐storage */}
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
            <button
              className={styles.plusButtonRed}
              onClick={handleAddPostStorageStop}
            >
              +
            </button>
          </>
        )}
      </div>
    </div>
  );
}

export default MainAndStopOffs;
