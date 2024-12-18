// src/components/Inventory/HouseHeader/HouseHeader.js

import React from 'react';
import styles from './HouseHeader.module.css';
import HouseInfo from './HouseInfo/HouseInfo';
import AddRoomButton from './AddRoomButton/AddRoomButton';

function HouseHeader({ rooms, displayedRooms, onToggleRoom }) {
  return (
    <header className={styles.houseHeader}>
      <HouseInfo />
      <AddRoomButton
        rooms={rooms}
        displayedRooms={displayedRooms}
        onToggleRoom={onToggleRoom}
      />
    </header>
  );
}

export default HouseHeader;
