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
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);
  const [hasDragged, setHasDragged] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const mediaQuery = window.matchMedia('(min-width: 1024px)');
      
      const handleMediaChange = (e) => {
        setIsDesktop(e.matches);
      };
      
      // Set initial value
      setIsDesktop(mediaQuery.matches);
      
      // Listen for changes
      mediaQuery.addEventListener('change', handleMediaChange);
      
      return () => mediaQuery.removeEventListener('change', handleMediaChange);
    }
  }, []);

  // Enable horizontal scrolling with mouse wheel
  useEffect(() => {
    const scrollContainer = scrollContainerRef.current;
    if (!scrollContainer || isDesktop) return;

    const handleWheel = (e) => {
      if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
        e.preventDefault();
        scrollContainer.scrollLeft += e.deltaY;
      }
    };

    scrollContainer.addEventListener('wheel', handleWheel, { passive: false });
    
    return () => {
      scrollContainer.removeEventListener('wheel', handleWheel);
    };
  }, [isDesktop]);

  // Mouse drag handlers
  const handleMouseDown = (e) => {
    if (isDesktop) return;
    
    const scrollContainer = scrollContainerRef.current;
    setIsDragging(true);
    setHasDragged(false);
    setStartX(e.pageX - scrollContainer.offsetLeft);
    setScrollLeft(scrollContainer.scrollLeft);
    scrollContainer.style.cursor = 'grabbing';
  };

  const handleMouseMove = (e) => {
    if (!isDragging || isDesktop) return;
    
    e.preventDefault();
    const scrollContainer = scrollContainerRef.current;
    const x = e.pageX - scrollContainer.offsetLeft;
    const walk = (x - startX) * 1.5; // Multiply by 1.5 for faster scrolling
    
    // Mark as dragged if moved more than 5 pixels
    if (Math.abs(walk) > 5) {
      setHasDragged(true);
    }
    
    scrollContainer.scrollLeft = scrollLeft - walk;
  };

  const handleMouseUp = () => {
    if (isDesktop) return;
    
    setIsDragging(false);
    const scrollContainer = scrollContainerRef.current;
    if (scrollContainer) {
      scrollContainer.style.cursor = 'grab';
    }
    
    // Reset hasDragged after a short delay to prevent click events
    setTimeout(() => {
      setHasDragged(false);
    }, 50);
  };

  const handleMouseLeave = () => {
    if (isDesktop) return;
    
    setIsDragging(false);
    const scrollContainer = scrollContainerRef.current;
    if (scrollContainer) {
      scrollContainer.style.cursor = 'grab';
    }
    
    // Reset hasDragged
    setTimeout(() => {
      setHasDragged(false);
    }, 50);
  };

  // Prevent text selection while dragging and handle global mouseup
  useEffect(() => {
    const handleSelectStart = (e) => {
      if (isDragging) {
        e.preventDefault();
      }
    };

    const handleGlobalMouseUp = () => {
      if (isDragging) {
        setIsDragging(false);
        const scrollContainer = scrollContainerRef.current;
        if (scrollContainer) {
          scrollContainer.style.cursor = 'grab';
        }
        
        // Reset hasDragged after a short delay
        setTimeout(() => {
          setHasDragged(false);
        }, 50);
      }
    };

    document.addEventListener('selectstart', handleSelectStart);
    document.addEventListener('mouseup', handleGlobalMouseUp);
    
    return () => {
      document.removeEventListener('selectstart', handleSelectStart);
      document.removeEventListener('mouseup', handleGlobalMouseUp);
    };
  }, [isDragging]);

  // Simple letter click handler
  const handleLetterClick = (letter) => {
    // Don't trigger click if we were dragging
    if (hasDragged) return;
    
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
    // Don't trigger click if we were dragging
    if (hasDragged) return;
    
    onSubButtonClick(letter, subButton);
  };

  return (
    <div
      className={`${styles.alphabetButtons} ${!isDesktop ? styles.draggable : ''}`}
      ref={scrollContainerRef}
      style={{ 
        overflowX: isDesktop ? 'hidden' : 'auto',
        overflowY: isDesktop ? 'auto' : 'hidden',
        cursor: !isDesktop ? (isDragging ? 'grabbing' : 'grab') : 'auto'
      }}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseLeave}
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