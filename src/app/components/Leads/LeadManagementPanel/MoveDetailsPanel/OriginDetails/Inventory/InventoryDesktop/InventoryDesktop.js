"use client";

import React, { useState, useEffect, useMemo } from 'react';
import styles from './InventoryDesktop.module.css';

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

// Data + Utils

/**
 * InventoryDesktop
 *
 * Props:
 *  - stopIndex, setStopIndex
 *  - roomItemSelections: { [roomId]: arrayOfItemInstances }
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
 *  - handleItemSelection, handleUpdateItem, handleAddItem, handleStartFresh
 *  - isDeleteActive, setIsDeleteActive
 */


function InventoryDesktop({
  // Multi-stop
  stopIndex,
  setStopIndex,

  // Items for this stop
  itemsByRoom,
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
}) {
  const { data: allItems = [] } = useQuery({
    queryKey: ['furnitureItems', lead?.brandId],
    queryFn: () => getAllFurnitureItems({ brandId: lead?.brandId }),
    enabled: !!lead?.brandId,
  });
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

  // Count how many times each item appears in "Items" panel
  const allItemsByRoom = Object.values(itemsByRoom[selectedRoom?.id] || []).flat();
  const itemCounts = allItemsByRoom.reduce(
    (acc, inst) => {
      const key = inst.furnitureItemId.toString();
      acc[key] = (acc[key] || 0)  + (inst.count);
      return acc;
    },
    {}
  );

  // Middle panel => get filtered items
  const getFilteredItems = () => {
    if (!selectedRoom) return [];
    // If search query
    if (searchQuery.trim() !== '') {
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

  // FIXED: Improved getGroupedItems function to ensure all properties exist
  const getGroupedItems = () => {
    if (!selectedRoom) return [];
    const arr = itemsByRoom[selectedRoom.id] || [];
  
    return arr.map((inst) => ({
      id: inst.id,
      originId: inst.originId,
      furnitureItemId: inst.furnitureItemId,
      name: inst.name || '',
      imageName: inst.imageName || '',
      letters: inst.letters || [],
      search: inst.search || false,
      tags: inst.tags || [],
      cuft: inst.cuft || 0,
      lbs: inst.lbs || 0,
      roomId: inst.roomId,
      displayedRooms: inst.displayedRooms || [],
      packingNeeds: inst.packingNeeds || {},
      link: inst.link || '',
      notes: inst.notes || '',
      uploadedImages: inst.uploadedImages || [],
      cameraImages: inst.cameraImages || [],
      groupingKey: inst.groupingKey || '',
      autoAdded: inst.autoAdded || false,
      count: inst.count, 
    }));
  };
  
  
  

  // ADDED: New handleItemClick function for My Items panel
  const handleItemClick = (itemData, action) => {
    handleItemSelection(itemData,action)
  };

  // ADDED: Wrapper function for standard items panel
  const handleRegularItemClick = (itemData, action) => {
    // This mirrors the logic in the mobile version's handleItemSelection function
    const doAction = action || (isDeleteActive ? 'decrease' : 'increase');
    
    // Forward to the parent's handleItemSelection with the correct action
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
    return itemsByRoom[selectedRoom?.id] || [];
  }, [itemsByRoom, selectedRoom]);
  

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
          itemsByRoom={itemsByRoom}
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
            itemsByRoom={itemsByRoom}
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
              onItemClick={handleRegularItemClick} // CHANGED: Use wrapper for regular items
              isMyItemsActive={false}
              isDeleteActive={isDeleteActive}
              onUpdateItem={handleUpdateItem}
              onAddItem={handleAddItem}
              onStartFresh={handleStartFresh}
              isDesktop={true}
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
            {/* Debug check for items */}
            {selectedRoom && (() => {
              const myItems = getGroupedItems();
              console.log("🧪 MyItems groupedItems:", myItems);

              
              // Check for any items with missing properties
              myItems.forEach(item => {
                if (!item.imageName || !item.name) {
                  console.error('Invalid item in My Items:', item);
                }
              });
              return null;
            })()}
            
            <ItemList
              items={getGroupedItems()}
              onItemClick={handleItemClick} // CHANGED: Use the new function
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
        {/* We pass numeric IDs => highlight in AddRoomPopup */}
        <AddRoomButton
          rooms={rooms}  // full master list
          displayedRooms={displayedRoomIds}  // array of numeric IDs
          // The parent's function that toggles rooms in inventoryByStop:
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
      {isItemPopupVisible && selectedRoom && (
        <ItemPopup
          item={currentItemData}
          selectedRoom={selectedRoom}
          onClose={handleCloseItemPopup}
          onUpdateItem={handleUpdateItem}
          onAddItem={handleAddItem}
          ItemInstances={currentRoomInstances}
          handleDeleteItem={handleDeleteItem}
          itemInstance={currentItemInstance}
          onStartFresh={handleStartFresh}
          lead={lead}
        />
      )}

      {/* ====== MyInventory Popup ====== */}
      {isMyInventoryVisible && (
        <MyInventory
          setIsMyInventoryVisible={setIsMyInventoryVisible}
          itemsByRoom={itemsByRoom}
          displayedRooms={displayedRoomIds} // numeric IDs
          lead={lead}
        />
      )}

      {/* ====== SpecialH Popup ====== */}
      {isSpecialHVisible && (
        <SpecialH
          setIsSpecialHVisible={setIsSpecialHVisible}
          itemsByRoom={itemsByRoom}
          displayedRooms={displayedRoomIds} // numeric IDs
          lead={lead}
          handleUpdateItem={handleUpdateItem}
        />
      )}
    </div>
  );
}

export default InventoryDesktop;