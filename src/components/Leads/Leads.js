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

function Leads() {
  const [leads, setLeads] = useState([...actualLeads]);

  // For pagination:
  const [currentPage, setCurrentPage] = useState(1);
  const leadsPerPage = 20;

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

  // Sort leads newest first
  const sortedLeads = [...leads].sort(
    (a, b) => new Date(b.creation_date_time) - new Date(a.creation_date_time)
  );

  const totalLeads = sortedLeads.length;
  const totalPages = Math.ceil(totalLeads / leadsPerPage);

  const startIndex = (currentPage - 1) * leadsPerPage;
  const endIndex = Math.min(startIndex + leadsPerPage, totalLeads);
  const currentLeads = sortedLeads.slice(startIndex, endIndex);

  const handleNextPage = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };

  const handlePrevPage = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

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
    // Also update the currently selected lead if that’s the one we edited
    if (selectedLead && selectedLead.lead_id === updatedLead.lead_id) {
      setSelectedLead(updatedLead);
    }
  };

  // This triggers "edit mode"
  const handleEditLead = (lead) => {
    setEditingLead(lead);
    setShowLeadForm(true);  // open the popup
  };

  return (
    <div className={styles.container}>
      <HeaderDashboard isLeadSelected={!!selectedLead} onBack={handleBack} />

      {selectedLead ? (
        <LeadManagementPanel
          lead={selectedLead}
          onClose={() => setSelectedLead(null)}
          onEditLead={handleEditLead}    // pass the callback
        />
      ) : (
        <>
          <LeadsFilterBar />
          <LeadsSearchBar />

          <div className={styles.actionsContainer}>
            <LeadsActionButtons />
            {/* For a brand new lead, we ensure editingLead is null */}
            <AddNewLeadButton
              onOpenLeadForm={() => {
                setEditingLead(null); // brand new
                setShowLeadForm(true);
              }}
            />
          </div>

          <LeadsList leads={currentLeads} onLeadClick={handleLeadClick} />

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
          editingLead={editingLead}            // Pass it here
          onLeadUpdated={handleLeadUpdated}    // so we can update
        />
      )}
    </div>
  );
}

export default Leads;
