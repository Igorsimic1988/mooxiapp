// src/components/Inventory/ItemSelection/AlphabetFilter/AlphabetFilter.js

import React, { useState, useRef, useEffect } from 'react';
import PropTypes from 'prop-types';
import styles from './AlphabetFilter.module.css'; // Corrected import

const LETTERS_WITH_SUBBUTTONS = {
  B: ['B1', 'B2', 'B3', 'B4'],
  C: ['C1', 'C2', 'C3'],
  D: ['D1', 'D2'],
  M: ['M1', 'M2'],
  P: ['P1', 'P2'],
  S: ['S1', 'S2'],
  T: ['T1', 'T2', 'T3'],
  // Add other letters with sub-buttons as needed
};

const ALPHABETS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

function AlphabetFilter({ selectedLetter, onLetterSelect, onSubButtonClick }) {
  const [activeLetter, setActiveLetter] = useState(null);
  const filterRef = useRef(null);

  const handleLetterClick = (letter) => {
    if (activeLetter === letter) {
      // If the same letter is clicked again, toggle it off
      setActiveLetter(null);
      onLetterSelect(null);
    } else {
      setActiveLetter(letter);
      onLetterSelect(letter);
    }
  };

  const handleSubButtonClickInternal = (subButton) => {
    onSubButtonClick(subButton);
  };

  const handleClickOutside = (event) => {
    if (filterRef.current && !filterRef.current.contains(event.target)) {
      setActiveLetter(null);
      onLetterSelect(null);
    }
  };

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div ref={filterRef}>
      <div className={styles.alphabetFilter}>
        {ALPHABETS.map((letter) => (
          <React.Fragment key={letter}>
            <button
              className={`${styles.alphabetButton} ${
                selectedLetter === letter ? styles.active : ''
              }`}
              onClick={() => handleLetterClick(letter)}
              aria-expanded={
                activeLetter === letter && LETTERS_WITH_SUBBUTTONS[letter]
                  ? 'true'
                  : 'false'
              }
              aria-controls={`subButtons-${letter}`}
            >
              {letter}
            </button>
            {/* Render sub-buttons as direct siblings if they exist */}
            {activeLetter === letter &&
              Array.isArray(LETTERS_WITH_SUBBUTTONS[letter]) && // Ensure it's an array
              LETTERS_WITH_SUBBUTTONS[letter].map((subButton) => (
                <button
                  key={subButton}
                  className={styles.subButton}
                  onClick={() => handleSubButtonClickInternal(subButton)}
                >
                  {subButton}
                </button>
              ))}
          </React.Fragment>
        ))}
      </div>
      <div className={styles.alphabetFilterBanner}>
        <p>COMMON ITEMS FOR THIS ROOM</p>
      </div>
    </div>
  );
}

AlphabetFilter.propTypes = {
  selectedLetter: PropTypes.string,
  onLetterSelect: PropTypes.func.isRequired,
  onSubButtonClick: PropTypes.func.isRequired,
};

AlphabetFilter.defaultProps = {
  selectedLetter: null,
};

export default AlphabetFilter;
