// src/components/Leads/LeadManagementPanel/MoveDetailsPanel/OriginDetails/Inventory/RoomList/RoomList.js

import React, { useRef, useEffect, useCallback } from 'react';
import styles from './RoomList.module.css';
import More from '../../../../../../../assets/icons/more.svg';
import Image from 'next/image';
import Icon from 'src/app/components/Icon';
/**
 * RoomList
 *
 * Props:
 *  - onRoomSelect(room): function to select a room object
 *  - roomItemSelections: { [roomId]: arrayOfItemInstances }
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

  // Filter out any falsy or malformed room entries
  const validRooms = displayedRooms.filter((r) => r && typeof r === 'object');

  // Separate out the "boxes" room if present (id=13)
  const otherRooms = validRooms.filter((room) => room.id !== 13);
  const boxesRoom = validRooms.find((room) => room.id === 13);

  // Mouse move while dragging
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

  // Mouse up => stop dragging
  const handleMouseUp = useCallback(() => {
    isDragging.current = false;
    document.removeEventListener('mousemove', handleMouseMove);
    document.removeEventListener('mouseup', handleMouseUp);
  }, [handleMouseMove]);

  // Mouse down => start dragging
  const handleMouseDown = (e) => {
    isDragging.current = true;
    startY.current = e.clientY;
    scrollTop.current = scrollContainerRef.current?.scrollTop || 0;
    hasMoved.current = false;

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [handleMouseMove, handleMouseUp]);

  return (
    <div
      className={styles.roomListContainer}
      ref={scrollContainerRef}
      onMouseDown={handleMouseDown}
      style={{ cursor: isDragging.current ? 'grabbing' : 'grab' }}
    >
      {/* Rooms except the 'Boxes' room */}
      {otherRooms.map((room, index) => {
        const roomId = room.id ?? `fallback-${index}`;
        const itemInstances = roomItemSelections[roomId] || [];
        const isActive = selectedRoom && selectedRoom.id === room.id;
        const selectedItemCount = itemInstances.length;

        const roomName = room.name || `Room #${roomId}`;

        return (
          <button
            key={`room-${roomId}`}
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
                <Icon name="More" />
              </div>
            </div>
          </button>
        );
      })}

      {/* Boxes room last, if it exists */}
      {boxesRoom && (
        <button
          key={`room-${boxesRoom.id ?? 'boxes'}`}
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
          <p className={styles.roomName}>{boxesRoom.name || 'Boxes'}</p>
          <div className={styles.rightSection}>
            {roomItemSelections[boxesRoom.id]?.length > 0 && (
              <div className={styles.itemCount}>
                <p>{roomItemSelections[boxesRoom.id].length}</p>
              </div>
            )}
            <div className={styles.moreIcon}>
            <Icon name="More" />
            </div>
          </div>
        </button>
      )}
    </div>
  );
}

export default React.memo(RoomList);
