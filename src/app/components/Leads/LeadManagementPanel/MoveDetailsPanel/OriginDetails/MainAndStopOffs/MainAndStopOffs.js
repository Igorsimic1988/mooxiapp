import React from 'react';
import styles from './MainAndStopOffs.module.css';
import { useUiState } from '../../UiStateContext';

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
  placeType = 'origin',
  isStorageToggled ,
  hideNormalStops ,
  hidePlusButtons ,
  onAddNormalStop,
  onAddPostStorageStop,
}) {
  if (!Array.isArray(stops)) stops = [];
  const {
    selectedOriginStopId,
    setSelectedOriginStopId,
    selectedDestinationStopId,
    setSelectedDestinationStopId
  } = useUiState();
  
  const selectedStopId = placeType === 'origin' ? selectedOriginStopId : selectedDestinationStopId;
  const setSelectedStopId = placeType === 'origin' ? setSelectedOriginStopId : setSelectedDestinationStopId;



  const normalStops = stops.filter((s) => !s.postStorage);
  const postStorageStops = stops.filter((s) => s.postStorage);

  function isSelected(id) {
    return id === selectedStopId;
  }

  function getNormalButtonClass(id) {
    return isSelected(id)
      ? `${styles.mainAddressButton} ${styles.buttonSelected}`
      : `${styles.mainAddressButton} ${styles.buttonUnselected}`;
  }
  function getPostStorageButtonClass(id) {
    return isSelected(id)
      ? `${styles.mainAddressButtonRed} ${styles.buttonSelectedRed}`
      : `${styles.mainAddressButtonRed} ${styles.buttonUnselectedRed}`;
  }
  function handleSelectNormalStop(stop) {
    setSelectedStopId(stop.id);
  }

  function handleSelectPostStorageStop(stop) {
    setSelectedStopId(stop.id);
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
            {normalStops.map((stop, index) => {
              const isFirst = index === 0;
              const label = placeType === 'destination'
                ? isFirst ? 'Main Drop off' : `Drop off ${index + 1}`
                : isFirst ? 'Main Address' : `Stop off ${index + 1}`;

              return (
                <button
                  key={`normal-${stop.id}`}
                  className={getNormalButtonClass(stop.id)}
                  onClick={() => handleSelectNormalStop(stop)}
                >
                {label}
                </button>
              );
            })}
            </div>
            {!hidePlusButtons && canAddMoreNormal && (
              <button className={styles.plusButton} onClick={onAddNormalStop}>
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
              {postStorageStops.map((stop, index) => {
                const isFirst = index === 0;
                const label = isFirst ? 'Post Storage Main Drop off' : `Post Storage Drop off ${index + 1}`;
                return (
                  <button
                  key={`post-${stop.id}`}
                  className={getPostStorageButtonClass(stop.id)}
                  onClick={() => handleSelectPostStorageStop(stop)}
                >
                  {label}
                </button>
                );
              })}
            </div>
            {!hidePlusButtons && canAddMorePostStorage && (
              <button
                className={styles.plusButtonRed}
                onClick={onAddPostStorageStop}
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
