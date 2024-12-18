import React, { useState } from 'react';
import { ReactComponent as CustomerUserIcon } from '../../../assets/icons/customeruser.svg';
import { ReactComponent as MoreIcon } from '../../../assets/icons/more.svg';
import { ReactComponent as EditIcon } from '../../../assets/icons/edit.svg';
import { ReactComponent as InProgressIcon } from '../../../assets/icons/inProgress.svg';
import { ReactComponent as UnfoldMoreIcon } from '../../../assets/icons/unfoldmore.svg';
import { ReactComponent as UserIcon } from '../../../assets/icons/user.svg';
import { ReactComponent as SpecialHIcon } from '../../../assets/icons/specialh.svg';
import MoveDetailsPanel from './MoveDetailsPanel/MoveDetailsPanel'; 
import Inventory from './MoveDetailsPanel/OriginDetails/Inventory/Inventory'; 
import styles from './LeadManagementPanel.module.css';

function LeadManagementPanel({ lead, onClose }) {
  const [showInventory, setShowInventory] = useState(false);

  const closeInventory = () => {
    setShowInventory(false);
  };

  const activity = lead.lead_activity || 'Contacting';
  const source = lead.lead_source || 'Yelp';

  if (showInventory) {
    return <Inventory onCloseInventory={closeInventory} />;
  }

  return (
    <div className={styles.wrapper}>
      <div className={styles.panelContainer}>
        <div className={styles.topRow}>
          <div className={styles.leftSection}>
            <CustomerUserIcon className={styles.customerIcon} />
            <span className={styles.customerName}>{lead.customer_name}</span>
          </div>
          <div className={styles.rightSection}>
            <div className={styles.scoreContainer}>
              <span className={styles.scoreLabel}>Score: </span>
              <span className={styles.scoreValue}>40</span>
            </div>
            <button className={styles.moreButton}>
              <MoreIcon className={styles.moreIcon} />
            </button>
          </div>
        </div>

        {/* Contact Row */}
        <div className={styles.contactRow}>
          <div className={styles.infoChip}>{lead.customer_phone_number}</div>
          <div className={styles.emailRow}>
            <div className={styles.infoChip}>{lead.customer_email || 'No Email'}</div>
            <button className={styles.editButton}>
              <EditIcon className={styles.editIcon} />
            </button>
          </div>
        </div>

        {/* Buttons Row */}
        <div className={styles.buttonsRow}>
          {/* First Button - Status */}
          <button className={styles.statusButton}>
            <div className={styles.statusContent}>
              <span className={styles.statusTextLabel}>Status:</span>
              <span className={styles.statusTextValue}>{lead.lead_status}</span>
            </div>
            <div className={styles.statusIconContainer}>
              <InProgressIcon className={styles.statusIcon} />
            </div>
          </button>

          {/* Second Button - Activity */}
          <button className={styles.activityButton}>
            <div className={styles.activityContent}>
              <span className={styles.activityLabel}>Activity:</span>
              <span className={styles.activityValue}>{activity}</span>
            </div>
            <UnfoldMoreIcon className={styles.unfoldIcon} />
          </button>

          {/* Third Button - Next Action */}
          <button className={styles.nextActionButton}>
            <span className={styles.nextActionLabel}>Next Action:</span>
            <span className={styles.nextActionValue}>{lead.next_action}</span>
          </button>
        </div>

        <div className={styles.sourceSection}>
          <span className={styles.sourceLabel}>Source:</span>
          <span className={styles.sourceValue}>{source}</span>
        </div>

        <div className={styles.previousRequestsLabel}>Previous Requests:</div>

        <div className={styles.requestsButtonsContainer}>
          <button className={styles.inviteButton}>
            <span className={styles.inviteText}>Invite Customer</span>
            <div className={styles.inviteIconContainer}>
              <UserIcon className={styles.userIcon} />
            </div>
          </button>

          <button className={styles.inventoryButton}>
            <span className={styles.inventoryText}>Detailed Inventory Quote</span>
            <div className={styles.inventoryIconContainer}>
              <SpecialHIcon className={styles.specialHIcon} />
            </div>
          </button>
        </div>
      </div>

      {/* Now we render MoveDetailsPanel here and pass onShowInventory */}
      <MoveDetailsPanel onShowInventory={() => setShowInventory(true)} />
    </div>
  );
}

export default LeadManagementPanel;
