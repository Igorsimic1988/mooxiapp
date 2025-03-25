"use client";

import React, { useMemo } from 'react';
import styles from './MainAndStopOffs.module.css';

/**
 * MainAndStopOffs
 * ---------------
 * PROPS:
 *   - stops: the array of stops (e.g. lead.originStops or lead.destinationStops)
 *   - onStopsUpdated: function(newStops)
 *   - selectedStopIndex: number
 *   - setSelectedStopIndex: function
 *   - placeType: "origin" | "destination" (optional; default "origin")
 *   - isStorageToggled: boolean (only relevant for destination)
 *   - hideNormalStops: boolean
 *   - hidePlusButtons: boolean => if true, hide the "+" buttons
 */
function MainAndStopOffs({
  stops,
  onStopsUpdated,
  selectedStopIndex,
  setSelectedStopIndex,
  placeType = 'origin',
  isStorageToggled = false,
  hideNormalStops = false,
  hidePlusButtons = false, // <-- new prop
}) {
  if (!Array.isArray(stops)) stops = [];

  const mappedStops = useMemo(() => {
    return stops.map((stopObj, realIndex) => ({
      ...stopObj,
      realIndex,
    }));
  }, [stops]);

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

  const handleAddPostStorageStop = () => {
    const updatedStops = [...stops];
    const newStopCount = postStorageStops.length;

    if (newStopCount === 0) {
      updatedStops.push({
        label: 'Post Storage Main Drop off',
        address: '',
        apt: '',
        city: '',
        state: '',
        zip: '',
        postStorage: true,
        isActive: true,
      });
    } else {
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

  function handleSelectNormalStop(sObj) {
    setSelectedStopIndex(sObj.realIndex);
  }

  function handleSelectPostStorageStop(sObj) {
    setSelectedStopIndex(sObj.realIndex);
  }

  // Decide if we can add more normal stops
  const canAddMoreNormal =
    !hideNormalStops &&
    (placeType !== 'destination' || normalStops.length < 9);

  // Decide if we can add more post-storage stops
  const canAddMorePostStorage =
    placeType === 'destination' &&
    isStorageToggled &&
    postStorageStops.length < 9;

  return (
    <div className={styles.addressRow}>
      <div className={styles.addressContainer}>

        {/* Normal stops row */}
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
            {!hidePlusButtons && canAddMoreNormal && (
              <button className={styles.plusButton} onClick={handleAddNormalStop}>
                +
              </button>
            )}
          </>
        )}

        {/* Post-storage row */}
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
            {!hidePlusButtons && canAddMorePostStorage && (
              <button
                className={styles.plusButtonRed}
                onClick={handleAddPostStorageStop}
              >
                +
              </button>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default MainAndStopOffs;
