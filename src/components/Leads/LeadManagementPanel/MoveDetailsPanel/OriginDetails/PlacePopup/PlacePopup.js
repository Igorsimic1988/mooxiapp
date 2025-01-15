// src/components/OriginDetails/PlacePopup/PlacePopup.js

import React, { useEffect, useRef, useCallback, useState } from 'react';
import styles from './PlacePopup.module.css';

// Replace these with the correct paths in your project
import { ReactComponent as HouseIcon } from '../../../../../../assets/icons/house.svg';
import { ReactComponent as CloseIcon } from '../../../../../../assets/icons/Close.svg';

// 1) Import the shared component
import MainAndStopOffs from '../MainAndStopOffs/MainAndStopOffs';

function PlacePopup({
    setIsPlacePopupVisible,  // existing
    stopOffs,               // existing
    onAddStopOff,           // existing
    selectedStop,           // new
    setSelectedStop         // new
  }) {
  const handleClose = useCallback(() => {
    setIsPlacePopupVisible(false);
  }, [setIsPlacePopupVisible]);

  // Ref for popup content (to detect outside clicks)
  const popupContentRef = useRef(null);

  // Radio group: default "Origin"
  const [selectedPlace, setSelectedPlace] = useState('origin');

  // We do NOT store local stopOffs state here 
  // because we want to share it from OriginDetails (passed in as props).

  // Close if clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        popupContentRef.current &&
        !popupContentRef.current.contains(event.target)
      ) {
        handleClose();
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [handleClose]);

  return (
    <div className={styles.popup}>
      <div className={styles.popupContent} ref={popupContentRef}>

        {/* HEADER */}
        <div className={styles.header}>
          <div className={styles.title}>
            <HouseIcon className={styles.icon} />
            <p>Place</p>
          </div>
          <div className={styles.closeButton}>
            <button onClick={handleClose} aria-label="Close">
              <CloseIcon className={styles.closeIcon} />
            </button>
          </div>
        </div>

        {/* RADIO GROUP (origin selected by default) */}
        <div className={styles.radioGroup}>
          <label className={styles.radioLabel}>
            <input
              type="radio"
              name="placeTags"
              value="origin"
              className={styles.radioInput}
              checked={selectedPlace === 'origin'}
              onChange={() => setSelectedPlace('origin')}
            />
            <span className={styles.radioText}>Origin</span>
          </label>

          <label className={styles.radioLabel}>
            <input
              type="radio"
              name="placeTags"
              value="destination"
              className={styles.radioInput}
              checked={selectedPlace === 'destination'}
              onChange={() => setSelectedPlace('destination')}
            />
            <span className={styles.radioText}>Destination</span>
          </label>
        </div>

        {/* 2) Wrapper div to add left padding around MainAndStopOffs */}
        <div className={styles.stopOffsPaddingWrapper}>
        <MainAndStopOffs
  stopOffs={stopOffs}
  onAddStopOff={onAddStopOff}
  selectedStop={selectedStop}       // pass in
  setSelectedStop={setSelectedStop} // pass in
/>
        </div>
      </div>
    </div>
  );
}

export default PlacePopup;
