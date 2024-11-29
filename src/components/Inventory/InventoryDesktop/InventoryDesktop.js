// src/components/Inventory/InventoryDesktop/InventoryDesktop.js

import React from 'react';
import styles from './InventoryDesktop.module.css';
import BackButton from './BackButton/BackButton';
import ToggleSwitch from '../ItemSelection/BcalculatorMyitems/ToogleSwitch/ToogleSwitch';
import RoomList from '../RoomList/RoomList';
import HouseInfo from '../HouseHeader/HouseInfo/HouseInfo';
import AddRoomButton from '../HouseHeader/AddRoomButton/AddRoomButton';
import SearchHeader from '../SearchHeader/SearchHeader';
import AlphabetButtons from '../ItemSelection/AlphabetFilter/AlphabetButtons/AlphabetButtons';
import ItemList from '../ItemSelection/ItemList/ItemList';
import allItems from '../../../data/constants/funitureItems';
import CreateQuoteButton from './CreateQuoteButton/CreateQuoteButton';
import { v4 as uuidv4 } from 'uuid';
import { generateGroupingKey } from '../utils/generateGroupingKey';

import { ReactComponent as ExpandIcon } from '../../../assets/icons/expand.svg';
import { ReactComponent as CollapseIcon } from '../../../assets/icons/collapse.svg';

