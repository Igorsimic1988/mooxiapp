// src/components/Inventory/HouseHeader/AddRoomButton/AddRoomButton.js

import React, { useState } from 'react';
import styles from './AddRoomButton.module.css';
import AddRoomIcon from '../../../../../../../../assets/icons/addroom.svg';
import AddRoomPopup from '../AddRoomPopup/AddRoomPopup';
import Image from 'next/image';

function AddRoomButton({ rooms, displayedRooms, onToggleRoom }) {
  const [isAddRoomPopupVisible, setIsAddRoomPopupVisible] = useState(false);

  const handleAddRoom = () => {
    setIsAddRoomPopupVisible(true);
  };

  const handleClosePopup = () => {
    setIsAddRoomPopupVisible(false);
  };

  return (
    <>
      <button
        className={styles.addRoomButton}
        onClick={handleAddRoom}
        aria-label="Add Room"
      >
        <span className={styles.addRoomText}>Add Room</span>
        <Image src = {AddRoomIcon} alt = 'addRoomIcon' className={styles.addRoomIcon} aria-hidden="true"/>
      </button>

      {/* Render the AddRoomPopup when visible */}
      {isAddRoomPopupVisible && (
        <AddRoomPopup
          rooms={rooms}
          displayedRooms={displayedRooms}
          onClose={handleClosePopup}
          onToggleRoom={onToggleRoom}
        />
      )}
    </>
  );
}

export default AddRoomButton;
