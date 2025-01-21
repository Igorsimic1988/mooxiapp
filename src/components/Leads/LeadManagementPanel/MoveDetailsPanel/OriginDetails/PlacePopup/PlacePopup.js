// src/components/Leads/LeadManagementPanel/MoveDetailsPanel/OriginDetails/PlacePopup/PlacePopup.js

import React, { useEffect, useRef, useCallback, useState } from 'react';
import styles from './PlacePopup.module.css';

// Icons
import { ReactComponent as HouseIcon } from '../../../../../../assets/icons/house.svg';
import { ReactComponent as CloseIcon } from '../../../../../../assets/icons/Close.svg';

import MainAndStopOffs from '../MainAndStopOffs/MainAndStopOffs';

/**
 * PlacePopup
 * ----------
 * Props:
 *   - lead: the entire lead object
 *       must include lead.originStops and lead.destinationStops
 *   - onLeadUpdated: function(updatedLead)
 *   - setIsPlacePopupVisible: function => to close the popup
 */
function PlacePopup({ lead, onLeadUpdated, setIsPlacePopupVisible }) {
  const popupContentRef = useRef(null);

  // Which place are we editing? "origin" or "destination"
  const [selectedPlace, setSelectedPlace] = useState('origin');

  // We'll track separate selectedStopIndexes for origin vs. destination
  const [selectedStopIndexOrigin, setSelectedStopIndexOrigin] = useState(0);
  const [selectedStopIndexDest, setSelectedStopIndexDest] = useState(0);

  // If user clicks outside, close the popup
  const handleClose = useCallback(() => {
    setIsPlacePopupVisible(false);
  }, [setIsPlacePopupVisible]);

  // Outside-click detection
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (popupContentRef.current && !popupContentRef.current.contains(e.target)) {
        handleClose();
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [handleClose]);

  // Ensure we have arrays for originStops & destinationStops
  // (If your lead creation already does this, you can skip.)
  useEffect(() => {
    const updates = {};
    let changedSomething = false;

    if (!Array.isArray(lead.originStops)) {
      updates.originStops = [
        { label: 'Main Address', address: '', apt: '', city: '', state: '', zip: '' },
      ];
      changedSomething = true;
    }
    if (!Array.isArray(lead.destinationStops)) {
      updates.destinationStops = [
        { label: 'Main Address', address: '', apt: '', city: '', state: '', zip: '' },
      ];
      changedSomething = true;
    }

    if (changedSomething) {
      onLeadUpdated({ ...lead, ...updates });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Determine which array of stops we're currently editing
  const originStops = lead.originStops || [];
  const destinationStops = lead.destinationStops || [];

  // If "origin" => use originStops and selectedStopIndexOrigin
  // If "destination" => use destinationStops and selectedStopIndexDest
  const currentStops =
    selectedPlace === 'origin' ? originStops : destinationStops;

  const selectedStopIndex =
    selectedPlace === 'origin' ? selectedStopIndexOrigin : selectedStopIndexDest;

  const setSelectedStopIndex = (idx) => {
    if (selectedPlace === 'origin') {
      setSelectedStopIndexOrigin(idx);
    } else {
      setSelectedStopIndexDest(idx);
    }
  };

  // When user adds or modifies stops inside MainAndStopOffs
  const handleStopsUpdated = (newStops) => {
    // We'll update either originStops or destinationStops in the lead
    if (selectedPlace === 'origin') {
      onLeadUpdated({ ...lead, originStops: newStops });
    } else {
      onLeadUpdated({ ...lead, destinationStops: newStops });
    }
  };

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

        {/* Radio group: select "origin" or "destination" */}
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

        {/* STOP-OFFS UI for whichever array is active */}
        <div className={styles.stopOffsPaddingWrapper}>
          <MainAndStopOffs
            stops={currentStops}
            onStopsUpdated={handleStopsUpdated}
            selectedStopIndex={selectedStopIndex}
            setSelectedStopIndex={setSelectedStopIndex}
          />
        </div>
      </div>
    </div>
  );
}

export default PlacePopup;
