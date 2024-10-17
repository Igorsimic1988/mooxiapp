// src/components/ItemSelection/FilterHeader/FilterHeader.js

import React from 'react';
import styles from './BcalculatorMyitems.module.css';
import ToggleSwitch from './ToogleSwitch/ToogleSwitch';

function BcalculatorMyitems({ isToggled, onToggle, onActionClick, actionLabel }) {
    return (
        <div className={styles.filterHeader}>
          <div className={styles.leftSection}>
            <span className={styles.filterText}>Boxes Auto Calculator</span>
            <ToggleSwitch isToggled={isToggled} onToggle={onToggle} />
          </div>
          <button className={styles.actionButton} onClick={onActionClick}>
            <p>My Items</p>
             <div className={styles.itemCount}>
               <p>23</p>
            </div>
          </button>
        </div>
      );
    }

export default BcalculatorMyitems;
