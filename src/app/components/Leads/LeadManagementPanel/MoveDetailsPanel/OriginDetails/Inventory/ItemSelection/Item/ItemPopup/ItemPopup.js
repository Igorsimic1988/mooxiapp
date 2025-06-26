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
import { labelToDropTag, EXCLUSIVE_LOCATION_TAGS, BASE_INCOMPATIBLE_TAGS, REQUIRED_TAGS, buildExclusiveIncompat } from '../../../utils/tagsRules';
import { getAllFurnitureItems } from 'src/app/services/furnitureService';
import { useQuery } from '@tanstack/react-query';
import { addDefaultTags } from '../../../utils/addDefaultTags';
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
 * A custom MultiValue display to show packing counts, e.g. "Tape (3)".
 */
const MultiValue = (props) => {
  const { data } = props;
  return (
    <RSComponents.MultiValue {...props}>
      <span>{`${data.name} (${data.count})`}</span>
    </RSComponents.MultiValue>
  );
};

const LOCATION_EXCLUSIVES = buildExclusiveIncompat(EXCLUSIVE_LOCATION_TAGS);

const INCOMPATIBLE_TAGS = {
  ...BASE_INCOMPATIBLE_TAGS,
  ...LOCATION_EXCLUSIVES,
};

/** 
 * ==============================================
 * REACT-SELECT INLINE STYLES
 * ==============================================
 */
const customSelectStyles = {
  control: (provided, state) => ({
    ...provided,
    border: state.isFocused ? '1px solid #3FA9F5' : 'none',
    borderRadius: '12px',
    boxShadow: 'none',
    backgroundColor: 'transparent',
    minHeight: '50px',
  }),
  menu: (provided) => ({
    ...provided,
    borderRadius: '12px',
    overflow: 'hidden',
    zIndex: 1001,
    border: 'none',
    boxShadow: '0px 1px 16px 0px rgba(0, 0, 0, 0.08)',
    padding: '7px 0 10px',
  }),
  menuList: (provided) => ({
    ...provided,
    padding: '7px 0 0 0',
    overflowX: 'hidden',
  }),
  multiValue: (provided) => ({
    ...provided,
    backgroundColor: '#90A4B7',
    borderRadius: '12px',
  }),
  multiValueLabel: (provided) => ({
    ...provided,
    color: '#fff',
    fontWeight: 500,
    fontSize: '1rem',
  }),
  multiValueRemove: (provided) => ({
    ...provided,
    color: '#fff',
    cursor: 'pointer',
    ':hover': {
      backgroundColor: '#6E7882',
      color: '#fff',
    },
  }),
  placeholder: (provided) => ({
    ...provided,
    color: '#6E7882',
    fontFamily: 'Satoshi, sans-serif',
    fontSize: '1rem',
    fontWeight: 500,
  }),
  option: (provided, state) => ({
    ...provided,
    fontFamily: 'Satoshi, sans-serif',
    fontSize: '15px',
    fontStyle: 'normal',
    fontWeight: 400,
    lineHeight: 'normal',
    backgroundColor: state.isSelected
      ? '#F2F5F8'
      : state.isFocused
      ? '#F2F5F8'
      : '#fff',
    color: '#000',
    cursor: 'pointer',
    borderRadius: state.isSelected ? '8px' : state.isFocused ? '8px' : '0',
    margin: '0 10px',
    padding: '7px 10px',
  }),
};

/**
 * ITEM POPUP COMPONENT
 */
