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
  itemInstances,
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

  // Compute itemCounts from itemInstances
  const itemCounts = itemInstances.reduce((counts, instance) => {
    const itemId = instance.itemId;
    counts[itemId] = (counts[itemId] || 0) + 1;
    return counts;
  }, {});

  // Filter items based on "My Items" button state
  const filteredItems = isMyItemsActive
    ? Object.keys(itemCounts).map((itemId) =>
        allItems.find((item) => item.id.toString() === itemId)
      )
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
          />
        </div>
      </main>
    </div>
  );
}

export default ItemSelection;
