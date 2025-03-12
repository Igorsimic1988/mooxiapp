// src/components/Inventory/HouseHeader/HouseInfo/HouseInfo.js

import React, { useMemo, useEffect, useRef } from 'react';
import styles from './HouseInfo.module.css';
import HouseIcon from '../../../../../../../../assets/icons/house.svg';
import MoreIcon from '../../../../../../../../assets/icons/unfoldmore.svg';
import Image from 'next/image';

/**
 * HouseInfo:
 *  - lead (object containing originStops/destinationStops)
 *  - stopIndex (number) => which stop is currently selected
 *  - onStopIndexChange (index => void)
 */
function HouseInfo({ lead, stopIndex, onStopIndexChange }) {
  const dropdownRef = useRef(null);
  const [isOpen, setIsOpen] = React.useState(false);

  // 1) combine stops
  const combinedStops = useMemo(() => {
    if (!lead) return [];
    const origin = (lead.originStops || []).map((stop) => ({ ...stop, stopType: 'origin' }));
    const destination = (lead.destinationStops || [])
      .filter((stop) => stop.additionalServices && stop.additionalServices.length > 0)
      .map((stop) => ({ ...stop, stopType: 'destination' }));
    return [...origin, ...destination];
  }, [lead]);

  // 2) outside click => close
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // If no stops, just show "No stops available"
  if (!combinedStops.length) {
    return (
      <div className={styles.houseInfoContainer}>
        <div className={styles.iconWrapper}>
          <Image src = {HouseIcon} alt = 'houseIcon' className={styles.houseIcon} aria-hidden="true"/>
        </div>
        <div className={styles.houseInfo}>
          <h1 className={styles.houseTitle}>No stops available</h1>
        </div>
      </div>
    );
  }

  // Is there only 1 stop?
  const isSingleStop = (combinedStops.length === 1);

  // Current stop
  const currentStop = combinedStops[stopIndex] || combinedStops[0];
  let { label = 'Unknown Stop', typeOfPlace } = currentStop;
  if (!typeOfPlace || !typeOfPlace.trim()) {
    typeOfPlace = 'No Place Set';
  }

  // Toggle dropdown
  const handleToggleDropdown = () => {
    if (!isSingleStop) {
      setIsOpen((prev) => !prev);
    }
  };

  // When user picks a new stop in the dropdown
  const handleSelectStop = (idx) => {
    onStopIndexChange(idx);
    setIsOpen(false);
  };

  return (
    <div className={styles.houseInfoContainer} ref={dropdownRef}>
      <div className={styles.iconWrapper}>
        <Image src = {HouseIcon} alt = 'houseIcon' className={styles.houseIcon} aria-hidden="true"/>
      </div>

      <div className={styles.houseInfo}>
        <div
          className={`${styles.placeDropdownRow} ${isSingleStop ? styles.disabledRow : ''}`}
          onClick={handleToggleDropdown}
        >
          <h1 className={styles.houseTitle}>{typeOfPlace}</h1>
          {!isSingleStop && (
        
            <Image 
            src = {MoreIcon} 
            alt = 'moreIcon' 
            className={`${styles.moreIcon} ${isOpen ? styles.rotate : ''}`}
            aria-hidden="true"/>
          )}
        </div>
        <p className={styles.stopLabel}>{label}</p>

        {!isSingleStop && isOpen && (
          <ul className={styles.customDropdown}>
            {combinedStops.map((stop, idx) => {
              const itemTypeOfPlace = stop.typeOfPlace?.trim() || 'No Place Set';
              const itemLabel = stop.label?.trim() || 'Unknown Stop';
              const displayText = `${itemTypeOfPlace} - ${itemLabel}`;
              const isSelected = idx === stopIndex;

              return (
                <li
                  key={idx}
                  onClick={() => handleSelectStop(idx)}
                  className={`${styles.dropdownItem} ${isSelected ? styles.selected : ''}`}
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
