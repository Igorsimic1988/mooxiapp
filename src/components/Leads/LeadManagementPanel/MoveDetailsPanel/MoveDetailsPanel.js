import React, { useState } from 'react';
import { ReactComponent as TruckCouchIcon } from '../../../../assets/icons/truckcouch.svg';
import { ReactComponent as NotebookIcon } from '../../../../assets/icons/notebook.svg';
import { ReactComponent as EmailWithDotIcon } from '../../../../assets/icons/emailwithdot.svg';
import { ReactComponent as CalendarIcon } from '../../../../assets/icons/calendar.svg';
import { ReactComponent as MoreIcon } from '../../../../assets/icons/more.svg';
import SimpleToggle from '../../SimpleToggle/SimpleToggle';
import styles from './MoveDetailsPanel.module.css';

function MoveDetailsPanel() {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isToggled, setIsToggled] = useState(false);

  const isSelected = (idx) => idx === selectedIndex;

  return (
    <div className={styles.panelContainer}>
      {/* Sections Row */}
      <div className={styles.sectionsRow}>
        {/* Move */}
        <div 
          className={`${styles.sectionItem} ${isSelected(0) ? styles.selected : ''}`} 
          onClick={() => setSelectedIndex(0)}
        >
          <TruckCouchIcon className={`${styles.sectionIcon} ${isSelected(0) ? styles.iconActive : ''}`} />
          <span className={`${styles.sectionText} ${isSelected(0) ? styles.textActive : ''}`}>Move</span>
        </div>

        {/* Notes */}
        <div 
          className={`${styles.sectionItem} ${isSelected(1) ? styles.selected : ''}`} 
          onClick={() => setSelectedIndex(1)}
        >
          <NotebookIcon className={`${styles.sectionIcon} ${isSelected(1) ? styles.iconActive : ''}`} />
          <span className={`${styles.sectionText} ${isSelected(1) ? styles.textActive : ''}`}>Notes</span>
        </div>

        {/* Email */}
        <div 
          className={`${styles.sectionItem} ${isSelected(2) ? styles.selected : ''}`} 
          onClick={() => setSelectedIndex(2)}
        >
          <EmailWithDotIcon className={`${styles.sectionIcon} ${isSelected(2) ? styles.iconActive : ''}`} />
          <span className={`${styles.sectionText} ${isSelected(2) ? styles.textActive : ''}`}>Email</span>
        </div>

        {/* Availability */}
        <div 
          className={`${styles.sectionItem} ${isSelected(3) ? styles.selected : ''}`} 
          onClick={() => setSelectedIndex(3)}
        >
          <div className={styles.greenDot}></div>
          <span className={`${styles.sectionText} ${isSelected(3) ? styles.textActive : ''}`}>Availability</span>
        </div>
      </div>

      {/* Spacing after sectionsRow handled by CSS (margin) */}

      {/* First input (Move Data) */}
      <div className={styles.inputContainer}>
        <span className={styles.inputLabel}>Move Data</span>
        <div className={styles.inputIconContainer}>
          <CalendarIcon className={styles.inputIcon} />
        </div>
      </div>

      {/* Second input (Type of Service: Moving) */}
      <div className={styles.inputContainer}>
        <span className={styles.inputLabel}>
          Type of Service:
          <span className={styles.inputValue}> Moving</span>
        </span>
        <MoreIcon className={styles.moreIcon} />
      </div>

      {/* Add storage and toggle in one container */}
      <div className={styles.storageContainer}>
        <span className={styles.addStorageText}>Add storage</span>
        <SimpleToggle isToggled={isToggled} onToggle={setIsToggled} />
      </div>
    </div>
  );
}

export default MoveDetailsPanel;
