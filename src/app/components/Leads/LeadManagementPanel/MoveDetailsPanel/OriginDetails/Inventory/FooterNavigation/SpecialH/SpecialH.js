"use client";

import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import styles from "./SpecialH.module.css";
import ItemCard from './ItemCard/ItemCard';

import Icon from 'src/app/components/Icon'


import { generateGroupingKey } from '../../utils/generateGroupingKey';
import CustomSelect from './CustomSelect/CustomSelect';
import { optionsData } from '../../../../../../../../data/constants/optionsData';
import rooms from '../../../../../../../../data/constants/AllRoomsList';

/** 
 * Incompatible + required tags
 */
const incompatibleTags = {
  cp_packed_by_movers: ['pbo_packed_by_customer'],
  pbo_packed_by_customer: [
    'cp_packed_by_movers',
    'crating',
    'unpacking',
    'pack_and_leave_behind',
  ],
  paper_blanket_wrapped: ['purchased_blankets'],
  purchased_blankets: ['paper_blanket_wrapped'],
  pack_and_leave_behind: ['pbo_packed_by_customer'],
};

const requiredTags = {
  crating: ['cp_packed_by_movers'],
};

/**
 * These location tags are exclusive with one another:
 * only ONE from this set can be present on the item at a time.
 */
const EXCLUSIVE_LOCATION_TAGS = [
  'moving_within_premises',
  'help_with_loading',
  'disposal',
  'help_with_unloading',
  'main_drop_off',
  '2_drop',
  '3_drop',
  '4_drop',
  '5_drop',
  '6_drop',
  '7_drop',
  '8_drop',
  '9_drop',
  'post_storage_main_drop',
  'post_storage_2_drop',
  'post_storage_3_drop',
  'post_storage_4_drop',
  'post_storage_5_drop',
  'post_storage_6_drop',
  'post_storage_7_drop',
  'post_storage_8_drop',
  'post_storage_9_drop',
];

/**
 * Convert lead’s "label" => the “value” used in optionsData
 * e.g. "Main Drop off" => "main_drop_off"
 *      "Drop off 2" => "2_drop"
 *      "Post Storage Drop off 3" => "post_storage_3_drop"
 */
function labelToDropTag(labelString) {
  const trimmed = labelString.trim().toLowerCase();

  // "Main Drop off"
  if (trimmed === 'main drop off') {
    return 'main_drop_off';
  }
  // "Drop off X"
  const dropXMatch = trimmed.match(/^drop off\s+(\d+)$/);
  if (dropXMatch) {
    return `${dropXMatch[1]}_drop`;
  }

  // "Post Storage Main Drop off"
  if (trimmed === 'post storage main drop off') {
    return 'post_storage_main_drop';
  }
  // "Post Storage Drop off X"
  const psDropXMatch = trimmed.match(/^post storage drop off\s+(\d+)$/);
  if (psDropXMatch) {
    return `post_storage_${psDropXMatch[1]}_drop`;
  }

  // fallback => simple slug
  return trimmed.replace(/\s+/g, '_').replace(/[^\w_]/g, '');
}

