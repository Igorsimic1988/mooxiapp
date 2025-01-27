// src/components/Leads/LeadManagementPanel/MoveDetailsPanel/OriginDetails/OriginDetails.js

import React, { useEffect, useState } from 'react';
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
// Reusable row of stops
import MainAndStopOffs from './MainAndStopOffs/MainAndStopOffs';

function OriginDetails({ lead, onLeadUpdated, onShowInventory }) {
  // Which origin stop is selected in the main UI?
  const [selectedStopIndex, setSelectedStopIndex] = useState(0);

  // Collapsible
  const [isCollapsed, setIsCollapsed] = useState(false);
  const toggleCollapse = () => setIsCollapsed((prev) => !prev);

  // Time restrictions
  const [timeRestrictionsToggled, setTimeRestrictionsToggled] = useState(false);

  // Place popup
  const [isPlacePopupOpen, setIsPlacePopupOpen] = useState(false);

  // Ensure there's at least 1 origin stop
  useEffect(() => {
    if (!Array.isArray(lead.originStops) || lead.originStops.length === 0) {
      const defaultStops = [
        {
          label: 'Main Address',
          address: '',
          apt: '',
          city: '',
          state: '',
          zip: '',
        },
      ];
      onLeadUpdated({ ...lead, originStops: defaultStops });
    }

    // Also ensure we have destinationStops (if needed)
    if (!Array.isArray(lead.destinationStops)) {
      onLeadUpdated({
        ...lead,
        destinationStops: [
          {
            label: 'Main Address',
            address: '',
            apt: '',
            city: '',
            state: '',
            zip: '',
          },
        ],
      });
    }
  }, [lead, onLeadUpdated]);

  // Safely get the "current" origin stop
  const originStops = lead.originStops || [];
  const currentStop =
    originStops[selectedStopIndex] || {
      label: '',
      address: '',
      apt: '',
      city: '',
      state: '',
      zip: '',
    };

  // If user types in an address field => update just that origin stop
  const handleStopFieldChange = (fieldName, newValue) => {
    const updatedStops = [...originStops];
    const updatedStop = { ...updatedStops[selectedStopIndex] };
    updatedStop[fieldName] = newValue;
    updatedStops[selectedStopIndex] = updatedStop;
    onLeadUpdated({ ...lead, originStops: updatedStops });
  };

  return (
    <div className={styles.originContainer}>
      <div className={styles.originHeader}>
        <span className={styles.originTitle}>Origin</span>
        <button className={styles.minusButton} onClick={toggleCollapse}>
          {isCollapsed ? '+' : '-'}
        </button>
      </div>

      {!isCollapsed && (
        <>
          {/* Row of origin stops + plus button */}
          <MainAndStopOffs
            stops={originStops}
            onStopsUpdated={(newStops) => {
              onLeadUpdated({ ...lead, originStops: newStops });
            }}
            selectedStopIndex={selectedStopIndex}
            setSelectedStopIndex={setSelectedStopIndex}
          />

          {/* Address Inputs */}
          <div className={styles.propertySection}>
            <span className={styles.propertyAddressText}>Property Address</span>

            <div className={styles.inputContainer}>
              <input
                type="text"
                className={styles.addressInput}
                placeholder="Property Address"
                value={currentStop.address}
                onChange={(e) => handleStopFieldChange('address', e.target.value)}
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
                  value={currentStop.apt}
                  onChange={(e) => handleStopFieldChange('apt', e.target.value)}
                />
              </div>
              <div className={styles.inputContainer}>
                <input
                  type="text"
                  className={styles.addressInput}
                  placeholder="City"
                  value={currentStop.city}
                  onChange={(e) => handleStopFieldChange('city', e.target.value)}
                />
              </div>
            </div>

            <div className={styles.twoInputsRow}>
              <div className={styles.inputContainer}>
                <input
                  type="text"
                  className={styles.addressInput}
                  placeholder="State"
                  value={currentStop.state}
                  onChange={(e) => handleStopFieldChange('state', e.target.value)}
                />
              </div>
              <div className={styles.inputContainer}>
                <input
                  type="text"
                  className={styles.addressInput}
                  placeholder="Zip code"
                  value={currentStop.zip}
                  onChange={(e) => handleStopFieldChange('zip', e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Property Info Section */}
          <div className={styles.propertyInfoSection}>
            <span className={styles.propertyText}>Property</span>

            {/* PLACE card => entire area clickable */}
            <div
              className={`${styles.propertyItem} ${styles.propertyItemPlace}`}
              onClick={() => setIsPlacePopupOpen(true)}
            >
              <div className={styles.propertyItemLeft}>
                <PlaceIcon className={styles.propertyItemIcon} />
                <span className={styles.propertyItemText}>PLACE</span>
              </div>
              {/* The plus button now does NOT stop propagation */}
              <button
                className={`${styles.propertyItemPlusButton} ${styles.propertyItemPlaceButton}`}
              >
                +
              </button>
            </div>

            {/* ACCESS => same approach if you want the entire thing clickable */}
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

            {/* SERVICES */}
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

      {/* The popup for "Place" */}
      {isPlacePopupOpen && (
        <PlacePopup
          lead={lead}
          onLeadUpdated={onLeadUpdated}
          setIsPlacePopupVisible={setIsPlacePopupOpen}
        />
      )}
    </div>
  );
}

export default OriginDetails;
