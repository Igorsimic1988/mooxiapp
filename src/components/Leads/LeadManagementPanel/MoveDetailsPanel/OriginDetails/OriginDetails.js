// src/components/Leads/LeadManagementPanel/MoveDetailsPanel/OriginDetails/OriginDetails.js

import React, { useState } from 'react';
import { ReactComponent as LocationIcon } from '../../../../../assets/icons/location.svg';
import { ReactComponent as PlaceIcon } from '../../../../../assets/icons/place1.svg';
import { ReactComponent as AccessIcon } from '../../../../../assets/icons/access1.svg';
import { ReactComponent as ServicesIcon } from '../../../../../assets/icons/services1.svg';
import { ReactComponent as UnfoldMoreIcon } from '../../../../../assets/icons/unfoldmore.svg';
import { ReactComponent as MyInventoryIcon } from '../../../../../assets/icons/myinventory.svg';
import SimpleToggle from '../../../SimpleToggle/SimpleToggle';
import styles from './OriginDetails.module.css';

// The popup
import PlacePopup from './PlacePopup/PlacePopup';

// The reusable "Main + Stop-offs" row
import MainAndStopOffs from './MainAndStopOffs/MainAndStopOffs';

function OriginDetails({ onShowInventory }) {
  // 1) Manage "stopOffs" array in local state
  const [stopOffs, setStopOffs] = useState([]);

  // 2) The currently-selected stop (default "Main Address")
  const [selectedStop, setSelectedStop] = useState('Main Address');

  // Add a new stop-off
  const handleAddStopOff = () => {
    const newStopNum = stopOffs.length + 1;
    const newStopLabel = `Stop off ${newStopNum}`;
    setStopOffs((prev) => [...prev, newStopLabel]);
    setSelectedStop(newStopLabel);
  };

  // Collapsible
  const [isCollapsed, setIsCollapsed] = useState(false);
  const handleToggleCollapse = () => setIsCollapsed((prev) => !prev);

  // Basic address info
  const [propertyAddress, setPropertyAddress] = useState('');
  const [aptOrSuite, setAptOrSuite] = useState('');
  const [city, setCity] = useState('');
  const [stateName, setStateName] = useState('');
  const [zipCode, setZipCode] = useState('');

  // Time restrictions
  const [timeRestrictionsToggled, setTimeRestrictionsToggled] = useState(false);

  // Place popup
  const [isPlacePopupOpen, setIsPlacePopupOpen] = useState(false);

  return (
    <div className={styles.originContainer}>
      <div className={styles.originHeader}>
        <span className={styles.originTitle}>Origin</span>
        <button className={styles.minusButton} onClick={handleToggleCollapse}>
          {isCollapsed ? '+' : '-'}
        </button>
      </div>

      {/* Only render if not collapsed */}
      {!isCollapsed && (
        <>
          {/* Stop-offs */}
          <MainAndStopOffs
            stopOffs={stopOffs}
            selectedStop={selectedStop}
            setSelectedStop={setSelectedStop}
            onAddStopOff={handleAddStopOff}
          />

          <div className={styles.propertySection}>
            <span className={styles.propertyAddressText}>Property Address</span>
            <div className={styles.inputContainer}>
              <input
                type="text"
                className={styles.addressInput}
                placeholder="Property Address"
                value={propertyAddress}
                onChange={(e) => setPropertyAddress(e.target.value)}
              />
              <div className={styles.inputIconContainer}>
                <LocationIcon className={styles.inputIcon} />
              </div>
            </div>

            <div className={styles.twoInputsRow}>
              <div className={styles.inputContainer}>
                <input
                  type="text"
                  className={styles.addressInput}
                  placeholder="Apt/Suite"
                  value={aptOrSuite}
                  onChange={(e) => setAptOrSuite(e.target.value)}
                />
              </div>
              <div className={styles.inputContainer}>
                <input
                  type="text"
                  className={styles.addressInput}
                  placeholder="City"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                />
              </div>
            </div>

            <div className={styles.twoInputsRow}>
              <div className={styles.inputContainer}>
                <input
                  type="text"
                  className={styles.addressInput}
                  placeholder="State"
                  value={stateName}
                  onChange={(e) => setStateName(e.target.value)}
                />
              </div>
              <div className={styles.inputContainer}>
                <input
                  type="text"
                  className={styles.addressInput}
                  placeholder="Zip code"
                  value={zipCode}
                  onChange={(e) => setZipCode(e.target.value)}
                />
              </div>
            </div>
          </div>

          <div className={styles.propertyInfoSection}>
            <span className={styles.propertyText}>Property</span>

            {/* PLACE card => opens place popup on click */}
            <div
              className={`${styles.propertyItem} ${styles.propertyItemPlace}`}
              onClick={() => setIsPlacePopupOpen(true)}
            >
              <div className={styles.propertyItemLeft}>
                <PlaceIcon className={styles.propertyItemIcon} />
                <span className={styles.propertyItemText}>PLACE</span>
              </div>
              <button
                className={`${styles.propertyItemPlusButton} ${styles.propertyItemPlaceButton}`}
                onClick={(e) => e.stopPropagation()}
              >
                +
              </button>
            </div>

            {/* ACCESS card */}
            <div className={`${styles.propertyItem} ${styles.propertyItemAccess}`}>
              <div className={styles.propertyItemLeft}>
                <AccessIcon className={styles.propertyItemIcon} />
                <span className={styles.propertyItemText}>ACCESS</span>
              </div>
              <button
                className={`${styles.propertyItemPlusButton} ${styles.propertyItemAccessButton}`}
              >
                +
              </button>
            </div>

            {/* SERVICES card */}
            <div className={`${styles.propertyItem} ${styles.propertyItemServices}`}>
              <div className={styles.propertyItemLeft}>
                <ServicesIcon className={styles.propertyItemIcon} />
                <span className={styles.propertyItemText}>SERVICES</span>
              </div>
              <button
                className={`${styles.propertyItemPlusButton} ${styles.propertyItemServicesButton}`}
              >
                +
              </button>
            </div>
          </div>

          {/* Time Restrictions */}
          <div className={styles.timeRestrictionsContainer}>
            <div className={styles.timeRestrictionsRow}>
              <span className={styles.timeRestrictionsText}>Time restrictions</span>
              <div className={styles.timeRestrictionsToggle}>
                <SimpleToggle
                  isToggled={timeRestrictionsToggled}
                  onToggle={setTimeRestrictionsToggled}
                />
              </div>
            </div>

            {timeRestrictionsToggled && (
              <div className={styles.timeRestrictionsContent}>
                <div className={styles.timeRestrictionsInputsColumn}>
                  <div className={styles.inputContainer}>
                    <span className={styles.inputLabel}>
                      Option: <span className={styles.inputValueText}>Not allowed</span>
                    </span>
                    <UnfoldMoreIcon className={styles.moreIcon} />
                  </div>
                  <div className={styles.inputContainer}>
                    <span className={styles.inputLabel}>
                      Type: <span className={styles.inputValueText}>Elevator</span>
                    </span>
                    <UnfoldMoreIcon className={styles.moreIcon} />
                  </div>
                  <div className={styles.inputContainer}>
                    <span className={styles.inputLabel}>
                      Start time: <span className={styles.inputValueText}>10:00pm</span>
                    </span>
                    <UnfoldMoreIcon className={styles.moreIcon} />
                  </div>
                  <div className={styles.inputContainer}>
                    <span className={styles.inputLabel}>
                      End time: <span className={styles.inputValueText}>10:00am</span>
                    </span>
                    <UnfoldMoreIcon className={styles.moreIcon} />
                  </div>
                </div>

                <div className={styles.addButtonWrapper}>
                  <span className={styles.addButtonText}>Add</span>
                  <div className={styles.addButtonIconContainer}>+</div>
                </div>
              </div>
            )}
          </div>

          {/* Inventory Section */}
          <div className={styles.inventorySection}>
            <span className={styles.inventoryTitle}>Inventory</span>

            <div className={styles.inventoryButtons}>
              <button
                className={styles.inventoryButtonPrimary}
                onClick={onShowInventory}
              >
                <span className={styles.inventoryButtonText}>Inventory</span>
                <MyInventoryIcon className={styles.myInventoryIcon} />
              </button>

              <button className={styles.inventoryButtonSecondary}>
                <span className={styles.inventoryButtonTextSecondary}>
                  Special Handling
                </span>
              </button>
            </div>
          </div>
        </>
      )}

      {/* PlacePopup if open */}
      {isPlacePopupOpen && (
        <PlacePopup
          setIsPlacePopupVisible={setIsPlacePopupOpen}
          stopOffs={stopOffs}
          onAddStopOff={handleAddStopOff}
          selectedStop={selectedStop}
          setSelectedStop={setSelectedStop}
        />
      )}
    </div>
  );
}

export default OriginDetails;
