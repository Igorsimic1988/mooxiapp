// src/components/SpecialH/SpecialH.js

import React, { useState, useEffect } from 'react';
import styles from "./SpecialH.module.css";
import ItemCard from './ItemCard/ItemCard'; // Ensure the path is correct

import { ReactComponent as SpecialHPopupIcon } from "../../../../assets/icons/SpecialHPopupIcon.svg";
import { ReactComponent as CloseIcon } from "../../../../assets/icons/Close.svg";

import CustomSelect from './CustomSelect/CustomSelect'; // Ensure the path is correct
import { optionsData } from '../../../../data/constants/optionsData'; // Ensure the path is correct

function SpecialH({ setIsSpecialHVisible, roomItemSelections, setRoomItemSelections, selectedRoom }) {
  const handleClose = () => {
    setIsSpecialHVisible(false);
  };

  // State to manage the currently selected tag
  const [currentTag, setCurrentTag] = useState(null); // { subOption, value }

  // State for main options ('itemTags' or 'locationTags')
  const [selectedOption, setSelectedOption] = useState("itemTags"); // 'itemTags' or 'locationTags'

  // State for sub-options based on main selection
  const [selectedSubOption, setSelectedSubOption] = useState("packing"); // Default for 'itemTags'

  // Define main selection options
  const mainOptions = [
    { value: 'itemTags', label: 'Item Tags' },
    { value: 'locationTags', label: 'Location Tags' },
  ];

  // Update selectedSubOption when selectedOption changes
  useEffect(() => {
    if (selectedOption === 'itemTags') {
      setSelectedSubOption('packing');
    } else if (selectedOption === 'locationTags') {
      setSelectedSubOption('handlingInfo');
    } else {
      setSelectedSubOption('');
    }
    // Reset currentTag when changing main option
    setCurrentTag(null);
  }, [selectedOption]);

  // Get further options based on selectedSubOption using optionsData
  const furtherOptions = selectedSubOption && optionsData[selectedOption] && optionsData[selectedOption].subOptions[selectedSubOption]
    ? optionsData[selectedOption].subOptions[selectedSubOption]
    : [];

  // Handle tag selection from dropdown
  const handleTagSelect = (option) => {
    setCurrentTag(option); // Set the currently selected tag
  };

  // Handle item click to assign/remove the currentTag
  const handleItemClick = (roomName, id) => {
    if (!currentTag) {
      // Optionally, alert the user to select a tag first
      alert("Please select a tag from the dropdown before assigning.");
      return;
    }

    setRoomItemSelections((prevSelections) => {
      const updatedSelections = { ...prevSelections };
      const currentRoomItems = updatedSelections[roomName] || [];

      const updatedRoomItems = currentRoomItems.map((itemInstance) => {
        if (itemInstance.id === id) {
          const hasTag = itemInstance.tags.some(
            (tag) => tag.subOption === currentTag.subOption && tag.value === currentTag.value
          );

          if (hasTag) {
            // Remove the tag
            const filteredTags = itemInstance.tags.filter(
              (tag) => !(tag.subOption === currentTag.subOption && tag.value === currentTag.value)
            );
            return {
              ...itemInstance,
              tags: filteredTags,
            };
          } else {
            // Assign the tag
            const newTag = { subOption: currentTag.subOption, value: currentTag.value };
            return {
              ...itemInstance,
              tags: [...itemInstance.tags, newTag],
            };
          }
        }
        return itemInstance;
      });

      updatedSelections[roomName] = updatedRoomItems;
      return updatedSelections;
    });
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
                    // Reset currentTag when changing sub-option
                    setCurrentTag(null);
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
                    // Reset currentTag when changing sub-option
                    setCurrentTag(null);
                  }}
                  className={styles.radioButtonInput}
                />
                <span className={styles.radioButtonText}>Extra Attention</span>
              </label>
            </div>
            {/* Additional content for Item Tags can be added here */}
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
                    // Reset currentTag when changing sub-option
                    setCurrentTag(null);
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
                    // Reset currentTag when changing sub-option
                    setCurrentTag(null);
                  }}
                  className={styles.radioButtonInput}
                />
                <span className={styles.radioButtonText}>Drop Points</span>
              </label>
            </div>
            {/* Additional content for Location Tags can be added here */}
          </div>
        )}

        {/* CustomSelect for Further Options */}
        <div className={styles.selectOptionsGroup}>
          {selectedSubOption && (
            <CustomSelect
              options={furtherOptions}
              selectedOption={currentTag}
              onOptionChange={(option) => {
                // Assign the selected tag as the currentTag
                handleTagSelect(option);
              }}
              placeholder="Select a Tag"
            />
          )}
        </div>

        {/* Room Lists - Display only rooms that have items */}
        <div className={styles.roomLists}>
          {Object.keys(roomItemSelections)
            .filter(roomName => Array.isArray(roomItemSelections[roomName]) && roomItemSelections[roomName].length > 0)
            .map(roomName => (
              <div key={roomName} className={styles.room}>
                <div className={styles.roomNameWrapper}>
                  <h3 className={styles.roomName}>{roomName}</h3>
                </div>
                <ul className={styles.itemList}>
                  {roomItemSelections[roomName].map((itemInstance) => (
                    <ItemCard
                      key={itemInstance.id}
                      id={itemInstance.id} // Pass unique id
                      item={itemInstance.item}
                      tags={itemInstance.tags} // Pass tags separately
                      isSelected={!!currentTag && itemInstance.tags.some(tag => tag.subOption === currentTag.subOption && tag.value === currentTag.value)}
                      onItemClick={() => handleItemClick(roomName, itemInstance.id)} // Pass roomName and unique id to handler
                    />
                  ))}
                </ul>
              </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default SpecialH;
