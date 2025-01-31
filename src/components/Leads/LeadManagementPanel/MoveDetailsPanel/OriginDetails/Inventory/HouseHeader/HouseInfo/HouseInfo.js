import React, { useState, useMemo, useRef, useEffect } from 'react';
import styles from './HouseInfo.module.css';
import { ReactComponent as HouseIcon } from '../../../../../../../../assets/icons/house.svg';
import { ReactComponent as MoreIcon } from '../../../../../../../../assets/icons/unfoldmore.svg';

function HouseInfo({ lead }) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedStopIndex, setSelectedStopIndex] = useState(0);
  const dropdownRef = useRef(null);

  // 1) Combine origin + (destination w/ additionalServices)
  const combinedStops = useMemo(() => {
    if (!lead) return [];
    const origin = (lead.originStops || []).map(stop => ({ ...stop, stopType: 'origin' }));
    const destination = (lead.destinationStops || [])
      .filter(stop => stop.additionalServices && stop.additionalServices.length > 0)
      .map(stop => ({ ...stop, stopType: 'destination' }));
    return [...origin, ...destination];
  }, [lead]);

  // 2) Always call this hook, unconditionally
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // 3) Early return AFTER all hooks
  if (!combinedStops.length) {
    return (
      <div className={styles.houseInfoContainer}>
        <div className={styles.iconWrapper}>
          <HouseIcon className={styles.houseIcon} aria-hidden="true" />
        </div>
        <div className={styles.houseInfo}>
          <h1 className={styles.houseTitle}>No stops available</h1>
        </div>
      </div>
    );
  }

  // Check how many stops we have
  const isSingleStop = (combinedStops.length === 1);

  // 4) Otherwise, proceed
  const currentStop = combinedStops[selectedStopIndex];
  // If typeOfPlace is empty => "No Place Set"
  let { label = 'Unknown Stop', typeOfPlace } = currentStop;
  if (!typeOfPlace || !typeOfPlace.trim()) {
    typeOfPlace = 'No Place Set';
  }

  // Toggle the dropdown
  const handleToggleDropdown = () => {
    // Only allow toggling if more than one stop
    if (!isSingleStop) {
      setIsOpen(prev => !prev);
    }
  };

  // Select a stop
  const handleSelectStop = (index) => {
    setSelectedStopIndex(index);
    setIsOpen(false);
  };

  return (
    <div className={styles.houseInfoContainer} ref={dropdownRef}>
      {/* Left icon */}
      <div className={styles.iconWrapper}>
        <HouseIcon className={styles.houseIcon} aria-hidden="true" />
      </div>

      {/* Info section */}
      <div className={styles.houseInfo}>
        {/* 
          If more than one stop, .placeDropdownRow is clickable. Otherwise no pointer. 
        */}
        <div
          className={`${styles.placeDropdownRow} ${isSingleStop ? styles.disabledRow : ''}`}
          onClick={handleToggleDropdown}
        >
          <h1 className={styles.houseTitle}>{typeOfPlace}</h1>

          {/* Hide the MoreIcon if there's only one stop */}
          {!isSingleStop && (
            <MoreIcon
              className={`${styles.moreIcon} ${isOpen ? styles.rotate : ''}`}
              aria-hidden="true"
            />
          )}
        </div>
        
        <p className={styles.stopLabel}>{label}</p>

        {/* If only one stop, we skip the dropdown entirely */}
        {!isSingleStop && isOpen && (
          <ul className={styles.customDropdown}>
            {combinedStops.map((stop, index) => {
              let itemTypeOfPlace = stop.typeOfPlace && stop.typeOfPlace.trim()
                ? stop.typeOfPlace
                : 'No Place Set';
              let itemLabel = stop.label && stop.label.trim()
                ? stop.label
                : 'Unknown Stop';

              const displayText = `${itemTypeOfPlace} - ${itemLabel}`;

              return (
                <li
                  key={index}
                  onClick={() => handleSelectStop(index)}
                  className={`
                    ${styles.dropdownItem} 
                    ${index === selectedStopIndex ? styles.selected : ''}
                  `}
                >
                  {displayText}
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}

export default HouseInfo;
