import React, { useEffect, useRef, useCallback, useState } from 'react';
import styles from './PlacePopup.module.css';

// Icons
import { ReactComponent as HouseIcon } from '../../../../../../assets/icons/house.svg';
import { ReactComponent as CloseIcon } from '../../../../../../assets/icons/Close.svg';
import { ReactComponent as UnfoldMoreIcon } from '../../../../../../assets/icons/unfoldmore.svg';

// Reuse the MainAndStopOffs component
import MainAndStopOffs from '../MainAndStopOffs/MainAndStopOffs';

/**
 * A map from "typeOfPlace" => possible "moveSize" arrays.
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
 * A list of possible "typeOfPlace".
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

/** Which "typeOfPlace" are eligible for "How Many Stories" */
const storiesEligibleTypes = new Set([
  'House',
  'Town House',
  'Apartment',
  'Office',
  'Store',
  'Religious Institution',
  'Government Institution',
]);

const howManyStoriesOptions = [
  'Single Story',
  'Two Story',
  'Three Story',
  'Four Stories',
  '5+ Stories',
];

/** Which "typeOfPlace" are eligible for "Furnishing Style" beyond minimal. */
const furnishingEligibleTypes = new Set([
  'House',
  'Town House',
  'Apartment',
  'Office',
  'Store',
  'Religious Institution',
  'Government Institution',
]);

