import React from 'react';
import styles from './SearchHeader.module.css';
import { ReactComponent as SearchIcon } from '../../../assets/icons/search.svg';

function SearchHeader({ roomName, searchQuery, onSearch  }) {

  const isActive = searchQuery.trim() !== '';


  const handleSearch = (event) => {
    const query = event.target.value;
    onSearch(query);
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