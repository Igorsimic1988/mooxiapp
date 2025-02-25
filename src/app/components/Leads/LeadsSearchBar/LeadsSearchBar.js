import React, { useState } from 'react';
import styles from './LeadsSearchBar.module.css';
import SearchIcon from '../../../assets/icons/search.svg';
import Image from 'next/image';

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
        <Image
          src={SearchIcon}
          alt="search"
          className={`${styles.searchIcon} ${isActive ? styles.activeIcon : ''}`} 
          />
      </div>
    </header>
  );
}

export default LeadsSearchBar;
