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
            <p>Item List</p>
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
        <button>Create Quote</button>
      </div>
      <div className={styles.bottomRowCol3}>
        <button>Button 1</button>
        <button>Button 2</button>
      </div>
    </div>
  );
}

export default InventoryDesktop;
