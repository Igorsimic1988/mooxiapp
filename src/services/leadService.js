// services/leadService.js

import { v4 as uuidv4 } from 'uuid';
import leadsData from '../data/constants/actualLeads';

/**
 * createLead simulates creating a new lead in our local leadsData array.
 */
export async function createLead(leadData) {
  const newLeadId = uuidv4();

  // Find the highest existing job_number to generate a new job_number
  const lastJobNumber = leadsData.reduce((max, lead) => {
    return lead.job_number > max ? lead.job_number : max;
  }, 0);
  const nextJobNumber = lastJobNumber + 1;

  // We'll just hard-code tenant_id
  const tenantId = 'tenant_1';
  // creation_date_time is the current date/time
  const creationDateTime = new Date().toISOString();

  const newLead = {
    lead_id: newLeadId,
    tenant_id: tenantId,
    job_number: nextJobNumber,
    creation_date_time: creationDateTime,

    customer_name: leadData.customer_name,
    customer_phone_number: leadData.customer_phone_number,
    customer_email: leadData.customer_email,
    company_name: leadData.company_name,
    source: leadData.source || '',

    rate_type: leadData.rate_type || 'Hourly Rate',
    service_type: leadData.service_type || 'Moving',
    lead_status: leadData.lead_status || 'New Lead',
    lead_activity: leadData.lead_activity || '',

    // Force 'Attempt 1' if no next_action is provided
    next_action: leadData.next_action || 'Attempt 1',

    sales_name: leadData.sales_name || '',
    is_new: leadData.is_new !== undefined ? leadData.is_new : true,
  };

  // Add the newLead to our local array
  leadsData.push(newLead);

  return newLead;
}

/**
 * updateLead simulates updating an existing lead in leadsData
 */
export async function updateLead(leadId, updates) {
  const existingIndex = leadsData.findIndex((ld) => ld.lead_id === leadId);
  if (existingIndex === -1) {
    throw new Error(`Lead with id ${leadId} not found`);
  }

  const existingLead = leadsData[existingIndex];

  const updatedLead = {
    ...existingLead,
    // Only user-changeable fields (we keep job_number, creation_date_time, etc. intact)
    customer_name: updates.customer_name,
    customer_phone_number: updates.customer_phone_number,
    customer_email: updates.customer_email,
    company_name: updates.company_name,
    source: updates.source,
    service_type: updates.service_type,
    sales_name: updates.sales_name,
    // If you wanted to allow editing lead_status or lead_activity, you'd include them here as well
  };

  // Replace the old lead with the updated one
  leadsData[existingIndex] = updatedLead;
  return updatedLead;
}
