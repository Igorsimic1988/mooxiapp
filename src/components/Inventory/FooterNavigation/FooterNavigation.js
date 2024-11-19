// src/components/Inventory/FooterNavigation/FooterNavigation.js

import React, { useState } from 'react';
import styles from './FooterNavigation.module.css';
import SpecialH from './SpecialH/SpecialH';
import MyInventory from './MyInventory/MyInventory';

import { ReactComponent as CreateQuote } from '../../../assets/icons/createquoteicon.svg';
import { ReactComponent as MyInventoryIcon } from '../../../assets/icons/myinventory.svg';
import { ReactComponent as SpecialHIcon } from '../../../assets/icons/specialh.svg';
import { ReactComponent as DeleteIcon } from '../../../assets/icons/deletemobile.svg'; // Corrected icon import
import { ReactComponent as BackArrow } from '../../../assets/icons/arrowforward.svg';

function FooterNavigation({
  inRoom,
  onBackToRooms,
  isDeleteActive,
  setIsDeleteActive,
  isSpecialHVisible,
  setIsSpecialHVisible,
  roomItemSelections,
  setRoomItemSelections,
  selectedRoom,
  displayedRooms,
}) {

  const [isMyInventoryVisible, setIsMyInventoryVisible] = useState(false);

  const handleDeleteClick = () => {
    setIsDeleteActive((prevState) => !prevState);
  };

  const handleSpecialHClick = () => {
    setIsSpecialHVisible(true);
  };

  return (
    <footer className={styles.footerNavigation}>
      {/* First Navigation Item */}
      <div
        className={styles.navItem}
        onClick={inRoom ? onBackToRooms : null} // Keep existing functionality
        role="button"
        tabIndex={0}
      >
        <div className={styles.iconWrapper}>
          {/* Conditionally render the icon based on `inRoom` */}
          {inRoom ? (
            <CreateQuote className={styles.navIcon} />
          ) : (
            <BackArrow className={styles.navIcon} />
          )}
        </div>
        {/* Conditionally render the text based on `inRoom` */}
        <p className={styles.navText}>{inRoom ? 'Rooms' : 'Create Quote'}</p>
      </div>

      {/* Second Navigation Item */}
      <div
  className={styles.navItem}
  onClick={() => setIsMyInventoryVisible(true)}
  role="button"
  tabIndex={0}
>
  <div className={styles.iconWrapper}>
    <MyInventoryIcon className={styles.navIcon} />
  </div>
  <p className={styles.navText}>My Inventory</p>
</div>

      {/* Special Handling */}
      <div
        className={styles.navItem}
        onClick={handleSpecialHClick}
        role="button"
        tabIndex={0}
      >
        <div className={styles.iconWrapper}>
          <SpecialHIcon className={styles.navIcon} />
        </div>
        <p className={styles.navText}>Special Handling</p>
      </div>

      {/* Delete */}
      <div
        className={`${styles.navItem} ${isDeleteActive ? styles.activeDelete : ''}`}
        onClick={handleDeleteClick}
        role="button"
        tabIndex={0}
      >
        <div className={styles.iconWrapper}>
          <DeleteIcon className={`${styles.navIcon} ${isDeleteActive ? styles.redIcon : ''}`} />
        </div>
        <p className={`${styles.navText} ${isDeleteActive ? styles.redText : ''}`}>Delete</p>
      </div>

      {/* Render SpecialH Popup */}
      {isSpecialHVisible && (
        <SpecialH 
          setIsSpecialHVisible={setIsSpecialHVisible} 
          roomItemSelections={roomItemSelections}
          setRoomItemSelections={setRoomItemSelections} // Pass the setter
          selectedRoom={selectedRoom} // Pass the selectedRoom
          displayedRooms={displayedRooms}
        />
      )}

      {/* Render MyInventory Popup */}
{isMyInventoryVisible && (
  <MyInventory
    setIsMyInventoryVisible={setIsMyInventoryVisible}
    roomItemSelections={roomItemSelections}
    setRoomItemSelections={setRoomItemSelections}
    selectedRoom={selectedRoom}
    displayedRooms={displayedRooms}
  />
)}
    </footer>
  );
}

export default FooterNavigation;
