import React, { useState } from 'react';
import allItems from '../../../data/constants/funitureItems';
import styles from './ItemSelection.module.css';
import ItemList from './ItemList/ItemList';
import BcalculatorMyitems from './BcalculatorMyitems/BcalculatorMyitems';
import AlphabetFilter from './AlphabetFilter/AlphabetFilter';

function ItemSelection({ room, searchQuery }) {
  const [isToggled, setIsToggled] = useState(true);
  const [selectedLetter, setSelectedLetter] = useState(null);
  const [selectedSubButton, setSelectedSubButton] = useState(null);

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
      setSelectedLetter(null); // Deselect if already selected
    } else {
      setSelectedLetter(letter);
    }}

    const handleSubButtonClick = (subButton) => {
      setSelectedSubButton(subButton);
      // Define further actions based on the sub-button click
    };

  
    // Ensure searchQuery is defined
    const query = searchQuery ? searchQuery.toLowerCase() : '';
  
    // Step 2: Use allItems to filter based on searchQuery
    const filteredItems = allItems.filter((item) => {
      
      if (selectedSubButton) {
        return item.name.startsWith(selectedSubButton);
      }
      if (selectedLetter) {
        return item.name.startsWith(selectedLetter);
      }
      return true;
    });
  
    return (
      <div className={styles.itemSelectionContainer}>

        <BcalculatorMyitems
         filterText="Enable Filters"
         isToggled={isToggled}
         onToggle={handleToggle}
         onActionClick={handleActionClick} />
         
         <AlphabetFilter
         selectedLetter={selectedLetter}
         onLetterSelect={handleLetterClick}
         onSubButtonClick={handleSubButtonClick} />

       <main className={styles.mainContent}>

         <ItemList items={filteredItems} />

       </main>
      </div>
    );
  }
  
  export default ItemSelection;
