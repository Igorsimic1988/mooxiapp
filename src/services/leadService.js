// src/services/leadService.js

import { v4 as uuidv4 } from 'uuid';
import leadsData from '../data/constants/actualLeads';

/**
 * createLead simulates creating a new lead in our local leadsData array.
 */
export async function createLead(leadData) {
  const newLeadId = uuidv4();

  // Find the highest existing job_number to generate a new job_number
  const lastJobNumber = leadsData.reduce((max, ld) => {
    return ld.job_number > max ? ld.job_number : max;
  }, 0);
  const nextJobNumber = lastJobNumber + 1;

  // Hard-code tenant_id
  const tenantId = 'tenant_1';
  const creationDateTime = new Date().toISOString();

  // If no originStops was provided => default to a single "Main Address"
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
    Array.isArray(leadData.originStops) && leadData.originStops.length > 0
      ? leadData.originStops
      : defaultStops;

  const newLead = {
    lead_id: newLeadId,
    tenant_id: tenantId,
    job_number: nextJobNumber,
    creation_date_time: creationDateTime,

    // Basic lead fields
    customer_name: leadData.customer_name || '',
    customer_phone_number: leadData.customer_phone_number || '',
    customer_email: leadData.customer_email || '',
    company_name: leadData.company_name || '',
    source: leadData.source || '',

    rate_type: leadData.rate_type || 'Hourly Rate',
    service_type: leadData.service_type || 'Moving',
    lead_status: leadData.lead_status || 'New Lead',
    lead_activity: leadData.lead_activity || '',
    next_action: leadData.next_action || 'Attempt 1',

    sales_name: leadData.sales_name || '',
    is_new: typeof leadData.is_new === 'boolean' ? leadData.is_new : true,

    // Survey fields
    estimator: leadData.estimator || '',
    survey_date: leadData.survey_date || '',
    survey_time: leadData.survey_time || '',
    inventory_option: leadData.inventory_option || 'Detailed Inventory Quote',

    // Additional fields
    add_storage: leadData.add_storage ?? false,
    storage_items: leadData.storage_items ?? '',
    time_promised: leadData.time_promised ?? false,
    arrival_time: leadData.arrival_time ?? '',

    // The array-based approach for origin addresses
    originStops,
  };

  // Optionally, we can also initialize destinationStops if needed:
  // newLead.destinationStops = leadData.destinationStops || [ { ... } ];

  leadsData.push(newLead);
  return newLead;
}

/**
 * updateLead simulates updating an existing lead in our local leadsData array.
 */
export async function updateLead(leadId, updates) {
  const idx = leadsData.findIndex((ld) => ld.lead_id === leadId);
  if (idx === -1) {
    throw new Error(`Lead with id ${leadId} not found`);
  }

  const existingLead = leadsData[idx];

  // If updates.originStops is provided, use that; otherwise keep existing.
  const updatedOriginStops = Array.isArray(updates.originStops)
    ? updates.originStops
    : existingLead.originStops;

  // If you also manage destinationStops, do similar logic for that array here:
  // const updatedDestinationStops = Array.isArray(updates.destinationStops)
  //   ? updates.destinationStops
  //   : existingLead.destinationStops;

  const updatedLead = {
    ...existingLead,

    // Basic fields
    customer_name: updates.customer_name ?? existingLead.customer_name,
    customer_phone_number: updates.customer_phone_number ?? existingLead.customer_phone_number,
    customer_email: updates.customer_email ?? existingLead.customer_email,
    company_name: updates.company_name ?? existingLead.company_name,
    source: updates.source ?? existingLead.source,
    service_type: updates.service_type ?? existingLead.service_type,
    sales_name: updates.sales_name ?? existingLead.sales_name,

    lead_status: updates.lead_status ?? existingLead.lead_status,
    lead_activity: updates.lead_activity ?? existingLead.lead_activity,
    next_action: updates.next_action ?? existingLead.next_action,

    // Survey
    estimator: updates.estimator ?? existingLead.estimator,
    survey_date: updates.survey_date ?? existingLead.survey_date,
    survey_time: updates.survey_time ?? existingLead.survey_time,
    inventory_option: updates.inventory_option ?? existingLead.inventory_option,

    // Additional
    add_storage: updates.add_storage ?? existingLead.add_storage,
    storage_items: updates.storage_items ?? existingLead.storage_items,
    time_promised: updates.time_promised ?? existingLead.time_promised,
    arrival_time: updates.arrival_time ?? existingLead.arrival_time,

    // The updated array
    originStops: updatedOriginStops,

    // If also updating destinationStops:
    // destinationStops: updatedDestinationStops,
  };

  leadsData[idx] = updatedLead;
  return updatedLead;
}
