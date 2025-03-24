"use client";

import React from 'react';
import styles from './HeaderDashboard.module.css';
import Icon from "../../Icon";

/**
 * HeaderDashboard
 *
 * - If isInInventory=true:
 *   - If isDesktopInventory => arrow calls onCloseInventory() directly
 *   - Else (mobile):
 *       if (inRoom) => onRoomBack()
 *       else => onCloseInventory()
 * - Else if isLeadSelected => arrow calls onBack() for leads
 */
function HeaderDashboard({
  isLeadSelected = false,
  onBack = () => {},
  isInInventory = false,
  inRoom = false,
  roomName = '',
  onRoomBack = () => {},
  onCloseInventory = () => {},
  isDesktopInventory = false, // <--- new prop
}) {
  const handleArrowClick = () => {
    if (isInInventory) {
      // If it's desktop, always close inventory
      if (isDesktopInventory) {
        onCloseInventory();
      }
      // Otherwise (mobile):
      else {
        if (inRoom) {
          onRoomBack();
        } else {
          onCloseInventory();
        }
      }
    } else if (isLeadSelected) {
      onBack();
    } else {
      // do nothing or Home
    }
  };

  return (
    <div className={`${styles.headerContainer} ${isLeadSelected ? styles.leadSelected : ''}`}>
      <div className={styles.topBar}>
        <div className={styles.leftGroup}>
          <Icon name="BarsStaggered" className={styles.addBarsIcon} />
          {(isInInventory || isLeadSelected) ? (
            <Icon name="ArrowForward" className={styles.forwardArrowIcon} onClick={handleArrowClick} />
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
            <Icon name="Message" className={styles.messageIcon} />
          </div>
          <div className={styles.notificationGroup}>
            <div className={styles.notificationBadge} />
            <Icon name="NotificationBell" className={styles.notificationIcon} />
          </div>
        </div>
      </div>

  
    </div>
  );
}

export default HeaderDashboard;
