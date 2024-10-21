import React from 'react';
import styles from './BcalculatorMyitems.module.css';
import ToggleSwitch from './ToogleSwitch/ToogleSwitch';

function BcalculatorMyitems({ isToggled, onToggle, itemCount, onActionClick, isMyItemsActive }) {
    return (
        <div className={styles.filterHeader}>
            <div className={styles.leftSection}>
                <span className={styles.filterText}>Boxes Auto Calculator</span>
                <ToggleSwitch isToggled={isToggled} onToggle={onToggle} />
            </div>
            <button
                className={`${styles.actionButton} ${isMyItemsActive ? styles.activeButton : ''}`} // Add active class if button is active
                onClick={onActionClick}
            >
                <p>My Items</p>
                <div className={styles.itemCount}>
                    <p>{itemCount}</p> {/* Display dynamic item count here */}
                </div>
            </button>
        </div>
    );
}

export default BcalculatorMyitems;
