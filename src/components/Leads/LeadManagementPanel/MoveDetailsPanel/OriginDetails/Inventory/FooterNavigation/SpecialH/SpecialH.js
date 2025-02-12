import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import styles from "./SpecialH.module.css";
import ItemCard from './ItemCard/ItemCard';

import { ReactComponent as SpecialHPopupIcon } from "../../../../../../../../assets/icons/SpecialHPopupIcon.svg";
import { ReactComponent as CloseIcon } from "../../../../../../../../assets/icons/Close.svg";

import { generateGroupingKey } from '../../utils/generateGroupingKey';
import CustomSelect from './CustomSelect/CustomSelect';
import { optionsData } from '../../../../../../../../data/constants/optionsData';
import rooms from '../../../../../../../../data/constants/AllRoomsList';

// Incompatible + required tags logic (unchanged)
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
 * Convert lead’s "label" into the “value” used in optionsData:
 * e.g.  "Main Drop off" => "main_drop_off",
 *       "Drop off 2" => "2_drop",
 *       "Post Storage Drop off 3" => "post_storage_3_drop"
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

  // fallback => just a simple slug
  return trimmed.replace(/\s+/g, '_').replace(/[^\w_]/g, '');
}

function SpecialH({
  // We still assume you pass in the entire lead, so we can see lead.destinationStops
  lead, 
  setIsSpecialHVisible,
  roomItemSelections = {},
  setRoomItemSelections,
  selectedRoom,
  displayedRooms = [],
}) {
  const handleClose = useCallback(() => {
    setIsSpecialHVisible(false);
  }, [setIsSpecialHVisible]);

  const popupContentRef = useRef(null);

  // Main selection => "itemTags" or "locationTags"
  const [selectedOption, setSelectedOption] = useState("itemTags");
  // Sub‐option => "packing" / "extraAttention" (for itemTags) or "loadPoints" / "dropPoints" (for locationTags)
  const [selectedSubOption, setSelectedSubOption] = useState("packing");
  // The current tag to apply/remove
  const [currentTag, setCurrentTag] = useState('');

  // Radiobutton options
  const mainOptions = [
    { value: 'itemTags', label: 'Item Tags' },
    { value: 'locationTags', label: 'Location Tags' },
  ];

  // If user changes to itemTags => reset subOption to "packing"; locationTags => "loadPoints"
  useEffect(() => {
    if (selectedOption === 'itemTags') {
      setSelectedSubOption('packing');
    } else {
      setSelectedSubOption('loadPoints');
    }
  }, [selectedOption]);

  // =============== Compute the locationTags.dropPoints based on lead data ===============
  // 1. We start with the entire array from `optionsData.locationTags.dropPoints`
  const allDropPoints = optionsData.locationTags.dropPoints; 
  // 2. The "base ones" we always keep visible:
  const baseAlwaysVisible = [
    'disposal',
    'item_for_company_storage',
    'help_with_unloading',
    'hoisting_destination',
    'crane_destination',
  ];
  // 3. The "destination-based" ones we only show if there are >=2 active stops
  //    and the label matches. 
  const activeStops = lead?.destinationStops?.filter(s => s.isActive) || [];
  const hasMultipleActiveStops = activeStops.length >= 2;

  // Build a set of "active" values for those 2+ stops
  const activeStopValues = new Set(); 
  if (hasMultipleActiveStops) {
    activeStops.forEach(stop => {
      const dropVal = labelToDropTag(stop.label); 
      activeStopValues.add(dropVal);
    });
  }

  // 4. The final "filteredDropPoints" that we’ll place in the code below
  const fullyFilteredDropPoints = allDropPoints.filter(dp => {
    // If dp.value is in baseAlwaysVisible => always keep it
    if (baseAlwaysVisible.includes(dp.value)) {
      return true;
    }
    // else only keep it if we have multiple active stops
    // AND dp.value is in activeStopValues
    if (hasMultipleActiveStops && activeStopValues.has(dp.value)) {
      return true;
    }
    return false;
  });
  // =============== End dynamic dropPoints ===============

  // Now let's produce the correct array for the "furtherOptions" based on selectedOption + subOption
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
      // Return the filtered array we built above
      return fullyFilteredDropPoints;
    }
    return [];
  }, [selectedOption, selectedSubOption, fullyFilteredDropPoints]);

  // ========= Only reset currentTag if it's invalid in the new array =========
  useEffect(() => {
    if (furtherOptions.length > 0) {
      // Check if currentTag is still valid among furtherOptions
      const stillValid = furtherOptions.some(opt => opt.value === currentTag);
      if (!stillValid) {
        // If user-chosen tag is no longer in furtherOptions, default to first item
        setCurrentTag(furtherOptions[0].value);
      }
    } else {
      // If no furtherOptions, clear out currentTag
      setCurrentTag('');
    }
  }, [furtherOptions, currentTag]);
  // ==========================================================================

  // Handler for the final dropdown
  const handleTagSelect = (tagValue) => {
    setCurrentTag(tagValue);
  };

  // Clicking an item => toggle the currentTag
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
          const hasTag = newTags.includes(currentTag);

          if (hasTag) {
            // Remove it
            newTags = newTags.filter((t) => t !== currentTag);
          } else {
            // Add the tag
            newTags.push(currentTag);

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
              // and there's already some protective tag => add keep_blanket_on
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

          // Rebuild instance
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

  // Close popup if user clicks outside
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
            <SpecialHPopupIcon className={styles.icon} />
            <p>Special Handling</p>
          </div>
          <div className={styles.closeButton}>
            <button onClick={handleClose} aria-label="Close">
              <CloseIcon className={styles.closeIcon} />
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

        {/* The items for each displayed room */}
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
              // Put '13' (Boxes) at end, if you prefer
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
                <div key={`room-${roomId}`} className={styles.room}>
                  <div className={styles.roomNameWrapper}>
                    <h3 className={styles.roomName}>{roomObj.name}</h3>
                  </div>
                  <ul className={styles.itemList}>
                    {itemArray.map((inst) => (
                      <ItemCard
                        key={inst.id}
                        id={inst.id}
                        item={inst.item}
                        tags={inst.tags}
                        isSelected={!!currentTag && inst.tags.includes(currentTag)}
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
