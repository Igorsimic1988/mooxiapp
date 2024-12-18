// src/components/Inventory/InventoryDesktop/InventoryDesktop.js

import React, { useState, useEffect } from 'react'; 
import styles from './InventoryDesktop.module.css';
import BackButton from './BackButton/BackButton';
import ToggleSwitch from '../ItemSelection/BcalculatorMyitems/ToogleSwitch/ToogleSwitch';
import RoomList from '../RoomList/RoomList';
import HouseInfo from '../HouseHeader/HouseInfo/HouseInfo';
import AddRoomButton from '../HouseHeader/AddRoomButton/AddRoomButton';
import SearchHeader from '../SearchHeader/SearchHeader';
import AlphabetButtons from '../ItemSelection/AlphabetFilter/AlphabetButtons/AlphabetButtons';
import ItemList from '../ItemSelection/ItemList/ItemList';
import allItems from '../../../../../../../data/constants/funitureItems';
import CreateQuoteButton from './CreateQuoteButton/CreateQuoteButton';
import { v4 as uuidv4 } from 'uuid';
import { generateGroupingKey } from '../utils/generateGroupingKey';
import FurnitureCounter from './FurnitureCounter/FurnitureCounter';

import { ReactComponent as ExpandIcon } from '../../../../../../../assets/icons/expand.svg';
import { ReactComponent as CollapseIcon } from '../../../../../../../assets/icons/collapse.svg';
import { ReactComponent as MyInventoryIcon } from '../../../../../../../assets/icons/MyInventoryPopupIcon.svg';
import { ReactComponent as SpecialHIcon } from '../../../../../../../assets/icons/specialh.svg';

import ItemPopup from '../ItemSelection/Item/ItemPopup/ItemPopup'; // Make sure to import ItemPopup

