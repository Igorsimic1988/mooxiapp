import React from 'react';
import styles from './FooterNavigation.module.css';

import { ReactComponent as CreateQuote } from '../../../assets/icons/createquoteicon.svg';
import { ReactComponent as MyInventory } from '../../../assets/icons/myinventory.svg';
import { ReactComponent as SpecialH } from '../../../assets/icons/specialh.svg';
import { ReactComponent as DeleteIcon } from '../../../assets/icons/specialh.svg';

function FooterNavigation({ inRoom, onBackToRooms, isDeleteActive, setIsDeleteActive }) {
  const handleDeleteClick = () => {
    setIsDeleteActive((prevState) => !prevState);
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

      <div className={styles.navItem}>
        <div className={styles.iconWrapper}>
          <SpecialH className={styles.navIcon} />
        </div>
        <p className={styles.navText}>Special Handling</p>
      </div>

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
    </footer>
  );
}

export default FooterNavigation;
