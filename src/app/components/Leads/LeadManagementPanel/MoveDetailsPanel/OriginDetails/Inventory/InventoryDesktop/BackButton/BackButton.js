"use client";

import React from 'react';
import styles from './BackButton.module.css';
import Icon from 'src/app/components/Icon';

function BackButton({ onClick }) {
  return (
    <button className={styles.backButton} onClick={onClick}>
      <Icon name="ArrowForward" className={styles.arrowIcon} />
      <span className={styles.buttonText}>Back</span>
    </button>
  );
}

export default BackButton;
