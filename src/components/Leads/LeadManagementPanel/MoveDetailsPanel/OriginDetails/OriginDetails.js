import React, { useState } from 'react';
import { ReactComponent as LocationIcon } from '../../../../../assets/icons/location.svg';
import { ReactComponent as PlaceIcon } from '../../../../../assets/icons/place1.svg';
import { ReactComponent as AccessIcon } from '../../../../../assets/icons/access1.svg';
import { ReactComponent as ServicesIcon } from '../../../../../assets/icons/services1.svg';
import { ReactComponent as UnfoldMoreIcon } from '../../../../../assets/icons/unfoldmore.svg';
import { ReactComponent as MyInventoryIcon } from '../../../../../assets/icons/myinventory.svg';
import SimpleToggle from '../../../SimpleToggle/SimpleToggle';
import styles from './OriginDetails.module.css';

function OriginDetails({ onShowInventory }) {
  const [timeRestrictionsToggled, setTimeRestrictionsToggled] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);

  // This array will hold the "Stop off 1", "Stop off 2", etc. labels
  const [stopOffs, setStopOffs] = useState([]);

  // Each time user clicks '+', we add a new "Stop off X"
  const handleAddStopOff = () => {
    const newStopNum = stopOffs.length + 1;
    setStopOffs((prev) => [...prev, `Stop off ${newStopNum}`]);
  };

  const handleToggleCollapse = () => {
    setIsCollapsed((prev) => !prev);
  };

  // We'll store user-entered address info in local state (optional).
  // If you need to pass these values to the parent, you can do so via callbacks.
  const [propertyAddress, setPropertyAddress] = useState('');
  const [aptOrSuite, setAptOrSuite] = useState('');
  const [city, setCity] = useState('');
  const [stateName, setStateName] = useState('');
  const [zipCode, setZipCode] = useState('');

  return (
    <div className={styles.originContainer}>
      <div className={styles.originHeader}>
        <span className={styles.originTitle}>Origin</span>
        <button className={styles.minusButton} onClick={handleToggleCollapse}>
          {isCollapsed ? '+' : '-'}
        </button>
      </div>

      {/* Only render content if not collapsed */}
      {!isCollapsed && (
        <>
          <div className={styles.addressRow}>
            <div className={styles.addressContainer}>
              {/* Left side: Main Address + any stop-offs */}
              <div className={styles.addressButtonsWrapper}>
                <button className={styles.mainAddressButton}>Main Address</button>
                {stopOffs.map((stopLabel, idx) => (
                  <button key={idx} className={styles.mainAddressButton}>
                    {stopLabel}
                  </button>
                ))}
              </div>

              {/* Right side: plus button */}
              <button className={styles.plusButton} onClick={handleAddStopOff}>
                +
              </button>
            </div>
          </div>

          <div className={styles.propertySection}>
            <span className={styles.propertyAddressText}>Property Address</span>

            {/* PROPERTY ADDRESS (with icon on the right) */}
            <div className={styles.inputContainer}>
              <input
                type="text"
                className={styles.addressInput} /* new input style */
                placeholder="Property Address"
                value={propertyAddress}
                onChange={(e) => setPropertyAddress(e.target.value)}
              />
              <div className={styles.inputIconContainer}>
                <LocationIcon className={styles.inputIcon} />
              </div>
            </div>

            <div className={styles.twoInputsRow}>
              {/* APT/SUITE */}
              <div className={styles.inputContainer}>
                <input
                  type="text"
                  className={styles.addressInput}
                  placeholder="Apt/Suite"
                  value={aptOrSuite}
                  onChange={(e) => setAptOrSuite(e.target.value)}
                />
              </div>
              {/* CITY */}
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
              {/* STATE */}
              <div className={styles.inputContainer}>
                <input
                  type="text"
                  className={styles.addressInput}
                  placeholder="State"
                  value={stateName}
                  onChange={(e) => setStateName(e.target.value)}
                />
              </div>
              {/* ZIP */}
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

            <div className={`${styles.propertyItem} ${styles.propertyItemPlace}`}>
              <div className={styles.propertyItemLeft}>
                <PlaceIcon className={styles.propertyItemIcon} />
                <span className={styles.propertyItemText}>PLACE</span>
              </div>
              <button
                className={`${styles.propertyItemPlusButton} ${styles.propertyItemPlaceButton}`}
              >
                +
              </button>
            </div>

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

          {/* Time Restrictions Section */}
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
                      Option:{' '}
                      <span className={styles.inputValueText}>Not allowed</span>
                    </span>
                    <UnfoldMoreIcon className={styles.moreIcon} />
                  </div>
                  <div className={styles.inputContainer}>
                    <span className={styles.inputLabel}>
                      Type:{' '}
                      <span className={styles.inputValueText}>Elevator</span>
                    </span>
                    <UnfoldMoreIcon className={styles.moreIcon} />
                  </div>
                  <div className={styles.inputContainer}>
                    <span className={styles.inputLabel}>
                      Start time:{' '}
                      <span className={styles.inputValueText}>10:00pm</span>
                    </span>
                    <UnfoldMoreIcon className={styles.moreIcon} />
                  </div>
                  <div className={styles.inputContainer}>
                    <span className={styles.inputLabel}>
                      End time:{' '}
                      <span className={styles.inputValueText}>10:00am</span>
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
    </div>
  );
}

export default OriginDetails;
