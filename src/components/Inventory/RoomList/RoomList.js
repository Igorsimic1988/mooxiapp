import React from 'react';
import styles from './RoomList.module.css';
import { ReactComponent as More } from '../../../assets/icons/more.svg';

function RoomList({ onRoomSelect, roomItemSelections }) {
  const rooms = [
    { name: 'Living Room', itemCount: 23 },
    { name: 'Family Room', itemCount: 0 },
    { name: 'Kitchen', itemCount: 10 },
    { name: 'Master Bedroom', itemCount: 10 },
    { name: 'Bedroom 1', itemCount: 10 },
    { name: 'Bedroom 2', itemCount: 10 },
    { name: 'Bedroom 3', itemCount: 10 },
    { name: 'Garage', itemCount: 10 },
    { name: 'Laundry Room', itemCount: 10 },
    { name: 'Home Office', itemCount: 10 },
    { name: 'Yard/Patio', itemCount: 10 },
    { name: 'Basement', itemCount: 10 },
    { name: 'Attic', itemCount: 10 },
    { name: 'Storage', itemCount: 10 },
  ];

  return (
    <div className={styles.roomListContainer}>
      {rooms.map((room, index) => {
        const selectedItems = roomItemSelections?.[room.name] || {};
        const selectedItemCount = Object.values(selectedItems).reduce((sum, count) => sum + count, 0); // Updated: calculate total count of clicks for all items

        return (
          <button
            key={index}
            onClick={() => onRoomSelect(room)}
            className={styles.roomButton}
          >
            <p className={styles.roomName}>{room.name}</p>
            <div className={styles.rightSection}>
              {selectedItemCount > 0 && (
                <div className={styles.itemCount}>
                  <p>{selectedItemCount}</p>
                </div>
              )}
              <div className={styles.moreIcon}>
                <More />
              </div>
            </div>
          </button>
        );
      })}
    </div>
  );
}

export default RoomList;
