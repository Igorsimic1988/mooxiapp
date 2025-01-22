// src/components/Leads/LeadManagementPanel/MoveDetailsPanel/OriginDetails/PlacePopup/PlacePopup.js

import React, { useEffect, useRef, useCallback, useState } from 'react';
import styles from './PlacePopup.module.css';

// Icons
import { ReactComponent as HouseIcon } from '../../../../../../assets/icons/house.svg';
import { ReactComponent as CloseIcon } from '../../../../../../assets/icons/Close.svg';

// Reuse the MainAndStopOffs component for the stops
import MainAndStopOffs from '../MainAndStopOffs/MainAndStopOffs';

/**
 * Mappings for "type of place" => possible "move size" options.
 */
const moveSizeOptionsMap = {
  'House': [
    'One Item',
    'Just a Few Items',
    '2 Beedroom',
    '3 Beedroom',
    '4 Beedroom',
    '5 Beedroom',
    '6 Beedroom',
    '7 Beedroom',
    '8 Beedroom',
    '9+ Beedroom',
  ],
  'Town House': [
    'One Item',
    'Just a Few Items',
    '2 Beedroom',
    '3 Beedroom',
    '4 Beedroom',
    '5 Beedroom',
    '6 Beedroom',
    '7 Beedroom',
    '8 Beedroom',
    '9+ Beedroom',
  ],
  'Apartment': [
    'One Item',
    'Just a Few Items',
    '2 Beedroom',
    '3 Beedroom',
    '4 Beedroom',
    '5 Beedroom',
    '6 Beedroom',
    '7 Beedroom',
    '8 Beedroom',
    '9+ Beedroom',
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
    'Small ( Limited inventory, a few aisles or sections. )',
    'Medium ( Moderate inventory, several aisles or sections. )',
    'Large ( Extensive inventory, many aisles or departments )',
    'Extra Large ( Extensive inventory, multiple departments, and complex layout. )',
  ],
  'Religious Institution': [
    'One Item',
    'Just a Few Items',
    'Small ( basic furniture, seating, and minimal equipment. )',
    'Medium ( More furniture, seating, artifacts, and some equipment. )',
    'Large ( Significant seating, artifacts, altars, and multiple rooms. )',
    'Extra Large ( Large-scale, multiple areas, specialized furniture and equipment. )',
  ],
  'Government Institution': [
    'One Item',
    'Just a Few Items',
    'Small ( Limited items, basic office furniture, and minimal equipment. )',
    'Medium ( More furniture, office setups, and some specialized equipment. )',
    'Large ( Significant office setups, multiple departments, and extensive equipment. )',
    'Extra Large ( Large-scale, multiple offices, specialized furniture, and advanced equipment. )',
  ],
  'Pod': [
    'One Item',
    'Just a Few Items',
    'Small ( up tp 7ft)',
    'Medium ( up to 12ft )',
    'Large ( over 13 ft )',
  ],
  'Truck': [
    'One Item',
    'Just a Few Items',
    'Small ( up to 15 ft )',
    'Medium ( up to 22 ft )',
    'Large ( up to 32 ft )',
    'Extra Large ( up to 72 ft)',
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
    'Extra Large ( up to 53 ft)',
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

/** Full list of "Type of place" */
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

/** Which place types are eligible for the "How many stories" dropdown */
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
 * PlacePopup
 * ----------
 * Props:
 *   - lead: object with lead.originStops, lead.destinationStops
 *   - onLeadUpdated: function(updatedLead)
 *   - setIsPlacePopupVisible: function(bool)
 */
function PlacePopup({ lead, onLeadUpdated, setIsPlacePopupVisible }) {
  const popupContentRef = useRef(null);

  // which place: 'origin' or 'destination'
  const [selectedPlace, setSelectedPlace] = useState('origin');

  // track separate selectedStopIndexes for origin vs. destination
  const [selectedStopIndexOrigin, setSelectedStopIndexOrigin] = useState(0);
  const [selectedStopIndexDest, setSelectedStopIndexDest] = useState(0);

  // close popup if user clicks outside
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
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [handleClose]);

  // ensure lead has arrays
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
    // eslint-disable-next-line
  }, []);

  // figure out which array of stops to display
  const originStops = lead.originStops || [];
  const destinationStops = lead.destinationStops || [];
  const currentStops =
    selectedPlace === 'origin' ? originStops : destinationStops;

  // figure out which index is selected
  const selectedStopIndex =
    selectedPlace === 'origin' ? selectedStopIndexOrigin : selectedStopIndexDest;

  function setSelectedStopIndex(idx) {
    if (selectedPlace === 'origin') {
      setSelectedStopIndexOrigin(idx);
    } else {
      setSelectedStopIndexDest(idx);
    }
  }

  // Called when user modifies stops in MainAndStopOffs
  function handleStopsUpdated(newStops) {
    if (selectedPlace === 'origin') {
      onLeadUpdated({ ...lead, originStops: newStops });
    } else {
      onLeadUpdated({ ...lead, destinationStops: newStops });
    }
  }

  // ----------------------------
  //  Type of place / Move size / Stories
  // ----------------------------
  const [typeOfPlace, setTypeOfPlace] = useState('');
  const [moveSize, setMoveSize] = useState('');
  const [howManyStories, setHowManyStories] = useState('');

  const [showTypeOfPlaceDropdown, setShowTypeOfPlaceDropdown] = useState(false);
  const [showMoveSizeDropdown, setShowMoveSizeDropdown] = useState(false);
  const [showStoriesDropdown, setShowStoriesDropdown] = useState(false);

  // If typeOfPlace changes => reset moveSize & howManyStories
  useEffect(() => {
    setMoveSize('');
    setHowManyStories('');
  }, [typeOfPlace]);

  // possible move sizes for the chosen type
  const moveSizeOptions = typeOfPlace
    ? moveSizeOptionsMap[typeOfPlace] || []
    : [];

  // "How many stories" is applicable?
  const storiesApplicable = storiesEligibleTypes.has(typeOfPlace);

  useEffect(() => {
    if (!storiesApplicable) {
      setHowManyStories('');
    }
  }, [storiesApplicable]);

  function handleToggleTypeOfPlaceDropdown() {
    setShowTypeOfPlaceDropdown((prev) => !prev);
    setShowMoveSizeDropdown(false);
    setShowStoriesDropdown(false);
    setShowFurnishingDropdown(false);
  }
  function handleSelectTypeOfPlace(option) {
    setTypeOfPlace(option);
    setShowTypeOfPlaceDropdown(false);
  }

  function handleToggleMoveSizeDropdown() {
    if (!typeOfPlace) return;
    setShowMoveSizeDropdown((prev) => !prev);
    setShowTypeOfPlaceDropdown(false);
    setShowStoriesDropdown(false);
    setShowFurnishingDropdown(false);
  }
  function handleSelectMoveSize(option) {
    setMoveSize(option);
    setShowMoveSizeDropdown(false);
  }

  function handleToggleStoriesDropdown() {
    if (!storiesApplicable) return;
    setShowStoriesDropdown((prev) => !prev);
    setShowTypeOfPlaceDropdown(false);
    setShowMoveSizeDropdown(false);
    setShowFurnishingDropdown(false);
  }
  function handleSelectStories(option) {
    setHowManyStories(option);
    setShowStoriesDropdown(false);
  }

  // ----------------------------
  // 4 checkboxes (Basement, Attic, Shed, External Storage)
  // ----------------------------
  const [checkedFeatures, setCheckedFeatures] = useState([]);
  const featuresList = ['Basement', 'Attic', 'Shed', 'External Storage'];

  function toggleFeature(feature) {
    setCheckedFeatures((prev) => {
      if (prev.includes(feature)) {
        // remove
        return prev.filter((f) => f !== feature);
      } else {
        // add
        return [...prev, feature];
      }
    });
  }
  function isFeatureChecked(feature) {
    return checkedFeatures.includes(feature);
  }

  // ----------------------------
  // Furnishing style => hidden if moveSize is "One Item" or "Just a Few Items"
  // If typeOfPlace is House/Town House/Apartment/Office/Store/Religious Inst/Government => [Minimalist, Moderate, Dense]
  // else => [Sparse, Moderate, Full]
  // ----------------------------
  const furnishingEligibleTypes = new Set([
    'House',
    'Town House',
    'Apartment',
    'Office',
    'Store',
    'Religious Institution',
    'Government Institution'
  ]);

  const [furnishingStyle, setFurnishingStyle] = useState('');
  const [showFurnishingDropdown, setShowFurnishingDropdown] = useState(false);

  const isMoveSizeBasic =
    moveSize === 'One Item' || moveSize === 'Just a Few Items';
  const shouldShowFurnishing = !isMoveSizeBasic && moveSize !== '';

  useEffect(() => {
    // reset furnishing style if typeOfPlace or moveSize changes
    setFurnishingStyle('');
  }, [typeOfPlace, moveSize]);

  let furnishingOptions = [];
  if (furnishingEligibleTypes.has(typeOfPlace)) {
    furnishingOptions = ['Minimalist', 'Moderate', 'Dense'];
  } else {
    furnishingOptions = ['Sparse', 'Moderate', 'Full'];
  }

  function handleToggleFurnishingDropdown() {
    if (!shouldShowFurnishing) return;
    setShowFurnishingDropdown((prev) => !prev);
    setShowTypeOfPlaceDropdown(false);
    setShowMoveSizeDropdown(false);
    setShowStoriesDropdown(false);
  }
  function handleSelectFurnishingStyle(option) {
    setFurnishingStyle(option);
    setShowFurnishingDropdown(false);
  }

  // ----------------------------
  //  Single checkbox => "Certificate of Insurance" 16px below furnishing style
  // ----------------------------
  const [needsCOI, setNeedsCOI] = useState(false);
  function toggleCOI() {
    setNeedsCOI((prev) => !prev);
  }

  // ----------------------------
  //  Sticky Footer => "Save" button
  // ----------------------------
  const handleSave = () => {
    console.log('PlacePopup: Save clicked');
    // If you need to do something specific, do it here.
    // Then close the popup:
    setIsPlacePopupVisible(false);
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

        {/* SCROLLABLE BODY */}
        <div className={styles.bodyContent}>
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

          {/* STOP-OFFS UI */}
          <div className={styles.stopOffsPaddingWrapper}>
            <MainAndStopOffs
              stops={currentStops}
              onStopsUpdated={handleStopsUpdated}
              selectedStopIndex={selectedStopIndex}
              setSelectedStopIndex={setSelectedStopIndex}
            />
          </div>

          {/* FORM FIELDS WRAPPER */}
          <div className={styles.formFieldsWrapper}>

            {/* 1) Type of place */}
            <div className={styles.typeOfPlaceSelectWrapper}>
              <button
                type="button"
                className={styles.dropdownButton}
                onClick={handleToggleTypeOfPlaceDropdown}
              >
                <div className={styles.dropdownLabel}>
                  {typeOfPlace === '' ? (
                    <>
                      <span className={styles.dropdownPrefix}>Type of place:</span>
                      <span className={styles.dropdownPlaceholder}>Select</span>
                    </>
                  ) : (
                    <span className={styles.dropdownSelected}>{typeOfPlace}</span>
                  )}
                </div>
              </button>

              {showTypeOfPlaceDropdown && (
                <ul className={styles.optionsList}>
                  {typeOfPlaceOptions.map((option) => {
                    const isSelected = typeOfPlace === option;
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

            {/* 2) Move size */}
            <div className={styles.moveSizeSelectWrapper}>
              <button
                type="button"
                className={`${styles.dropdownButton} ${!typeOfPlace ? styles.disabledDropdown : ''}`}
                onClick={handleToggleMoveSizeDropdown}
              >
                <div className={styles.dropdownLabel}>
                  {moveSize === '' ? (
                    <>
                      <span className={styles.dropdownPrefix}>Move size:</span>
                      <span className={styles.dropdownPlaceholder}>
                        {typeOfPlace ? 'Select' : '—'}
                      </span>
                    </>
                  ) : (
                    <span className={styles.dropdownSelected}>{moveSize}</span>
                  )}
                </div>
              </button>

              {showMoveSizeDropdown && typeOfPlace && (
                <ul className={styles.optionsList}>
                  {moveSizeOptions.map((option) => {
                    const isSelected = moveSize === option;
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

            {/* 3) How many stories (if applicable) */}
            {storiesApplicable && (
              <div className={styles.storiesSelectWrapper}>
                <button
                  type="button"
                  className={styles.dropdownButton}
                  onClick={handleToggleStoriesDropdown}
                >
                  <div className={styles.dropdownLabel}>
                    {howManyStories === '' ? (
                      <>
                        <span className={styles.dropdownPrefix}>How many stories:</span>
                        <span className={styles.dropdownPlaceholder}>Select</span>
                      </>
                    ) : (
                      <span className={styles.dropdownSelected}>{howManyStories}</span>
                    )}
                  </div>
                </button>

                {showStoriesDropdown && (
                  <ul className={styles.optionsList}>
                    {howManyStoriesOptions.map((option) => {
                      const isSelected = howManyStories === option;
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
            )}

            {/* 4) The 4 features checkboxes */}
            <div className={styles.featuresGrid}>
              {featuresList.map((feature) => {
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

            {/* 5) Furnishing style */}
            {shouldShowFurnishing && (
              <div style={{ marginTop: '21px', position: 'relative' }}>
                <button
                  type="button"
                  className={styles.dropdownButton}
                  onClick={handleToggleFurnishingDropdown}
                >
                  <div className={styles.dropdownLabel}>
                    {furnishingStyle === '' ? (
                      <>
                        <span className={styles.dropdownPrefix}>Furnishing style:</span>
                        <span className={styles.dropdownPlaceholder}>Select</span>
                      </>
                    ) : (
                      <span className={styles.dropdownSelected}>{furnishingStyle}</span>
                    )}
                  </div>
                </button>

                {showFurnishingDropdown && (
                  <ul className={styles.optionsList}>
                    {furnishingOptions.map((option) => {
                      const isSelected = furnishingStyle === option;
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
            )}

            {/* 6) Single "Certificate of Insurance" checkbox */}
            <div style={{ marginTop: '16px' }}>
              <label className={styles.featureCheckbox}>
                <input
                  type="checkbox"
                  className={styles.hiddenCheckbox}
                  checked={needsCOI}
                  onChange={toggleCOI}
                />
                <span className={styles.customBox} />
                <span className={styles.featureLabel}>Certificate of Insurance</span>
              </label>
            </div>
          </div>
        </div>

        {/* STICKY FOOTER with Save button */}
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
