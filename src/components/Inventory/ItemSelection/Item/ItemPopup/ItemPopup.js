// src/components/Inventory/ItemSelection/Item/ItemPopup.js

import React, { useEffect, useState } from "react";
import styles from "./ItemPopup.module.css";
import { ReactComponent as CloseIcon } from "../../../../../assets/icons/Close.svg";
import { ReactComponent as CameraIcon } from "../../../../../assets/icons/cameraroll.svg";
import { ReactComponent as UploadIcon } from "../../../../../assets/icons/upload.svg";
import { ReactComponent as LinkIcon } from "../../../../../assets/icons/pastelink.svg";
import { optionsData } from "../../../../../data/constants/optionsData";
import Select from 'react-select';

function ItemPopup({ item, onClose, onUpdateItem, itemInstance }) {
  // State to manage selected options
  const [packingOptions, setPackingOptions] = useState([]);
  const [extraAttentionOptions, setExtraAttentionOptions] = useState([]);
  const [handlingInfoOptions, setHandlingInfoOptions] = useState([]);
  const [dropPointsOptions, setDropPointsOptions] = useState([]);

  // State for item count and notes
  const [itemCount, setItemCount] = useState(itemInstance.count || 1);
  const [notes, setNotes] = useState(itemInstance.notes || '');

  // Custom className prefix for react-select
  const selectClassNamePrefix = "custom-select";

  // Initialize the selected options based on the item's current tags
  useEffect(() => {
    if (itemInstance && itemInstance.tags) {
      const allOptions = [
        ...optionsData.itemTags.packing,
        ...optionsData.itemTags.extraAttention,
        ...optionsData.locationTags.handlingInfo,
        ...optionsData.locationTags.dropPoints,
      ];

      const selectedOptions = itemInstance.tags
        .map((tag) => allOptions.find((opt) => opt.value === tag))
        .filter(Boolean);

      setPackingOptions(
        selectedOptions.filter((opt) =>
          optionsData.itemTags.packing.some((o) => o.value === opt.value)
        )
      );
      setExtraAttentionOptions(
        selectedOptions.filter((opt) =>
          optionsData.itemTags.extraAttention.some((o) => o.value === opt.value)
        )
      );
      setHandlingInfoOptions(
        selectedOptions.filter((opt) =>
          optionsData.locationTags.handlingInfo.some((o) => o.value === opt.value)
        )
      );
      setDropPointsOptions(
        selectedOptions.filter((opt) =>
          optionsData.locationTags.dropPoints.some((o) => o.value === opt.value)
        )
      );
    }
  }, [itemInstance]);

  // Function to handle saving the item
  const handleSaveItem = () => {
    // Collect all selected tags
    const selectedTags = [
      ...packingOptions.map((opt) => opt.value),
      ...extraAttentionOptions.map((opt) => opt.value),
      ...handlingInfoOptions.map((opt) => opt.value),
      ...dropPointsOptions.map((opt) => opt.value),
    ];

    // Create updated item instance
    const updatedItemInstance = {
      ...itemInstance,
      tags: selectedTags,
      count: itemCount,
      notes: notes,
    };

    // Call the onUpdateItem callback with both updated and original instances
    onUpdateItem(updatedItemInstance, itemInstance);

    onClose(); // Close the popup after saving
  };

  // Handlers for item count
  const handleIncrement = () => {
    setItemCount((prevCount) => prevCount + 1);
  };

  const handleDecrement = () => {
    setItemCount((prevCount) => (prevCount > 1 ? prevCount - 1 : 1));
  };

  const handleCountChange = (e) => {
    const value = parseInt(e.target.value, 10);
    setItemCount(value > 0 ? value : 1);
  };

  // Handler for notes
  const handleNotesChange = (e) => {
    setNotes(e.target.value);
  };

  // Custom styles for react-select
  const customSelectStyles = {
    multiValueRemove: (base, state) => ({
      ...base,
      // Increase the size of the 'x' button
      fontSize: '1.2rem', // Larger font size
      padding: '4px',     // Increased padding
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      cursor: 'pointer',
      // Optionally add more styles
    }),
    // Optionally, you can adjust the size of the multi-value label
    multiValueLabel: (base, state) => ({
      ...base,
      fontSize: '1rem',
      padding: '0 8px',
    }),
  };

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
                  <button
                    className={`${styles.button} ${styles.decrement}`}
                    onClick={handleDecrement}
                    aria-label="Decrease count"
                  >
                    −
                  </button>
                  <input
                    type="number"
                    value={itemCount}
                    onChange={handleCountChange}
                    step="1"
                    min="1"
                    className={styles.inputNumber}
                    aria-label="Item count"
                  />
                  <button
                    className={`${styles.button} ${styles.increment}`}
                    onClick={handleIncrement}
                    aria-label="Increase count"
                  >
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
                  defaultValue={item.cuft || ''}
                  className={`${styles.inputField} ${styles.inputNumberField}`}
                  aria-label="Cuft"
                />
              </div>
            </div>
            <div className={styles.inputGroup}>
              <div className={styles.inputContainer}>
                <span className={styles.inputLabel}>Lbs:</span>
                <input
                  type="number"
                  id="lbs"
                  defaultValue={item.lbs || ''}
                  className={`${styles.inputField} ${styles.inputNumberField}`}
                  aria-label="Lbs"
                />
              </div>
            </div>
          </div>

          <div className={`${styles.inputGroup} ${styles.fullWidth} ${styles.notesInputGroup}`}>
            <textarea
              id="notes"
              placeholder="Notes"
              value={notes}
              onChange={handleNotesChange}
              className={`${styles.inputField} ${styles.inputNotes}`}
              aria-label="Notes"
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

          {/* First Section: Item Tags */}
          <div className={styles.section}>
            <p className={styles.sectionLabel}>Item Tags</p>
            <div className={styles.inputGroup}>
              <Select
                isMulti
                isClearable={false} // Remove 'Clear All' button
                className={styles.selectInput}
                classNamePrefix={selectClassNamePrefix} // Ensure this is set
                name="packing"
                options={optionsData.itemTags.packing}
                placeholder="Packing"
                value={packingOptions}
                onChange={setPackingOptions}
                aria-label="Item Tags - Packing"
                styles={customSelectStyles} // Apply custom styles
              />
            </div>
            <div className={styles.inputGroup}>
              <Select
                isMulti
                isClearable={false} // Remove 'Clear All' button
                className={styles.selectInput}
                classNamePrefix={selectClassNamePrefix} // Ensure this is set
                name="extraAttention"
                options={optionsData.itemTags.extraAttention}
                placeholder="Extra Attention"
                value={extraAttentionOptions}
                onChange={setExtraAttentionOptions}
                aria-label="Item Tags - Extra Attention"
                styles={customSelectStyles} // Apply custom styles
              />
            </div>
          </div>

          {/* Second Section: Location Tags */}
          <div className={styles.section}>
            <p className={styles.sectionLabel}>Location Tags</p>
            <div className={styles.inputGroup}>
              <Select
                isMulti
                isClearable={false} // Remove 'Clear All' button
                className={styles.selectInput}
                classNamePrefix={selectClassNamePrefix} // Ensure this is set
                name="handlingInfo"
                options={optionsData.locationTags.handlingInfo}
                placeholder="Handling Info"
                value={handlingInfoOptions}
                onChange={setHandlingInfoOptions}
                aria-label="Location Tags - Handling Info"
                styles={customSelectStyles} // Apply custom styles
              />
            </div>
            <div className={styles.inputGroup}>
              <Select
                isMulti
                isClearable={false} // Remove 'Clear All' button
                className={styles.selectInput}
                classNamePrefix={selectClassNamePrefix} // Ensure this is set
                name="dropPoints"
                options={optionsData.locationTags.dropPoints}
                placeholder="Drop Points"
                value={dropPointsOptions}
                onChange={setDropPointsOptions}
                aria-label="Location Tags - Drop Points"
                styles={customSelectStyles} // Apply custom styles
              />
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className={styles.saveButtonContainer}>
          <button className={styles.saveButton} onClick={handleSaveItem}>
            Save
          </button>
        </div>
      </div>
    </div>
  );
}

export default ItemPopup;
