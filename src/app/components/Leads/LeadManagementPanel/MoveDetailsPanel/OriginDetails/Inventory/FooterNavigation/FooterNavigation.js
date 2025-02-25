// src/components/Inventory/FooterNavigation/FooterNavigation.js

import React, { useState } from 'react';
import styles from './FooterNavigation.module.css';
import SpecialH from './SpecialH/SpecialH';
import MyInventory from './MyInventory/MyInventory';

import CreateQuote from '../../../../../../../assets/icons/createquoteicon.svg';
import MyInventoryIcon from '../../../../../../../assets/icons/myinventory.svg';
import SpecialHIcon from '../../../../../../../assets/icons/specialh.svg';
import BackArrow from '../../../../../../../assets/icons/arrowforward.svg';

import DeleteButton from './DeleteButton/DeleteButton'; // Import the new component

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
  onCloseInventory,
  lead,
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
        onClick={inRoom ? onBackToRooms : onCloseInventory}
        role="button"
        tabIndex={0}
      >
        <div className={styles.iconWrapper}>
          {inRoom ? (
            <CreateQuote className={styles.navIcon} />
          ) : (
            <BackArrow className={styles.navIcon} />
          )}
        </div>
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

      {/* Delete Button */}
      <DeleteButton 
        isActive={isDeleteActive} 
        onClick={handleDeleteClick} 
      />

      {/* Render SpecialH Popup */}
      {isSpecialHVisible && (
        <SpecialH 
          setIsSpecialHVisible={setIsSpecialHVisible} 
          roomItemSelections={roomItemSelections}
          setRoomItemSelections={setRoomItemSelections}
          selectedRoom={selectedRoom}
          displayedRooms={displayedRooms}
          lead={lead}
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
          lead={lead}
        />
      )}
    </footer>
  );
}

export default FooterNavigation;
