// src/components/Inventory/InventoryDesktop/CreateQuoteButton/CreateQuoteButton.js

import React from 'react';
import styles from './CreateQuoteButton.module.css';
import { ReactComponent as CreateQuoteIcon } from '../../../../../../../assets/icons/createquoteDesktop.svg';

function CreateQuoteButton() {
  return (
    <button className={styles.createQuoteButton}>
      <span className={styles.buttonText}>Create Quote</span>
      <div className={styles.iconContainer}>
        <CreateQuoteIcon className={styles.icon} />
      </div>
    </button>
  );
}

export default CreateQuoteButton;
