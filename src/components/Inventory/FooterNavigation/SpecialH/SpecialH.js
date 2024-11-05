// src/components/SpecialH/SpecialH.js

import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import styles from "./SpecialH.module.css";
import ItemCard from './ItemCard/ItemCard'; // Ensure the path is correct

import { ReactComponent as SpecialHPopupIcon } from "../../../../assets/icons/SpecialHPopupIcon.svg";
import { ReactComponent as CloseIcon } from "../../../../assets/icons/Close.svg";

import CustomSelect from './CustomSelect/CustomSelect'; // Ensure the path is correct
import { optionsData } from '../../../../data/constants/optionsData'; // Ensure the path is correct

function SpecialH({ setIsSpecialHVisible, roomItemSelections, setRoomItemSelections, selectedRoom }) {
  const handleClose = useCallback(() => {
    setIsSpecialHVisible(false);
  }, [setIsSpecialHVisible]);

  // Ref for popupContent
  const popupContentRef = useRef(null);

  // State to manage the currently selected tag (string)
  const [currentTag, setCurrentTag] = useState('');

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
    // No need to reset currentTag here
  }, [selectedOption]);

  // Memoize furtherOptions to prevent unnecessary recalculations
  const furtherOptions = useMemo(() => {
    return (
      selectedSubOption &&
      optionsData[selectedOption] &&
      optionsData[selectedOption][selectedSubOption]
        ? optionsData[selectedOption][selectedSubOption]
        : []
    );
  }, [selectedOption, selectedSubOption]);

  // Set currentTag to the first option in furtherOptions when it changes
  useEffect(() => {
    if (furtherOptions.length > 0) {
      setCurrentTag(furtherOptions[0].value); // Set to the first tag value
    } else {
      setCurrentTag(''); // Reset if no options available
    }
  }, [furtherOptions]);

  // Handle tag selection from dropdown
  const handleTagSelect = (tagValue) => {
    setCurrentTag(tagValue); // Set the currently selected tag value
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
          const hasTag = itemInstance.tags.includes(currentTag);

          if (hasTag) {
            // Remove the tag
            const filteredTags = itemInstance.tags.filter(
              (tag) => tag !== currentTag
            );
            return {
              ...itemInstance,
              tags: filteredTags,
            };
          } else {
            // Assign the tag
            return {
              ...itemInstance,
              tags: [...itemInstance.tags, currentTag],
            };
          }
        }
        return itemInstance;
      });

      updatedSelections[roomName] = updatedRoomItems;
      return updatedSelections;
    });
  };

  // Click outside handler using useRef
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (popupContentRef.current && !popupContentRef.current.contains(event.target)) {
        handleClose();
      }
    };

    // Bind the event listener
    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      // Unbind the event listener on clean up
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [handleClose]);

  return (
    <div className={styles.popup}>
      <div
        className={styles.popupContent}
        ref={popupContentRef} // Attach the ref
      >
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
                    // No need to reset currentTag
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
                    // No need to reset currentTag
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
                    // No need to reset currentTag
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
                    // No need to reset currentTag
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
          {selectedSubOption && furtherOptions.length > 0 && (
            <CustomSelect
              options={furtherOptions}
              selectedOption={currentTag}
              onOptionChange={handleTagSelect}
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
                      tags={itemInstance.tags} // Pass tags as array of strings
                      isSelected={currentTag && itemInstance.tags.includes(currentTag)}
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
