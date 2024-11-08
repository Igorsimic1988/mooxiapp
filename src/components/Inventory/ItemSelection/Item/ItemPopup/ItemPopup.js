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
          {/* Add your popup content here */}
          <div className={styles.itemgroup}>
            <div className={styles.furnitureoutline}>
              <div className={styles.furniturewrapper}>
                <img
                  src={item.src}
                  alt={item.name}
                  className={styles.itemImage}
                />
              </div>
            </div>
            <div className="furnituretextgroup">
              <p className={styles.itemName}>{item.name}</p>
              <div class="number-input-wrapper">
              <div class="number-input">
                <button class="button decrement">−</button>
                <input type="number" value="0" step="1" />
                <button class="button increment">+</button>
              </div>
              </div>
            </div>
          </div>

          <div class="input-row">
  <div class="input-group">
    <input type="number" id="cuft" value="4.5" placeholder="Cuft:" />
  </div>
  <div class="input-group">
    <input type="number" id="lbs" value="31.5" placeholder="Lbs:" />
  </div>
</div>
<div class="input-group full-width">
  <input type="text" id="notes" placeholder="Notes" />
</div>

<div className="container">
      
      {/* First Element */}
      <div className="element">
        <label>
          <input
            type="file"
            accept="image/*"
            capture="camera"
            className="hidden-input"
          />
          <img src="" alt="Camera Icon" />
          <div>Camera Roll</div>
        </label>
      </div>
      
      {/* Second Element */}
      <div className="element">
        <label>
          <input
            type="file"
            accept="image/*"
            className="hidden-input"
          />
          <img src="" alt="Upload Icon" />
          <div>Upload</div>
        </label>
      </div>
      
      {/* Third Element */}
      <div className="element">
        <label>
          <div
            contentEditable="true"
            className="hidden-editable"
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
