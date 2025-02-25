import React, { useState } from 'react';
import styles from './PackingDay.module.css';

function PackingDay() {
  const [hasPackingDay, setHasPackingDay] = useState(false);
  const [selectedDay, setSelectedDay] = useState(null);

  // Show the two buttons with Packing Day selected by default
  const handleAddPackingDay = () => {
    setHasPackingDay(true);
    setSelectedDay('packing');
  };

  const handleSelectDay = (day) => {
    setSelectedDay(day);
  };

  const handleRemovePackingDay = () => {
    setHasPackingDay(false);
    setSelectedDay(null);
  };

  return (
    <div className={styles.packingDayRow}>
      {/* The gray container on the top-left */}
      <div className={styles.packingDayContainer}>
        {!hasPackingDay ? (
          <>
            <span className={styles.addPackingDayText}>Add Packing Day</span>
            <button className={styles.plusButton} onClick={handleAddPackingDay}>
              +
            </button>
          </>
        ) : (
          <>
            <button
              className={`${styles.dayButton} ${
                selectedDay === 'packing' ? styles.buttonSelected : styles.buttonUnselected
              }`}
              onClick={() => handleSelectDay('packing')}
            >
              Packing Day
            </button>
            <button
              className={`${styles.dayButton} ${
                selectedDay === 'moving' ? styles.buttonSelected : styles.buttonUnselected
              }`}
              onClick={() => handleSelectDay('moving')}
            >
              Moving Day
            </button>
          </>
        )}
      </div>

      {/* Pinned at bottom-right; only appears if "Packing Day" is selected */}
      {hasPackingDay && selectedDay === 'packing' && (
        <button
          type="button"
          className={styles.removePackingDayLink}
          onClick={handleRemovePackingDay}
        >
          Remove packing day
        </button>
      )}
    </div>
  );
}

export default PackingDay;
