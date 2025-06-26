"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import styles from "./LeadsDesktop.module.css";

import HeaderDashboard from "../HeaderDashboard/HeaderDashboard";
import LeadsFilterBar from "../LeadsFilterBar/LeadsFilterBar";
import LeadsSearchBar from "../LeadsSearchBar/LeadsSearchBar";
import LeadsActionButtons from "../LeadsActionButtons/LeadsActionButtons";
import AddNewLeadButton from "../AddNewLeadButton/AddNewLeadButton";
import LeadsList from "../LeadsList/LeadsList";
import LeadManagementPanel from "../LeadManagementPanel/LeadManagementPanel";
import LeadFormPopup from "../LeadFormPopup/LeadFormPopup";
import FilterButtonPopup from "../FilterButtonPopup/FilterButtonPopup";

function LeadsDesktop({
  // Data
  leads,
  refetch,
  
  // State
  activeTab,
  setActiveTab,
  searchQuery,
  setSearchQuery,
  selectedLead,
  setSelectedLead,
  editingLead,
  setEditingLead,
  transferModeActive,
  setTransferModeActive,
  selectedSalesRepForTransfer,
  setSelectedSalesRepForTransfer,
  currentPage,
  setCurrentPage,
  leadsPerPage,
  showLeadForm,
  setShowLeadForm,
  showFilterPopup,
  setShowFilterPopup,
  
  // Filter states
  selectedCompany,
  setSelectedCompany,
  selectedSalesRep,
  setSelectedSalesRep,
  selectedMode,
  setSelectedMode,
  selectedWorkflow,
  setSelectedWorkflow,
  selectedWhere,
  setSelectedWhere,
  fromDate,
  setFromDate,
  toDate,
  setToDate,
  statusOptions,
  checkedStatuses,
  setCheckedStatuses,
  
  // Handlers
  handleLeadCreated,
  handleLeadUpdated,
  handleEditLead,
  openInventoryFullScreen,
  
  // Computed values
  currentLeads,
  totalLeads,
  totalPages,
  startIndex,
  endIndex,
  filterCount,
  
  // ANIMATION PROPS
  recentlyUpdatedLeadId,
  setRecentlyUpdatedLeadId,
}) {
  const leadsListRef = useRef(null);
  const [scrollPosition, setScrollPosition] = useState(0);

  // Handle lead click - UPDATED WITH ANIMATION
  const handleLeadClick = (lead) => {
    if (transferModeActive && selectedSalesRepForTransfer) {
      handleLeadUpdated(lead.id, { salesName: selectedSalesRepForTransfer });
      
      // Track this lead as recently updated for animation
      setRecentlyUpdatedLeadId(lead.id);
      
      // Clear the animation after 1.5 seconds
      setTimeout(() => {
        setRecentlyUpdatedLeadId(null);
      }, 400);
      
      console.log(`Transferred lead ${lead.jobNumber} to ${selectedSalesRepForTransfer}`);
    } else {
      if (leadsListRef.current) {
        setScrollPosition(leadsListRef.current.scrollTop);
      }
      setSelectedLead(lead);
    }
  };

  // Handle tab change
  const handleChangeTab = (newTab) => {
    setActiveTab(newTab);
    setCurrentPage(1);
  };

  // Handle transfer mode
  const handleTransferModeChange = (isActive) => {
    setTransferModeActive(isActive);
    if (!isActive) {
      setSelectedSalesRepForTransfer("");
    }
  };

  // Handle transfer lead - FIXED: NO AUTOMATIC TRANSFER
  const handleTransferLead = (salesRepName) => {
    // Store the selected sales rep for transfer
    setSelectedSalesRepForTransfer(salesRepName);
    
    // REMOVED: The automatic transfer of selected lead
    // Now the transfer only happens when clicking on a card
    
    console.log(`Transfer mode ready: Sales rep ${salesRepName} selected`);
  };

  // Pagination handlers
  const handleNextPage = () => {
    if (currentPage < totalPages) setCurrentPage((prev) => prev + 1);
  };

  const handlePrevPage = () => {
    if (currentPage > 1) setCurrentPage((prev) => prev - 1);
  };

  return (
    <div className={styles.container}>
      {/* Sidebar - 80px wide */}
      <div className={styles.sidebar}>
        {/* Sidebar content will be added later */}
      </div>

      {/* Main content area */}
      <div className={styles.contentArea}>
        {/* Top section with filters and actions */}
        <div className={styles.topSection}>
          <LeadsFilterBar
            activeTab={activeTab}
            onTabChange={handleChangeTab}
          />
          
          {/* Bottom spacing bar - 30px height */}
          <div className={styles.filterBottomBar}></div>

          {/* Actions row - horizontal on desktop */}
          <div className={styles.actionsRow}>
            <div className={styles.actionsContainer}>
              <LeadsActionButtons
                onOpenFilterPopup={() => setShowFilterPopup(true)}
                filterCount={filterCount}
                onTransferLead={handleTransferLead}
                onTransferModeChange={handleTransferModeChange}
              />
            </div>

            <div className={styles.searchAndAddContainer}>
              <div className={styles.searchContainer}>
                <LeadsSearchBar
                  searchQuery={searchQuery}
                  setSearchQuery={setSearchQuery}
                />
              </div>
              
              <div className={styles.addButtonContainer}>
                <AddNewLeadButton
                  onOpenLeadForm={() => {
                    setEditingLead(null);
                    setShowLeadForm(true);
                  }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Bottom section - side by side */}
        <div className={styles.bottomSection}>
          {/* Left side - Leads list */}
          <div className={styles.leadsListWrapper}>
            <LeadsList
              leads={currentLeads}
              onLeadClick={handleLeadClick}
              activeTab={searchQuery.trim() ? "Search Results" : activeTab}
              leadsListRef={leadsListRef}
              onScroll={(e) => setScrollPosition(e.target.scrollTop)}
              transferModeActive={transferModeActive}
              selectedLeadJobNumber={selectedLead?.jobNumber}
              recentlyUpdatedLeadId={recentlyUpdatedLeadId} // PASS ANIMATION PROP
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
          </div>

          {/* Right side - Lead management panel */}
          <div className={`${styles.leadManagementWrapper} ${!selectedLead ? styles.noLead : ''}`}>
            {selectedLead ? (
              <LeadManagementPanel
                lead={selectedLead}
                onClose={() => setSelectedLead(null)}
                onEditLead={handleEditLead}
                onLeadUpdated={handleLeadUpdated}
                onInventoryFullScreen={openInventoryFullScreen}
              />
            ) : (
              <div className={styles.noLeadMessage}>Select a lead to view details</div>
            )}
          </div>
        </div>
      </div>

      {/* Popups */}
      {showLeadForm && (
        <LeadFormPopup
          onClose={() => setShowLeadForm(false)}
          onLeadCreated={handleLeadCreated}
          editingLead={editingLead}
          onLeadUpdated={handleLeadUpdated}
        />
      )}

      {showFilterPopup && (
        <FilterButtonPopup
          onClose={() => setShowFilterPopup(false)}
          selectedCompany={selectedCompany}
          setSelectedCompany={setSelectedCompany}
          selectedSalesRep={selectedSalesRep}
          setSelectedSalesRep={setSelectedSalesRep}
          selectedMode={selectedMode}
          setSelectedMode={setSelectedMode}
          selectedWorkflow={selectedWorkflow}
          setSelectedWorkflow={setSelectedWorkflow}
          selectedWhere={selectedWhere}
          setSelectedWhere={setSelectedWhere}
          fromDate={fromDate}
          setFromDate={setFromDate}
          toDate={toDate}
          setToDate={setToDate}
          statusOptions={statusOptions}
          checkedStatuses={checkedStatuses}
          setCheckedStatuses={setCheckedStatuses}
          filterCount={filterCount}
        />
      )}
    </div>
  );
}

export default LeadsDesktop;