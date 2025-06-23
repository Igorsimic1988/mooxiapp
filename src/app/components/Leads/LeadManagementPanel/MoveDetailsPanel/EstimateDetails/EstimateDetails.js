"use client";

import React, { useState, useRef, useEffect, useCallback } from 'react';
import styles from './EstimateDetails.module.css';

import Invoice from './Invoice/Invoice';

import Icon from '../../../../Icon';
import { useForm } from 'react-hook-form';
import { useUiState } from '../UiStateContext';

/** Get Rate Type Options based on the lead's rateType */
const getRateTypeOptions = (leadRateType) => {
  if (leadRateType === 'Hourly Rate') {
    // For Hourly Rate Quote: show Flat Rate, Price Range, Starting Price
    return ['Flat Rate', 'Price Range', 'Starting Price'];
  } else {
    // For Volume Based or Weight Based: show Flat Rate, Standard Quote only
    return ['Flat Rate', 'Standard Quote'];
  }
};

const formatCurrency = (value) => {
  const numeric = typeof value === 'number' && !isNaN(value) ? value : 0;
  return `$${numeric.toFixed(2)}`;
};

const parseToNumber = (value) => {
  if (typeof value === 'number') return value;
  if (!value) return 0;
  const parsed = parseFloat(String(value).replace(/[^0-9.-]/g, ''));
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
  isStorageEnabled, // Prop to determine if storage is enabled
}) {
  // Helper to handle both camelCase and snake_case field names
  const getLeadField = (fieldName, snakeCaseName) => {
    return lead?.[fieldName] ?? lead?.[snakeCaseName] ?? undefined;
  };
  
  // Get the correct lead ID (handle both 'id' and 'lead_id')
  const leadId = lead?.id || lead?.lead_id;
  
  // Check if we should show tabs (storage enabled AND Hourly Rate)
  const showTabs = isStorageEnabled && lead?.rateType === 'Hourly Rate';
  const [activeTab, setActiveTab] = useState('moveOut');
  
  // Collapsible panel toggle
  const {isEstimateCollapsed, setIsEstimateCollapsed} = useUiState();
  const { activeOption, setActiveOption, moveInActiveOption, setMoveInActiveOption } = useUiState();
  const toggleCollapse = () => setIsEstimateCollapsed((prev) => !prev);

  // Get the correct active option based on the tab
  const currentActiveOption = showTabs && activeTab === 'moveIn' 
    ? (moveInActiveOption || 'estimate')
    : (activeOption || 'estimate');

  // Check if Invoice component should be visible
  const isInvoiceVisible = lead?.leadStatus === 'Booked';

  // Track invoice state separately for each tab
  // Use local state to track invoice creation immediately
  const [localMoveInHasInvoice, setLocalMoveInHasInvoice] = useState(
    Boolean(lead?.moveInHasInvoice || lead?.move_in_has_invoice)
  );
  const [localHasInvoice, setLocalHasInvoice] = useState(
    Boolean(lead?.hasInvoice || lead?.has_invoice)
  );
  
  // Update local state when lead changes
  useEffect(() => {
    setLocalMoveInHasInvoice(Boolean(lead?.moveInHasInvoice || lead?.move_in_has_invoice));
    setLocalHasInvoice(Boolean(lead?.hasInvoice || lead?.has_invoice));
  }, [lead?.moveInHasInvoice, lead?.hasInvoice, lead?.move_in_has_invoice, lead?.has_invoice]);
  
  const hasInvoice = showTabs && activeTab === 'moveIn' 
    ? localMoveInHasInvoice
    : localHasInvoice;

  // Are we showing "estimate" or "invoice"?
  const showEstimateSection = !hasInvoice || currentActiveOption === 'estimate';
  const showInvoiceSection = hasInvoice && currentActiveOption === 'invoice';

  // When switching tabs, just update the active tab without forcing option changes
  const handleTabChange = (newTab) => {
    setActiveTab(newTab);
  };
  
  const {
    setValue,
    watch,
  } = useForm({
    defaultValues: {
      // Move Out fields (regular fields)
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
      
      invoiceQuote: formatCurrency(lead?.invoiceQuote ?? lead?.estimateQuote ?? 585),
      invoiceFuelSurcharge: formatCurrency(lead?.invoiceFuelSurcharge ?? lead?.estimateFuelSurcharge ?? 0),
      invoiceValuation: formatCurrency(lead?.invoiceValuation ?? lead?.estimateValuation ?? 0),
      invoicePacking: formatCurrency(lead?.invoicePacking ?? lead?.estimatePacking ?? 0),
      invoiceAdditionalServices: formatCurrency(lead?.invoiceAdditionalServices ?? lead?.estimateAdditionalServices ?? 0),
      invoiceDiscount: formatCurrency(lead?.invoiceDiscount ?? lead?.estimateDiscount ?? 0),
      invoiceGrandTotal: formatCurrency(lead?.invoiceGrandTotal ?? lead?.estimateGrandTotal ?? 585),
      invoiceDeposit: formatCurrency(lead?.invoiceDeposit ?? lead?.estimateDeposit ?? 50),
      invoicePayment: formatCurrency(lead?.invoicePayment ?? lead?.estimatePayment ?? 0),
      invoiceBalanceDue: formatCurrency(lead?.invoiceBalanceDue ?? lead?.estimateBalanceDue ?? 585),
      
      // Move In fields (only used when storage is enabled)
      moveInTypeOfQuote: lead?.moveInTypeOfQuote ?? 'Flat Rate',
      moveInEstimateQuote: lead?.moveInEstimateQuote ?? 585,
      moveInEstimateFuelSurcharge: lead?.moveInEstimateFuelSurcharge ?? 0,
      moveInEstimateValuation: lead?.moveInEstimateValuation ?? 0,
      moveInEstimatePacking: lead?.moveInEstimatePacking ?? 0,
      moveInEstimateAdditionalServices: lead?.moveInEstimateAdditionalServices ?? 0,
      moveInEstimateDiscount: lead?.moveInEstimateDiscount ?? 0,
      moveInEstimateGrandTotal: lead?.moveInEstimateGrandTotal ?? 585,
      moveInEstimateDeposit: lead?.moveInEstimateDeposit || 50,
      moveInEstimatePayment: lead?.moveInEstimatePayment ?? 0,
      moveInEstimateBalanceDue: lead?.moveInEstimateBalanceDue ?? 585,
      
      moveInInvoiceQuote: formatCurrency(lead?.moveInInvoiceQuote ?? lead?.moveInEstimateQuote ?? 585),
      moveInInvoiceFuelSurcharge: formatCurrency(lead?.moveInInvoiceFuelSurcharge ?? lead?.moveInEstimateFuelSurcharge ?? 0),
      moveInInvoiceValuation: formatCurrency(lead?.moveInInvoiceValuation ?? lead?.moveInEstimateValuation ?? 0),
      moveInInvoicePacking: formatCurrency(lead?.moveInInvoicePacking ?? lead?.moveInEstimatePacking ?? 0),
      moveInInvoiceAdditionalServices: formatCurrency(lead?.moveInInvoiceAdditionalServices ?? lead?.moveInEstimateAdditionalServices ?? 0),
      moveInInvoiceDiscount: formatCurrency(lead?.moveInInvoiceDiscount ?? lead?.moveInEstimateDiscount ?? 0),
      moveInInvoiceGrandTotal: formatCurrency(lead?.moveInInvoiceGrandTotal ?? lead?.moveInEstimateGrandTotal ?? 585),
      moveInInvoiceDeposit: formatCurrency(lead?.moveInInvoiceDeposit ?? lead?.moveInEstimateDeposit ?? 50),
      moveInInvoicePayment: formatCurrency(lead?.moveInInvoicePayment ?? lead?.moveInEstimatePayment ?? 0),
      moveInInvoiceBalanceDue: formatCurrency(lead?.moveInInvoiceBalanceDue ?? lead?.moveInEstimateBalanceDue ?? 585),
    }
  });

  // Update form values when lead changes (especially when invoice is created)
  useEffect(() => {
    if (lead) {
      // Update Move Out invoice values when invoice is created
      if (lead.hasInvoice) {
        setValue('invoiceQuote', formatCurrency(lead.invoiceQuote ?? lead.estimateQuote ?? 585));
        setValue('invoiceFuelSurcharge', formatCurrency(lead.invoiceFuelSurcharge ?? lead.estimateFuelSurcharge ?? 0));
        setValue('invoiceValuation', formatCurrency(lead.invoiceValuation ?? lead.estimateValuation ?? 0));
        setValue('invoicePacking', formatCurrency(lead.invoicePacking ?? lead.estimatePacking ?? 0));
        setValue('invoiceAdditionalServices', formatCurrency(lead.invoiceAdditionalServices ?? lead.estimateAdditionalServices ?? 0));
        setValue('invoiceDiscount', formatCurrency(lead.invoiceDiscount ?? lead.estimateDiscount ?? 0));
        setValue('invoiceGrandTotal', formatCurrency(lead.invoiceGrandTotal ?? lead.estimateGrandTotal ?? 585));
        setValue('invoiceDeposit', formatCurrency(lead.invoiceDeposit ?? lead.estimateDeposit ?? 50));
        setValue('invoicePayment', formatCurrency(lead.invoicePayment ?? lead.estimatePayment ?? 0));
        setValue('invoiceBalanceDue', formatCurrency(lead.invoiceBalanceDue ?? lead.estimateBalanceDue ?? 585));
      }
      
      // Update Move In invoice values when invoice is created
      if (lead.moveInHasInvoice) {
        setValue('moveInInvoiceQuote', formatCurrency(lead.moveInInvoiceQuote ?? lead.moveInEstimateQuote ?? 585));
        setValue('moveInInvoiceFuelSurcharge', formatCurrency(lead.moveInInvoiceFuelSurcharge ?? lead.moveInEstimateFuelSurcharge ?? 0));
        setValue('moveInInvoiceValuation', formatCurrency(lead.moveInInvoiceValuation ?? lead.moveInEstimateValuation ?? 0));
        setValue('moveInInvoicePacking', formatCurrency(lead.moveInInvoicePacking ?? lead.moveInEstimatePacking ?? 0));
        setValue('moveInInvoiceAdditionalServices', formatCurrency(lead.moveInInvoiceAdditionalServices ?? lead.moveInEstimateAdditionalServices ?? 0));
        setValue('moveInInvoiceDiscount', formatCurrency(lead.moveInInvoiceDiscount ?? lead.moveInEstimateDiscount ?? 0));
        setValue('moveInInvoiceGrandTotal', formatCurrency(lead.moveInInvoiceGrandTotal ?? lead.moveInEstimateGrandTotal ?? 585));
        setValue('moveInInvoiceDeposit', formatCurrency(lead.moveInInvoiceDeposit ?? lead.moveInEstimateDeposit ?? 50));
        setValue('moveInInvoicePayment', formatCurrency(lead.moveInInvoicePayment ?? lead.moveInEstimatePayment ?? 0));
        setValue('moveInInvoiceBalanceDue', formatCurrency(lead.moveInInvoiceBalanceDue ?? lead.moveInEstimateBalanceDue ?? 585));
      }
      
      // Update estimate values if they changed
      setValue('typeOfQuote', lead.typeOfQuote ?? 'Flat Rate');
      setValue('estimateQuote', lead.estimateQuote ?? 585);
      setValue('estimateFuelSurcharge', lead.estimateFuelSurcharge ?? 0);
      setValue('estimateValuation', lead.estimateValuation ?? 0);
      setValue('estimatePacking', lead.estimatePacking ?? 0);
      setValue('estimateAdditionalServices', lead.estimateAdditionalServices ?? 0);
      setValue('estimateDiscount', lead.estimateDiscount ?? 0);
      setValue('estimateGrandTotal', lead.estimateGrandTotal ?? 585);
      setValue('estimateDeposit', lead.estimateDeposit ?? 50);
      setValue('estimatePayment', lead.estimatePayment ?? 0);
      setValue('estimateBalanceDue', lead.estimateBalanceDue ?? 585);
      
      // Update Move In estimate values
      if (showTabs) {
        setValue('moveInTypeOfQuote', lead.moveInTypeOfQuote ?? 'Flat Rate');
        setValue('moveInEstimateQuote', lead.moveInEstimateQuote ?? 585);
        setValue('moveInEstimateFuelSurcharge', lead.moveInEstimateFuelSurcharge ?? 0);
        setValue('moveInEstimateValuation', lead.moveInEstimateValuation ?? 0);
        setValue('moveInEstimatePacking', lead.moveInEstimatePacking ?? 0);
        setValue('moveInEstimateAdditionalServices', lead.moveInEstimateAdditionalServices ?? 0);
        setValue('moveInEstimateDiscount', lead.moveInEstimateDiscount ?? 0);
        setValue('moveInEstimateGrandTotal', lead.moveInEstimateGrandTotal ?? 585);
        setValue('moveInEstimateDeposit', lead.moveInEstimateDeposit ?? 50);
        setValue('moveInEstimatePayment', lead.moveInEstimatePayment ?? 0);
        setValue('moveInEstimateBalanceDue', lead.moveInEstimateBalanceDue ?? 585);
      }
    }
  }, [lead, setValue, showTabs]);

  // Helper function to get field value based on active tab
  const getFieldValue = (fieldName) => {
    if (showTabs && activeTab === 'moveIn') {
      return watch(`moveIn${fieldName.charAt(0).toUpperCase() + fieldName.slice(1)}`);
    }
    return watch(fieldName);
  };

  const typeOfQuote = getFieldValue('typeOfQuote');
  const estimateQuote = getFieldValue('estimateQuote');
  const estimateFuelSurcharge = getFieldValue('estimateFuelSurcharge');
  const estimateValuation = getFieldValue('estimateValuation');
  const estimatePacking = getFieldValue('estimatePacking');
  const estimateAdditionalServices = getFieldValue('estimateAdditionalServices');
  const estimateDiscount = getFieldValue('estimateDiscount');
  const estimateGrandTotal = getFieldValue('estimateGrandTotal');
  const estimateDeposit = getFieldValue('estimateDeposit');
  const estimatePayment = getFieldValue('estimatePayment');
  const estimateBalanceDue = getFieldValue('estimateBalanceDue');

  // ---------- For measuring the ESTIMATE section height ----------
  const estimateSectionRef = useRef(null);
  const [estimateHeight, setEstimateHeight] = useState(0);

  // =========== ESTIMATE: Rate Type ===========
  const [showRateTypeDropdown, setShowRateTypeDropdown] = useState(false);
  const rateTypeDropdownRef = useRef(null);

  // ---------- update lead in parent ----------
  // Helper to tell the parent that a field changed
  const handleUpdateLeadField = useCallback((fieldName, value) => {
    // Add prefix only for Move In tab when tabs are shown
    if (showTabs && activeTab === 'moveIn') {
      fieldName = `moveIn${fieldName.charAt(0).toUpperCase() + fieldName.slice(1)}`;
    }
    
    if (onLeadUpdated && leadId) {
      console.log('Updating lead field:', leadId, fieldName, value);
      onLeadUpdated(leadId, {
        [fieldName]: value,
      });
    }
  }, [showTabs, activeTab, onLeadUpdated, leadId]);

  // Rate Type in Invoice is locked to the same as Estimate
  const invoiceTypeOfQuote = typeOfQuote;
  
  // Get invoice field values based on active tab
  const getInvoiceFieldValue = (fieldName) => {
    if (showTabs && activeTab === 'moveIn') {
      return watch(`moveIn${fieldName.charAt(0).toUpperCase() + fieldName.slice(1)}`);
    }
    return watch(fieldName);
  };

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

  // Get available rate type options based on lead's rateType
  const availableRateTypeOptions = getRateTypeOptions(lead?.rateType);

  // Reset typeOfQuote if current value is not in available options
  useEffect(() => {
    const currentTypeOfQuote = showTabs && activeTab === 'moveIn' 
      ? watch(`moveInTypeOfQuote`) 
      : watch('typeOfQuote');
      
    if (currentTypeOfQuote && !availableRateTypeOptions.includes(currentTypeOfQuote)) {
      // Default to first available option
      const defaultOption = availableRateTypeOptions[0];
      const fieldName = showTabs && activeTab === 'moveIn' ? 'moveInTypeOfQuote' : 'typeOfQuote';
      setValue(fieldName, defaultOption);
      
      // Update lead
      if (showTabs && activeTab === 'moveIn') {
        onLeadUpdated(leadId, { moveInTypeOfQuote: defaultOption });
      } else {
        onLeadUpdated(leadId, { typeOfQuote: defaultOption });
      }
    }
  }, [lead?.rateType, availableRateTypeOptions, activeTab, showTabs, setValue, watch, onLeadUpdated, leadId]);

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
    const actualFieldName = showTabs && activeTab === 'moveIn' ? `moveIn${fieldName.charAt(0).toUpperCase() + fieldName.slice(1)}` : fieldName;
    setValue(actualFieldName, value);
  };

  // Handle blur event to format the value properly when user leaves the field
  const handleInputBlur = (value, fieldName) => {
    const numericValue = parseToNumber(value);
    handleUpdateLeadField(fieldName, numericValue);
    const actualFieldName = showTabs && activeTab === 'moveIn' ? `moveIn${fieldName.charAt(0).toUpperCase() + fieldName.slice(1)}` : fieldName;
    const formatted = formatCurrency(numericValue);
    setValue(actualFieldName, formatted);
  };

  // Handle key down event to apply changes on Enter key
  const handleKeyDown = (e, value, fieldName) => {
    if (e.key === 'Enter') {
      const numericValue = parseToNumber(value);
      handleUpdateLeadField(fieldName, numericValue);
      // Blur/unfocus the input
      e.target.blur();
    }
  };

  // Handle invoice creation/update
  const handleInvoiceUpdate = (invoiceLeadId, updates) => {
    console.log('handleInvoiceUpdate called:', { invoiceLeadId, updates, activeTab });
    
    // Use the leadId we extracted at the component level if invoiceLeadId is not provided
    const actualLeadId = invoiceLeadId || leadId;
    
    if (!actualLeadId) {
      console.error('No lead ID available for update');
      return;
    }
    
    // If we're in Move In tab and creating/updating invoice, prefix the hasInvoice field
    if (showTabs && activeTab === 'moveIn') {
      const prefixedUpdates = {};
      Object.keys(updates).forEach(key => {
        if (key === 'hasInvoice') {
          prefixedUpdates['moveInHasInvoice'] = updates[key];
          // When creating invoice in Move In, copy Move In estimate values to Move In invoice values
          if (updates[key] === true) {
            console.log('Creating Move In invoice, copying estimate values');
            // Update local state immediately
            setLocalMoveInHasInvoice(true);
            // Get current estimate values from form
            const currentEstimateQuote = watch('moveInEstimateQuote') ?? 585;
            const currentEstimateFuelSurcharge = watch('moveInEstimateFuelSurcharge') ?? 0;
            const currentEstimateValuation = watch('moveInEstimateValuation') ?? 0;
            const currentEstimatePacking = watch('moveInEstimatePacking') ?? 0;
            const currentEstimateAdditionalServices = watch('moveInEstimateAdditionalServices') ?? 0;
            const currentEstimateDiscount = watch('moveInEstimateDiscount') ?? 0;
            const currentEstimateGrandTotal = watch('moveInEstimateGrandTotal') ?? 585;
            const currentEstimateDeposit = watch('moveInEstimateDeposit') ?? 50;
            const currentEstimatePayment = watch('moveInEstimatePayment') ?? 0;
            const currentEstimateBalanceDue = watch('moveInEstimateBalanceDue') ?? 585;
            
            prefixedUpdates['moveInInvoiceQuote'] = currentEstimateQuote;
            prefixedUpdates['moveInInvoiceFuelSurcharge'] = currentEstimateFuelSurcharge;
            prefixedUpdates['moveInInvoiceValuation'] = currentEstimateValuation;
            prefixedUpdates['moveInInvoicePacking'] = currentEstimatePacking;
            prefixedUpdates['moveInInvoiceAdditionalServices'] = currentEstimateAdditionalServices;
            prefixedUpdates['moveInInvoiceDiscount'] = currentEstimateDiscount;
            prefixedUpdates['moveInInvoiceGrandTotal'] = currentEstimateGrandTotal;
            prefixedUpdates['moveInInvoiceDeposit'] = currentEstimateDeposit;
            prefixedUpdates['moveInInvoicePayment'] = currentEstimatePayment;
            prefixedUpdates['moveInInvoiceBalanceDue'] = currentEstimateBalanceDue;
            
            // Switch to invoice view immediately
            setMoveInActiveOption('invoice');
            
            // Update form values immediately
            setValue('moveInInvoiceQuote', formatCurrency(currentEstimateQuote));
            setValue('moveInInvoiceFuelSurcharge', formatCurrency(currentEstimateFuelSurcharge));
            setValue('moveInInvoiceValuation', formatCurrency(currentEstimateValuation));
            setValue('moveInInvoicePacking', formatCurrency(currentEstimatePacking));
            setValue('moveInInvoiceAdditionalServices', formatCurrency(currentEstimateAdditionalServices));
            setValue('moveInInvoiceDiscount', formatCurrency(currentEstimateDiscount));
            setValue('moveInInvoiceGrandTotal', formatCurrency(currentEstimateGrandTotal));
            setValue('moveInInvoiceDeposit', formatCurrency(currentEstimateDeposit));
            setValue('moveInInvoicePayment', formatCurrency(currentEstimatePayment));
            setValue('moveInInvoiceBalanceDue', formatCurrency(currentEstimateBalanceDue));
          } else if (updates[key] === false) {
            // When removing invoice, switch back to estimate view
            setLocalMoveInHasInvoice(false);
            setMoveInActiveOption('estimate');
          }
        } else {
          prefixedUpdates[key] = updates[key];
        }
      });
      console.log('Calling onLeadUpdated with Move In updates:', actualLeadId, prefixedUpdates);
      onLeadUpdated(actualLeadId, prefixedUpdates);
    } else {
      // For Move Out tab, copy Move Out estimate values to Move Out invoice values when creating invoice
      if (updates.hasInvoice === true) {
        console.log('Creating Move Out invoice, copying estimate values');
        // Update local state immediately
        setLocalHasInvoice(true);
        // Get current estimate values from form
        const currentEstimateQuote = watch('estimateQuote') ?? 585;
        const currentEstimateFuelSurcharge = watch('estimateFuelSurcharge') ?? 0;
        const currentEstimateValuation = watch('estimateValuation') ?? 0;
        const currentEstimatePacking = watch('estimatePacking') ?? 0;
        const currentEstimateAdditionalServices = watch('estimateAdditionalServices') ?? 0;
        const currentEstimateDiscount = watch('estimateDiscount') ?? 0;
        const currentEstimateGrandTotal = watch('estimateGrandTotal') ?? 585;
        const currentEstimateDeposit = watch('estimateDeposit') ?? 50;
        const currentEstimatePayment = watch('estimatePayment') ?? 0;
        const currentEstimateBalanceDue = watch('estimateBalanceDue') ?? 585;
        
        const updatesWithInvoiceValues = {
          ...updates,
          invoiceQuote: currentEstimateQuote,
          invoiceFuelSurcharge: currentEstimateFuelSurcharge,
          invoiceValuation: currentEstimateValuation,
          invoicePacking: currentEstimatePacking,
          invoiceAdditionalServices: currentEstimateAdditionalServices,
          invoiceDiscount: currentEstimateDiscount,
          invoiceGrandTotal: currentEstimateGrandTotal,
          invoiceDeposit: currentEstimateDeposit,
          invoicePayment: currentEstimatePayment,
          invoiceBalanceDue: currentEstimateBalanceDue,
        };
        console.log('Calling onLeadUpdated with Move Out updates:', actualLeadId, updatesWithInvoiceValues);
        onLeadUpdated(actualLeadId, updatesWithInvoiceValues);
        
        // Switch to invoice view immediately
        setActiveOption('invoice');
        
        // Update form values immediately
        setValue('invoiceQuote', formatCurrency(currentEstimateQuote));
        setValue('invoiceFuelSurcharge', formatCurrency(currentEstimateFuelSurcharge));
        setValue('invoiceValuation', formatCurrency(currentEstimateValuation));
        setValue('invoicePacking', formatCurrency(currentEstimatePacking));
        setValue('invoiceAdditionalServices', formatCurrency(currentEstimateAdditionalServices));
        setValue('invoiceDiscount', formatCurrency(currentEstimateDiscount));
        setValue('invoiceGrandTotal', formatCurrency(currentEstimateGrandTotal));
        setValue('invoiceDeposit', formatCurrency(currentEstimateDeposit));
        setValue('invoicePayment', formatCurrency(currentEstimatePayment));
        setValue('invoiceBalanceDue', formatCurrency(currentEstimateBalanceDue));
      } else if (updates.hasInvoice === false) {
        // When removing invoice, switch back to estimate view
        setLocalHasInvoice(false);
        setActiveOption('estimate');
        onLeadUpdated(actualLeadId, updates);
      } else {
        onLeadUpdated(actualLeadId, updates);
      }
    }
  };

  // Debug logging
  console.log('EstimateDetails render:', {
    leadId,
    activeTab,
    hasInvoice,
    showEstimateSection,
    showInvoiceSection,
    currentActiveOption,
    moveInHasInvoice: lead?.moveInHasInvoice,
    hasInvoiceField: lead?.hasInvoice,
    localMoveInHasInvoice,
    localHasInvoice
  });

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
          {/* Show tabs only when storage is enabled AND it's Hourly Rate */}
          {showTabs && (
            <div className={styles.sectionsRow}>
              <div
                className={`${styles.sectionItem} ${activeTab === 'moveOut' ? styles.selected : ''}`}
                onClick={() => handleTabChange('moveOut')}
              >
                <span className={`${styles.sectionText} ${activeTab === 'moveOut' ? styles.textActive : ''}`}>
                  Move Out
                </span>
              </div>
              <div
                className={`${styles.sectionItem} ${activeTab === 'moveIn' ? styles.selected : ''}`}
                onClick={() => handleTabChange('moveIn')}
              >
                <span className={`${styles.sectionText} ${activeTab === 'moveIn' ? styles.textActive : ''}`}>
                  Move In
                </span>
              </div>
            </div>
          )}

          {isInvoiceVisible && (
            <div className={styles.invoiceWrapper}>
              <Invoice
                key={`${activeTab}-${hasInvoice}-${leadId}`} // Force re-render when tab, invoice state, or lead ID changes
                lead={{
                  ...lead,
                  id: leadId, // Ensure lead has an id property
                  // Override hasInvoice based on which tab we're in
                  hasInvoice: hasInvoice // Use the computed hasInvoice value
                }}
                activeOption={currentActiveOption}
                onOptionSelected={(option) => {
                  if (showTabs && activeTab === 'moveIn') {
                    setMoveInActiveOption(option.toLowerCase());
                  } else {
                    setActiveOption(option.toLowerCase());
                  }
                }}
                onLeadUpdated={handleInvoiceUpdate}
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
                    className={`${styles.estimateButton} ${showRateTypeDropdown ? styles.activeInput : ''}`}
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
                      {availableRateTypeOptions.map((opt) => {
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
                              const fieldName = showTabs && activeTab === 'moveIn' ? 'moveInTypeOfQuote' : 'typeOfQuote';
                              setValue(fieldName, opt);
                              setShowRateTypeDropdown(false);
                              handleUpdateLeadField('typeOfQuote', opt);
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
                  <span className={styles.pricingLabel}>Type Of Quote</span>
                  {/* locked input - no border, same style as .pricingValue */}
                  <input
                    type="text"
                    className={`${styles.pricingValue} ${styles.invoiceValueInput} ${styles.readOnlyField}`}
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
                    value={getInvoiceFieldValue('invoiceQuote')}
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
                    value={getInvoiceFieldValue('invoiceFuelSurcharge')}
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
                    value={getInvoiceFieldValue('invoiceValuation')}
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
                    value={getInvoiceFieldValue('invoicePacking')}
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
                    value={getInvoiceFieldValue('invoiceAdditionalServices')}
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
                    value={getInvoiceFieldValue('invoiceGrandTotal')}
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
                    value={getInvoiceFieldValue('invoiceDeposit')}
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
                    value={getInvoiceFieldValue('invoicePayment')}
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
                    value={getInvoiceFieldValue('invoiceDiscount')}
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
                    value={getInvoiceFieldValue('invoiceBalanceDue')}
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