// src/components/Inventory/HouseHeader/AddRoomPopup/AddRoomPopup.js

import React, { useRef, useEffect } from 'react';
import styles from './AddRoomPopup.module.css';
import { ReactComponent as CloseIcon } from '../../../../../../../assets/icons/Close.svg';
import { ReactComponent as AddRoomIcon } from '../../../../../../../assets/icons/addroomreservation.svg';

function AddRoomPopup({ rooms, displayedRooms, onClose, onToggleRoom }) {
  const popupContentRef = useRef(null);

  // Close the popup when clicking outside the popup content
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (popupContentRef.current && !popupContentRef.current.contains(event.target)) {
        onClose();
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [onClose]);

  // Filter out room id=13 ("Boxes")
  const toggleableRooms = rooms.filter((room) => room.id !== 13);

  return (
    <div className={styles.popup}>
      <div className={styles.popupContent} ref={popupContentRef}>
        {/* Header */}
        <div className={styles.header}>
          <div className={styles.title}>
            <AddRoomIcon className={styles.icon} />
            <p>Select Rooms to Display</p>
          </div>
          <div className={styles.closeButton}>
            <button onClick={onClose} aria-label="Close">
              <CloseIcon className={styles.closeIcon} />
            </button>
          </div>
        </div>

        {/* Body: Room Selection Buttons */}
        <div className={styles.body}>
          <div className={styles.roomListContainer}>
            {toggleableRooms.map((room) => {
              const isSelected = displayedRooms.some((r) => r.id === room.id);
              return (
                <button
                  key={room.id}
                  className={`${styles.roomButton} ${isSelected ? styles.selected : ''}`}
                  onClick={() => onToggleRoom(room.id)}
                  aria-pressed={isSelected}
                >
                  <span className={styles.roomName}>{room.name}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

export default AddRoomPopup;
