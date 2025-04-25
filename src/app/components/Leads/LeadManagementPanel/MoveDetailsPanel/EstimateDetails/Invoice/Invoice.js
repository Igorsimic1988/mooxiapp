"use client";

import React, { useState, useEffect } from 'react';
import styles from './Invoice.module.css';
import { useUiState } from '../../UiStateContext'; 

/**
 * This component shows either:
 * - "Create Invoice" if lead.hasInvoice=false and lead.lead_status==="Booked"
 * - Otherwise, two buttons: "Estimate" / "Invoice"
 * We also show a "Remove invoice" if `selectedOption==='invoice'`.
 */
function Invoice({ lead, onOptionSelected, onLeadUpdated }) {
  // We read the initial "hasInvoice" from lead
  const [hasInvoice, setHasInvoice] = useState(Boolean(lead?.hasInvoice));
  const { activeOption, setActiveOption } = useUiState();

  // If hasInvoice=true => which button is highlighted? default 'estimate'


  // Check if the invoice component should be visible (only if lead_status is "Booked")
  const isVisible = lead?.leadStatus === "Booked";

  // Update local state when lead prop changes
  useEffect(() => {
    setHasInvoice(Boolean(lead?.hasInvoice));
  }, [lead?.hasInvoice]);

  const handleCreateInvoice = () => {
    // Update local state
    setHasInvoice(true);
    setActiveOption('invoice');
    
    // Update parent component and persist changes
    if (onLeadUpdated) {
      onLeadUpdated(lead.id, {
        hasInvoice: true,
      });
    }
    
    // Notify parent about selected option
    if (onOptionSelected) {
      onOptionSelected('invoice');
    }
  };

  const handleSelectOption = (option) => {
    // Update local state
    setActiveOption(option);
    
    // Notify parent about selected option
    if (onOptionSelected) {
      onOptionSelected(option);
    }
  };

  const handleRemoveInvoice = () => {
    // Update local state
    setHasInvoice(false);
    setActiveOption('estimate');
    
    // Update parent component and persist changes
    if (onLeadUpdated) {
      onLeadUpdated(lead.id, {
        hasInvoice: false,
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
                ${activeOption === 'estimate' ? styles.buttonSelected : styles.buttonUnselected}
              `}
              onClick={() => handleSelectOption('estimate')}
            >
              Estimate
            </button>
            <button
              className={`
                ${styles.optionButton}
                ${activeOption === 'invoice' ? styles.buttonSelected : styles.buttonUnselected}
              `}
              onClick={() => handleSelectOption('invoice')}
            >
              Invoice
            </button>
          </>
        )}
      </div>

      {hasInvoice && activeOption === 'invoice' && (
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