import MyInventory from '../FooterNavigation/MyInventory/MyInventory';
import SpecialH from '../FooterNavigation/SpecialH/SpecialH';
import DeleteButton from '../FooterNavigation/DeleteButton/DeleteButton';

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
  // State for ItemPopup
  const [isItemPopupVisible, setIsItemPopupVisible] = useState(false);
  const [currentItemData, setCurrentItemData] = useState(null);
  const [currentItemInstance, setCurrentItemInstance] = useState(null);

  // States for MyInventory, SpecialH, and DeleteButton
  const [isMyInventoryVisible, setIsMyInventoryVisible] = useState(false);
  const [isSpecialHVisible, setIsSpecialHVisible] = useState(false);
  const [isDeleteActive, setIsDeleteActive] = useState(false);
    // State to control expansion
    const [isExpanded, setIsExpanded] = useState(false);

    useEffect(() => {
      if (!selectedRoom && displayedRooms && displayedRooms.length > 0) {
        setSelectedRoom(displayedRooms[0]);
      }
    }, [selectedRoom, displayedRooms, setSelectedRoom]);

    // Handler for expand/collapse button
    const handleExpandCollapse = () => {
      setIsExpanded((prev) => !prev);
    };

  // Function to open ItemPopup
  const handleOpenItemPopup = (itemData, itemInstance) => {
    setCurrentItemData(itemData);
    setCurrentItemInstance(itemInstance);
    setIsItemPopupVisible(true);
  };
  // Function to close ItemPopup
  const handleCloseItemPopup = () => {
    setIsItemPopupVisible(false);
    setCurrentItemData(null);
    setCurrentItemInstance(null);
  };
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

  const handleItemSelection = (clickedItem, action, isMyItemsActiveParam) => {
    if (!selectedRoom) return;

    // Determine the action based on isDeleteActive if action is not provided
    if (!action) {
      action = isDeleteActive ? 'decrease' : 'increase';
    }

    setRoomItemSelections((prevSelections) => {
      const currentRoomSelections = prevSelections[selectedRoom.id] || [];
      let updatedRoomSelections = [...currentRoomSelections];

      if (action === 'decrease') {
        // Deletion logic: delete one instance
        let indexToDelete = -1;

        if (isMyItemsActiveParam) {
          // Find the index of one instance matching the groupingKey
          indexToDelete = updatedRoomSelections.findIndex(
            (itemInstance) => itemInstance.groupingKey === clickedItem.groupingKey
          );
        } else {
          // clickedItem is from allItems
          const itemIdToDelete = clickedItem.id.toString();
          indexToDelete = updatedRoomSelections.findIndex(
            (itemInstance) => itemInstance.itemId === itemIdToDelete
          );
        }

        if (indexToDelete !== -1) {
          updatedRoomSelections.splice(indexToDelete, 1);
        }
      } else if (action === 'increase') {
        // Logic to add items
        let newItemInstance;
        if (isMyItemsActiveParam) {
          // Fetch the original item data using itemId
          const originalItemData = allItems.find(
            (item) => item.id.toString() === clickedItem.itemId
          );

          if (!originalItemData) {
            console.error(`Item with id ${clickedItem.itemId} not found in allItems`);
            return prevSelections;
          }

          newItemInstance = {
            id: uuidv4(),
            itemId: clickedItem.itemId,
            item: { ...originalItemData }, // Use full item data
            tags: [...clickedItem.tags],
            notes: clickedItem.notes || '',
            cuft: clickedItem.cuft || '',
            lbs: clickedItem.lbs || '',
            packingNeedsCounts: { ...clickedItem.packingNeedsCounts },
            link: clickedItem.link || '',
            uploadedImages: [...(clickedItem.uploadedImages || [])],
            cameraImages: [...(clickedItem.cameraImages || [])],
            groupingKey: clickedItem.groupingKey,
          };
        } else {
          // clickedItem is a regular item
          // Existing logic
          let defaultPackingNeedsCounts = {};
          if (clickedItem.packing && clickedItem.packing.length > 0) {
            clickedItem.packing.forEach((pack) => {
              defaultPackingNeedsCounts[pack.type] = pack.quantity;
            });
          }

          newItemInstance = {
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

          // Generate and store the groupingKey using the imported function
          newItemInstance.groupingKey = generateGroupingKey(newItemInstance);
        }

        updatedRoomSelections.push(newItemInstance);
      }

      return {
        ...prevSelections,
        [selectedRoom.id]: updatedRoomSelections,
      };
    });
  };

  const handleUpdateItem = (updatedItemInstance, originalItemInstance) => {
    setRoomItemSelections((prevSelections) => {
      const updatedSelections = { ...prevSelections };
      let roomItems = updatedSelections[selectedRoom.id] || [];
  
      // Find all items in the same group as the original item
      const groupItems = roomItems.filter(
        (itemInstance) => itemInstance.groupingKey === originalItemInstance.groupingKey
      );
  
      if (groupItems.length === 0) {
        console.error('Group not found for update.');
        return updatedSelections;
      }
  
      // Remove old group items from roomItems
      roomItems = roomItems.filter(
        (itemInstance) => itemInstance.groupingKey !== originalItemInstance.groupingKey
      );
  
      // Generate the updated grouping key
      const updatedKey = generateGroupingKey(updatedItemInstance);
      updatedItemInstance.groupingKey = updatedKey;
  
      // Handle item count
      const newCount =
        updatedItemInstance.count !== undefined ? updatedItemInstance.count : 1;
  
      const newGroupItems = [];
  
      for (let i = 0; i < newCount; i++) {
        newGroupItems.push({
          ...updatedItemInstance,
          id: i === 0 ? originalItemInstance.id : uuidv4(), // Retain the original id for the first instance
        });
      }
  
      // Add the new group items back into roomItems
      roomItems = roomItems.concat(newGroupItems);
  
      // Update the selections
      updatedSelections[selectedRoom.id] = roomItems;
  
      return updatedSelections;
    });
  };
  

  const handleAddItem = (newItemInstance) => {
    if (!selectedRoom) return;

    setRoomItemSelections((prevSelections) => {
      const currentRoomSelections = prevSelections[selectedRoom.id] || [];
      const updatedRoomSelections = [...currentRoomSelections];

      // Generate groupingKey for the new item instance
      newItemInstance.groupingKey = generateGroupingKey(newItemInstance);

      const itemCount =
        newItemInstance.count !== undefined ? newItemInstance.count : 1;

      for (let i = 0; i < itemCount; i++) {
        updatedRoomSelections.push({
          ...newItemInstance,
          id: i === 0 ? newItemInstance.id : uuidv4(), // Retain the original id for the first instance
        });
      }

      return {
        ...prevSelections,
        [selectedRoom.id]: updatedRoomSelections,
      };
    });
  };

  const handleStartFresh = (newItemInstance) => {
    // Start fresh logic
  };

  const getFilteredItems = () => {
    if (!selectedRoom) return [];

    let filteredItems = [];

    if (searchQuery.trim() !== '') {
      // Filter items whose name includes the search query, and item.search !== 'N'
      filteredItems = allItems.filter((item) => {
        const matchesQuery = item.name.toLowerCase().includes(searchQuery.toLowerCase());
        const isSearchable = item.search !== 'N';
        return matchesQuery && isSearchable;
      });

      // **Include "Custom Item" when no other items match the search**
      if (filteredItems.length === 0) {
        const customItem = allItems.find((item) => item.name === 'Custom Item');
        if (customItem) {
          filteredItems = [customItem];
        }
      }

      return filteredItems;
    }

    if (selectedSubButton && selectedSubButton.subButton) {
      // Show items that have the selected sub-button, regardless of room
      filteredItems = allItems.filter((item) => item.letters.includes(selectedSubButton.subButton));
      return filteredItems;
    }

    if (selectedLetter) {
      // Show items that have the selected letter, regardless of room
      filteredItems = allItems.filter((item) => item.letters.includes(selectedLetter));
      return filteredItems;
    }

    // No search query, letter, or sub-button selected
    // Display default items for the current room
    filteredItems = allItems.filter((item) => item.rooms.includes(Number(selectedRoom.id)));
    return filteredItems;
  };

  // Compute item counts for the current room
  const itemCounts = roomItemSelections[selectedRoom?.id]?.reduce((counts, instance) => {
    const key = instance.itemId.toString();
    counts[key] = (counts[key] || 0) + 1;
    return counts;
  }, {}) || {};

  const getGroupedItems = () => {
    if (!selectedRoom) return [];

    // Get item instances only from the selected room
    const roomItemInstances = roomItemSelections[selectedRoom.id] || [];

    // Group items by their groupingKey
    const groupedItemsMap = roomItemInstances.reduce((groups, instance) => {
      const key = instance.groupingKey;
      if (!groups[key]) {
        // Fetch the original item data using itemId
        const originalItemData = allItems.find(
          (item) => item.id.toString() === instance.itemId
        );

        if (!originalItemData) {
          console.error(`Item with id ${instance.itemId} not found in allItems`);
          return groups;
        }

        groups[key] = {
          // Assign a stable id to use as a key
          id: instance.id, // Use the existing id
          groupingKey: key,
          itemId: instance.itemId,
          item: { ...originalItemData }, // Use full item data
          tags: [...instance.tags],
          notes: instance.notes,
          cuft: instance.cuft,
          lbs: instance.lbs,
          packingNeedsCounts: { ...instance.packingNeedsCounts },
          link: instance.link || '',
          uploadedImages: [...(instance.uploadedImages || [])],
          cameraImages: [...(instance.cameraImages || [])],
          count: 1,
        };
      } else {
        groups[key].count += 1; // Aggregate counts
      }
      return groups;
    }, {});

    return Object.values(groupedItemsMap);
  };

  // Handlers for MyInventory, SpecialH, and DeleteButton
  const handleDeleteClick = () => {
    setIsDeleteActive((prevState) => !prevState);
  };

  const handleSpecialHClick = () => {
    setIsSpecialHVisible(true);
  };

  const handleMyInventoryClick = () => {
    setIsMyInventoryVisible(true);
  };

  // Pass the functions to SearchHeader
  const handleSearchFocus = () => {
    handleSearchClick();
  };

  return (
    <div
    className={`${styles.inventoryDesktopContainer} ${
      isExpanded ? styles.expanded : ''
    }`}
  >
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
  <FurnitureCounter
    roomItemSelections={roomItemSelections}
    displayedRooms={displayedRooms}
  />
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

      {/* Middle Row Column 2 */}
      <div className={styles.middleRowCol2}>
        {/* Items Header */}
        <div className={styles.itemsHeader}>
  <div className={styles.itemsHeaderText}>Items</div>
  <button
    className={styles.expandCollapseButton}
    onClick={handleExpandCollapse}
  >
    {isExpanded ? <CollapseIcon /> : <ExpandIcon />}
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
          {/* AlphabetButtons */}
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
              isDeleteActive={isDeleteActive} // Use isDeleteActive state
              onUpdateItem={handleUpdateItem}
              onAddItem={handleAddItem}
              onStartFresh={handleStartFresh}
              isDesktop={true} // Indicate that this is the desktop version
      
            />
          </div>
        </div>
      </div>

      {/* Middle Row Column 3 */}
      <div className={styles.middleRowCol3}>
        {/* Items Header */}
        <div className={styles.itemsHeader}>
          <div className={styles.itemsHeaderText}>My Items</div>
          {/* No ExpandIcon button */}
        </div>
        {/* Spacer */}
        <div className={styles.itemsSpacer}></div>
        {/* Common Items Banner */}
        <div className={styles.commonItemsBanner}>
          <p>MY INVENTORY</p>
        </div>
        {/* Items Content Container */}
        <div className={styles.itemsContentContainer}>
          {/* No AlphabetButtons */}
          <div className={`${styles.itemListPlaceholder} ${styles.myItemsListPlaceholder}`}>
            <ItemList
              items={getGroupedItems()}
              itemClickCounts={{}}
              onItemClick={handleItemSelection}
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
  {/* Group MyInventory and SpecialH on the left */}
  <div className={styles.leftGroup}>
    <button className={styles.myInventoryButton} onClick={handleMyInventoryClick}>
      <span>My Inventory</span>
      <MyInventoryIcon className={styles.myInventoryIcon} />
    </button>
    <button className={styles.specialHButton} onClick={handleSpecialHClick}>
      <span>Special Handling</span>
      <SpecialHIcon className={styles.specialHIcon} />
    </button>
  </div>
  {/* DeleteButton on the right */}
  <DeleteButton
    isActive={isDeleteActive}
    onClick={handleDeleteClick}
    className={styles.deleteButtonDesktop}
  />
</div>
<div className={styles.bottomRowCol3}>
  <CreateQuoteButton />
</div>

      {/* Render ItemPopup at InventoryDesktop level */}
      {isItemPopupVisible && (
        <ItemPopup
          item={currentItemData}
          onClose={handleCloseItemPopup}
          onUpdateItem={handleUpdateItem}
          onAddItem={handleAddItem}
          itemInstance={currentItemInstance}
          onStartFresh={handleStartFresh}
        />
      )}

      {/* Render MyInventory Popup */}
      {isMyInventoryVisible && (
        <MyInventory
          setIsMyInventoryVisible={setIsMyInventoryVisible}
          roomItemSelections={roomItemSelections}
          displayedRooms={displayedRooms}
        />
      )}

      {/* Render SpecialH Popup */}
      {isSpecialHVisible && (
        <SpecialH
          setIsSpecialHVisible={setIsSpecialHVisible}
          roomItemSelections={roomItemSelections}
          setRoomItemSelections={setRoomItemSelections}
          selectedRoom={selectedRoom}
          displayedRooms={displayedRooms}
        />
      )}
    </div>
  );
}

export default InventoryDesktop;