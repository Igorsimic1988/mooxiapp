import React, { useRef, useEffect } from 'react';
import styles from './RoomList.module.css';
import { ReactComponent as More } from '../../../../../../../assets/icons/more.svg';

function RoomList({ onRoomSelect, roomItemSelections, displayedRooms, selectedRoom }) {
  const isDragging = useRef(false);
  const startY = useRef(0);
  const scrollTop = useRef(0);
  const scrollContainerRef = useRef(null);
  const hasMoved = useRef(false);

  const otherRooms = displayedRooms.filter((room) => room.id !== 13);
  const boxesRoom = displayedRooms.find((room) => room.id === 13);

  const handleMouseDown = (e) => {
    isDragging.current = true;
    startY.current = e.clientY;
    scrollTop.current = scrollContainerRef.current.scrollTop;
    hasMoved.current = false;

    // Add event listeners
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  const handleMouseMove = (e) => {
    if (!isDragging.current) return;
    const y = e.clientY;
    const dy = y - startY.current;

    if (Math.abs(dy) > 5) {
      hasMoved.current = true;
    }

    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTop = scrollTop.current - dy;
    }
  };

  const handleMouseUp = () => {
    isDragging.current = false;
    // Remove event listeners
    document.removeEventListener('mousemove', handleMouseMove);
    document.removeEventListener('mouseup', handleMouseUp);
  };

  useEffect(() => {
    // Cleanup on unmount
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div
      className={styles.roomListContainer}
      ref={scrollContainerRef}
      onMouseDown={handleMouseDown}
      style={{ cursor: isDragging.current ? 'grabbing' : 'grab' }}
    >
      {otherRooms.map((room) => {
        const itemInstances = roomItemSelections?.[room.id] || [];
        const selectedItemCount = itemInstances.length;

        return (
          <button
            key={room.id}
            onClick={(e) => {
              if (hasMoved.current) {
                e.preventDefault();
                e.stopPropagation();
                return;
              }
              onRoomSelect(room);
            }}
            className={`${styles.roomButton} ${
              selectedRoom && selectedRoom.id === room.id ? styles.active : ''
            }`}
            aria-pressed={selectedRoom && selectedRoom.id === room.id}
            aria-label={`Select ${room.name}`}
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

      {boxesRoom && (
        <button
          key={boxesRoom.id}
          onClick={(e) => {
            if (hasMoved.current) {
              e.preventDefault();
              e.stopPropagation();
              return;
            }
            onRoomSelect(boxesRoom);
          }}
          className={`${styles.roomButton} ${styles.fixedRoom} ${
            selectedRoom && selectedRoom.id === boxesRoom.id ? styles.active : ''
          }`}
          aria-pressed={selectedRoom && selectedRoom.id === boxesRoom.id}
          aria-label={`Select ${boxesRoom.name}`}
        >
          <p className={styles.roomName}>{boxesRoom.name}</p>
          <div className={styles.rightSection}>
            {roomItemSelections?.[boxesRoom.id]?.length > 0 && (
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
