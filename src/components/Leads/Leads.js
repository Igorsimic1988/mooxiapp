import React, { useState } from 'react';
import styles from './Leads.module.css'; 
import HeaderDashboard from './HeadrerDashboard.js/HeaderDashboard';
import LeadsFilterBar from './LeadsFilterBar/LeadsFilterBar';
import LeadsSearchBar from './LeadsSearchBar/LeadsSearchBar';
import LeadsActionButtons from './LeadsActionButtons/LeadsActionButtons';
import AddNewLeadButton from './AddNewLeadButton/AddNewLeadButton';
import LeadsList from './LeadsList/LeadsList';
import LeadManagementPanel from './LeadManagementPanel/LeadManagementPanel';
import actualLeads from '../../data/constants/actualLeads'; // 50 leads total

function Leads() {
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedLead, setSelectedLead] = useState(null);
  const leadsPerPage = 20;
  const totalLeads = actualLeads.length; 
  const totalPages = Math.ceil(totalLeads / leadsPerPage);

  const startIndex = (currentPage - 1) * leadsPerPage;
  const endIndex = Math.min(startIndex + leadsPerPage, totalLeads);
  const currentLeads = actualLeads.slice(startIndex, endIndex);

  const handleNextPage = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };

  const handlePrevPage = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  const handleLeadClick = (lead) => {
    setSelectedLead(lead);
  };

  return (
    <div className={styles.container}>
      <HeaderDashboard />

      {selectedLead ? (
        // If a lead is selected, show only LeadManagementPanel
        <LeadManagementPanel lead={selectedLead} onClose={() => setSelectedLead(null)} />
      ) : (
        // Otherwise, show the original layout
        <>
          <LeadsFilterBar />
          <LeadsSearchBar />

          <div className={styles.actionsContainer}>
            <LeadsActionButtons />
            <AddNewLeadButton />
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
    </div>
  );
}

export default Leads;
