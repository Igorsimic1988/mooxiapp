// CustomSelect.js
import React, { useState, useRef, useEffect } from 'react';
import styles from './CustomSelect.module.css';
import { ReactComponent as DropdownIcon } from '../../../../../assets/icons/unfoldmore.svg';

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
  const handleOptionClick = (option) => {
    onOptionChange(option);
    setIsOpen(false);
  };

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
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <DropdownIcon className={`${styles.dropdownIcon} ${isOpen ? styles.rotate : ''}`} />
      </button>

      {isOpen && (
        <ul className={styles.optionsList} role="listbox">
          {options.map((option) => (
            <li
              key={option.value}
              className={`${styles.option} ${
                selectedOption && selectedOption.value === option.value ? styles.selected : ''
              }`}
              role="option"
              aria-selected={selectedOption && selectedOption.value === option.value}
              onClick={() => handleOptionClick(option)}
              onKeyPress={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  handleOptionClick(option);
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
