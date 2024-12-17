import React, { useState } from 'react';
import { ReactComponent as TruckCouchIcon } from '../../../../assets/icons/truckcouch.svg';
import { ReactComponent as NotebookIcon } from '../../../../assets/icons/notebook.svg';
import { ReactComponent as EmailWithDotIcon } from '../../../../assets/icons/emailwithdot.svg';
import { ReactComponent as CalendarIcon } from '../../../../assets/icons/calendar.svg';
import { ReactComponent as MoreIcon } from '../../../../assets/icons/unfoldmore.svg';
import { ReactComponent as ClockIcon } from '../../../../assets/icons/clock.svg';
import SimpleToggle from '../../SimpleToggle/SimpleToggle';
import OriginDetails from '../OriginDetails/OriginDetails'; 
import styles from './MoveDetailsPanel.module.css';

function MoveDetailsPanel({ onShowInventory }) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isToggled, setIsToggled] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);

  const storageOptions = [
    "Few items",
    "Less than half",
    "Half of the items",
    "More than half",
    "Almost all",
    "All items"
  ];

  const [selectedStorage, setSelectedStorage] = useState("All items");
  const [isTimePromisedToggled, setIsTimePromisedToggled] = useState(false);

  const isSelected = (idx) => idx === selectedIndex;

  const handleDropdownToggle = () => {
    if (isToggled) {
      setShowDropdown(prev => !prev);
    }
  };

  const handleOptionSelect = (option) => {
    setSelectedStorage(option);
    setShowDropdown(false);
  };

  return (
    <div className={styles.panelContainer}>
      {/* Sections Row */}
      <div className={styles.sectionsRow}>
        <div 
          className={`${styles.sectionItem} ${isSelected(0) ? styles.selected : ''}`} 
          onClick={() => setSelectedIndex(0)}
        >
          <TruckCouchIcon className={`${styles.sectionIcon} ${isSelected(0) ? styles.iconActive : ''}`} />
          <span className={`${styles.sectionText} ${isSelected(0) ? styles.textActive : ''}`}>Move</span>
        </div>

        <div 
          className={`${styles.sectionItem} ${isSelected(1) ? styles.selected : ''}`} 
          onClick={() => setSelectedIndex(1)}
        >
          <NotebookIcon className={`${styles.sectionIcon} ${isSelected(1) ? styles.iconActive : ''}`} />
          <span className={`${styles.sectionText} ${isSelected(1) ? styles.textActive : ''}`}>Notes</span>
        </div>

        <div 
          className={`${styles.sectionItem} ${isSelected(2) ? styles.selected : ''}`} 
          onClick={() => setSelectedIndex(2)}
        >
          <EmailWithDotIcon className={`${styles.sectionIcon} ${isSelected(2) ? styles.iconActive : ''}`} />
          <span className={`${styles.sectionText} ${isSelected(2) ? styles.textActive : ''}`}>Email</span>
        </div>

        <div 
          className={`${styles.sectionItem} ${isSelected(3) ? styles.selected : ''}`} 
          onClick={() => setSelectedIndex(3)}
        >
          <div className={styles.greenDot}></div>
          <span className={`${styles.sectionText} ${isSelected(3) ? styles.textActive : ''}`}>Availability</span>
        </div>
      </div>

      {/* Move Date input */}
      <div className={styles.inputContainer}>
        <span className={styles.inputLabel}>Move Data</span>
        <div className={styles.inputIconContainer}>
          <CalendarIcon className={styles.inputIcon} />
        </div>
      </div>

      {/* Type of Service input */}
      <div className={styles.inputContainer}>
        <span className={styles.inputLabel}>
          Type of Service:
          <span className={styles.inputValue}> Moving</span>
        </span>
        <MoreIcon className={styles.moreIcon} />
      </div>

      {/* Add storage row */}
      <div className={styles.storageContainer}>
        <span className={styles.addStorageText}>Add storage</span>
        <SimpleToggle isToggled={isToggled} onToggle={setIsToggled} />
      </div>

      {/* Storage dropdown (if toggled on) */}
      {isToggled && (
        <div className={styles.storageDropdown} onClick={handleDropdownToggle}>
          <span className={styles.inputLabel}>
            Items in storage:
            <span className={styles.inputValue}> {selectedStorage}</span>
          </span>
          <MoreIcon className={styles.moreIcon} />
          {showDropdown && (
            <div className={styles.dropdownMenu}>
              {storageOptions.map((option) => (
                <div 
                  key={option} 
                  className={styles.dropdownOption}
                  onClick={(e) => {
                    e.stopPropagation(); 
                    handleOptionSelect(option);
                  }}
                >
                  {option}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      <div className={styles.spacing30}></div>

      {/* Delivery Date input */}
      <div className={styles.inputContainer}>
        <span className={styles.inputLabel}>Delivery Date</span>
        <div className={styles.inputIconContainer}>
          <CalendarIcon className={styles.inputIcon} />
        </div>
      </div>

      {/* ETA Request input */}
      <div className={styles.inputContainer}>
        <span className={styles.inputLabel}>
          ETA Request:
          <span className={styles.inputValue}> Morning</span>
        </span>
        <MoreIcon className={styles.moreIcon} />
      </div>

      {/* Time Promised row */}
      <div className={styles.timePromisedRow}>
        <span className={styles.timePromisedText}>Tipe promised</span>
        <SimpleToggle isToggled={isTimePromisedToggled} onToggle={setIsTimePromisedToggled} />
      </div>

      {isTimePromisedToggled && (
        <div className={styles.arrivalTimeInput}>
          <span className={styles.inputLabel}>
            Arrival Time:
            <span className={styles.inputValue}> 10:00am - 12:00pm</span>
          </span>
          <div className={styles.inputIconContainer}>
            <ClockIcon className={styles.inputIcon} />
          </div>
        </div>
      )}

      <div className={styles.spacing20}></div>

      {/* Now OriginDetails is included inside MoveDetailsPanel */}
      {/* Pass onShowInventory so OriginDetails can trigger inventory view */}
      <OriginDetails onShowInventory={onShowInventory} />
    </div>
  );
}

export default MoveDetailsPanel;
