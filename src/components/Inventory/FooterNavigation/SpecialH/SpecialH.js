import React from 'react';
import styles from './SpecialH.module.css';

import { ReactComponent as SpecialHPopupIcon } from '../../../../assets/icons/SpecialHPopupIcon.svg';
import { ReactComponent as CloseIcon } from '../../../../assets/icons/Close.svg';


function SpecialH({ setIsSpecialHVisible, roomItemSelections }) {
  const handleClose = () => {
    setIsSpecialHVisible(false);
  };

  return (
    <div className={styles.popup}>
      <div className={styles.popupContent}>
        {/* Header */}
        <div className={styles.header}>
          <div className={styles.title}>
            <SpecialHPopupIcon className={styles.icon} />
            <p>Special Handling</p>
          </div>
            <div className={styles.closeButton}>
               <button onClick={handleClose}>
               <CloseIcon className={styles.closeIcon} />
               </button>
            </div>
        </div>

        {/* Tab Navigation */}
        <div className={styles.tabNavigation}>
           <div className={styles.tab} id="itemTagsTab">
             <p>Item Tags</p>
           </div>
           <div className={styles.tab} id="locationTagsTab">
              <p>Location Tags</p>
            </div>
        </div>


        {/* Button Group */}
        <div className={styles.buttonGroup}>
          <button>Packing</button>
          <button>Additional</button>
        </div>

        {/* Dropdown Section */}
        <div className={styles.dropdownSection}>
          <div>
            <select name="options">
              <option value="option1">Option 1</option>
              <option value="option2">Option 2</option>
              <option value="option3">Option 3</option>
            </select>
            <div>
              <img src="path_to_icon" alt="Icon" />
            </div>
          </div>
          <button>
            <p>Add</p>
            <div>
              <img src="path_to_add_icon" alt="Add Icon" />
            </div>
          </button>
        </div>

        {/* Room Lists */}
        <div className={styles.roomLists}>
          {Object.keys(roomItemSelections).map((roomName) => {
            const items = roomItemSelections[roomName];
            if (items.length === 0) return null; // Skip rooms with no items

            return (
              <div key={roomName} className={styles.room}>
                <h3 className={styles.roomName}>{roomName}</h3>
                <div className={styles.itemCards}>
                  {items.map((itemInstance) => (
                    <div key={itemInstance.id} className={styles.itemCard}>
                      <p>{itemInstance.item.name}</p>
                      {/* Additional item details can go here */}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default SpecialH;
