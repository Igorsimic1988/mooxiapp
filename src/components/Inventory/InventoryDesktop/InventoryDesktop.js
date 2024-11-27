// src/components/Inventory/InventoryDesktop/InventoryDesktop.js

import React from 'react';
import styles from './InventoryDesktop.module.css';
import BackButton from './BackButton/BackButton';
import ToggleSwitch from '../ItemSelection/BcalculatorMyitems/ToogleSwitch/ToogleSwitch';
import RoomList from '../RoomList/RoomList';


function InventoryDesktop({
  roomItemSelections,
  setRoomItemSelections,
  displayedRooms,
  setDisplayedRooms,
  isToggled, 
  setIsToggled, 
  selectedRoom,
  setSelectedRoom,
  rooms,
}) {

     // Handler function for the toggle switch
  const handleToggle = () => {
    setIsToggled((prev) => !prev);
  };

  // Handler function for room selection
  const handleRoomSelect = (room) => {
    setSelectedRoom(room);
  };


  return (
    <div className={styles.inventoryDesktopContainer}>
      {/* Top Row */}
      <div className={styles.topRowCol1}>
        {/* Back button and Boxes Auto calculator */}
        <BackButton />
        <ToggleSwitch isToggled={isToggled} onToggle={handleToggle} />
      </div>
      <div className={styles.topRowCol2}>
        {/* Search */}
        <input type="text" placeholder="Search" />
      </div>
      <div className={styles.topRowCol3}>
        {/* Move overview with furniture and boxes count */}
        <p>Furniture Count: 0</p>
        <p>Boxes Count: 0</p>
      </div>

      {/* Middle Row */}
      <div className={styles.middleRowCol1}>
        {/* Room List */}
        <RoomList
          onRoomSelect={handleRoomSelect}
          roomItemSelections={roomItemSelections}
          displayedRooms={displayedRooms}
          selectedRoom={selectedRoom}
        />
      </div>
      <div className={styles.middleRowCol2}>
        {/* Item List */}
        <p>Item List</p>
      </div>
      <div className={styles.middleRowCol3}>
        {/* Selected Items */}
        <p>Selected Items</p>
      </div>

      {/* Bottom Row */}
      <div className={styles.bottomRowCol1}>
        {/* Add Room Button */}
        <button>Add Room</button>
      </div>
      <div className={styles.bottomRowCol2}>
        {/* Create Quote Button */}
        <button>Create Quote</button>
      </div>
      <div className={styles.bottomRowCol3}>
        {/* Rest of the Buttons */}
        <button>Button 1</button>
        <button>Button 2</button>
      </div>
    </div>
  );
}

export default InventoryDesktop;
