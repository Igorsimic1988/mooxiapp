// src/components/common/DeleteButton.js

import React from 'react';
import styles from './DeleteButton.module.css';
import DeleteIcon from '../../../../../../../../assets/icons/deletemobile.svg';
import Image from 'next/image';

function DeleteButton({ isActive, onClick, className = '' }) {
  return (
    <div
    className={`${styles.navItem} ${isActive ? styles.activeDelete : ''} ${className}`}
      onClick={onClick}
      role="button"
      tabIndex={0}
    >
      <div className={styles.iconWrapper}>
        <Image src = {DeleteIcon} alt= 'deleteIcon' className={`${styles.navIcon} ${isActive ? styles.redIcon : ''}`}/>
      </div>
      <p className={`${styles.navText} ${isActive ? styles.redText : ''}`}>Delete</p>
    </div>
  );
}

export default DeleteButton;
