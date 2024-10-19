import React from 'react';
import styles from './SearchHeader.module.css';
import { ReactComponent as SearchIcon } from '../../../assets/icons/search.svg';

function SearchHeader({ roomName, searchQuery, onSearch, onSearchClick }) {
  const isActive = searchQuery.trim() !== '';

  const handleSearch = (event) => {
    const query = event.target.value;
    onSearch(query);
  };

  const handleFocus = () => {
    if (onSearchClick) {
      onSearchClick(); // Call the new click handler when focused
    }
  };

  return (
    <header className={styles.searchHeader}>
      <div className={styles.searchContainer}>
        <input
          type="text"
          className={styles.searchInput}
          placeholder="Search"
          aria-label="Search"
          onChange={handleSearch}
          onFocus={handleFocus} // Focus event calls the click handler
          value={searchQuery}
        />
        <SearchIcon
          className={`${styles.searchIcon} ${isActive ? styles.activeIcon : ''}`}
          aria-hidden="true"
        />
      </div>
    </header>
  );
}

export default SearchHeader;
