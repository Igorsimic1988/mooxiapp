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

// Instead of using `actualLeads` directly for rendering,
// we store them in local state:
import actualLeads from '../../data/constants/actualLeads';

// Import the LeadFormPopup
import LeadFormPopup from './LeadFormPopup/LeadFormPopup';

function Leads() {
  // 1) Put the actualLeads array into local state
  const [leads, setLeads] = useState([...actualLeads]);

  // Pagination:
  const [currentPage, setCurrentPage] = useState(1);
  const leadsPerPage = 20;

  // 2) State for selected lead & showing form
  const [selectedLead, setSelectedLead] = useState(null);
  const [showLeadForm, setShowLeadForm] = useState(false);

  // This effect sets --app-height for mobile responsiveness
  useEffect(() => {
    function setAppHeight() {
      document.documentElement.style.setProperty('--app-height', `${window.innerHeight}px`);
    }
    window.addEventListener('resize', setAppHeight);
    setAppHeight();
    return () => window.removeEventListener('resize', setAppHeight);
  }, []);

  // Sort the entire leads array in descending order (newest first).
  // Then apply pagination to that sorted array.
  const sortedLeads = [...leads].sort(
    (a, b) => new Date(b.creation_date_time) - new Date(a.creation_date_time)
  );

  const totalLeads = sortedLeads.length;
  const totalPages = Math.ceil(totalLeads / leadsPerPage);

  const startIndex = (currentPage - 1) * leadsPerPage;
  const endIndex = Math.min(startIndex + leadsPerPage, totalLeads);
  const currentLeads = sortedLeads.slice(startIndex, endIndex);

  // Pagination handlers
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

  // Callback that the form calls after creating a new lead
  const handleLeadCreated = (newLead) => {
    // Insert new lead, then let the array remain sorted by date.
    // Because we'll sort them again on each render (in sortedLeads).
    setLeads((prev) => [...prev, newLead]);
    // We do NOT reset `currentPage` => You stay where you are.
  };

  return (
    <div className={styles.container}>
      <HeaderDashboard isLeadSelected={!!selectedLead} onBack={handleBack} />

      {selectedLead ? (
        <LeadManagementPanel 
          lead={selectedLead} 
          onClose={() => setSelectedLead(null)} 
        />
      ) : (
        <>
          <LeadsFilterBar />
          <LeadsSearchBar />

          <div className={styles.actionsContainer}>
            <LeadsActionButtons />
            <AddNewLeadButton onOpenLeadForm={() => setShowLeadForm(true)} />
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
        />
      )}
    </div>
  );
}

export default Leads;
