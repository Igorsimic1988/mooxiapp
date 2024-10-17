import React, { useState } from 'react';
import styles from './Inventory.module.css';

import TopNavigation from '../Inventory/TopNavigation/TopNavigation';
import RoomList from '../Inventory/RoomList/RoomList';
import HouseHeader from './HouseHeader/HouseHeader';
import FooterNavigation from './FooterNavigation/FooterNavigation';
import ItemSelection from './ItemSelection/ItemSelection';
import SearchHeader from './SearchHeader/SearchHeader';


function Inventory() {
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  const handleRoomSelect = (room) => {
    setSelectedRoom(room);
  };

  const handleBackToRooms = () => {
    setSelectedRoom(null);
    setSearchQuery('');
  };

  const handleSearch = (query) => {
    setSearchQuery(query);
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
          <SearchHeader roomName={selectedRoom.name} onSearch={handleSearch} />
        ) : (
          <HouseHeader />
        )}
      </header>

      <main className={styles.mainContent}>
        {selectedRoom ? (
          <ItemSelection room={selectedRoom} searchQuery={searchQuery} />
        ) : (
          <RoomList onRoomSelect={handleRoomSelect} />
        )}
      </main>

      <FooterNavigation
        inRoom={!!selectedRoom}
        onBackToRooms={handleBackToRooms}
      />
    </div>
  );
}

export default Inventory;