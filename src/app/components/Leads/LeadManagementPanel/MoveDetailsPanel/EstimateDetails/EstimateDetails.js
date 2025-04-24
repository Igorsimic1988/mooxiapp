import React, { useState, useRef, useEffect } from 'react';
import styles from './EstimateDetails.module.css';

import Invoice from './Invoice/Invoice';

import Icon from '../../../../Icon';
import { useForm } from 'react-hook-form';
import { useUiState } from '../UiStateContext';

/** Rate Type Options for the Estimate */
const RATE_TYPE_OPTIONS = ['Flat Rate', 'Price Range', 'Single Estimate', 'Minimum Estimate'];

const formatCurrency = (value) => {
  const numeric = typeof value === 'number' && !isNaN(value) ? value : 0;
  return `$${numeric.toFixed(2)}`;
};

const parseToNumber = (value) => {
  const parsed = parseFloat(value.replace(/[^0-9.]/g, ''));
  return isNaN(parsed) ? 0 : parsed;
};

// Select all text in an input field when clicked, but preserve the $ sign
const handleInputFocus = (e) => {
  // Get the input element
  const input = e.target;
  // Select from after the $ to the end
  if (input.value.startsWith('$')) {
    // setTimeout ensures this runs after the browser's default focus behavior
    setTimeout(() => {
      input.setSelectionRange(1, input.value.length);
    }, 0);
  } else {
    // If for some reason there's no $, select all
    input.select();
  }
};


