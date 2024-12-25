// services/leadService.js

import { v4 as uuidv4 } from 'uuid';
import leadsData from '../data/constants/actualLeads';

/**
 * createLead simulates creating a new lead "in the database"
 * by pushing to our local leadsData array. In the future, 
 * you can replace this with a real API call (POST /api/leads).
 *
 * @param {Object} leadData    - The user-provided form data.
 * @returns {Object} newLead   - The newly created lead object.
 */
export async function createLead(leadData) {
  // 1) Generate a new UUID for lead_id.
  const newLeadId = uuidv4();

  // 2) Find the highest existing job_number in leadsData.
  const lastJobNumber = leadsData.reduce((max, lead) => {
    return lead.job_number > max ? lead.job_number : max;
  }, 0);
  const nextJobNumber = lastJobNumber + 1;

  // 3) Hard-code tenant_id (for now).
  const tenantId = 'tenant_1';

  // 4) creation_date_time is the current date/time (ISO string).
  const creationDateTime = new Date().toISOString();

  // 5) Build the newLead object:
  const newLead = {
    lead_id: newLeadId,
    tenant_id: tenantId,
    job_number: nextJobNumber,
    creation_date_time: creationDateTime,

    // Make sure to include the company_name:
    company_name: leadData.company_name || '',

    // Basic contact info from the LeadFormPopup inputs:
    customer_name: leadData.customer_name,
    customer_phone_number: leadData.customer_phone_number,
    customer_email: leadData.customer_email,

    // The fields below can be assigned from your form data or logic.
    rate_type: leadData.rate_type,        // or some logic 
    service_type: leadData.service_type,  // e.g., "Moving"
    lead_status: leadData.lead_status,    // e.g., "In Progress"
    lead_activity: leadData.lead_activity,// e.g., "Contacting"
    next_action: leadData.next_action,    // e.g., "Attempt 1"

    // For now, pass the selected sales rep from the form or logic:
    sales_name: leadData.sales_name,

    // is_new can also come from your logic or default to true.
    is_new: leadData.is_new,
  };

  // 6) “Insert” the lead into our local array:
  leadsData.push(newLead);

  // 7) Return the newly created lead object
  return newLead;
}
