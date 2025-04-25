"use client";

import React, { useRef } from 'react';
import styles from './LeadsSearchBar.module.css';
import Icon from 'src/app/components/Icon';

function LeadsSearchBar({ searchQuery, setSearchQuery }) {
  const inputRef = useRef(null);
  const isActive = searchQuery.trim() !== '';
  const handleSearch = (event) => {
    const value = event.target.value;
    console.log("Search query changed to:", value); // Debug log
    setSearchQuery(value);
  };

  const handleFocus = () => {
    if (inputRef.current) {
      inputRef.current.select(); // Select all text in the search input when focused
    }
  };

  const handleKeyDown = (event) => {
    if (event.key === 'Enter') {
      event.target.blur(); // Hide keyboard on mobile devices
    }
  };
  
  const handleClear = () => {
    setSearchQuery('');
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };


  return (
    <header className={styles.searchHeader}>
      <div className={styles.searchContainer}>
        <input
          type="text"
          className={`${styles.searchInput} ${isActive ? styles.activeInput : ''}`}
          placeholder="Search"
          aria-label="Search"
          value={searchQuery}
          onChange={handleSearch}
          onFocus={handleFocus}
          onKeyDown={handleKeyDown}
          ref={inputRef}
        />
        <Icon 
          name="Search"
          className={`${styles.searchIcon} ${isActive ? styles.activeIcon : ''}`}
          onClick={isActive ? handleClear : null} // Allow clicking the icon to clear the search 
        />
      </div>
    </header>
  );
}

export default LeadsSearchBar;
