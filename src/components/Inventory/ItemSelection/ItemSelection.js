// src/components/Inventory/ItemSelection/ItemSelection.js

import React, { useState } from 'react';
import allItems from '../../../data/constants/funitureItems';
import styles from './ItemSelection.module.css';
import ItemList from './ItemList/ItemList';
import BcalculatorMyitems from './BcalculatorMyitems/BcalculatorMyitems';
import AlphabetFilter from './AlphabetFilter/AlphabetFilter';

function ItemSelection({ room, searchQuery }) {
  const [isToggled, setIsToggled] = useState(true);
  const [selectedLetter, setSelectedLetter] = useState(null);
  const [selectedSubButton, setSelectedSubButton] = useState({ letter: null, subButton: null });

  const handleToggle = () => {
    setIsToggled((prev) => !prev);
    // Add any additional logic you need when toggling
  };

  const handleActionClick = () => {
    // Define the action button's functionality
    // For example, navigate to a different page or open a modal
  };

  const handleLetterClick = (letter) => {
    if (selectedLetter === letter) {
      setSelectedLetter(null);
      setSelectedSubButton({ letter: null, subButton: null }); // Reset sub-button selection
    } else {
      setSelectedLetter(letter);
      setSelectedSubButton({ letter: null, subButton: null }); // Reset sub-button selection when a new letter is selected
    }
  };

  const handleSubButtonClick = (letter, subButton) => {
    setSelectedSubButton({ letter, subButton });
    setSelectedLetter(null); // Deselect the main letter button
  };

  // Ensure searchQuery is defined
  const query = searchQuery ? searchQuery.toLowerCase() : '';

  // Use allItems to filter based on searchQuery, selectedLetter, and selectedSubButton
  const filteredItems = allItems.filter((item) => {
    // Incorporate searchQuery into filtering
    const matchesQuery = item.name.toLowerCase().includes(query);
    
    if (selectedSubButton.subButton) {
      return item.name.startsWith(selectedSubButton.subButton) && matchesQuery;
    }
    if (selectedLetter) {
      return item.name.startsWith(selectedLetter) && matchesQuery;
    }
    return matchesQuery;
  });

  return (
    <div className={styles.itemSelectionContainer}>
      <BcalculatorMyitems
        filterText="Enable Filters"
        isToggled={isToggled}
        onToggle={handleToggle}
        onActionClick={handleActionClick} 
      />
      
      <AlphabetFilter
        selectedLetter={selectedLetter}
        selectedSubButton={selectedSubButton}
        onLetterSelect={handleLetterClick}
        onSubButtonClick={handleSubButtonClick} 
      />

      <main className={styles.mainContent}>
        <div className={styles.scrollableItemList}>
        <ItemList items={filteredItems} />
        </div>
      </main>
    </div>
  );
}

export default ItemSelection;