function EstimateDetails({
  lead,            // The entire lead object
  onLeadUpdated,   // Callback to update the lead in the parent
}) {
  const {
    setValue,
    watch,
  } = useForm({
    defaultValues: {
      typeOfQuote: lead?.typeOfQuote ?? 'Flat Rate',
      estimateQuote: lead?.estimateQuote ?? 585,
      estimateFuelSurcharge: lead?.estimateFuelSurcharge ?? 0,
      estimateValuation: lead?.estimateValuation ?? 0,
      estimatePacking: lead?.estimatePacking ?? 0,
      estimateAdditionalServices: lead?.estimateAdditionalServices ?? 0,
      estimateDiscount: lead?.estimateDiscount ?? 0,
      estimateGrandTotal: lead?.estimateGrandTotal ?? 585,
      estimateDeposit: lead?.estimateDeposit || 50,
      estimatePayment: lead?.estimatePayment ?? 0,
      estimateBalanceDue: lead?.estimateBalanceDue ?? 585,
      
      invoiceQuote: formatCurrency(lead?.invoiceQuote ?? lead?.estimateQuote),
      invoiceFuelSurcharge: formatCurrency(lead?.invoiceFuelSurcharge ?? lead?.estimateFuelSurcharge),
      invoiceValuation: formatCurrency(lead?.invoiceValuation ?? lead?.estimateValuation),
      invoicePacking: formatCurrency(lead?.invoicePacking ?? lead?.estimatePacking),
      invoiceAdditionalServices: formatCurrency(lead?.invoiceAdditionalServices ?? lead?.estimateAdditionalServices),
      invoiceDiscount: formatCurrency(lead?.invoiceDiscount ?? lead?.estimateDiscount),
      invoiceGrandTotal: formatCurrency(lead?.invoiceGrandTotal ?? lead?.estimateGrandTotal),
      invoiceDeposit: formatCurrency(lead?.invoiceDeposit ?? lead?.estimateDeposit),
      invoicePayment: formatCurrency(lead?.invoicePayment ?? lead?.estimatePayment),
      invoiceBalanceDue: formatCurrency(lead?.invoiceBalanceDue ?? lead?.estimateBalanceDue),
    }
  });
const typeOfQuote = watch('typeOfQuote');
const estimateQuote = watch('estimateQuote');
const estimateFuelSurcharge = watch('estimateFuelSurcharge');
const estimateValuation = watch('estimateValuation');
const estimatePacking = watch('estimatePacking');
const estimateAdditionalServices = watch('estimateAdditionalServices');
const estimateDiscount = watch('estimateDiscount');
const estimateGrandTotal = watch('estimateGrandTotal');
const estimateDeposit = watch('estimateDeposit');
const estimatePayment = watch('estimatePayment');
const estimateBalanceDue = watch('estimateBalanceDue');


    // ---------- ESTIMATE DATA ----------
  // Get the estimate object from lead, or create an empty object if it doesn't exist
  //const estimate = lead?.estimate || {};

  // Collapsible panel toggle
  const {isEstimateCollapsed, setIsEstimateCollapsed} = useUiState();
  const { activeOption, setActiveOption } = useUiState();
  const toggleCollapse = () => setIsEstimateCollapsed((prev) => !prev);

  // Check if Invoice component should be visible
  const isInvoiceVisible = lead?.leadStatus === 'Booked';

  // If lead.hasInvoice => show "invoice" UI, else only "estimate"
  const hasInvoice = Boolean(lead?.hasInvoice);

  // ---------- For measuring the ESTIMATE section height ----------
  const estimateSectionRef = useRef(null);
  const [estimateHeight, setEstimateHeight] = useState(0);

  // =========== ESTIMATE: Rate Type ===========
  const [showRateTypeDropdown, setShowRateTypeDropdown] = useState(false);
  const rateTypeDropdownRef = useRef(null);

  // =========== ESTIMATE: Pricing Fields ===========


  //Keep local state in sync with lead prop changes
  // useEffect(() => {
  //   // Get nested objects, creating defaults if necessary
  //   //const est = lead?.estimate || {};
  //   setDeposit(formatCurrency(lead.estimateDeposit ?? '$50.00'));
  //   setQuote(lead.estimateQuote ?? '$520.00 - $585.00');
  //   setFuelSurcharge(formatCurrency(lead.estimateFuelSurcharge ?? '$0'));
  //   setValuation(formatCurrency(lead.estimateValuation ?? '$0'));
  //   setPacking(formatCurrency(lead.packing ?? '$0'));
  //   setAdditionalServices(formatCurrency(lead.estimateAdditionalServices ?? '$0'));
  //   setDiscount(formatCurrency(lead.estimateDiscount ?? '$0'));
  //   setGrandTotal(lead.estimateGrandTotal ?? '$520 - $585');
  //   setPayment(formatCurrency(lead.estimatePayment ?? '$0'));
  //   setBalanceDue(lead.estimateBalanceDue ?? '$520 - $585');
    
  // }, [lead]);

  // ---------- update lead in parent ----------
  // Helper function to update estimate object
  function handleUpdateEstimate(updates) {
    if (onLeadUpdated) {
      onLeadUpdated(lead.id, updates);
    }
  }
//r
  // ---------- INVOICE DATA (mirrors estimate, but editable) ----------

  // Rate Type in Invoice is locked to the same as Estimate
  // (We simply display `rateType`, no dropdown, no editing)
  const invoiceTypeOfQuote = lead.typeOfQuote;//ovo videti

  


  // ---------- update lead's invoice object ----------


  // ---------- Close dropdowns if user clicks outside ----------
  useEffect(() => {
    function handleClickOutside(e) {
      if (
        showRateTypeDropdown &&
        rateTypeDropdownRef.current &&
        !rateTypeDropdownRef.current.contains(e.target)
      ) {
        setShowRateTypeDropdown(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [ showRateTypeDropdown ]);

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
  }, [ showEstimateSection, hasInvoice ]);

  // Handle input changes with proper currency formatting
  const handleInputChange = (value, fieldName) => {
    setValue(fieldName, parseToNumber(value));
  };

  // Handle blur event to format the value properly when user leaves the field
  const handleInputBlur = (value, fieldName) => {
    const numericValue = parseToNumber(value);
    onLeadUpdated(lead.id, { [fieldName]: numericValue });
    const formatted = formatCurrency(numericValue)
    setValue(fieldName, formatted);
  };

  // Handle key down event to apply changes on Enter key
  const handleKeyDown = (e, value, fieldName) => {
    if (e.key === 'Enter') {
      const numericValue = parseToNumber(value);
      setValue(fieldName, numericValue);
      onLeadUpdated(lead.id, { [fieldName]: numericValue });
      // Blur/unfocus the input
      e.target.blur();
    }
  };

  return (
    <div className={styles.estimateContainer}>
      <div className={styles.estimateHeader}>
        <span className={styles.estimateTitle}>Estimate</span>
        <button className={styles.minusButton} onClick={toggleCollapse}>
          {isEstimateCollapsed ? '+' : '-'}
        </button>
      </div>

      {!isEstimateCollapsed && (
        <div
          className={styles.innerContent}
          style={{ 
            minHeight: estimateHeight ? `${estimateHeight}px` : 'auto',
            transition: 'min-height 0.2s ease-in-out' 
          }}
        >
          {isInvoiceVisible && (
            <div className={styles.invoiceWrapper}>
              <Invoice
                lead={lead}
                onOptionSelected={(option) => {
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
              {/* Rate Type (Dropdown, read/write in Estimate) */}
              <div className={styles.row}>
                <div className={styles.rateTypeWrapper} ref={rateTypeDropdownRef}>
                  <button
                    type="button"
                    className={styles.estimateButton}
                    onClick={() => setShowRateTypeDropdown((p) => !p)}
                  >
                    <div className={styles.dropdownLabel}>
                      <span className={styles.dropdownPrefix}>Type Of Quote:</span>
                      <span className={styles.dropdownSelected}>{typeOfQuote}</span>
                    </div>
                    <Icon name="UnfoldMore" className={styles.dropdownIcon} />
                  </button>

                  {showRateTypeDropdown && (
                    <ul className={styles.rateTypeDropdown}>
                      {RATE_TYPE_OPTIONS.map((opt) => {
                        const isSelected = opt === typeOfQuote;
                        return (
                          <li
                            key={opt}
                            className={
                              isSelected
                                ? `${styles.rateTypeOption} ${styles.selectedOption}`
                                : styles.rateTypeOption
                            }
                            onClick={() => {
                              setValue('typeOfQuote', opt);
                              setShowRateTypeDropdown(false);
                              handleUpdateEstimate({ typeOfQuote: opt });
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

              <div className={styles.divider}></div>

              {/* Quote Row */}
              <div className={styles.pricingRow}>
                <span className={styles.pricingLabel}>Quote</span>
                <span className={styles.pricingValue}>
                {formatCurrency(estimateQuote)}
                </span>
              </div>
              <div className={styles.divider}></div>

              {/* Fuel Surcharge Row */}
              <div className={styles.pricingRow}>
                <span className={styles.pricingLabel}>Fuel Surcharge</span>
                <span className={styles.pricingValue}>{formatCurrency(estimateFuelSurcharge)}</span>
              </div>
              <div className={styles.divider}></div>

              {/* Valuation Row */}
              <div className={styles.pricingRow}>
                <span className={styles.pricingLabel}>Valuation</span>
                <span className={styles.pricingValue}>{formatCurrency(estimateValuation)}</span>
              </div>
              <div className={styles.divider}></div>

              {/* Packing Row */}
              <div className={styles.pricingRow}>
                <span className={styles.pricingLabel}>Packing</span>
                <span className={styles.pricingValue}>{formatCurrency(estimatePacking)}</span>
              </div>
              <div className={styles.divider}></div>

              {/* Additional Services Row */}
              <div className={styles.pricingRow}>
                <span className={styles.pricingLabel}>Additional Services</span>
                <span className={styles.pricingValue}>{formatCurrency(estimateAdditionalServices)}</span>
              </div>
              <div className={styles.divider}></div>

              {/* Grand Total Row */}
              <div className={styles.pricingRow}>
                <span className={`${styles.pricingLabel} ${styles.grandTotalLabel}`}>
                  Grand Total
                </span>
                <span className={`${styles.pricingLabel} ${styles.grandTotalValue}`}>
                {formatCurrency(estimateGrandTotal)}
                </span>
              </div>
              <div className={styles.divider}></div>

              {/* Deposit Row */}
              <div className={styles.pricingRow}>
                <span className={`${styles.pricingLabel} ${styles.importantLabel}`}>
                  Deposit
                </span>
                <span className={styles.pricingValue}>{formatCurrency(estimateDeposit)}</span>
              </div>
              <div className={styles.divider}></div>

              {/* Payment Row */}
              <div className={styles.pricingRow}>
                <span className={`${styles.pricingLabel} ${styles.importantLabel}`}>
                  Payment
                </span>
                <span className={styles.pricingValue}>{formatCurrency(estimatePayment)}</span>
              </div>
              <div className={styles.divider}></div>

              {/* Discount Row */}
              <div className={styles.pricingRow}>
                <span className={`${styles.pricingLabel} ${styles.importantLabel}`}>
                  Discount
                </span>
                <span className={styles.pricingValue}>{formatCurrency(estimateDiscount)}</span>
              </div>
              <div className={styles.divider}></div>

              {/* Balance Due Row  */}
              <div className={styles.pricingRow}>
                <span className={`${styles.pricingLabel} ${styles.balanceDueLabel}`}>
                  Balance Due
                </span>
                <span className={`${styles.pricingValue} ${styles.balanceDueValue}`}>
                {formatCurrency(estimateBalanceDue)}
                </span>
              </div>

              {/* "View Estimate" Button */}
              <div className={styles.buttonContainer}>
                <button
                  type="button"
                  className={styles.viewEstimateButton}
                  onClick={() => {
                    console.log('View Estimate clicked');
                  }}
                >
                  <span className={styles.viewEstimateText}>View Estimate</span>
                  <div className={styles.viewEstimateIconWrapper}>
                    <Icon 
                      name="SpecialH"
                      className={styles.viewEstimateIcon} 
                      width={18}
                      height={18}
                      color="#59B779" 
                    />
                  </div>
                </button>
              </div>
            </div>

            {/* ====== INVOICE SECTION ====== */}
            {showInvoiceSection && (
              <div>
                {/* Rate Type row (LOCKED, same style as Estimate row) */}
                <div className={styles.pricingRow}>
                  <span className={styles.pricingLabel}>Rate Type</span>
                  {/* locked input - no border, same style as .pricingValue */}
                  <input
                    type="text"
                    className={`${styles.pricingValue} ${styles.invoiceValueInput}`}
                    value={invoiceTypeOfQuote}
                    readOnly
                  />
                </div>
                <div className={styles.divider}></div>

                {/* Quote Row (editable) */}
                <div className={styles.pricingRow}>
                  <span className={styles.pricingLabel}>Quote</span>
                  <input
                    type="text"
                    className={`${styles.pricingValue} ${styles.invoiceValueInput}`}
                    value={watch('invoiceQuote')}
                    onClick={handleInputFocus}
                    onChange={(e) => handleInputChange(e.target.value, 'invoiceQuote')}
                    onBlur={(e) => handleInputBlur(e.target.value,  'invoiceQuote')}
                    onKeyDown={(e) => handleKeyDown(e, e.target.value,'invoiceQuote')}
                  />
                </div>
                <div className={styles.divider}></div>

                {/* Fuel Surcharge Row (editable) */}
                <div className={styles.pricingRow}>
                  <span className={styles.pricingLabel}>Fuel Surcharge</span>
                  <input
                    type="text"
                    className={`${styles.pricingValue} ${styles.invoiceValueInput}`}
                    value={watch('invoiceFuelSurcharge')}
                    onClick={handleInputFocus}
                    onChange={(e) => handleInputChange(e.target.value, 'invoiceFuelSurcharge')}
                    onBlur={(e) => handleInputBlur(e.target.value, 'invoiceFuelSurcharge')}
                    onKeyDown={(e) => handleKeyDown(e, e.target.value,'invoiceFuelSurcharge')}
                  />
                </div>
                <div className={styles.divider}></div>

                {/* Valuation Row (editable) */}
                <div className={styles.pricingRow}>
                  <span className={styles.pricingLabel}>Valuation</span>
                  <input
                    type="text"
                    className={`${styles.pricingValue} ${styles.invoiceValueInput}`}
                    value={watch('invoiceValuation')}
                    onClick={handleInputFocus}
                    onChange={(e) => handleInputChange(e.target.value, 'invoiceValuation')}
                    onBlur={(e) => handleInputBlur(e.target.value, 'invoiceValuation')}
                    onKeyDown={(e) => handleKeyDown(e, e.target.value,'invoiceValuation')}
                  />
                </div>
                <div className={styles.divider}></div>

                {/* Packing Row (editable) */}
                <div className={styles.pricingRow}>
                  <span className={styles.pricingLabel}>Packing</span>
                  <input
                    type="text"
                    className={`${styles.pricingValue} ${styles.invoiceValueInput}`}
                    value={watch('invoicePacking')}
                    onClick={handleInputFocus}
                    onChange={(e) => handleInputChange(e.target.value, 'invoicePacking')}
                    onBlur={(e) => handleInputBlur(e.target.value, 'invoicePacking')}
                    onKeyDown={(e) => handleKeyDown(e, e.target.value,'invoicePacking')}
                  />
                </div>
                <div className={styles.divider}></div>

                {/* Additional Services Row (editable) */}
                <div className={styles.pricingRow}>
                  <span className={styles.pricingLabel}>Additional Services</span>
                  <input
                    type="text"
                    className={`${styles.pricingValue} ${styles.invoiceValueInput}`}
                    value={watch('invoiceAdditionalServices')}
                    onClick={handleInputFocus}
                    onChange={(e) => handleInputChange(e.target.value, 'invoiceAdditionalServices')}
                    onBlur={(e) => handleInputBlur(e.target.value, 'invoiceAdditionalServices')}
                    onKeyDown={(e) => handleKeyDown(e, e.target.value,'invoiceAdditionalServices')}
                  />
                </div>
                <div className={styles.divider}></div>

                {/* Grand Total Row (editable) */}
                <div className={styles.pricingRow}>
                  <span className={`${styles.pricingLabel} ${styles.grandTotalLabel}`}>
                    Grand Total
                  </span>
                  <input
                    type="text"
                    className={`${styles.pricingValue} ${styles.invoiceValueInput} ${styles.grandTotalValue}`}
                    value={watch('invoiceGrandTotal')}
                    onClick={handleInputFocus}
                    onChange={(e) => handleInputChange(e.target.value, 'invoiceGrandTotal')}
                    onBlur={(e) => handleInputBlur(e.target.value, 'invoiceGrandTotal')}
                    onKeyDown={(e) => handleKeyDown(e, e.target.value, 'invoiceGrandTotal')}
                  />
                </div>
                <div className={styles.divider}></div>

                {/* Deposit Row (editable) */}
                <div className={styles.pricingRow}>
                  <span className={`${styles.pricingLabel} ${styles.importantLabel}`}>
                    Deposit
                  </span>
                  <input
                    type="text"
                    className={`${styles.pricingValue} ${styles.invoiceValueInput}`}
                    value={watch('invoiceDeposit')}
                    onClick={handleInputFocus}
                    onChange={(e) => handleInputChange(e.target.value, 'invoiceDeposit')}
                    onBlur={(e) => handleInputBlur(e.target.value, 'invoiceDeposit')}
                    onKeyDown={(e) => handleKeyDown(e, e.target.value,'invoiceDeposit')}
                  />
                </div>
                <div className={styles.divider}></div>

                {/* Payment Row (editable) */}
                <div className={styles.pricingRow}>
                  <span className={`${styles.pricingLabel} ${styles.importantLabel}`}>
                    Payment
                  </span>
                  <input
                    type="text"
                    className={`${styles.pricingValue} ${styles.invoiceValueInput}`}
                    value={watch('invoicePayment')}
                    onClick={handleInputFocus}
                    onChange={(e) => handleInputChange(e.target.value, 'invoicePayment')}
                    onBlur={(e) => handleInputBlur(e.target.value, 'invoicePayment')}
                    onKeyDown={(e) => handleKeyDown(e, e.target.value,'invoicePayment')}
                  />
                </div>
                <div className={styles.divider}></div>

                {/* Discount Row (editable) */}
                <div className={styles.pricingRow}>
                  <span className={`${styles.pricingLabel} ${styles.importantLabel}`}>
                    Discount
                  </span>
                  <input
                    type="text"
                    className={`${styles.pricingValue} ${styles.invoiceValueInput}`}
                    value={watch('invoiceDiscount')}
                    onClick={handleInputFocus}
                    onChange={(e) => handleInputChange(e.target.value, 'invoiceDiscount')}
                    onBlur={(e) => handleInputBlur(e.target.value, 'invoiceDiscount')}
                    onKeyDown={(e) => handleKeyDown(e, e.target.value,'invoiceDiscount')}
                  />
                </div>
                <div className={styles.divider}></div>

                {/* Balance Due Row (editable) */}
                <div className={styles.pricingRow}>
                  <span className={`${styles.pricingLabel} ${styles.balanceDueLabel}`}>
                    Balance Due
                  </span>
                  <input
                    type="text"
                    className={`${styles.pricingValue} ${styles.invoiceValueInput} ${styles.balanceDueValue}`}
                    value={watch('invoiceBalanceDue')}
                    onClick={handleInputFocus}
                    onChange={(e) => handleInputChange(e.target.value, 'invoiceBalanceDue')}
                    onBlur={(e) => handleInputBlur(e.target.value, 'invoiceBalanceDue')}
                    onKeyDown={(e) => handleKeyDown(e, e.target.value, 'invoiceBalanceDue')}
                  />
                </div>

                {/* "View Invoice" Button */}
                <div className={styles.buttonContainer}>
                  <button
                    type="button"
                    className={styles.viewInvoiceButton}
                    onClick={() => {
                      console.log('View Invoice clicked');
                    }}
                  >
                    <span className={styles.viewInvoiceText}>View Invoice</span>
                    <div className={styles.viewInvoiceIconWrapper}>
                      <Icon 
                        name="SpecialH"
                        className={styles.viewInvoiceIcon} 
                        width={18}
                        height={18}
                        color="#faa81a"
                      />
                    </div>
                  </button>
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