function InventoryDesktop({
  roomItemSelections,
  setRoomItemSelections,
  displayedRooms,
  setDisplayedRooms,
  isToggled,
  setIsToggled,
  selectedRoom,
  setSelectedRoom,
  rooms,
  searchQuery,
  handleSearch,
  handleSearchClick,
  selectedLetter,
  setSelectedLetter,
  selectedSubButton,
  setSelectedSubButton,
  isMyItemsActive,
  setIsMyItemsActive,
  setSearchQuery,
}) {
  // Handler function for the toggle switch
  const handleToggle = () => {
    setIsToggled((prev) => !prev);
  };

  // Handler function for room selection
  const handleRoomSelect = (room) => {
    setSelectedRoom(room);
  };

  // Function to toggle room visibility
  const handleToggleRoom = (roomId) => {
    if (roomId === 13) {
      // Prevent toggling room id=13 (Boxes)
      return;
    }

    const roomToToggle = rooms.find((room) => room.id === roomId);
    if (!roomToToggle) return;

    setDisplayedRooms((prevDisplayedRooms) => {
      if (prevDisplayedRooms.some((room) => room.id === roomId)) {
        // If the room is already displayed, remove it
        return prevDisplayedRooms.filter((room) => room.id !== roomId);
      } else {
        // If the room is not displayed, add it
        return [...prevDisplayedRooms, roomToToggle];
      }
    });
  };

  const handleLetterSelect = (letter) => {
    setIsMyItemsActive(false); // Deactivate "My Items" button
    if (selectedLetter === letter) {
      setSelectedLetter(null);
      setSelectedSubButton({ letter: null, subButton: null });
    } else {
      setSelectedLetter(letter);
      setSelectedSubButton({ letter: null, subButton: null });
      setSearchQuery('');
    }
  };

  const handleSubButtonSelect = (letter, subButton) => {
    setIsMyItemsActive(false); // Deactivate "My Items" button
    if (
      selectedSubButton &&
      selectedSubButton.subButton === subButton &&
      selectedSubButton.letter === letter
    ) {
      // Deselect the sub-button if it's already selected
      setSelectedSubButton({ letter: null, subButton: null });
      setSelectedLetter(null); // Optionally deselect the letter as well
    } else {
      // Select the new sub-button
      setSelectedSubButton({ letter, subButton });
      setSelectedLetter(letter);
      setSearchQuery('');
    }
  };

  const handleItemSelection = (clickedItem, action) => {
    if (!selectedRoom) return;
  
    // For desktop, you may not have isDeleteActive; adjust as needed
    if (!action) {
      action = 'increase'; // Default action
    }
  
    setRoomItemSelections((prevSelections) => {
      const currentRoomSelections = prevSelections[selectedRoom.id] || [];
      let updatedRoomSelections = [...currentRoomSelections];
  
      if (action === 'decrease') {
        // Deletion logic: delete one instance
        const itemIdToDelete = clickedItem.id.toString();
        const indexToDelete = updatedRoomSelections.findIndex(
          (itemInstance) => itemInstance.itemId === itemIdToDelete
        );
  
        if (indexToDelete !== -1) {
          updatedRoomSelections.splice(indexToDelete, 1);
        }
      } else if (action === 'increase') {
        // Logic to add items
        let defaultPackingNeedsCounts = {};
        if (clickedItem.packing && clickedItem.packing.length > 0) {
          clickedItem.packing.forEach((pack) => {
            defaultPackingNeedsCounts[pack.type] = pack.quantity;
          });
        }
  
        const newItemInstance = {
          id: uuidv4(),
          itemId: clickedItem.id.toString(),
          item: { ...clickedItem },
          tags: [...clickedItem.tags],
          notes: '',
          cuft: clickedItem.cuft || '',
          lbs: clickedItem.lbs || '',
          packingNeedsCounts: defaultPackingNeedsCounts,
          link: '', // Initialize link
          uploadedImages: [], // Initialize uploadedImages
          cameraImages: [], // Initialize cameraImages
        };
  
        // Generate and store the groupingKey
        newItemInstance.groupingKey = generateGroupingKey(newItemInstance);
  
        updatedRoomSelections.push(newItemInstance);
      }
  
      return {
        ...prevSelections,
        [selectedRoom.id]: updatedRoomSelections,
      };
    });
  };
  
  const handleUpdateItem = (updatedItemInstance, originalItemInstance) => {
    // Update item instance logic
  };
  
  const handleAddItem = (newItemInstance) => {
    // Add new item logic
  };
  
  const handleStartFresh = (newItemInstance) => {
    // Start fresh logic
  };

  const getFilteredItems = () => {
    if (!selectedRoom) return [];
  
    if (searchQuery.trim() !== '') {
      // Filter items whose name includes the search query, and item.search !== 'N'
      return allItems.filter((item) => {
        const matchesQuery = item.name.toLowerCase().includes(searchQuery.toLowerCase());
        const isSearchable = item.search !== 'N';
        return matchesQuery && isSearchable;
      });
    }
  
    if (selectedSubButton && selectedSubButton.subButton) {
      // Show items that have the selected sub-button, regardless of room
      return allItems.filter((item) => item.letters.includes(selectedSubButton.subButton));
    }
  
    if (selectedLetter) {
      // Show items that have the selected letter, regardless of room
      return allItems.filter((item) => item.letters.includes(selectedLetter));
    }
  
    // No search query, letter, or sub-button selected
    // Display default items for the current room
    return allItems.filter((item) => item.rooms.includes(Number(selectedRoom.id)));
  };
  
  // Compute item counts for the current room
  const itemCounts = roomItemSelections[selectedRoom?.id]?.reduce((counts, instance) => {
    const key = instance.itemId.toString();
    counts[key] = (counts[key] || 0) + 1;
    return counts;
  }, {}) || {};

  // Pass the functions to SearchHeader
  const handleSearchFocus = () => {
    handleSearchClick();
  };

  return (
    <div className={styles.inventoryDesktopContainer}>
      {/* Top Row */}
      <div className={styles.topRowCol1}>
        <BackButton />
        <ToggleSwitch isToggled={isToggled} onToggle={handleToggle} />
      </div>
      <div className={styles.topRowCol2}>
        <SearchHeader
          roomName={selectedRoom ? selectedRoom.name : 'Inventory'}
          searchQuery={searchQuery}
          onSearch={handleSearch}
          onSearchClick={handleSearchClick}
          onSearchFocus={handleSearchFocus}
        />
      </div>
      <div className={styles.topRowCol3}>
        <p>Furniture Count: 0</p>
        <p>Boxes Count: 0</p>
      </div>

      {/* Middle Row */}
      <div className={styles.middleRowCol1}>
        <div className={styles.houseInfo}>
          <HouseInfo />
        </div>
        <div className={styles.roomListContainer}>
          <RoomList
            onRoomSelect={handleRoomSelect}
            roomItemSelections={roomItemSelections}
            displayedRooms={displayedRooms}
            selectedRoom={selectedRoom}
          />
        </div>
      </div>

      {/* Updated middleRowCol2 */}
      <div className={styles.middleRowCol2}>
        {/* Items Header */}
        <div className={styles.itemsHeader}>
          <div className={styles.itemsHeaderText}>Items</div>
          <button className={styles.expandCollapseButton}>
            <ExpandIcon />
          </button>
        </div>
        {/* Spacer */}
        <div className={styles.itemsSpacer}></div>
        {/* Common Items Banner */}
        <div className={styles.commonItemsBanner}>
          <p>COMMON ITEMS FOR THIS ROOM</p>
        </div>
        {/* Items Content Container */}
        <div className={styles.itemsContentContainer}>
          {/* Wrap AlphabetButtons inside a new div */}
          <div className={styles.alphabetButtonsWrapper}>
            <AlphabetButtons
              selectedLetter={selectedLetter}
              selectedSubButton={selectedSubButton}
              onLetterSelect={handleLetterSelect}
              onSubButtonClick={handleSubButtonSelect}
            />
          </div>
          <div className={styles.itemListPlaceholder}>
          <ItemList
    items={getFilteredItems()}
    itemClickCounts={itemCounts}
    onItemClick={handleItemSelection}
    isMyItemsActive={false} // Always false for desktop
    isDeleteActive={false} // Adjust based on your desktop logic
    onUpdateItem={handleUpdateItem}
    onAddItem={handleAddItem}
    onStartFresh={handleStartFresh}
    isDesktop={true} // Indicate that this is the desktop version
  />
          </div>
        </div>
      </div>
      <div className={styles.middleRowCol3}>
        <p>Selected Items</p>
      </div>

      {/* Bottom Row */}
      <div className={styles.bottomRowCol1}>
        {/* Add Room Button */}
        <AddRoomButton
          rooms={rooms}
          displayedRooms={displayedRooms}
          onToggleRoom={handleToggleRoom}
        />
      </div>
      <div className={styles.bottomRowCol2}>
      <CreateQuoteButton />
      </div>
      <div className={styles.bottomRowCol3}>
        <button>Button 1</button>
        <button>Button 2</button>
      </div>
    </div>
  );
}

export default InventoryDesktop;
