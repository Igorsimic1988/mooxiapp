"use client";

import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import styles from "./SpecialH.module.css";
import ItemCard from './ItemCard/ItemCard';
import Icon from 'src/app/components/Icon';
import { generateGroupingKey } from '../../utils/generateGroupingKey';
import CustomSelect from './CustomSelect/CustomSelect';
import { optionsData } from '../../../../../../../../data/constants/optionsData';
import rooms from '../../../../../../../../data/constants/AllRoomsList';
import { labelToDropTag, EXCLUSIVE_LOCATION_TAGS, BASE_INCOMPATIBLE_TAGS, REQUIRED_TAGS } from '../../utils/tagsRules';

// If these aren't exported from tagsRules, define them here
const incompatibleTags = BASE_INCOMPATIBLE_TAGS || {
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

const requiredTags = REQUIRED_TAGS || {
  crating: ['cp_packed_by_movers'],
};

function SpecialH({
  lead,
  setIsSpecialHVisible,
  roomItemSelections = {},  // Individual items approach
  setRoomItemSelections,    // Individual items approach
  displayedRooms = [],
  selectedRoom,
  
}) {
  // Close handler
  const handleClose = useCallback(() => {
    setIsSpecialHVisible(false);
  }, [setIsSpecialHVisible]);

  // Ref for popup content
  const popupContentRef = useRef(null);

  // Scroll current room into view when popup opens
  useEffect(() => {
    if (popupContentRef.current && selectedRoom) {
      const el = popupContentRef.current.querySelector(`[data-room-id="${selectedRoom.id}"]`);
      if (el) {
        el.scrollIntoView({ block: 'start', behavior: 'auto' });
      }
    }
  }, [selectedRoom]);

  // Main tag selection state
  const [selectedOption, setSelectedOption] = useState("itemTags");
  const [selectedSubOption, setSelectedSubOption] = useState("packing");
  const [currentTag, setCurrentTag] = useState('');

  // Main radio options
  const mainOptions = [
    { value: 'itemTags', label: 'Item Tags' },
    { value: 'locationTags', label: 'Location Tags' },
  ];

  // Reset sub-option when main changes
  useEffect(() => {
    if (selectedOption === 'itemTags') {
      setSelectedSubOption('packing');
    } else {
      setSelectedSubOption('loadPoints');
    }
  }, [selectedOption]);

  // Build dynamic dropPoints list based on lead stops
  const allDropPoints = optionsData.locationTags.dropPoints;
  const baseAlwaysVisible = [
    'disposal',
    'item_for_company_storage',
    'help_with_unloading',
    'hoisting_destination',
    'crane_destination',
  ];

  const destinationStops = lead?.destinations || lead?.destinationStops || [];
  const postStorageStops = destinationStops.filter(s => s.postStorage);
  const normalStops = destinationStops.filter(s => !s.postStorage);
  const activeStops = destinationStops.filter(s => s.isActive && (s.isVisible ?? true));
  const hasMultipleActiveStops = activeStops.length >= 2;
  const activeStopValues = new Set();

  if (hasMultipleActiveStops) {
    activeStops.forEach(stop => {
      const group = stop.postStorage ? postStorageStops : normalStops;
      const idx = group.indexOf(stop);
      const isFirst = idx === 0;
      const label = stop.postStorage
        ? (isFirst ? "Post Storage Main Drop off" : `Post Storage Drop off ${idx + 1}`)
        : (isFirst ? "Main Drop off" : `Drop off ${idx + 1}`);
      activeStopValues.add(labelToDropTag(label));
    });
  }

  const fullyFilteredDropPoints = allDropPoints.filter(dp => {
    if (baseAlwaysVisible.includes(dp.value)) return true;
    if (hasMultipleActiveStops && activeStopValues.has(dp.value)) return true;
    return false;
  });

  // Determine which tag options to show
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

  // Ensure currentTag remains valid
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

  // Tag select handler
  const handleTagSelect = (tagValue) => {
    setCurrentTag(tagValue);
  };

  // Handle item click - toggle tag on individual item instance
  const handleItemClick = (roomId, itemId) => {
    if (!currentTag) {
      alert("Please select a tag from the dropdown before assigning.");
      return;
    }

    setRoomItemSelections((prev) => {
      const copy = { ...prev };
      const itemsInRoom = Array.isArray(copy[roomId]) ? [...copy[roomId]] : [];
      const newItems = itemsInRoom.map((inst) => {
        if (inst.id === itemId) {
          let newTags = Array.isArray(inst.tags) ? [...inst.tags] : [];
          const alreadyHas = newTags.includes(currentTag);

          if (alreadyHas) {
            // Remove it
            newTags = newTags.filter((t) => t !== currentTag);
          } else {
            // Add the new tag
            newTags.push(currentTag);

            // ========== EXCLUSIVE TAGS LOGIC ==========
            if (EXCLUSIVE_LOCATION_TAGS.includes(currentTag)) {
              // remove all other exclusive ones from newTags
              newTags = newTags.filter(t => {
                if (t === currentTag) return true; // keep the newly added one
                // remove if it's in EXCLUSIVE_LOCATION_TAGS
                if (EXCLUSIVE_LOCATION_TAGS.includes(t)) return false;
                return true;
              });
            }
            // ==========================================

            // If "excluded" => remove all except 'excluded' or 'pack_and_leave_behind'
            if (currentTag === 'excluded') {
              newTags = newTags.filter(
                (t) => t === 'excluded' || t === 'pack_and_leave_behind'
              );
            } else {
              // remove incompatible
              const incomp = incompatibleTags[currentTag] || [];
              newTags = newTags.filter((t) => !incomp.includes(t));

              // add required
              const reqs = requiredTags[currentTag] || [];
              reqs.forEach((reqT) => {
                if (!newTags.includes(reqT)) {
                  newTags.push(reqT);
                }
              });

              // e.g. if user picks 'item_for_company_storage'
              // and there's a protective tag => add keep_blanket_on
              if (currentTag === 'item_for_company_storage') {
                const protectiveTags = [
                  'blanket_wrapped',
                  'paper_blanket_wrapped',
                  'purchased_blankets',
                ];
                const hasProtective = newTags.some((t) =>
                  protectiveTags.includes(t)
                );
                if (hasProtective && !newTags.includes('keep_blanket_on')) {
                  newTags.push('keep_blanket_on');
                }
              }
            }
          }

          // Rebuild instance with new tags
          const updated = {
            ...inst,
            tags: newTags,
          };
          updated.groupingKey = generateGroupingKey(updated);
          return updated;
        }
        return inst;
      });

      copy[roomId] = newItems;
      return copy;
    });
  };

  // Close on outside click
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
            <Icon name="SpecialHPopupIcon" className={styles.icon} />
            <p>Special Handling</p>
          </div>
          <div className={styles.closeButton}>
            <button onClick={handleClose} aria-label="Close">
              <Icon name="Close" width={20} height={20} className={styles.closeIcon} />
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
          {Object.keys(roomItemSelections)
            .filter((roomId) => {
              const numericId = parseInt(roomId, 10);
              return (
                displayedRooms.includes(numericId) &&
                Array.isArray(roomItemSelections[roomId]) &&
                roomItemSelections[roomId].length > 0
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

              const itemArray = roomItemSelections[roomId] || [];
              return (
                <div key={`room-${roomId}`} data-room-id={numericId} className={styles.room}>
                  <div className={styles.roomNameWrapper}>
                    <h3 className={styles.roomName}>{roomObj.name}</h3>
                  </div>
                  <ul className={styles.itemList}>
                    {itemArray.map((inst) => (
                      <ItemCard
                        key={inst.id}
                        id={inst.id}
                        item={inst.item || inst}
                        name={inst.name || inst.item?.name}
                        imageName={inst.imageName || inst.item?.imageName}
                        tags={inst.tags}
                        isSelected={
                          !!currentTag && inst.tags?.includes(currentTag)
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