import React, { useState, useRef, useEffect } from 'react';
import styles from './EstimateDetails.module.css';

import Invoice from './Invoice/Invoice';

import Icon from '../../../../Icon';

/** Rate Type Options for the Estimate */
const RATE_TYPE_OPTIONS = ['Flat Rate', 'Price Range', 'Single Estimate', 'Minimum Estimate'];

// Function to process values from estimate to invoice
// Takes only the right part if there's a dash/range
const processEstimateValue = (value) => {
  if (typeof value === 'string' && value.includes('-')) {
    const rightPart = value.split('-')[1].trim();
    // Ensure there's a dollar sign
    return rightPart.startsWith('$') ? rightPart : `$${rightPart}`;
  }
  // If no dash, return the original value with $ if needed
  return typeof value === 'string' 
    ? (value.startsWith('$') ? value : `$${value}`)
    : '$0';
};

// Function to ensure dollar sign in input and format to 2 decimal places
const formatCurrency = (value) => {
  if (!value) return '$0.00';

  // Remove dollar sign and any non-numeric characters except decimal point
  let sanitized = value.replace(/^\$/, '').replace(/[^\d.]/g, '');
  
  // Handle decimal places
  if (sanitized.includes('.')) {
    const parts = sanitized.split('.');
    // Keep only first two decimal places
    sanitized = parts[0] + '.' + (parts[1] || '').slice(0, 2);
    // If we have less than 2 decimal places, pad with zeros
    if (parts[1] && parts[1].length < 2) {
      sanitized = sanitized.padEnd(sanitized.length + (2 - parts[1].length), '0');
    }
  } else {
    // No decimal point - add .00
    sanitized = sanitized + '.00';
  }
  // If there's nothing before the decimal, add a 0
  if (sanitized.startsWith('.')) {
    sanitized = '0' + sanitized;
  }

  // If just 0, format as 0.00
  if (sanitized === '0') {
    sanitized = '0.00';
  }

  return `$${sanitized}`;
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
  isCollapsed,
  setIsCollapsed,
}) {
    // ---------- ESTIMATE DATA ----------
  // Get the estimate object from lead, or create an empty object if it doesn't exist
  const estimate = lead?.estimate || {};

  // Collapsible panel toggle
  const toggleCollapse = () => setIsCollapsed((prev) => !prev);

  // If the lead has an invoice, show that initially
  // We'll store either 'estimate' or 'invoice' in local state
  const [activeOption, setActiveOption] = useState(
    lead?.activeOption === 'invoice' ? 'invoice' : 'estimate'
  );

  // Check if Invoice component should be visible
  const isInvoiceVisible = lead?.lead_status === 'Booked';

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
  const [deposit, setDeposit] = useState(formatCurrency(estimate?.deposit ?? '$50.00'));
  const [quote, setQuote] = useState(estimate?.quote ?? '$520.00 - $585.00');
  const [fuelSurcharge, setFuelSurcharge] = useState(formatCurrency(estimate?.fuelSurcharge ?? '$0'));
  const [valuation, setValuation] = useState(formatCurrency(estimate?.valuation ?? '$0'));
  const [packing, setPacking] = useState(formatCurrency(estimate?.packing ?? '$0'));
  const [additionalServices, setAdditionalServices] = useState(
    formatCurrency(estimate?.additionalServices ?? '$0')
  );
  const [discount, setDiscount] = useState(formatCurrency(estimate?.discount ?? '$0'));
  const [grandTotal, setGrandTotal] = useState(estimate?.grandTotal ?? '$520 - $585');
  const [payment, setPayment] = useState(formatCurrency(estimate?.payment ?? '$0'));
  const [balanceDue, setBalanceDue] = useState(estimate?.balanceDue ?? '$520 - $585');

  // Keep local state in sync with lead prop changes
  useEffect(() => {
    // Get nested objects, creating defaults if necessary
    const est = lead?.estimate || {};
    setRateType(est.rateType ?? 'Flat Rate');
    setDeposit(formatCurrency(est.deposit ?? '$50.00'));
    setQuote(est.quote ?? '$520.00 - $585.00');
    setFuelSurcharge(formatCurrency(est.fuelSurcharge ?? '$0'));
    setValuation(formatCurrency(est.valuation ?? '$0'));
    setPacking(formatCurrency(est.packing ?? '$0'));
    setAdditionalServices(formatCurrency(est.additionalServices ?? '$0'));
    setDiscount(formatCurrency(est.discount ?? '$0'));
    setGrandTotal(est.grandTotal ?? '$520 - $585');
    setPayment(formatCurrency(est.payment ?? '$0'));
    setBalanceDue(est.balanceDue ?? '$520 - $585');
    
  }, [lead]);

  // ---------- update lead in parent ----------
  // Helper function to update estimate object
  function handleUpdateEstimate(updates) {
    if (onLeadUpdated) {
      onLeadUpdated({
        ...lead,
        estimate: {
          ...lead.estimate || {},
          ...updates,
        },
      });
    }
  }

  // ---------- INVOICE DATA (mirrors estimate, but editable) ----------
  const invoice = lead?.invoice || {};

  // For the invoice tab, we allow editing, but Rate Type is locked
  const [invoiceQuote, setInvoiceQuote] = useState(
    formatCurrency(invoice?.quote ?? processEstimateValue(quote))
  );
  const [invoiceFuelSurcharge, setInvoiceFuelSurcharge] = useState(
    formatCurrency(invoice?.fuelSurcharge ?? processEstimateValue(fuelSurcharge))
  );
  const [invoiceValuation, setInvoiceValuation] = useState(
    formatCurrency(invoice?.valuation ?? processEstimateValue(valuation))
  );
  const [invoicePacking, setInvoicePacking] = useState(
    formatCurrency(invoice?.packing ?? processEstimateValue(packing))
  );
  const [invoiceAdditionalServices, setInvoiceAdditionalServices] = useState(
    formatCurrency(invoice?.additionalServices ?? processEstimateValue(additionalServices))
  );
  const [invoiceGrandTotal, setInvoiceGrandTotal] = useState(
    formatCurrency(invoice?.grandTotal ?? processEstimateValue(grandTotal))
  );
  const [invoiceDeposit, setInvoiceDeposit] = useState(
    formatCurrency(invoice?.deposit ?? processEstimateValue(deposit))
  );
  const [invoicePayment, setInvoicePayment] = useState(
    formatCurrency(invoice?.payment ?? processEstimateValue(payment))
  );
  const [invoiceDiscount, setInvoiceDiscount] = useState(
    formatCurrency(invoice?.discount ?? processEstimateValue(discount))
  );
  const [invoiceBalanceDue, setInvoiceBalanceDue] = useState(
    formatCurrency(invoice?.balanceDue ?? processEstimateValue(balanceDue))
  );

  // Rate Type in Invoice is locked to the same as Estimate
  // (We simply display `rateType`, no dropdown, no editing)
  const invoiceRateType = rateType;

  // If we switch to "invoice" and there's no `lead.invoice`, copy from estimate
  useEffect(() => {
    if (activeOption === 'invoice' && !lead?.invoice) {
      // Process each value and ensure dollar signs are present
      const processedQuote = formatCurrency(processEstimateValue(quote));
      const processedFuelSurcharge = formatCurrency(processEstimateValue(fuelSurcharge));
      const processedValuation = formatCurrency(processEstimateValue(valuation));
      const processedPacking = formatCurrency(processEstimateValue(packing));
      const processedAdditionalServices = formatCurrency(processEstimateValue(additionalServices));
      const processedGrandTotal = formatCurrency(processEstimateValue(grandTotal));
      const processedDeposit = formatCurrency(processEstimateValue(deposit));
      const processedPayment = formatCurrency(processEstimateValue(payment));
      const processedDiscount = formatCurrency(processEstimateValue(discount));
      const processedBalanceDue = formatCurrency(processEstimateValue(balanceDue));

      // Update invoice with processed values
      handleUpdateInvoice({
        quote: processedQuote,
        fuelSurcharge: processedFuelSurcharge,
        valuation: processedValuation,
        packing: processedPacking,
        additionalServices: processedAdditionalServices,
        grandTotal: processedGrandTotal,
        deposit: processedDeposit,
        payment: processedPayment,
        discount: processedDiscount,
        balanceDue: processedBalanceDue,
      });

      // Update local state with processed values
      setInvoiceQuote(processedQuote);
      setInvoiceFuelSurcharge(processedFuelSurcharge);
      setInvoiceValuation(processedValuation);
      setInvoicePacking(processedPacking);
      setInvoiceAdditionalServices(processedAdditionalServices);
      setInvoiceGrandTotal(processedGrandTotal);
      setInvoiceDeposit(processedDeposit);
      setInvoicePayment(processedPayment);
      setInvoiceDiscount(processedDiscount);
      setInvoiceBalanceDue(processedBalanceDue);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeOption]);

  // Keep local INVOICE state in sync with lead prop if lead.invoice changes
  useEffect(() => {
    if (lead?.invoice) {
      const inv = lead.invoice;
      setInvoiceQuote(formatCurrency(inv.quote ?? processEstimateValue(quote)));
      setInvoiceFuelSurcharge(formatCurrency(inv.fuelSurcharge ?? processEstimateValue(fuelSurcharge)));
      setInvoiceValuation(formatCurrency(inv.valuation ?? processEstimateValue(valuation)));
      setInvoicePacking(formatCurrency(inv.packing ?? processEstimateValue(packing)));
      setInvoiceAdditionalServices(formatCurrency(inv.additionalServices ?? processEstimateValue(additionalServices)));
      setInvoiceGrandTotal(formatCurrency(inv.grandTotal ?? processEstimateValue(grandTotal)));
      setInvoiceDeposit(formatCurrency(inv.deposit ?? processEstimateValue(deposit)));
      setInvoicePayment(formatCurrency(inv.payment ?? processEstimateValue(payment)));
      setInvoiceDiscount(formatCurrency(inv.discount ?? processEstimateValue(discount)));
      setInvoiceBalanceDue(formatCurrency(inv.balanceDue ?? processEstimateValue(balanceDue)));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lead?.invoice]);

  // Update hasInvoice and activeOption state when they change in the lead
  useEffect(() => {
    if (lead?.hasInvoice !== undefined) {
      // This will be handled by the Invoice component, but we need to respond to changes
    }
    if (lead?.activeOption !== undefined) {
      setActiveOption(lead.activeOption === 'invoice' ? 'invoice' : 'estimate');
    }
  }, [lead?.hasInvoice, lead?.activeOption]);

  // ---------- update lead's invoice object ----------
  function handleUpdateInvoice(updates) {
    if (onLeadUpdated) {
      onLeadUpdated({
        ...lead,
        invoice: {
          ...lead.invoice || {},
          ...updates,
        },
      });
    }
  }

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
  const handleInputChange = (value, setter) => {
    // Only allow digits, decimal points and $ sign during typing
    const cleanValue = value.replace(/[^\d$.]/g, '');
    setter(cleanValue);
  };

  // Handle blur event to format the value properly when user leaves the field
  const handleInputBlur = (value, setter, field) => {
    // Format the currency and update the field
    const formattedValue = formatCurrency(value);
    setter(formattedValue);
    handleUpdateInvoice({ [field]: formattedValue });
  };

  // Handle key down event to apply changes on Enter key
  const handleKeyDown = (e, value, setter, field) => {
    if (e.key === 'Enter') {
      // Format the currency and update the field
      const formattedValue = formatCurrency(value);
      setter(formattedValue);
      handleUpdateInvoice({ [field]: formattedValue });
      // Blur/unfocus the input
      e.target.blur();
    }
  };



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
                    <span className={styles.dropdownPrefix}>Rate Type:</span>
                    <span className={styles.dropdownSelected}>{rateType}</span>
                  </div>
                  <Icon name="UnfoldMore" className={styles.dropdownIcon} />
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

            <div className={styles.divider}></div>

            {/* Quote Row */}
            <div className={styles.pricingRow}>
              <span className={styles.pricingLabel}>Quote</span>
              <span className={styles.pricingValue}>{quote}</span>
            </div>
            <div className={styles.divider}></div>

            {/* Fuel Surcharge Row */}
            <div className={styles.pricingRow}>
              <span className={styles.pricingLabel}>Fuel Surcharge</span>
              <span className={styles.pricingValue}>{fuelSurcharge}</span>
            </div>
            <div className={styles.divider}></div>

            {/* Valuation Row */}
            <div className={styles.pricingRow}>
              <span className={styles.pricingLabel}>Valuation</span>
              <span className={styles.pricingValue}>{valuation}</span>
            </div>
            <div className={styles.divider}></div>

            {/* Packing Row */}
            <div className={styles.pricingRow}>
              <span className={styles.pricingLabel}>Packing</span>
              <span className={styles.pricingValue}>{packing}</span>
            </div>
            <div className={styles.divider}></div>

            {/* Additional Services Row */}
            <div className={styles.pricingRow}>
              <span className={styles.pricingLabel}>Additional Services</span>
              <span className={styles.pricingValue}>{additionalServices}</span>
            </div>
            <div className={styles.divider}></div>

            {/* Grand Total Row */}
            <div className={styles.pricingRow}>
            <span className={`${styles.pricingLabel} ${styles.grandTotalLabel}`}>
                  Grand Total
                </span>
                <span className={`${styles.pricingLabel} ${styles.grandTotalValue}`}>
                  {grandTotal}
                </span>
            </div>
            <div className={styles.divider}></div>

            {/* Deposit Row */}
            <div className={styles.pricingRow}>
            <span className={`${styles.pricingLabel} ${styles.importantLabel}`}>
                  Deposit
                </span>
              <span className={styles.pricingValue}>{deposit}</span>
            </div>
            <div className={styles.divider}></div>

            {/* Payment Row */}
            <div className={styles.pricingRow}>
            <span className={`${styles.pricingLabel} ${styles.importantLabel}`}>
                  Payment
                </span>
              <span className={styles.pricingValue}>{payment}</span>
            </div>
            <div className={styles.divider}></div>

            {/* Discount Row */}
            <div className={styles.pricingRow}>
            <span className={`${styles.pricingLabel} ${styles.importantLabel}`}>
                  Discount
                </span>
              <span className={styles.pricingValue}>{discount}</span>
            </div>
            <div className={styles.divider}></div>

            {/* Balance Due Row  */}
            <div className={styles.pricingRow}>
            <span className={`${styles.pricingLabel} ${styles.balanceDueLabel}`}>
                  Balance Due
                </span>
                <span className={`${styles.pricingValue} ${styles.balanceDueValue}`}>
                  {balanceDue}
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
                    <Icon name="Specialh" className={styles.viewEstimateIcon} />
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
                    value={invoiceRateType}
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
                    value={invoiceQuote}
                    onClick={handleInputFocus}
                    onChange={(e) => handleInputChange(e.target.value, setInvoiceQuote, 'quote')}
                    onBlur={(e) => handleInputBlur(e.target.value, setInvoiceQuote, 'quote')}
                    onKeyDown={(e) => handleKeyDown(e, e.target.value, setInvoiceQuote, 'quote')}
                  />
                </div>
                <div className={styles.divider}></div>

                {/* Fuel Surcharge Row (editable) */}
                <div className={styles.pricingRow}>
                  <span className={styles.pricingLabel}>Fuel Surcharge</span>
                  <input
                    type="text"
                    className={`${styles.pricingValue} ${styles.invoiceValueInput}`}
                    value={invoiceFuelSurcharge}
                    onClick={handleInputFocus}
                    onChange={(e) => handleInputChange(e.target.value, setInvoiceFuelSurcharge, 'fuelSurcharge')}
                    onBlur={(e) => handleInputBlur(e.target.value, setInvoiceFuelSurcharge, 'fuelSurcharge')}
                    onKeyDown={(e) => handleKeyDown(e, e.target.value, setInvoiceFuelSurcharge, 'fuelSurcharge')}
                  />
                </div>
                <div className={styles.divider}></div>

                {/* Valuation Row (editable) */}
                <div className={styles.pricingRow}>
                  <span className={styles.pricingLabel}>Valuation</span>
                  <input
                    type="text"
                    className={`${styles.pricingValue} ${styles.invoiceValueInput}`}
                    value={invoiceValuation}
                    onClick={handleInputFocus}
                    onChange={(e) => handleInputChange(e.target.value, setInvoiceValuation, 'valuation')}
                    onBlur={(e) => handleInputBlur(e.target.value, setInvoiceValuation, 'valuation')}
                    onKeyDown={(e) => handleKeyDown(e, e.target.value, setInvoiceValuation, 'valuation')}
                  />
                </div>
                <div className={styles.divider}></div>

                {/* Packing Row (editable) */}
                <div className={styles.pricingRow}>
                  <span className={styles.pricingLabel}>Packing</span>
                  <input
                    type="text"
                    className={`${styles.pricingValue} ${styles.invoiceValueInput}`}
                    value={invoicePacking}
                    onClick={handleInputFocus}
                    onChange={(e) => handleInputChange(e.target.value, setInvoicePacking, 'packing')}
                    onBlur={(e) => handleInputBlur(e.target.value, setInvoicePacking, 'packing')}
                    onKeyDown={(e) => handleKeyDown(e, e.target.value, setInvoicePacking, 'packing')}
                  />
                </div>
                <div className={styles.divider}></div>

                {/* Additional Services Row (editable) */}
                <div className={styles.pricingRow}>
                  <span className={styles.pricingLabel}>Additional Services</span>
                  <input
                    type="text"
                    className={`${styles.pricingValue} ${styles.invoiceValueInput}`}
                    value={invoiceAdditionalServices}
                    onClick={handleInputFocus}
                    onChange={(e) => handleInputChange(e.target.value, setInvoiceAdditionalServices, 'additionalServices')}
                    onBlur={(e) => handleInputBlur(e.target.value, setInvoiceAdditionalServices, 'additionalServices')}
                    onKeyDown={(e) => handleKeyDown(e, e.target.value, setInvoiceAdditionalServices, 'additionalServices')}
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
                    value={invoiceGrandTotal}
                    onClick={handleInputFocus}
                    onChange={(e) => handleInputChange(e.target.value, setInvoiceGrandTotal, 'grandTotal')}
                    onBlur={(e) => handleInputBlur(e.target.value, setInvoiceGrandTotal, 'grandTotal')}
                    onKeyDown={(e) => handleKeyDown(e, e.target.value, setInvoiceGrandTotal, 'grandTotal')}
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
                    value={invoiceDeposit}
                    onClick={handleInputFocus}
                    onChange={(e) => handleInputChange(e.target.value, setInvoiceDeposit, 'deposit')}
                    onBlur={(e) => handleInputBlur(e.target.value, setInvoiceDeposit, 'deposit')}
                    onKeyDown={(e) => handleKeyDown(e, e.target.value, setInvoiceDeposit, 'deposit')}
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
                    value={invoicePayment}
                    onClick={handleInputFocus}
                    onChange={(e) => handleInputChange(e.target.value, setInvoicePayment, 'payment')}
                    onBlur={(e) => handleInputBlur(e.target.value, setInvoicePayment, 'payment')}
                    onKeyDown={(e) => handleKeyDown(e, e.target.value, setInvoicePayment, 'payment')}
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
                    value={invoiceDiscount}
                    onClick={handleInputFocus}
                    onChange={(e) => handleInputChange(e.target.value, setInvoiceDiscount, 'discount')}
                    onBlur={(e) => handleInputBlur(e.target.value, setInvoiceDiscount, 'discount')}
                    onKeyDown={(e) => handleKeyDown(e, e.target.value, setInvoiceDiscount, 'discount')}
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
                    value={invoiceBalanceDue}
                    onClick={handleInputFocus}
                    onChange={(e) => handleInputChange(e.target.value, setInvoiceBalanceDue, 'balanceDue')}
                    onBlur={(e) => handleInputBlur(e.target.value, setInvoiceBalanceDue, 'balanceDue')}
                    onKeyDown={(e) => handleKeyDown(e, e.target.value, setInvoiceBalanceDue, 'balanceDue')}
                  />
                </div>

                {/* "View Invoice" Button */}
                <div className={styles.buttonContainer}>
                  <button
                    type="button"
                    className={styles.viewEstimateButton}
                    onClick={() => {
                      console.log('View Invoice clicked');
                    }}
                  >
                    <span className={styles.viewEstimateText}>View Invoice</span>
                    <div className={styles.viewEstimateIconWrapper}>
                    <Icon name="Specialh" className={styles.viewEstimateIcon} />
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
