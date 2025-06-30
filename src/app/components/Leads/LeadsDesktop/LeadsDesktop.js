"use client";

import React, { useState, useEffect, useRef, useMemo, useLayoutEffect } from "react";
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
import Inventory from "../LeadManagementPanel/MoveDetailsPanel/OriginDetails/Inventory/Inventory";

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
  
  // Inventory states
  showInventoryFullScreen,
  setShowInventoryFullScreen,
  inventoryScrollPosition,
  setInventoryScrollPosition,
  inventoryRoom,
  setInventoryRoom,
  mainContainerRef,
  
  // Desktop scroll states (NEW)
  desktopScrollPosition,
  setDesktopScrollPosition,
  
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
  closeInventoryFullScreen,
  handleLeadRefetch,
  
  // Computed values
  currentLeads,
  totalLeads,
  totalPages,
  startIndex,
  endIndex,
  filterCount,
  
  // Animation
  recentlyUpdatedLeadId,
  setRecentlyUpdatedLeadId,
}) {
  const leadsListRef = useRef(null);
  const [scrollPosition, setScrollPosition] = useState(0);
  const leadManagementRef = useRef(null);

  // Save scroll position before opening inventory
  const handleOpenInventoryFullScreen = () => {
    if (leadManagementRef.current) {
      const allElements = leadManagementRef.current.querySelectorAll('*');
      for (let el of allElements) {
        if (el.scrollTop > 0) {
          setDesktopScrollPosition(el.scrollTop);
          
          break;
        }
      }
    }
    openInventoryFullScreen();
  };

  // Restore scroll position when returning from inventory
  useEffect(() => {
    if (!showInventoryFullScreen && desktopScrollPosition > 0 && leadManagementRef.current) {
      const restoreScroll = () => {
        const allElements = leadManagementRef.current.querySelectorAll('*');
        for (let el of allElements) {
          if (el.scrollHeight > el.clientHeight) {
            el.scrollTop = desktopScrollPosition;
            if (el.scrollTop > 0) {
            
              setDesktopScrollPosition(0); // Reset after restore
              return true;
            }
          }
        }
        return false;
      };

      // Try immediately
      if (!restoreScroll()) {
        // If failed, try again after delays
        const timeouts = [50, 100, 200, 300, 500];
        timeouts.forEach(delay => {
          setTimeout(restoreScroll, delay);
        });
      }
    }
  }, [showInventoryFullScreen, desktopScrollPosition, setDesktopScrollPosition]);

  // Handle lead click
  const handleLeadClick = (lead) => {
    if (transferModeActive && selectedSalesRepForTransfer) {
      handleLeadUpdated(lead.id, { salesName: selectedSalesRepForTransfer });
      
      setRecentlyUpdatedLeadId(lead.id);
      
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

  // Handle transfer lead
  const handleTransferLead = (salesRepName) => {
    setSelectedSalesRepForTransfer(salesRepName);
    console.log(`Transfer mode ready: Sales rep ${salesRepName} selected`);
  };

  // Pagination handlers
  const handleNextPage = () => {
    if (currentPage < totalPages) setCurrentPage((prev) => prev + 1);
  };

  const handlePrevPage = () => {
    if (currentPage > 1) setCurrentPage((prev) => prev - 1);
  };

  // Handle back from inventory
  const handleBack = () => {
    setSelectedLead(null);
    setInventoryScrollPosition(0);
    setTimeout(() => {
      if (leadsListRef.current) {
        leadsListRef.current.scrollTop = scrollPosition;
      }
    }, 0);
  };

  // If showing the Inventory
  if (showInventoryFullScreen) {
    return (
      <div className={styles.container} ref={mainContainerRef}>
        <HeaderDashboard
          isLeadSelected={!!selectedLead}
          onBack={handleBack}
          isInInventory
          inRoom={!!inventoryRoom}
          roomName={inventoryRoom?.name || ""}
          onRoomBack={() => setInventoryRoom(null)}
          onCloseInventory={closeInventoryFullScreen}
          isDesktopInventory={true}
        />
        <Inventory
          lead={selectedLead}
          onCloseInventory={closeInventoryFullScreen}
          inventoryRoom={inventoryRoom}
          setInventoryRoom={setInventoryRoom}
        />
      </div>
    );
  }

  // Normal desktop view
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
              recentlyUpdatedLeadId={recentlyUpdatedLeadId}
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
          <div 
            className={`${styles.leadManagementWrapper} ${!selectedLead ? styles.noLead : ''}`}
            ref={leadManagementRef}
          >
            {selectedLead ? (
              <LeadManagementPanel
                lead={selectedLead}
                onClose={() => setSelectedLead(null)}
                onEditLead={handleEditLead}
                onLeadUpdated={handleLeadUpdated}
                onInventoryFullScreen={handleOpenInventoryFullScreen}
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