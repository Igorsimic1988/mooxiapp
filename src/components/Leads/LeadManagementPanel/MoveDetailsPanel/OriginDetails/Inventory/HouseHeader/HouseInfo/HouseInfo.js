// src/components/Inventory/HouseHeader/HouseInfo/HouseInfo.js

import React from 'react';
import styles from './HouseInfo.module.css';
import { ReactComponent as HouseIcon } from '../../../../../../../../assets/icons/house.svg';

function HouseInfo() {
  return (
    <div className={styles.houseInfoContainer}>
      <div className={styles.iconWrapper}>
        <HouseIcon className={styles.houseIcon} aria-hidden="true" />
      </div>
      <div className={styles.houseInfo}>
        <h1 className={styles.houseTitle}>House</h1>
        <p className={styles.houseDescription}>
        <span className={styles.houseBedrooms}>4 bedroom</span>
          <span className={styles.houseComma}>, </span>
          <span className={styles.houseStories}>two story</span>
        </p>
      </div>
    </div>
  );
}

export default HouseInfo;
