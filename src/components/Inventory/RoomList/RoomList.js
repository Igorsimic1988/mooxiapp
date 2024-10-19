import React from 'react';
import styles from './RoomList.module.css';
import { ReactComponent as More } from '../../../assets/icons/more.svg';

function RoomList({ onRoomSelect, roomItemSelections, displayedRooms }) {
  return (
    <div className={styles.roomListContainer}>
      {displayedRooms.map((room) => {
        const selectedItems = roomItemSelections?.[room.name] || {};
        const selectedItemCount = Object.values(selectedItems).reduce((acc, count) => acc + count, 0);

        return (
          <button
            key={room.id}
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
