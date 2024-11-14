// src/components/Inventory/ItemSelection/Item/ItemPopup.js

import React, { useEffect, useState } from 'react';
import styles from './ItemPopup.module.css';
import { ReactComponent as CloseIcon } from '../../../../../assets/icons/Close.svg';
import { ReactComponent as CameraIcon } from '../../../../../assets/icons/cameraroll.svg';
import { ReactComponent as UploadIcon } from '../../../../../assets/icons/upload.svg';
import { ReactComponent as LinkIcon } from '../../../../../assets/icons/pastelink.svg';
import { optionsData } from '../../../../../data/constants/optionsData';
import Select, { components } from 'react-select';
import { v4 as uuidv4 } from 'uuid';
import packingOptions from '../../../../../data/constants/packingOptions';

// Custom Input component to prevent mobile keyboard from opening
const CustomInput = (props) => {
  return <components.Input {...props} readOnly />;
};

// Custom MultiValue component to display counts
const MultiValue = (props) => {
  const { data } = props;
  return (
    <components.MultiValue {...props}>
      <span>{`${data.name} (${data.count})`}</span>
    </components.MultiValue>
  );
};

function ItemPopup({ item, onClose, onUpdateItem, onAddItem, itemInstance }) {
  // Define generateGroupingKey inside the component
  const generateGroupingKey = (instance) => {
    const tagsKey = instance.tags.sort().join(',');
    const notesKey = instance.notes || '';
    const cuftKey = instance.cuft || '';
    const lbsKey = instance.lbs || '';
    const packingNeedsEntries = Object.entries(instance.packingNeedsCounts || {}).sort();
    const packingNeedsKey = packingNeedsEntries
      .map(([key, value]) => `${key}:${value}`)
      .join(',');

    return `${instance.itemId}-${tagsKey}-${notesKey}-${cuftKey}-${lbsKey}-${packingNeedsKey}`;
  };

  // Initialize local state for itemInstance
  const [currentItemInstance, setCurrentItemInstance] = useState(itemInstance);

  // State to manage selected options
  const [selectedPackingTags, setSelectedPackingTags] = useState([]);
  const [extraAttentionOptions, setExtraAttentionOptions] = useState([]);
  const [loadPointsOptions, setloadPointsOptions] = useState([]);
  const [dropPointsOptions, setDropPointsOptions] = useState([]);
  const [cuft, setCuft] = useState('');
  const [lbs, setLbs] = useState('');

  // State for item count and notes
  const [itemCount, setItemCount] = useState(1);
  const [notes, setNotes] = useState('');

  // Animation state variables
  const [isSlidingOut, setIsSlidingOut] = useState(false);
  const [isSlidingIn, setIsSlidingIn] = useState(false);

  // State for packing needs counts
  const [packingNeedsCounts, setPackingNeedsCounts] = useState({});

  // Convert packingNeedsCounts to array for Select component
  const selectedPackingNeeds = Object.keys(packingNeedsCounts).map((key) => {
    const option = packingOptions.find((opt) => opt.value === key);
    return {
      value: key,
      name: option ? option.name : key, // Include 'name' property
      count: packingNeedsCounts[key],
    };
  });

  // Custom className prefix for react-select
  const selectClassNamePrefix = 'custom-select';

  // Initialize the selected options based on the currentItemInstance's tags and packing needs
  useEffect(() => {
    if (currentItemInstance && currentItemInstance.tags) {
      // Initialize selected options based on currentItemInstance's tags
      const allOptions = [
        ...optionsData.itemTags.packing,
        ...optionsData.itemTags.extraAttention,
        ...optionsData.locationTags.loadPoints,
        ...optionsData.locationTags.dropPoints,
      ];

      const selectedOptions = currentItemInstance.tags
        .map((tag) => allOptions.find((opt) => opt.value === tag))
        .filter(Boolean);

      setSelectedPackingTags(
        selectedOptions.filter((opt) =>
          optionsData.itemTags.packing.some((o) => o.value === opt.value)
        )
      );
      setExtraAttentionOptions(
        selectedOptions.filter((opt) =>
          optionsData.itemTags.extraAttention.some((o) => o.value === opt.value)
        )
      );
      setloadPointsOptions(
        selectedOptions.filter((opt) =>
          optionsData.locationTags.loadPoints.some((o) => o.value === opt.value)
        )
      );
      setDropPointsOptions(
        selectedOptions.filter((opt) =>
          optionsData.locationTags.dropPoints.some((o) => o.value === opt.value)
        )
      );
    } else if (item.tags && item.tags.length > 0) {
      // Initialize selected options from item's default tags
      const allOptions = [
        ...optionsData.itemTags.packing,
        ...optionsData.itemTags.extraAttention,
        ...optionsData.locationTags.loadPoints,
        ...optionsData.locationTags.dropPoints,
      ];

      const selectedOptions = item.tags
        .map((tag) => allOptions.find((opt) => opt.value === tag))
        .filter(Boolean);

      setSelectedPackingTags(
        selectedOptions.filter((opt) =>
          optionsData.itemTags.packing.some((o) => o.value === opt.value)
        )
      );
      setExtraAttentionOptions(
        selectedOptions.filter((opt) =>
          optionsData.itemTags.extraAttention.some((o) => o.value === opt.value)
        )
      );
      setloadPointsOptions(
        selectedOptions.filter((opt) =>
          optionsData.locationTags.loadPoints.some((o) => o.value === opt.value)
        )
      );
      setDropPointsOptions(
        selectedOptions.filter((opt) =>
          optionsData.locationTags.dropPoints.some((o) => o.value === opt.value)
        )
      );
    } else {
      // Reset options if no currentItemInstance or item tags
      setSelectedPackingTags([]);
      setExtraAttentionOptions([]);
      setloadPointsOptions([]);
      setDropPointsOptions([]);
    }

    // Initialize packing needs counts
    if (currentItemInstance && currentItemInstance.packingNeedsCounts) {
      setPackingNeedsCounts(currentItemInstance.packingNeedsCounts);
    } else if (item.packing && item.packing.length > 0) {
      // Initialize packingNeedsCounts from item's default packing
      const counts = {};
      item.packing.forEach((pack) => {
        counts[pack.type] = pack.quantity;
      });
      setPackingNeedsCounts(counts);
    } else {
      setPackingNeedsCounts({});
    }

    // Initialize other fields
    setCuft(currentItemInstance?.cuft || item.cuft || '');
    setLbs(currentItemInstance?.lbs || item.lbs || '');
    setItemCount(
      currentItemInstance?.count !== undefined ? currentItemInstance.count : 1
    );
    setNotes(currentItemInstance?.notes || '');
  }, [currentItemInstance, item]);

  const handleCuftChange = (e) => {
    setCuft(e.target.value);
  };

  const handleLbsChange = (e) => {
    setLbs(e.target.value);
  };

  // Define incompatible and required tags
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
    // Add any other incompatible tags here
  };

  const requiredTags = {
    crating: ['cp_packed_by_movers'],
    // Add any other required tags here
  };

  // Combine all selected tags into one array
  const getAllSelectedTags = () => {
    return [
      ...selectedPackingTags.map((opt) => opt.value),
      ...extraAttentionOptions.map((opt) => opt.value),
      ...loadPointsOptions.map((opt) => opt.value),
      ...dropPointsOptions.map((opt) => opt.value),
    ];
  };

  // Function to handle tag selection changes with incompatible and required tags logic
  const handleTagChange = (selectedOptions, setOptions) => {
    let updatedOptions = selectedOptions || [];
    let allSelectedTags = getAllSelectedTags();

    // Get the newly added or removed tag
    const lastChangedTag =
      updatedOptions.length > allSelectedTags.length
        ? updatedOptions.find((opt) => !allSelectedTags.includes(opt.value))
        : allSelectedTags.find(
            (tag) => !updatedOptions.map((opt) => opt.value).includes(tag)
          );

    if (!lastChangedTag) {
      setOptions(updatedOptions);
      return;
    }

    const tagValue = lastChangedTag.value;

    // Handle incompatible tags
    const incompatible = incompatibleTags[tagValue] || [];
    if (updatedOptions.length > allSelectedTags.length) {
      // Tag was added
      // Remove incompatible tags from other categories
      setSelectedPackingTags((prev) =>
        prev.filter((opt) => !incompatible.includes(opt.value))
      );
      setExtraAttentionOptions((prev) =>
        prev.filter((opt) => !incompatible.includes(opt.value))
      );
      setloadPointsOptions((prev) =>
        prev.filter((opt) => !incompatible.includes(opt.value))
      );
      setDropPointsOptions((prev) =>
        prev.filter((opt) => !incompatible.includes(opt.value))
      );

      // Add required tags
      const required = requiredTags[tagValue] || [];
      required.forEach((reqTagValue) => {
        const reqOption = findOptionByValue(reqTagValue);
        if (reqOption && !updatedOptions.find((opt) => opt.value === reqTagValue)) {
          updatedOptions.push(reqOption);
        }
      });
    }

    setOptions(updatedOptions);
  };

  // Helper function to find option by value across all categories
  const findOptionByValue = (value) => {
    const allOptions = [
      ...optionsData.itemTags.packing,
      ...optionsData.itemTags.extraAttention,
      ...optionsData.locationTags.loadPoints,
      ...optionsData.locationTags.dropPoints,
    ];
    return allOptions.find((opt) => opt.value === value);
  };

  // Function to handle packing needs change
  const handlePackingNeedsChange = (selectedOptions, actionMeta) => {
    if (actionMeta.action === 'select-option' && actionMeta.option) {
      const selectedOption = actionMeta.option;
      setPackingNeedsCounts((prevCounts) => ({
        ...prevCounts,
        [selectedOption.value]: (prevCounts[selectedOption.value] || 0) + 1,
      }));
    } else if (actionMeta.action === 'remove-value' && actionMeta.removedValue) {
      const removedOption = actionMeta.removedValue;
      handleRemovePackingNeed(removedOption);
    } else if (actionMeta.action === 'clear') {
      setPackingNeedsCounts({});
    }
  };

  // Function to remove a packing need
  const handleRemovePackingNeed = (option) => {
    setPackingNeedsCounts((prevCounts) => {
      const newCounts = { ...prevCounts };
      if (newCounts[option.value] > 1) {
        newCounts[option.value] -= 1;
      } else {
        delete newCounts[option.value];
      }
      return newCounts;
    });
  };

  // Function to handle saving the item
  const handleSaveItem = () => {
    // Collect all selected tags
    const selectedTags = getAllSelectedTags();
  
    // Create updated item instance
    const updatedItemInstance = {
      id: currentItemInstance ? currentItemInstance.id : uuidv4(),
      itemId: item.id.toString(),
      item: { ...item },
      tags: selectedTags,
      count: itemCount,
      notes: notes,
      cuft: cuft,
      lbs: lbs,
      packingNeedsCounts: packingNeedsCounts,
    };
  
    // Generate and store the new groupingKey
    updatedItemInstance.groupingKey = generateGroupingKey(updatedItemInstance);
  
    if (currentItemInstance) {
      // We're updating an existing item
      onUpdateItem(updatedItemInstance, currentItemInstance);
    } else {
      // We're adding a new item
      onAddItem(updatedItemInstance);
    }
  
    // Update the currentItemInstance state to reflect the changes
    setCurrentItemInstance(updatedItemInstance);
  };

  

  // Handlers for item count
  const handleIncrement = () => {
    setItemCount((prevCount) => prevCount + 1);
  };

  const handleDecrement = () => {
    setItemCount((prevCount) => (prevCount > 0 ? prevCount - 1 : 0));
  };

  const handleCountChange = (e) => {
    const value = parseInt(e.target.value, 10);
    setItemCount(value >= 0 ? value : 0);
  };

  // Handler for notes
  const handleNotesChange = (e) => {
    setNotes(e.target.value);
  };

  // Custom styles for react-select
  const customSelectStyles = {
    multiValueRemove: (base) => ({
      ...base,
      fontSize: '1.2rem',
      padding: '4px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      cursor: 'pointer',
    }),
    multiValueLabel: (base) => ({
      ...base,
      fontSize: '1rem',
      padding: '0 8px',
    }),
    option: (base, state) => ({
      ...base,
      color: state.isDisabled ? '#ccc' : '#000',
    }),
  };

  // Function to disable incompatible options
  const filterOptions = (options, selectedTags) => {
    return options.map((option) => {
      const isIncompatible = selectedTags.some((tag) => {
        const incompatible = incompatibleTags[tag] || [];
        return incompatible.includes(option.value);
      });
      return {
        ...option,
        isDisabled: isIncompatible,
      };
    });
  };

  // Prepare options with disabled incompatible options
  const allSelectedTags = getAllSelectedTags();

  const filteredPackingOptions = filterOptions(
    optionsData.itemTags.packing,
    allSelectedTags
  );
  const filteredExtraAttentionOptions = filterOptions(
    optionsData.itemTags.extraAttention,
    allSelectedTags
  );
  const filteredloadPointsOptions = filterOptions(
    optionsData.locationTags.loadPoints,
    allSelectedTags
  );
  const filteredDropPointsOptions = filterOptions(
    optionsData.locationTags.dropPoints,
    allSelectedTags
  );

  // Determine if 'cp_packed_by_movers' is selected
  const isCpPackedByMoversSelected = selectedPackingTags.some(
    (tag) => tag.value === 'cp_packed_by_movers'
  );

  // Handle the "Start Fresh as New Item" functionality
  const handleStartFreshClick = () => {
    setIsSlidingOut(true);
  };



  // Handle the slide-out animation completion
  useEffect(() => {
    let timer;
    if (isSlidingOut) {
      timer = setTimeout(() => {
        setCurrentItemInstance(null);
        setIsSlidingOut(false);
        setIsSlidingIn(true);
      }, 300); // Match the animation duration
    }
    return () => clearTimeout(timer);
  }, [isSlidingOut]);

  // Handle the slide-in animation completion
  useEffect(() => {
    let timer;
    if (isSlidingIn) {
      timer = setTimeout(() => {
        setIsSlidingIn(false);
      }, 300); // Match the animation duration
    }
    return () => clearTimeout(timer);
  }, [isSlidingIn]);

  return (
    <div className={styles.popup} onClick={onClose}>
  <div
    className={`${styles.popupContent} ${isSlidingOut ? styles.slideOut : ''} ${
      isSlidingIn ? styles.slideIn : ''
    }`}
    onClick={(e) => e.stopPropagation()}
  >
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

        {/* Scrollable Content */}
        <div className={styles.content}>
          {/* Item Group */}
          <div className={styles.itemGroup}>
            <div className={styles.furnitureOutline}>
              <div className={styles.furnitureWrapper}>
                <img src={item.src} alt={item.name} className={styles.itemImage} />
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
                    min="0"
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
                  value={cuft}
                  onChange={handleCuftChange}
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
                  value={lbs}
                  onChange={handleLbsChange}
                  className={`${styles.inputField} ${styles.inputNumberField}`}
                  aria-label="Lbs"
                />
              </div>
            </div>
          </div>

          <div
            className={`${styles.inputGroup} ${styles.fullWidth} ${styles.notesInputGroup}`}
          >
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
              <input type="file" accept="image/*" className={styles.hiddenInput} />
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
                classNamePrefix={selectClassNamePrefix}
                name="packing"
                options={filteredPackingOptions}
                placeholder="Packing"
                value={selectedPackingTags}
                onChange={(selectedOptions) =>
                  handleTagChange(selectedOptions, setSelectedPackingTags)
                }
                aria-label="Item Tags - Packing"
                components={{ Input: CustomInput }}
                styles={customSelectStyles}
                isOptionDisabled={(option) => option.isDisabled}
              />
            </div>
            <div className={styles.inputGroup}>
              <Select
                isMulti
                isClearable={false} // Remove 'Clear All' button
                className={styles.selectInput}
                classNamePrefix={selectClassNamePrefix}
                name="extraAttention"
                options={filteredExtraAttentionOptions}
                placeholder="Extra Attention"
                value={extraAttentionOptions}
                onChange={(selectedOptions) =>
                  handleTagChange(selectedOptions, setExtraAttentionOptions)
                }
                aria-label="Item Tags - Extra Attention"
                components={{ Input: CustomInput }}
                styles={customSelectStyles}
                isOptionDisabled={(option) => option.isDisabled}
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
                classNamePrefix={selectClassNamePrefix}
                name="loadPoints"
                options={filteredloadPointsOptions}
                placeholder="Load Points"
                value={loadPointsOptions}
                onChange={(selectedOptions) =>
                  handleTagChange(selectedOptions, setloadPointsOptions)
                }
                aria-label="Location Tags - loadPoints"
                components={{ Input: CustomInput }}
                styles={customSelectStyles}
                isOptionDisabled={(option) => option.isDisabled}
              />
            </div>
            <div className={styles.inputGroup}>
              <Select
                isMulti
                isClearable={false} // Remove 'Clear All' button
                className={styles.selectInput}
                classNamePrefix={selectClassNamePrefix}
                name="dropPoints"
                options={filteredDropPointsOptions}
                placeholder="Drop Points"
                value={dropPointsOptions}
                onChange={(selectedOptions) =>
                  handleTagChange(selectedOptions, setDropPointsOptions)
                }
                aria-label="Location Tags - Drop Points"
                components={{ Input: CustomInput }}
                styles={customSelectStyles}
                isOptionDisabled={(option) => option.isDisabled}
              />
            </div>
          </div>

          {/* Informational Message */}
          {!isCpPackedByMoversSelected && (
            <div className={styles.infoMessage}>
              <p>Select 'CP Packed by Movers' to specify packing materials.</p>
            </div>
          )}

          {/* Packing Needs Section */}
          {isCpPackedByMoversSelected && (
            <div className={styles.section}>
              <p className={styles.sectionLabel}>Packing Needs</p>
              <div className={styles.inputGroup}>
                <Select
                  isMulti
                  isClearable
                  className={styles.selectInput}
                  classNamePrefix={selectClassNamePrefix}
                  name="packingNeeds"
                  options={packingOptions}
                  placeholder="Select Packing Needs"
                  value={selectedPackingNeeds}
                  onChange={handlePackingNeedsChange}
                  aria-label="Packing Needs"
                  getOptionLabel={(option) => option.name} // Use 'name' for labels
                  getOptionValue={(option) => option.value}
                  components={{
                    DropdownIndicator: () => null,
                    IndicatorSeparator: () => null,
                    MultiValue,
                    Input: CustomInput,
                  }}
                  styles={customSelectStyles}
                  hideSelectedOptions={false}
                  isOptionSelected={() => false}
                  formatOptionLabel={(option, { context }) =>
                    context === 'value' ? option.name : option.name
                  }
                />
              </div>
            </div>
          )}
        </div>

        {/* Save and Start Fresh Buttons */}
        <div className={styles.saveButtonContainer}>
  <button
    className={styles.saveButton}
    onClick={(e) => {
      e.stopPropagation(); // Prevent the click from reaching the overlay
      handleSaveItem();    // Save the item without closing the popup
    }}
  >
            Save
          </button>
          <button className={styles.newItemButton} onClick={handleStartFreshClick}>
            Start Fresh as New Item
          </button>
        </div>
      </div>
    </div>
  );
}

export default ItemPopup;
