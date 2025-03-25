"use client";

import React from 'react';
import styles from './CreateQuoteButton.module.css';
import Icon from 'src/app/components/Icon';

function CreateQuoteButton({ onClick }) {
  return (
    <button className={styles.createQuoteButton} onClick={onClick}>
      <span className={styles.buttonText}>Create Quote</span>
      <div className={styles.iconContainer}>
        <Icon name="CreateQuoteDesktop" className={styles.icon} />
      </div>
    </button>
  );
}

export default CreateQuoteButton;
