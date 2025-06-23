"use client";

import React, { useState, useEffect } from 'react';
import styles from './Invoice.module.css';

/**
 * This component shows either:
 * - "Create Invoice" if lead.hasInvoice=false and lead.lead_status==="Booked"
 * - Otherwise, two buttons: "Estimate" / "Invoice"
 * We also show a "Remove invoice" if `selectedOption==='invoice'`.
 */
function Invoice({ 
  lead, 
  onOptionSelected, 
  onLeadUpdated,
  activeOption,  // Now passed as prop instead of using context
}) {
  // We read the initial "hasInvoice" from lead
  const [hasInvoice, setHasInvoice] = useState(Boolean(lead?.hasInvoice));
  
  // Use the activeOption passed as prop
  const selectedOption = activeOption || 'estimate';

  // Check if the invoice component should be visible (only if lead_status is "Booked")
  const isVisible = lead?.leadStatus === "Booked";

  // Update local state when lead prop changes
  useEffect(() => {
    setHasInvoice(Boolean(lead?.hasInvoice));
  }, [lead?.hasInvoice]);

  const handleCreateInvoice = () => {
    // Update local state
    setHasInvoice(true);
    
    // Update parent component and persist changes
    if (onLeadUpdated) {
      // Use lead.id or lead.lead_id to handle both naming conventions
      const leadId = lead.id || lead.lead_id;
      if (leadId) {
        onLeadUpdated(leadId, {
          hasInvoice: true,
        });
      } else {
        console.error('No lead ID found on lead object');
      }
    }
    
    // Notify parent about selected option
    if (onOptionSelected) {
      onOptionSelected('invoice');
    }
  };

  const handleSelectOption = (option) => {
    // Notify parent about selected option
    if (onOptionSelected) {
      onOptionSelected(option);
    }
  };

  const handleRemoveInvoice = () => {
    // Update local state
    setHasInvoice(false);
    
    // Update parent component and persist changes
    if (onLeadUpdated) {
      // Use lead.id or lead.lead_id to handle both naming conventions
      const leadId = lead.id || lead.lead_id;
      if (leadId) {
        onLeadUpdated(leadId, {
          hasInvoice: false,
        });
      } else {
        console.error('No lead ID found on lead object');
      }
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
            <button 
              className={styles.plusButton} 
              onClick={handleCreateInvoice}
            >
              +
            </button>
          </>
        ) : (
          <>
            <button
              className={`${styles.optionButton} ${
                selectedOption === 'estimate' 
                  ? styles.buttonSelected 
                  : styles.buttonUnselected
              }`}
              onClick={() => handleSelectOption('estimate')}
            >
              Estimate
            </button>
            <button
              className={`${styles.optionButton} ${
                selectedOption === 'invoice' 
                  ? styles.buttonSelected 
                  : styles.buttonUnselected
              }`}
              onClick={() => handleSelectOption('invoice')}
            >
              Invoice
            </button>
          </>
        )}
      </div>

      {hasInvoice && selectedOption === 'invoice' && (
        <button 
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