import React from 'react';
import styles from './FooterNavigation.module.css';

import { ReactComponent as CreateQuote } from '../../../assets/icons/createquoteicon.svg';
import { ReactComponent as MyInventory } from '../../../assets/icons/myinventory.svg';
import { ReactComponent as SpecialH } from '../../../assets/icons/specialh.svg';
import { ReactComponent as Delete } from '../../../assets/icons/specialh.svg';

function FooterNavigation({ inRoom, onBackToRooms }) {
  return (
    <footer className={styles.footerNavigation}>
      <div
        className={styles.navItem}
        onClick={inRoom ? onBackToRooms : null}
        role="button"
        tabIndex={0}
      >
        <div className={styles.iconWrapper}>
          {inRoom ? <CreateQuote className={styles.navIcon} /> : <CreateQuote className={styles.navIcon} />}
        </div>
        <p className={styles.navText}>{inRoom ? 'Rooms' : 'Create Quote'}</p>
      </div>
      {/* Other nav items remain the same */}
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
      <div className={styles.navItem}>
        <div className={styles.iconWrapper}>
          <Delete className={styles.navIcon} />
        </div>
        <p className={styles.navText}>Delete</p>
      </div>
    </footer>
  );
}

export default FooterNavigation;