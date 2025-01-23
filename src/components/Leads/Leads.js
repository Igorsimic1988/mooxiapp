// src/components/Leads/Leads.js
import React, { useState, useEffect, useRef } from 'react';
import styles from './Leads.module.css';
import HeaderDashboard from './HeadrerDashboard.js/HeaderDashboard';
import LeadsFilterBar from './LeadsFilterBar/LeadsFilterBar';
import LeadsSearchBar from './LeadsSearchBar/LeadsSearchBar';
import LeadsActionButtons from './LeadsActionButtons/LeadsActionButtons';
import AddNewLeadButton from './AddNewLeadButton/AddNewLeadButton';
import LeadsList from './LeadsList/LeadsList';
import LeadManagementPanel from './LeadManagementPanel/LeadManagementPanel';

// Import Inventory (full-screen)
import Inventory from './LeadManagementPanel/MoveDetailsPanel/OriginDetails/Inventory/Inventory';

// local leads data
import actualLeads from '../../data/constants/actualLeads';

// Popup
import LeadFormPopup from './LeadFormPopup/LeadFormPopup';

/**
 * Filter leads by activeTab
 */
function filterLeadsByTab(leads, activeTab) {
  if (!Array.isArray(leads)) return [];
  switch (activeTab) {
    case 'Active Leads':
      return leads.filter((ld) => {
        const st = ld.lead_status;
        const na = ld.next_action;
        const isActive =
          st === 'New Lead' ||
          st === 'In Progress' ||
          st === 'Quoted' ||
          st === 'Move on Hold';
        // If "In Progress" => exclude if next_action="Survey Completed"
        if (st === 'In Progress' && na === 'Survey Completed') {
          return false;
        }
        return isActive;
      });
    case 'Closed Leads':
      return leads.filter(
        (ld) => ld.lead_status === 'Bad Lead' || ld.lead_status === 'Declined'
      );
    case 'My Appointments':
      return leads.filter(
        (ld) =>
          ld.lead_status === 'In Progress' &&
          (ld.lead_activity === 'In Home Estimate' ||
            ld.lead_activity === 'Virtual Estimate') &&
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
 * Parse lead.survey_date + survey_time => JS Date
 */
function parseSurveyDateTime(lead) {
  if (!lead || !lead.survey_date) return null;
  const d = new Date(lead.survey_date);
  if (isNaN(d)) return null;

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
  // Defensive
  const [leads, setLeads] = useState(Array.isArray(actualLeads) ? [...actualLeads] : []);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const leadsPerPage = 20;

  // The current tab
  const [activeTab, setActiveTab] = useState('Active Leads');

  // If a lead is selected => show details
  const [selectedLead, setSelectedLead] = useState(null);

  // Scroll tracking
  const leadsListRef = useRef(null);
  const [scrollPosition, setScrollPosition] = useState(0);

  // Popup
  const [showLeadForm, setShowLeadForm] = useState(false);
  const [editingLead, setEditingLead] = useState(null);

  // If true => show Inventory in full-screen
  const [showInventoryFullScreen, setShowInventoryFullScreen] = useState(false);

  // LIFTED STATE => for Inventory
  const [inventoryRoom, setInventoryRoom] = useState(null);

  // On mount => set app height
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

  // 2) Filter by activeTab
  let filteredLeads = filterLeadsByTab(sortedLeads, activeTab);

  // 2.5) If My Appointments => sort ascending by date/time
  if (activeTab === 'My Appointments') {
    filteredLeads.sort((a, b) => {
      const dateA = parseSurveyDateTime(a);
      const dateB = parseSurveyDateTime(b);
      if (!dateA && !dateB) return 0;
      if (!dateA) return 1;
      if (!dateB) return -1;
      return dateA - dateB;
    });
  }

  // 3) Pagination
  const totalLeads = filteredLeads.length;
  const totalPages = Math.ceil(totalLeads / leadsPerPage);
  const startIndex = (currentPage - 1) * leadsPerPage;
  const endIndex = Math.min(startIndex + leadsPerPage, totalLeads);
  const currentLeads = filteredLeads.slice(startIndex, endIndex);

  const handleNextPage = () => {
    if (currentPage < totalPages) setCurrentPage((prev) => prev + 1);
  };
  const handlePrevPage = () => {
    if (currentPage > 1) setCurrentPage((prev) => prev - 1);
  };

  // Selecting a lead => show details
  const handleLeadClick = (lead) => {
    if (leadsListRef.current) {
      setScrollPosition(leadsListRef.current.scrollTop);
    }
    setSelectedLead(lead);
  };

  // Closing lead => arrow
  const handleBack = () => {
    setSelectedLead(null);
    setTimeout(() => {
      if (leadsListRef.current) {
        leadsListRef.current.scrollTop = scrollPosition;
      }
    }, 0);
  };

  // Create lead
  const handleLeadCreated = (newLead) => {
    setLeads((prev) => [...prev, newLead]);
  };

  // Update lead
  const handleLeadUpdated = (updatedLead) => {
    setLeads((prevLeads) =>
      prevLeads.map((ld) => (ld.lead_id === updatedLead.lead_id ? updatedLead : ld))
    );
    if (selectedLead && selectedLead.lead_id === updatedLead.lead_id) {
      setSelectedLead(updatedLead);
    }
  };

  // Editing lead => open popup
  const handleEditLead = (lead) => {
    setEditingLead(lead);
    setShowLeadForm(true);
  };

  // Change tab => reset page
  const handleChangeTab = (newTab) => {
    setActiveTab(newTab);
    setCurrentPage(1);
  };

  // Inventory => open or close
  const openInventoryFullScreen = () => {
    setShowInventoryFullScreen(true);
  };

  const closeInventoryFullScreen = () => {
    setShowInventoryFullScreen(false);
  };

  // Decide if we are in "desktop" mode
  const isDesktopScreen = window.innerWidth >= 1024;

  // If Inventory is open => show it full-screen
  if (showInventoryFullScreen) {
    return (
      <div className={styles.container}>
        <HeaderDashboard
          isLeadSelected={!!selectedLead}
          onBack={handleBack}
          // Inventory arrow logic
          isInInventory
          inRoom={!!inventoryRoom}
          roomName={inventoryRoom?.name || ''}
          onRoomBack={() => setInventoryRoom(null)}
          onCloseInventory={closeInventoryFullScreen}
          // We pass this so the arrow knows what to do:
          isDesktopInventory={isDesktopScreen}
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

  // Otherwise => normal leads UI
  return (
    <div className={styles.container}>
      <HeaderDashboard
        isLeadSelected={!!selectedLead}
        onBack={handleBack}
        isInInventory={false}
        inRoom={false}
        roomName=""
        onRoomBack={() => {}}
        onCloseInventory={() => {}}
        isDesktopInventory={false}
      />

      {selectedLead ? (
        <LeadManagementPanel
          lead={selectedLead}
          onClose={() => setSelectedLead(null)}
          onEditLead={handleEditLead}
          onLeadUpdated={handleLeadUpdated}
          // Clicking "Inventory" inside lead => opens full-screen inventory
          onInventoryFullScreen={openInventoryFullScreen}
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
            leadsListRef={leadsListRef}
            onScroll={(e) => setScrollPosition(e.target.scrollTop)}
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
