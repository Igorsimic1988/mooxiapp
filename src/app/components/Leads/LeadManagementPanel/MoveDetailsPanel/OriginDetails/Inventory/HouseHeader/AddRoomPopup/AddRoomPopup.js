// src/components/Inventory/HouseHeader/AddRoomPopup/AddRoomPopup.js

import React, { useRef, useEffect } from 'react';
import styles from './AddRoomPopup.module.css';
import Icon from 'src/app/components/Icon';

/**
 * AddRoomPopup
 *
 * Props:
 *  - rooms: array of all possible room objects (with `.id` and `.name`)
 *  - displayedRooms: array of numeric room IDs currently displayed
 *  - onClose: function to close the popup
 *  - onToggleRoom: function(roomId) => toggles that room
 */
function AddRoomPopup({
  rooms = [],              // Default to empty array
  displayedRooms = [],     // Default to empty array of IDs
  onClose,
  onToggleRoom
}) {
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

  // Filter out room id=13 ("Boxes"), if you want to keep it always
  const toggleableRooms = rooms.filter((room) => room.id !== 13);

  return (
    <div className={styles.popup}>
      <div className={styles.popupContent} ref={popupContentRef}>
        {/* Header */}
        <div className={styles.header}>
          <div className={styles.title}>
            <Icon name="AddRoom" className={styles.icon} />
            <p>Select Rooms to Display</p>
          </div>
          <div className={styles.closeButton}>
            <button onClick={onClose} aria-label="Close">
              <Icon name="Close" className={styles.closeIcon} />
            </button>
          </div>
        </div>

        {/* Body: Room Selection Buttons */}
        <div className={styles.body}>
          <div className={styles.roomListContainer}>
            {toggleableRooms.map((room) => {
              // If displayedRooms is an array of numeric IDs:
              const isSelected = displayedRooms.includes(room.id);

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
