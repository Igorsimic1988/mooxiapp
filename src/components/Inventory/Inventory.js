import React, { useState, useEffect } from 'react';
import styles from './Inventory.module.css';
import TopNavigation from '../Inventory/TopNavigation/TopNavigation';
import RoomList from '../Inventory/RoomList/RoomList';
import HouseHeader from './HouseHeader/HouseHeader';
import FooterNavigation from './FooterNavigation/FooterNavigation';
import ItemSelection from './ItemSelection/ItemSelection';
import SearchHeader from './SearchHeader/SearchHeader';
import rooms from '../../data/constants/AllRoomsList'; // Import rooms data
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
      acc[room.name] = []; // Initialize with an empty array for each room
      return acc;
    }, {})
  );
  const [isSpecialHVisible, setIsSpecialHVisible] = useState(false);


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
const handleItemSelection = (item) => {
  if (!selectedRoom) return;

  setRoomItemSelections((prevSelections) => {
    const currentRoomSelections = prevSelections[selectedRoom.name] || [];
    const updatedRoomSelections = [...currentRoomSelections];

    if (isDeleteActive) {
      // Remove an instance of the item from the room selections
      const index = updatedRoomSelections.findIndex(
        (instance) => instance.itemId === item.id.toString()
      );
      if (index !== -1) {
        updatedRoomSelections.splice(index, 1);
      }
    } else {
      // Add a new unique item instance
      const newItemInstance = {
        id: uuidv4(), // Generate a unique ID for this instance
        itemId: item.id.toString(),
        item: item,
        tags: [], // Initialize with empty tags or other properties as needed
      };
      updatedRoomSelections.push(newItemInstance);
    }

    return {
      ...prevSelections,
      [selectedRoom.name]: updatedRoomSelections,
    };
  });
};

  // Function to handle adding a new room
  const handleAddRoom = (roomId) => {
    const roomToAdd = rooms.find((room) => room.id === roomId);
    if (roomToAdd && !displayedRooms.find((room) => room.id === roomId)) {
      setDisplayedRooms((prev) => [...prev, roomToAdd]);
    }
  };

  // Function to get the count of items selected in the current room
  const getItemCountForCurrentRoom = () => {
    if (!selectedRoom || !roomItemSelections[selectedRoom.name]) return 0;
    return roomItemSelections[selectedRoom.name].length;
  };

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
          <HouseHeader onAddRoom={handleAddRoom} rooms={rooms} displayedRooms={displayedRooms} />
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
            itemClickCounts={roomItemSelections[selectedRoom.name] || {}}
            onItemClick={handleItemSelection}
            itemCount={getItemCountForCurrentRoom()} // Pass the item count for current room
            isMyItemsActive={isMyItemsActive} // Pass the state to ItemSelection
            setIsMyItemsActive={setIsMyItemsActive} // Pass the setter to ItemSelection
            isDeleteActive={isDeleteActive} // Pass the state to ItemSelection for delete functionality
            itemInstances={roomItemSelections[selectedRoom.name] || []}
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
        setIsDeleteActive={setIsDeleteActive} // Pass the setter to toggle delete mode
        isSpecialHVisible={isSpecialHVisible}
        setIsSpecialHVisible={setIsSpecialHVisible} // Pass the state and setter
        roomItemSelections={roomItemSelections}
      />
    </div>
  );
}

export default Inventory;