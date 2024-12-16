import React from 'react';
import { ReactComponent as AddBars } from '../../../assets/icons/barsStaggered.svg';
import { ReactComponent as NotificationBell } from '../../../assets/icons/notificationBell.svg';
import { ReactComponent as MessageIcon } from '../../../assets/icons/message.svg';
import { ReactComponent as ForwardArrow } from '../../../assets/icons/arrowforward.svg';
import styles from './HeaderDashboard.module.css';

function HeaderDashboard({ isLeadSelected, onBack }) {
  return (
    <div className={`${styles.headerContainer} ${isLeadSelected ? styles.leadSelected : ''}`}>
      <div className={styles.topBar}>
        <div className={styles.leftGroup}>
          <AddBars className={styles.addBarsIcon} />
          <div className={styles.verticalDivider}></div>
          {isLeadSelected ? (
            <ForwardArrow className={styles.forwardArrowIcon} onClick={onBack} />
          ) : (
            <span className={styles.homeText}>Home</span>
          )}
        </div>
        <div className={styles.rightGroup}>
          <div className={styles.messageGroup}>
            <div className={styles.messageBadge}>3</div>
            <MessageIcon className={styles.messageIcon} />
          </div>
          <div className={styles.notificationGroup}>
            <div className={styles.notificationBadge}></div>
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
