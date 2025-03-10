// src/components/Inventory/ItemSelection/AlphabetBanner/AlphabetBanner.js

import React from 'react';
import PropTypes from 'prop-types';
import styles from './AlphabetBanner.module.css';

function AlphabetBanner({ isMyItemsActive, roomName }) {
  // Convert roomName to uppercase
  const upperCaseRoomName = roomName ? roomName.toUpperCase() : 'THIS ROOM';

  return (
    <div className={styles.alphabetBanner}>
      <p>
        {isMyItemsActive
          ? `MY INVENTORY IN ${upperCaseRoomName}`
          : `COMMON ITEMS FOR ${upperCaseRoomName}`}
      </p>
    </div>
  );
}

AlphabetBanner.propTypes = {
  isMyItemsActive: PropTypes.bool.isRequired,
  roomName: PropTypes.string.isRequired,
};

export default AlphabetBanner;
