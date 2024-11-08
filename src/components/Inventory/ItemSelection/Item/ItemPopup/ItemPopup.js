// src/components/Inventory/ItemSelection/Item/ItemPopup.js

import React from "react";
import styles from "./ItemPopup.module.css";
import { ReactComponent as CloseIcon } from "../../../../../assets/icons/Close.svg"; // Adjust the path as needed

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
            <div className={styles.element}>
              <label>
                <input
                  type="file"
                  accept="image/*"
                  capture="camera"
                  className={styles.hiddenInput}
                />
                <img src="" alt="Camera Icon" />
                <div>Camera Roll</div>
              </label>
            </div>

            {/* Second Element */}
            <div className={styles.element}>
              <label>
                <input
                  type="file"
                  accept="image/*"
                  className={styles.hiddenInput}
                />
                <img src="" alt="Upload Icon" />
                <div>Upload</div>
              </label>
            </div>

            {/* Third Element */}
            <div className={styles.element}>
              <label>
                <div
                  contentEditable="true"
                  className={styles.hiddenEditable}
                ></div>
                <img src="" alt="Link Icon" />
                <div>Link</div>
              </label>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

export default ItemPopup;
