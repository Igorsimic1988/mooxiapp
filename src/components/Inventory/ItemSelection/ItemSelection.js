// src/components/Inventory/ItemSelection/ItemSelection.js

import React, { useState } from 'react';
import allItems from '../../../data/constants/funitureItems';
import styles from './ItemSelection.module.css';
import ItemList from './ItemList/ItemList';
import BcalculatorMyitems from './BcalculatorMyitems/BcalculatorMyitems';
import AlphabetFilter from './AlphabetFilter/AlphabetFilter';

function ItemSelection({
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
  onUpdateItem, // **Accept the onUpdateItem prop**
}) {
  const [isToggled, setIsToggled] = useState(true);

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

  // Compute itemCounts based on isMyItemsActive
  const itemCounts = itemInstances.reduce((counts, instance) => {
    if (isMyItemsActive) {
      const key = `${instance.itemId}-${instance.tags.sort().join(',')}`;
      counts[key] = (counts[key] || 0) + 1;
    } else {
      const key = instance.itemId;
      counts[key] = (counts[key] || 0) + 1;
    }
    return counts;
  }, {});

  // Group items by itemId and tags when isMyItemsActive is true
  const groupedItems = isMyItemsActive
  ? Object.values(
      itemInstances.reduce((groups, instance) => {
        const key = `${instance.itemId}-${instance.tags.sort().join(',')}-${instance.notes || ''}-${instance.cuft || ''}-${instance.lbs || ''}`;
        if (!groups[key]) {
          groups[key] = {
            itemId: instance.itemId,
            item: instance.item,
            tags: [...instance.tags], // Make a copy of tags
            notes: instance.notes,    // Include notes
            cuft: instance.cuft,      // Include cuft
            lbs: instance.lbs,        // Include lbs
            count: 1,
            id: instance.id,          // Keep the instance ID
          };
        } else {
          groups[key].count += 1;
        }
        return groups;
      }, {})
    )
  : [];

  // Filter items based on "My Items" button state
  const filteredItems = isMyItemsActive
    ? groupedItems
    : allItems.filter((item) => {
        const matchesQuery = item.name.toLowerCase().includes(searchQuery.toLowerCase());

        if (searchQuery.trim() !== '') {
          // Search through all items but exclude items where search is 'N'
          return matchesQuery && item.search !== 'N';
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

  return (
    <div className={styles.itemSelectionContainer}>
      <BcalculatorMyitems
        filterText="Enable Filters"
        isToggled={isToggled}
        onToggle={handleToggle}
        onActionClick={handleMyItemsClick} // Use handleMyItemsClick to properly manage state
        itemCount={itemCount}
        isMyItemsActive={isMyItemsActive} // Pass the active state to BcalculatorMyitems
      />

      <AlphabetFilter
        selectedLetter={selectedLetter}
        selectedSubButton={selectedSubButton}
        onLetterSelect={handleLetterSelection}
        onSubButtonClick={handleSubButtonSelection}
      />

      <main className={styles.mainContent}>
        <div className={styles.scrollableItemList}>
          <ItemList
            items={filteredItems} // Pass the filtered items to ItemList
            itemClickCounts={itemCounts} // Pass the computed itemCounts
            onItemClick={onItemClick}
            isMyItemsActive={isMyItemsActive} // Pass the state to ItemList
            isDeleteActive={isDeleteActive}
            onUpdateItem={onUpdateItem} // **Pass the onUpdateItem function**
          />
        </div>
      </main>
    </div>
  );
}

export default ItemSelection;
