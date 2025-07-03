"use client";

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
import { useMutation } from '@tanstack/react-query';
import { createFurnitureItem } from 'src/app/services/furnitureService';


// Import Place constants from PlacePopupConstants
import { 
  moveSizeOptionsMap, 
  typeOfPlaceOptions, 
  storiesEligibleTypes, 
  howManyStoriesOptions 
} from '../LeadManagementPanel/MoveDetailsPanel/OriginDetails/PlacePopup/PlacePopupConstants';

function LeadFormPopup({
  onClose,
  onLeadCreated,
  editingLead,
  onLeadUpdated,
  onOriginUpdated
}) {
  const salesRepLabel = editingLead ? 'Reassign Sales Rep' : 'Assign Sales Rep';
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
      typeOfPlace: '',
      moveSize: '',
      howManyStories: '',
      features: [],
    }
  });
  
  const { data: brands = [] } = useQuery({
    queryKey: ['brands', token],
    queryFn: () => getBrandsByTenant(token),
    enabled: !!token,
  });

  const { data: users = [] } = useQuery({
    queryKey: ['users', token],
    queryFn: () => getSalesmen(token),
    enabled: !!token,
  });

  const createFurnitureItemsMutation = useMutation({
    mutationFn: ({ brandId }) =>
      createFurnitureItem({ data: { brandId }, token }),
    onSuccess: (res) => {
      console.log('Furniture items successfully created:', res);
    },
    onError: (err) => {
      console.error('Failed to create furniture items:', err);
    },
  });

  const assignSalesRep = watch('assignSalesRep');
  const serviceType = watch('serviceType');
  const typeOfPlace = watch('typeOfPlace');
  const moveSize = watch('moveSize');
  const howManyStories = watch('howManyStories');
  const features = watch('features') || [];
  
  const [showCompanyDropdown, setShowCompanyDropdown] = useState(false);
  const [showSourceDropdown, setShowSourceDropdown] = useState(false);
  const [showSalesRepDropdown, setShowSalesRepDropdown] = useState(false);
  const [showServiceDropdown, setShowServiceDropdown] = useState(false);
  const [showCalendar, setShowCalendar] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [daysArray, setDaysArray] = useState([]);
  const [showTypeOfPlaceDropdown, setShowTypeOfPlaceDropdown] = useState(false);
  const [showMoveSizeDropdown, setShowMoveSizeDropdown] = useState(false);
  const [showStoriesDropdown, setShowStoriesDropdown] = useState(false);

  const hideToZip = serviceType && serviceType !== 'Moving';
  const moveSizeOptions = moveSizeOptionsMap[typeOfPlace] || [];
  const storiesApplicable = storiesEligibleTypes.has(typeOfPlace);

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
    const firstOrigin = editingLead.origins?.[0] || {};
    
    reset({
      // Convert fields to form format
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
      moveDate: editingLead.moveDate || '',
      fromZip: editingLead.fromZip || '',
      toZip: editingLead.toZip || '',
      assignSalesRep: !!editingLead.salesName,
      
      // Get origin data from the first origin
      typeOfPlace: firstOrigin.typeOfPlace || '',
      moveSize: firstOrigin.moveSize || '',
      howManyStories: firstOrigin.howManyStories || '',
      features: firstOrigin.features || [],
    });
  }
}, [editingLead, reset]);
  const handleToggleCalendar = () => {
    setShowCalendar((prev) => !prev);
  };

  const handleSelectTypeOfService = (serviceName) => {
    setValue('serviceType', serviceName);
    setShowServiceDropdown(false);
  };
  
  const handleSelectTypeOfPlace = (option) => {
    if (option !== typeOfPlace) {
      setValue('moveSize', '');
      setValue('howManyStories', '');
    }
    setValue('typeOfPlace', option);
    setShowTypeOfPlaceDropdown(false);
  };

  const handleSelectMoveSize = (option) => {
    setValue('moveSize', option);
    setShowMoveSizeDropdown(false);
  };

  const handleSelectStories = (option) => {
    setValue('howManyStories', option);
    setShowStoriesDropdown(false);
  };

  const toggleFeature = (feature) => {
    const currentFeatures = features || [];
    const idx = currentFeatures.indexOf(feature);
    let newFeatures;
    if (idx === -1) {
      newFeatures = [...currentFeatures, feature];
    } else {
      newFeatures = currentFeatures.filter(f => f !== feature);
    }
    setValue('features', newFeatures);
  };

  function handlePhoneChange(e) {
    const raw = e.target.value;
    const nums = raw.replace(/\D/g, '');

    let trimmed = nums;
    if (trimmed.startsWith('1') && trimmed.length > 10) {
      trimmed = trimmed.slice(1);
    }
    if (trimmed.length > 10) {
      trimmed = trimmed.slice(0, 10);
    }

    const display = formatPhoneForDisplay(trimmed);
    setValue('customerPhoneNumber', display);
  }

  function formatPhoneForDisplay(digits) {
    if (!digits) return '';

    let result = '';
    if (digits.length <= 3) {
      result = `(${digits}`;
    } else {
      result = `(${digits.slice(0, 3)})`;
    }
    if (digits.length > 3) {
      result += ` ${digits.slice(3, 6)}`;
    }
    if (digits.length > 6) {
      result += `-${digits.slice(6)}`;
    }
    return result;
  }

