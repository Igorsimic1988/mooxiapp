// src/services/leadService.js
import { v4 as uuidv4 } from 'uuid';
import leadsData from '../data/constants/actualLeads';

/**
 * Helper to push a new status record into status_history.
 * We'll always push the current top-level fields, plus a `changed_at` timestamp.
 */
function pushStatusRecord(lead) {
  if (!Array.isArray(lead.status_history)) {
    lead.status_history = [];
  }
  lead.status_history.push({
    lead_status: lead.lead_status,
    lead_activity: lead.lead_activity,
    next_action: lead.next_action,
    changed_at: new Date().toISOString(),
  });
}

/**
 * Migrate flat fields into nested structure
 * Used for backwards compatibility with existing leads
 */
function migrateToNestedStructure(lead) {
  // Only migrate if movingDay/packingDay don't exist
  if (!lead.movingDay) {
    lead.movingDay = {
      rateType: lead.rateType || 'Hourly Rate',
      numTrucks: lead.numTrucks || '1',
      numMovers: lead.numMovers || '2',
      hourlyRate: lead.hourlyRate || '180',
      volume: lead.volume || '1000',
      weight: lead.weight || '7000',
      pricePerCuft: lead.pricePerCuft || '4.50',
      pricePerLbs: lead.pricePerLbs || '0.74',
      travelTime: lead.travelTime || '1.00 h',
      movingMin: lead.movingMin || '3h',
      minimumCuft: lead.minimumCuft || '0.00',
      minimumLbs: lead.minimumLbs || '0',
      pickupWindow: lead.pickupWindow || '1 day',
      earliestDeliveryDate: lead.earliestDeliveryDate || '',
      deliveryWindow: lead.deliveryWindow || '7 days',
      minHours: lead.minHours || '1.00 h',
      maxHours: lead.maxHours || '2.00 h',
    };
  }
  
  if (!lead.packingDay) {
    lead.packingDay = {
      numPackers: lead.numPackers || '2',
      packingHourlyRate: lead.packingHourlyRate || '120',
      packingTravelTime: lead.packingTravelTime || '0.45 h',
      packingMinimum: lead.packingMinimum || '2h',
      packingMinHours: lead.packingMinHours || '1.00 h',
      packingMaxHours: lead.packingMaxHours || '2.00 h',
    };
  }
  // Make sure estimate object exists
  if (!lead.estimate) {
    lead.estimate = {
      rateType: 'Flat Rate',
      deposit: '$50.00',
      quote: '$520.00 - $585.00',
      fuelSurcharge: '$0.00',
      valuation: '$0.00',
      packing: '$0.00',
      additionalServices: '$0.00',
      discount: '$0.00',
      grandTotal: '$520 - $585',
      payment: '$0.00',
      balanceDue: '$520 - $585',
    };
  }
  
  // Invoice is not created by default, only when user clicks "Create Invoice"
  
  return lead;
}

/**
 * createLead => create a new Lead object.
 * 1) We fill out top-level lead_status / lead_activity / next_action.
 * 2) We also initialize status_history as an empty array and push an initial record.
 */
