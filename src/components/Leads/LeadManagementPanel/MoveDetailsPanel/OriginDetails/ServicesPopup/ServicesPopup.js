/* =========================== ServicesPopup.js =========================== */

import React, { useEffect, useRef, useCallback, useState } from 'react';
import styles from './ServicesPopup.module.css';

// Icons
import { ReactComponent as HouseIcon } from '../../../../../../assets/icons/house.svg';
import { ReactComponent as CloseIcon } from '../../../../../../assets/icons/Close.svg';
import { ReactComponent as UnfoldMoreIcon } from '../../../../../../assets/icons/unfoldmore.svg';

import MainAndStopOffs from '../MainAndStopOffs/MainAndStopOffs';

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

function ServicesPopup({
  lead,
  onLeadUpdated,
  setIsServicesPopupVisible,
  defaultTab = 'origin',
  defaultStopIndex = 0,
}) {
  const popupContentRef = useRef(null);

  const [localOriginStops, setLocalOriginStops] = useState([]);
  const [localDestinationStops, setLocalDestinationStops] = useState([]);

  const [selectedPlace, setSelectedPlace] = useState(defaultTab);

  // separate indexes for origin/dest
  const [selectedStopIndexOrigin, setSelectedStopIndexOrigin] = useState(
    defaultTab === 'origin' ? defaultStopIndex : 0
  );
  const [selectedStopIndexDest, setSelectedStopIndexDest] = useState(
    defaultTab === 'destination' ? defaultStopIndex : 0
  );

  // Copy from lead
  useEffect(() => {
    const originStops =
      Array.isArray(lead.originStops) && lead.originStops.length > 0
        ? lead.originStops
        : [
            {
              label: 'Main Address',
              address: '',
              apt: '',
              city: '',
              state: '',
              zip: '',
            },
          ];

    const destStops =
      Array.isArray(lead.destinationStops) && lead.destinationStops.length > 0
        ? lead.destinationStops
        : [
            {
              label: 'Main Address',
              address: '',
              apt: '',
              city: '',
              state: '',
              zip: '',
            },
          ];

    const mappedOrigin = originStops.map((stop) => ({
      ...stop,
      whatsMoving: stop.whatsMoving || '',
      packingOption: stop.packingOption || '',
      itemsToBeTakenApart: !!stop.itemsToBeTakenApart,
      hoistItems: !!stop.hoistItems,
      craneNeeded: !!stop.craneNeeded,
      blanketsOption: stop.blanketsOption || '',
      additionalServices: Array.isArray(stop.additionalServices)
        ? [...stop.additionalServices]
        : [],
    }));

    const mappedDest = destStops.map((stop) => ({
      ...stop,
      unpackingOption: stop.unpackingOption || '',
      itemsToBeAssembled: !!stop.itemsToBeAssembled,
      hoistItems: !!stop.hoistItems,
      craneNeeded: !!stop.craneNeeded,
      blanketsOption: stop.blanketsOption || '',
      additionalServices: Array.isArray(stop.additionalServices)
        ? [...stop.additionalServices]
        : [],
    }));

    setLocalOriginStops(mappedOrigin);
    setLocalDestinationStops(mappedDest);
  }, [lead]);

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

  // *** Auto-select first post if "destination" + "All items" hides normal stops ***
  useEffect(() => {
    if (selectedPlace === 'destination') {
      const hideNormal = lead.add_storage && lead.storage_items === 'All items';
      if (hideNormal) {
        const stopsArr = localDestinationStops;
        const current = stopsArr[selectedStopIndexDest];
        if (current && !current.postStorage) {
          // find first post-storage
          const idx = stopsArr.findIndex((s) => s.postStorage);
          if (idx !== -1 && idx !== selectedStopIndexDest) {
            setSelectedStopIndexDest(idx);
          }
        }
      }
    }
  }, [
    selectedPlace,
    lead.add_storage,
    lead.storage_items,
    localDestinationStops,
    selectedStopIndexDest,
  ]);

  // Decide which array
  const currentStops =
    selectedPlace === 'origin' ? localOriginStops : localDestinationStops;

  const selectedStopIndex =
    selectedPlace === 'origin' ? selectedStopIndexOrigin : selectedStopIndexDest;

  function setSelectedStopIndexGlobal(idx) {
    if (selectedPlace === 'origin') {
      setSelectedStopIndexOrigin(idx);
    } else {
      setSelectedStopIndexDest(idx);
    }
  }

  function handleStopsLocalUpdated(newStops) {
    if (selectedPlace === 'origin') {
      setLocalOriginStops(newStops);
    } else {
      setLocalDestinationStops(newStops);
    }
  }

  const stop = currentStops[selectedStopIndex] || {};

  function setStopField(fieldName, value) {
    const updated = [...currentStops];
    const cloned = { ...updated[selectedStopIndex] };
    cloned[fieldName] = value;
    updated[selectedStopIndex] = cloned;

    if (selectedPlace === 'origin') {
      setLocalOriginStops(updated);
    } else {
      setLocalDestinationStops(updated);
    }
  }

  function handleSave() {
    onLeadUpdated({
      ...lead,
      originStops: localOriginStops,
      destinationStops: localDestinationStops,
    });
    setIsServicesPopupVisible(false);
  }

  function toggleField(fieldName) {
    setStopField(fieldName, !stop[fieldName]);
  }

  function toggleAdditionalService(serviceName) {
    const currentServices = Array.isArray(stop.additionalServices)
      ? [...stop.additionalServices]
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
      Array.isArray(stop.additionalServices) &&
      stop.additionalServices.includes(serviceName)
    );
  }

  // dropdown toggles
  const [showWhatsMovingDropdown, setShowWhatsMovingDropdown] = useState(false);
  const [showPackingDropdown, setShowPackingDropdown] = useState(false);
  const [showUnpackingDropdown, setShowUnpackingDropdown] = useState(false);
  const [showBlanketsDropdown, setShowBlanketsDropdown] = useState(false);

  function DropdownButton({ label, value, onClick }) {
    const displayValue = value ? value : 'Select';
    return (
      <button type="button" className={styles.dropdownButton} onClick={onClick}>
        <span className={styles.oneLineEllipsis}>
          <span className={styles.dropdownPrefix}>{label}</span>
          <span className={styles.dropdownSelected}>{displayValue}</span>
        </span>
        <UnfoldMoreIcon className={styles.rightIcon} />
      </button>
    );
  }

  // If it's "destination" + lead.add_storage + 'All items' => hide normal stops
  const hideNormalStops =
    selectedPlace === 'destination' &&
    !!lead.add_storage &&
    lead.storage_items === 'All items';

  return (
    <div className={styles.popup}>
      <div className={styles.popupContent} ref={popupContentRef}>
        {/* HEADER */}
        <div className={styles.header}>
          <div className={styles.title}>
            <HouseIcon className={styles.icon} />
            <p>Services</p>
          </div>
          <div className={styles.closeButton}>
            <button onClick={handleClose} aria-label="Close">
              <CloseIcon className={styles.closeIcon} />
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

          <div className={styles.stopOffsPaddingWrapper}>
            <MainAndStopOffs
              stops={currentStops}
              onStopsUpdated={handleStopsLocalUpdated}
              selectedStopIndex={selectedStopIndex}
              setSelectedStopIndex={setSelectedStopIndexGlobal}
              placeType={selectedPlace}
              isStorageToggled={selectedPlace === 'destination' && !!lead.add_storage}
              hideNormalStops={hideNormalStops}
            />
          </div>
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
                    value={stop.whatsMoving}
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
                        const isSelected = stop.whatsMoving === option;
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
                    value={stop.packingOption}
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
                        const isSelected = stop.packingOption === option;
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
                    value={stop.unpackingOption}
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
                        const isSelected = stop.unpackingOption === option;
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
                    checked={!!stop.itemsToBeTakenApart}
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
                    checked={!!stop.itemsToBeAssembled}
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
                  checked={!!stop.hoistItems}
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
                  checked={!!stop.craneNeeded}
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
                value={stop.blanketsOption}
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
                    const isSelected = stop.blanketsOption === option;
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
