// src/components/SpecialH/SpecialH.js

import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import styles from "./SpecialH.module.css";
import ItemCard from './ItemCard/ItemCard'; // Ensure the path is correct

import { ReactComponent as SpecialHPopupIcon } from "../../../../assets/icons/SpecialHPopupIcon.svg";
import { ReactComponent as CloseIcon } from "../../../../assets/icons/Close.svg";

import { generateGroupingKey } from '../../utils/generateGroupingKey';

import CustomSelect from './CustomSelect/CustomSelect'; // Ensure the path is correct
import { optionsData } from '../../../../data/constants/optionsData'; // Ensure the path is correct
import rooms from '../../../../data/constants/AllRoomsList'; // Import rooms data

function SpecialH({ setIsSpecialHVisible, roomItemSelections, setRoomItemSelections, selectedRoom, displayedRooms }) {
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
      setSelectedSubOption('loadPoints');
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

  // Define incompatible and required tags
  const incompatibleTags = {
    'cp_packed_by_movers': ['pbo_packed_by_customer'],
    'pbo_packed_by_customer': ['cp_packed_by_movers', 'crating', 'unpacking', 'pack_and_leave_behind'],
    'paper_blanket_wrapped': ['purchased_blankets'],
    'purchased_blankets': ['paper_blanket_wrapped'],
    'pack_and_leave_behind': ['pbo_packed_by_customer'],
    // Add any other incompatible tags here
  };

  const requiredTags = {
    'crating': ['cp_packed_by_movers'],
    // Add any other required tags here
  };

  // Handle item click to assign/remove the currentTag
  const handleItemClick = (roomId, id) => {
    if (!currentTag) {
      // Optionally, alert the user to select a tag first
      alert("Please select a tag from the dropdown before assigning.");
      return;
    }

    setRoomItemSelections((prevSelections) => {
      const updatedSelections = { ...prevSelections };
      const currentRoomItems = updatedSelections[roomId] || [];

      const updatedRoomItems = currentRoomItems.map((itemInstance) => {
        if (itemInstance.id === id) {
          let tags = [...itemInstance.tags];
          const hasTag = tags.includes(currentTag);

          if (hasTag) {
            // Remove the tag
            tags = tags.filter((tag) => tag !== currentTag);

            // Special handling when removing 'item_for_company_storage'
            if (currentTag === 'item_for_company_storage') {
              // Optionally remove 'keep_blanket_on' if it was added due to 'item_for_company_storage'
              // Implement logic here if needed
            }

            // Special handling when removing 'excluded'
            if (currentTag === 'excluded') {
              // No action needed; simply remove 'excluded' tag
            }
          } else {
            // Assign the tag
            tags.push(currentTag);

            // Special handling for 'excluded' tag
            if (currentTag === 'excluded') {
              // Remove all other tags except 'pack_and_leave_behind' if it exists
              tags = tags.filter(
                (tag) => tag === 'excluded' || tag === 'pack_and_leave_behind'
              );
            } else {
              // Remove incompatible tags
              const incompatible = incompatibleTags[currentTag] || [];
              tags = tags.filter((tag) => !incompatible.includes(tag));

              // Add required tags
              const required = requiredTags[currentTag] || [];
              required.forEach((reqTag) => {
                if (!tags.includes(reqTag)) {
                  tags.push(reqTag);
                }
              });

              // Special handling for 'item_for_company_storage' tag
              if (currentTag === 'item_for_company_storage') {
                const protectiveTags = [
                  'blanket_wrapped',
                  'paper_blanket_wrapped',
                  'purchased_blankets',
                ];
                const hasProtectiveTag = tags.some((tag) =>
                  protectiveTags.includes(tag)
                );
                if (hasProtectiveTag && !tags.includes('keep_blanket_on')) {
                  tags.push('keep_blanket_on');
                }
              }
            }
          }

          const updatedItemInstance = {
            ...itemInstance,
            tags,
          };
          updatedItemInstance.groupingKey = generateGroupingKey(updatedItemInstance);
          return updatedItemInstance;
        }
        return itemInstance;
      });
  
      updatedSelections[roomId] = updatedRoomItems;
      return updatedSelections;
    });
  };

  // Click outside handler using useRef
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        popupContentRef.current &&
        !popupContentRef.current.contains(event.target)
      ) {
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
                  value="loadPoints"
                  checked={selectedSubOption === 'loadPoints'}
                  onChange={(e) => {
                    setSelectedSubOption(e.target.value);
                    // No need to reset currentTag
                  }}
                  className={styles.radioButtonInput}
                />
                <span className={styles.radioButtonText}>Load Points</span>
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

        {/* Room Lists - Display only rooms that have items and are visible */}
        <div className={styles.roomLists}>
          {Object.keys(roomItemSelections)
            .filter(
              (roomId) =>
                displayedRooms.some((room) => room.id.toString() === roomId) &&
                Array.isArray(roomItemSelections[roomId]) &&
                roomItemSelections[roomId].length > 0
            )
            .sort((a, b) => {
              // Place roomId '13' (Boxes room) last
              if (a === '13') return 1;
              if (b === '13') return -1;
              // Otherwise, sort numerically
              return parseInt(a) - parseInt(b);
            })
            .map((roomId) => {
              const room = rooms.find((r) => r.id.toString() === roomId);
              if (!room) return null; // Room not found

              return (
                <div key={roomId} className={styles.room}>
                  <div className={styles.roomNameWrapper}>
                    <h3 className={styles.roomName}>{room.name}</h3>
                  </div>
                  <ul className={styles.itemList}>
                    {roomItemSelections[roomId].map((itemInstance) => (
                      <ItemCard
                        key={itemInstance.id} // Pass unique id
                        id={itemInstance.id}
                        item={itemInstance.item}
                        tags={itemInstance.tags}
                        isSelected={
                          currentTag && itemInstance.tags.includes(currentTag)
                        }
                        onItemClick={() =>
                          handleItemClick(roomId, itemInstance.id)
                        }
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
