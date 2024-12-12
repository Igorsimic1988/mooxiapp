import React, { useState } from 'react';
import styles from './LeadsSearchBar.module.css';
import { ReactComponent as SearchIcon } from '../../../assets/icons/search.svg';

function LeadsSearchBar() {
  const [searchQuery, setSearchQuery] = useState('');

  const isActive = searchQuery.trim() !== '';

  return (
    <header className={styles.searchHeader}>
      <div className={styles.searchContainer}>
        <input
          type="text"
          className={styles.searchInput}
          placeholder="Search"
          aria-label="Search"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <SearchIcon
          className={`${styles.searchIcon} ${isActive ? styles.activeIcon : ''}`}
          aria-hidden="true"
        />
      </div>
    </header>
  );
}

export default LeadsSearchBar;