function SpecialH({
  lead, 
  setIsSpecialHVisible,
  itemsByRoom = {},
  handleUpdateItem,
  displayedRooms = [],
}) {
  const handleClose = useCallback(() => {
    setIsSpecialHVisible(false);
  }, [setIsSpecialHVisible]);

  const popupContentRef = useRef(null);

  // Main radio: "itemTags" or "locationTags"
  const [selectedOption, setSelectedOption] = useState("itemTags");
  // Sub-radio: "packing"/"extraAttention" (for itemTags) or "loadPoints"/"dropPoints" (for locationTags)
  const [selectedSubOption, setSelectedSubOption] = useState("packing");
  const [currentTag, setCurrentTag] = useState('');

  // Radiobutton for main selection
  const mainOptions = [
    { value: 'itemTags', label: 'Item Tags' },
    { value: 'locationTags', label: 'Location Tags' },
  ];

  // Sub-option resets
  useEffect(() => {
    if (selectedOption === 'itemTags') {
      setSelectedSubOption('packing');
    } else {
      setSelectedSubOption('loadPoints');
    }
  }, [selectedOption]);

  /** 
   *  We do the dynamic dropPoints logic based on lead data
   */
  const allDropPoints = optionsData.locationTags.dropPoints; 
  const baseAlwaysVisible = [
    'disposal',
    'item_for_company_storage',
    'help_with_unloading',
    'hoisting_destination',
    'crane_destination',
  ];
  const destinationStops = lead?.destinations || [];

  const postStorageStops = destinationStops.filter((s) => s.postStorage);
  const normalStops = destinationStops.filter((s) => !s.postStorage);

  const activeStops = destinationStops.filter((s) => s.isActive);
  const hasMultipleActiveStops = activeStops.length >= 2;

  const activeStopValues = new Set();
  if (hasMultipleActiveStops) {
    activeStops.forEach((stop) => {
      const group = stop.postStorage ? postStorageStops : normalStops;
  const indexInGroup = group.indexOf(stop);
  const isFirst = indexInGroup === 0;

  const label = stop.postStorage
    ? isFirst
      ? "Post Storage Main Drop off"
      : `Post Storage Drop off ${indexInGroup + 1}`
    : isFirst
      ? "Main Drop off"
      : `Drop off ${indexInGroup + 1}`;

  const tag = labelToDropTag(label);
  activeStopValues.add(tag);
      // const label = index === 0 ? 'Main Drop off' : `Drop off ${index + 1}`;
      // const dropVal = labelToDropTag(label);
      // activeStopValues.add(dropVal);
    });
  }
  // Filter the dropPoints
  const fullyFilteredDropPoints = allDropPoints.filter(dp => {
    if (baseAlwaysVisible.includes(dp.value)) return true;
    if (hasMultipleActiveStops && activeStopValues.has(dp.value)) return true;
    return false;
  });

  // figure out final dropdown options
  const furtherOptions = useMemo(() => {
    if (selectedOption === 'itemTags') {
      if (selectedSubOption === 'packing') {
        return optionsData.itemTags.packing;
      }
      if (selectedSubOption === 'extraAttention') {
        return optionsData.itemTags.extraAttention;
      }
      return [];
    }
    // locationTags
    if (selectedSubOption === 'loadPoints') {
      return optionsData.locationTags.loadPoints;
    }
    if (selectedSubOption === 'dropPoints') {
      return fullyFilteredDropPoints;
    }
    return [];
  }, [selectedOption, selectedSubOption, fullyFilteredDropPoints]);

  // If the array changes, ensure currentTag is still valid
  useEffect(() => {
    if (furtherOptions.length > 0) {
      const stillValid = furtherOptions.some(opt => opt.value === currentTag);
      if (!stillValid) {
        setCurrentTag(furtherOptions[0].value);
      }
    } else {
      setCurrentTag('');
    }
  }, [furtherOptions, currentTag]);

  const handleTagSelect = (tagValue) => {
    setCurrentTag(tagValue);
  };

  /** 
   *  When user clicks an item => toggle the `currentTag`.
   *  Also remove any other tags from the EXCLUSIVE_LOCATION_TAGS set if we are adding a new one.
   */

  const handleItemClick = (roomId, itemId) => {
    if (!currentTag) {
      alert("Please select a tag from the dropdown before assigning.");
      return;
    }
  
    const itemsInRoom = itemsByRoom[roomId] || [];
    const originalInstance = itemsInRoom.find(inst => inst.id === itemId);
    if (!originalInstance) return;
  
    let newTags = Array.isArray(originalInstance.tags) ? [...originalInstance.tags] : [];
    const alreadyHas = newTags.includes(currentTag);
  
    if (alreadyHas) {
      newTags = newTags.filter((t) => t !== currentTag);
    } else {
      newTags.push(currentTag);
  
      // EXCLUSIVE TAGS LOGIC
      if (EXCLUSIVE_LOCATION_TAGS.includes(currentTag)) {
        newTags = newTags.filter(t =>
          t === currentTag || !EXCLUSIVE_LOCATION_TAGS.includes(t)
        );
      }
  
      // "excluded" logic
      if (currentTag === 'excluded') {
        newTags = newTags.filter(
          (t) => t === 'excluded' || t === 'pack_and_leave_behind'
        );
      } else {
        const incomp = incompatibleTags[currentTag] || [];
        newTags = newTags.filter((t) => !incomp.includes(t));
  
        const reqs = requiredTags[currentTag] || [];
        reqs.forEach((reqT) => {
          if (!newTags.includes(reqT)) {
            newTags.push(reqT);
          }
        });
  
        if (currentTag === 'item_for_company_storage') {
          const protectiveTags = [
            'blanket_wrapped',
            'paper_blanket_wrapped',
            'purchased_blankets',
          ];
          const hasProtective = newTags.some((t) => protectiveTags.includes(t));
          if (hasProtective && !newTags.includes('keep_blanket_on')) {
            newTags.push('keep_blanket_on');
          }
        }
      }
    }
  
    const updatedInstance = {
      ...originalInstance,
      tags: newTags,
      groupingKey: generateGroupingKey({
        ...originalInstance,
        tags: newTags,
      }),
    };
  
    handleUpdateItem(updatedInstance, originalInstance);
  };

  // Close popup if outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        popupContentRef.current &&
        !popupContentRef.current.contains(event.target)
      ) {
        handleClose();
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [handleClose]);

  return (
    <div className={styles.popup}>
      <div className={styles.popupContent} ref={popupContentRef}>
        {/* Header */}
        <div className={styles.header}>
          <div className={styles.title}>
            <Icon name="SpecialHPopupIcon" className={styles.icon}/>
            <p>Special Handling</p>
          </div>
          <div className={styles.closeButton}>
            <button onClick={handleClose} aria-label="Close">
              <Icon name="Close" width={20} height={20} className={styles.closeIcon}/>
            </button>
          </div>
        </div>

        {/* Main radio group => itemTags vs locationTags */}
        <div className={styles.radioGroup}>
          {mainOptions.map((opt) => (
            <label key={opt.value} className={styles.radioLabel}>
              <input
                type="radio"
                name="tagType"
                value={opt.value}
                checked={selectedOption === opt.value}
                onChange={(e) => setSelectedOption(e.target.value)}
                className={styles.radioInput}
              />
              <span className={styles.radioText}>{opt.label}</span>
            </label>
          ))}
        </div>

        {/* Sub-options => packing/extra vs loadPoints/dropPoints */}
        {selectedOption === 'itemTags' && (
          <div className={styles.buttonGroup}>
            <label className={styles.radioButtonLabel}>
              <input
                type="radio"
                name="itemTagsOption"
                value="packing"
                checked={selectedSubOption === 'packing'}
                onChange={(e) => setSelectedSubOption(e.target.value)}
                className={styles.radioButtonInput}
              />
              <span className={styles.radioButtonText}>Packing</span>
            </label>

            <label className={styles.radioButtonLabel}>
              <input
                type="radio"
                name="itemTagsOption"
                value="extraAttention"
                checked={selectedSubOption === 'extraAttention'}
                onChange={(e) => setSelectedSubOption(e.target.value)}
                className={styles.radioButtonInput}
              />
              <span className={styles.radioButtonText}>Extra Attention</span>
            </label>
          </div>
        )}

        {selectedOption === 'locationTags' && (
          <div className={styles.buttonGroup}>
            <label className={styles.radioButtonLabel}>
              <input
                type="radio"
                name="locationTagsOption"
                value="loadPoints"
                checked={selectedSubOption === 'loadPoints'}
                onChange={(e) => setSelectedSubOption(e.target.value)}
                className={styles.radioButtonInput}
              />
              <span className={styles.radioButtonText}>Load Points</span>
            </label>
            <label className={styles.radioButtonLabel}>
              <input
                type="radio"
                name="locationTagsOption"
                value="dropPoints"
                checked={selectedSubOption === 'dropPoints'}
                onChange={(e) => setSelectedSubOption(e.target.value)}
                className={styles.radioButtonInput}
              />
              <span className={styles.radioButtonText}>Drop Points</span>
            </label>
          </div>
        )}

        {/* The Tag dropdown */}
        <div className={styles.selectOptionsGroup}>
          {furtherOptions.length > 0 && (
            <CustomSelect
              options={furtherOptions}
              selectedOption={currentTag}
              onOptionChange={handleTagSelect}
              placeholder="Select a Tag"
            />
          )}
        </div>

        {/* List items for each displayed room */}
        <div className={styles.roomLists}>
          {Object.keys(itemsByRoom)
            .filter((roomId) => {
              const numericId = parseInt(roomId, 10);
              return (
                displayedRooms.includes(numericId) &&
                Array.isArray(itemsByRoom[roomId]) &&
                itemsByRoom[roomId].length > 0
              );
            })
            .sort((a, b) => {
              // optionally put '13' at the end
              if (a === '13') return 1;
              if (b === '13') return -1;
              return parseInt(a) - parseInt(b);
            })
            .map((roomId) => {
              const numericId = parseInt(roomId, 10);
              const roomObj =
                rooms.find((r) => r.id === numericId) ||
                { id: numericId, name: `Room #${roomId}` };

              const itemArray = itemsByRoom[roomId] || [];
              return (
                <div key={`room-${roomId}`} className={styles.room}>
                  <div className={styles.roomNameWrapper}>
                    <h3 className={styles.roomName}>{roomObj.name}</h3>
                  </div>
                  <ul className={styles.itemList}>
                    {itemArray.map((inst) => (
                      <ItemCard
                        key={inst.id}
                        id={inst.id}
                        item={inst}
                        tags={inst.tags}
                        isSelected={
                          !!currentTag && inst.tags.includes(currentTag)
                        }
                        onItemClick={() => handleItemClick(roomId, inst.id)}
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
