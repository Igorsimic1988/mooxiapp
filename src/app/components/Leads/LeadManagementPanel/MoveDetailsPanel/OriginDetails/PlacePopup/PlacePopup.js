"use client";

import React, { useEffect, useRef, useCallback, useState, useMemo } from 'react';
import styles from './PlacePopup.module.css';

// Icons
import Icon from '../../../../../Icon';

// Reuse the MainAndStopOffs component
import MainAndStopOffs from '../MainAndStopOffs/MainAndStopOffs';
import { useUiState } from '../../UiStateContext';
import { moveSizeOptionsMap, typeOfPlaceOptions, storiesEligibleTypes, howManyStoriesOptions, furnishingEligibleTypes, allowedOriginFields, allowedDestinationFields } from './PlacePopupConstants';


function PlacePopup({
  lead,
  onDestinationUpdated,
  onOriginUpdated,
  setIsPlacePopupVisible,
  defaultTab = 'origin',
  destinationStops,
  originStops,
}) {
  const popupContentRef = useRef(null);

  const [selectedPlace, setSelectedPlace] = useState(defaultTab);
  const [localStops, setLocalStops] = useState([]);
  const [localStop, setLocalStop] = useState({});
  const {
      selectedOriginStopId,
      setSelectedOriginStopId,
      selectedDestinationStopId,
      setSelectedDestinationStopId,
  } = useUiState();

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
        return exists ? prev : stopsToUse[0]?.id || null;
      });
    }
  }, [selectedPlace, originStops, destinationStops, lead.addStorage, lead.storageItems]);

  const currentStops = useMemo(() => (
    selectedPlace === 'origin' ? originStops : destinationStops
  ), [selectedPlace, originStops, destinationStops]);
  
  const selectedStopId =
    selectedPlace === 'origin' ? selectedOriginStopId : selectedDestinationStopId;

  function handleSetStopId(id) {
    if (selectedPlace === 'origin') {
      setSelectedOriginStopId(id);
    } else {
      setSelectedDestinationStopId(id);
    }
  }
  useEffect(() => {
    const selected = currentStops.find((s) => s.id === selectedStopId);
    if (!selected) return;
  
    const existsInLocal = localStops.find((s) => s.id === selected.id);
    if (!existsInLocal) {
      setLocalStops((prev) => [...prev, { ...selected, stopType: selectedPlace }]);
      setLocalStop({ ...selected, stopType: selectedPlace });
    } else {
      setLocalStop({ ...existsInLocal });
    }
  }, [selectedStopId, selectedPlace, currentStops, localStops]);
  
  
  

  function setStopField(fieldName, newValue) {
    if (!selectedStopId || localStop[fieldName] === newValue) return;
    const updatedStop = {
      ...localStop,
      [fieldName]: newValue,
    };
    setLocalStop(updatedStop);
  
    setLocalStops((prev) =>
      prev.map((stop) =>
        stop.id === selectedStopId ? updatedStop : stop
      )
    );
  }

  const moveSizeOptions = moveSizeOptionsMap[localStop.typeOfPlace] || [];
  const storiesApplicable = storiesEligibleTypes.has(localStop.typeOfPlace);

  const isMoveSizeBasic =
  localStop.moveSize === 'One Item' || localStop.moveSize === 'Just a Few Items';
  const furnishingDisabled = !localStop.moveSize || isMoveSizeBasic;

  function toggleFeature(feature) {
    const clonedFeatures = Array.isArray(localStop.features)
      ? [...localStop.features]
      : [];
    const idx = clonedFeatures.indexOf(feature);
    if (idx === -1) clonedFeatures.push(feature);
    else clonedFeatures.splice(idx, 1);
    setStopField('features', clonedFeatures);
  }

  function isFeatureChecked(feature) {
    return Array.isArray(localStop.features) && localStop.features.includes(feature);
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
    if (option !== localStop.typeOfPlace) {
      setStopField('moveSize', '');
      setStopField('howManyStories', '');
      setStopField('furnishingStyle', '');
    }
    setStopField('typeOfPlace', option);
    setShowTypeOfPlaceDropdown(false);
  }

  // ---------- "Move Size" ----------
  function handleToggleMoveSizeDropdown() {
    if (!localStop.typeOfPlace) return;
    setShowMoveSizeDropdown((prev) => !prev);
    setShowTypeOfPlaceDropdown(false);
    setShowStoriesDropdown(false);
    setShowFurnishingDropdown(false);
  }
  function handleSelectMoveSize(option) {
    if (option !== localStop.moveSize) {
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
    setStopField('needsCOI', !localStop.needsCOI);
  }

  function filterAllowedFields(obj, allowedKeys) {
    return Object.fromEntries(
      Object.entries(obj).filter(([key]) => allowedKeys.includes(key))
    );
  }
  
  function handleSave() {
    localStops.forEach((stop) => {
      const filteredData = filterAllowedFields(
        stop,
        stop.stopType === 'origin' ? allowedOriginFields : allowedDestinationFields
      );
  
      if (stop.stopType === 'origin') {
        onOriginUpdated(stop.id, filteredData);
      } else {
        onDestinationUpdated(stop.id, filteredData);
      }
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
        <Icon name="UnfoldMore" className={styles.rightIcon} />
      </button>
    );
  }

  // Should we hide normal stops (destination + all items)?
  const hideNormalStops =
    selectedPlace === 'destination' && !!lead.addStorage && lead.storageItems === 'All items';

  // Filter out "inactive" stops if you only want to consider active ones
  const activeStops = currentStops.filter((s) => s.isActive !== false);

  return (
    <div className={styles.popup}>
      <div className={styles.popupContent} ref={popupContentRef}>
        {/* HEADER */}
        <div className={styles.header}>
          <div className={styles.title}>
            <Icon name="House" className={styles.icon} />
            <p>Place</p>
          </div>
          <div className={styles.closeButton}>
            <button onClick={handleClose} aria-label="Close">
              <Icon name="Close" className={styles.closeIcon} />
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
                selectedStopId={selectedStopId}
                setSelectedStopId={handleSetStopId}
                placeType={selectedPlace}
                isStorageToggled={selectedPlace === 'destination' && !!lead.addStorage}
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
                  value={localStop.typeOfPlace}
                  onClick={handleToggleTypeOfPlaceDropdown}
                  disabled={false}
                  className={showTypeOfPlaceDropdown ? styles.activeInput : ''}
                />
                {showTypeOfPlaceDropdown && (
                  <ul className={styles.optionsList}>
                    {typeOfPlaceOptions.map((option) => {
                      const isSelected = localStop.typeOfPlace === option;
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
                  value={localStop.moveSize}
                  onClick={handleToggleMoveSizeDropdown}
                  disabled={!localStop.typeOfPlace}
                  className={showMoveSizeDropdown ? styles.activeInput : ''}
                />
                {showMoveSizeDropdown && localStop.typeOfPlace && (
                  <ul className={styles.optionsList}>
                    {moveSizeOptions.map((option) => {
                      const isSelected = localStop.moveSize === option;
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
                  value={localStop.howManyStories}
                  onClick={handleToggleStoriesDropdown}
                  disabled={!storiesApplicable}
                  className={showStoriesDropdown ? styles.activeInput : ''}
                />
                {showStoriesDropdown && storiesApplicable && (
                  <ul className={styles.optionsList}>
                    {howManyStoriesOptions.map((option) => {
                      const isSelected = localStop.howManyStories === option;
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
                  value={localStop.furnishingStyle}
                  onClick={handleToggleFurnishingDropdown}
                  disabled={furnishingDisabled}
                  className={showFurnishingDropdown ? styles.activeInput : ''}
                />
                {showFurnishingDropdown && !furnishingDisabled && (
                  <ul className={styles.optionsList}>
                    {(furnishingEligibleTypes.has(localStop.typeOfPlace)
                      ? ['Minimalist', 'Moderate', 'Dense']
                      : ['Sparse', 'Moderate', 'Full']
                    ).map((option) => {
                      const isSelected = localStop.furnishingStyle === option;
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
                    checked={!!localStop.needsCOI}
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
                <button
                  type="button"
                  className={`${styles.dropdownButton} ${showTypeOfPlaceDropdown ? styles.activeInput : ''}`}
                  onClick={handleToggleTypeOfPlaceDropdown}
                >
                  <span className={styles.oneLineEllipsis}>
                    <span className={styles.inputLabel}>Type of place:</span>
                    <span className={styles.inputValue}>{localStop.typeOfPlace || 'Select'}</span>
                  </span>
                  <Icon name="UnfoldMore" className={styles.rightIcon} />
                </button>
                {showTypeOfPlaceDropdown && (
                  <ul className={styles.optionsList}>
                    {typeOfPlaceOptions.map((option) => {
                      const isSelected = localStop.typeOfPlace === option;
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
                <button
                  type="button"
                  className={`${styles.dropdownButton} ${!storiesApplicable ? styles.disabledDropdown : ''} ${showStoriesDropdown ? styles.activeInput : ''}`}
                  onClick={handleToggleStoriesDropdown}
                  disabled={!storiesApplicable}
                >
                  <span className={styles.oneLineEllipsis}>
                    <span className={styles.inputLabel}>How many stories:</span>
                    <span className={styles.inputValue}>{localStop.howManyStories || 'Select'}</span>
                  </span>
                  <Icon name="UnfoldMore" className={styles.rightIcon} />
                </button>
                {showStoriesDropdown && storiesApplicable && (
                  <ul className={styles.optionsList}>
                    {howManyStoriesOptions.map((option) => {
                      const isSelected = localStop.howManyStories === option;
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
                    checked={!!localStop.needsCOI}
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