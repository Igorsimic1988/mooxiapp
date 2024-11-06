// src/components/Inventory/RoomList/RoomList.js

import React from 'react';
import styles from './RoomList.module.css';
import { ReactComponent as More } from '../../../assets/icons/more.svg';

function RoomList({ onRoomSelect, roomItemSelections, displayedRooms }) {
  // Separate "Boxes" room
  const otherRooms = displayedRooms.filter((room) => room.id !== 13);
  const boxesRoom = displayedRooms.find((room) => room.id === 13);

  return (
    <div className={styles.roomListContainer}>
      {/* Render all rooms except "Boxes" first */}
      {otherRooms.map((room) => {
        const itemInstances = roomItemSelections?.[room.name] || [];
        const selectedItemCount = itemInstances.length;

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

      {/* Render "Boxes" room last if it exists */}
      {boxesRoom && (
        <button
          key={boxesRoom.id}
          onClick={() => onRoomSelect(boxesRoom)}
          className={styles.roomButton}
        >
          <p className={styles.roomName}>{boxesRoom.name}</p>
          <div className={styles.rightSection}>
            {roomItemSelections?.[boxesRoom.name]?.length > 0 && (
              <div className={styles.itemCount}>
                <p>{roomItemSelections[boxesRoom.name].length}</p>
              </div>
            )}
            <div className={styles.moreIcon}>
              <More />
            </div>
          </div>
        </button>
      )}
    </div>
  );
}

export default RoomList;
