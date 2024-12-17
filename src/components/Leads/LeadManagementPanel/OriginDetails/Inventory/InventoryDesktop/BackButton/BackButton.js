// src/components/Inventory/InventoryDesktop/BackButton/BackButton.js

import React from 'react';
import styles from './BackButton.module.css';
import { ReactComponent as ArrowIcon } from '../../../../../../../assets/icons/arrowforward.svg';

function BackButton() {
  return (
    <button className={styles.backButton}>
      <ArrowIcon className={styles.arrowIcon} />
      <span className={styles.buttonText}>Back</span>
    </button>
  );
}

export default BackButton;
