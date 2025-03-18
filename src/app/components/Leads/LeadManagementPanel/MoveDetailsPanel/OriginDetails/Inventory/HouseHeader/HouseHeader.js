// src/components/Inventory/HouseHeader/HouseHeader.js

import React from 'react';
import styles from './HouseHeader.module.css';
import HouseInfo from './HouseInfo/HouseInfo';
import AddRoomButton from './AddRoomButton/AddRoomButton';

/**
 * HouseHeader receives:
 *  - rooms
 *  - displayedRooms
 *  - onToggleRoom
 *  - lead
 *  - stopIndex (number)
 *  - onStopIndexChange (function => changes the currently selected stop)
 */
function HouseHeader({
  rooms,
  displayedRooms,
  onToggleRoom,
  lead,
  stopIndex,
  onStopIndexChange,
}) {
  return (
    <div className={styles.houseHeaderWrapper}>
      {/* Blue curved bar at the top */}
      <div className={styles.topBarContainer}>
        <div className={styles.topBarBack}></div>
      </div>
      
      {/* Original house header content */}
      <header className={styles.houseHeader}>
        {/* Pass stopIndex / onStopIndexChange to HouseInfo */}
        <HouseInfo
          lead={lead}
          stopIndex={stopIndex}
          onStopIndexChange={onStopIndexChange}
        />
        <AddRoomButton
          rooms={rooms}
          displayedRooms={displayedRooms}
          onToggleRoom={onToggleRoom}
        />
      </header>
    </div>
  );
}

export default HouseHeader;