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
 * Based on current activeTab, filter the leads.
 * - "Active Leads" => status in ["New Lead", "In Progress", "Quoted", "Move on Hold"],
 *                     excluding In-Progress leads whose next_action="Survey Completed"
 * - "Closed Leads" => status in ["Bad Lead", "Declined"]
 * - "My Appointments" => status="In Progress", activity="In Home Estimate", next_action="Survey Completed"
 * - "Pending" => status="New Lead" (example assumption)
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
      return leads.filter(
        (ld) =>
          ld.lead_status === 'In Progress' &&
          ld.lead_activity === 'In Home Estimate' &&
          ld.next_action === 'Survey Completed'
      );

    case 'Pending':
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
 * Helper to parse lead's survey_date + survey_time into a JS Date (or null if invalid).
 * 
 * Example:
 *   lead.survey_date = "Sat Jan 18 2025"
 *   lead.survey_time = "10:30 AM"
 */
function parseSurveyDateTime(lead) {
  if (!lead.survey_date) return null; // no date => can't parse
  const d = new Date(lead.survey_date); // e.g. "Sat Jan 18 2025"
  if (isNaN(d)) return null; // invalid date string

  // If there's a time string like "10:30 AM", parse it:
  if (lead.survey_time) {
    const timeRegex = /^(\d{1,2}):(\d{2})\s?(AM|PM)$/i;
    const match = lead.survey_time.match(timeRegex);
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

  // For pagination
  const [currentPage, setCurrentPage] = useState(1);
  const leadsPerPage = 20;

  // The tab from the filter bar
  const [activeTab, setActiveTab] = useState('Active Leads');

  // If a lead is selected => show its details (LeadManagementPanel)
  const [selectedLead, setSelectedLead] = useState(null);

  // For the popup (creating/editing leads)
  const [showLeadForm, setShowLeadForm] = useState(false);
  const [editingLead, setEditingLead] = useState(null);

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

  // 2) Filter leads based on activeTab
  let filteredLeads = filterLeadsByTab(sortedLeads, activeTab);

  // 2.5) If My Appointments => further sort ascending by (survey_date + survey_time),
  //      so soonest appointment is at the top
  if (activeTab === 'My Appointments') {
    filteredLeads.sort((a, b) => {
      const dateA = parseSurveyDateTime(a);
      const dateB = parseSurveyDateTime(b);

      // If missing date => put them last
      if (!dateA && !dateB) return 0;
      if (!dateA) return 1; // a goes after b
      if (!dateB) return -1; // a goes before b

      // otherwise ascending
      return dateA - dateB;
    });
  }

  // 3) Apply pagination
  const totalLeads = filteredLeads.length;
  const totalPages = Math.ceil(totalLeads / leadsPerPage);
  const startIndex = (currentPage - 1) * leadsPerPage;
  const endIndex = Math.min(startIndex + leadsPerPage, totalLeads);
  const currentLeads = filteredLeads.slice(startIndex, endIndex);

  // Pagination handlers
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

  // If user clicks a lead => open that lead in the LeadManagementPanel
  const handleLeadClick = (lead) => {
    setSelectedLead(lead);
  };

  // If user clicks "Back" => close the details panel
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
    // If we are showing that lead => update it there too
    if (selectedLead && selectedLead.lead_id === updatedLead.lead_id) {
      setSelectedLead(updatedLead);
    }
  };

  // "Edit" => open popup
  const handleEditLead = (lead) => {
    setEditingLead(lead);
    setShowLeadForm(true);
  };

  // If user changes tabs => reset page to 1
  const handleChangeTab = (newTab) => {
    setActiveTab(newTab);
    setCurrentPage(1);
  };

  return (
    <div className={styles.container}>
      <HeaderDashboard isLeadSelected={!!selectedLead} onBack={handleBack} />

      {selectedLead ? (
        // If a lead is selected => show details
        <LeadManagementPanel
          lead={selectedLead}
          onClose={() => setSelectedLead(null)}
          onEditLead={handleEditLead}
          onLeadUpdated={handleLeadUpdated}
        />
      ) : (
        // Otherwise => normal list view
        <>
          <LeadsFilterBar activeTab={activeTab} onTabChange={handleChangeTab} />
          <LeadsSearchBar />

          <div className={styles.actionsContainer}>
            <LeadsActionButtons />
            <AddNewLeadButton
              onOpenLeadForm={() => {
                setEditingLead(null); // new lead
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
