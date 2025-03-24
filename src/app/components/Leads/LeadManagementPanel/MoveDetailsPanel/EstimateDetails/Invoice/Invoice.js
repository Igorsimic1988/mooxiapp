"use client";

import React, { useState, useEffect } from 'react';
import styles from './Invoice.module.css';

/**
 * This component shows either:
 * - "Create Invoice" if lead.hasInvoice=false and lead.lead_status==="Booked"
 * - Otherwise, two buttons: "Estimate" / "Invoice"
 * We also show a "Remove invoice" if `selectedOption==='invoice'`.
 */
function Invoice({ lead, onOptionSelected, onLeadUpdated }) {
  // We read the initial "hasInvoice" from lead
  const [hasInvoice, setHasInvoice] = useState(Boolean(lead?.hasInvoice));

  // If hasInvoice=true => which button is highlighted? default 'estimate'
  // but if lead.activeOption==='invoice', we highlight that
  const [selectedOption, setSelectedOption] = useState(
    lead?.activeOption === 'invoice' ? 'invoice' : 'estimate'
  );

  // Check if the invoice component should be visible (only if lead_status is "Booked")
  const isVisible = lead?.lead_status === "Booked";

  // Update local state when lead prop changes
  useEffect(() => {
    setHasInvoice(Boolean(lead?.hasInvoice));
    if (lead?.activeOption === 'invoice') {
      setSelectedOption('invoice');
    } else {
      setSelectedOption('estimate');
    }
  }, [lead?.hasInvoice, lead?.activeOption]);

  const handleCreateInvoice = () => {
    // Update local state
    setHasInvoice(true);
    setSelectedOption('invoice');
    
    // Update parent component and persist changes
    if (onLeadUpdated) {
      onLeadUpdated({
        ...lead,
        hasInvoice: true,
        activeOption: 'invoice',  // store as lowercase
      });
    }
    
    // Notify parent about selected option
    if (onOptionSelected) {
      onOptionSelected('invoice');
    }
  };

  const handleSelectOption = (option) => {
    // Update local state
    setSelectedOption(option);
    
    // Update parent component
    if (onLeadUpdated) {
      onLeadUpdated({
        ...lead,
        activeOption: option, // store exactly 'estimate' or 'invoice'
      });
    }
    
    // Notify parent about selected option
    if (onOptionSelected) {
      onOptionSelected(option);
    }
  };

  const handleRemoveInvoice = () => {
    // Update local state
    setHasInvoice(false);
    setSelectedOption('estimate');
    
    // Update parent component and persist changes
    if (onLeadUpdated) {
      onLeadUpdated({
        ...lead,
        hasInvoice: false,
        activeOption: 'estimate',
      });
    }
    
    // Notify parent about selected option
    if (onOptionSelected) {
      onOptionSelected('estimate');
    }
  };

  // If not visible, return null
  if (!isVisible) {
    return null;
  }

  return (
    <div className={styles.invoiceRow}>
      <div className={styles.invoiceContainer}>
        {!hasInvoice ? (
          <>
            <span className={styles.createInvoiceText}>Create Invoice</span>
            <button className={styles.plusButton} onClick={handleCreateInvoice}>
              +
            </button>
          </>
        ) : (
          <>
            <button
              className={`
                ${styles.optionButton}
                ${selectedOption === 'estimate' ? styles.buttonSelected : styles.buttonUnselected}
              `}
              onClick={() => handleSelectOption('estimate')}
            >
              Estimate
            </button>
            <button
              className={`
                ${styles.optionButton}
                ${selectedOption === 'invoice' ? styles.buttonSelected : styles.buttonUnselected}
              `}
              onClick={() => handleSelectOption('invoice')}
            >
              Invoice
            </button>
          </>
        )}
      </div>

      {hasInvoice && selectedOption === 'invoice' && (
        <button
          type="button"
          className={styles.removeInvoiceLink}
          onClick={handleRemoveInvoice}
        >
          Remove invoice
        </button>
      )}
    </div>
  );
}

export default Invoice;