function ItemPopup({
  item,
  onClose,
 
  itemInstance,

  lead,
  selectedRoom,
  roomItemSelections,
  setRoomItemSelections,
  onOpenPopup,
  selectedStopInfo,
}) {

  const { data: allItems = [] } = useQuery({
    queryKey: ['furnitureItems', lead?.brandId],
    queryFn: () => getAllFurnitureItems({ brandId: lead?.brandId }),
    enabled: !!lead?.brandId,
  });
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

  // Packing materials
  const [packingNeeds, setPackingNeeds] = useState([]);

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

  // For "packingNeeds" multi-select
  const selectedPackingNeeds = Array.isArray(packingNeeds)
    ? packingNeeds.map((entry) => {
        const foundOpt = packingOptions.find((o) => o.value === entry.type);
        return {
          value: entry.type,
          name: foundOpt ? foundOpt.name : entry.type,
          count: entry.quantity,
        };
      })
    : [];

  // Dynamically filter dropPoints
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
    if (baseAlwaysVisible.includes(dp.value)) return true;
    if (hasMultipleActiveStops && activeStopValues.has(dp.value)) return true;
    return false;
  });

  // Gather all selected tags
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

  // Get count of items with same groupingKey
  const getGroupCount = useCallback(() => {
    if (!currentItemInstance || !selectedRoom || !roomItemSelections) return 1;
    const items = roomItemSelections[selectedRoom.id] || [];
    return items.filter(itm => itm.groupingKey === currentItemInstance.groupingKey).length;
  }, [currentItemInstance, selectedRoom, roomItemSelections]);

  // Handle close - discard new items that weren't saved
  const handleClose = () => {
    // If this is a new item that hasn't been saved, just close without adding
    if (currentItemInstance?.isNew) {
      onClose();
      return;
    }
    // Otherwise, normal close
    onClose();
  };

  // Initialize data on mount or if item changes
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

    // packingNeeds
    if (currentItemInstance?.packingNeeds) {
      const rawPacking = currentItemInstance.packingNeeds;

  let normalizedPacking = [];



  if (Array.isArray(rawPacking)) {
    normalizedPacking = rawPacking;
  }
  else if (
    rawPacking &&
    typeof rawPacking === 'object' &&
    Object.keys(rawPacking).every((k) => !isNaN(k)) &&
    Object.values(rawPacking).every((v) => typeof v === 'object')
  ) {
    normalizedPacking = Object.values(rawPacking);
  }


    setPackingNeeds(normalizedPacking);

    } else if (item.packingNeeds && item.packingNeeds.length > 0) {
      setPackingNeeds(item.packingNeeds);
    } else {
      setPackingNeeds([]);
    }

    // Basic fields
    setCuft(currentItemInstance?.cuft || item.cuft || '');
    setLbs(currentItemInstance?.lbs || item.lbs || '');
    
    // Set itemCount - for new items always start with 1, otherwise use group count
    if (currentItemInstance?.isNew) {
      setItemCount(1);
    } else {
      setItemCount(getGroupCount());
    }
    
    setNotes(currentItemInstance?.notes || '');

    // Link
    setLink(currentItemInstance?.link || '');

    // Images
    setUploadedImages(currentItemInstance?.uploadedImages || []);
    setCameraImages(currentItemInstance?.cameraImages || []);
  }, [currentItemInstance, item, getGroupCount]);

  // Input handlers
  const handleCuftChange = (e) => setCuft(e.target.value);
  const handleLbsChange = (e) => setLbs(e.target.value);
  const handleNotesChange = (e) => setNotes(e.target.value);

  // Tag logic with incompatible/required
  const handleTagChange = (selectedOptions, setOptions) => {
    const updated = selectedOptions || [];
    const oldAllTags = getAllSelectedTags();

    // figure out which tag was just added or removed
    const newlyChanged =
      updated.length > oldAllTags.length
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
      setPackingNeeds((prev) => {
        const existing = prev.find((p) => p.type === selOpt.value);
        if (existing) {
          return prev.map((p) =>
            p.type === selOpt.value
              ? { ...p, quantity: p.quantity + 1 }
              : p
          );
        }
        return [...prev, { type: selOpt.value, quantity: 1 }];
      });
    } else if (actionMeta.action === 'remove-value' && actionMeta.removedValue) {
      const remOpt = actionMeta.removedValue;
      setPackingNeeds((prev) => {
        const existing = prev.find((p) => p.type === remOpt.value);
        if (!existing) return prev;
        if (existing.quantity > 1) {
          return prev.map((p) =>
            p.type === remOpt.value
              ? { ...p, quantity: p.quantity - 1 }
              : p
          );
        }
        return prev.filter((p) => p.type !== remOpt.value);
      });
    } else if (actionMeta.action === 'clear') {
      setPackingNeeds([]);
    }
  };

  // Save item - Handle grouped items properly
