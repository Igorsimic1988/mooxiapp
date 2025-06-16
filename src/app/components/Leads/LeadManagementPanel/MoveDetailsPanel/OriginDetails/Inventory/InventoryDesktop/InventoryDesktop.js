"use client";

import React, { useState, useEffect, useMemo } from 'react';
import styles from './InventoryDesktop.module.css';
import { v4 as uuidv4 } from 'uuid';
import { generateGroupingKey } from '../utils/generateGroupingKey';
import Fuse from 'fuse.js';

// Child components

import BackButton from './BackButton/BackButton';
import ToggleSwitch from '../ItemSelection/BcalculatorMyitems/ToogleSwitch/ToogleSwitch';
import RoomList from '../RoomList/RoomList';
import HouseInfo from '../HouseHeader/HouseInfo/HouseInfo';
import AddRoomButton from '../HouseHeader/AddRoomButton/AddRoomButton';
import SearchHeader from '../SearchHeader/SearchHeader';
import AlphabetButtons from '../ItemSelection/AlphabetFilter/AlphabetButtons/AlphabetButtons';
import ItemList from '../ItemSelection/ItemList/ItemList';
import FurnitureCounter from './FurnitureCounter/FurnitureCounter';
import CreateQuoteButton from './CreateQuoteButton/CreateQuoteButton';

// Popups + Icons
import ItemPopup from '../ItemSelection/Item/ItemPopup/ItemPopup';
import MyInventory from '../FooterNavigation/MyInventory/MyInventory';
import SpecialH from '../FooterNavigation/SpecialH/SpecialH';
import DeleteButton from '../FooterNavigation/DeleteButton/DeleteButton';
import { getAllFurnitureItems } from 'src/app/services/furnitureService';
import { useQuery } from '@tanstack/react-query';

import Icon from 'src/app/components/Icon';

// Fuse.js configuration for fuzzy search
const fuseOptions = {
  keys: ['name', 'tags'], // Search in name and tags
  threshold: 0.3, // 0.0 requires perfect match, 1.0 matches everything
  includeScore: true,
  minMatchCharLength: 2,
  shouldSort: true,
  findAllMatches: true,
  ignoreLocation: true, // Search anywhere in the string
};

/**
 * InventoryDesktop
 *
 * Props for individual items approach:
 *  - stopIndex, setStopIndex
 *  - roomItemSelections: { [roomId]: arrayOfItemInstances }
 *  - setRoomItemSelections: (fnOrObj) => void  (for MyInventory/SpecialH)
 *  - displayedRooms: array of {id, name}
 *  - handleToggleRoom: function(roomId) => toggles displayedRooms in parent's inventory
 *  - isToggled, setIsToggled
 *  - selectedRoom, setSelectedRoom
 *  - rooms (the master list)
 *  - searchQuery, handleSearch, handleSearchClick
 *  - selectedLetter, setSelectedLetter
 *  - selectedSubButton, setSelectedSubButton
 *  - isMyItemsActive, setIsMyItemsActive
 *  - setSearchQuery
 *  - onCloseDesktopInventory
 *  - lead (for HouseInfo)
 *  - handleItemSelection, handleUpdateItem, handleAddItem, handleStartFresh, handleDeleteItem
 *  - isDeleteActive, setIsDeleteActive
 *  - allItems, fuse (for fuzzy search)
 */
