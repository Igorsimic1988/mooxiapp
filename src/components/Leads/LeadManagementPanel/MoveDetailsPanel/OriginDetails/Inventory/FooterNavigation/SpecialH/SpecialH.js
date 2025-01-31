import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import styles from "./SpecialH.module.css";
import ItemCard from './ItemCard/ItemCard';

import { ReactComponent as SpecialHPopupIcon } from "../../../../../../../../assets/icons/SpecialHPopupIcon.svg";
import { ReactComponent as CloseIcon } from "../../../../../../../../assets/icons/Close.svg";

import { generateGroupingKey } from '../../utils/generateGroupingKey';
import CustomSelect from './CustomSelect/CustomSelect';
import { optionsData } from '../../../../../../../../data/constants/optionsData';
import rooms from '../../../../../../../../data/constants/AllRoomsList';

// Example incompatible + required tags
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

function SpecialH({
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

  // Main selection: itemTags | locationTags
  const [selectedOption, setSelectedOption] = useState("itemTags"); 
  // Sub-option
  const [selectedSubOption, setSelectedSubOption] = useState("packing"); 
  // Current tag to apply/remove
  const [currentTag, setCurrentTag] = useState('');

  // Radiobutton for main selection
  const mainOptions = [
    { value: 'itemTags', label: 'Item Tags' },
    { value: 'locationTags', label: 'Location Tags' },
  ];

  // When main option changes => reset sub-option
  useEffect(() => {
    if (selectedOption === 'itemTags') {
      setSelectedSubOption('packing');
    } else {
      setSelectedSubOption('loadPoints');
    }
  }, [selectedOption]);

  // Derive the array of possible tags from `optionsData`
  const furtherOptions = useMemo(() => {
    if (!optionsData[selectedOption]) return [];
    const subObj = optionsData[selectedOption][selectedSubOption];
    return Array.isArray(subObj) ? subObj : [];
  }, [selectedOption, selectedSubOption]);

  // Pick first tag from the derived array
  useEffect(() => {
    if (furtherOptions.length > 0) {
      setCurrentTag(furtherOptions[0].value);
    } else {
      setCurrentTag('');
    }
  }, [furtherOptions]);

  // Tag selection
  const handleTagSelect = (tagValue) => {
    setCurrentTag(tagValue);
  };

  // Clicking an item => toggle the `currentTag`
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
            // If removing 'excluded', nothing special
          } else {
            // Add the tag
            newTags.push(currentTag);

            // If adding 'excluded', remove everything except 'pack_and_leave_behind'
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
                if (!newTags.includes(reqT)) newTags.push(reqT);
              });

              // If item_for_company_storage => possibly add keep_blanket_on, etc
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

  // Close popup if clicked outside
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

        {/* Main radio group */}
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

        {/* Sub-options */}
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

        {/* CustomSelect for the final set of options */}
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

        {/* List items for each displayed room that has items */}
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
              if (a === '13') return 1;
              if (b === '13') return -1;
              return parseInt(a) - parseInt(b);
            })
            .map((roomId) => {
              const numericId = parseInt(roomId, 10);
              const roomObj = rooms.find((r) => r.id === numericId) || {
                id: numericId,
                name: `Room #${roomId}`
              };

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
