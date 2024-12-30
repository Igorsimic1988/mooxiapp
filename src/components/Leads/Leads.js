// src/components/Leads/Leads.js

import React, { useState, useEffect } from 'react';
import styles from './Leads.module.css'; 
import HeaderDashboard from './HeadrerDashboard.js/HeaderDashboard';
import LeadsFilterBar from './LeadsFilterBar/LeadsFilterBar';
import LeadsSearchBar from './LeadsSearchBar/LeadsSearchBar';
import LeadsActionButtons from './LeadsActionButtons/LeadsActionButtons';
import AddNewLeadButton from './AddNewLeadButton/AddNewLeadButton';
import LeadsList from './LeadsList/LeadsList';
import LeadManagementPanel from './LeadManagementPanel/LeadManagementPanel';

// local leads data
import actualLeads from '../../data/constants/actualLeads';

// Popup
import LeadFormPopup from './LeadFormPopup/LeadFormPopup';

/**
 * Filter leads by the current activeTab:
 * - "Active Leads" => status in ["New Lead", "In Progress", "Quoted", "Move on Hold"]
 *                     BUT if status="In Progress" => exclude leads where next_action="Survey Completed"
 * - "Closed Leads" => status in ["Bad Lead", "Declined"]
 * - "My Appointments" => status="In Progress", activity="In Home Estimate", next_action="Survey Completed"
 * - "Pending" => status="New Lead"  (example assumption)
 * - "Booked" => status in ["Booked", "Cancaled"]
 */
function filterLeadsByTab(leads, activeTab) {
  switch (activeTab) {
    case 'Active Leads':
      return leads.filter((ld) => {
        const st = ld.lead_status;
        const na = ld.next_action;
        // Must be one of [New Lead, In Progress, Quoted, Move on Hold].
        const isActiveStatus =
          st === 'New Lead' ||
          st === 'In Progress' ||
          st === 'Quoted' ||
          st === 'Move on Hold';
        // If In Progress, exclude if next_action=Survey Completed
        if (st === 'In Progress' && na === 'Survey Completed') {
          return false;
        }
        return isActiveStatus;
      });

    case 'Closed Leads':
      return leads.filter(
        (ld) => ld.lead_status === 'Bad Lead' || ld.lead_status === 'Declined'
      );

    case 'My Appointments':
      return leads.filter(
        (ld) =>
          ld.lead_status === 'In Progress' &&
          ld.lead_activity === 'In Home Estimate' &&
          ld.next_action === 'Survey Completed'
      );

    case 'Pending':
      // THIS PART NEED TO BE UPDATED WITH THE DEPOSIT OR SIGNITURE AWAITING
      return leads.filter((ld) => ld.lead_status === '');

    case 'Booked':
      return leads.filter(
        (ld) => ld.lead_status === 'Booked' || ld.lead_status === 'Cancaled'
      );

    default:
      // If unknown => return all leads
      return leads;
  }
}

function Leads() {
  const [leads, setLeads] = useState([...actualLeads]);

  // For pagination:
  const [currentPage, setCurrentPage] = useState(1);
  const leadsPerPage = 20;

  // The tab from the filter bar
  const [activeTab, setActiveTab] = useState('Active Leads');

  // For selection & form
  const [selectedLead, setSelectedLead] = useState(null);
  const [showLeadForm, setShowLeadForm] = useState(false);

  // If we are editing an existing lead, store it here
  const [editingLead, setEditingLead] = useState(null);

  useEffect(() => {
    function setAppHeight() {
      document.documentElement.style.setProperty('--app-height', `${window.innerHeight}px`);
    }
    window.addEventListener('resize', setAppHeight);
    setAppHeight();
    return () => window.removeEventListener('resize', setAppHeight);
  }, []);

  // 1) Sort leads newest-first
  const sortedLeads = [...leads].sort(
    (a, b) => new Date(b.creation_date_time) - new Date(a.creation_date_time)
  );

  // 2) Filter leads based on activeTab
  const filteredLeads = filterLeadsByTab(sortedLeads, activeTab);

  // 3) Apply pagination on the already-filtered leads
  const totalLeads = filteredLeads.length;
  const totalPages = Math.ceil(totalLeads / leadsPerPage);

  const startIndex = (currentPage - 1) * leadsPerPage;
  const endIndex = Math.min(startIndex + leadsPerPage, totalLeads);
  const currentLeads = filteredLeads.slice(startIndex, endIndex);


  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage((prev) => prev + 1);
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage((prev) => prev - 1);
    }
  };

  // If user clicks a lead => show that lead's details
  const handleLeadClick = (lead) => {
    setSelectedLead(lead);
  };

  const handleBack = () => {
    setSelectedLead(null);
  };

  // Creating a brand new lead
  const handleLeadCreated = (newLead) => {
    setLeads((prev) => [...prev, newLead]);
  };

  // Updating an existing lead
  const handleLeadUpdated = (updatedLead) => {
    setLeads((prevLeads) =>
      prevLeads.map((ld) => (ld.lead_id === updatedLead.lead_id ? updatedLead : ld))
    );
    if (selectedLead && selectedLead.lead_id === updatedLead.lead_id) {
      setSelectedLead(updatedLead);
    }
  };

  // Trigger "edit" mode
  const handleEditLead = (lead) => {
    setEditingLead(lead);
    setShowLeadForm(true);  // open the popup
  };

  // When user changes tabs in the filter bar => reset page to 1
  const handleChangeTab = (newTab) => {
    setActiveTab(newTab);
    setCurrentPage(1);
  };

  return (
    <div className={styles.container}>
      <HeaderDashboard isLeadSelected={!!selectedLead} onBack={handleBack} />

      {selectedLead ? (
        <LeadManagementPanel
          lead={selectedLead}
          onClose={() => setSelectedLead(null)}
          onEditLead={handleEditLead}
          onLeadUpdated={handleLeadUpdated}
        />
      ) : (
        <>
          {/* Provide the currently-active tab + a callback so we can track it */}
          <LeadsFilterBar activeTab={activeTab} onTabChange={handleChangeTab} />

          <LeadsSearchBar />

          <div className={styles.actionsContainer}>
            <LeadsActionButtons />
            {/* For a brand new lead, ensure editingLead is null */}
            <AddNewLeadButton
              onOpenLeadForm={() => {
                setEditingLead(null);
                setShowLeadForm(true);
              }}
            />
          </div>

          {/* Pass just the currentLeads to the LeadsList */}
          <LeadsList
  leads={currentLeads}
  onLeadClick={handleLeadClick}
  activeTab={activeTab}   // NEW: pass the active tab here
/>

          {/* Pagination for the filtered leads only */}
          <div className={styles.paginationContainer}>
            <span className={styles.paginationText}>
              {`${startIndex + 1}-${endIndex} of ${totalLeads} leads`}
            </span>
            <div className={styles.paginationButtons}>
              <button
                className={styles.pageButton}
                onClick={handlePrevPage}
                disabled={currentPage === 1}
              >
                &lt;
              </button>
              <button
                className={styles.pageButton}
                onClick={handleNextPage}
                disabled={currentPage === totalPages}
              >
                &gt;
              </button>
            </div>
          </div>
        </>
      )}

      {showLeadForm && (
        <LeadFormPopup
          onClose={() => setShowLeadForm(false)}
          onLeadCreated={handleLeadCreated}
          editingLead={editingLead}
          onLeadUpdated={handleLeadUpdated}
        />
      )}
    </div>
  );
}

export default Leads;
