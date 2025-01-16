// src/components/Leads/HeadrerDashboard.js/HeaderDashboard.js

import React from 'react';
import { ReactComponent as AddBars } from '../../../assets/icons/barsStaggered.svg';
import { ReactComponent as NotificationBell } from '../../../assets/icons/notificationBell.svg';
import { ReactComponent as MessageIcon } from '../../../assets/icons/message.svg';
import { ReactComponent as ForwardArrow } from '../../../assets/icons/arrowforward.svg';
import styles from './HeaderDashboard.module.css';

/**
 * HeaderDashboard
 *
 *   - If isInInventory=true, arrow calls:
 *       if (inRoom) => onRoomBack()
 *       else => onCloseInventory()
 *   - Else if isLeadSelected => arrow calls onBack() for leads
 *   - Also displays roomName if inRoom
 */
function HeaderDashboard({
  isLeadSelected = false,
  onBack = () => {},
  isInInventory = false,
  inRoom = false,
  roomName = '',
  onRoomBack = () => {},
  onCloseInventory = () => {},
}) {
  const handleArrowClick = () => {
    if (isInInventory) {
      if (inRoom) {
        // We are inside a room => arrow goes back to the "Inventory main"
        onRoomBack();
      } else {
        // We are in inventory, but not in a room => close inventory => go back to Leads
        onCloseInventory();
      }
    } else if (isLeadSelected) {
      // Normal leads => arrow closes the lead-management panel
      onBack();
    }
    // else => do nothing or show "Home"
  };

  return (
    <div
      className={`${styles.headerContainer} ${isLeadSelected ? styles.leadSelected : ''}`}
    >
      <div className={styles.topBar}>
        <div className={styles.leftGroup}>
          <AddBars className={styles.addBarsIcon} />
          <div className={styles.verticalDivider} />

          {/* 
            If in inventory or a lead is open => show arrow
            else => "Home"
          */}
          {(isInInventory || isLeadSelected) ? (
            <ForwardArrow
              className={styles.forwardArrowIcon}
              onClick={handleArrowClick}
            />
          ) : (
            <span className={styles.homeText}>Home</span>
          )}

          {/* If in Inventory + inRoom => show roomName */}
          {isInInventory && inRoom && (
            <span className={styles.roomNameText}>
              {roomName}
            </span>
          )}
        </div>

        <div className={styles.rightGroup}>
          <div className={styles.messageGroup}>
            <div className={styles.messageBadge}>3</div>
            <MessageIcon className={styles.messageIcon} />
          </div>
          <div className={styles.notificationGroup}>
            <div className={styles.notificationBadge} />
            <NotificationBell className={styles.notificationIcon} />
          </div>
        </div>
      </div>

      <div className={styles.bottomBarBack}>
        <div className={styles.bottomBar}></div>
      </div>
    </div>
  );
}

export default HeaderDashboard;
