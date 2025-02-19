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
    changed_at: new Date().toISOString(), // or whatever format you prefer
  });
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

    rate_type: leadData.rate_type || 'Hourly Rate',
    service_type: leadData.service_type || 'Moving',
    sales_name: leadData.sales_name || '',
    is_new: typeof leadData.is_new === 'boolean' ? leadData.is_new : true,

    // The top-level fields you already use
    lead_status: leadData.lead_status || 'New Lead',
    lead_activity: leadData.lead_activity || '',
    next_action: leadData.next_action || '',

    // Additional
    estimator: leadData.estimator || '',
    survey_date: leadData.survey_date || '',
    survey_time: leadData.survey_time || '',
    inventory_option: leadData.inventory_option || 'Detailed Inventory Quote',

    add_storage: leadData.add_storage ?? false,
    storage_items: leadData.storage_items ?? '',
    time_promised: leadData.time_promised ?? false,
    arrival_time: leadData.arrival_time ?? '',

    originStops,
    // destinationStops: ...

    // New array for storing history
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
 */
export async function updateLead(leadId, updates) {
  const idx = leadsData.findIndex((ld) => ld.lead_id === leadId);
  if (idx === -1) {
    throw new Error(`Lead with id ${leadId} not found`);
  }

  const existingLead = leadsData[idx];

  // Basic merges
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

  if (Array.isArray(updates.originStops)) {
    existingLead.originStops = updates.originStops;
  }

  // Check if lead_status changed
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

  // If any of those changed => push a new record into status_history
  if (statusChanged || activityChanged || nextActionChanged) {
    pushStatusRecord(existingLead);
  }

  leadsData[idx] = existingLead;
  return existingLead;
}
