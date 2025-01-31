// src/components/Leads/LeadManagementPanel/MoveDetailsPanel/OriginDetails/Inventory/RoomList/RoomList.js

import React, { useRef, useEffect, useCallback } from 'react';
import styles from './RoomList.module.css';
import { ReactComponent as More } from '../../../../../../../assets/icons/more.svg';

/**
 * RoomList
 *
 * Props:
 *  - onRoomSelect(room): function to select a room object
 *  - roomItemSelections: { [roomId]: arrayOfItems }
 *  - displayedRooms: array of room objects (e.g. [{ id, name }, ...])
 *  - selectedRoom: the currently selected room object
 */
function RoomList({
  onRoomSelect,
  roomItemSelections = {},
  displayedRooms = [],
  selectedRoom
}) {
  const isDragging = useRef(false);
  const startY = useRef(0);
  const scrollTop = useRef(0);
  const scrollContainerRef = useRef(null);
  const hasMoved = useRef(false);

  // Separate out the "boxes room" if present (id=13)
  const otherRooms = displayedRooms.filter((room) => room.id !== 13);
  const boxesRoom = displayedRooms.find((room) => room.id === 13);

  // ----- Mouse event handlers -----
  const handleMouseMove = useCallback((e) => {
    if (!isDragging.current) return;
    const y = e.clientY;
    const dy = y - startY.current;

    if (Math.abs(dy) > 5) {
      hasMoved.current = true;
    }
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTop = scrollTop.current - dy;
    }
  }, []);

  const handleMouseUp = useCallback(() => {
    isDragging.current = false;
    document.removeEventListener('mousemove', handleMouseMove);
    document.removeEventListener('mouseup', handleMouseUp);
  }, [handleMouseMove]);

  const handleMouseDown = (e) => {
    isDragging.current = true;
    startY.current = e.clientY;
    scrollTop.current = scrollContainerRef.current?.scrollTop || 0;
    hasMoved.current = false;

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  useEffect(() => {
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [handleMouseMove, handleMouseUp]);

  // ----- Render -----
  return (
    <div
      className={styles.roomListContainer}
      ref={scrollContainerRef}
      onMouseDown={handleMouseDown}
      style={{ cursor: isDragging.current ? 'grabbing' : 'grab' }}
    >
      {/* Render all rooms except the "Boxes" room (id=13) */}
      {otherRooms.map((room) => {
        const itemInstances = roomItemSelections[room.id] || [];
        const selectedItemCount = itemInstances.length;
        const isActive = selectedRoom && selectedRoom.id === room.id;
        const roomName = room.name || `Room #${room.id}`;

        return (
          <button
            key={`room-${room.id}`} // ensure a unique key
            onClick={(e) => {
              if (hasMoved.current) {
                e.preventDefault();
                e.stopPropagation();
                return;
              }
              onRoomSelect(room);
            }}
            className={`${styles.roomButton} ${isActive ? styles.active : ''}`}
            aria-pressed={isActive}
            aria-label={`Select ${roomName}`}
          >
            <p className={styles.roomName}>{roomName}</p>
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

      {/* Render boxes room (id=13) last, if it exists */}
      {boxesRoom && (
        <button
          key={`room-${boxesRoom.id}`}
          onClick={(e) => {
            if (hasMoved.current) {
              e.preventDefault();
              e.stopPropagation();
              return;
            }
            onRoomSelect(boxesRoom);
          }}
          className={`
            ${styles.roomButton}
            ${styles.fixedRoom}
            ${
              selectedRoom && selectedRoom.id === boxesRoom.id
                ? styles.active
                : ''
            }
          `}
          aria-pressed={selectedRoom && selectedRoom.id === boxesRoom.id}
          aria-label={`Select ${boxesRoom.name || 'Boxes'}`}
        >
          <p className={styles.roomName}>
            {boxesRoom.name || 'Boxes'}
          </p>
          <div className={styles.rightSection}>
            {roomItemSelections[boxesRoom.id]?.length > 0 && (
              <div className={styles.itemCount}>
                <p>{roomItemSelections[boxesRoom.id].length}</p>
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

export default React.memo(RoomList);
