"use client";

import React, { useMemo, useCallback } from 'react';
import styles from './ItemSelection.module.css';
import ItemList from './ItemList/ItemList';
import BcalculatorMyitems from './BcalculatorMyitems/BcalculatorMyitems';
import AlphabetFilter from './AlphabetFilter/AlphabetFilter';
import { generateGroupingKey } from '../utils/generateGroupingKey';
import Fuse from 'fuse.js';

// Fuse.js configuration for fuzzy search
const fuseOptions = {
  keys: ['name', 'tags'],
  threshold: 0.3,
  includeScore: true,
  minMatchCharLength: 2,
  shouldSort: true,
  findAllMatches: true,
  ignoreLocation: true,
};

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
  onBackToRooms,
  onOpenPopup,
  fuse: propFuse,
}) {
  // Create Fuse instance if not provided
  const fuse = useMemo(() => {
    if (propFuse) return propFuse;
    if (allItems && allItems.length > 0) {
      try {
        return new Fuse(allItems, fuseOptions);
      } catch (error) {
        console.error('Error creating Fuse instance:', error);
        return null;
      }
    }
    return null;
  }, [propFuse, allItems]);

  const handleToggle = useCallback(() => {
    setIsToggled((prev) => !prev);
  }, [setIsToggled]);

  // Handle "My Items" button click to toggle its active state
  const handleMyItemsClick = useCallback(() => {
    const newMyItemsState = !isMyItemsActive;

    // If activating "My Items", reset other filter states
    if (newMyItemsState) {
      setSearchQuery('');
      onLetterSelect(null);
      onSubButtonSelect(null, null);
    }

    setIsMyItemsActive(newMyItemsState);
  }, [isMyItemsActive, setSearchQuery, onLetterSelect, onSubButtonSelect, setIsMyItemsActive]);

  const handleLetterSelection = useCallback((letter) => {
    if (isMyItemsActive) {
      setIsMyItemsActive(false);
    }
    onLetterSelect(letter);
  }, [isMyItemsActive, setIsMyItemsActive, onLetterSelect]);

  const handleSubButtonSelection = useCallback((letter, subButton) => {
    if (isMyItemsActive) {
      setIsMyItemsActive(false);
    }
    onSubButtonSelect(letter, subButton);
  }, [isMyItemsActive, setIsMyItemsActive, onSubButtonSelect]);

  // Compute itemCounts for individual instances
  const itemCounts = useMemo(() => {
    return itemInstances.reduce((counts, instance) => {
      const key = (instance.furnitureItemId || instance.id).toString();
      counts[key] = (counts[key] || 0) + 1;
      return counts;
    }, {});
  }, [itemInstances]);

  // Group items by current properties when isMyItemsActive is true
  const groupedItems = useMemo(() => {
    if (!isMyItemsActive) return [];
    
    const groups = new Map();
    
    itemInstances.forEach((instance) => {
      const key = generateGroupingKey(instance);
      
      if (!groups.has(key)) {
        const stableItemId = instance.furnitureItemId ;
        
        groups.set(key, {
          id: key,
          groupingKey: key,
          furnitureItemId: instance.furnitureItemId,
          name: instance.name,
          imageName: instance.imageName,
          tags: [...(instance.tags || [])],
          notes: instance.notes || '',
          cuft: instance.cuft || '',
          lbs: instance.lbs || '',
          packingNeeds: { ...(instance.packingNeeds || {}) },
          link: instance.link || '',
          uploadedImages: [...(instance.uploadedImages || [])],
          cameraImages: [...(instance.cameraImages || [])],
          count: 1,
          sortKey: parseInt(stableItemId) || 0,
        });
      } else {
        const group = groups.get(key);
        group.count += 1;
      }
    });
    
    return Array.from(groups.values()).sort((a, b) => {
      const idA = a.sortKey;
      const idB = b.sortKey;
      if (idA !== idB) {
        return idA - idB;
      }
      return a.groupingKey.localeCompare(b.groupingKey);
    });
  }, [isMyItemsActive, itemInstances]);

  // Optimized filtering with better error handling
  const filteredItems = useMemo(() => {
    if (isMyItemsActive) {
      return groupedItems;
    }

    let filtered = [];

    if (searchQuery.trim() !== '') {
      // Use Fuse.js for fuzzy search if available
      if (fuse) {
        try {
          const results = fuse.search(searchQuery);
          filtered = results
            .map(result => result.item)
            .filter(item => item.search !== false);
        } catch (error) {
          console.error('Error during Fuse search:', error);
          // Fallback to simple search
          filtered = allItems.filter((item) => {
            const matchesQuery = item.name.toLowerCase().includes(searchQuery.toLowerCase());
            return matchesQuery && item.search !== false;
          });
        }
      } else {
        // Fallback to simple search
        filtered = allItems.filter((item) => {
          const matchesQuery = item.name.toLowerCase().includes(searchQuery.toLowerCase());
          return matchesQuery && item.search !== false;
        });
      }
    } else if (selectedSubButton.subButton) {
      filtered = allItems.filter((item) => item.letters.includes(selectedSubButton.subButton));
    } else if (selectedLetter) {
      filtered = allItems.filter((item) => item.letters.includes(selectedLetter));
    } else {
      // Display default items for the current room
      filtered = allItems.filter((item) => item.rooms.includes(room.id));
    }

    // Include "Custom Item" when no other items match the search
    if (filtered.length === 0 && searchQuery.trim() !== '') {
      const customItem = allItems.find((item) => item.name === 'Custom Item');
      if (customItem) {
        filtered = [customItem];
      }
    }

    return filtered;
  }, [isMyItemsActive, groupedItems, searchQuery, selectedSubButton, selectedLetter, room, allItems, fuse]);

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
            itemClickCounts={itemCounts}
            itemInstances={itemInstances}
            onItemClick={onItemClick}
            isMyItemsActive={isMyItemsActive}
            isDeleteActive={isDeleteActive}
            onUpdateItem={onUpdateItem}
            onAddItem={onAddItem}
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