const handleSaveItem = (overrides = {}) => {
  if (!selectedRoom || !setRoomItemSelections) return;

  const selectedTags = getAllSelectedTags();
  const updatedInstance = {
    ...currentItemInstance,
    furnitureItemId: item.furnitureItemId || item.id,
    name: item.name || '',
    imageName: item.imageName || '',
    letters: item.letters || [],
    search: item.search ?? true,
    tags: selectedTags,
    notes,
    cuft: cuft !== '' ? parseInt(cuft, 10) : item.cuft || 0,
    lbs: lbs !== '' ? parseInt(lbs, 10) : item.lbs || 0,
    packingNeeds,
    link: overrides.link ?? link,
    uploadedImages: overrides.uploadedImages ?? uploadedImages,
    cameraImages: overrides.cameraImages ?? cameraImages,
  };
  
  // Generate new grouping key
  const newGroupingKey = generateGroupingKey(updatedInstance);
  updatedInstance.groupingKey = newGroupingKey;

  // Use the same logic for both new and existing items
  setRoomItemSelections((prev) => {
    const items = [...(prev[selectedRoom.id] || [])];
    
    if (currentItemInstance?.isNew) {
      if (itemCount === 0) {
        return prev;
      }
      
      // Add new items
      for (let i = 0; i < itemCount; i++) {
        items.push({
          ...updatedInstance,
          id: uuidv4(),
          groupingKey: newGroupingKey,
          // Remove the isNew flag
          isNew: undefined
        });
      }
    } else {
      // Existing item - find and update the group
      const originalGroupingKey = currentItemInstance?.groupingKey;
      const groupItems = items.filter(itm => itm.groupingKey === originalGroupingKey);
      const otherItems = items.filter(itm => itm.groupingKey !== originalGroupingKey);
      
      // If count is 0, remove all items in the group
      if (itemCount === 0) {
        return {
          ...prev,
          [selectedRoom.id]: otherItems
        };
      }
      
      // Update all items in the group with new properties
      const updatedGroupItems = groupItems.map((itm) => ({
        ...itm,
        ...updatedInstance,
        id: itm.id, // Preserve original IDs
        autoAdded: itm.autoAdded || false, // Preserve autoAdded flag
        groupingKey: newGroupingKey
      }));
      
      // Adjust count by adding or removing items
      const currentCount = groupItems.length;
      let finalGroupItems = [...updatedGroupItems];
      
      if (itemCount > currentCount) {
        // Add new items
        const itemsToAdd = itemCount - currentCount;
        for (let i = 0; i < itemsToAdd; i++) {
          finalGroupItems.push({
            ...updatedInstance,
            id: uuidv4(),
            groupingKey: newGroupingKey
          });
        }
      } else if (itemCount < currentCount) {
        // Remove items (from the end)
        finalGroupItems = finalGroupItems.slice(0, itemCount);
      }
      
      // Return the updated items array
      return {
        ...prev,
        [selectedRoom.id]: [...otherItems, ...finalGroupItems]
      };
    }
    
    return {
      ...prev,
      [selectedRoom.id]: items
    };
  });

  // Update the current instance state (remove isNew flag)
  setCurrentItemInstance({...updatedInstance, isNew: false});
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

  // filterOptions => remove incompatible
  const filterOptions = useCallback((optionsArr, selectedTags) => {
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
  }, []);

  const allSelectedTags = getAllSelectedTags();
  const filteredPackingOptions = filterOptions(optionsData.itemTags.packing, allSelectedTags);
  const filteredExtraAttentionOptions = filterOptions(optionsData.itemTags.extraAttention, allSelectedTags);
  const filteredLoadPointsOptions = filterOptions(optionsData.locationTags.loadPoints, allSelectedTags);
  const dynamicFilteredDropPoints = filterOptions(dynamicDropPoints, allSelectedTags);

  // "Start Fresh as New Item"
  const handleStartFreshClick = () => {
    if (!item || !onOpenPopup) return;
    
    // Get the base furniture item
    // Pretpostavka: negde imaš listu svih furnitureItem-a
    const furnitureItem = allItems.find(fi => fi.id === item.furnitureItemId);
    if (!furnitureItem) {
      console.warn("❗ Furniture item not found!");
      return;
    }

    
    // Create default packing needs
    //let defaultPacking = {};
    // if (item.packingNeeds?.length) {
    //   item.packingNeeds.forEach((pack) => {
    //     defaultPacking[pack.type] = pack.quantity;
    //   });
    // }
    
    // Create a brand new item instance with default values (not saved yet)
    const { tags, packingNeeds } = addDefaultTags(
      furnitureItem,
      selectedRoom?.id,
      lead,
      selectedStopInfo // ✅ sad imaš pun kontekst
    );
    const freshItemInstance = {
      id: uuidv4(),
      furnitureItemId: furnitureItem.id,
      tags,
      notes: "",
      cuft: furnitureItem.cuft || "",
      lbs: furnitureItem.lbs || "",
      packingNeeds,
      link: "",
      uploadedImages: [],
      cameraImages: [],
      isNew: true, // Flag to indicate this is a new unsaved item
    };
    
    // Generate grouping key for the new instance
    freshItemInstance.groupingKey = generateGroupingKey(freshItemInstance);
    
    // Close current popup
    handleClose();
    
    // Open popup with the fresh instance (not saved yet)
    setTimeout(() => {
      onOpenPopup(item, freshItemInstance);
    }, 100);
  };

  // Camera / upload / link handlers
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

  const closePreview = () => {
    setIsPreviewVisible(false);
    setPreviewImage(null);
  };

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

  return (
    <div className={styles.popup} onClick={handleClose}>
      <div
        className={styles.popupContent}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className={styles.header}>
          <div className={styles.title}>
            <p>Item</p>
          </div>
          <div className={styles.closeButton}>
            <button type="button" onClick={handleClose} aria-label="Close">
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
                  src={item.imageName || item.src}
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
    setTimeout(() => {
      setIsSaving(false);
      handleClose();  // Always close after saving
    }, 300);
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