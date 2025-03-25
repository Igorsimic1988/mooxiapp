"use client";

import React, { useEffect, useState, useRef, useCallback } from 'react';
import Image from "next/image";
import styles from './ItemPopup.module.css';
import { optionsData } from '../../../../../../../../../data/constants/optionsData';
import Select, { components as RSComponents } from 'react-select';
import { v4 as uuidv4 } from 'uuid';
import packingOptions from '../../../../../../../../../data/constants/packingOptions';
import { generateGroupingKey } from '../../../utils/generateGroupingKey';

import Icon from 'src/app/components/Icon';

/** 
 * ==============================================
 * HELPER COMPONENTS
 * ==============================================
 */

/** 
 * Custom Input component for react-select
 * to prevent the mobile keyboard from appearing (read‐only).
 */
const CustomInput = (props) => {
  return <RSComponents.Input {...props} readOnly />;
};

/** 
 * A custom MultiValue display to show packing counts, e.g. “Tape (3)”.
 */
const MultiValue = (props) => {
  const { data } = props;
  return (
    <RSComponents.MultiValue {...props}>
      <span>{`${data.name} (${data.count})`}</span>
    </RSComponents.MultiValue>
  );
};

/** 
 * ==============================================
 * CONSTANTS OUTSIDE THE COMPONENT
 * ==============================================
 */

/**
 * 1) Build a big array of location tags that must be mutually exclusive
 *    (only one among them can be selected).
 */
