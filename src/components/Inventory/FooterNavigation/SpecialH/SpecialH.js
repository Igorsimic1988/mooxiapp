// SpecialH.js
import React, { useState, useEffect } from 'react';
import styles from "./SpecialH.module.css";
import ItemCard from './ItemCard/ItemCard'; // Adjust the path based on your folder structure

import { ReactComponent as SpecialHPopupIcon } from "../../../../assets/icons/SpecialHPopupIcon.svg";
import { ReactComponent as CloseIcon } from "../../../../assets/icons/Close.svg";

import CustomSelect from './CustomSelect/CustomSelect'; // Ensure the path is correct
import { optionsData } from '../../../../data/constants/optionsData'; // Adjust the path based on your folder structure

function SpecialH({ setIsSpecialHVisible, roomItemSelections }) {
  const handleClose = () => {
    setIsSpecialHVisible(false);
  };

  // State to manage selected items using unique itemInstance.id
  const [selectedItems, setSelectedItems] = useState({}); // { [itemInstance.id]: true/false }

  // Initialize selectedOption to 'itemTags'
  const [selectedOption, setSelectedOption] = useState("itemTags"); // 'itemTags' or 'locationTags'
  
  // Initialize selectedSubOption based on selectedOption
  const [selectedSubOption, setSelectedSubOption] = useState("packing"); // Default for 'itemTags'
  
  const [selectedFurtherOption, setSelectedFurtherOption] = useState("");

  // Define main selection options
  const mainOptions = [
    { value: 'itemTags', label: 'Item Tags' },
    { value: 'locationTags', label: 'Location Tags' },
  ];

  // Define sub-selection options based on main selection
  const subOptionsMap = {
    itemTags: [
      { value: 'packing', label: 'Packing' },
      { value: 'extraAttention', label: 'Extra Attention' },
    ],
    locationTags: [
      { value: 'handlingInfo', label: 'Handling Info' },
      { value: 'dropPoints', label: 'Drop Points' },
    ],
  };

  // Update selectedSubOption when selectedOption changes
  useEffect(() => {
    if (selectedOption === 'itemTags') {
      setSelectedSubOption('packing');
    } else if (selectedOption === 'locationTags') {
      setSelectedSubOption('handlingInfo');
    } else {
      setSelectedSubOption('');
    }
    setSelectedFurtherOption(''); // Reset further selection
  }, [selectedOption]);

  // Get further options based on selectedSubOption using optionsData
  const furtherOptions = selectedSubOption && optionsData[selectedOption] && optionsData[selectedOption].subOptions[selectedSubOption]
    ? optionsData[selectedOption].subOptions[selectedSubOption]
    : [];

  // **New useEffect to set the default selection to the first option**
  useEffect(() => {
    if (furtherOptions.length > 0) {
      setSelectedFurtherOption(furtherOptions[0].value);
    } else {
      setSelectedFurtherOption("");
    }
  }, [furtherOptions]);

  // Handle item click to toggle selection
  const handleItemClick = (id) => {
    setSelectedItems((prevSelected) => ({
      ...prevSelected,
      [id]: !prevSelected[id],
    }));
  };

  return (
    <div className={styles.popup}>
      <div className={styles.popupContent}>
        {/* Header */}
        <div className={styles.header}>
          <div className={styles.title}>
            <SpecialHPopupIcon className={styles.icon} />
            <p>Special Handling</p>
          </div>
          <div className={styles.closeButton}>
            <button onClick={handleClose} aria-label="Close">
              <CloseIcon className={styles.closeIcon} />
            </button>
          </div>
        </div>

        {/* Main Radio Buttons */}
        <div className={styles.radioGroup}>
          {mainOptions.map((option) => (
            <label key={option.value} className={styles.radioLabel}>
              <input
                type="radio"
                name="tagType"
                value={option.value}
                checked={selectedOption === option.value}
                onChange={(e) => {
                  setSelectedOption(e.target.value);
                  // selectedSubOption will be set by useEffect
                }}
                className={styles.radioInput}
              />
              <span className={styles.radioText}>{option.label}</span>
            </label>
          ))}
        </div>

        {/* Sub-Options Based on Main Selection */}
        {selectedOption === 'itemTags' && (
          <div>
            <div className={styles.buttonGroup}>
              {/* Packing Option */}
              <label className={styles.radioButtonLabel}>
                <input
                  type="radio"
                  name="itemTagsOption"
                  value="packing"
                  checked={selectedSubOption === 'packing'}
                  onChange={(e) => {
                    setSelectedSubOption(e.target.value);
                    setSelectedFurtherOption('');
                  }}
                  className={styles.radioButtonInput}
                />
                <span className={styles.radioButtonText}>Packing</span>
              </label>

              {/* Extra Attention Option */}
              <label className={styles.radioButtonLabel}>
                <input
                  type="radio"
                  name="itemTagsOption"
                  value="extraAttention"
                  checked={selectedSubOption === 'extraAttention'}
                  onChange={(e) => {
                    setSelectedSubOption(e.target.value);
                    setSelectedFurtherOption('');
                  }}
                  className={styles.radioButtonInput}
                />
                <span className={styles.radioButtonText}>Extra Attention</span>
              </label>
            </div>
            {/* ...Rest of your content for Item Tags... */}
          </div>
        )}

        {selectedOption === 'locationTags' && (
          <div>
            <div className={styles.buttonGroup}>
              {/* Handling Info Option */}
              <label className={styles.radioButtonLabel}>
                <input
                  type="radio"
                  name="locationTagsOption"
                  value="handlingInfo"
                  checked={selectedSubOption === 'handlingInfo'}
                  onChange={(e) => {
                    setSelectedSubOption(e.target.value);
                    setSelectedFurtherOption('');
                  }}
                  className={styles.radioButtonInput}
                />
                <span className={styles.radioButtonText}>Handling Info</span>
              </label>

              {/* Drop Points Option */}
              <label className={styles.radioButtonLabel}>
                <input
                  type="radio"
                  name="locationTagsOption"
                  value="dropPoints"
                  checked={selectedSubOption === 'dropPoints'}
                  onChange={(e) => {
                    setSelectedSubOption(e.target.value);
                    setSelectedFurtherOption('');
                  }}
                  className={styles.radioButtonInput}
                />
                <span className={styles.radioButtonText}>Drop Points</span>
              </label>
            </div>
            {/* ...Rest of your content for Location Tags... */}
          </div>
        )}

        {/* CustomSelect for Further Options */}
        <div className={styles.selectOptionsGroup}>
          {selectedSubOption && (
            <CustomSelect
              options={furtherOptions}
              selectedOption={
                furtherOptions.find((opt) => opt.value === selectedFurtherOption) || null
              }
              onOptionChange={(option) => setSelectedFurtherOption(option.value)}
              placeholder="Select an Option"
            />
          )}
        </div>

        {/* Room Lists */}
        <div className={styles.roomLists}>
          {Object.keys(roomItemSelections).map((roomName) => {
            const items = roomItemSelections[roomName];
            if (!items || items.length === 0) return null; // Enhanced check to handle undefined

            return (
              <div key={roomName} className={styles.room}>
                <div className={styles.roomNameWrapper}>
                  <h3 className={styles.roomName}>{roomName}</h3>
                </div>
                <ul className={styles.itemList}>
                  {items.map((itemInstance) => (
                    <ItemCard
                      key={itemInstance.id}
                      id={itemInstance.id} // Pass unique id
                      item={itemInstance.item}
                      isSelected={!!selectedItems[itemInstance.id]} // Use unique id for selection
                      onItemClick={() => handleItemClick(itemInstance.id)} // Pass unique id to handler
                    />
                  ))}
                </ul>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default SpecialH;
