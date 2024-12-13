import React from 'react';
import styles from './LeadManagementPanel.module.css';

function LeadManagementPanel({ lead, onClose }) {
  return (
    <div className={styles.panelContainer}>
      <div className={styles.header}>
        <h2 className={styles.title}>Managing Lead: {lead.customer_name}</h2>
        <button className={styles.closeButton} onClick={onClose}>X</button>
      </div>
      <div className={styles.content}>
        {/* Here you can start building out the details, forms, pricing, etc. */}
        <p>Lead ID: {lead.lead_id}</p>
        <p>Tenant: {lead.tenant_id}</p>
        <p>Company: {lead.company_name}</p>
        <p>Job Number: {lead.job_number}</p>
        <p>Move Type: {lead.move_type}</p>
        <p>Phone: {lead.customer_phone_number}</p>
        <p>Status: {lead.lead_status}</p>
        <p>Next Action: {lead.next_action}</p>
        <p>Sales Name: {lead.sales_name}</p>
      </div>
    </div>
  );
}

export default LeadManagementPanel;
