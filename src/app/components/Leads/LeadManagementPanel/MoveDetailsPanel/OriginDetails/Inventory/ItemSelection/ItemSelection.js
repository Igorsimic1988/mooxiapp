"use client";

import React from 'react';
import styles from './ItemSelection.module.css';
import ItemList from './ItemList/ItemList';
import BcalculatorMyitems from './BcalculatorMyitems/BcalculatorMyitems';
import AlphabetFilter from './AlphabetFilter/AlphabetFilter';

function ItemSelection({
  allItems,
  room,
  searchQuery,
  setSearchQuery,
  selectedLetter,
  selectedSubButton,
  onLetterSelect,
  onSubButtonSelect,
  onItemClick,
  itemCount,
  isMyItemsActive,
  setIsMyItemsActive,
  isDeleteActive,
  itemInstances,
  onUpdateItem,
  onAddItem,
  isToggled,
  setIsToggled,
  onStartFresh,
  onBackToRooms,
  onOpenPopup,
}) {
  const handleToggle = () => {
    setIsToggled((prev) => !prev);
  };
  
  // Handle "My Items" button click to toggle its active state
  const handleMyItemsClick = () => {
    const newMyItemsState = !isMyItemsActive;

    // If activating "My Items", reset other filter states
    if (newMyItemsState) {
      setSearchQuery(''); // Clear search query
      onLetterSelect(null); // Reset selected letter
      onSubButtonSelect(null, null); // Reset selected sub-button
    }

    // Toggle "My Items" state after resetting filters
    setIsMyItemsActive(newMyItemsState);
  };

  const handleLetterSelection = (letter) => {
    if (isMyItemsActive) {
      setIsMyItemsActive(false); // Deactivate "My Items" button
    }
    onLetterSelect(letter);
  };

  const handleSubButtonSelection = (letter, subButton) => {
    if (isMyItemsActive) {
      setIsMyItemsActive(false); // Deactivate "My Items" button
    }
    onSubButtonSelect(letter, subButton);
  };

  
  // Group items by current properties when isMyItemsActive is true

  // Filter items based on "My Items" button state
  let filteredItems = isMyItemsActive
  ? itemInstances
  : allItems.filter((item) => {
      const matchesQuery = item.name.toLowerCase().includes(searchQuery.toLowerCase());

      if (searchQuery.trim() !== '') {
        // Search through all items but exclude items where search is 'N'
        return matchesQuery && item.search !== false;
      }

      if (selectedSubButton.subButton) {
        // Show items that have the selected sub-button, regardless of room
        return item.letters.includes(selectedSubButton.subButton);
      }

      if (selectedLetter) {
        // Show items that have the selected letter, regardless of room
        return item.letters.includes(selectedLetter);
      }

      // No search query, letter, or sub-button selected
      // Display default items for the current room
      return item.rooms.includes(room.id);
    });

// Include "Custom Item" when no other items match the search
if (!isMyItemsActive && filteredItems.length === 0 && searchQuery.trim() !== '') {
  const customItem = allItems.find((item) => item.name === 'Custom Item');
  if (customItem) {
    filteredItems = [customItem]; // Reassign filteredItems
  }
}
  return (
    <div className={styles.itemSelectionContainer}>
      <BcalculatorMyitems
        filterText="Enable Filters"
        isToggled={isToggled}
        onToggle={handleToggle}
        onActionClick={handleMyItemsClick}
        itemCount={itemCount}
        isMyItemsActive={isMyItemsActive}
      />

      <AlphabetFilter
        selectedLetter={selectedLetter}
        selectedSubButton={selectedSubButton}
        onLetterSelect={handleLetterSelection}
        onSubButtonClick={handleSubButtonSelection}
        isMyItemsActive={isMyItemsActive}
        roomName={room.name}
      />

      <main className={styles.mainContent}>
        <div className={styles.scrollableItemList}>
          <ItemList
            items={filteredItems}
            itemInstances={itemInstances}
            onItemClick={onItemClick}
            isMyItemsActive={isMyItemsActive}
            isDeleteActive={isDeleteActive}
            onUpdateItem={onUpdateItem}
            onAddItem={onAddItem}
            onStartFresh={onStartFresh}
            setIsMyItemsActive={setIsMyItemsActive}
            onBackToRooms={onBackToRooms}
            onOpenPopup={onOpenPopup}
          />
        </div>
      </main>
    </div>
  );
}

export default ItemSelection;
