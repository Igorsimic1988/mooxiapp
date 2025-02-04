// src/components/Leads/LeadManagementPanel/MoveDetailsPanel/OriginDetails/ServicesPopup/ServicesPopup.js

import React, { useEffect, useRef, useCallback, useState } from 'react';
import styles from './ServicesPopup.module.css';

// Icons
import { ReactComponent as HouseIcon } from '../../../../../../assets/icons/house.svg';
import { ReactComponent as CloseIcon } from '../../../../../../assets/icons/Close.svg';
import { ReactComponent as UnfoldMoreIcon } from '../../../../../../assets/icons/unfoldmore.svg';

// Reuse the MainAndStopOffs component
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

// For blankets
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

// Additional Services => from your typeOfServiceChoices
const typeOfServiceChoices = [
  { id: 1, name: 'Moving' },
  { id: 2, name: 'Move items within premises' },
  { id: 3, name: 'Junk removal' },
  { id: 4, name: 'Help with packing (Pack & Leave Service)' },
  { id: 5, name: 'Help with Loading' },
  { id: 6, name: 'Help with Unloading' },
];

/**
 * ServicesPopup
 * -------------
 * Allows editing "Services" info for both Origin & Destination stops.
 *
 * Props:
 *   - lead
 *   - onLeadUpdated
 *   - setIsServicesPopupVisible
 *   - defaultTab: "origin" or "destination"
 *   - defaultStopIndex: number
 */
function ServicesPopup({
  lead,
  onLeadUpdated,
  setIsServicesPopupVisible,
  defaultTab = 'origin',
  defaultStopIndex = 0,
}) {
  const popupContentRef = useRef(null);

  // local arrays for origin/destination stops
  const [localOriginStops, setLocalOriginStops] = useState([]);
  const [localDestinationStops, setLocalDestinationStops] = useState([]);

  // which place: 'origin' or 'destination'
  const [selectedPlace, setSelectedPlace] = useState(defaultTab);

  // track selectedStopIndex for each place
  const [selectedStopIndexOrigin, setSelectedStopIndexOrigin] = useState(
    defaultTab === 'origin' ? defaultStopIndex : 0
  );
  const [selectedStopIndexDest, setSelectedStopIndexDest] = useState(
    defaultTab === 'destination' ? defaultStopIndex : 0
  );

  // On mount => copy data from lead => local arrays
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

    // We'll add fields for the "Services" portion to each stop
    const mappedOrigin = originStops.map((stop) => ({
      ...stop,
      // for origin only
      whatsMoving: stop.whatsMoving || '',
      packingOption: stop.packingOption || '',
      itemsToBeTakenApart: !!stop.itemsToBeTakenApart,

      // shared
      hoistItems: !!stop.hoistItems,
      craneNeeded: !!stop.craneNeeded,

      // blankets for origin
      blanketsOption: stop.blanketsOption || '',

      // array of additional services
      additionalServices: Array.isArray(stop.additionalServices)
        ? [...stop.additionalServices]
        : [],
    }));

    const mappedDest = destStops.map((stop) => ({
      ...stop,
      // for destination
      unpackingOption: stop.unpackingOption || '',
      itemsToBeAssembled: !!stop.itemsToBeAssembled,

      // shared
      hoistItems: !!stop.hoistItems,
      craneNeeded: !!stop.craneNeeded,

      // blankets for destination
      blanketsOption: stop.blanketsOption || '',

      // additional services
      additionalServices: Array.isArray(stop.additionalServices)
        ? [...stop.additionalServices]
        : [],
    }));

    setLocalOriginStops(mappedOrigin);
    setLocalDestinationStops(mappedDest);
  }, [lead]);

  // outside click => close
  const handleClose = useCallback(() => {
    setIsServicesPopupVisible(false);
  }, [setIsServicesPopupVisible]);

  useEffect(() => {
    function handleClickOutside(e) {
      if (
        popupContentRef.current &&
        !popupContentRef.current.contains(e.target)
      ) {
        handleClose();
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [handleClose]);

  // decide which array + selectedStopIndex
  const currentStops =
    selectedPlace === 'origin' ? localOriginStops : localDestinationStops;
  const selectedStopIndex =
    selectedPlace === 'origin' ? selectedStopIndexOrigin : selectedStopIndexDest;

  function setSelectedStopIndex(idx) {
    if (selectedPlace === 'origin') {
      setSelectedStopIndexOrigin(idx);
    } else {
      setSelectedStopIndexDest(idx);
    }
  }

  // handle stops updates
  function handleStopsLocalUpdated(newStops) {
    if (selectedPlace === 'origin') {
      setLocalOriginStops(newStops);
    } else {
      setLocalDestinationStops(newStops);
    }
  }

  // get currentStop
  const stop = currentStops[selectedStopIndex] || {};

  // helper => set a field
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

  // save => merge to lead
  function handleSave() {
    onLeadUpdated({
      ...lead,
      originStops: localOriginStops,
      destinationStops: localDestinationStops,
    });
    setIsServicesPopupVisible(false);
  }

  // to toggle a boolean
  function toggleField(fieldName) {
    setStopField(fieldName, !stop[fieldName]);
  }

  // handle check/uncheck of Additional Services
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

  // handle dropdown toggles
  const [showWhatsMovingDropdown, setShowWhatsMovingDropdown] = useState(false);
  const [showPackingDropdown, setShowPackingDropdown] = useState(false);
  const [showUnpackingDropdown, setShowUnpackingDropdown] = useState(false);
  const [showBlanketsDropdown, setShowBlanketsDropdown] = useState(false);

  // We'll create a small reusable DropdownButton for each dropdown:
  function DropdownButton({ label, value, onClick }) {
    const displayValue = value ? value : 'Select';
    return (
      <button
        type="button"
        className={styles.dropdownButton}
        onClick={onClick}
      >
        <span className={styles.oneLineEllipsis}>
          <span className={styles.dropdownPrefix}>{label}</span>
          <span className={styles.dropdownSelected}>{displayValue}</span>
        </span>
        <UnfoldMoreIcon className={styles.rightIcon} />
      </button>
    );
  }

  return (
    <div className={styles.popup}>
      <div className={styles.popupContent} ref={popupContentRef}>

        {/* HEADER => pinned at top */}
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

        {/* TOP SECTION => the radio + stopoffs pinned below header */}
        <div className={styles.topSection}>
          {/* Radio => origin/destination */}
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

          {/* StopOffs row */}
          <div className={styles.stopOffsPaddingWrapper}>
            <MainAndStopOffs
              stops={currentStops}
              onStopsUpdated={handleStopsLocalUpdated}
              selectedStopIndex={selectedStopIndex}
              setSelectedStopIndex={setSelectedStopIndex}
              placeType={selectedPlace}
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

                {/* 2) Packing Option => 21px spacing after it */}
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
                {/* 1) Unpacking Option => 21px spacing after it */}
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

            {/* Group of 3 checkboxes => 
                either (Items to be taken apart, Hoist, Crane) 
                or (Items to be assembled, Hoist, Crane)
            */}
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

              {/* Hoist items? */}
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

              {/* Crane needed? */}
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
            <div className={styles.additionalServicesHeader}>
              Additional Services
            </div>

            {/* The vertical stack of checkboxes for the typeOfServiceChoices */}
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

        {/* STICKY FOOTER => Save button */}
        <div className={styles.stickyFooter}>
          <button
            type="button"
            className={styles.saveButton}
            onClick={handleSave}
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}

export default ServicesPopup;
