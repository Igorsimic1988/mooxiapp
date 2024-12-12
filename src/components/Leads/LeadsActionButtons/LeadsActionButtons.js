import React from 'react';
import styles from './LeadsActionButtons.module.css';
import { ReactComponent as FilterIcon } from '../../../assets/icons/filter.svg';
import { ReactComponent as TransferIcon } from '../../../assets/icons/transfer.svg';

function LeadsActionButtons() {
  return (
    <div className={styles.container}>
      <button className={styles.button} aria-label="Filter">
        <div className={styles.iconBackground}>
          <FilterIcon className={styles.icon} />
        </div>
      </button>

      <button className={styles.button} aria-label="Transfer Lead">
        <div className={styles.iconBackground}>
          <TransferIcon className={styles.icon} />
        </div>
      </button>
    </div>
  );
}

export default LeadsActionButtons;
