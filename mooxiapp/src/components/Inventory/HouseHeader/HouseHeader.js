import React from 'react';
import styles from './HouseHeader.module.css';
import { ReactComponent as AddRoomIcon } from '../../../assets/icons/addroom.svg';
import { ReactComponent as HouseIcon } from '../../../assets/icons/house.svg';

function HouseHeader() {
  const handleAddRoom = () => {
    // TODO: Implement add room functionality
  };

  return (
    <header className={styles.houseHeader}>
      <div className={styles.houseInfoContainer}>
        <div className={styles.iconWrapper}>
          <HouseIcon className={styles.houseIcon} aria-hidden="true" />
        </div>
        <div className={styles.houseInfo}>
          <h1 className={styles.houseTitle}>House</h1>
            <span className={styles.houseBedrooms}>4 bedroom</span>,{' '}
            <span className={styles.houseStories}>two story</span>
        </div>
      </div>
      <button
        className={styles.addRoomButton}
        onClick={handleAddRoom}
        aria-label="Add Room"
      >
        <span className={styles.addRoomText}>Add Room</span>
        <AddRoomIcon className={styles.addRoomIcon} aria-hidden="true" />
      </button>
    </header>
  );
}

export default HouseHeader;
