import React, { useState, useEffect } from 'react';
import styles from './LeadFormPopup.module.css';

// Toggles
import SimpleToggle from '../SimpleToggle/SimpleToggle';

// Data
import LeadSourceChoices from '../../../data/constants/LeadSourceChoices';
import typeOfServiceChoices from '../../../data/constants/typeOfServiceChoices';
import { getBrandsByTenant } from 'src/app/services/brandService';
import { getSalesmen } from 'src/app/services/userService';
import { useAccessToken } from 'src/app/lib/useAccessToken';
import { useQuery } from '@tanstack/react-query';
import { LeadFormSchema } from 'src/app/schemas';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import Icon from '../../Icon'

/**
 * Props:
 *   onClose        - function to close the popup
 *   onLeadCreated  - callback to parent if we create a new lead
 *   editingLead    - if present, we're editing an existing lead
 *   onLeadUpdated  - callback to parent if we update an existing lead
 */

function LeadFormPopup({
  onClose,
  onLeadCreated,
  editingLead,
  onLeadUpdated
}) {
  const salesRepLabel = editingLead ? 'Reassign Sales Rep' : 'Assign Sales Rep';

  // =========================
  // 1) Pre-populate if editing
  // =========================
  const token = useAccessToken();
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
  } = useForm({
    resolver: zodResolver(LeadFormSchema),
    defaultValues: {
      customerName: '',
      customerEmail: '',
      customerPhoneNumber: '',
      companyName: '',
      brandId: '',
      source: '',
      serviceType: '',
      moveDate: '',
      salesName: '',
      estimator: '',
      surveyDate: '',
      surveyTime: '',
      fromZip: '',
      toZip: '',
      assignSalesRep: false,
    }
  });
  
  const { data: brands = [], } = useQuery({
    queryKey: ['brands', token],
    queryFn: () => getBrandsByTenant(token),
    enabled: !!token,
  });

  const { data: users = [], } = useQuery({
    queryKey: ['users', token],
    queryFn: () => getSalesmen(token),
    enabled: !!token,
  })

  const assignSalesRep = watch('assignSalesRep');
  const [showCompanyDropdown, setShowCompanyDropdown] = useState(false);
  const [showSourceDropdown, setShowSourceDropdown] = useState(false);
  const [showSalesRepDropdown, setShowSalesRepDropdown] = useState(false);
  const [showServiceDropdown, setShowServiceDropdown] = useState(false);
  const [showCalendar, setShowCalendar] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [daysArray, setDaysArray] = useState([]);

  useEffect(() => {
    function getDaysInMonth(month, year) {
      return new Date(year, month + 1, 0).getDate();
    }
    const month = currentMonth.getMonth();
    const year = currentMonth.getFullYear();
    const daysInMonth = getDaysInMonth(month, year);

    const temp = [];
    for (let i = 1; i <= daysInMonth; i++) {
      temp.push(i);
    }
    setDaysArray(temp);
  }, [currentMonth]);

  useEffect(() => {
    if (editingLead) {
      reset({
        customerName: editingLead.customerName || '',
        customerPhoneNumber: formatPhoneForDisplay(editingLead.customerPhoneNumber || ''),
        customerEmail: editingLead.customerEmail || '',
        companyName: editingLead.companyName || '',
        brandId: editingLead.brandId || '',
        source: editingLead.source || '',
        serviceType: editingLead.serviceType || 'Moving',
        salesName: editingLead.salesName || '',
        estimator: editingLead.estimator || '',
        surveyDate: editingLead.surveyDate || '',
        surveyTime: editingLead.surveyTime || '',
        moveDate: '',
        fromZip: editingLead.fromZip || '',
        toZip: editingLead.toZip || '',
        assignSalesRep: !!editingLead.salesName,
      });
    }
  }, [editingLead, reset]);

  const handleToggleCalendar = () => {
    setShowCalendar((prev) => !prev);
  };

  const handleSelectTypeOfService = (serviceName)  => {
    setValue('serviceType', serviceName);
    setShowServiceDropdown(false);
  };
  
  

  function handlePhoneChange(e) {
    const raw = e.target.value;
    const nums = raw.replace(/\D/g, ''); // strip all non-digits

    let trimmed = nums;
    // If it starts with '1' and has more than 10 digits, remove the leading '1'
    if (trimmed.startsWith('1') && trimmed.length > 10) {
      trimmed = trimmed.slice(1);
    }
    // If there's still more than 10 => slice
    if (trimmed.length > 10) {
      trimmed = trimmed.slice(0, 10);
    }

    const display = formatPhoneForDisplay(trimmed);
    setValue('customerPhoneNumber', display);
    //setPhoneNumber(display);
  }

  // Helper => format "6789091876" => "(678) 909-1876"
  function formatPhoneForDisplay(digits) {
    if (!digits) return '';

    let result = '';
    // area code
    if (digits.length <= 3) {
      result = `(${digits}`;
    } else {
      result = `(${digits.slice(0, 3)})`;
    }
    // next 3
    if (digits.length > 3) {
      result += ` ${digits.slice(3, 6)}`;
    }
    // last 4
    if (digits.length > 6) {
      result += `-${digits.slice(6)}`;
    }
    return result;
  }

  // ==============
  //  Save Handler
  // ==============
  const onSubmit = async (data) => {
    // if (!token) {
    //   console.warn('[onSubmit] Missing access token!');
    //   alert('You must be logged in to save a lead.');
    //   return;
    // }
    
    console.log('[onSubmit] Raw form data:', data);
    try {
      // Before storing, convert the phoneNumber (which is in display format)
      //   to raw digits only. E.g. "(678) 909-1876" => "6789091876"
      let finalPhoneDigits = data.customerPhoneNumber.replace(/\D/g, '');
      // If it starts with '1' and is > 10 => remove leading '1'
      if (finalPhoneDigits.startsWith('1') && finalPhoneDigits.length > 10) {
        finalPhoneDigits = finalPhoneDigits.slice(1);
      }

      const updates = {
        ...data,
        customerPhoneNumber: finalPhoneDigits,
      };

      // If editing => update
      if (editingLead) {
        console.log('[LeadFormPopup] Attempting update with lead_id:', editingLead.id);
        if (onLeadUpdated) {
          onLeadUpdated(editingLead.id, updates);
        }
      }
      // Else create new
      else {
        const newLeadData = {
          ...updates,
          rateType: 'Hourly Rate',
          leadStatus: 'New Lead',
          leadActivity: '',
          nextAction: '',
          isNew: true,
          hasPackingDay: false,
          hasInvoice: false,
          activeDay: 'moving',
          timePromised: false,
          addStorage: false,
          inventoryOption: 'Detailed Inventory Quote',
          estimateQuote: 585,
          estimateFuelSurcharge: 0,
          estimateValuation: 0,
          estimatePacking: 0,
          estimateAdditionalServices: 0,
          estimateDiscount: 0,
          estimateGrandTotal: 585,
          estimateDeposit: 50,
          estimatePayment: 0,
          estimateBalanceDue: 585,
          invoiceQuote: 585,
          invoiceFuelSurcharge: 0,
          invoiceValuation: 0,
          invoicePacking: 0,
          invoiceAdditionalServices: 0,
          invoiceDiscount: 0,
          invoiceGrandTotal: 585,
          invoiceDeposit: 50,
          invoicePayment: 0,
          invoiceBalanceDue: 585,
          numMovers: 2,
          numTrucks: 1,
          hourlyRate: 180,
          volume: 1000,
          weight: 7000,
          pricePerCuft: 4.5,
          pricePerLbs: 0.74,
          travelTime: '1.00 h',
          movingMin: '3h',
          minimumCuft: 0.0,
          minimumLbs: 0,
          pickupWindow: '1 day',
          earliestDeliveryDate: '',
          deliveryWindow: '7 days',
          minHours: '1.00 h',
          maxHours: '2.00 h',
          numPackers: 2,
          packingHourlyRate: 120,
          packingTravelTime: '0.45 h',
          packingMinimum: '2h',
          packingMinHours: '1.00 h',
          packingMaxHours: '2.00 h',
        };
        
        if (onLeadCreated) {
          onLeadCreated(newLeadData);
        }
      }
      onClose();
    } catch (err) {
      console.error('Failed to save lead:', err);
    }
  };


  const handlePrevMonth = () => {
    setCurrentMonth((prevDate) => {
      const newMonth = prevDate.getMonth() - 1;
      return new Date(prevDate.getFullYear(), newMonth, 1);
    });
  };
  const handleNextMonth = () => {
    setCurrentMonth((prevDate) => {
      const newMonth = prevDate.getMonth() + 1;
      return new Date(prevDate.getFullYear(), newMonth, 1);
    });
  };
  const handleDayClick = (day) => {
    const chosenDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
    const today = new Date();
    if (chosenDate < new Date(today.setHours(0, 0, 0, 0))) return;

    setValue('moveDate', chosenDate.toDateString());
    setShowCalendar(false);
  };
  const selectedMoveDate = watch('moveDate');
  const moveDateTextClass = selectedMoveDate
    ? styles.moveDateSelectedText
    : styles.moveDatePlaceholderText;

  return (
    <div className={styles.popup} onClick={onClose}>
      <div className={styles.popupContent} onClick={(e) => e.stopPropagation()}>

        {/* ---------- HEADER ---------- */}
        <div className={styles.header}>
          <div className={styles.title}>
            <Icon name="CustomerUser" className={styles.customerUserIcon} width={24} height={24} />
            {editingLead ? <p>Edit Lead</p> : <p>New Lead</p>}
          </div>
          <div className={styles.closeButton}>
            <button type="button" onClick={onClose} aria-label="Close">
              <Icon name="Close" className={styles.closeIcon} width={20} height={20} />
            </button>
          </div>
        </div>

        {/* ---------- MAIN CONTENT ---------- */}
      <form className={styles.content} onSubmit={handleSubmit(onSubmit)}>
          {/* COMPANY NAME dropdown */}
          <div className={styles.companySelectWrapper}>
            <button
              type="button"
              className={styles.dropdownButton}
              onClick={() => setShowCompanyDropdown((p) => !p)}
            >
              <div className={styles.dropdownLabel}>
                <span className={styles.dropdownPrefix}>Company:</span>
                <span className={styles.dropdownSelected}>{watch('companyName') || 'Select'}</span>
              </div>
              <Icon name="UnfoldMore" className={styles.dropdownIcon} />
            </button>

            {showCompanyDropdown && (
              <ul className={styles.optionsList} role="listbox">
                {brands.map((brand) => {
                  const isSelected = (watch('companyName') === brand.name);
                  return (
                    <li
                      key={brand.id}
                      className={`${styles.option} ${isSelected ? styles.selected : ''}`}
                      role="option"
                      aria-selected={isSelected}
                      onClick={() => {
                        setValue('companyName', brand.name);
                        setValue('brandId', brand.id);
                        setShowCompanyDropdown(false);
                      }}
                      tabIndex={0}
                    >
                      {brand.name}
                    </li>
                  );
                })}
              </ul>
            )}
          </div>

          {/* BASIC INPUT FIELDS */}
          <div className={styles.inputSet}>
            {/* Customer Name */}
            <div className={styles.inputContainer}>
              <input
                className={styles.activityInput}
                type="text"
                placeholder="Customer Name"
                {...register('customerName')}
              />
            </div>

            {/* Phone Number (formatted) */}
            <div className={styles.inputContainer}>
              <input
                className={styles.activityInput}
                type="text"
                placeholder="Phone Number"
                value={watch('customerPhoneNumber') || ''} onChange={handlePhoneChange}
              />
            </div>

            {/* Email */}
            <div className={styles.inputContainer}>
              <input
                className={styles.activityInput}
                type="text"
                placeholder="Email"
                {...register('customerEmail')}
              />
            </div>

            {/* SOURCE Dropdown */}
            <div className={styles.sourceSelectWrapper}>
              <button
                type="button"
                className={styles.dropdownButton}
                onClick={() => setShowSourceDropdown(p => !p)}
              >
                <div className={styles.dropdownLabel}>
                  <span className={styles.dropdownPrefix}>Source:</span>
                  <span className={styles.dropdownSelected}>
                    {watch('source') || 'Select'}
                  </span>
                </div>
                <Icon name="UnfoldMore" className={styles.dropdownIcon} />
              </button>

              {showSourceDropdown && (
                <ul className={styles.optionsList} role="listbox">
                  {LeadSourceChoices.map((src) => {
                   const isSelected = (watch('source') === src.name);
                    return (
                      <li
                        key={src.id}
                        className={`${styles.option} ${isSelected ? styles.selected : ''}`}
                        role="option"
                        aria-selected={isSelected}
                        onClick={() => {
                          setValue('source', src.name);
                          setShowSourceDropdown(false);
                        }}
                        tabIndex={0}
                      >
                        {src.name}
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          </div>

          {/* SERVICE SET (Type of Service, fromZip, toZip, etc.) */}
          <div className={styles.serviceSet}>

            {/* Type of Service dropdown */}
            <div className={styles.typeOfServiceSelectWrapper}>
              <button
                type="button"
                className={styles.dropdownButton}
                onClick={() => setShowServiceDropdown((p) => !p)}
              >
                <div className={styles.dropdownLabel}>
                  <span className={styles.dropdownPrefix}>Type of Service:</span>
                  <span className={styles.dropdownSelected}>{watch('serviceType') || 'Select'}</span>
                </div>
                <Icon name="UnfoldMore" className={styles.dropdownIcon} />
              </button>

              {showServiceDropdown && (
                <ul className={styles.optionsList} role="listbox">
                  {typeOfServiceChoices.map((service) => {
                    const isSelected = (watch('serviceType') === service.name);
                    return (
                      <li
                        key={service.id}
                        className={`${styles.option} ${isSelected ? styles.selected : ''}`}
                        role="option"
                        aria-selected={isSelected}
                        onClick={() => handleSelectTypeOfService(service.name)}
                        tabIndex={0}
                      >
                        {service.name}
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>

            {/* From Zip */}
            <div className={styles.inputContainer}>
              <input
                className={styles.activityInput}
                type="text"
                placeholder="From Zip"
                {...register('fromZip')}
              />
            </div>

            {/* To Zip */}
            <div className={styles.inputContainer}>
              <input
                className={styles.activityInput}
                type="text"
                placeholder="To Zip"
                {...register('toZip')}
              />
            </div>

            {/* Optional: Move Date */}
            <div className={styles.moveDateWrapper}>
              <button
                type="button"
                className={styles.moveDateButton}
                onClick={handleToggleCalendar}
              >
                <span className={moveDateTextClass}>
                  {selectedMoveDate || 'Move Date'}
                </span>
                <div className={styles.calendarIconWrapper}>
                  <Icon name="Calendar" className={styles.calendarIcon} />
                </div>
              </button>

              {showCalendar && (
                <div className={styles.calendarPopup}>
                  <div className={styles.calendarHeader}>
                    <button type="button" onClick={handlePrevMonth}>Prev</button>
                    <span>
                      {currentMonth.toLocaleString('default', { month: 'long' })}{' '}
                      {currentMonth.getFullYear()}
                    </span>
                    <button type="button" onClick={handleNextMonth}>Next</button>
                  </div>
                  <div className={styles.calendarGrid}>
                    {daysArray.map((day) => {
                      const dayDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
                      const disabled = (dayDate < new Date().setHours(0, 0, 0, 0));
                      const isSelectedDay = (dayDate.toDateString() === selectedMoveDate);

                      return (
                        <button
                          key={day}
                          type="button"
                          className={`${styles.calendarDay} ${disabled
                            ? styles.dayDisabled
                            : isSelectedDay
                              ? styles.daySelected
                              : ''
                            }`}
                          onClick={() => {
                            if (!disabled) handleDayClick(day);
                          }}
                          disabled={disabled}
                        >
                          {day}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* ASSIGN SALES REP TOGGLE */}
          <div className={styles.assignSalesToggleContainer}>
            <span className={styles.assignSalesToggleLabel}>{salesRepLabel}</span>
            <SimpleToggle
              isToggled={assignSalesRep}
              onToggle={(val) => { setValue('assignSalesRep', val); if (!val) setValue('salesName', ''); }}
            />
          </div>

          {/* If toggled ON => Sales Rep dropdown */}
          {assignSalesRep && (
            <div className={styles.salesRepSelectWrapper}>
              <button
                type="button"
                className={styles.dropdownButton}
                onClick={() => setShowSalesRepDropdown(p => !p)}
              >
                <div className={styles.dropdownLabel}>
                  <span className={styles.dropdownPrefix}>Sales Rep:</span>
                  <span className={styles.dropdownSelected}>{watch('salesName') || 'Select'}</span>
                </div>
                <Icon name="UnfoldMore" className={styles.dropdownIcon} />
              </button>

              {showSalesRepDropdown && (
                <ul className={styles.optionsList} role="listbox">
                  {users.map((rep) => {
                    const isSelected = (watch('salesName') === rep.name);
                    return (
                      <li
                        key={rep.id}
                        className={`${styles.option} ${isSelected ? styles.selected : ''}`}
                        role="option"
                        aria-selected={isSelected}
                        onClick={() => {
                          setValue('salesName', rep.name);
                          setShowSalesRepDropdown(false);
                        }}
                        tabIndex={0}
                      >
                        {rep.name}
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          )}

      {/* ---------- FOOTER ---------- */}
      <div className={styles.stickyFooter}>
        <button
        type='submit'
          className={styles.saveButton}
        >
          Save
        </button>
        <div className={styles.previousRequests}>
          Previous requests:
        </div>
        </div>
        </form>
      </div >
    </div >
  );
}

export default LeadFormPopup;
