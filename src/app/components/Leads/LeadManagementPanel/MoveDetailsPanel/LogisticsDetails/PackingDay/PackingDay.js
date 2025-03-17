import React from 'react';
import styles from './PackingDay.module.css';

/**
 * - If lead.hasPackingDay === false, show "Add Packing Day".
 * - If true, show two buttons: "Packing Day" / "Moving Day",
 *   plus "Remove packing day" if user wants to remove it entirely.
 */
function PackingDay({ lead, onDaySelected, onLeadUpdated }) {
  console.log("PackingDay render:", { 
    hasPackingDay: lead?.hasPackingDay, 
    activeDay: lead?.activeDay,
    leadId: lead?.lead_id
  });

  // Pull from the lead directly (no local state):
  const hasPackingDay = Boolean(lead?.hasPackingDay);
  const selectedDay = lead?.activeDay === 'packing' ? 'packing' : 'moving';

  // Add packing day => hasPackingDay = true, activeDay = 'packing'
  const handleAddPackingDay = () => {
    console.log("Add packing day clicked");
    
    // First update the lead through onLeadUpdated
    if (onLeadUpdated) {
      onLeadUpdated({
        ...lead,
        hasPackingDay: true,
        activeDay: 'packing',
      });
    }
    
    // Then notify parent (if needed)
    if (onDaySelected) {
      onDaySelected('packing');
    }
  };

  // Switch day => does NOT remove hasPackingDay
  const handleSelectDay = (day) => {
    console.log("Select day clicked:", day);
    if (selectedDay === day) return;

    // First update the lead
    if (onLeadUpdated) {
      onLeadUpdated({
        ...lead,
        hasPackingDay: true, // explicitly keep true
        activeDay: day,
      });
    }
    
    // Then notify parent
    if (onDaySelected) {
      onDaySelected(day);
    }
  };

  // Remove packing day => hasPackingDay=false, activeDay='moving'
  const handleRemovePackingDay = () => {
    console.log("Remove packing day clicked");
    
    // Update the lead
    if (onLeadUpdated) {
      onLeadUpdated({
        ...lead,
        hasPackingDay: false,
        activeDay: 'moving',
      });
    }
    
    // Notify parent
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
            <button
              type="button"
              className={styles.plusButton}
              onClick={handleAddPackingDay}
            >
              +
            </button>
          </>
        ) : (
          <>
            <button
              type="button"
              className={`
                ${styles.dayButton}
                ${selectedDay === 'packing' ? styles.buttonSelected : styles.buttonUnselected}
              `}
              onClick={() => handleSelectDay('packing')}
            >
              Packing Day
            </button>
            <button
              type="button"
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

      {/* Only show "Remove packing day" link if hasPackingDay===true AND we are on "packing" */}
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