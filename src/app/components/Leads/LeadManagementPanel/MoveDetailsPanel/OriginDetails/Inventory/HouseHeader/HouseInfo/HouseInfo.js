"use client";

import React, { useMemo, useEffect, useRef } from 'react';
import styles from './HouseInfo.module.css';
import Icon from 'src/app/components/Icon';
import { useUiState } from '../../../../UiStateContext';
import { getStopLabel } from 'src/app/components/Leads/LeadManagementPanel/MoveDetailsPanel/OriginDetails/Inventory/utils/getStopLabel'

/**
 * HouseInfo:
 *  - lead (object containing originStops/destinationStops)
 *  - stopIndex (number) => which stop is currently selected
 *  - onStopIndexChange (index => void)
 */
function HouseInfo({ lead }) {
  const dropdownRef = useRef(null);
  const [isOpen, setIsOpen] = React.useState(false);
    const {
      selectedOriginStopId,
      setSelectedOriginStopId
    } = useUiState();

  // 1) combine stops
  const combinedStops = useMemo(() => {
    if (!lead) return [];
    const origin = (lead.origins || [])
    .filter((stop) => stop.isVisible !== false)
    .map((stop) => ({ ...stop, stopType: 'origin' }));

  const destination = (lead.destinations || [])
    .filter((stop) => 
      stop.isVisible !== false &&
      stop.additionalServices &&
      stop.additionalServices.length > 0
    )
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
          <Icon name="House" className={styles.houseIcon} />
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
  const stopIndexInList = combinedStops.findIndex(stop => stop.id === selectedOriginStopId);
  const currentStop = combinedStops[stopIndexInList] || combinedStops[0];


const label = getStopLabel(currentStop, combinedStops);

  const typeOfPlace = currentStop?.typeOfPlace?.trim() || 'No Place Set';



  // Toggle dropdown
  const handleToggleDropdown = () => {
    if (!isSingleStop) {
      setIsOpen((prev) => !prev);
    }
  };

  // When user picks a new stop in the dropdown
  const handleSelectStop = (stopId) => {
    setSelectedOriginStopId(stopId);
    setIsOpen(false);
  };

  return (
    <div className={styles.houseInfoContainer} ref={dropdownRef}>
      <div className={styles.iconWrapper}>
        <Icon name="House" className={styles.houseIcon} />
      </div>

      <div className={styles.houseInfo}>
        <div
          className={`${styles.placeDropdownRow} ${isSingleStop ? styles.disabledRow : ''} ${isOpen ? styles.activeInput : ''}`}
          onClick={handleToggleDropdown}
        >
          <h1 className={styles.houseTitle}>{typeOfPlace}</h1>
          {!isSingleStop && (
            <Icon name="UnfoldMore" className={styles.moreIcon} />
          )}
        </div>
        <p className={styles.stopLabel}>{label}</p>

        {!isSingleStop && isOpen && (
          <ul className={styles.customDropdown}>
            {combinedStops.map((stop) => {
              
                const label = getStopLabel(stop, combinedStops)
              const itemTypeOfPlace = stop.typeOfPlace?.trim() || 'No Place Set';
              const displayText = `${itemTypeOfPlace} - ${label}`;
              const isSelected = stop.id === selectedOriginStopId;

              return (
                <li
                  key={stop.id}
                  onClick={() => handleSelectStop(stop.id)}
                  className={`${styles.dropdownItem} ${isSelected ? styles.selectedOption : ''}`}
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