// src/components/SpecialH/CustomSelect/CustomSelect.js

import React, { useState, useRef, useEffect } from 'react';
import styles from './CustomSelect.module.css';
import Icon from 'src/app/components/Icon';

function CustomSelect({ options, selectedOption, onOptionChange, placeholder }) {
  const [isOpen, setIsOpen] = useState(false);
  const selectRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (selectRef.current && !selectRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Toggle dropdown
  const toggleDropdown = () => {
    setIsOpen((prev) => !prev);
  };

  // Handle option selection
  const handleOptionClick = (tagValue) => {
    onOptionChange(tagValue); // Pass the tag value string
    setIsOpen(false);
  };

  // Determine the label to display based on selectedOption
  const selectedLabel = options.find(opt => opt.value === selectedOption)?.label || placeholder;

  return (
    <div className={styles.customSelect} ref={selectRef}>
      <button
        type="button"
        className={styles.selectButton}
        onClick={toggleDropdown}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
      >
        <span className={styles.selectedText}>
          {selectedLabel}
        </span>
        <Icon name="UnfoldMore" className={`${styles.dropdownIcon} ${isOpen ? styles.rotate : ''}`} />
      </button>

      {isOpen && (
        <ul className={styles.optionsList} role="listbox">
          {options.map((option) => (
            <li
              key={option.value}
              className={`${styles.option} ${
                selectedOption === option.value ? styles.selected : ''
              }`}
              role="option"
              aria-selected={selectedOption === option.value}
              onClick={() => handleOptionClick(option.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  handleOptionClick(option.value);
                }
              }}
              tabIndex={0}
            >
              {option.label}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default CustomSelect;
