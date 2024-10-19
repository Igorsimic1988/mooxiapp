import React, { useState } from 'react';
import styles from './Inventory.module.css';
import TopNavigation from '../Inventory/TopNavigation/TopNavigation';
import RoomList from '../Inventory/RoomList/RoomList';
import HouseHeader from './HouseHeader/HouseHeader';
import FooterNavigation from './FooterNavigation/FooterNavigation';
import ItemSelection from './ItemSelection/ItemSelection';
import SearchHeader from './SearchHeader/SearchHeader';
import rooms from '../../data/constants/AllRoomsList'; // Import rooms data

// Set IDs of the rooms that will be shown by default initially
const defaultRoomIds = [1, 2, 3, 4, 5, 6 ,7 ,8 ,9, 10, 11, 12, 13]; // Replace with the initial room IDs you want

function Inventory() {
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLetter, setSelectedLetter] = useState(null);
  const [selectedSubButton, setSelectedSubButton] = useState({ letter: null, subButton: null });
  const [roomItemSelections, setRoomItemSelections] = useState(
    rooms.reduce((acc, room) => {
      acc[room.name] = {};
      return acc;
    }, {})
  );
  const [displayedRooms, setDisplayedRooms] = useState(
    rooms.filter(room => defaultRoomIds.includes(room.id))
  );

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
    setSearchQuery(query);
  };

  const handleSearchClick = () => {
    setSelectedLetter(null);
    setSelectedSubButton({ letter: null, subButton: null });
  };

  const handleLetterSelect = (letter) => {
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
    setSelectedSubButton({ letter, subButton });
    setSelectedLetter(letter);
    setSearchQuery('');
  };

  const handleItemSelection = (itemId) => {
    if (!selectedRoom) return;

    setRoomItemSelections((prevSelections) => {
      const currentRoomSelections = prevSelections[selectedRoom.name] || {};
      return {
        ...prevSelections,
        [selectedRoom.name]: {
          ...currentRoomSelections,
          [itemId]: (currentRoomSelections[itemId] || 0) + 1,
        },
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
          />
        ) : (
          <RoomList
            onRoomSelect={handleRoomSelect}
            roomItemSelections={roomItemSelections}
            displayedRooms={displayedRooms}
          />
        )}
      </main>

      <FooterNavigation inRoom={!!selectedRoom} onBackToRooms={handleBackToRooms} />
    </div>
  );
}

export default Inventory;
