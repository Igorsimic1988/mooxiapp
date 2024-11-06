// src/components/Inventory/HouseHeader/HouseHeader.js

import React, { useState } from 'react';
import styles from './HouseHeader.module.css';
import { ReactComponent as AddRoomIcon } from '../../../assets/icons/addroom.svg';
import { ReactComponent as HouseIcon } from '../../../assets/icons/house.svg';
import AddRoomPopup from './AddRoomPopup/AddRoomPopup';

function HouseHeader({ rooms, displayedRooms, onToggleRoom }) {
  const [isAddRoomPopupVisible, setIsAddRoomPopupVisible] = useState(false);

  const handleAddRoom = () => {
    setIsAddRoomPopupVisible(true);
  };

  const handleClosePopup = () => {
    setIsAddRoomPopupVisible(false);
  };

  return (
    <header className={styles.houseHeader}>
      <div className={styles.houseInfoContainer}>
        <div className={styles.iconWrapper}>
          <HouseIcon className={styles.houseIcon} aria-hidden="true" />
        </div>
        <div className={styles.houseInfo}>
          <h1 className={styles.houseTitle}>House</h1>
          <p className={styles.houseDescription}>
            <span className={styles.houseBedrooms}>4 bedroom</span>,{' '}
            <span className={styles.houseStories}>two story</span>
          </p>
        </div>
      </div>
      <button
        className={styles.addRoomButton}
        onClick={handleAddRoom}
        aria-label="Add Room"
      >
        <span className={styles.addRoomText}>Add Room</span>
        <AddRoomIcon className={styles.addRoomIcon} aria-hidden="true" />
      </button>

      {/* Render the AddRoomPopup when visible */}
      {isAddRoomPopupVisible && (
        <AddRoomPopup
          rooms={rooms}
          displayedRooms={displayedRooms}
          onClose={handleClosePopup}
          onToggleRoom={onToggleRoom} // Pass the correct onToggleRoom
        />
      )}
    </header>
  );
}

export default HouseHeader;
