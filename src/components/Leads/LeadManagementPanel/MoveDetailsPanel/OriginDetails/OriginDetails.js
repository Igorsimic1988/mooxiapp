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

  const handleToggleCollapse = () => {
    setIsCollapsed(prev => !prev);
  };

  return (
    <div className={styles.originContainer}>
      <div className={styles.originHeader}>
        <span className={styles.originTitle}>Origin</span>
        <button 
          className={styles.minusButton} 
          onClick={handleToggleCollapse}
        >
          {isCollapsed ? '+' : '-'}
        </button>
      </div>

      {/* Only render the rest of the content if not collapsed */}
      {!isCollapsed && (
        <>
          <div className={styles.addressRow}>
            <div className={styles.addressContainer}>
              <button className={styles.mainAddressButton}>Main Address</button>
              <button className={styles.plusButton}>+</button>
            </div>
          </div>

          <div className={styles.propertySection}>
            <span className={styles.propertyAddressText}>Property Address</span>

            <div className={styles.inputContainer}>
              <span className={styles.inputLabel}>Property Address</span>
              <div className={styles.inputIconContainer}>
                <LocationIcon className={styles.inputIcon} />
              </div>
            </div>

            <div className={styles.twoInputsRow}>
              <div className={styles.inputContainer}>
                <span className={styles.inputLabel}>Apt/Suite</span>
              </div>
              <div className={styles.inputContainer}>
                <span className={styles.inputLabel}>City</span>
              </div>
            </div>

            <div className={styles.twoInputsRow}>
              <div className={styles.inputContainer}>
                <span className={styles.inputLabel}>State</span>
              </div>
              <div className={styles.inputContainer}>
                <span className={styles.inputLabel}>Zip code</span>
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
              <button className={`${styles.propertyItemPlusButton} ${styles.propertyItemPlaceButton}`}>+</button>
            </div>

            <div className={`${styles.propertyItem} ${styles.propertyItemAccess}`}>
              <div className={styles.propertyItemLeft}>
                <AccessIcon className={styles.propertyItemIcon} />
                <span className={styles.propertyItemText}>ACCESS</span>
              </div>
              <button className={`${styles.propertyItemPlusButton} ${styles.propertyItemAccessButton}`}>+</button>
            </div>

            <div className={`${styles.propertyItem} ${styles.propertyItemServices}`}>
              <div className={styles.propertyItemLeft}>
                <ServicesIcon className={styles.propertyItemIcon} />
                <span className={styles.propertyItemText}>SERVICES</span>
              </div>
              <button className={`${styles.propertyItemPlusButton} ${styles.propertyItemServicesButton}`}>+</button>
            </div>
          </div>

          {/* Time Restrictions Section */}
          <div className={styles.timeRestrictionsContainer}>
            <div className={styles.timeRestrictionsRow}>
              <span className={styles.timeRestrictionsText}>Time restrictions</span>
              <div className={styles.timeRestrictionsToggle}>
                <SimpleToggle isToggled={timeRestrictionsToggled} onToggle={setTimeRestrictionsToggled} />
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
              <button className={styles.inventoryButtonPrimary} onClick={onShowInventory}>
                <span className={styles.inventoryButtonText}>Inventory</span>
                <MyInventoryIcon className={styles.myInventoryIcon} />
              </button>

              <button className={styles.inventoryButtonSecondary}>
                <span className={styles.inventoryButtonTextSecondary}>Special Handling</span>
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default OriginDetails;