const EXCLUSIVE_LOCATION_TAGS = [
  'disposal',
  'item_for_company_storage',
  'help_with_unloading',
  'hoisting_destination',
  'crane_destination',
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
 * This helper returns an object specifying that each tag
 * in EXCLUSIVE_LOCATION_TAGS is incompatible with all others in that list.
 */
function buildExclusiveIncompat(tagsArr) {
  const output = {};
  for (const tag of tagsArr) {
    output[tag] = tagsArr.filter((t) => t !== tag);
  }
  return output;
}
const LOCATION_EXCLUSIVES = buildExclusiveIncompat(EXCLUSIVE_LOCATION_TAGS);

/** 
 * The custom react-select styles
 */
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

/** 
 * Incompatible and required tags
 * We merge the location exclusives with our existing item-based pairs.
 */
const INCOMPATIBLE_TAGS = {
  // Existing item-based pairs:
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

  // All the location tags that are mutually exclusive:
  ...LOCATION_EXCLUSIVES,
};

const REQUIRED_TAGS = {
  crating: ['cp_packed_by_movers'],
};

/** 
 * Convert lead’s "label" (e.g. "Main Drop off", "Drop off 2")
 * into the dropPoint value (e.g. "main_drop_off", "2_drop").
 */
function labelToDropTag(labelString) {
  const trimmed = labelString.trim().toLowerCase();

  if (trimmed === 'main drop off') {
    return 'main_drop_off';
  }
  const dropXMatch = trimmed.match(/^drop off\s+(\d+)$/);
  if (dropXMatch) {
    return `${dropXMatch[1]}_drop`;
  }
  if (trimmed === 'post storage main drop off') {
    return 'post_storage_main_drop';
  }
  const psDropXMatch = trimmed.match(/^post storage drop off\s+(\d+)$/);
  if (psDropXMatch) {
    return `post_storage_${psDropXMatch[1]}_drop`;
  }
  return trimmed.replace(/\s+/g, '_').replace(/[^\w_]/g, '');
}

/**
 * ==============================================
 * ITEM POPUP COMPONENT
 * ==============================================
 */
function ItemPopup({
  item,
  onClose,
  onUpdateItem,
  onAddItem,
  itemInstance,
  lead, // pass this from the parent
}) {
  // The local copy of the item instance
  const [currentItemInstance, setCurrentItemInstance] = useState(itemInstance);
  const [isSaving, setIsSaving] = useState(false);

  // Tag states
  const [selectedPackingTags, setSelectedPackingTags] = useState([]);
  const [extraAttentionOptions, setExtraAttentionOptions] = useState([]);
  const [loadPointsOptions, setLoadPointsOptions] = useState([]);
  const [dropPointsOptions, setDropPointsOptions] = useState([]);

  // Basic fields
  const [cuft, setCuft] = useState('');
  const [lbs, setLbs] = useState('');
  const [itemCount, setItemCount] = useState(1);
  const [notes, setNotes] = useState('');

  // Animation states
  const [isSlidingOut, setIsSlidingOut] = useState(false);
  const [isSlidingIn, setIsSlidingIn] = useState(false);

  // Packing materials
  const [packingNeedsCounts, setPackingNeedsCounts] = useState({});

  // Images
  const [cameraImages, setCameraImages] = useState([]);
  const [uploadedImages, setUploadedImages] = useState([]);
  const [previewImage, setPreviewImage] = useState(null);
  const [isPreviewVisible, setIsPreviewVisible] = useState(false);

  // Link
  const [link, setLink] = useState('');
  const [isLinkOptionsVisible, setIsLinkOptionsVisible] = useState(false);
  const [isEditingLink, setIsEditingLink] = useState(false);
  const [linkInput, setLinkInput] = useState('');

  // Refs
  const linkRef = useRef(null);
  const linkOptionsRef = useRef(null);
  const linkInputRef = useRef(null);
  const uploadInputRef = useRef(null);
  const cameraInputRef = useRef(null);
  const imagePreviewModalRef = useRef(null);
  const deleteImageButtonRef = useRef(null);

  // Convert packingNeedsCounts => array for the react-select
  const selectedPackingNeeds = Object.keys(packingNeedsCounts).map((key) => {
    const foundOpt = packingOptions.find((o) => o.value === key);
    return {
      value: key,
      name: foundOpt ? foundOpt.name : key,
      count: packingNeedsCounts[key],
    };
  });

  // Class prefix for react-select styling
  const selectClassNamePrefix = 'custom-select';

  // =============== Dynamic DropPoints based on the Lead ===============
  const allDropPoints = optionsData.locationTags.dropPoints;
  const baseAlwaysVisible = [
    'disposal',
    'item_for_company_storage',
    'help_with_unloading',
    'hoisting_destination',
    'crane_destination',
  ];
  const activeStops = lead?.destinationStops?.filter((s) => s.isActive) || [];
  const hasMultipleActiveStops = activeStops.length >= 2;

  const activeStopValues = new Set();
  if (hasMultipleActiveStops) {
    activeStops.forEach((stop) => {
      const val = labelToDropTag(stop.label);
      activeStopValues.add(val);
    });
  }

  const dynamicDropPoints = allDropPoints.filter((dp) => {
    if (baseAlwaysVisible.includes(dp.value)) {
      return true;
    }
    if (hasMultipleActiveStops && activeStopValues.has(dp.value)) {
      return true;
    }
    return false;
  });
  // ===========================================================

  // Gather all selected tags from the 4 multi-select groups
  const getAllSelectedTags = useCallback(() => {
    return [
      ...selectedPackingTags.map((opt) => opt.value),
      ...extraAttentionOptions.map((opt) => opt.value),
      ...loadPointsOptions.map((opt) => opt.value),
      ...dropPointsOptions.map((opt) => opt.value),
    ];
  }, [
    selectedPackingTags,
    extraAttentionOptions,
    loadPointsOptions,
    dropPointsOptions,
  ]);

  // Initialize from either currentItemInstance or item
  useEffect(() => {
    const allOptions = [
      ...optionsData.itemTags.packing,
      ...optionsData.itemTags.extraAttention,
      ...optionsData.locationTags.loadPoints,
      ...optionsData.locationTags.dropPoints,
    ];

    // If we have existing tags from currentItemInstance
    if (currentItemInstance && currentItemInstance.tags) {
      const selectedOptions = currentItemInstance.tags
        .map((tg) => allOptions.find((o) => o.value === tg))
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
      setLoadPointsOptions(
        selectedOptions.filter((opt) =>
          optionsData.locationTags.loadPoints.some((o) => o.value === opt.value)
        )
      );
      setDropPointsOptions(
        selectedOptions.filter((opt) =>
          optionsData.locationTags.dropPoints.some((o) => o.value === opt.value)
        )
      );
    }
    // else if the "item" itself has default tags
    else if (item.tags && item.tags.length > 0) {
      const selectedOptions = item.tags
        .map((tg) => allOptions.find((o) => o.value === tg))
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
      setLoadPointsOptions(
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
      // if no tags => reset
      setSelectedPackingTags([]);
      setExtraAttentionOptions([]);
      setLoadPointsOptions([]);
      setDropPointsOptions([]);
    }

    // packingNeedsCounts
    if (currentItemInstance && currentItemInstance.packingNeedsCounts) {
      setPackingNeedsCounts(currentItemInstance.packingNeedsCounts);
    } else if (item.packing && item.packing.length > 0) {
      const counts = {};
      item.packing.forEach((pack) => {
        counts[pack.type] = pack.quantity;
      });
      setPackingNeedsCounts(counts);
    } else {
      setPackingNeedsCounts({});
    }

    // Basic fields
    setCuft(currentItemInstance?.cuft || item.cuft || '');
    setLbs(currentItemInstance?.lbs || item.lbs || '');
    setItemCount(
      currentItemInstance?.count !== undefined ? currentItemInstance.count : 1
    );
    setNotes(currentItemInstance?.notes || '');

    // Link
    setLink(currentItemInstance?.link || '');

    // Images
    setUploadedImages(currentItemInstance?.uploadedImages || []);
    setCameraImages(currentItemInstance?.cameraImages || []);
  }, [currentItemInstance, item]);

  // Handlers for cuft/lbs/notes
  const handleCuftChange = (e) => setCuft(e.target.value);
  const handleLbsChange = (e) => setLbs(e.target.value);
  const handleNotesChange = (e) => setNotes(e.target.value);

  // Main logic for adding/removing tags with incompatible/required
  const handleTagChange = (selectedOptions, setOptions) => {
    const updated = selectedOptions || [];
    const oldAllTags = getAllSelectedTags();

    // figure out which tag was just added or removed
    const newlyChanged = updated.length > oldAllTags.length
      ? updated.find((opt) => !oldAllTags.includes(opt.value))
      : oldAllTags.find(
          (tg) => !updated.map((opt) => opt.value).includes(tg)
        );

    if (!newlyChanged) {
      setOptions(updated);
      return;
    }

    const tagValue = newlyChanged.value;
    const incompArr = INCOMPATIBLE_TAGS[tagValue] || [];

    // If user just added a tag
    if (updated.length > oldAllTags.length) {
      // remove any incompatible tags from all 4 multi-select states
      setSelectedPackingTags((prev) =>
        prev.filter((opt) => !incompArr.includes(opt.value))
      );
      setExtraAttentionOptions((prev) =>
        prev.filter((opt) => !incompArr.includes(opt.value))
      );
      setLoadPointsOptions((prev) =>
        prev.filter((opt) => !incompArr.includes(opt.value))
      );
      setDropPointsOptions((prev) =>
        prev.filter((opt) => !incompArr.includes(opt.value))
      );

      // Then add any required tags
      const reqs = REQUIRED_TAGS[tagValue] || [];
      reqs.forEach((reqTag) => {
        const found = findOptionByValue(reqTag);
        if (found && !updated.find((opt) => opt.value === reqTag)) {
          updated.push(found);
        }
      });
    }

    setOptions(updated);
  };

  // Helper: find an option by .value
  const findOptionByValue = (value) => {
    const everything = [
      ...optionsData.itemTags.packing,
      ...optionsData.itemTags.extraAttention,
      ...optionsData.locationTags.loadPoints,
      ...optionsData.locationTags.dropPoints,
    ];
    return everything.find((o) => o.value === value);
  };

  // For multi-select of packing materials
  const handlePackingNeedsChange = (selection, actionMeta) => {
    if (actionMeta.action === 'select-option' && actionMeta.option) {
      const selOpt = actionMeta.option;
      setPackingNeedsCounts((prev) => ({
        ...prev,
        [selOpt.value]: (prev[selOpt.value] || 0) + 1,
      }));
    } else if (actionMeta.action === 'remove-value' && actionMeta.removedValue) {
      const remOpt = actionMeta.removedValue;
      setPackingNeedsCounts((prev) => {
        const cpy = { ...prev };
        if (cpy[remOpt.value] > 1) {
          cpy[remOpt.value] -= 1;
        } else {
          delete cpy[remOpt.value];
        }
        return cpy;
      });
    } else if (actionMeta.action === 'clear') {
      setPackingNeedsCounts({});
    }
  };

  // Save item
  const handleSaveItem = (overrides = {}) => {
    const selectedTags = getAllSelectedTags();
    const newInstance = {
      id: currentItemInstance ? currentItemInstance.id : uuidv4(),
      itemId: item.id.toString(),
      item: { ...item },
      tags: selectedTags,
      count: itemCount,
      notes,
      cuft,
      lbs,
      packingNeedsCounts,
      link: overrides.link !== undefined ? overrides.link : link,
      uploadedImages:
        overrides.uploadedImages !== undefined
          ? overrides.uploadedImages
          : uploadedImages,
      cameraImages:
        overrides.cameraImages !== undefined
          ? overrides.cameraImages
          : cameraImages,
    };
    newInstance.groupingKey = generateGroupingKey(newInstance);

    if (currentItemInstance) {
      onUpdateItem(newInstance, currentItemInstance);
    } else {
      onAddItem(newInstance);
    }
    setCurrentItemInstance(newInstance);
  };

  // itemCount plus/minus
  const handleIncrement = () => setItemCount((p) => p + 1);
  const handleDecrement = () => setItemCount((p) => (p > 0 ? p - 1 : 0));
  const handleCountChange = (e) => {
    const val = parseInt(e.target.value, 10);
    setItemCount(val >= 0 ? val : 0);
  };

  // For "CP Packed by Movers" info
  const isCpPackedByMoversSelected = selectedPackingTags.some(
    (opt) => opt.value === 'cp_packed_by_movers'
  );

  // A useCallback that filters out incompatible tags
  const filterOptions = useCallback(
    (optionsArr, selectedTags) => {
      return optionsArr.map((op) => {
        const isIncomp = selectedTags.some((tg) => {
          const arr = INCOMPATIBLE_TAGS[tg] || [];
          return arr.includes(op.value);
        });
        return {
          ...op,
          isDisabled: isIncomp,
        };
      });
    },
    []
  );

  // The final arrays for each select
  const allSelectedTags = getAllSelectedTags();
  const filteredPackingOptions = filterOptions(optionsData.itemTags.packing, allSelectedTags);
  const filteredExtraAttentionOptions = filterOptions(optionsData.itemTags.extraAttention, allSelectedTags);
  const filteredLoadPointsOptions = filterOptions(optionsData.locationTags.loadPoints, allSelectedTags);
  const dynamicFilteredDropPoints = filterOptions(dynamicDropPoints, allSelectedTags);

  // "Start Fresh"
  const handleStartFreshClick = () => {
    setIsSlidingOut(true);
  };
  useEffect(() => {
    let timer;
    if (isSlidingOut) {
      timer = setTimeout(() => {
        setCurrentItemInstance(null);
        setIsSlidingOut(false);
        setIsSlidingIn(true);
      }, 300);
    }
    return () => clearTimeout(timer);
  }, [isSlidingOut]);
  useEffect(() => {
    let timer;
    if (isSlidingIn) {
      timer = setTimeout(() => setIsSlidingIn(false), 300);
    }
    return () => clearTimeout(timer);
  }, [isSlidingIn]);

  // Camera / upload / link
  const handleCameraRollClick = () => {
    if (cameraImages.length === 0) {
      cameraInputRef.current?.click();
    } else {
      setPreviewImage(cameraImages[0]);
      setIsPreviewVisible(true);
    }
  };
  const handleCameraRoll = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      const data = reader.result;
      const newCam = [...cameraImages, data];
      setCameraImages(newCam);
      setPreviewImage(data);
      setIsPreviewVisible(true);
      handleSaveItem({ cameraImages: newCam });
    };
    reader.readAsDataURL(file);
  };
  const handleUploadClick = () => {
    if (uploadedImages.length === 0) {
      uploadInputRef.current?.click();
    } else {
      setPreviewImage(uploadedImages[0]);
      setIsPreviewVisible(true);
    }
  };
  const handleUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      const data = reader.result;
      const newUpl = [...uploadedImages, data];
      setUploadedImages(newUpl);
      setPreviewImage(data);
      setIsPreviewVisible(true);
      handleSaveItem({ uploadedImages: newUpl });
    };
    reader.readAsDataURL(file);
  };

  // Link logic
  const handleLinkClick = () => {
    if (link) {
      setIsLinkOptionsVisible((p) => !p);
    } else {
      setIsEditingLink(true);
    }
  };
  const handleViewLink = () => {
    window.open(link, '_blank');
    setIsLinkOptionsVisible(false);
  };
  const handleClearLink = () => {
    const blank = '';
    setLink(blank);
    setIsLinkOptionsVisible(false);
    handleSaveItem({ link: blank });
  };
  const handleReplaceLink = () => {
    setIsLinkOptionsVisible(false);
    setIsEditingLink(true);
  };
  const handleLinkInputChange = (e) => setLinkInput(e.target.value);

  // Basic URL validation
  const validateURL = (url) => {
    const pattern = new RegExp(
      '^(https?:\\/\\/)' +
      '((([a-zA-Z\\d]([a-zA-Z\\d-]*[a-zA-Z\\d])*)\\.)+[a-zA-Z]{2,})' +
      '(\\:\\d+)?(\\/[-a-zA-Z\\d%_.~+]*)*' +
      '(\\?[;&a-zA-Z\\d%_.~+=-]*)?' +
      '(\\#[-a-zA-Z\\d_]*)?$',
      'i'
    );
    return !!pattern.test(url);
  };
  const handleSaveLink = () => {
    if (validateURL(linkInput)) {
      const newLink = linkInput;
      setLink(newLink);
      setLinkInput('');
      setIsEditingLink(false);
      setIsLinkOptionsVisible(false);
      handleSaveItem({ link: newLink });
    } else {
      alert('Please enter a valid URL.');
    }
  };
  const handleCancelEditLink = () => {
    setLinkInput('');
    setIsEditingLink(false);
    setIsLinkOptionsVisible(false);
  };

  // Clicking outside => close popups
  useEffect(() => {
    const handleClickOutside = (evt) => {
      if (
        (linkRef.current && linkRef.current.contains(evt.target)) ||
        (linkOptionsRef.current && linkOptionsRef.current.contains(evt.target)) ||
        (linkInputRef.current && linkInputRef.current.contains(evt.target)) ||
        (uploadInputRef.current && uploadInputRef.current.contains(evt.target)) ||
        (imagePreviewModalRef.current && imagePreviewModalRef.current.contains(evt.target))
      ) {
        return;
      }
      if (isLinkOptionsVisible || isEditingLink) {
        setIsLinkOptionsVisible(false);
        setIsEditingLink(false);
      }
      if (isPreviewVisible) {
        closePreview();
      }
    };

    if (isLinkOptionsVisible || isEditingLink || isPreviewVisible) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isLinkOptionsVisible, isEditingLink, isPreviewVisible]);

  // Close the image preview
  const closePreview = () => {
    setIsPreviewVisible(false);
    setPreviewImage(null);
  };

  // Deleting an image from preview
  const handleDeleteImage = () => {
    if (uploadedImages.includes(previewImage)) {
      const newUpl = uploadedImages.filter((img) => img !== previewImage);
      setUploadedImages(newUpl);
      if (newUpl.length > 0) {
        setPreviewImage(newUpl[0]);
      } else {
        setPreviewImage(null);
        setIsPreviewVisible(false);
      }
      handleSaveItem({ uploadedImages: newUpl });
    } else if (cameraImages.includes(previewImage)) {
      const newCam = cameraImages.filter((img) => img !== previewImage);
      setCameraImages(newCam);
      if (newCam.length > 0) {
        setPreviewImage(newCam[0]);
      } else {
        setPreviewImage(null);
        setIsPreviewVisible(false);
      }
      handleSaveItem({ cameraImages: newCam });
    }
  };
  useEffect(() => {
    if (isPreviewVisible && deleteImageButtonRef.current) {
      deleteImageButtonRef.current.focus();
    }
  }, [isPreviewVisible]);

  // Render the popup
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
            <button type="button" onClick={onClose} aria-label="Close">
              <Icon name="Close" className={styles.closeIcon} />
            </button>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className={styles.content}>
          {/* Item Group */}
          <div className={styles.itemGroup}>
            <div className={styles.furnitureOutline}>
              <div className={styles.furnitureWrapper}>
              <Image
                  src={item.src}
                  alt={item.name}
                  width={72}
                  height={72}
                  className={styles.itemImage}
                />
              </div>
            </div>
            <div className={styles.furnitureTextGroup}>
              <p className={styles.itemName}>{item.name}</p>
              <div className={styles.numberInputWrapper}>
                <div className={styles.numberInput}>
                  <button
                    type="button"
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
                    type="button"
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
            />
          </div>

          {/* Action Buttons for camera/upload/link */}
          <div className={styles.container}>
            {/* Camera Roll */}
            <div
              className={`${styles.element} ${
                cameraImages.length > 0 ? styles.cameraRollActive : ''
              }`}
              onClick={handleCameraRollClick}
              style={{ cursor: 'pointer', position: 'relative' }}
            >
              <Icon name="CameraRoll" className={styles.icon} />
              <div>
                {cameraImages.length > 0 ? 'View Camera Roll' : 'Camera Roll'}
              </div>
            </div>
            <input
              type="file"
              accept="image/*"
              capture="environment"
              ref={cameraInputRef}
              className={styles.hiddenInput}
              onChange={handleCameraRoll}
            />

            {/* Upload */}
            <div
              className={`${styles.element} ${
                uploadedImages.length > 0 ? styles.uploadActive : ''
              }`}
              onClick={handleUploadClick}
              style={{ cursor: 'pointer', position: 'relative' }}
            >
              <Icon name="Upload" className={styles.icon} />
              <div>
                {uploadedImages.length > 0 ? 'View Upload' : 'Upload'}
              </div>
            </div>
            <input
              type="file"
              accept="image/*"
              ref={uploadInputRef}
              className={styles.hiddenInput}
              onChange={handleUpload}
            />

            {/* Link Element */}
            <div
              ref={linkRef}
              className={`${styles.element} ${link ? styles.linkActive : ''}`}
              onClick={handleLinkClick}
              style={{ cursor: 'pointer', position: 'relative' }}
            >
              <Icon name="PasteLink" className={styles.icon} />
              <div>{link ? 'Link Added' : 'Add Link'}</div>

              {/* Popup Options if link is present */}
              {isLinkOptionsVisible && link && (
                <div
                  ref={linkOptionsRef}
                  className={styles.linkOptionsPopup}
                  onClick={(e) => e.stopPropagation()}
                >
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleViewLink();
                    }}
                    className={styles.linkOptionButton}
                  >
                    View Link
                  </button>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleClearLink();
                    }}
                    className={styles.linkOptionButton}
                  >
                    Clear Link
                  </button>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleReplaceLink();
                    }}
                    className={styles.linkOptionButton}
                  >
                    Replace Link
                  </button>
                </div>
              )}
            </div>

            {/* Link Input Popup */}
            {isEditingLink && (
              <div
                ref={linkInputRef}
                className={styles.linkInputPopup}
                onClick={(e) => e.stopPropagation()}
              >
                <input
                  type="url"
                  value={linkInput}
                  onChange={handleLinkInputChange}
                  placeholder="Paste your link here"
                  className={styles.linkInputField}
                  aria-label="Link Input"
                />
                <div className={styles.linkInputButtons}>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSaveLink();
                    }}
                    className={styles.saveLinkButton}
                  >
                    Save
                  </button>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleCancelEditLink();
                    }}
                    className={styles.cancelLinkButton}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Image Preview Popup */}
          {isPreviewVisible && previewImage && (
            <div
              className={styles.imagePreviewOverlay}
              onClick={(e) => {
                e.stopPropagation();
                closePreview();
              }}
            >
              <div
                className={styles.imagePreviewModal}
                ref={imagePreviewModalRef}
                onClick={(e) => e.stopPropagation()}
              >
                <button
                  type="button"
                  className={styles.closePreviewButton}
                  onClick={closePreview}
                  aria-label="Close Preview"
                >
                  <Icon name="Close" className={styles.closeIconPreview} />
                </button>
                <Image
                  src={previewImage}
                  alt="Preview"
                  width={300}
                  height={300}
                  className={styles.previewImage}
                />
                <button
                  type="button"
                  className={styles.deleteImageButton}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteImage();
                  }}
                  aria-label="Delete Image"
                  ref={deleteImageButtonRef}
                >
                  Delete Image
                </button>
              </div>
            </div>
          )}

          {/* First Section: Item Tags */}
          <div className={styles.section}>
            <p className={styles.sectionLabel}>Item Tags</p>
            <div className={styles.inputGroup}>
              <Select
                isMulti
                isClearable={false}
                className={styles.selectInput}
                classNamePrefix={selectClassNamePrefix}
                name="packing"
                options={filteredPackingOptions}
                placeholder="Packing"
                value={selectedPackingTags}
                onChange={(sel) => handleTagChange(sel, setSelectedPackingTags)}
                aria-label="Item Tags - Packing"
                components={{ Input: CustomInput }}
                styles={customSelectStyles}
              />
            </div>
            <div className={styles.inputGroup}>
              <Select
                isMulti
                isClearable={false}
                className={styles.selectInput}
                classNamePrefix={selectClassNamePrefix}
                name="extraAttention"
                options={filteredExtraAttentionOptions}
                placeholder="Extra Attention"
                value={extraAttentionOptions}
                onChange={(sel) => handleTagChange(sel, setExtraAttentionOptions)}
                aria-label="Item Tags - Extra Attention"
                components={{ Input: CustomInput }}
                styles={customSelectStyles}
              />
            </div>
          </div>

          {/* Second Section: Location Tags */}
          <div className={styles.section}>
            <p className={styles.sectionLabel}>Location Tags</p>
            <div className={styles.inputGroup}>
              <Select
                isMulti
                isClearable={false}
                className={styles.selectInput}
                classNamePrefix={selectClassNamePrefix}
                name="loadPoints"
                options={filteredLoadPointsOptions}
                placeholder="Load Points"
                value={loadPointsOptions}
                onChange={(sel) => handleTagChange(sel, setLoadPointsOptions)}
                aria-label="Location Tags - Load Points"
                components={{ Input: CustomInput }}
                styles={customSelectStyles}
              />
            </div>
            <div className={styles.inputGroup}>
              <Select
                isMulti
                isClearable={false}
                className={styles.selectInput}
                classNamePrefix={selectClassNamePrefix}
                name="dropPoints"
                options={dynamicFilteredDropPoints}
                placeholder="Drop Points"
                value={dropPointsOptions}
                onChange={(sel) => handleTagChange(sel, setDropPointsOptions)}
                aria-label="Location Tags - Drop Points"
                components={{ Input: CustomInput }}
                styles={customSelectStyles}
              />
            </div>
          </div>

          {/* Informational Message */}
          {!isCpPackedByMoversSelected && (
            <div className={styles.infoMessage}>
              <p>Select &apos;CP Packed by Movers&apos; to specify packing materials.</p>
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
                  getOptionLabel={(option) => option.name}
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
                  formatOptionLabel={(opt, { context }) =>
                    context === 'value' ? opt.name : opt.name
                  }
                />
              </div>
            </div>
          )}
        </div>

        {/* Save & Start Fresh Buttons */}
        <div className={styles.saveButtonContainer}>
          <button
            type="button"
            className={`${styles.saveButton} ${isSaving ? styles.saving : ''}`}
            onClick={(e) => {
              e.stopPropagation();
              handleSaveItem();
              setIsSaving(true);
              setTimeout(() => setIsSaving(false), 300);
            }}
          >
            Save
          </button>
          <button
            type="button"
            className={styles.newItemButton}
            onClick={handleStartFreshClick}
          >
            Start Fresh as New Item
          </button>
        </div>
      </div>
    </div>
  );
}

export default ItemPopup;
