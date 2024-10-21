import React, { useRef } from 'react';
import styles from './SearchHeader.module.css';
import { ReactComponent as SearchIcon } from '../../../assets/icons/search.svg';

function SearchHeader({ roomName, searchQuery, onSearch, onSearchClick, onSearchFocus }) {
  const isActive = searchQuery.trim() !== '';
  const inputRef = useRef(null);

  const handleSearch = (event) => {
    const query = event.target.value;
    onSearch(query);
  };

  const handleFocus = () => {
    if (onSearchFocus) {
      onSearchFocus(); // Deactivate "My Items" button
    }
    if (inputRef.current) {
      inputRef.current.select(); // Select all text in the search input when focused
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
          value={searchQuery}
          onChange={handleSearch}
          onFocus={handleFocus} // Handle focus to deactivate "My Items" and select all text
          ref={inputRef} // Attach reference to input for selecting text
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
