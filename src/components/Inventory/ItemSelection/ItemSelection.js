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
  itemClickCounts,
  onItemClick,
}) {
  const [isToggled, setIsToggled] = useState(true);
  

  const handleToggle = () => {
    setIsToggled((prev) => !prev);
  };


  const query = searchQuery ? searchQuery.toLowerCase() : '';
  const filteredItems = allItems.filter((item) => {
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
      />

      <AlphabetFilter
        selectedLetter={selectedLetter}
        selectedSubButton={selectedSubButton}
        onLetterSelect={onLetterSelect}
        onSubButtonClick={onSubButtonSelect}
      />

      <main className={styles.mainContent}>
        <div className={styles.scrollableItemList}>
          <ItemList
            items={filteredItems}
            itemClickCounts={itemClickCounts} // Use the prop passed down from Inventory
            onItemClick={onItemClick}        // Pass the click handler from Inventory
          />
        </div>
      </main>
    </div>
  );
}

export default ItemSelection;