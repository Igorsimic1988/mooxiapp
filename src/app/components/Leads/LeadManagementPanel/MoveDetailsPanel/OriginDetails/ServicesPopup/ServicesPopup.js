"use client";

import React, { useEffect, useRef, useCallback, useState } from 'react';
import styles from './ServicesPopup.module.css';

// Icons

import MainAndStopOffs from '../MainAndStopOffs/MainAndStopOffs';

import Icon from '../../../../../Icon';
import { useUiState } from '../../UiStateContext';

// Example data for drop-downs
const whatsMovingOriginOptions = ['Mixed', 'Boxes Only', 'Furniture Only'];
const packingOriginOptions = [
  'No Packing',
  'Partial Packing',
  'Full Packing',
  'Custom Packing ( tagged )',
];

const unpackingDestinationOptions = [
  'No Unpacking',
  'Full Unpacking',
  'Custom Unpacking ( tagged )',
];

const blanketsOriginOptions = [
  'Needed',
  'Blankets not needed',
  'Paper Blankets',
  'Custom ( tagged )',
];
const blanketsDestinationOptions = [
  'Remove Blankets',
  'Leave Blankets On',
  'Custom ( tagged )',
];

// Additional services
const typeOfServiceChoices = [
  { id: 1, name: 'Moving' },
  { id: 2, name: 'Move items within premises' },
  { id: 3, name: 'Junk removal' },
  { id: 4, name: 'Help with packing (Pack & Leave Service)' },
  { id: 5, name: 'Help with Loading' },
  { id: 6, name: 'Help with Unloading' },
];

const allowedOriginFields = [
  'whatsMoving',
  'packingOption',
  'blanketsOption',
  'itemsToBeTakenApart',
  'hoistItems',
  'craneNeeded',
  'additionalServices',
];

const allowedDestinationFields = [
  'unpackingOption',
  'blanketsOption',
  'itemsToBeAssembled',
  'hoistItems',
  'craneNeeded',
  'additionalServices',
];


