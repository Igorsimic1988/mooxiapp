import React from 'react';
import styles from './LeadsActionButtons.module.css';
import FilterIcon from '../../../assets/icons/filter.svg';
import TransferIcon from '../../../assets/icons/transfer.svg';
import Image from 'next/image';

function LeadsActionButtons() {
  return (
    <div className={styles.container}>
      <button className={styles.button} aria-label="Filter">
        <div className={styles.iconBackground}>
          <Image src={FilterIcon} alt="Filter" className={styles.icon} /> 
        </div>
      </button>

      <button className={styles.button} aria-label="Transfer Lead">
        <div className={styles.iconBackground}>
          <Image src={TransferIcon} alt="Transfer" className={styles.icon} />
        </div>
      </button>
    </div>
  );
}

export default LeadsActionButtons;
