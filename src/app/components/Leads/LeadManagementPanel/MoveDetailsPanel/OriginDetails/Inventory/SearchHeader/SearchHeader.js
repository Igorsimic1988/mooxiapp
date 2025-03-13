import React, { useRef } from 'react';
import styles from './SearchHeader.module.css';
import SearchIcon from '../../../../../../../assets/icons/search.svg';
import Image from 'next/image';
import Icon from 'src/app/components/Icon'; 

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

  const handleKeyDown = (event) => {
    if (event.key === 'Enter') {
      event.target.blur(); // This will hide the keyboard on mobile devices
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
          onKeyDown={handleKeyDown}
          ref={inputRef} // Attach reference to input for selecting text
        />
        <Icon name="Search" className={`${styles.searchIcon} ${isActive ? styles.activeIcon : ''}`} />
      </div>
    </header>
  );
}

export default SearchHeader;
