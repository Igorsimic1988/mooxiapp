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
 * Filter leads based on current activeTab
 * - "Active Leads" => statuses in ["New Lead", "In Progress", "Quoted", "Move on Hold"], excluding In-Progress leads whose next_action="Survey Completed"
 * - "Closed Leads" => statuses in ["Bad Lead", "Declined"]
 * - "My Appointments" => status="In Progress", activity in ["In Home Estimate","Virtual Estimate"], next_action="Survey Completed"
 * - "Pending" => status="New Lead" (example assumption)
 * - "Booked" => statuses in ["Booked", "Cancaled"]
 */
function filterLeadsByTab(leads, activeTab) {
  switch (activeTab) {
    case 'Active Leads':
      return leads.filter((ld) => {
        const st = ld.lead_status;
        const na = ld.next_action;
        const isActiveStatus =
          st === 'New Lead' ||
          st === 'In Progress' ||
          st === 'Quoted' ||
          st === 'Move on Hold';
        // If In Progress => exclude if next_action=Survey Completed
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
      // status="In Progress"
      // activity in ["In Home Estimate","Virtual Estimate"]
      // next_action="Survey Completed"
      return leads.filter(
        (ld) =>
          ld.lead_status === 'In Progress' &&
          (ld.lead_activity === 'In Home Estimate' ||
            ld.lead_activity === 'Virtual Estimate') &&
          ld.next_action === 'Survey Completed'
      );

    case 'Pending':
      // For example, leads with lead_status === ''
      return leads.filter((ld) => ld.lead_status === '');

    case 'Booked':
      return leads.filter(
        (ld) => ld.lead_status === 'Booked' || ld.lead_status === 'Cancaled'
      );

    default:
      return leads;
  }
}

/**
 * Parse lead.survey_date + survey_time into a JS Date.
 * If invalid, returns null => so we can sort "My Appointments".
 */
function parseSurveyDateTime(lead) {
  if (!lead.survey_date) return null;
  const d = new Date(lead.survey_date);
  if (isNaN(d)) return null;

  // parse "07:30 AM" or similar
  if (lead.survey_time) {
    const regex = /^(\d{1,2}):(\d{2})\s?(AM|PM)$/i;
    const match = lead.survey_time.match(regex);
    if (match) {
      let hour = parseInt(match[1], 10);
      const minute = parseInt(match[2], 10);
      const ampm = match[3].toUpperCase();

      if (ampm === 'PM' && hour < 12) hour += 12;
      if (ampm === 'AM' && hour === 12) hour = 0;
      d.setHours(hour, minute, 0, 0);
    }
  }

  return d;
}

function Leads() {
  const [leads, setLeads] = useState([...actualLeads]);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const leadsPerPage = 20;

  // The current tab
  const [activeTab, setActiveTab] = useState('Active Leads');

  // If a lead is selected => show its details
  const [selectedLead, setSelectedLead] = useState(null);

  // Popup for creating/editing leads
  const [showLeadForm, setShowLeadForm] = useState(false);
  const [editingLead, setEditingLead] = useState(null);

  // On mount/resize => set app height
  useEffect(() => {
    function setAppHeight() {
      document.documentElement.style.setProperty('--app-height', `${window.innerHeight}px`);
    }
    window.addEventListener('resize', setAppHeight);
    setAppHeight();
    return () => window.removeEventListener('resize', setAppHeight);
  }, []);

  // 1) Sort by creation_date_time newest-first
  const sortedLeads = [...leads].sort(
    (a, b) => new Date(b.creation_date_time) - new Date(a.creation_date_time)
  );

  // 2) Filter by activeTab
  let filteredLeads = filterLeadsByTab(sortedLeads, activeTab);

  // 2.5) If My Appointments => further sort ascending by (survey_date + survey_time)
  if (activeTab === 'My Appointments') {
    filteredLeads.sort((a, b) => {
      const dateA = parseSurveyDateTime(a);
      const dateB = parseSurveyDateTime(b);
      if (!dateA && !dateB) return 0;
      if (!dateA) return 1;
      if (!dateB) return -1;
      return dateA - dateB; // ascending
    });
  }

  // 3) Pagination
  const totalLeads = filteredLeads.length;
  const totalPages = Math.ceil(totalLeads / leadsPerPage);
  const startIndex = (currentPage - 1) * leadsPerPage;
  const endIndex = Math.min(startIndex + leadsPerPage, totalLeads);
  const currentLeads = filteredLeads.slice(startIndex, endIndex);

  // Pagination handlers
  const handleNextPage = () => {
    if (currentPage < totalPages) setCurrentPage((prev) => prev + 1);
  };
  const handlePrevPage = () => {
    if (currentPage > 1) setCurrentPage((prev) => prev - 1);
  };

  // Selecting a lead => show LeadManagementPanel
  const handleLeadClick = (lead) => {
    setSelectedLead(lead);
  };

  // Closing panel
  const handleBack = () => {
    setSelectedLead(null);
  };

  // Creating a new lead => push to array
  const handleLeadCreated = (newLead) => {
    setLeads((prev) => [...prev, newLead]);
  };

  // Updating an existing lead
  const handleLeadUpdated = (updatedLead) => {
    setLeads((prevLeads) =>
      prevLeads.map((ld) => (ld.lead_id === updatedLead.lead_id ? updatedLead : ld))
    );
    // If that lead is currently selected => update it
    if (selectedLead && selectedLead.lead_id === updatedLead.lead_id) {
      setSelectedLead(updatedLead);
    }
  };

  // Editing existing => open popup
  const handleEditLead = (lead) => {
    setEditingLead(lead);
    setShowLeadForm(true);
  };

  // Changing tabs => reset page
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
          <LeadsFilterBar activeTab={activeTab} onTabChange={handleChangeTab} />
          <LeadsSearchBar />

          <div className={styles.actionsContainer}>
            <LeadsActionButtons />
            <AddNewLeadButton
              onOpenLeadForm={() => {
                setEditingLead(null);
                setShowLeadForm(true);
              }}
            />
          </div>

          <LeadsList
            leads={currentLeads}
            onLeadClick={handleLeadClick}
            activeTab={activeTab}
          />

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
