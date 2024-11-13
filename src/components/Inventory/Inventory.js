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

  // Function to handle starting fresh with a new item
  const handleStartFresh = (newItemInstance) => {
    if (!selectedRoom) return;

    setRoomItemSelections((prevSelections) => {
      const currentRoomSelections = prevSelections[selectedRoom.id] || [];
      const updatedRoomSelections = [...currentRoomSelections, newItemInstance];

      return {
        ...prevSelections,
        [selectedRoom.id]: updatedRoomSelections,
      };
    });
  };

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

  // Helper function to generate the grouping key
  const generateGroupingKey = (instance) => {
    const tagsKey = instance.tags.sort().join(',');
    const notesKey = instance.notes || '';
    const cuftKey = instance.cuft || '';
    const lbsKey = instance.lbs || '';
    const packingNeedsEntries = Object.entries(instance.packingNeedsCounts || {}).sort();
    const packingNeedsKey = packingNeedsEntries.map(([key, value]) => `${key}:${value}`).join(',');

    return `${instance.itemId}-${tagsKey}-${notesKey}-${cuftKey}-${lbsKey}-${packingNeedsKey}`;
  };

  // Function to handle item selection
  const handleItemSelection = (clickedItem) => {
    if (!selectedRoom) return;
  
    setRoomItemSelections((prevSelections) => {
      const currentRoomSelections = prevSelections[selectedRoom.id] || [];
      let updatedRoomSelections = [...currentRoomSelections];
  
      if (isDeleteActive) {
        if (isMyItemsActive) {
          // clickedItem is a grouped item with groupingKey
          const groupingKeyToDelete = clickedItem.groupingKey;
          // Remove one item matching the groupingKey
          const indexToRemove = updatedRoomSelections.findIndex(
            (itemInstance) => itemInstance.groupingKey === groupingKeyToDelete
          );
          if (indexToRemove !== -1) {
            updatedRoomSelections.splice(indexToRemove, 1);
          }
        } else {
          // clickedItem is a regular item
          const itemIdToDelete = clickedItem.id.toString();
          // Remove one instance of this item
          const indexToRemove = updatedRoomSelections.findIndex(
            (itemInstance) => itemInstance.itemId === itemIdToDelete
          );
          if (indexToRemove !== -1) {
            updatedRoomSelections.splice(indexToRemove, 1);
          }
        }
      } else {
        // Existing logic to add items
        let newItemInstance;
        if (isMyItemsActive) {
          // clickedItem is grouped item data when isMyItemsActive is true
          newItemInstance = {
            id: uuidv4(),
            itemId: clickedItem.itemId,
            item: { ...clickedItem.item },
            tags: [...clickedItem.tags],
            notes: clickedItem.notes || '',
            cuft: clickedItem.cuft || '',
            lbs: clickedItem.lbs || '',
            packingNeedsCounts: { ...clickedItem.packingNeedsCounts },
            groupingKey: clickedItem.groupingKey,
          };
        } else {
          // clickedItem is a regular item
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
          };
  
          // Generate and store the groupingKey
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

      // Use the stored groupingKey to find items to update
      const originalKey = originalItemInstance.groupingKey;

      // Generate the updated grouping key
      const updatedKey = generateGroupingKey(updatedItemInstance);

      // Update the groupingKey on the updatedItemInstance
      updatedItemInstance.groupingKey = updatedKey;

      // Find indices of items to update based on the stored groupingKey
      const indicesToUpdate = roomItems.reduce((indices, itemInstance, index) => {
        if (itemInstance.groupingKey === originalKey) {
          indices.push(index);
        }
        return indices;
      }, []);

      const oldCount = indicesToUpdate.length;
      const newCount = updatedItemInstance.count !== undefined ? updatedItemInstance.count : 1;

      if (newCount === 0) {
        // Remove all instances matching the grouping key
        for (let i = indicesToUpdate.length - 1; i >= 0; i--) {
          roomItems.splice(indicesToUpdate[i], 1);
        }
      } else {
        // Update existing instances
        for (let i = 0; i < Math.min(oldCount, newCount); i++) {
          const index = indicesToUpdate[i];
          roomItems[index] = {
            ...roomItems[index],
            ...updatedItemInstance,
            id: roomItems[index].id, // Keep existing id
          };
        }

        // Add or remove instances as needed
        if (newCount > oldCount) {
          // Add new instances
          for (let i = oldCount; i < newCount; i++) {
            roomItems.push({
              ...updatedItemInstance,
              id: uuidv4(),
            });
          }
        } else if (newCount < oldCount) {
          // Remove extra instances
          for (let i = oldCount - 1; i >= newCount; i--) {
            roomItems.splice(indicesToUpdate[i], 1);
          }
        }
      }

      updatedSelections[selectedRoom.id] = roomItems;
      return updatedSelections;
    });
  };

  // Function to handle adding new items
  const handleAddItem = (newItemInstance) => {
    if (!selectedRoom) return;
  
    setRoomItemSelections((prevSelections) => {
      const currentRoomSelections = prevSelections[selectedRoom.id] || [];
      const updatedRoomSelections = [...currentRoomSelections];
  
      // Add as many instances as specified by newItemInstance.count
      const itemCount = newItemInstance.count || 1;
      for (let i = 0; i < itemCount; i++) {
        // Create a new instance with a unique id
        updatedRoomSelections.push({
          ...newItemInstance,
          id: uuidv4(),
        });
      }
  
      return {
        ...prevSelections,
        [selectedRoom.id]: updatedRoomSelections,
      };
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
            // Initialize packingNeedsCounts based on itemData.packing
            let packingNeedsCounts = {};
            if (itemData.packing && itemData.packing.length > 0) {
              itemData.packing.forEach((pack) => {
                packingNeedsCounts[pack.type] = pack.quantity;
              });
            }

            const newItemInstance = {
              id: uuidv4(),
              itemId: box.itemId,
              item: { ...itemData },
              tags: [...itemData.tags], // Assign default tags
              notes: '',
              cuft: itemData.cuft || '',
              lbs: itemData.lbs || '',
              packingNeedsCounts: packingNeedsCounts, // Initialize packing needs
              autoAdded: true, // Mark as auto-added
              groupingKey: '', // Will be set below
            };

            // Generate groupingKey
            newItemInstance.groupingKey = generateGroupingKey(newItemInstance);

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
            onToggleRoom={handleToggleRoom}
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
            onAddItem={handleAddItem} // Pass the handleAddItem function
            isToggled={isToggled}
            setIsToggled={setIsToggled} // Pass the toggle state and setter
            onStartFresh={handleStartFresh}
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
