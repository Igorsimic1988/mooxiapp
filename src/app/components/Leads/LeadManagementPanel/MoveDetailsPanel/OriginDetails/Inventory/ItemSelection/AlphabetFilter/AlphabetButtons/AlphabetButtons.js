"use client";

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
  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const handleResize = () => {
        setIsDesktop(window.innerWidth >= 1024);
      };
      handleResize();
      window.addEventListener('resize', handleResize);
      return () => window.removeEventListener('resize', handleResize);
    }
  }, []);

  // Simple letter click handler
  const handleLetterClick = (letter) => {
    console.log('Letter clicked:', letter, 'Currently selected:', selectedLetter);
    
    if (selectedLetter === letter) {
      console.log('Deselecting letter:', letter);
      onLetterSelect(null);
    } else {
      console.log('Selecting letter:', letter);
      onLetterSelect(letter);
    }
  };

  // Simple sub-button click handler
  const handleSubButtonClickInternal = (subButton, letter) => {
    onSubButtonClick(letter, subButton);
  };

  // Only handle scrolling on the container, not individual buttons
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    let scrollTimeout;

    const handleScroll = () => {
      isScrolling = true;
      clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(() => {
        isScrolling = false;
      }, 150);
    };

    container.addEventListener('scroll', handleScroll, { passive: true });
    
    return () => {
      container.removeEventListener('scroll', handleScroll);
      clearTimeout(scrollTimeout);
    };
  }, []);

  return (
    <div
      className={styles.alphabetButtons}
      ref={scrollContainerRef}
      style={{ 
        overflowX: isDesktop ? 'hidden' : 'auto',
        overflowY: isDesktop ? 'auto' : 'hidden'
      }}
    >
      {ALPHABETS.map((letter) => {
        const isMainActive =
          selectedLetter === letter &&
          (!selectedSubButton || selectedSubButton.letter !== letter);

        console.log(`Letter ${letter}: isMainActive=${isMainActive}, selectedLetter=${selectedLetter}`);

        return (
          <React.Fragment key={letter}>
            <button
              className={`${styles.alphabetButton} ${
                isMainActive ? styles.active : ''
              }`}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                handleLetterClick(letter);
              }}
              style={{
                backgroundColor: isMainActive ? '#71879C' : '#ffffff',
                color: isMainActive ? 'white' : '#90A4B7'
              }}
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
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      handleSubButtonClickInternal(subButton, letter);
                    }}
                    style={{
                      backgroundColor: isSubButtonActive ? '#71879C' : '#ffffff',
                      color: isSubButtonActive ? 'white' : '#90A4B7'
                    }}
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