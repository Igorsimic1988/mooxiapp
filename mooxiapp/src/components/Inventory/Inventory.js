import React, { useState } from 'react';
import styles from './Inventory.module.css';

import TopNavigation from '../Inventory/TopNavigation/TopNavigation';
import RoomList from '../Inventory/RoomList/RoomList';
import HouseHeader from './HouseHeader/HouseHeader';
import FooterNavigation from './FooterNavigation/FooterNavigation';


function Inventory() {
  const [selectedRoom , setSelectedRoom] = useState(null);

  const handleRoomSelect = (room) => {
    setSelectedRoom(room);
  };

  const handleBackToRooms = () => {
    setSelectedRoom(null);
  };

  return (
    <div>
      <main>
        <TopNavigation
          inRoom={!!selectedRoom}
          roomName={selectedRoom ? selectedRoom.name : 'Go to Quote'}
          onBack={handleBackToRooms}
        />
        <HouseHeader />
        {selectedRoom ? (
          // Display room details when a room is selected
          <section>
            <h2>{selectedRoom.name}</h2>
            {/* Add room details here */}
          </section>
        ) : (
          // Display room list when no room is selected
          <section>
            <RoomList onRoomSelect={handleRoomSelect} />
          </section>
        )}
        <FooterNavigation />
      </main>
    </div>
  );
}

export default Inventory;
