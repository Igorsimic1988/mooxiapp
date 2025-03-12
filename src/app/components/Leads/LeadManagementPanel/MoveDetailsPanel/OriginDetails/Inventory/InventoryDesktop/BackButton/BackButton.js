// src/components/Inventory/InventoryDesktop/BackButton/BackButton.js

import React from 'react';
import styles from './BackButton.module.css';
import ArrowIcon from '../../../../../../../../assets/icons/arrowforward.svg';
import Image from 'next/image';

function BackButton({ onClick }) {
  return (
    <button className={styles.backButton} onClick={onClick}>
      <Image src = {ArrowIcon} alt = 'arrowIcon' className={styles.arrowIcon}/>
      <span className={styles.buttonText}>Back</span>
    </button>
  );
}

export default BackButton;