function InventoryDesktop({
  // Multi-stop
  stopIndex,
  setStopIndex,

  // Items for this stop (individual items approach)
  roomItemSelections,
  setRoomItemSelections,

  // Currently displayed rooms => array of { id, name }
  displayedRooms,

  // Callback from parent that toggles rooms in inventoryByStop
  handleToggleRoom,

  // Toggles
  isToggled,
  setIsToggled,
  selectedRoom,
  setSelectedRoom,
  rooms,

  // Searching / filters
  searchQuery,
  handleSearch,
  handleSearchClick,
  selectedLetter,
  setSelectedLetter,
  selectedSubButton,
  setSelectedSubButton,
  setIsMyItemsActive,
  setSearchQuery,

  // Closing
  onCloseDesktopInventory,
  lead,

  // Item logic
  handleItemSelection,
  handleUpdateItem,
  handleDeleteItem,
  handleAddItem,
  handleStartFresh,

  // Delete toggle
  isDeleteActive,
  setIsDeleteActive,
  
  // Items and Fuse instance
  allItems: propAllItems,
  fuse: propFuse,
}) {
  // Fetch furniture items from backend if not provided
  const { data: fetchedAllItems = [] } = useQuery({
    queryKey: ['furnitureItems', lead?.brandId],
    queryFn: () => getAllFurnitureItems({ brandId: lead?.brandId }),
    enabled: !!lead?.brandId && !propAllItems,
  });
  
  // Use provided items or fetched items
  const allItems = propAllItems || fetchedAllItems;

  // Create Fuse instance if not provided
  const fuse = useMemo(() => {
    if (propFuse) return propFuse;
    if (allItems.length > 0) {
      return new Fuse(allItems, fuseOptions);
    }
    return null;
  }, [propFuse, allItems]);

  // Show/hide item popup
  const [isItemPopupVisible, setIsItemPopupVisible] = useState(false);
  const [currentItemData, setCurrentItemData] = useState(null);
  const [currentItemInstance, setCurrentItemInstance] = useState(null);

  // MyInventory + SpecialH popups
  const [isMyInventoryVisible, setIsMyInventoryVisible] = useState(false);
  const [isSpecialHVisible, setIsSpecialHVisible] = useState(false);

  // Expand/collapse the middle panel
  const [isExpanded, setIsExpanded] = useState(false);

  // If no selectedRoom => pick the first
  useEffect(() => {
    if (!selectedRoom && displayedRooms?.length > 0) {
      setSelectedRoom(displayedRooms[0]);
    }
  }, [selectedRoom, displayedRooms, setSelectedRoom]);

  // Convert displayedRooms = [{id, name}] => numeric array [id, ...] for MyInventory & SpecialH
  const displayedRoomIds = displayedRooms.map((r) => r.id);

  // Expand/collapse
  const handleExpandCollapse = () => {
    setIsExpanded((prev) => !prev);
  };

  // Back => close
  const handleBackClick = () => {
    if (onCloseDesktopInventory) {
      onCloseDesktopInventory();
    }
  };

  // "Create Quote"
  const handleCreateQuoteClick = () => {
    if (onCloseDesktopInventory) {
      onCloseDesktopInventory();
    }
  };

  // ToggleSwitch => auto-box
  const handleToggle = () => {
    setIsToggled((prev) => !prev);
  };

  // User clicks a room
  const handleRoomSelect = (room) => {
    setSelectedRoom(room);
  };

  // Letter filter => turn off My Items
  const handleLetterSelectLocal = (letter) => {
    if (setIsMyItemsActive) setIsMyItemsActive(false);
    if (selectedLetter === letter) {
      setSelectedLetter(null);
      setSelectedSubButton({ letter: null, subButton: null });
    } else {
      setSelectedLetter(letter);
      setSelectedSubButton({ letter: null, subButton: null });
      setSearchQuery('');
    }
  };

  // Sub-letter => turn off My Items
  const handleSubButtonSelectLocal = (letter, subButton) => {
    if (setIsMyItemsActive) setIsMyItemsActive(false);
    if (
      selectedSubButton?.letter === letter &&
      selectedSubButton?.subButton === subButton
    ) {
      setSelectedSubButton({ letter: null, subButton: null });
      setSelectedLetter(null);
    } else {
      setSelectedSubButton({ letter, subButton });
      setSelectedLetter(letter);
      setSearchQuery('');
    }
  };

  // Count how many times each item appears in "Items" panel (for individual items)
  const itemCounts = (roomItemSelections[selectedRoom?.id] || []).reduce(
    (acc, inst) => {
      const key = (inst.furnitureItemId || inst.itemId)?.toString();
      if (key) {
        acc[key] = (acc[key] || 0) + 1;
      }
      return acc;
    },
    {}
  );

  // Middle panel => get filtered items
  const getFilteredItems = () => {
    if (!selectedRoom) return [];
    
    // If search query
    if (searchQuery.trim() !== '') {
      if (fuse) {
        // Use Fuse.js for fuzzy search
        const results = fuse.search(searchQuery);
        const filtered = results
          .map(result => result.item)
          .filter(item => item.search !== false);
          
        if (filtered.length === 0) {
          const customItem = allItems.find((x) => x.name === 'Custom Item');
          return customItem ? [customItem] : [];
        }
        return filtered;
      } else {
        // Fallback to simple search if Fuse is not available
        const filtered = allItems.filter((itm) => {
          const match = itm.name.toLowerCase().includes(searchQuery.toLowerCase());
          return match && itm.search !== false;
        });
        if (filtered.length === 0) {
          const customItem = allItems.find((x) => x.name === 'Custom Item');
          return customItem ? [customItem] : [];
        }
        return filtered;
      }
    }
    
    // If sub-letter
    if (selectedSubButton?.subButton) {
      return allItems.filter((itm) =>
        itm.letters.includes(selectedSubButton.subButton)
      );
    }
    // If single letter
    if (selectedLetter) {
      return allItems.filter((itm) => itm.letters.includes(selectedLetter));
    }
    // else => items in the current room
    return allItems.filter((itm) => itm.rooms.includes(Number(selectedRoom.id)));
  };

  // Group individual items by their properties for "My Items" display
  // Using useMemo to ensure stable grouping
 const groupedItems = useMemo(() => {
  if (!selectedRoom) return [];
  const arr = roomItemSelections[selectedRoom.id] || [];
  
  // Use Map to maintain grouping
  const grouped = new Map();
  
  arr.forEach((inst) => {
    // Generate or use existing groupingKey
    const gKey = inst.groupingKey || generateGroupingKey(inst);
    
    if (!grouped.has(gKey)) {
      // Get the stable itemId for sorting
      const stableItemId = inst.furnitureItemId || inst.itemId || inst.item?.id;
      
      // Create a new grouped item
      grouped.set(gKey, {
        ...inst,
        count: 1,
        groupingKey: gKey,
        // Use the stable itemId for consistent sorting
        sortKey: parseInt(stableItemId) || 0,
        // Keep React key simple and stable
        id: gKey,
        furnitureItemId: inst.furnitureItemId || inst.itemId,
        itemId: inst.itemId || inst.furnitureItemId,
        item: inst.item || {
          id: inst.furnitureItemId || inst.itemId,
          name: inst.name || inst.item?.name || '',
          imageName: inst.imageName || inst.item?.imageName || inst.item?.src || '',
          src: inst.item?.src || inst.imageName || '',
        },
        name: inst.name || inst.item?.name || '',
        imageName: inst.imageName || inst.item?.imageName || inst.item?.src || '',
        tags: [...(inst.tags || [])],
        notes: inst.notes || '',
        cuft: inst.cuft || '',
        lbs: inst.lbs || '',
        packingNeedsCounts: { ...(inst.packingNeedsCounts || {}) },
        packingNeeds: inst.packingNeeds || [],
        link: inst.link || '',
        uploadedImages: [...(inst.uploadedImages || [])],
        cameraImages: [...(inst.cameraImages || [])],
      });
    } else {
      const group = grouped.get(gKey);
      group.count += 1;
    }
  });
  
  // Convert to array and sort by stable itemId for consistent order
  const result = Array.from(grouped.values()).sort((a, b) => {
    // Primary sort: by itemId (stable furniture item number)
    const idA = a.sortKey;
    const idB = b.sortKey;
    if (idA !== idB) {
      return idA - idB;
    }
    
    // Secondary sort: by groupingKey for items with same ID but different properties
    return a.groupingKey.localeCompare(b.groupingKey);
  });
  
  return result;
}, [selectedRoom, roomItemSelections]);

  // Handle item click for "My Items" panel (grouped items)
  const handleItemClick = (itemData, action) => {
    if (!selectedRoom) return;
    
    if (action === 'decrease') {
      // Remove an item with the specific groupingKey
      if (itemData.groupingKey) {
        const items = [...(roomItemSelections[selectedRoom.id] || [])];
        const idx = items.findIndex(item => item.groupingKey === itemData.groupingKey);
        
        if (idx !== -1) {
          items.splice(idx, 1);
          setRoomItemSelections({
            ...roomItemSelections,
            [selectedRoom.id]: items
          });
        }
      }
    } else { // 'increase'
      // Add a new instance of this item with the same properties
      if (itemData.groupingKey) {
        const newItemInstance = {
          id: uuidv4(),
          furnitureItemId: itemData.furnitureItemId || itemData.itemId,
          itemId: itemData.itemId || itemData.furnitureItemId,
          item: { ...itemData.item },
          name: itemData.name || itemData.item?.name || '',
          imageName: itemData.imageName || itemData.item?.imageName || '',
          tags: [...(itemData.tags || [])],
          notes: itemData.notes || '',
          cuft: itemData.cuft || '',
          lbs: itemData.lbs || '',
          packingNeedsCounts: { ...(itemData.packingNeedsCounts || {}) },
          packingNeeds: [...(itemData.packingNeeds || [])],
          link: itemData.link || '',
          uploadedImages: [...(itemData.uploadedImages || [])],
          cameraImages: [...(itemData.cameraImages || [])],
          groupingKey: itemData.groupingKey
        };
        
        const items = [...(roomItemSelections[selectedRoom.id] || [])];
        items.push(newItemInstance);
        
        setRoomItemSelections({
          ...roomItemSelections,
          [selectedRoom.id]: items
        });
      }
    }
  };

  // Wrapper function for standard items panel
  const handleRegularItemClick = (itemData, action) => {
    const doAction = action || (isDeleteActive ? 'decrease' : 'increase');
    handleItemSelection(itemData, doAction);
  };

  // Delete toggle
  const handleDeleteClick = () => {
    setIsDeleteActive((prev) => !prev);
  };

  // MyInventory
  const handleMyInventoryClick = () => {
    setIsMyInventoryVisible(true);
  };

  // SpecialH
  const handleSpecialHClick = () => {
    setIsSpecialHVisible(true);
  };

  // If user taps search bar
  const handleSearchFocus = () => {
    handleSearchClick();
  };

  // Open/close ItemPopup
  const handleOpenItemPopup = (itemData, itemInstance) => {
    setCurrentItemData(itemData);
    setCurrentItemInstance(itemInstance);
    setIsItemPopupVisible(true);
  };

  const handleCloseItemPopup = () => {
    setIsItemPopupVisible(false);
    setCurrentItemData(null);
    setCurrentItemInstance(null);
  };

  const currentRoomInstances = useMemo(() => {
    return roomItemSelections[selectedRoom?.id] || [];
  }, [roomItemSelections, selectedRoom]);

  return (
    <div
      className={`${styles.inventoryDesktopContainer} ${
        isExpanded ? styles.expanded : ''
      }`}
    >
      {/* ===== Top Row ===== */}
      <div className={styles.topRowCol1}>
        <BackButton onClick={handleBackClick} />
        <ToggleSwitch isToggled={isToggled} onToggle={handleToggle} />
      </div>

      <div className={styles.topRowCol2}>
        <SearchHeader
          roomName={selectedRoom ? selectedRoom.name : 'Inventory'}
          searchQuery={searchQuery}
          onSearch={handleSearch}
          onSearchClick={handleSearchClick}
          onSearchFocus={handleSearchFocus}
          isDesktop={true}
        />
      </div>

      <div className={styles.topRowCol3}>
        <FurnitureCounter
          roomItemSelections={roomItemSelections}
          displayedRooms={displayedRooms}
        />
      </div>

      {/* ===== Middle Row ===== */}
      <div className={styles.middleRowCol1}>
        <div className={styles.houseInfo}>
          <HouseInfo
            lead={lead}
            stopIndex={stopIndex}
            onStopIndexChange={setStopIndex}
          />
        </div>
        <div className={styles.roomListContainer}>
          <RoomList
            onRoomSelect={handleRoomSelect}
            itemsByRoom={roomItemSelections}
            displayedRooms={displayedRooms}
            selectedRoom={selectedRoom}
          />
        </div>
      </div>

      {/* Middle Column => Items */}
      <div className={styles.middleRowCol2}>
        <div className={styles.itemsHeader}>
          <div className={styles.itemsHeaderText}>Items</div>
          <button
            className={styles.expandCollapseButton}
            onClick={handleExpandCollapse}
          >
            {isExpanded ? <Icon name="Collapse" /> : <Icon name="Expand" />}
          </button>
        </div>
        <div className={styles.itemsSpacer}></div>
        <div className={styles.commonItemsBanner}>
          <p>COMMON ITEMS FOR THIS ROOM</p>
        </div>
        <div className={styles.itemsContentContainer}>
          <div className={styles.alphabetButtonsWrapper}>
            <AlphabetButtons
              selectedLetter={selectedLetter}
              selectedSubButton={selectedSubButton}
              onLetterSelect={handleLetterSelectLocal}
              onSubButtonClick={handleSubButtonSelectLocal}
            />
          </div>
          <div className={styles.itemListPlaceholder}>
            <ItemList
              items={getFilteredItems()}
              itemClickCounts={itemCounts}
              itemInstances={currentRoomInstances}
              onItemClick={handleRegularItemClick}
              isMyItemsActive={false}
              isDeleteActive={isDeleteActive}
              onUpdateItem={handleUpdateItem}
              onAddItem={handleAddItem}
              onStartFresh={handleStartFresh}
              isDesktop={true}
              fuse={fuse}
            />
          </div>
        </div>
      </div>

      {/* Right Column => My Items */}
      <div className={styles.middleRowCol3}>
        <div className={styles.itemsHeader}>
          <div className={styles.itemsHeaderText}>My Items</div>
        </div>
        <div className={styles.itemsSpacer}></div>
        <div className={styles.commonItemsBanner}>
          <p>MY INVENTORY</p>
        </div>
        <div className={styles.itemsContentContainer}>
          <div
            className={`${styles.itemListPlaceholder} ${styles.myItemsListPlaceholder}`}
          >
            <ItemList
              items={groupedItems}
              itemClickCounts={{}}
              itemInstances={currentRoomInstances}
              onItemClick={handleItemClick}
              isMyItemsActive={true}
              isDeleteActive={isDeleteActive}
              onUpdateItem={handleUpdateItem}
              onAddItem={handleAddItem}
              onStartFresh={handleStartFresh}
              isDesktop={true}
              onOpenPopup={handleOpenItemPopup}
            />
          </div>
        </div>
      </div>

      {/* ===== Bottom Row ===== */}
      <div className={styles.bottomRowCol1}>
        <AddRoomButton
          rooms={rooms}
          displayedRooms={displayedRoomIds}
          onToggleRoom={handleToggleRoom} 
        />
      </div>

      <div className={styles.bottomRowCol2}>
        <div className={styles.leftGroup}>
          <button
            className={styles.myInventoryButton}
            onClick={handleMyInventoryClick}
          >
            <span>My Inventory</span>
            <Icon name="MyInventory" className={styles.myInventoryIcon} />
          </button>
          <button
            className={styles.specialHButton}
            onClick={handleSpecialHClick}
          >
            <span>Special Handling</span>
            <Icon name="SpecialH" className={styles.specialHIcon} />
          </button>
        </div>

        <DeleteButton
          isActive={isDeleteActive}
          onClick={handleDeleteClick}
          className={styles.deleteButtonDesktop}
        />
      </div>

      <div className={styles.bottomRowCol3}>
        <CreateQuoteButton onClick={handleCreateQuoteClick} />
      </div>

      {/* ====== ItemPopup (edit item) ====== */}
  {isItemPopupVisible && (
  <ItemPopup
    item={currentItemData}
    itemInstance={currentItemInstance}
    onClose={handleCloseItemPopup}
    onUpdateItem={handleUpdateItem}
    onAddItem={handleAddItem}
    handleDeleteItem={handleDeleteItem}
    onOpenPopup={handleOpenItemPopup}
    onStartFresh={handleStartFresh}
    lead={lead}
    selectedRoom={selectedRoom}
    roomItemSelections={roomItemSelections}
    setRoomItemSelections={setRoomItemSelections}
  />
)}

      {/* ====== MyInventory Popup ====== */}
      {isMyInventoryVisible && (
        <MyInventory
          setIsMyInventoryVisible={setIsMyInventoryVisible}
          roomItemSelections={roomItemSelections}
          setRoomItemSelections={setRoomItemSelections}
          displayedRooms={displayedRoomIds}
          lead={lead}
        />
      )}

      {/* ====== SpecialH Popup ====== */}
      {isSpecialHVisible && (
        <SpecialH
          setIsSpecialHVisible={setIsSpecialHVisible}
          roomItemSelections={roomItemSelections}
          setRoomItemSelections={setRoomItemSelections}
          displayedRooms={displayedRoomIds}
          selectedRoom={selectedRoom}
          lead={lead}
          handleUpdateItem={handleUpdateItem}
        />
      )}
    </div>
  );
}

export default InventoryDesktop;