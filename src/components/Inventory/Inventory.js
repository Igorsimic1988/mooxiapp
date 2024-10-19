// Inventory.js

import React, { useState } from 'react';
import styles from './Inventory.module.css';
import TopNavigation from '../Inventory/TopNavigation/TopNavigation';
import RoomList from '../Inventory/RoomList/RoomList';
import HouseHeader from './HouseHeader/HouseHeader';
import FooterNavigation from './FooterNavigation/FooterNavigation';
import ItemSelection from './ItemSelection/ItemSelection';
import SearchHeader from './SearchHeader/SearchHeader';

const initialRooms = [
  'Living Room', 'Family Room', 'Kitchen', 'Master Bedroom', 'Bedroom 1', 'Bedroom 2', 'Bedroom 3',
  'Garage', 'Laundry Room', 'Home Office', 'Yard/Patio', 'Basement', 'Attic', 'Storage',
];

function Inventory() {
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLetter, setSelectedLetter] = useState(null);
  const [selectedSubButton, setSelectedSubButton] = useState({ letter: null, subButton: null });
  const [roomItemSelections, setRoomItemSelections] = useState(
    initialRooms.reduce((acc, room) => {
      acc[room] = {};
      return acc;
    }, {})
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
    // Reset the letter and subButton states when clicking on the search input
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
          <HouseHeader />
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
            itemClickCounts={roomItemSelections[selectedRoom.name] || {}} // Updated: use itemClickCounts from roomItemSelections
            onItemClick={handleItemSelection}
          />
        ) : (
          <RoomList onRoomSelect={handleRoomSelect} roomItemSelections={roomItemSelections} />
        )}
      </main>

      <FooterNavigation inRoom={!!selectedRoom} onBackToRooms={handleBackToRooms} />
    </div>
  );
}

export default Inventory;