// src/components/Inventory/ItemSelection/Item/ItemPopup.js

import React from "react";
import styles from "./ItemPopup.module.css";
import { ReactComponent as CloseIcon } from "../../../../../assets/icons/Close.svg"; // Adjust the path as needed
import { ReactComponent as CameraIcon } from '../../../../../assets/icons/cameraroll.svg';
import { ReactComponent as UploadIcon } from '../../../../../assets/icons/upload.svg';
import { ReactComponent as LinkIcon } from '../../../../../assets/icons/pastelink.svg';

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
          {/* Item Group */}
          <div className={styles.itemGroup}>
            <div className={styles.furnitureOutline}>
              <div className={styles.furnitureWrapper}>
                <img
                  src={item.src}
                  alt={item.name}
                  className={styles.itemImage}
                />
              </div>
            </div>
            <div className={styles.furnitureTextGroup}>
              <p className={styles.itemName}>{item.name}</p>
              <div className={styles.numberInputWrapper}>
                <div className={styles.numberInput}>
                  <button className={`${styles.button} ${styles.decrement}`}>
                    −
                  </button>
                  <input
                    type="number"
                    defaultValue="0"
                    step="1"
                    className={styles.inputNumber}
                  />
                  <button className={`${styles.button} ${styles.increment}`}>
                    +
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Additional Inputs */}
          <div className={styles.inputRow}>
  <div className={styles.inputGroup}>
    <div className={styles.inputContainer}>
      <span className={styles.inputLabel}>Cuft:</span>
      <input
        type="number"
        id="cuft"
        defaultValue="4.5"
        className={`${styles.inputField} ${styles.inputNumberField}`}
      />
    </div>
  </div>
  <div className={styles.inputGroup}>
    <div className={styles.inputContainer}>
      <span className={styles.inputLabel}>Lbs:</span>
      <input
        type="number"
        id="lbs"
        defaultValue="31.5"
        className={`${styles.inputField} ${styles.inputNumberField}`}
      />
    </div>
  </div>
</div>

<div className={`${styles.inputGroup} ${styles.fullWidth} ${styles.notesInputGroup}`}>
  <textarea
    id="notes"
    placeholder="Notes"
    className={`${styles.inputField} ${styles.inputNotes}`}
  ></textarea>
</div>

          {/* Action Buttons */}
          <div className={styles.container}>
  {/* First Element */}
  <label className={styles.element}>
    <input
      type="file"
      accept="image/*"
      capture="camera"
      className={styles.hiddenInput}
    />
    <CameraIcon className={styles.icon} />
    <div>Camera Roll</div>
  </label>

  {/* Second Element */}
  <label className={styles.element}>
    <input
      type="file"
      accept="image/*"
      className={styles.hiddenInput}
    />
      <UploadIcon className={styles.icon} />
    <div>Upload</div>
  </label>

  {/* Third Element */}
  <div className={styles.element}>
  <LinkIcon className={styles.icon} />
    <div>Link</div>
  </div>
</div>

        </div>
      </div>
    </div>
  );
}

export default ItemPopup;
