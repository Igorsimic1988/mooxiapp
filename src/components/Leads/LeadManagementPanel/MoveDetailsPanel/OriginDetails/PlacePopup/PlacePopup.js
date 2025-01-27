// src/components/Leads/LeadManagementPanel/MoveDetailsPanel/OriginDetails/PlacePopup/PlacePopup.js

import React, { useEffect, useRef, useCallback, useState } from 'react';
import styles from './PlacePopup.module.css';

// Icons
import { ReactComponent as HouseIcon } from '../../../../../../assets/icons/house.svg';
import { ReactComponent as CloseIcon } from '../../../../../../assets/icons/Close.svg';

// Reuse the MainAndStopOffs component
import MainAndStopOffs from '../MainAndStopOffs/MainAndStopOffs';

/**
 * Mappings for "type of place" => possible "move size" options.
 */
const moveSizeOptionsMap = {
  'House': [
    'One Item',
    'Just a Few Items',
    '2 Bedroom',
    '3 Bedroom',
    '4 Bedroom',
    '5 Bedroom',
    '6 Bedroom',
    '7 Bedroom',
    '8 Bedroom',
    '9+ Bedroom',
  ],
  'Town House': [
    'One Item',
    'Just a Few Items',
    '2 Bedroom',
    '3 Bedroom',
    '4 Bedroom',
    '5 Bedroom',
    '6 Bedroom',
    '7 Bedroom',
    '8 Bedroom',
    '9+ Bedroom',
  ],
  'Apartment': [
    'One Item',
    'Just a Few Items',
    '2 Bedroom',
    '3 Bedroom',
    '4 Bedroom',
    '5 Bedroom',
    '6 Bedroom',
    '7 Bedroom',
    '8 Bedroom',
    '9+ Bedroom',
  ],
  'Outdoor Storage': [
    'One Item',
    'Just a Few Items',
    '5X5',
    '5X10',
    '5X15',
    '10X10',
    '10X15',
    '10X20',
    '10X25',
    '10X30',
    '20X30',
    '30X30',
  ],
  'Indoor Storage': [
    'One Item',
    'Just a Few Items',
    '5X5',
    '5X10',
    '5X15',
    '10X10',
    '10X15',
    '10X20',
    '10X25',
    '10X30',
    '20X30',
    '30X30',
  ],
  'Office': [
    'One Item',
    'Just a Few Items',
    '1-5 People',
    '6-10 People',
    '11-20 People',
    '21-50 People',
    '51-100 People',
    '101-200 People',
    '201+ People',
  ],
  'Store': [
    'One Item',
    'Just a Few Items',
    'Small ( limited inventory )',
    'Medium ( moderate inventory )',
    'Large ( extensive inventory )',
    'Extra Large ( multiple departments )',
  ],
  'Religious Institution': [
    'One Item',
    'Just a Few Items',
    'Small ( basic furniture, minimal equipment )',
    'Medium ( more furniture, some equipment )',
    'Large ( multiple rooms, artifacts )',
    'Extra Large ( large-scale, specialized equipment )',
  ],
  'Government Institution': [
    'One Item',
    'Just a Few Items',
    'Small ( limited items )',
    'Medium ( more furniture, some specialized )',
    'Large ( multiple departments, extensive equipment )',
    'Extra Large ( large-scale, advanced equipment )',
  ],
  'Pod': [
    'One Item',
    'Just a Few Items',
    'Small ( up to 7 ft )',
    'Medium ( up to 12 ft )',
    'Large ( over 13 ft )',
  ],
  'Truck': [
    'One Item',
    'Just a Few Items',
    'Small ( up to 15 ft )',
    'Medium ( up to 22 ft )',
    'Large ( up to 32 ft )',
    'Extra Large ( up to 72 ft )',
  ],
  'Pickup Truck': [
    'One Item',
    'Just a Few Items',
    'Small Bed (5 ft)',
    'Standard Bed (6.5 ft)',
    'Long Bed (8 ft)',
  ],
  'Trailer': [
    'One Item',
    'Just a Few Items',
    'Small ( up to 15 ft )',
    'Medium ( up to 22 ft )',
    'Large ( up to 32 ft )',
    'Extra Large ( up to 53 ft )',
  ],
  'Container': [
    'One Item',
    'Just a Few Items',
    'Small ( up to 15 ft )',
    'Medium ( up to 22 ft )',
    'Large ( up to 40 ft )',
  ],
  'Van': [
    'One Item',
    'Just a Few Items',
    'Cargo Van',
    'Mini Van',
  ],
};

