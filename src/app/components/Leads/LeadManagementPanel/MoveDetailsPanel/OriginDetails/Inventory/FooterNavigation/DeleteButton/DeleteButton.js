"use client";

import React from 'react';
import styles from './DeleteButton.module.css';
import Icon from 'src/app/components/Icon';

function DeleteButton({ isActive, onClick, className = '' }) {
  return (
    <div
    className={`${styles.navItem} ${isActive ? styles.activeDelete : ''} ${className}`}
      onClick={onClick}
      role="button"
      tabIndex={0}
    >
      <div className={styles.iconWrapper}>
        <Icon name="DeleteMobile" className={`${styles.navIcon} ${isActive ? styles.redIcon : ''}`} />
      </div>
      <p className={`${styles.navText} ${isActive ? styles.redText : ''}`}>Delete</p>
    </div>
  );
}

export default DeleteButton;
