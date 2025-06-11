"use client";

import React from 'react';
import styles from './ItemSelection.module.css';
import ItemList from './ItemList/ItemList';
import BcalculatorMyitems from './BcalculatorMyitems/BcalculatorMyitems';
import AlphabetFilter from './AlphabetFilter/AlphabetFilter';
import { generateGroupingKey } from '../utils/generateGroupingKey';

function ItemSelection({
  allItems,  // Keep this as a prop for backend integration
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
  itemInstances,  // Array of individual item instances
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

  // Compute itemCounts for individual instances
  const itemCounts = itemInstances.reduce((counts, instance) => {
    const key = (instance.furnitureItemId || instance.itemId || instance.id).toString();
    counts[key] = (counts[key] || 0) + 1; // Each instance represents a count of 1
    return counts;
  }, {});

  // Group items by current properties when isMyItemsActive is true
  const groupedItems = isMyItemsActive
    ? Object.values(
        itemInstances.reduce((groups, instance) => {
          const key = generateGroupingKey(instance);
          if (!groups[key]) {
            groups[key] = {
              // Use the first instance's id for the group
              id: instance.id,
              groupingKey: key,
              furnitureItemId: instance.furnitureItemId,
              itemId: instance.itemId || instance.furnitureItemId, // Backward compatibility
              item: instance.item,
              name: instance.name || instance.item?.name,
              imageName: instance.imageName || instance.item?.imageName,
              tags: [...(instance.tags || [])],
              notes: instance.notes || '',
              cuft: instance.cuft || '',
              lbs: instance.lbs || '',
              packingNeedsCounts: { ...(instance.packingNeedsCounts || {}) },
              packingNeeds: instance.packingNeeds || [],
              link: instance.link || '',
              uploadedImages: [...(instance.uploadedImages || [])],
              cameraImages: [...(instance.cameraImages || [])],
              count: 1,
            };
          } else {
            groups[key].count += 1; // Aggregate counts for display
          }
          return groups;
        }, {})
      )
    : [];

  // Filter items based on "My Items" button state
  let filteredItems = isMyItemsActive
    ? groupedItems
    : allItems.filter((item) => {
        const matchesQuery = item.name.toLowerCase().includes(searchQuery.toLowerCase());

        if (searchQuery.trim() !== '') {
          // Search through all items but exclude items where search is false
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
      filteredItems = [customItem];
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
            itemClickCounts={itemCounts}  // For regular items view
            itemInstances={itemInstances}  // For reference
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