/** 
 * Full list of "Type of place"
 */
const typeOfPlaceOptions = [
  'House',
  'Town House',
  'Apartment',
  'Outdoor Storage',
  'Indoor Storage',
  'Office',
  'Store',
  'Religious Institution',
  'Government Institution',
  'Pod',
  'Truck',
  'Pickup Truck',
  'Trailer',
  'Container',
  'Van',
];

/** Which place types are eligible for "How many stories" */
const storiesEligibleTypes = new Set([
  'House',
  'Town House',
  'Apartment',
  'Office',
  'Store',
  'Religious Institution',
  'Government Institution',
]);

/** The list of "How many stories" options */
const howManyStoriesOptions = [
  'Single Story',
  'Two Story',
  'Three Story',
  'Four Stories',
  '5+ Stories',
];

/**
 * If typeOfPlace ∈ this set => furnishing style has [Minimalist, Moderate, Dense]
 * else => [Sparse, Moderate, Full]
 */
const furnishingEligibleTypes = new Set([
  'House',
  'Town House',
  'Apartment',
  'Office',
  'Store',
  'Religious Institution',
  'Government Institution',
]);

function PlacePopup({ lead, onLeadUpdated, setIsPlacePopupVisible }) {
  const popupContentRef = useRef(null);

  // Which place are we editing? "origin" or "destination"
  const [selectedPlace, setSelectedPlace] = useState('origin');

  // local arrays for origin/destination
  const [localOriginStops, setLocalOriginStops] = useState([]);
  const [localDestinationStops, setLocalDestinationStops] = useState([]);

  // We'll track separate selectedStopIndexes for origin vs. destination
  const [selectedStopIndexOrigin, setSelectedStopIndexOrigin] = useState(0);
  const [selectedStopIndexDest, setSelectedStopIndexDest] = useState(0);

  // On mount => copy from lead into local arrays
  useEffect(() => {
    const origin = Array.isArray(lead.originStops) && lead.originStops.length > 0
      ? lead.originStops
      : [{ label: 'Main Address', address: '', apt: '', city: '', state: '', zip: '' }];

    const dest = Array.isArray(lead.destinationStops) && lead.destinationStops.length > 0
      ? lead.destinationStops
      : [{ label: 'Main Address', address: '', apt: '', city: '', state: '', zip: '' }];

    const originMapped = origin.map((stop) => ({
      ...stop,
      typeOfPlace: stop.typeOfPlace || '',
      moveSize: stop.moveSize || '',
      howManyStories: stop.howManyStories || '',
      features: Array.isArray(stop.features) ? stop.features : [],
      furnishingStyle: stop.furnishingStyle || '',
      needsCOI: !!stop.needsCOI,
    }));

    const destMapped = dest.map((stop) => ({
      ...stop,
      typeOfPlace: stop.typeOfPlace || '',
      moveSize: stop.moveSize || '',
      howManyStories: stop.howManyStories || '',
      features: Array.isArray(stop.features) ? stop.features : [],
      furnishingStyle: stop.furnishingStyle || '',
      needsCOI: !!stop.needsCOI,
    }));

    setLocalOriginStops(originMapped);
    setLocalDestinationStops(destMapped);
  }, [lead]);

  // If user clicks outside => close the popup
  const handleClose = useCallback(() => {
    setIsPlacePopupVisible(false);
  }, [setIsPlacePopupVisible]);

  // Outside-click detection
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

  // Decide which array & selectedStopIndex
  const currentStops = (selectedPlace === 'origin')
    ? localOriginStops
    : localDestinationStops;

  const selectedStopIndex = (selectedPlace === 'origin')
    ? selectedStopIndexOrigin
    : selectedStopIndexDest;

  function setSelectedStopIndex(idx) {
    if (selectedPlace === 'origin') {
      setSelectedStopIndexOrigin(idx);
    } else {
      setSelectedStopIndexDest(idx);
    }
  }

  // Add/update stops
  function handleStopsLocalUpdated(newStops) {
    if (selectedPlace === 'origin') {
      setLocalOriginStops(newStops);
    } else {
      setLocalDestinationStops(newStops);
    }
  }

  // The "current" stop
  const currentStop = currentStops[selectedStopIndex] || {};

  // Helper => set a field in the current stop
  function setStopField(fieldName, newValue) {
    const updated = [...currentStops];
    const cloned = { ...updated[selectedStopIndex] };
    cloned[fieldName] = newValue;
    updated[selectedStopIndex] = cloned;

    if (selectedPlace === 'origin') {
      setLocalOriginStops(updated);
    } else {
      setLocalDestinationStops(updated);
    }
  }

  // Move Size & Furnishing => only if origin
  // But "How many stories" => for both, if type is in the set
  const moveSizeOptions = moveSizeOptionsMap[currentStop.typeOfPlace] || [];
  const storiesApplicable = storiesEligibleTypes.has(currentStop.typeOfPlace);

  // If moveSize is "One Item" or "Just a Few Items" => furnishing style is disabled
  const isMoveSizeBasic =
    currentStop.moveSize === 'One Item' || currentStop.moveSize === 'Just a Few Items';
  const furnishingDisabled = (!currentStop.moveSize || isMoveSizeBasic);

  // Toggling features
  function toggleFeature(feature) {
    const clonedFeatures = Array.isArray(currentStop.features)
      ? [...currentStop.features]
      : [];
    const idx = clonedFeatures.indexOf(feature);
    if (idx === -1) {
      clonedFeatures.push(feature);
    } else {
      clonedFeatures.splice(idx, 1);
    }
    setStopField('features', clonedFeatures);
  }
  function isFeatureChecked(feature) {
    return Array.isArray(currentStop.features) && currentStop.features.includes(feature);
  }

  // Dropdown toggles
  const [showTypeOfPlaceDropdown, setShowTypeOfPlaceDropdown] = useState(false);
  const [showMoveSizeDropdown, setShowMoveSizeDropdown] = useState(false);
  const [showStoriesDropdown, setShowStoriesDropdown] = useState(false);
  const [showFurnishingDropdown, setShowFurnishingDropdown] = useState(false);

  // Type of place
  function handleToggleTypeOfPlaceDropdown() {
    setShowTypeOfPlaceDropdown((prev) => !prev);
    setShowMoveSizeDropdown(false);
    setShowStoriesDropdown(false);
    setShowFurnishingDropdown(false);
  }
  function handleSelectTypeOfPlace(option) {
    if (option !== currentStop.typeOfPlace) {
      // reset
      setStopField('moveSize', '');
      setStopField('howManyStories', '');
      setStopField('furnishingStyle', '');
    }
    setStopField('typeOfPlace', option);
    setShowTypeOfPlaceDropdown(false);
  }

  // Move size => only if origin
  function handleToggleMoveSizeDropdown() {
    if (!currentStop.typeOfPlace) return;
    setShowMoveSizeDropdown((prev) => !prev);
    setShowTypeOfPlaceDropdown(false);
    setShowStoriesDropdown(false);
    setShowFurnishingDropdown(false);
  }
  function handleSelectMoveSize(option) {
    if (option !== currentStop.moveSize) {
      setStopField('furnishingStyle', '');
    }
    setStopField('moveSize', option);
    setShowMoveSizeDropdown(false);
  }

  // How many stories => for both origin & destination if storiesEligible
  function handleToggleStoriesDropdown() {
    if (!storiesApplicable) return;
    setShowStoriesDropdown((prev) => !prev);
    setShowTypeOfPlaceDropdown(false);
    setShowMoveSizeDropdown(false);
    setShowFurnishingDropdown(false);
  }
  function handleSelectStories(option) {
    setStopField('howManyStories', option);
    setShowStoriesDropdown(false);
  }

  // Furnishing => only if origin & not disabled
  function handleToggleFurnishingDropdown() {
    if (furnishingDisabled) return;
    setShowFurnishingDropdown((prev) => !prev);
    setShowTypeOfPlaceDropdown(false);
    setShowMoveSizeDropdown(false);
    setShowStoriesDropdown(false);
  }
  function handleSelectFurnishingStyle(option) {
    setStopField('furnishingStyle', option);
    setShowFurnishingDropdown(false);
  }

  // COI => for both
  function toggleCOI() {
    setStopField('needsCOI', !currentStop.needsCOI);
  }

  // Save => store local arrays into lead
  function handleSave() {
    onLeadUpdated({
      ...lead,
      originStops: localOriginStops,
      destinationStops: localDestinationStops,
    });
    setIsPlacePopupVisible(false);
  }

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

        {/* BODY => SCROLLABLE */}
        <div className={styles.bodyContent}>

          {/* Radio group => origin/destination */}
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

          {/* Stop-offs UI */}
          <div className={styles.stopOffsPaddingWrapper}>
            <MainAndStopOffs
              stops={currentStops}
              onStopsUpdated={handleStopsLocalUpdated}
              selectedStopIndex={selectedStopIndex}
              setSelectedStopIndex={setSelectedStopIndex}
              placeType={selectedPlace}
            />
          </div>

          {/* ORIGIN BLOCK: full fields */}
          {selectedPlace === 'origin' && (
            <div className={styles.formFieldsWrapper}>
              {/* Type of Place */}
              <div className={styles.typeOfPlaceSelectWrapper}>
                <button
                  type="button"
                  className={styles.dropdownButton}
                  onClick={handleToggleTypeOfPlaceDropdown}
                >
                  <div className={styles.dropdownLabel}>
                    {currentStop.typeOfPlace ? (
                      <span className={styles.dropdownSelected}>
                        {currentStop.typeOfPlace}
                      </span>
                    ) : (
                      <>
                        <span className={styles.dropdownPrefix}>Type of place:</span>
                        <span className={styles.dropdownPlaceholder}>Select</span>
                      </>
                    )}
                  </div>
                </button>

                {showTypeOfPlaceDropdown && (
                  <ul className={styles.optionsList}>
                    {typeOfPlaceOptions.map((option) => {
                      const isSelected = currentStop.typeOfPlace === option;
                      return (
                        <li
                          key={option}
                          className={`${styles.option} ${isSelected ? styles.selected : ''}`}
                          onClick={() => handleSelectTypeOfPlace(option)}
                        >
                          {option}
                        </li>
                      );
                    })}
                  </ul>
                )}
              </div>

              {/* Move size */}
              <div className={styles.moveSizeSelectWrapper}>
                <button
                  type="button"
                  className={`${styles.dropdownButton} ${
                    !currentStop.typeOfPlace ? styles.disabledDropdown : ''
                  }`}
                  onClick={handleToggleMoveSizeDropdown}
                >
                  <div className={styles.dropdownLabel}>
                    {currentStop.moveSize ? (
                      <span className={styles.dropdownSelected}>{currentStop.moveSize}</span>
                    ) : (
                      <>
                        <span className={styles.dropdownPrefix}>Move size:</span>
                        <span className={styles.dropdownPlaceholder}>
                          {currentStop.typeOfPlace ? 'Select' : '—'}
                        </span>
                      </>
                    )}
                  </div>
                </button>

                {showMoveSizeDropdown && currentStop.typeOfPlace && (
                  <ul className={styles.optionsList}>
                    {moveSizeOptions.map((option) => {
                      const isSelected = currentStop.moveSize === option;
                      return (
                        <li
                          key={option}
                          className={`${styles.option} ${isSelected ? styles.selected : ''}`}
                          onClick={() => handleSelectMoveSize(option)}
                        >
                          {option}
                        </li>
                      );
                    })}
                  </ul>
                )}
              </div>

              {/* How many stories */}
              <div className={styles.storiesSelectWrapper}>
                <button
                  type="button"
                  className={`${styles.dropdownButton} ${
                    !storiesEligibleTypes.has(currentStop.typeOfPlace)
                      ? styles.disabledDropdown
                      : ''
                  }`}
                  onClick={handleToggleStoriesDropdown}
                >
                  <div className={styles.dropdownLabel}>
                    {currentStop.howManyStories ? (
                      <span className={styles.dropdownSelected}>
                        {currentStop.howManyStories}
                      </span>
                    ) : (
                      <>
                        <span className={styles.dropdownPrefix}>How many stories:</span>
                        <span className={styles.dropdownPlaceholder}>Select</span>
                      </>
                    )}
                  </div>
                </button>

                {showStoriesDropdown &&
                  storiesEligibleTypes.has(currentStop.typeOfPlace) && (
                  <ul className={styles.optionsList}>
                    {howManyStoriesOptions.map((option) => {
                      const isSelected = currentStop.howManyStories === option;
                      return (
                        <li
                          key={option}
                          className={`${styles.option} ${isSelected ? styles.selected : ''}`}
                          onClick={() => handleSelectStories(option)}
                        >
                          {option}
                        </li>
                      );
                    })}
                  </ul>
                )}
              </div>

              {/* 4 features */}
              <div className={styles.featuresGrid}>
                {['Basement', 'Attic', 'Shed', 'External Storage'].map((feature) => {
                  const checked = isFeatureChecked(feature);
                  return (
                    <label className={styles.featureCheckbox} key={feature}>
                      <input
                        type="checkbox"
                        className={styles.hiddenCheckbox}
                        checked={checked}
                        onChange={() => toggleFeature(feature)}
                      />
                      <span className={styles.customBox} />
                      <span className={styles.featureLabel}>{feature}</span>
                    </label>
                  );
                })}
              </div>

              {/* Furnishing style */}
              <div className={styles.furnishingSelectWrapper} style={{ marginTop: '21px' }}>
                <button
                  type="button"
                  className={`${styles.dropdownButton} ${
                    (!currentStop.moveSize
                     || currentStop.moveSize === 'One Item'
                     || currentStop.moveSize === 'Just a Few Items')
                      ? styles.disabledDropdown
                      : ''
                  }`}
                  onClick={handleToggleFurnishingDropdown}
                >
                  <div className={styles.dropdownLabel}>
                    {currentStop.furnishingStyle ? (
                      <span className={styles.dropdownSelected}>
                        {currentStop.furnishingStyle}
                      </span>
                    ) : (
                      <>
                        <span className={styles.dropdownPrefix}>Furnishing style:</span>
                        <span className={styles.dropdownPlaceholder}>Select</span>
                      </>
                    )}
                  </div>
                </button>

                {showFurnishingDropdown &&
                  currentStop.moveSize &&
                  currentStop.moveSize !== 'One Item' &&
                  currentStop.moveSize !== 'Just a Few Items' && (
                  <ul className={styles.optionsList}>
                    {(furnishingEligibleTypes.has(currentStop.typeOfPlace)
                      ? ['Minimalist', 'Moderate', 'Dense']
                      : ['Sparse', 'Moderate', 'Full']
                    ).map((option) => {
                      const isSelected = (currentStop.furnishingStyle === option);
                      return (
                        <li
                          key={option}
                          className={`${styles.option} ${isSelected ? styles.selected : ''}`}
                          onClick={() => handleSelectFurnishingStyle(option)}
                        >
                          {option}
                        </li>
                      );
                    })}
                  </ul>
                )}
              </div>

              {/* COI => margin top 16px for origin */}
              <div style={{ marginTop: '16px' }}>
                <label className={styles.featureCheckbox}>
                  <input
                    type="checkbox"
                    className={styles.hiddenCheckbox}
                    checked={!!currentStop.needsCOI}
                    onChange={toggleCOI}
                  />
                  <span className={styles.customBox} />
                  <span className={styles.featureLabel}>Certificate of Insurance</span>
                </label>
              </div>
            </div>
          )}

          {/* DESTINATION => no Move Size, no Furnishing style, 
              howManyStories if in set, plus a bigger margin for COI */}
          {selectedPlace === 'destination' && (
            <div className={styles.formFieldsWrapper}>
              {/* Type of place */}
              <div className={styles.typeOfPlaceSelectWrapper}>
                <button
                  type="button"
                  className={styles.dropdownButton}
                  onClick={handleToggleTypeOfPlaceDropdown}
                >
                  <div className={styles.dropdownLabel}>
                    {currentStop.typeOfPlace ? (
                      <span className={styles.dropdownSelected}>
                        {currentStop.typeOfPlace}
                      </span>
                    ) : (
                      <>
                        <span className={styles.dropdownPrefix}>Type of place:</span>
                        <span className={styles.dropdownPlaceholder}>Select</span>
                      </>
                    )}
                  </div>
                </button>

                {showTypeOfPlaceDropdown && (
                  <ul className={styles.optionsList}>
                    {typeOfPlaceOptions.map((option) => {
                      const isSelected = currentStop.typeOfPlace === option;
                      return (
                        <li
                          key={option}
                          className={`${styles.option} ${isSelected ? styles.selected : ''}`}
                          onClick={() => handleSelectTypeOfPlace(option)}
                        >
                          {option}
                        </li>
                      );
                    })}
                  </ul>
                )}
              </div>

              {/* How many stories => same logic as origin */}
              <div className={styles.storiesSelectWrapper}>
                <button
                  type="button"
                  className={`${styles.dropdownButton} ${
                    !storiesEligibleTypes.has(currentStop.typeOfPlace) ? styles.disabledDropdown : ''
                  }`}
                  onClick={handleToggleStoriesDropdown}
                >
                  <div className={styles.dropdownLabel}>
                    {currentStop.howManyStories ? (
                      <span className={styles.dropdownSelected}>
                        {currentStop.howManyStories}
                      </span>
                    ) : (
                      <>
                        <span className={styles.dropdownPrefix}>How many stories:</span>
                        <span className={styles.dropdownPlaceholder}>Select</span>
                      </>
                    )}
                  </div>
                </button>

                {showStoriesDropdown && storiesEligibleTypes.has(currentStop.typeOfPlace) && (
                  <ul className={styles.optionsList}>
                    {howManyStoriesOptions.map((option) => {
                      const isSelected = (currentStop.howManyStories === option);
                      return (
                        <li
                          key={option}
                          className={`${styles.option} ${isSelected ? styles.selected : ''}`}
                          onClick={() => handleSelectStories(option)}
                        >
                          {option}
                        </li>
                      );
                    })}
                  </ul>
                )}
              </div>

              {/* 4 features */}
              <div className={styles.featuresGrid}>
                {['Basement', 'Attic', 'Shed', 'External Storage'].map((feature) => {
                  const checked = isFeatureChecked(feature);
                  return (
                    <label className={styles.featureCheckbox} key={feature}>
                      <input
                        type="checkbox"
                        className={styles.hiddenCheckbox}
                        checked={checked}
                        onChange={() => toggleFeature(feature)}
                      />
                      <span className={styles.customBox} />
                      <span className={styles.featureLabel}>{feature}</span>
                    </label>
                  );
                })}
              </div>

              {/* No move size, no furnishing style. */}

              {/* COI => margin top "21px" for destination => 
                  We'll attach a class that sets margin-top: 21px. */}
              <div className={styles.coiDestination}>
                <label className={styles.featureCheckbox}>
                  <input
                    type="checkbox"
                    className={styles.hiddenCheckbox}
                    checked={!!currentStop.needsCOI}
                    onChange={toggleCOI}
                  />
                  <span className={styles.customBox} />
                  <span className={styles.featureLabel}>Certificate of Insurance</span>
                </label>
              </div>
            </div>
          )}
        </div>

        {/* FOOTER => Save */}
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

export default PlacePopup;