function PlacePopup({
  lead,
  onLeadUpdated,
  setIsPlacePopupVisible,
  defaultTab = 'origin',
  defaultStopIndex = 0,
}) {
  const popupContentRef = useRef(null);

  const [selectedPlace, setSelectedPlace] = useState(defaultTab);

  const [localOriginStops, setLocalOriginStops] = useState([]);
  const [localDestinationStops, setLocalDestinationStops] = useState([]);

  const [selectedStopIndexOrigin, setSelectedStopIndexOrigin] = useState(
    defaultTab === 'origin' ? defaultStopIndex : 0
  );
  const [selectedStopIndexDest, setSelectedStopIndexDest] = useState(
    defaultTab === 'destination' ? defaultStopIndex : 0
  );

  // On mount => copy from lead
  useEffect(() => {
    const origin = Array.isArray(lead.originStops) && lead.originStops.length > 0
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

    const dest = Array.isArray(lead.destinationStops) &&
      lead.destinationStops.length > 0
      ? lead.destinationStops
      : [
          {
            label: 'Main Drop off',
            address: '',
            apt: '',
            city: '',
            state: '',
            zip: '',
          },
        ];

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

  const handleClose = useCallback(() => {
    setIsPlacePopupVisible(false);
  }, [setIsPlacePopupVisible]);

  useEffect(() => {
    function handleClickOutside(e) {
      if (popupContentRef.current && !popupContentRef.current.contains(e.target)) {
        handleClose();
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [handleClose]);

  // If "destination" & "All items" => normal stops hidden => auto‐select first post
  useEffect(() => {
    if (selectedPlace === 'destination') {
      const hideNormalStops = !!lead.add_storage && lead.storage_items === 'All items';

      if (hideNormalStops) {
        const stopsArr = localDestinationStops;
        const curStop = stopsArr[selectedStopIndexDest];
        if (curStop && !curStop.postStorage) {
          const newIndex = stopsArr.findIndex((s) => s.postStorage);
          if (newIndex !== -1 && newIndex !== selectedStopIndexDest) {
            setSelectedStopIndexDest(newIndex);
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

  const currentStops =
    selectedPlace === 'origin' ? localOriginStops : localDestinationStops;
  const stopIndex =
    selectedPlace === 'origin' ? selectedStopIndexOrigin : selectedStopIndexDest;

  function handleSetStopIndex(idx) {
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

  const currentStop = currentStops[stopIndex] || {};

  function setStopField(fieldName, newValue) {
    const updated = [...currentStops];
    const cloned = { ...updated[stopIndex] };
    cloned[fieldName] = newValue;
    updated[stopIndex] = cloned;

    if (selectedPlace === 'origin') {
      setLocalOriginStops(updated);
    } else {
      setLocalDestinationStops(updated);
    }
  }

  const moveSizeOptions = moveSizeOptionsMap[currentStop.typeOfPlace] || [];
  const storiesApplicable = storiesEligibleTypes.has(currentStop.typeOfPlace);

  const isMoveSizeBasic =
    currentStop.moveSize === 'One Item' || currentStop.moveSize === 'Just a Few Items';
  const furnishingDisabled = !currentStop.moveSize || isMoveSizeBasic;

  function toggleFeature(feature) {
    const clonedFeatures = Array.isArray(currentStop.features)
      ? [...currentStop.features]
      : [];
    const idx = clonedFeatures.indexOf(feature);
    if (idx === -1) clonedFeatures.push(feature);
    else clonedFeatures.splice(idx, 1);
    setStopField('features', clonedFeatures);
  }

  function isFeatureChecked(feature) {
    return Array.isArray(currentStop.features) && currentStop.features.includes(feature);
  }

  const [showTypeOfPlaceDropdown, setShowTypeOfPlaceDropdown] = useState(false);
  const [showMoveSizeDropdown, setShowMoveSizeDropdown] = useState(false);
  const [showStoriesDropdown, setShowStoriesDropdown] = useState(false);
  const [showFurnishingDropdown, setShowFurnishingDropdown] = useState(false);

  // ---------- "Type of Place" ----------
  function handleToggleTypeOfPlaceDropdown() {
    setShowTypeOfPlaceDropdown((prev) => !prev);
    setShowMoveSizeDropdown(false);
    setShowStoriesDropdown(false);
    setShowFurnishingDropdown(false);
  }
  function handleSelectTypeOfPlace(option) {
    if (option !== currentStop.typeOfPlace) {
      setStopField('moveSize', '');
      setStopField('howManyStories', '');
      setStopField('furnishingStyle', '');
    }
    setStopField('typeOfPlace', option);
    setShowTypeOfPlaceDropdown(false);
  }

  // ---------- "Move Size" ----------
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

  // ---------- "How Many Stories" ----------
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

  // ---------- "Furnishing Style" ----------
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

  // ---------- COI ----------
  function toggleCOI() {
    setStopField('needsCOI', !currentStop.needsCOI);
  }

  // ---------- Save ----------
  function handleSave() {
    onLeadUpdated({
      ...lead,
      originStops: localOriginStops,
      destinationStops: localDestinationStops,
    });
    setIsPlacePopupVisible(false);
  }

  function DropdownButton({ label, value, onClick, disabled }) {
    const displayValue = value || 'Select';
    return (
      <button
        type="button"
        className={`${styles.dropdownButton} ${disabled ? styles.disabledDropdown : ''}`}
        onClick={onClick}
        disabled={disabled}
      >
        <span className={styles.oneLineEllipsis}>
          <span className={styles.inputLabel}>{label}</span>
          <span className={styles.inputValue}>{displayValue}</span>
        </span>
        <UnfoldMoreIcon className={styles.rightIcon} />
      </button>
    );
  }

  // Should we hide normal stops (destination + all items)?
  const hideNormalStops =
    selectedPlace === 'destination' && !!lead.add_storage && lead.storage_items === 'All items';

  // Filter out "inactive" stops if you only want to consider active ones
  const activeStops = currentStops.filter((s) => s.isActive !== false);

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

        <div className={styles.topSection}>
          {/* Radio group */}
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

          {/* Only show this if more than one *active* stop */}
          {activeStops.length > 1 && (
            <div className={styles.stopOffsPaddingWrapper}>
              <MainAndStopOffs
                stops={currentStops}
                onStopsUpdated={handleStopsLocalUpdated}
                selectedStopIndex={stopIndex}
                setSelectedStopIndex={handleSetStopIndex}
                placeType={selectedPlace}
                isStorageToggled={selectedPlace === 'destination' && !!lead.add_storage}
                hideNormalStops={hideNormalStops}
                hidePlusButtons
              />
            </div>
          )}
        </div>

        <div className={styles.scrollableContent}>
          {/* ORIGIN FORM */}
          {selectedPlace === 'origin' && (
            <div className={styles.formFieldsWrapper}>
              <div className={styles.typeOfPlaceSelectWrapper}>
                <DropdownButton
                  label="Type of place:"
                  value={currentStop.typeOfPlace}
                  onClick={handleToggleTypeOfPlaceDropdown}
                  disabled={false}
                />
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

              <div className={styles.moveSizeSelectWrapper}>
                <DropdownButton
                  label="Move size:"
                  value={currentStop.moveSize}
                  onClick={handleToggleMoveSizeDropdown}
                  disabled={!currentStop.typeOfPlace}
                />
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

              <div className={styles.storiesSelectWrapper}>
                <DropdownButton
                  label="How many stories:"
                  value={currentStop.howManyStories}
                  onClick={handleToggleStoriesDropdown}
                  disabled={!storiesApplicable}
                />
                {showStoriesDropdown && storiesApplicable && (
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

              <div className={styles.furnishingSelectWrapper} style={{ marginTop: '21px' }}>
                <DropdownButton
                  label="Furnishing style:"
                  value={currentStop.furnishingStyle}
                  onClick={handleToggleFurnishingDropdown}
                  disabled={furnishingDisabled}
                />
                {showFurnishingDropdown && !furnishingDisabled && (
                  <ul className={styles.optionsList}>
                    {(furnishingEligibleTypes.has(currentStop.typeOfPlace)
                      ? ['Minimalist', 'Moderate', 'Dense']
                      : ['Sparse', 'Moderate', 'Full']
                    ).map((option) => {
                      const isSelected = currentStop.furnishingStyle === option;
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

          {/* DESTINATION FORM */}
          {selectedPlace === 'destination' && (
            <div className={styles.formFieldsWrapper}>
              <div className={styles.typeOfPlaceSelectWrapper}>
                <DropdownButton
                  label="Type of place:"
                  value={currentStop.typeOfPlace}
                  onClick={handleToggleTypeOfPlaceDropdown}
                  disabled={false}
                />
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

              <div className={styles.storiesSelectWrapper}>
                <DropdownButton
                  label="How many stories:"
                  value={currentStop.howManyStories}
                  onClick={handleToggleStoriesDropdown}
                  disabled={!storiesApplicable}
                />
                {showStoriesDropdown && storiesApplicable && (
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

        <div className={styles.stickyFooter}>
          <button type="button" className={styles.saveButton} onClick={handleSave}>
            Save
          </button>
        </div>
      </div>
    </div>
  );
}

export default PlacePopup;
