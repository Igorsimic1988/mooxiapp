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

  // Handle origins data - check both 'origins' and 'originStops' for compatibility
  let origins = leadData.origins || leadData.originStops || [];
  
  // If no origins provided, create a default one
  if (!origins.length) {
    origins = [{
      type_of_place: leadData.type_of_place || '',
      move_size: leadData.move_size || '',
      how_many_stories: leadData.how_many_stories || '',
      features: leadData.features || [],
      addresses: [{
        label: 'Main Address',
        address: '',
        apt: '',
        city: '',
        state: '',
        zip: leadData.from_zip || '',
      }]
    }];
  }

  // Extract moving day and packing day data - handle both nested and flat structures
  const movingDay = leadData.movingDay || leadData.moving_day || {
    rateType: leadData.rate_type || leadData.rateType || 'Hourly Rate',
    numTrucks: String(leadData.num_trucks || leadData.numTrucks || 1),
    numMovers: String(leadData.num_movers || leadData.numMovers || 2),
    hourlyRate: String(leadData.hourly_rate || leadData.hourlyRate || 180),
    volume: String(leadData.volume || 1000),
    weight: String(leadData.weight || 7000),
    pricePerCuft: String(leadData.price_per_cuft || leadData.pricePerCuft || 4.5),
    pricePerLbs: String(leadData.price_per_lbs || leadData.pricePerLbs || 0.74),
    travelTime: leadData.travel_time || leadData.travelTime || '1.00 h',
    movingMin: leadData.moving_min || leadData.movingMin || '3h',
    minimumCuft: String(leadData.minimum_cuft || leadData.minimumCuft || 0),
    minimumLbs: String(leadData.minimum_lbs || leadData.minimumLbs || 0),
    pickupWindow: leadData.pickup_window || leadData.pickupWindow || '1 day',
    earliestDeliveryDate: leadData.earliest_delivery_date || leadData.earliestDeliveryDate || '',
    deliveryWindow: leadData.delivery_window || leadData.deliveryWindow || '7 days',
    minHours: leadData.min_hours || leadData.minHours || '1.00 h',
    maxHours: leadData.max_hours || leadData.maxHours || '2.00 h',
  };
  
  const packingDay = leadData.packingDay || leadData.packing_day || {
    numPackers: String(leadData.num_packers || leadData.numPackers || 2),
    packingHourlyRate: String(leadData.packing_hourly_rate || leadData.packingHourlyRate || 120),
    packingTravelTime: leadData.packing_travel_time || leadData.packingTravelTime || '0.45 h',
    packingMinimum: leadData.packing_minimum || leadData.packingMinimum || '2h',
    packingMinHours: leadData.packing_min_hours || leadData.packingMinHours || '1.00 h',
    packingMaxHours: leadData.packing_max_hours || leadData.packingMaxHours || '2.00 h',
  };
  
  // Initialize estimate data
  const estimate = leadData.estimate || {
    rateType: leadData.type_of_quote || leadData.typeOfQuote || 'Flat Rate',
    deposit: `$${leadData.estimate_deposit || leadData.estimateDeposit || 50}.00`,
    quote: `$${leadData.estimate_quote || leadData.estimateQuote || 585}.00`,
    fuelSurcharge: `$${leadData.estimate_fuel_surcharge || leadData.estimateFuelSurcharge || 0}.00`,
    valuation: `$${leadData.estimate_valuation || leadData.estimateValuation || 0}.00`,
    packing: `$${leadData.estimate_packing || leadData.estimatePacking || 0}.00`,
    additionalServices: `$${leadData.estimate_additional_services || leadData.estimateAdditionalServices || 0}.00`,
    discount: `$${leadData.estimate_discount || leadData.estimateDiscount || 0}.00`,
    grandTotal: `$${leadData.estimate_grand_total || leadData.estimateGrandTotal || 585}`,
    payment: `$${leadData.estimate_payment || leadData.estimatePayment || 0}.00`,
    balanceDue: `$${leadData.estimate_balance_due || leadData.estimateBalanceDue || 585}`,
  };

  // Prepare the new lead object with proper field names
  const newLead = {
    lead_id: newLeadId,
    tenant_id: tenantId,
    job_number: nextJobNumber,
    creation_date_time: creationDateTime,

    // Customer info - handle both snake_case and camelCase
    customer_name: leadData.customer_name || leadData.customerName || '',
    customer_phone_number: leadData.customer_phone_number || leadData.customerPhoneNumber || '',
    customer_email: leadData.customer_email || leadData.customerEmail || '',
    company_name: leadData.company_name || leadData.companyName || '',
    brand_id: leadData.brand_id || leadData.brandId || '',
    source: leadData.source || '',

    // Service info
    service_type: leadData.service_type || leadData.serviceType || 'Moving',
    sales_name: leadData.sales_name || leadData.salesName || '',
    is_new: typeof leadData.is_new === 'boolean' ? leadData.is_new : true,

    // Status fields
    lead_status: leadData.lead_status || leadData.leadStatus || 'New Lead',
    lead_activity: leadData.lead_activity || leadData.leadActivity || '',
    next_action: leadData.next_action || leadData.nextAction || '',

    // Additional fields
    estimator: leadData.estimator || '',
    survey_date: leadData.survey_date || leadData.surveyDate || '',
    survey_time: leadData.survey_time || leadData.surveyTime || '',
    inventory_option: leadData.inventory_option || leadData.inventoryOption || 'Detailed Inventory Quote',
    add_storage: leadData.add_storage ?? leadData.addStorage ?? false,
    storage_items: leadData.storage_items || leadData.storageItems || '',
    time_promised: leadData.time_promised ?? leadData.timePromised ?? false,
    arrival_time: leadData.arrival_time || leadData.arrivalTime || '',
    rateType: leadData.rate_type || leadData.rateType || 'Hourly Rate',
    
    // Location info
    from_zip: leadData.from_zip || leadData.fromZip || '',
    to_zip: leadData.to_zip || leadData.toZip || '',
    move_date: leadData.move_date || leadData.moveDate || '',

    // Store origins data
    origins: origins,
    originStops: origins, // Keep for backward compatibility

    // Day selection fields
    hasPackingDay: leadData.has_packing_day ?? leadData.hasPackingDay ?? false,
    activeDay: leadData.active_day || leadData.activeDay || 'moving',
    
    // Invoice/Estimate fields
    hasInvoice: leadData.has_invoice ?? leadData.hasInvoice ?? false,
    activeOption: leadData.active_option || leadData.activeOption || 'estimate',

    // Move Out Estimate fields
    typeOfQuote: leadData.type_of_quote || leadData.typeOfQuote || 'Flat Rate',
    estimateQuote: leadData.estimate_quote || leadData.estimateQuote || 585,
    estimateFuelSurcharge: leadData.estimate_fuel_surcharge || leadData.estimateFuelSurcharge || 0,
    estimateValuation: leadData.estimate_valuation || leadData.estimateValuation || 0,
    estimatePacking: leadData.estimate_packing || leadData.estimatePacking || 0,
    estimateAdditionalServices: leadData.estimate_additional_services || leadData.estimateAdditionalServices || 0,
    estimateDiscount: leadData.estimate_discount || leadData.estimateDiscount || 0,
    estimateGrandTotal: leadData.estimate_grand_total || leadData.estimateGrandTotal || 585,
    estimateDeposit: leadData.estimate_deposit || leadData.estimateDeposit || 50,
    estimatePayment: leadData.estimate_payment || leadData.estimatePayment || 0,
    estimateBalanceDue: leadData.estimate_balance_due || leadData.estimateBalanceDue || 585,
    
    // Move Out Invoice fields
    invoiceQuote: leadData.invoice_quote || leadData.invoiceQuote || null,
    invoiceFuelSurcharge: leadData.invoice_fuel_surcharge || leadData.invoiceFuelSurcharge || null,
    invoiceValuation: leadData.invoice_valuation || leadData.invoiceValuation || null,
    invoicePacking: leadData.invoice_packing || leadData.invoicePacking || null,
    invoiceAdditionalServices: leadData.invoice_additional_services || leadData.invoiceAdditionalServices || null,
    invoiceDiscount: leadData.invoice_discount || leadData.invoiceDiscount || null,
    invoiceGrandTotal: leadData.invoice_grand_total || leadData.invoiceGrandTotal || null,
    invoiceDeposit: leadData.invoice_deposit || leadData.invoiceDeposit || null,
    invoicePayment: leadData.invoice_payment || leadData.invoicePayment || null,
    invoiceBalanceDue: leadData.invoice_balance_due || leadData.invoiceBalanceDue || null,

    // Move In fields
    moveInTypeOfQuote: leadData.move_in_type_of_quote || leadData.moveInTypeOfQuote || 'Flat Rate',
    moveInEstimateQuote: leadData.move_in_estimate_quote || leadData.moveInEstimateQuote || 585,
    moveInEstimateFuelSurcharge: leadData.move_in_estimate_fuel_surcharge || leadData.moveInEstimateFuelSurcharge || 0,
    moveInEstimateValuation: leadData.move_in_estimate_valuation || leadData.moveInEstimateValuation || 0,
    moveInEstimatePacking: leadData.move_in_estimate_packing || leadData.moveInEstimatePacking || 0,
    moveInEstimateAdditionalServices: leadData.move_in_estimate_additional_services || leadData.moveInEstimateAdditionalServices || 0,
    moveInEstimateDiscount: leadData.move_in_estimate_discount || leadData.moveInEstimateDiscount || 0,
    moveInEstimateGrandTotal: leadData.move_in_estimate_grand_total || leadData.moveInEstimateGrandTotal || 585,
    moveInEstimateDeposit: leadData.move_in_estimate_deposit || leadData.moveInEstimateDeposit || 50,
    moveInEstimatePayment: leadData.move_in_estimate_payment || leadData.moveInEstimatePayment || 0,
    moveInEstimateBalanceDue: leadData.move_in_estimate_balance_due || leadData.moveInEstimateBalanceDue || 585,

    moveInHasInvoice: leadData.move_in_has_invoice ?? leadData.moveInHasInvoice ?? false,
    moveInInvoiceQuote: leadData.move_in_invoice_quote || leadData.moveInInvoiceQuote || null,
    moveInInvoiceFuelSurcharge: leadData.move_in_invoice_fuel_surcharge || leadData.moveInInvoiceFuelSurcharge || null,
    moveInInvoiceValuation: leadData.move_in_invoice_valuation || leadData.moveInInvoiceValuation || null,
    moveInInvoicePacking: leadData.move_in_invoice_packing || leadData.moveInInvoicePacking || null,
    moveInInvoiceAdditionalServices: leadData.move_in_invoice_additional_services || leadData.moveInInvoiceAdditionalServices || null,
    moveInInvoiceDiscount: leadData.move_in_invoice_discount || leadData.moveInInvoiceDiscount || null,
    moveInInvoiceGrandTotal: leadData.move_in_invoice_grand_total || leadData.moveInInvoiceGrandTotal || null,
    moveInInvoiceDeposit: leadData.move_in_invoice_deposit || leadData.moveInInvoiceDeposit || null,
    moveInInvoicePayment: leadData.move_in_invoice_payment || leadData.moveInInvoicePayment || null,
    moveInInvoiceBalanceDue: leadData.move_in_invoice_balance_due || leadData.moveInInvoiceBalanceDue || null,

    // Nested objects
    movingDay,
    packingDay,
    estimate,

    // Status history
    status_history: [],
  };

  // Also store individual move in fields for backward compatibility
  newLead.moveInNumTrucks = leadData.move_in_num_trucks || leadData.moveInNumTrucks || 1;
  newLead.moveInNumMovers = leadData.move_in_num_movers || leadData.moveInNumMovers || 2;
  newLead.moveInHourlyRate = leadData.move_in_hourly_rate || leadData.moveInHourlyRate || 180;
  newLead.moveInPricePerCuft = leadData.move_in_price_per_cuft || leadData.moveInPricePerCuft || 4.5;
  newLead.moveInPricePerLbs = leadData.move_in_price_per_lbs || leadData.moveInPricePerLbs || 0.74;
  newLead.moveInTravelTime = leadData.move_in_travel_time || leadData.moveInTravelTime || '1.00 h';
  newLead.moveInMovingMin = leadData.move_in_moving_min || leadData.moveInMovingMin || '3h';
  newLead.moveInMinimumCuft = leadData.move_in_minimum_cuft || leadData.moveInMinimumCuft || 0;
  newLead.moveInMinimumLbs = leadData.move_in_minimum_lbs || leadData.moveInMinimumLbs || 0;
  newLead.moveInPickupWindow = leadData.move_in_pickup_window || leadData.moveInPickupWindow || '1 day';
  newLead.moveInDeliveryWindow = leadData.move_in_delivery_window || leadData.moveInDeliveryWindow || '7 days';
  newLead.moveInMinHours = leadData.move_in_min_hours || leadData.moveInMinHours || '1.00 h';
  newLead.moveInMaxHours = leadData.move_in_max_hours || leadData.moveInMaxHours || '2.00 h';

  // Store individual fields for backward compatibility
  newLead.numMovers = leadData.num_movers || leadData.numMovers || 2;
  newLead.numTrucks = leadData.num_trucks || leadData.numTrucks || 1;
  newLead.hourlyRate = leadData.hourly_rate || leadData.hourlyRate || 180;
  newLead.volume = leadData.volume || 1000;
  newLead.weight = leadData.weight || 7000;
  newLead.pricePerCuft = leadData.price_per_cuft || leadData.pricePerCuft || 4.5;
  newLead.pricePerLbs = leadData.price_per_lbs || leadData.pricePerLbs || 0.74;
  newLead.travelTime = leadData.travel_time || leadData.travelTime || '1.00 h';
  newLead.movingMin = leadData.moving_min || leadData.movingMin || '3h';
  newLead.minimumCuft = leadData.minimum_cuft || leadData.minimumCuft || 0;
  newLead.minimumLbs = leadData.minimum_lbs || leadData.minimumLbs || 0;
  newLead.pickupWindow = leadData.pickup_window || leadData.pickupWindow || '1 day';
  newLead.earliestDeliveryDate = leadData.earliest_delivery_date || leadData.earliestDeliveryDate || '';
  newLead.deliveryWindow = leadData.delivery_window || leadData.deliveryWindow || '7 days';
  newLead.minHours = leadData.min_hours || leadData.minHours || '1.00 h';
  newLead.maxHours = leadData.max_hours || leadData.maxHours || '2.00 h';
  newLead.numPackers = leadData.num_packers || leadData.numPackers || 2;
  newLead.packingHourlyRate = leadData.packing_hourly_rate || leadData.packingHourlyRate || 120;
  newLead.packingTravelTime = leadData.packing_travel_time || leadData.packingTravelTime || '0.45 h';
  newLead.packingMinimum = leadData.packing_minimum || leadData.packingMinimum || '2h';
  newLead.packingMinHours = leadData.packing_min_hours || leadData.packingMinHours || '1.00 h';
  newLead.packingMaxHours = leadData.packing_max_hours || leadData.packingMaxHours || '2.00 h';

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