const onSubmit = async (data) => {
  console.log('[onSubmit] Raw form data:', data);
  try {
    let finalPhoneDigits = data.customerPhoneNumber.replace(/\D/g, '');
    if (finalPhoneDigits.startsWith('1') && finalPhoneDigits.length > 10) {
      finalPhoneDigits = finalPhoneDigits.slice(1);
    }

    // Use camelCase for Prisma schema
    const baseData = {
      customerName: data.customerName,
      customerPhoneNumber: finalPhoneDigits,
      customerEmail: data.customerEmail,
      companyName: data.companyName,
      brandId: data.brandId,
      source: data.source,
      serviceType: data.serviceType,
      salesName: data.salesName || '',
      estimator: data.estimator || '',
      surveyDate: data.surveyDate || '',
      surveyTime: data.surveyTime || '',
      moveDate: data.moveDate || '',
      fromZip: data.fromZip || '',
      toZip: data.toZip || '',
    };

   if (editingLead) {
  console.log('[LeadFormPopup] Attempting update with lead_id:', editingLead.id);
  if (onLeadUpdated) {
    // Update lead data
    const updateData = {
      ...baseData,
    };
    onLeadUpdated(editingLead.id, updateData);
    
    // Check if there are origin changes
    const firstOrigin = editingLead.origins?.[0];
    if (firstOrigin) {
      const originHasChanges = 
        data.typeOfPlace !== firstOrigin.typeOfPlace ||
        data.moveSize !== firstOrigin.moveSize ||
        data.howManyStories !== firstOrigin.howManyStories ||
        JSON.stringify(data.features) !== JSON.stringify(firstOrigin.features);
      
      if (originHasChanges && onOriginUpdated) {
        // Update origin data
        const originUpdateData = {
          typeOfPlace: data.typeOfPlace || '',
          moveSize: data.moveSize || '',
          howManyStories: data.howManyStories || '',
          features: data.features || [],
        };
        
        // Call the origin update function
        onOriginUpdated(firstOrigin.id, originUpdateData);
      }
    }
  }
} else {
      // For new leads, include place-related data that will go to Origins
      const newLeadData = {
        ...baseData,
        // Place-related data (will be extracted in API for Origins)
        typeOfPlace: data.typeOfPlace || '',
        moveSize: data.moveSize || '',
        howManyStories: data.howManyStories || '',
        features: data.features || [], // Keep as array
        
        // Lead-specific fields
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
        
        // Default financial values
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
        
        // Moving day details
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
        
        // Move in details
        moveInNumTrucks: 1,
        moveInNumMovers: 2,
        moveInHourlyRate: 180,
        moveInPricePerCuft: 4.5,
        moveInPricePerLbs: 0.74,
        moveInTravelTime: '1.00 h',
        moveInMovingMin: '3h',
        moveInMinimumCuft: 0.00,
        moveInMinimumLbs: 0,
        moveInPickupWindow: '1 day',
        moveInDeliveryWindow: '7 days',
        moveInMinHours: '1.00 h',
        moveInMaxHours: '2.00 h',
        
        // Packing details
        numPackers: 2,
        packingHourlyRate: 120,
        packingTravelTime: '0.45 h',
        packingMinimum: '2h',
        packingMinHours: '1.00 h',
        packingMaxHours: '2.00 h',
        
        // Move in estimate/invoice
        moveInTypeOfQuote: 'Flat Rate',
        moveInEstimateQuote: 585,
        moveInEstimateFuelSurcharge: 0,
        moveInEstimateValuation: 0,
        moveInEstimatePacking: 0,
        moveInEstimateAdditionalServices: 0,
        moveInEstimateDiscount: 0,
        moveInEstimateGrandTotal: 585,
        moveInEstimateDeposit: 50,
        moveInEstimatePayment: 0,
        moveInEstimateBalanceDue: 585,
        
        moveInInvoiceQuote: 585,
        moveInInvoiceFuelSurcharge: 0,
        moveInInvoiceValuation: 0,
        moveInInvoicePacking: 0,
        moveInInvoiceAdditionalServices: 0,
        moveInInvoiceDiscount: 0,
        moveInInvoiceGrandTotal: 585,
        moveInInvoiceDeposit: 50,
        moveInInvoicePayment: 0,
        moveInInvoiceBalanceDue: 585,
        moveInHasInvoice: false
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
        {/* HEADER */}
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

        {/* MAIN CONTENT */}
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
                        createFurnitureItemsMutation.mutate({ brandId: brand.id });
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
            <div className={styles.inputContainer}>
              <input
                className={styles.activityInput}
                type="text"
                placeholder="Customer Name"
                {...register('customerName')}
              />
            </div>

            <div className={styles.inputContainer}>
              <input
                className={styles.activityInput}
                type="text"
                placeholder="Phone Number"
                value={watch('customerPhoneNumber') || ''} 
                onChange={handlePhoneChange}
              />
            </div>

            <div className={styles.inputContainer}>
              <input
                className={styles.activityInput}
                type="text"
                placeholder="Email"
                {...register('customerEmail')}
              />
            </div>

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

          {/* SERVICE SET */}
          <div className={styles.serviceSet}>
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

            {/* PLACE QUESTIONS */}
            <div className={styles.placeSelectWrapper}>
              <button
                type="button"
                className={styles.dropdownButton}
                onClick={() => setShowTypeOfPlaceDropdown(p => !p)}
              >
                <div className={styles.dropdownLabel}>
                  <span className={styles.dropdownPrefix}>Type of Place:</span>
                  <span className={styles.dropdownSelected}>{typeOfPlace || 'Select'}</span>
                </div>
                <Icon name="UnfoldMore" className={styles.dropdownIcon} />
              </button>

              {showTypeOfPlaceDropdown && (
                <ul className={styles.optionsList} role="listbox">
                  {typeOfPlaceOptions.map((option) => {
                    const isSelected = (typeOfPlace === option);
                    return (
                      <li
                        key={option}
                        className={`${styles.option} ${isSelected ? styles.selected : ''}`}
                        role="option"
                        aria-selected={isSelected}
                        onClick={() => handleSelectTypeOfPlace(option)}
                        tabIndex={0}
                      >
                        {option}
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>

            {typeOfPlace && (
              <div className={styles.placeSelectWrapper}>
                <button
                  type="button"
                  className={styles.dropdownButton}
                  onClick={() => setShowMoveSizeDropdown(p => !p)}
                >
                  <div className={styles.dropdownLabel}>
                    <span className={styles.dropdownPrefix}>Move Size:</span>
                    <span className={styles.dropdownSelected}>{moveSize || 'Select'}</span>
                  </div>
                  <Icon name="UnfoldMore" className={styles.dropdownIcon} />
                </button>

                {showMoveSizeDropdown && (
                  <ul className={styles.optionsList} role="listbox">
                    {moveSizeOptions.map((option) => {
                      const isSelected = (moveSize === option);
                      return (
                        <li
                          key={option}
                          className={`${styles.option} ${isSelected ? styles.selected : ''}`}
                          role="option"
                          aria-selected={isSelected}
                          onClick={() => handleSelectMoveSize(option)}
                          tabIndex={0}
                        >
                          {option}
                        </li>
                      );
                    })}
                  </ul>
                )}
              </div>
            )}

            {storiesApplicable && (
              <div className={styles.placeSelectWrapper}>
                <button
                  type="button"
                  className={styles.dropdownButton}
                  onClick={() => setShowStoriesDropdown(p => !p)}
                >
                  <div className={styles.dropdownLabel}>
                    <span className={styles.dropdownPrefix}>How Many Stories:</span>
                    <span className={styles.dropdownSelected}>{howManyStories || 'Select'}</span>
                  </div>
                  <Icon name="UnfoldMore" className={styles.dropdownIcon} />
                </button>

                {showStoriesDropdown && (
                  <ul className={styles.optionsList} role="listbox">
                    {howManyStoriesOptions.map((option) => {
                      const isSelected = (howManyStories === option);
                      return (
                        <li
                          key={option}
                          className={`${styles.option} ${isSelected ? styles.selected : ''}`}
                          role="option"
                          aria-selected={isSelected}
                          onClick={() => handleSelectStories(option)}
                          tabIndex={0}
                        >
                          {option}
                        </li>
                      );
                    })}
                  </ul>
                )}
              </div>
            )}

            <div className={styles.featuresGrid}>
              {['Basement', 'Attic', 'Shed', 'Garage'].map((feature) => {
                const isChecked = features.includes(feature);
                return (
                  <label className={styles.featureCheckbox} key={feature}>
                    <input
                      type="checkbox"
                      className={styles.hiddenCheckbox}
                      checked={isChecked}
                      onChange={() => toggleFeature(feature)}
                    />
                    <span className={styles.customBox} />
                    <span className={styles.featureLabel}>{feature}</span>
                  </label>
                );
              })}
            </div>

            <div className={styles.inputContainer}>
              <input
                className={styles.activityInput}
                type="text"
                placeholder="From Zip"
                {...register('fromZip')}
              />
            </div>

            {!hideToZip && (
              <div className={styles.inputContainer}>
                <input
                  className={styles.activityInput}
                  type="text"
                  placeholder="To Zip"
                  {...register('toZip')}
                />
              </div>
            )}

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

          {/* FOOTER */}
          <div className={styles.stickyFooter}>
            <button type='submit' className={styles.saveButton}>
              Save
            </button>
            <div className={styles.previousRequests}>
              Previous requests:
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

export default LeadFormPopup;