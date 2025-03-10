// src/components/Inventory/InventoryDesktop/CreateQuoteButton/CreateQuoteButton.js

import React from 'react';
import styles from './CreateQuoteButton.module.css';
import CreateQuoteIcon from '../../../../../../../../assets/icons/createquoteDesktop.svg';
import Image from 'next/image';

function CreateQuoteButton({ onClick }) {
  return (
    <button className={styles.createQuoteButton} onClick={onClick}>
      <span className={styles.buttonText}>Create Quote</span>
      <div className={styles.iconContainer}>
        <Image src = {CreateQuoteIcon} alt = 'createQuoteIcon' className={styles.icon}/>
      </div>
    </button>
  );
}

export default CreateQuoteButton;
