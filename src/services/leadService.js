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

    // NEW FIELDS
    estimator: leadData.estimator || '',
    survey_date: leadData.survey_date || '',
    survey_time: leadData.survey_time || '',

    // NEW: track quote_type (inventory_option)
    inventory_option: leadData.inventory_option || 'Detailed Inventory Quote',
  };

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
    // Only user-changeable fields:
    customer_name: updates.customer_name ?? existingLead.customer_name,
    customer_phone_number: updates.customer_phone_number ?? existingLead.customer_phone_number,
    customer_email: updates.customer_email ?? existingLead.customer_email,
    company_name: updates.company_name ?? existingLead.company_name,
    source: updates.source ?? existingLead.source,
    service_type: updates.service_type ?? existingLead.service_type,
    sales_name: updates.sales_name ?? existingLead.sales_name,

    // changes from LeadManagementPanel
    lead_status: updates.lead_status ?? existingLead.lead_status,
    lead_activity: updates.lead_activity ?? existingLead.lead_activity,
    next_action: updates.next_action ?? existingLead.next_action,

    estimator: updates.estimator ?? existingLead.estimator,
    survey_date: updates.survey_date ?? existingLead.survey_date,
    survey_time: updates.survey_time ?? existingLead.survey_time,

    // NEW: store the inventory_option
    inventory_option: updates.inventory_option ?? existingLead.inventory_option,
  };

  leadsData[existingIndex] = updatedLead;
  return updatedLead;
}