export async function createLead(leadData) {
  const newLeadId = uuidv4();

  // Find highest existing job_number
  const lastJobNumber = leadsData.reduce((max, ld) => {
    return ld.job_number > max ? ld.job_number : max;
  }, 0);
  const nextJobNumber = lastJobNumber + 1;

  const tenantId = 'tenant_1';
  const creationDateTime = new Date().toISOString();

  const defaultStops = [
    {
      label: 'Main Address',
      address: '',
      apt: '',
      city: '',
      state: '',
      zip: '',
    },
  ];
  const originStops =
    Array.isArray(leadData.originStops) && leadData.originStops.length
      ? leadData.originStops
      : defaultStops;

  // Extract moving day and packing day data
  const movingDay = leadData.movingDay || {
    rateType: 'Hourly Rate',
    numTrucks: '1',
    numMovers: '2',
    hourlyRate: '180',
    volume: '1000',
    weight: '7000',
    pricePerCuft: '4.50',
    pricePerLbs: '0.74',
    travelTime: '1.00 h',
    movingMin: '3h',
    minimumCuft: '0.00',
    minimumLbs: '0',
    pickupWindow: '1 day',
    earliestDeliveryDate: '',
    deliveryWindow: '7 days',
    minHours: '1.00 h',
    maxHours: '2.00 h',
  };
  
  const packingDay = leadData.packingDay || {
    numPackers: '2',
    packingHourlyRate: '120',
    packingTravelTime: '0.45 h',
    packingMinimum: '2h',
    packingMinHours: '1.00 h',
    packingMaxHours: '2.00 h',
  };
  
  // Initialize estimate data
  const estimate = leadData.estimate || {
    rateType: 'Flat Rate',
    deposit: '$50.00',
    quote: '$520.00 - $585.00',
    fuelSurcharge: '$0.00',
    valuation: '$0.00',
    packing: '$0.00',
    additionalServices: '$0.00',
    discount: '$0.00',
    grandTotal: '$520 - $585',
    payment: '$0.00',
    balanceDue: '$520 - $585',
  };

  // Invoice is not created by default - only when user clicks "Create Invoice"
  // hasInvoice + activeOption determine which UI is shown

  // Prepare the new lead object
  const newLead = {
    lead_id: newLeadId,
    tenant_id: tenantId,
    job_number: nextJobNumber,
    creation_date_time: creationDateTime,

    customer_name: leadData.customer_name || '',
    customer_phone_number: leadData.customer_phone_number || '',
    customer_email: leadData.customer_email || '',
    company_name: leadData.company_name || '',
    source: leadData.source || '',

    service_type: leadData.service_type || 'Moving',
    sales_name: leadData.sales_name || '',
    is_new: typeof leadData.is_new === 'boolean' ? leadData.is_new : true,

    // The top-level fields you already use
    lead_status: leadData.lead_status || 'New Lead',
    lead_activity: leadData.lead_activity || '',
    next_action: leadData.next_action || '',

    // Additional standard fields
    estimator: leadData.estimator || '',
    survey_date: leadData.survey_date || '',
    survey_time: leadData.survey_time || '',
    inventory_option: leadData.inventory_option || 'Detailed Inventory Quote',
    add_storage: leadData.add_storage ?? false,
    storage_items: leadData.storage_items ?? '',
    time_promised: leadData.time_promised ?? false,
    arrival_time: leadData.arrival_time ?? '',
    rateType: leadData.rateType || 'Hourly Rate',

    originStops,

    // ---------- Day selection fields ----------
    hasPackingDay: leadData.hasPackingDay ?? false,
    activeDay: leadData.activeDay ?? 'moving', // default to lowercase 'moving'
    
    // ---------- Invoice/Estimate fields ----------
    hasInvoice: leadData.hasInvoice ?? false,
    activeOption: leadData.activeOption ?? 'estimate', // default to lowercase 'estimate'

    // ---------- Move Out Estimate fields ----------
    typeOfQuote: leadData.typeOfQuote || 'Flat Rate',
    estimateQuote: leadData.estimateQuote || 585,
    estimateFuelSurcharge: leadData.estimateFuelSurcharge || 0,
    estimateValuation: leadData.estimateValuation || 0,
    estimatePacking: leadData.estimatePacking || 0,
    estimateAdditionalServices: leadData.estimateAdditionalServices || 0,
    estimateDiscount: leadData.estimateDiscount || 0,
    estimateGrandTotal: leadData.estimateGrandTotal || 585,
    estimateDeposit: leadData.estimateDeposit || 50,
    estimatePayment: leadData.estimatePayment || 0,
    estimateBalanceDue: leadData.estimateBalanceDue || 585,
    
    // ---------- Move Out Invoice fields ----------
    invoiceQuote: leadData.invoiceQuote || null,
    invoiceFuelSurcharge: leadData.invoiceFuelSurcharge || null,
    invoiceValuation: leadData.invoiceValuation || null,
    invoicePacking: leadData.invoicePacking || null,
    invoiceAdditionalServices: leadData.invoiceAdditionalServices || null,
    invoiceDiscount: leadData.invoiceDiscount || null,
    invoiceGrandTotal: leadData.invoiceGrandTotal || null,
    invoiceDeposit: leadData.invoiceDeposit || null,
    invoicePayment: leadData.invoicePayment || null,
    invoiceBalanceDue: leadData.invoiceBalanceDue || null,

    // ---------- Move In Estimate fields ----------
    moveInTypeOfQuote: leadData.moveInTypeOfQuote || 'Flat Rate',
    moveInEstimateQuote: leadData.moveInEstimateQuote || 585,
    moveInEstimateFuelSurcharge: leadData.moveInEstimateFuelSurcharge || 0,
    moveInEstimateValuation: leadData.moveInEstimateValuation || 0,
    moveInEstimatePacking: leadData.moveInEstimatePacking || 0,
    moveInEstimateAdditionalServices: leadData.moveInEstimateAdditionalServices || 0,
    moveInEstimateDiscount: leadData.moveInEstimateDiscount || 0,
    moveInEstimateGrandTotal: leadData.moveInEstimateGrandTotal || 585,
    moveInEstimateDeposit: leadData.moveInEstimateDeposit || 50,
    moveInEstimatePayment: leadData.moveInEstimatePayment || 0,
    moveInEstimateBalanceDue: leadData.moveInEstimateBalanceDue || 585,

    // ---------- Move In Invoice fields ----------
    moveInHasInvoice: leadData.moveInHasInvoice ?? false,
    moveInInvoiceQuote: leadData.moveInInvoiceQuote || null,
    moveInInvoiceFuelSurcharge: leadData.moveInInvoiceFuelSurcharge || null,
    moveInInvoiceValuation: leadData.moveInInvoiceValuation || null,
    moveInInvoicePacking: leadData.moveInInvoicePacking || null,
    moveInInvoiceAdditionalServices: leadData.moveInInvoiceAdditionalServices || null,
    moveInInvoiceDiscount: leadData.moveInInvoiceDiscount || null,
    moveInInvoiceGrandTotal: leadData.moveInInvoiceGrandTotal || null,
    moveInInvoiceDeposit: leadData.moveInInvoiceDeposit || null,
    moveInInvoicePayment: leadData.moveInInvoicePayment || null,
    moveInInvoiceBalanceDue: leadData.moveInInvoiceBalanceDue || null,

    // ---------- NESTED OBJECTS ----------
    movingDay,
    packingDay,
    estimate,

    // new array for storing history
    status_history: [],
  };

  // Push the initial record into status_history
  pushStatusRecord(newLead);

  // Add to local leads array
  leadsData.push(newLead);
  return newLead;
}

