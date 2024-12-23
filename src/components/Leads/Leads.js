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
import actualLeads from '../../data/constants/actualLeads';

// 1) Import your LeadFormPopup
import LeadFormPopup from './LeadFormPopup/LeadFormPopup';

function Leads() {
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedLead, setSelectedLead] = useState(null);
  const leadsPerPage = 20;
  const totalLeads = actualLeads.length;
  const totalPages = Math.ceil(totalLeads / leadsPerPage);

  const startIndex = (currentPage - 1) * leadsPerPage;
  const endIndex = Math.min(startIndex + leadsPerPage, totalLeads);
  const currentLeads = actualLeads.slice(startIndex, endIndex);

  // 2) Create state to show/hide LeadFormPopup
  const [showLeadForm, setShowLeadForm] = useState(false);

  const handleNextPage = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };

  const handlePrevPage = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  const handleLeadClick = (lead) => {
    setSelectedLead(lead);
  };

  // Dynamically set the viewport height to avoid mobile issues
  useEffect(() => {
    function setAppHeight() {
      document.documentElement.style.setProperty('--app-height', `${window.innerHeight}px`);
    }
    window.addEventListener('resize', setAppHeight);
    setAppHeight();
    return () => window.removeEventListener('resize', setAppHeight);
  }, []);

  const handleBack = () => {
    setSelectedLead(null);
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
            {/*
                3) Pass a callback to AddNewLeadButton 
                that sets showLeadForm to true
            */}
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

      {/*
        4) Conditionally render LeadFormPopup if showLeadForm is true
          - Pass onClose callback to hide it again
      */}
      {showLeadForm && (
        <LeadFormPopup onClose={() => setShowLeadForm(false)} />
      )}
    </div>
  );
}

export default Leads;
