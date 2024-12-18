// src/components/Inventory/ItemSelection/AlphabetButtons/AlphabetButtons.js

import React, { useRef, useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import styles from './AlphabetButtons.module.css';

const LETTERS_WITH_SUBBUTTONS = {
  B: ['B1', 'B2', 'B3', 'B4'],
  C: ['C1', 'C2', 'C3'],
  D: ['D1', 'D2'],
  M: ['M1'],
  P: ['P1', 'P2'],
  S: ['S1', 'S2'],
  T: ['T1', 'T2', 'T3'],
};

const ALPHABETS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

function AlphabetButtons({
  selectedLetter,
  selectedSubButton,
  onLetterSelect,
  onSubButtonClick,
}) {
  const scrollContainerRef = useRef(null);
  const isDragging = useRef(false);
  const isMoved = useRef(false);
  const startX = useRef(0);
  const startY = useRef(0);
  const scrollLeft = useRef(0);
  const scrollTop = useRef(0);

  const dragThreshold = 5; // Number of pixels to consider as drag

  const [isDesktop, setIsDesktop] = useState(window.innerWidth >= 1024);

  useEffect(() => {
    const handleResize = () => {
      setIsDesktop(window.innerWidth >= 1024);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Letter selection logic
  const handleLetterClick = (letter) => {
    if (isMoved.current) return; // Prevent click if dragged
    if (selectedLetter === letter) {
      onLetterSelect(null); // Deselect letter if clicked again
    } else {
      onLetterSelect(letter); // Select letter
    }
  };

  // Sub-button selection logic
  const handleSubButtonClickInternal = (subButton, letter) => {
    if (isMoved.current) return; // Prevent click if dragged
    onSubButtonClick(letter, subButton);
  };

  // Mouse event handlers for scrolling
  const handleMouseDown = (e) => {
    isDragging.current = true;
    isMoved.current = false;
    if (isDesktop) {
      startY.current = e.pageY - scrollContainerRef.current.offsetTop;
      scrollTop.current = scrollContainerRef.current.scrollTop;
    } else {
      startX.current = e.pageX - scrollContainerRef.current.offsetLeft;
      scrollLeft.current = scrollContainerRef.current.scrollLeft;
    }
  };

  const handleMouseLeave = () => {
    isDragging.current = false;
  };

  const handleMouseUp = () => {
    isDragging.current = false;
  };

  const handleMouseMove = (e) => {
    if (!isDragging.current) return;
    e.preventDefault();
    if (isDesktop) {
      const y = e.pageY - scrollContainerRef.current.offsetTop;
      const moveY = y - startY.current;
      const walkY = moveY * 1; // Adjust scrolling speed as needed
      scrollContainerRef.current.scrollTop = scrollTop.current - walkY;

      // Check if movement exceeds drag threshold
      if (!isMoved.current && Math.abs(moveY) > dragThreshold) {
        isMoved.current = true;
      }
    } else {
      const x = e.pageX - scrollContainerRef.current.offsetLeft;
      const moveX = x - startX.current;
      const walkX = moveX * 1; // Adjust scrolling speed as needed
      scrollContainerRef.current.scrollLeft = scrollLeft.current - walkX;

      // Check if movement exceeds drag threshold
      if (!isMoved.current && Math.abs(moveX) > dragThreshold) {
        isMoved.current = true;
      }
    }
  };

  return (
    <div
      className={styles.alphabetButtons}
      ref={scrollContainerRef}
      onMouseDown={handleMouseDown}
      onMouseLeave={handleMouseLeave}
      onMouseUp={handleMouseUp}
      onMouseMove={handleMouseMove}
    >
      {ALPHABETS.map((letter) => {
        const isMainActive =
          selectedLetter === letter &&
          (!selectedSubButton || selectedSubButton.letter !== letter);

        return (
          <React.Fragment key={letter}>
            <button
              className={`${styles.alphabetButton} ${
                isMainActive ? styles.active : ''
              }`}
              onClick={() => handleLetterClick(letter)}
              aria-haspopup="true"
              aria-expanded={
                selectedLetter === letter && LETTERS_WITH_SUBBUTTONS[letter]
                  ? 'true'
                  : 'false'
              }
              aria-controls={`subButtons-${letter}`}
            >
              {letter}
            </button>

            {selectedLetter === letter &&
              Array.isArray(LETTERS_WITH_SUBBUTTONS[letter]) &&
              LETTERS_WITH_SUBBUTTONS[letter].map((subButton) => {
                const isSubButtonActive =
                  selectedSubButton &&
                  selectedSubButton.letter === letter &&
                  selectedSubButton.subButton === subButton;

                return (
                  <button
                    key={subButton}
                    className={`${styles.subButton} ${
                      isSubButtonActive ? styles.activeSubButton : ''
                    }`}
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
  );
}

AlphabetButtons.propTypes = {
  selectedLetter: PropTypes.string,
  selectedSubButton: PropTypes.shape({
    letter: PropTypes.string,
    subButton: PropTypes.string,
  }),
  onLetterSelect: PropTypes.func.isRequired,
  onSubButtonClick: PropTypes.func.isRequired,
};

export default AlphabetButtons;
