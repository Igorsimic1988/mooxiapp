import React, { useState, useEffect } from 'react';
import styles from './PackingDay.module.css';

/**
 * This component shows either:
 * - "Add Packing Day" if lead.hasPackingDay=false
 * - Otherwise, two buttons: "Packing Day" / "Moving Day"
 * We also show a "Remove packing day" if selectedDay==='packing'.
 */
function PackingDay({ lead, onDaySelected, onLeadUpdated }) {
  // We read the initial "hasPackingDay" from lead
  const [hasPackingDay, setHasPackingDay] = useState(Boolean(lead?.hasPackingDay));

  // If hasPackingDay=true => which button is highlighted? default 'packing'
  // but if lead.activeDay==='moving', we highlight that
  const [selectedDay, setSelectedDay] = useState(
    lead?.activeDay === 'packing' ? 'packing' : 'moving'
  );

    // Update local state when lead prop changes
  useEffect(() => {
    setHasPackingDay(Boolean(lead?.hasPackingDay));
    if (lead?.activeDay === 'packing') {
      setSelectedDay('packing');
    } else {
      setSelectedDay('moving');
    }
  }, [lead?.hasPackingDay, lead?.activeDay]);

  // Show the two buttons with Packing Day selected by default
  const handleAddPackingDay = () => {
    setHasPackingDay(true);
    setSelectedDay('packing');
    if (onLeadUpdated) {
      onLeadUpdated({
        ...lead,
        hasPackingDay: true,
        activeDay: 'packing',  // store as lowercase
      });
    }
    if (onDaySelected) {
      onDaySelected('packing');
    }
  };

  const handleSelectDay = (day) => {
    setSelectedDay(day);
      // Update parent component
      if (onLeadUpdated) {
        onLeadUpdated({
          ...lead,
          activeDay: day, // store exactly 'packing' or 'moving'
        });
      }
      
      // Notify parent about selected day
    if (onDaySelected) {
      onDaySelected(day);
    }
  };

  const handleRemovePackingDay = () => {
    setHasPackingDay(false);
    setSelectedDay('moving');
    if (onLeadUpdated) {
      onLeadUpdated({
        ...lead,
        hasPackingDay: false,
        activeDay: 'moving',
      });
    }
    if (onDaySelected) {
      onDaySelected('moving');
    }
  };

  return (
    <div className={styles.packingDayRow}>
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
              className={`
                ${styles.dayButton}
                ${selectedDay === 'packing' ? styles.buttonSelected : styles.buttonUnselected}
              `}
              onClick={() => handleSelectDay('packing')}
            >
              Packing Day
            </button>
            <button
              className={`
                ${styles.dayButton}
                ${selectedDay === 'moving' ? styles.buttonSelected : styles.buttonUnselected}
              `}
              onClick={() => handleSelectDay('moving')}
            >
              Moving Day
            </button>
          </>
        )}
      </div>

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
