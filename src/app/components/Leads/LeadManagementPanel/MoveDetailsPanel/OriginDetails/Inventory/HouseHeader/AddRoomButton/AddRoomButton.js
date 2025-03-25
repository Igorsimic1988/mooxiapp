"use client";

import React, { useState } from 'react';
import styles from './AddRoomButton.module.css';
import AddRoomPopup from '../AddRoomPopup/AddRoomPopup';
import Icon from 'src/app/components/Icon';

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
        <Icon name="AddRoom" width={24} height={24} color={'#90A4B7'} className={styles.addRoomIcon} />
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
