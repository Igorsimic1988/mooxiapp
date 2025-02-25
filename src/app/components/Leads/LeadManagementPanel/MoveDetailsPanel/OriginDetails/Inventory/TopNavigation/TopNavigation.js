import React from 'react';
import styles from './TopNavigation.module.css';
import AddBars from '../../../../../../../assets/icons/barsStaggered.svg';
import ForwardArrow from '../../../../../../../assets/icons/arrowforward.svg';

function TopNavigation({ inRoom, roomName, onBack, onCloseInventory }) {
  // Handlers for the menu icon (AddBars)
  const handleMenuClick = () => {
    // TODO: Implement menu opening functionality
  };

  const handleMenuKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      handleMenuClick();
    }
  };

  // Handler for forward navigation
  const handleForwardClick = () => {
    if (inRoom) {
      onBack();
    } else {
      onCloseInventory();
    }
  };

  const handleForwardKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      handleForwardClick();
    }
  };

  return (
    <nav className={styles.topNavigation} aria-label="Main Navigation">
      <div
        className={styles.menuIcon}
        role="button"
        tabIndex="0"
        onClick={handleMenuClick}
        onKeyDown={handleMenuKeyDown}
        aria-label="Open Menu"
      >
        <AddBars className={styles.barsMobileVersion} aria-hidden="true" />
      </div>

      <div className={styles.verticalLineMobile} aria-hidden="true"></div>

      {inRoom ? (
        <div
          className={styles.navigationContent}
          role="button"
          tabIndex="0"
          onClick={handleForwardClick}
          onKeyDown={handleForwardKeyDown}
          aria-label="Go Back to Rooms"
        >
          <div className={styles.backButton}>
            <ForwardArrow className={styles.backArrow} aria-hidden="true" />
          </div>
          <span className={styles.navigationText}>{roomName}</span>
        </div>
      ) : (
        <div
          className={styles.navigationContent}
          role="button"
          tabIndex="0"
          onClick={handleForwardClick}
          onKeyDown={handleForwardKeyDown}
          aria-label="Go to Quote"
        >
          <div className={styles.forwardArrow}>
            <ForwardArrow className={styles.forwardArrowIcon} aria-hidden="true" />
          </div>
          <span className={styles.navigationText}>Go to Quote</span>
        </div>
      )}
    </nav>
  );
}

export default TopNavigation;
