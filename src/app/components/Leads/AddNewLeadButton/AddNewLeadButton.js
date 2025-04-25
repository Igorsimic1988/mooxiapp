"use client";

import React from 'react';
import styles from './AddNewLeadButton.module.css';

function AddNewLeadButton({ onOpenLeadForm }) {
  return (
    <div className={styles.container}>
      <button className={styles.button} onClick={onOpenLeadForm}>
        <span className={styles.text}>New Lead</span>
        <span className={styles.plus}>+</span>
      </button>
    </div>
  );
}

export default AddNewLeadButton;
