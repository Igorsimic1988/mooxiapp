// src/components/Inventory/ItemSelection/Item/ItemPopup.js

import React from 'react';
import styles from './ItemPopup.module.css';
import { ReactComponent as CloseIcon } from '../../../../../assets/icons/Close.svg'; // Adjust the path as needed

function ItemPopup({ item, onClose }) {
  return (
    <div className={styles.popup}>
      <div className={styles.popupContent}>
        {/* Header */}
        <div className={styles.header}>
          <div className={styles.title}>
            <p>Item</p>
          </div>
          <div className={styles.closeButton}>
            <button onClick={onClose} aria-label="Close">
              <CloseIcon className={styles.closeIcon} />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className={styles.content}>
          {/* Add your popup content here */}

          
        </div>
      </div>
    </div>
  );
}

export default ItemPopup;
