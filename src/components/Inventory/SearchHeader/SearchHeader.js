import React, { useState } from 'react';
import styles from './SearchHeader.module.css';
import { ReactComponent as SearchIcon } from '../../../assets/icons/search.svg';

function SearchHeader({ roomName, onSearch }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [isFocused, setIsFocused] = useState(false);

  const isActive = searchQuery.trim() !== '';


  const handleSearch = (event) => {
    const query = event.target.value;
    setSearchQuery(query);
    onSearch(query);
  };

  const handleFocus = () => {
    setIsFocused(true);
  };

  const handleBlur = () => {
    setIsFocused(false);
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
          onFocus={handleFocus}
          onBlur={handleBlur}
          value={searchQuery}
        />
        <SearchIcon
          className={`${styles.searchIcon} ${isActive ? styles.activeIcon : ''}`}
          aria-hidden="true" /* Since it's decorative */
        />
      </div>
    </header>
  );
}

export default SearchHeader;