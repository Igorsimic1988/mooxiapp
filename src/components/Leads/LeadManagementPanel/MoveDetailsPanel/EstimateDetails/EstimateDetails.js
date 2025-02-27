// src/components/LeadManagementPanel/MoveDetailsPanel/EstimateDetails/EstimateDetails.js
import React, { useState, useRef, useEffect } from 'react';
import styles from './EstimateDetails.module.css';

import { ReactComponent as UnfoldMoreIcon } from '../../../../../assets/icons/unfoldmore.svg';
import Invoice from './Invoice/Invoice';

/** Rate Type Options for the Estimate */
const RATE_TYPE_OPTIONS = ['Flat Rate', 'Price Range', 'Single Estimate', 'Minimum Estimate'];

/** On-focus => select all text in the input */
function handleFocusSelectAll(e) {
  e.target.select();
}

function EstimateDetails({
  lead,            // The entire lead object
  onLeadUpdated,   // Callback to update the lead in the parent
  isCollapsed,
  setIsCollapsed,
}) {
  // Initialize nested objects if they don't exist
  const estimate = lead?.estimate || {};
  const invoice = lead?.invoice || {};

  // Collapsible panel toggle
  const toggleCollapse = () => setIsCollapsed((prev) => !prev);

  // If the lead has an invoice, show that initially
  // We'll store either 'estimate' or 'invoice' in local state
  const [activeOption, setActiveOption] = useState(
    lead?.activeOption === 'invoice' ? 'invoice' : 'estimate'
  );

  // Check if Invoice component should be visible
  const isInvoiceVisible = lead?.lead_status === "Booked";

  // If lead.hasInvoice => show "invoice" UI, else only "estimate"
  const hasInvoice = Boolean(lead?.hasInvoice);

  // ---------- For measuring the ESTIMATE section height ----------
  const estimateSectionRef = useRef(null);
  const [estimateHeight, setEstimateHeight] = useState(0);

  // =========== ESTIMATE: Rate Type ===========
  const [rateType, setRateType] = useState(estimate?.rateType ?? 'Flat Rate');
  const [showRateTypeDropdown, setShowRateTypeDropdown] = useState(false);
  const rateTypeDropdownRef = useRef(null);

  // =========== ESTIMATE: Pricing Fields ===========
  const [deposit, setDeposit] = useState(estimate?.deposit ?? '$50.00');
  const [quote, setQuote] = useState(estimate?.quote ?? '$520.00 - $585.00');
  const [fuelSurcharge, setFuelSurcharge] = useState(estimate?.fuelSurcharge ?? '$0');
  const [valuation, setValuation] = useState(estimate?.valuation ?? '$0');
  const [packing, setPacking] = useState(estimate?.packing ?? '$0');
  const [additionalServices, setAdditionalServices] = useState(estimate?.additionalServices ?? '$0');
  const [discount, setDiscount] = useState(estimate?.discount ?? '$0');
  const [grandTotal, setGrandTotal] = useState(estimate?.grandTotal ?? '$520 - $585');
  const [payment, setPayment] = useState(estimate?.payment ?? '$0');
  const [balanceDue, setBalanceDue] = useState(estimate?.balanceDue ?? '$520 - $585');

  // Keep local state in sync with lead prop changes
  useEffect(() => {
    // Get nested objects, creating defaults if necessary
    const estimateData = lead?.estimate || {};
    const invoiceData = lead?.invoice || {};
    
    // Update rate type
    setRateType(estimateData.rateType ?? 'Flat Rate');
    
    // Update pricing fields
    setDeposit(estimateData.deposit ?? '$50.00');
    setQuote(estimateData.quote ?? '$520.00 - $585.00');
    setFuelSurcharge(estimateData.fuelSurcharge ?? '$0');
    setValuation(estimateData.valuation ?? '$0');
    setPacking(estimateData.packing ?? '$0');
    setAdditionalServices(estimateData.additionalServices ?? '$0');
    setDiscount(estimateData.discount ?? '$0');
    setGrandTotal(estimateData.grandTotal ?? '$520 - $585');
    setPayment(estimateData.payment ?? '$0');
    setBalanceDue(estimateData.balanceDue ?? '$520 - $585');
    
  }, [lead]);

  // ---------- update lead in parent ----------
  // Helper function to update estimate object
  function handleUpdateEstimate(updates) {
    if (onLeadUpdated) {
      onLeadUpdated({
        ...lead,
        estimate: {
          ...lead.estimate || {},
          ...updates
        }
      });
    }
  }
  
  // Helper function to update invoice object
  function handleUpdateInvoice(updates) {
    if (onLeadUpdated) {
      onLeadUpdated({
        ...lead,
        invoice: {
          ...lead.invoice || {},
          ...updates
        }
      });
    }
  }

  // ---------- Close all dropdowns if user clicks outside ----------
  useEffect(() => {
    function handleClickOutside(e) {
      // Rate Type
      if (
        showRateTypeDropdown &&
        rateTypeDropdownRef.current &&
        !rateTypeDropdownRef.current.contains(e.target)
      ) {
        setShowRateTypeDropdown(false);
      }

      // Additional dropdown handlers would go here as we add them...
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [
    showRateTypeDropdown,
    // Add other dropdown state variables here as we add them...
  ]);

  // Are we showing "estimate" or "invoice"?
  const showEstimateSection = !hasInvoice || activeOption === 'estimate';
  const showInvoiceSection = hasInvoice && activeOption === 'invoice';

  useEffect(() => {
    // Only measure height when the estimate section is visible and after it's fully rendered
    if (estimateSectionRef.current && (showEstimateSection || !hasInvoice)) {
      // Use setTimeout to ensure the section is fully rendered
      const timer = setTimeout(() => {
        const height = estimateSectionRef.current.offsetHeight;
        if (height > 0) {
          setEstimateHeight(height);
        }
      }, 100);
      
      return () => clearTimeout(timer);
    }
  }, [
    // Recalculate height when these values change as they affect section visibility
    showEstimateSection, 
    hasInvoice,
  ]);

  return (
    <div className={styles.estimateContainer}>
      <div className={styles.estimateHeader}>
        <span className={styles.estimateTitle}>Estimate</span>
        <button className={styles.minusButton} onClick={toggleCollapse}>
          {isCollapsed ? '+' : '-'}
        </button>
      </div>

      {!isCollapsed && (
        <div
          className={styles.innerContent}
          style={{ 
            minHeight: estimateHeight ? `${estimateHeight}px` : 'auto',
            transition: 'min-height 0.2s ease-in-out' // Optional: add smooth transition
          }}
        >
          {/* "Create Invoice" or highlight "Estimate"/"Invoice" */}
          {isInvoiceVisible && (
            <div className={styles.invoiceWrapper}>
              <Invoice
                lead={lead}
                onOptionSelected={(option) => {
                  // Only update local state - Invoice component
                  // will handle updating the lead itself via onLeadUpdated
                  setActiveOption(option.toLowerCase());
                }}
                onLeadUpdated={onLeadUpdated}
              />
            </div>
          )}

          <div className={styles.extraInputsContainer}>

            {/* ====== ESTIMATE SECTION ====== */}
            <div
              ref={estimateSectionRef}
              style={{ display: showEstimateSection ? 'block' : 'none' }}
            >
              {/* Rate Type */}
              <div className={styles.row}>
                <div className={styles.rateTypeWrapper} ref={rateTypeDropdownRef}>
                  <button
                    type="button"
                    className={styles.estimateButton}
                    onClick={() => setShowRateTypeDropdown((p) => !p)}
                  >
                    <div className={styles.dropdownLabel}>
                      <span className={styles.dropdownPrefix}>Rate Type:</span>
                      <span className={styles.dropdownSelected}>{rateType}</span>
                    </div>
                    <UnfoldMoreIcon className={styles.dropdownIcon} />
                  </button>

                  {showRateTypeDropdown && (
                    <ul className={styles.rateTypeDropdown}>
                      {RATE_TYPE_OPTIONS.map((opt) => {
                        const isSelected = opt === rateType;
                        return (
                          <li
                            key={opt}
                            className={
                              isSelected
                                ? `${styles.rateTypeOption} ${styles.selectedOption}`
                                : styles.rateTypeOption
                            }
                            onClick={() => {
                              setRateType(opt);
                              setShowRateTypeDropdown(false);
                              handleUpdateEstimate({ rateType: opt });
                            }}
                          >
                            {opt}
                          </li>
                        );
                      })}
                    </ul>
                  )}
                </div>
              </div>

              {/* Horizontal divider after Rate Type */}
              <div className={styles.divider}></div>

              {/* Quote Row */}
              <div className={styles.pricingRow}>
                <span className={styles.pricingLabel}>Quote</span>
                <input
                  className={styles.pricingValue}
                  value={quote}
                  onChange={(e) => {
                    setQuote(e.target.value);
                    handleUpdateEstimate({ quote: e.target.value });
                  }}
                  onFocus={handleFocusSelectAll}
                />
              </div>
              <div className={styles.divider}></div>

              {/* Fuel Surcharge Row */}
              <div className={styles.pricingRow}>
                <span className={styles.pricingLabel}>Fuel Surcharge</span>
                <input
                  className={styles.pricingValue}
                  value={fuelSurcharge}
                  onChange={(e) => {
                    setFuelSurcharge(e.target.value);
                    handleUpdateEstimate({ fuelSurcharge: e.target.value });
                  }}
                  onFocus={handleFocusSelectAll}
                />
              </div>
              <div className={styles.divider}></div>

              {/* Valuation Row */}
              <div className={styles.pricingRow}>
                <span className={styles.pricingLabel}>Valuation</span>
                <input
                  className={styles.pricingValue}
                  value={valuation}
                  onChange={(e) => {
                    setValuation(e.target.value);
                    handleUpdateEstimate({ valuation: e.target.value });
                  }}
                  onFocus={handleFocusSelectAll}
                />
              </div>
              <div className={styles.divider}></div>

              {/* Packing Row */}
              <div className={styles.pricingRow}>
                <span className={styles.pricingLabel}>Packing</span>
                <input
                  className={styles.pricingValue}
                  value={packing}
                  onChange={(e) => {
                    setPacking(e.target.value);
                    handleUpdateEstimate({ packing: e.target.value });
                  }}
                  onFocus={handleFocusSelectAll}
                />
              </div>
              <div className={styles.divider}></div>

              {/* Additional Services Row */}
              <div className={styles.pricingRow}>
                <span className={styles.pricingLabel}>Additional Services</span>
                <input
                  className={styles.pricingValue}
                  value={additionalServices}
                  onChange={(e) => {
                    setAdditionalServices(e.target.value);
                    handleUpdateEstimate({ additionalServices: e.target.value });
                  }}
                  onFocus={handleFocusSelectAll}
                />
              </div>
              <div className={styles.divider}></div>

              {/* Grand Total Row */}
              <div className={styles.pricingRow}>
                <span className={`${styles.pricingLabel} ${styles.grandTotalLabel}`}>Grand Total</span>
                <input
                  className={styles.pricingValue}
                  value={grandTotal}
                  onChange={(e) => {
                    setGrandTotal(e.target.value);
                    handleUpdateEstimate({ grandTotal: e.target.value });
                  }}
                  onFocus={handleFocusSelectAll}
                />
              </div>
              <div className={styles.divider}></div>

              {/* Deposit Row */}
              <div className={styles.pricingRow}>
                <span className={`${styles.pricingLabel} ${styles.importantLabel}`}>Deposit</span>
                <input
                  className={styles.pricingValue}
                  value={deposit}
                  onChange={(e) => {
                    setDeposit(e.target.value);
                    handleUpdateEstimate({ deposit: e.target.value });
                  }}
                  onFocus={handleFocusSelectAll}
                />
              </div>
              <div className={styles.divider}></div>

              {/* Payment Row */}
              <div className={styles.pricingRow}>
                <span className={`${styles.pricingLabel} ${styles.importantLabel}`}>Payment</span>
                <input
                  className={styles.pricingValue}
                  value={payment}
                  onChange={(e) => {
                    setPayment(e.target.value);
                    handleUpdateEstimate({ payment: e.target.value });
                  }}
                  onFocus={handleFocusSelectAll}
                />
              </div>
              <div className={styles.divider}></div>

              {/* Discount Row */}
              <div className={styles.pricingRow}>
                <span className={`${styles.pricingLabel} ${styles.importantLabel}`}>Discount</span>
                <input
                  className={styles.pricingValue}
                  value={discount}
                  onChange={(e) => {
                    setDiscount(e.target.value);
                    handleUpdateEstimate({ discount: e.target.value });
                  }}
                  onFocus={handleFocusSelectAll}
                />
              </div>
              <div className={styles.divider}></div>

              {/* Balance Due Row - No divider after this one */}
              <div className={styles.pricingRow}>
                <span className={`${styles.pricingLabel} ${styles.balanceDueLabel}`}>Balance Due</span>
                <input
                  className={`${styles.pricingValue} ${styles.balanceDueValue}`}
                  value={balanceDue}
                  onChange={(e) => {
                    setBalanceDue(e.target.value);
                    handleUpdateEstimate({ balanceDue: e.target.value });
                  }}
                  onFocus={handleFocusSelectAll}
                />
              </div>
            </div>

            {/* ====== INVOICE SECTION ====== */}
            {showInvoiceSection && (
              <div>
                {/* Add invoice-specific fields here... */}
                <div className={styles.placeholderText}>
                  Invoice details will be implemented later.
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default EstimateDetails;