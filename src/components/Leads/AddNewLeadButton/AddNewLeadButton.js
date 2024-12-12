import React from 'react';
import styles from './AddNewLeadButton.module.css';

function AddNewLeadButton() {
  return (
    <div className={styles.container}>
      <button className={styles.button}>
        <span className={styles.text}>New Lead</span>
        <span className={styles.plus}>+</span>
      </button>
    </div>
  );
}

export default AddNewLeadButton;
