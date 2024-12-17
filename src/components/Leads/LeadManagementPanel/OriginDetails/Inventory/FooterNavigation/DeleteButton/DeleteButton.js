// src/components/common/DeleteButton.js

import React from 'react';
import styles from './DeleteButton.module.css';
import { ReactComponent as DeleteIcon } from '../../../../../../../assets/icons/deletemobile.svg';

function DeleteButton({ isActive, onClick, className = '' }) {
  return (
    <div
    className={`${styles.navItem} ${isActive ? styles.activeDelete : ''} ${className}`}
      onClick={onClick}
      role="button"
      tabIndex={0}
    >
      <div className={styles.iconWrapper}>
        <DeleteIcon className={`${styles.navIcon} ${isActive ? styles.redIcon : ''}`} />
      </div>
      <p className={`${styles.navText} ${isActive ? styles.redText : ''}`}>Delete</p>
    </div>
  );
}

export default DeleteButton;