function ServicesPopup({
  lead,
  onDestinationUpdated ,
  onOriginUpdated ,
  setIsServicesPopupVisible,
  defaultTab = 'origin',
  destinationStops = [],
  originStops = [],
}) {
  const popupContentRef = useRef(null);

  const [selectedPlace, setSelectedPlace] = useState(defaultTab);
    const [originEdits, setOriginEdits] = useState({});
    const [destinationEdits, setDestinationEdits] = useState({});
    const {
        selectedOriginStopId,
        setSelectedOriginStopId,
        selectedDestinationStopId,
        setSelectedDestinationStopId,
    } = useUiState();
    const currentStops =
    selectedPlace === 'origin' ? originStops : destinationStops;
  
  const selectedStopId =
    selectedPlace === 'origin' ? selectedOriginStopId : selectedDestinationStopId;
    const originalStop = currentStops.find((s) => s.id === selectedStopId) || {};
  const edits = selectedPlace === 'origin'
    ? originEdits[selectedStopId] || {}
    : destinationEdits[selectedStopId] || {};
  const localStop = { ...originalStop, ...edits };
  


  // close if clicked outside
  const handleClose = useCallback(() => {
    setIsServicesPopupVisible(false);
  }, [setIsServicesPopupVisible]);

  useEffect(() => {
    function handleClickOutside(e) {
      if (popupContentRef.current && !popupContentRef.current.contains(e.target)) {
        handleClose();
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [handleClose]);


  // Decide which array

  function setSelectedStopIdGlobal(id) {
    if (selectedPlace === 'origin') {
      setSelectedOriginStopId(id);
    } else {
      setSelectedDestinationStopId(id);
    }
  }


    useEffect(() => {
      if (selectedPlace === 'origin' && originStops.length > 0) {
        setSelectedOriginStopId((prev) => {
          const exists = originStops.find(s => s.id === prev);
          return exists ? prev : originStops[0].id;
        });
      }
    
      if (selectedPlace === 'destination' && destinationStops.length > 0) {
        const hideNormal = lead.addStorage && lead.storageItems === 'All items';
        const stopsToUse = hideNormal
          ? destinationStops.filter(s => s.postStorage)
          : destinationStops;
    
          setSelectedDestinationStopId((prev) => {
          const exists = stopsToUse.find(s => s.id === prev);
          return exists ? prev : stopsToUse[0]?.id;
        });
      }
    }, [selectedPlace, originStops, destinationStops, lead.addStorage, lead.storageItems]);


  function setStopField(fieldName, newValue) {
    if (!selectedStopId) return;
  
    if (selectedPlace === 'origin') {
      setOriginEdits((prev) => ({
        ...prev,
        [selectedStopId]: {
          ...prev[selectedStopId],
          [fieldName]: newValue,
        },
      }));
    } else {
      setDestinationEdits((prev) => ({
        ...prev,
        [selectedStopId]: {
          ...prev[selectedStopId],
          [fieldName]: newValue,
        },
      }));
    }
  }
  
  function filterAllowedFields(obj, allowedKeys) {
    return Object.fromEntries(
      Object.entries(obj).filter(([key]) => allowedKeys.includes(key))
    );
  }
  


  function handleSave() {
    // 1. Sacuvaj sve izmene za origin stopove
    Object.entries(originEdits).forEach(([stopId, stopData]) => {
      const filtered = filterAllowedFields(stopData, allowedOriginFields);
      if (Object.keys(filtered).length > 0) {
        onOriginUpdated(stopId, filtered);
      }
    });
  
    // 2. Sacuvaj sve izmene za destination stopove
    Object.entries(destinationEdits).forEach(([stopId, stopData]) => {
      const filtered = filterAllowedFields(stopData, allowedDestinationFields);
      if (Object.keys(filtered).length > 0) {
        onDestinationUpdated(stopId, filtered);
      }
    });
  
    setOriginEdits({});
    setDestinationEdits({});
  
    // 4. Zatvori popup
    setIsServicesPopupVisible(false);
  }
  
  
  

  function toggleField(fieldName) {
    setStopField(fieldName, !localStop[fieldName]);
  }

  function toggleAdditionalService(serviceName) {
    const currentServices = Array.isArray(localStop.additionalServices)
      ? [...localStop.additionalServices]
      : [];
    const idx = currentServices.indexOf(serviceName);
    if (idx === -1) {
      currentServices.push(serviceName);
    } else {
      currentServices.splice(idx, 1);
    }
    setStopField('additionalServices', currentServices);
  }
  function isServiceChecked(serviceName) {
    return (
      Array.isArray(localStop.additionalServices) &&
      localStop.additionalServices.includes(serviceName)
    );
  }

  // dropdown toggles
  const [showWhatsMovingDropdown, setShowWhatsMovingDropdown] = useState(false);
  const [showPackingDropdown, setShowPackingDropdown] = useState(false);
  const [showUnpackingDropdown, setShowUnpackingDropdown] = useState(false);
  const [showBlanketsDropdown, setShowBlanketsDropdown] = useState(false);

  function DropdownButton({ label, value, onClick, isActive }) {
    const displayValue = value || 'Select';
    return (
      <button 
        type="button" 
        className={`${styles.dropdownButton} ${isActive ? styles.activeInput : ''}`} 
        onClick={onClick}
      >
        <span className={styles.oneLineEllipsis}>
          <span className={styles.dropdownPrefix}>{label}</span>
          <span className={styles.dropdownSelected}>{displayValue}</span>
        </span>
        <Icon name="UnfoldMore" className={styles.rightIcon} />
      </button>
    );
  }

  // If it's "destination" + lead.add_storage + 'All items' => hide normal stops
  const hideNormalStops =
    selectedPlace === 'destination' &&
    !!lead.addStorage &&
    lead.storageItems === 'All items';

  // Filter out inactive stops
  const activeStops = currentStops.filter((s) => s.isActive !== false);


  return (
    <div className={styles.popup}>
      <div className={styles.popupContent} ref={popupContentRef}>
        {/* HEADER */}
        <div className={styles.header}>
          <div className={styles.title}>
            <Icon name="Services1" color="white" className={styles.icon} />
            <p>Services</p>
          </div>
          <div className={styles.closeButton}>
            <button onClick={handleClose} aria-label="Close">
              <Icon name="Close" className={styles.closeIcon} />
            </button>
          </div>
        </div>

        {/* TOP SECTION => radio + stops */}
        <div className={styles.topSection}>
          <div className={styles.radioGroup}>
            <label className={styles.radioLabel}>
              <input
                type="radio"
                className={styles.radioInput}
                checked={selectedPlace === 'origin'}
                onChange={() => setSelectedPlace('origin')}
              />
              <span className={styles.radioText}>Origin</span>
            </label>
            <label className={styles.radioLabel}>
              <input
                type="radio"
                className={styles.radioInput}
                checked={selectedPlace === 'destination'}
                onChange={() => setSelectedPlace('destination')}
              />
              <span className={styles.radioText}>Destination</span>
            </label>
          </div>

          {/* Only show .stopOffsPaddingWrapper if there's more than 1 active stop */}
          {activeStops.length > 1 && (
            <div className={styles.stopOffsPaddingWrapper}>
              <MainAndStopOffs
                stops={currentStops}
                selectedStopId={selectedStopId}
                setSelectedStopId={setSelectedStopIdGlobal}
                placeType={selectedPlace}
                isStorageToggled={selectedPlace === 'destination' && !!lead.addStorage}
                hideNormalStops={hideNormalStops}

                /* Hide the plus buttons: */
                hidePlusButtons
              />
            </div>
          )}
        </div>

        {/* MAIN SCROLLABLE CONTENT */}
        <div className={styles.scrollableContent}>
          <div className={styles.formFieldsWrapper}>
            {/* ORIGIN fields */}
            {selectedPlace === 'origin' && (
              <>
                {/* 1) What's Moving */}
                <div className={styles.dropdownWrapper}>
                  <DropdownButton
                    label="What's Moving:"
                    value={localStop.whatsMoving}
                    isActive={showWhatsMovingDropdown}
                    onClick={() => {
                      setShowWhatsMovingDropdown(!showWhatsMovingDropdown);
                      setShowPackingDropdown(false);
                      setShowBlanketsDropdown(false);
                      setShowUnpackingDropdown(false);
                    }}
                  />
                  {showWhatsMovingDropdown && (
                    <ul className={styles.optionsList}>
                      {whatsMovingOriginOptions.map((option) => {
                        const isSelected = localStop.whatsMoving === option;
                        return (
                          <li
                            key={option}
                            className={`${styles.option} ${isSelected ? styles.selected : ''}`}
                            onClick={() => {
                              setStopField('whatsMoving', option);
                              setShowWhatsMovingDropdown(false);
                            }}
                          >
                            {option}
                          </li>
                        );
                      })}
                    </ul>
                  )}
                </div>

                {/* 2) Packing Option => 21px spacing */}
                <div className={`${styles.dropdownWrapper} ${styles.packingOptionMargin}`}>
                  <DropdownButton
                    label="Packing Option:"
                    value={localStop.packingOption}
                    isActive={showPackingDropdown}
                    onClick={() => {
                      setShowPackingDropdown(!showPackingDropdown);
                      setShowWhatsMovingDropdown(false);
                      setShowBlanketsDropdown(false);
                      setShowUnpackingDropdown(false);
                    }}
                  />
                  {showPackingDropdown && (
                    <ul className={styles.optionsList}>
                      {packingOriginOptions.map((option) => {
                        const isSelected = localStop.packingOption === option;
                        return (
                          <li
                            key={option}
                            className={`${styles.option} ${isSelected ? styles.selected : ''}`}
                            onClick={() => {
                              setStopField('packingOption', option);
                              setShowPackingDropdown(false);
                            }}
                          >
                            {option}
                          </li>
                        );
                      })}
                    </ul>
                  )}
                </div>
              </>
            )}

            {/* DESTINATION fields */}
            {selectedPlace === 'destination' && (
              <>
                {/* Unpacking Option */}
                <div className={`${styles.dropdownWrapper} ${styles.unpackingOptionMargin}`}>
                  <DropdownButton
                    label="Unpacking:"
                    value={localStop.unpackingOption}
                    isActive={showUnpackingDropdown}
                    onClick={() => {
                      setShowUnpackingDropdown(!showUnpackingDropdown);
                      setShowBlanketsDropdown(false);
                      setShowWhatsMovingDropdown(false);
                      setShowPackingDropdown(false);
                    }}
                  />
                  {showUnpackingDropdown && (
                    <ul className={styles.optionsList}>
                      {unpackingDestinationOptions.map((option) => {
                        const isSelected = localStop.unpackingOption === option;
                        return (
                          <li
                            key={option}
                            className={`${styles.option} ${isSelected ? styles.selected : ''}`}
                            onClick={() => {
                              setStopField('unpackingOption', option);
                              setShowUnpackingDropdown(false);
                            }}
                          >
                            {option}
                          </li>
                        );
                      })}
                    </ul>
                  )}
                </div>
              </>
            )}

            {/* 3 checkboxes => ItemsToBeTakenApart/ItemsToBeAssembled, hoistItems, craneNeeded */}
            <div className={styles.checkboxesGroup}>
              {selectedPlace === 'origin' && (
                <label className={styles.featureCheckbox}>
                  <input
                    type="checkbox"
                    className={styles.hiddenCheckbox}
                    checked={!!localStop.itemsToBeTakenApart}
                    onChange={() => toggleField('itemsToBeTakenApart')}
                  />
                  <span className={styles.customBox} />
                  <span className={styles.featureLabel}>
                    Items to be taken apart?
                  </span>
                </label>
              )}

              {selectedPlace === 'destination' && (
                <label className={styles.featureCheckbox}>
                  <input
                    type="checkbox"
                    className={styles.hiddenCheckbox}
                    checked={!!localStop.itemsToBeAssembled}
                    onChange={() => toggleField('itemsToBeAssembled')}
                  />
                  <span className={styles.customBox} />
                  <span className={styles.featureLabel}>
                    Items to be assembled?
                  </span>
                </label>
              )}

              {/* Hoist? */}
              <label className={styles.featureCheckbox}>
                <input
                  type="checkbox"
                  className={styles.hiddenCheckbox}
                  checked={!!localStop.hoistItems}
                  onChange={() => toggleField('hoistItems')}
                />
                <span className={styles.customBox} />
                <span className={styles.featureLabel}>Hoist items?</span>
              </label>

              {/* Crane? */}
              <label className={styles.featureCheckbox}>
                <input
                  type="checkbox"
                  className={styles.hiddenCheckbox}
                  checked={!!localStop.craneNeeded}
                  onChange={() => toggleField('craneNeeded')}
                />
                <span className={styles.customBox} />
                <span className={styles.featureLabel}>Crane needed?</span>
              </label>
            </div>

            {/* Blankets => origin vs destination => 21px spacing after it */}
            <div className={`${styles.blanketsDropdownWrapper} ${styles.blanketsMargin}`}>
              <DropdownButton
                label="Blankets:"
                value={localStop.blanketsOption}
                isActive={showBlanketsDropdown}
                onClick={() => {
                  setShowBlanketsDropdown(!showBlanketsDropdown);
                  setShowWhatsMovingDropdown(false);
                  setShowPackingDropdown(false);
                  setShowUnpackingDropdown(false);
                }}
              />
              {showBlanketsDropdown && (
                <ul className={styles.optionsList}>
                  {(selectedPlace === 'origin'
                    ? blanketsOriginOptions
                    : blanketsDestinationOptions
                  ).map((option) => {
                    const isSelected = localStop.blanketsOption === option;
                    return (
                      <li
                        key={option}
                        className={`${styles.option} ${isSelected ? styles.selected : ''}`}
                        onClick={() => {
                          setStopField('blanketsOption', option);
                          setShowBlanketsDropdown(false);
                        }}
                      >
                        {option}
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>

            {/* Additional Services header */}
            <div className={styles.additionalServicesHeader}>Additional Services</div>

            {/* Additional Services checkboxes */}
            <div className={styles.additionalServicesList}>
              {typeOfServiceChoices.map((svc) => {
                const checked = isServiceChecked(svc.name);
                return (
                  <label key={svc.id} className={styles.featureCheckbox}>
                    <input
                      type="checkbox"
                      className={styles.hiddenCheckbox}
                      checked={checked}
                      onChange={() => toggleAdditionalService(svc.name)}
                    />
                    <span className={styles.customBox} />
                    <span className={styles.featureLabel}>{svc.name}</span>
                  </label>
                );
              })}
            </div>
          </div>
        </div>

        {/* FOOTER => Save */}
        <div className={styles.stickyFooter}>
          <button type="button" className={styles.saveButton} onClick={handleSave}>
            Save
          </button>
        </div>
      </div>
    </div>
  );
}

export default ServicesPopup;