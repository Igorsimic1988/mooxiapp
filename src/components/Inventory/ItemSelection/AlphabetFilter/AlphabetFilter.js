import React from 'react';
import PropTypes from 'prop-types';
import styles from './AlphabetFilter.module.css';

const LETTERS_WITH_SUBBUTTONS = {
  B: ['B1', 'B2', 'B3', 'B4'],
  C: ['C1', 'C2', 'C3'],
  D: ['D1', 'D2'],
  M: ['M1', 'M2'],
  P: ['P1', 'P2'],
  S: ['S1', 'S2'],
  T: ['T1', 'T2', 'T3'],
};

const ALPHABETS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

function AlphabetFilter({ selectedLetter, selectedSubButton, onLetterSelect, onSubButtonClick }) {
  // Letter selection logic
  const handleLetterClick = (letter) => {
    if (selectedLetter === letter) {
      onLetterSelect(null); // Deselect letter if clicked again
    } else {
      onLetterSelect(letter); // Select letter
    }
  };

  // Sub-button selection logic
  const handleSubButtonClickInternal = (subButton, letter) => {
    onSubButtonClick(letter, subButton);
  };

  return (
    <div>
      <div className={styles.alphabetFilter}>
        {ALPHABETS.map((letter) => {
          const isMainActive = selectedLetter === letter && (!selectedSubButton || selectedSubButton.letter !== letter);

          return (
            <React.Fragment key={letter}>
              <button
                className={`${styles.alphabetButton} ${isMainActive ? styles.active : ''}`}
                onClick={() => handleLetterClick(letter)}
                aria-haspopup="true"
                aria-expanded={selectedLetter === letter && LETTERS_WITH_SUBBUTTONS[letter] ? 'true' : 'false'}
                aria-controls={`subButtons-${letter}`}
              >
                {letter}
              </button>

              {selectedLetter === letter &&
                Array.isArray(LETTERS_WITH_SUBBUTTONS[letter]) &&
                LETTERS_WITH_SUBBUTTONS[letter].map((subButton) => {
                  const isSubButtonActive = selectedSubButton.letter === letter && selectedSubButton.subButton === subButton;

                  return (
                    <button
                      key={subButton}
                      className={`${styles.subButton} ${isSubButtonActive ? styles.activeSubButton : ''}`}
                      onClick={() => handleSubButtonClickInternal(subButton, letter)}
                    >
                      {subButton}
                    </button>
                  );
                })}
            </React.Fragment>
          );
        })}
      </div>
      <div className={styles.alphabetFilterBanner}>
        <p>COMMON ITEMS FOR THIS ROOM</p>
      </div>
    </div>
  );
}

AlphabetFilter.propTypes = {
  selectedLetter: PropTypes.string,
  selectedSubButton: PropTypes.shape({
    letter: PropTypes.string,
    subButton: PropTypes.string,
  }),
  onLetterSelect: PropTypes.func.isRequired,
  onSubButtonClick: PropTypes.func.isRequired,
};

export default AlphabetFilter;
