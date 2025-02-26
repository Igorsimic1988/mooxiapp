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

  // If hasPackingDay=true => which button is highlighted? (packing vs. moving)
  // We'll read from lead.activeDay or default 'packing'
  // But we might also override it if the user calls onDaySelected
  const [selectedDay, setSelectedDay] = useState(
    lead?.activeDay === 'packing' ? 'packing' : 'moving'
  );

  // If lead changes externally, we might want to reflect that
  // (only if you anticipate the lead prop might be replaced).
  // For simplicity, a one-time load is often enough. Otherwise:
  useEffect(() => {
    setHasPackingDay(Boolean(lead?.hasPackingDay));
    if (lead?.activeDay === 'packing') {
      setSelectedDay('packing');
    } else if (lead?.activeDay === 'moving') {
      setSelectedDay('moving');
    }
  }, [lead]);

  const handleAddPackingDay = () => {
    setHasPackingDay(true);
    setSelectedDay('packing');
    if (onLeadUpdated) {
      onLeadUpdated({ ...lead, hasPackingDay: true });
    }
    if (onDaySelected) {
      onDaySelected('Packing');
    }
  };

  const handleSelectDay = (day) => {
    setSelectedDay(day);
    if (onDaySelected) {
      const capitalized = day === 'packing' ? 'Packing' : 'Moving';
      onDaySelected(capitalized);
    }
  };

  const handleRemovePackingDay = () => {
    setHasPackingDay(false);
    setSelectedDay('moving');
    if (onLeadUpdated) {
      onLeadUpdated({ ...lead, hasPackingDay: false });
    }
    if (onDaySelected) {
      onDaySelected('Moving');
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
