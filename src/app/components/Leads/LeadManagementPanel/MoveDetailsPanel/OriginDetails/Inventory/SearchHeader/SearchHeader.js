import React, { useRef } from 'react';
import styles from './SearchHeader.module.css';
import Icon from 'src/app/components/Icon'; 

function SearchHeader({ searchQuery, onSearch, onSearchFocus, roomName, isDesktop }) {
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
    <div className={styles.searchHeaderWrapper}>
      {/* Only show the topBarContainer if not in desktop mode */}
      {!isDesktop && (
        <div className={styles.topBarContainer}>
          <div className={styles.topBarBack}></div>
        </div>
      )}
      
      <header className={styles.searchHeader}>
        <div className={styles.searchContainer}>
          <input
            type="text"
            className={styles.searchInput}
            placeholder={roomName ? `Search in ${roomName}` : "Search"}
            aria-label="Search"
            value={searchQuery}
            onChange={handleSearch}
            onFocus={handleFocus}
            onKeyDown={handleKeyDown}
            ref={inputRef}
          />
          <Icon name="Search" className={`${styles.searchIcon} ${isActive ? styles.activeIcon : ''}`} />
        </div>
      </header>
    </div>
  );
}

export default SearchHeader;