// src/components/Inventory/Inventory.js

import React, { useState, useEffect, useRef } from 'react';
import styles from './Inventory.module.css';
import TopNavigation from './TopNavigation/TopNavigation';
import RoomList from './RoomList/RoomList';
import HouseHeader from './HouseHeader/HouseHeader';
import FooterNavigation from './FooterNavigation/FooterNavigation';
import ItemSelection from './ItemSelection/ItemSelection';
import SearchHeader from './SearchHeader/SearchHeader';
import rooms from '../../data/constants/AllRoomsList'; // Import rooms data
import allItems from '../../data/constants/funitureItems'; // Import allItems
import { v4 as uuidv4 } from 'uuid'; // Import UUID library for generating unique IDs

// Set IDs of the rooms that will be shown by default initially
const defaultRoomIds = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13];

function Inventory() {
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLetter, setSelectedLetter] = useState(null);
  const [selectedSubButton, setSelectedSubButton] = useState({ letter: null, subButton: null });
  const [roomItemSelections, setRoomItemSelections] = useState(
    rooms.reduce((acc, room) => {
      acc[room.id] = []; // Initialize with an empty array for each room using room.id
      return acc;
    }, {})
  );
  const [isSpecialHVisible, setIsSpecialHVisible] = useState(false);
  const [isToggled, setIsToggled] = useState(true); // Moved isToggled state here

  const prevTotalLbsRef = useRef(null);

  useEffect(() => {
    console.log('roomItemSelections:', roomItemSelections);
  }, [roomItemSelections]);

  const [displayedRooms, setDisplayedRooms] = useState(
    rooms.filter((room) => defaultRoomIds.includes(room.id))
  );
  const [isMyItemsActive, setIsMyItemsActive] = useState(false); // Track if "My Items" button is active
  const [isDeleteActive, setIsDeleteActive] = useState(false);

  const handleRoomSelect = (room) => {
    setSelectedRoom(room);
  };

  const handleBackToRooms = () => {
    setSelectedRoom(null);
    setSearchQuery('');
    setSelectedLetter(null);
    setSelectedSubButton({ letter: null, subButton: null });
  };

  const handleSearch = (query) => {
    setIsMyItemsActive(false); // Deactivate "My Items" button when interacting with search input
    setSearchQuery(query);
    setSelectedLetter(null);
    setSelectedSubButton({ letter: null, subButton: null });
  };

  const handleSearchClick = () => {
    // Reset all the states when the search input is clicked
    setIsMyItemsActive(false);
    setSelectedLetter(null);
    setSelectedSubButton({ letter: null, subButton: null });
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

  // Function to handle item selection
  const handleItemSelection = (clickedItem) => {
    if (!selectedRoom) return;

    setRoomItemSelections((prevSelections) => {
      const currentRoomSelections = prevSelections[selectedRoom.id] || [];
      const updatedRoomSelections = [...currentRoomSelections];

      if (isDeleteActive) {
        // Remove an instance of the item from the room selections
        const index = updatedRoomSelections.findIndex(
          (instance) =>
            instance.itemId === (clickedItem.itemId || clickedItem.id.toString()) &&
            (!isMyItemsActive || JSON.stringify(instance.tags) === JSON.stringify(clickedItem.tags))
        );
        if (index !== -1) {
          updatedRoomSelections.splice(index, 1);
        }
      } else {
        let newItemInstance;
        if (isMyItemsActive) {
          // clickedItem is grouped item data when isMyItemsActive is true
          newItemInstance = {
            id: uuidv4(), // Assign a new unique ID
            groupId: uuidv4(), // Assign a unique groupId
            itemId: clickedItem.itemId,
            item: { ...clickedItem.item }, // Make a copy of the item
            tags: [...clickedItem.tags], // Copy tags
            notes: clickedItem.notes || '', // Copy notes
            cuft: clickedItem.cuft || '', // Copy cuft
            lbs: clickedItem.lbs || '', // Copy lbs
          };
        } else {
          // clickedItem is a regular item
          newItemInstance = {
            id: uuidv4(), // Generate a unique ID for this instance
            groupId: uuidv4(), // Assign a unique groupId
            itemId: clickedItem.id.toString(),
            item: { ...clickedItem }, // Make a shallow copy to prevent mutations
            tags: [...clickedItem.tags], // Copy default tags from the original item
            notes: '', // Default notes
            cuft: '', // Default cuft
            lbs: '', // Default lbs
          };
        }

        // Check if the selected room is 'Disposal' (id: 45)
        if (selectedRoom.id === 45) {
          // Ensure 'disposal' tag is added
          if (!newItemInstance.tags.includes('disposal')) {
            newItemInstance.tags.push('disposal');
          }
        }

        updatedRoomSelections.push(newItemInstance);
      }

      return {
        ...prevSelections,
        [selectedRoom.id]: updatedRoomSelections,
      };
    });
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

  // Ensure "Boxes" room is always displayed
  useEffect(() => {
    const boxesRoom = rooms.find((room) => room.id === 13);
    if (boxesRoom && !displayedRooms.some((room) => room.id === 13)) {
      setDisplayedRooms((prevDisplayedRooms) => [...prevDisplayedRooms, boxesRoom]);
    }
  }, [displayedRooms]);

  // Function to get the count of items selected in the current room
  const getItemCountForCurrentRoom = () => {
    if (!selectedRoom || !roomItemSelections[selectedRoom.id]) return 0;
    return roomItemSelections[selectedRoom.id].length;
  };

  // Function to handle item updates from ItemPopup
  const handleUpdateItem = (updatedItemInstance, originalItemInstance) => {
    setRoomItemSelections((prevSelections) => {
      const updatedSelections = { ...prevSelections };
      const roomItems = updatedSelections[selectedRoom.id] || [];

      // Generate the original grouping key
      const originalKey = `${originalItemInstance.itemId}-${originalItemInstance.tags.sort().join(',')}-${originalItemInstance.notes || ''}-${originalItemInstance.cuft || ''}-${originalItemInstance.lbs || ''}`;

      // Generate the updated grouping key
      const updatedKey = `${updatedItemInstance.itemId}-${updatedItemInstance.tags.sort().join(',')}-${updatedItemInstance.notes || ''}-${updatedItemInstance.cuft || ''}-${updatedItemInstance.lbs || ''}`;

      // Update the groupId if the grouping key has changed
      const newGroupId = originalKey === updatedKey ? originalItemInstance.groupId : uuidv4();

      // Use the original item
      const baseItemInstance = {
        itemId: originalItemInstance.itemId,
        item: originalItemInstance.item,
        groupId: newGroupId, // Use the new or original groupId
        tags: updatedItemInstance.tags,
        notes: updatedItemInstance.notes,
        cuft: updatedItemInstance.cuft,
        lbs: updatedItemInstance.lbs,
      };

      // Find indices of items to update
      const indicesToUpdate = roomItems.reduce((indices, itemInstance, index) => {
        // Match items with the same original grouping key
        const instanceKey = `${itemInstance.itemId}-${itemInstance.tags.sort().join(',')}-${itemInstance.notes || ''}-${itemInstance.cuft || ''}-${itemInstance.lbs || ''}`;
        if (instanceKey === originalKey) {
          indices.push(index);
        }
        return indices;
      }, []);

      const oldCount = indicesToUpdate.length;
      const newCount = updatedItemInstance.count || 1;

      // Update existing instances
      for (let i = 0; i < Math.min(oldCount, newCount); i++) {
        const index = indicesToUpdate[i];
        roomItems[index] = {
          ...roomItems[index],
          ...baseItemInstance,
          id: roomItems[index].id, // Keep existing id
        };
      }

      // Add or remove instances as needed
      if (newCount > oldCount) {
        // Add new instances
        for (let i = oldCount; i < newCount; i++) {
          roomItems.push({
            ...baseItemInstance,
            id: uuidv4(),
          });
        }
      } else if (newCount < oldCount) {
        // Remove extra instances
        for (let i = oldCount - 1; i >= newCount; i--) {
          roomItems.splice(indicesToUpdate[i], 1);
        }
      }

      updatedSelections[selectedRoom.id] = roomItems;
      return updatedSelections;
    });
  };

  // Helper function to get item data by itemId
  const getItemById = (itemId) => {
    return allItems.find((item) => item.id.toString() === itemId);
  };

  // Effect to handle auto-adding boxes based on total lbs
  useEffect(() => {
    if (!isToggled) {
      // Do nothing when toggle is off
      return;
    }

    // Exclude room id 13 (Boxes room) and specific itemIds
    const excludedRoomId = '13';
    const excludedItemIds = ['529', '530', '531', '532', '533', '534', '535', '536', '537'];

    // Calculate total lbs
    let totalLbs = 0;
    Object.keys(roomItemSelections).forEach((roomId) => {
      if (roomId === excludedRoomId) return;

      const items = roomItemSelections[roomId];
      items.forEach((itemInstance) => {
        if (!excludedItemIds.includes(itemInstance.itemId)) {
          // Use itemInstance.lbs or fallback to itemInstance.item.lbs
          const lbs = parseFloat(itemInstance.lbs || itemInstance.item.lbs);
          if (!isNaN(lbs)) {
            totalLbs += lbs;
          }
        }
      });
    });

    // Check if totalLbs has changed
    if (prevTotalLbsRef.current === totalLbs) {
      // No change in total lbs, no need to update boxes
      return;
    }

    prevTotalLbsRef.current = totalLbs;

    // Calculate number of boxes needed
    const boxesPer200lbs = 3;
    const num200lbsUnits = Math.ceil(totalLbs / 200);
    const totalBoxesNeeded = num200lbsUnits * boxesPer200lbs;

    // Box distribution
    const distribution = [
      { percent: 0.10, itemId: '533' }, // Box Dishpack
      { percent: 0.05, itemId: '529' }, // Box Wardrobe 12cuft
      { percent: 0.20, itemId: '534' }, // Box Large 4.5 cuft
      { percent: 0.45, itemId: '535' }, // Box Medium 3 cuft
      { percent: 0.20, itemId: '536' }, // Box Small 1.5 cuft
    ];

    // Calculate boxes to add
    const boxesToAdd = distribution.map((dist) => {
      const count = Math.round(totalBoxesNeeded * dist.percent);
      return { itemId: dist.itemId, count };
    });

    // Update the "Boxes" room
    setRoomItemSelections((prevSelections) => {
      const updatedSelections = { ...prevSelections };
      const boxesRoomId = '13';
      const currentBoxes = updatedSelections[boxesRoomId] || [];

      // Remove existing auto-added boxes
      const nonAutoBoxes = currentBoxes.filter((item) => !item.autoAdded);

      // Generate new auto-added boxes
      const newBoxItems = [];

      boxesToAdd.forEach((box) => {
        for (let i = 0; i < box.count; i++) {
          const itemData = getItemById(box.itemId);
          if (itemData) {
            const newItemInstance = {
              id: uuidv4(),
              groupId: uuidv4(),
              itemId: box.itemId,
              item: { ...itemData },
              tags: [],
              notes: '',
              cuft: itemData.cuft || '',
              lbs: itemData.lbs || '',
              autoAdded: true, // Mark as auto-added
            };
            newBoxItems.push(newItemInstance);
          }
        }
      });

      // Update the "Boxes" room items
      updatedSelections[boxesRoomId] = [...nonAutoBoxes, ...newBoxItems];
      return updatedSelections;
    });
  }, [isToggled, roomItemSelections]);

  return (
    <div className={styles.inventoryContainer}>
      <header className={styles.header}>
        <TopNavigation
          inRoom={!!selectedRoom}
          roomName={selectedRoom ? selectedRoom.name : 'Go to Quote'}
          onBack={handleBackToRooms}
        />
        {selectedRoom ? (
          <SearchHeader
            roomName={selectedRoom.name}
            searchQuery={searchQuery}
            onSearch={handleSearch}
            onSearchClick={handleSearchClick}
            onSearchFocus={handleSearchClick} // Use handleSearchClick to reset when focusing on the search bar
          />
        ) : (
          <HouseHeader
            onToggleRoom={handleToggleRoom} // Correctly pass onToggleRoom
            rooms={rooms}
            displayedRooms={displayedRooms}
          />
        )}
      </header>

      <main className={styles.mainContent}>
        {selectedRoom ? (
          <ItemSelection
            room={selectedRoom}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            selectedLetter={selectedLetter}
            selectedSubButton={selectedSubButton}
            onLetterSelect={handleLetterSelect}
            onSubButtonSelect={handleSubButtonSelect}
            itemClickCounts={roomItemSelections[selectedRoom.id] || {}}
            onItemClick={handleItemSelection}
            itemCount={getItemCountForCurrentRoom()} // Pass the item count for current room
            isMyItemsActive={isMyItemsActive} // Pass the state to ItemSelection
            setIsMyItemsActive={setIsMyItemsActive} // Pass the setter to ItemSelection
            isDeleteActive={isDeleteActive} // Pass the state to ItemSelection for delete functionality
            itemInstances={roomItemSelections[selectedRoom.id] || []}
            onUpdateItem={handleUpdateItem} // Pass the onUpdateItem function
            isToggled={isToggled}
            setIsToggled={setIsToggled} // Pass the toggle state and setter
          />
        ) : (
          <RoomList
            onRoomSelect={handleRoomSelect}
            roomItemSelections={roomItemSelections}
            displayedRooms={displayedRooms}
          />
        )}
      </main>

      <FooterNavigation
        inRoom={!!selectedRoom}
        onBackToRooms={handleBackToRooms}
        isDeleteActive={isDeleteActive}
        setIsDeleteActive={setIsDeleteActive}
        isSpecialHVisible={isSpecialHVisible}
        setIsSpecialHVisible={setIsSpecialHVisible}
        roomItemSelections={roomItemSelections}
        setRoomItemSelections={setRoomItemSelections} // Pass the setter
        selectedRoom={selectedRoom} // Pass the selectedRoom
        displayedRooms={displayedRooms} // Pass displayedRooms to FooterNavigation
      />
    </div>
  );
}

export default Inventory;