/**
 * updateLead => updates top-level fields + pushes a new record to status_history
 * if lead_status/lead_activity/next_action changed from the current lead.
 *
 * IMPORTANT: We migrate to the new nested structure if needed, then handle
 * both nested and direct updates.
 */
export async function updateLead(leadId, updates) {
  const idx = leadsData.findIndex((ld) => ld.lead_id === leadId);
  if (idx === -1) {
    throw new Error(`Lead with id ${leadId} not found`);
  }

  const existingLead = leadsData[idx];
  
  // First, migrate legacy flat fields to nested structure if needed
  migrateToNestedStructure(existingLead);

  // Standard top-level fields
  existingLead.customer_name = updates.customer_name ?? existingLead.customer_name;
  existingLead.customer_phone_number = updates.customer_phone_number ?? existingLead.customer_phone_number;
  existingLead.customer_email = updates.customer_email ?? existingLead.customer_email;
  existingLead.company_name = updates.company_name ?? existingLead.company_name;
  existingLead.source = updates.source ?? existingLead.source;
  existingLead.service_type = updates.service_type ?? existingLead.service_type;
  existingLead.sales_name = updates.sales_name ?? existingLead.sales_name;
  existingLead.estimator = updates.estimator ?? existingLead.estimator;
  existingLead.survey_date = updates.survey_date ?? existingLead.survey_date;
  existingLead.survey_time = updates.survey_time ?? existingLead.survey_time;
  existingLead.inventory_option = updates.inventory_option ?? existingLead.inventory_option;
  existingLead.add_storage = updates.add_storage ?? existingLead.add_storage;
  existingLead.storage_items = updates.storage_items ?? existingLead.storage_items;
  existingLead.time_promised = updates.time_promised ?? existingLead.time_promised;
  existingLead.arrival_time = updates.arrival_time ?? existingLead.arrival_time;
  existingLead.rateType = updates.rateType ?? existingLead.rateType;

  // ---------- Day selection fields ----------
  existingLead.hasPackingDay = (typeof updates.hasPackingDay !== 'undefined')
    ? updates.hasPackingDay
    : existingLead.hasPackingDay;
  existingLead.activeDay = updates.activeDay ?? existingLead.activeDay;
  
  // ---------- Invoice/Estimate fields ----------
  existingLead.hasInvoice = (typeof updates.hasInvoice !== 'undefined')
    ? updates.hasInvoice
    : existingLead.hasInvoice;
  existingLead.activeOption = updates.activeOption ?? existingLead.activeOption;

  // ---------- Move Out Estimate fields ----------
  existingLead.typeOfQuote = updates.typeOfQuote ?? existingLead.typeOfQuote;
  existingLead.estimateQuote = updates.estimateQuote ?? existingLead.estimateQuote;
  existingLead.estimateFuelSurcharge = updates.estimateFuelSurcharge ?? existingLead.estimateFuelSurcharge;
  existingLead.estimateValuation = updates.estimateValuation ?? existingLead.estimateValuation;
  existingLead.estimatePacking = updates.estimatePacking ?? existingLead.estimatePacking;
  existingLead.estimateAdditionalServices = updates.estimateAdditionalServices ?? existingLead.estimateAdditionalServices;
  existingLead.estimateDiscount = updates.estimateDiscount ?? existingLead.estimateDiscount;
  existingLead.estimateGrandTotal = updates.estimateGrandTotal ?? existingLead.estimateGrandTotal;
  existingLead.estimateDeposit = updates.estimateDeposit ?? existingLead.estimateDeposit;
  existingLead.estimatePayment = updates.estimatePayment ?? existingLead.estimatePayment;
  existingLead.estimateBalanceDue = updates.estimateBalanceDue ?? existingLead.estimateBalanceDue;

  // ---------- Move Out Invoice fields ----------
  existingLead.invoiceQuote = updates.invoiceQuote ?? existingLead.invoiceQuote;
  existingLead.invoiceFuelSurcharge = updates.invoiceFuelSurcharge ?? existingLead.invoiceFuelSurcharge;
  existingLead.invoiceValuation = updates.invoiceValuation ?? existingLead.invoiceValuation;
  existingLead.invoicePacking = updates.invoicePacking ?? existingLead.invoicePacking;
  existingLead.invoiceAdditionalServices = updates.invoiceAdditionalServices ?? existingLead.invoiceAdditionalServices;
  existingLead.invoiceDiscount = updates.invoiceDiscount ?? existingLead.invoiceDiscount;
  existingLead.invoiceGrandTotal = updates.invoiceGrandTotal ?? existingLead.invoiceGrandTotal;
  existingLead.invoiceDeposit = updates.invoiceDeposit ?? existingLead.invoiceDeposit;
  existingLead.invoicePayment = updates.invoicePayment ?? existingLead.invoicePayment;
  existingLead.invoiceBalanceDue = updates.invoiceBalanceDue ?? existingLead.invoiceBalanceDue;

  // ---------- Move In Estimate fields ----------
  existingLead.moveInTypeOfQuote = updates.moveInTypeOfQuote ?? existingLead.moveInTypeOfQuote;
  existingLead.moveInEstimateQuote = updates.moveInEstimateQuote ?? existingLead.moveInEstimateQuote;
  existingLead.moveInEstimateFuelSurcharge = updates.moveInEstimateFuelSurcharge ?? existingLead.moveInEstimateFuelSurcharge;
  existingLead.moveInEstimateValuation = updates.moveInEstimateValuation ?? existingLead.moveInEstimateValuation;
  existingLead.moveInEstimatePacking = updates.moveInEstimatePacking ?? existingLead.moveInEstimatePacking;
  existingLead.moveInEstimateAdditionalServices = updates.moveInEstimateAdditionalServices ?? existingLead.moveInEstimateAdditionalServices;
  existingLead.moveInEstimateDiscount = updates.moveInEstimateDiscount ?? existingLead.moveInEstimateDiscount;
  existingLead.moveInEstimateGrandTotal = updates.moveInEstimateGrandTotal ?? existingLead.moveInEstimateGrandTotal;
  existingLead.moveInEstimateDeposit = updates.moveInEstimateDeposit ?? existingLead.moveInEstimateDeposit;
  existingLead.moveInEstimatePayment = updates.moveInEstimatePayment ?? existingLead.moveInEstimatePayment;
  existingLead.moveInEstimateBalanceDue = updates.moveInEstimateBalanceDue ?? existingLead.moveInEstimateBalanceDue;

  // ---------- Move In Invoice fields ----------
  existingLead.moveInHasInvoice = (typeof updates.moveInHasInvoice !== 'undefined')
    ? updates.moveInHasInvoice
    : existingLead.moveInHasInvoice;
  existingLead.moveInInvoiceQuote = updates.moveInInvoiceQuote ?? existingLead.moveInInvoiceQuote;
  existingLead.moveInInvoiceFuelSurcharge = updates.moveInInvoiceFuelSurcharge ?? existingLead.moveInInvoiceFuelSurcharge;
  existingLead.moveInInvoiceValuation = updates.moveInInvoiceValuation ?? existingLead.moveInInvoiceValuation;
  existingLead.moveInInvoicePacking = updates.moveInInvoicePacking ?? existingLead.moveInInvoicePacking;
  existingLead.moveInInvoiceAdditionalServices = updates.moveInInvoiceAdditionalServices ?? existingLead.moveInInvoiceAdditionalServices;
  existingLead.moveInInvoiceDiscount = updates.moveInInvoiceDiscount ?? existingLead.moveInInvoiceDiscount;
  existingLead.moveInInvoiceGrandTotal = updates.moveInInvoiceGrandTotal ?? existingLead.moveInInvoiceGrandTotal;
  existingLead.moveInInvoiceDeposit = updates.moveInInvoiceDeposit ?? existingLead.moveInInvoiceDeposit;
  existingLead.moveInInvoicePayment = updates.moveInInvoicePayment ?? existingLead.moveInInvoicePayment;
  existingLead.moveInInvoiceBalanceDue = updates.moveInInvoiceBalanceDue ?? existingLead.moveInInvoiceBalanceDue;

  // ---------- NESTED OBJECTS ----------
  if (updates.movingDay) {
    // Make sure moving day object exists
    if (!existingLead.movingDay) existingLead.movingDay = {};
    
    // Merge all fields from updates.movingDay
    Object.assign(existingLead.movingDay, updates.movingDay);
  }

  if (updates.packingDay) {
    // Make sure packing day object exists
    if (!existingLead.packingDay) existingLead.packingDay = {};
    
    // Merge all fields from updates.packingDay
    Object.assign(existingLead.packingDay, updates.packingDay);
  }
  
  if (updates.estimate) {
    // Make sure estimate object exists
    if (!existingLead.estimate) existingLead.estimate = {};
    
    // Merge all fields from updates.estimate
    Object.assign(existingLead.estimate, updates.estimate);
  }
  
  if (updates.invoice) {
    // Make sure invoice object exists
    if (!existingLead.invoice) existingLead.invoice = {};
    
    // Merge all fields from updates.invoice
    Object.assign(existingLead.invoice, updates.invoice);
  }

  if (Array.isArray(updates.originStops)) {
    existingLead.originStops = updates.originStops;
  }

  // Now handle lead_status, lead_activity, next_action (which triggers a new history record)
  let statusChanged = false;
  let activityChanged = false;
  let nextActionChanged = false;

  if (
    typeof updates.lead_status === 'string' &&
    updates.lead_status !== existingLead.lead_status
  ) {
    existingLead.lead_status = updates.lead_status;
    statusChanged = true;
  }
  if (
    typeof updates.lead_activity === 'string' &&
    updates.lead_activity !== existingLead.lead_activity
  ) {
    existingLead.lead_activity = updates.lead_activity;
    activityChanged = true;
  }
  if (
    typeof updates.next_action === 'string' &&
    updates.next_action !== existingLead.next_action
  ) {
    existingLead.next_action = updates.next_action;
    nextActionChanged = true;
  }

  // If any of those changed => push a new record
  if (statusChanged || activityChanged || nextActionChanged) {
    pushStatusRecord(existingLead);
  }

  // Handle uiState
  if (updates.uiState) {
    existingLead.uiState = {
      ...existingLead.uiState || {},
      ...updates.uiState
    };
  }

  // Save updated lead back
  leadsData[idx] = existingLead;
  return existingLead;
}