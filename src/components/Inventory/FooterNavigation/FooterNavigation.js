// src/components/Inventory/FooterNavigation/FooterNavigation.js

import React from 'react';
import styles from './FooterNavigation.module.css';
import SpecialH from './SpecialH/SpecialH';

import { ReactComponent as CreateQuote } from '../../../assets/icons/createquoteicon.svg';
import { ReactComponent as MyInventory } from '../../../assets/icons/myinventory.svg';
import { ReactComponent as SpecialHIcon } from '../../../assets/icons/specialh.svg';
import { ReactComponent as DeleteIcon } from '../../../assets/icons/deletemobile.svg'; // Corrected icon import

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
  const handleDeleteClick = () => {
    setIsDeleteActive((prevState) => !prevState);
  };

  const handleSpecialHClick = () => {
    setIsSpecialHVisible(true);
  };

  return (
    <footer className={styles.footerNavigation}>
      <div
        className={styles.navItem}
        onClick={inRoom ? onBackToRooms : null}
        role="button"
        tabIndex={0}
      >
        <div className={styles.iconWrapper}>
          <CreateQuote className={styles.navIcon} />
        </div>
        <p className={styles.navText}>{inRoom ? 'Rooms' : 'Create Quote'}</p>
      </div>

      <div className={styles.navItem}>
        <div className={styles.iconWrapper}>
          <MyInventory className={styles.navIcon} />
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
    </footer>
  );
}

export default FooterNavigation;
