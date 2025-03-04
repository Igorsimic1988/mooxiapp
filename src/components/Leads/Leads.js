import React, { useState, useEffect, useRef } from 'react';
import styles from './Leads.module.css';
import HeaderDashboard from './HeadrerDashboard/HeaderDashboard';
import LeadsFilterBar from './LeadsFilterBar/LeadsFilterBar';
import LeadsSearchBar from './LeadsSearchBar/LeadsSearchBar';
import LeadsActionButtons from './LeadsActionButtons/LeadsActionButtons';
import AddNewLeadButton from './AddNewLeadButton/AddNewLeadButton';
import LeadsList from './LeadsList/LeadsList';
import LeadManagementPanel from './LeadManagementPanel/LeadManagementPanel';
import Inventory from './LeadManagementPanel/MoveDetailsPanel/OriginDetails/Inventory/Inventory';
import actualLeads from '../../data/constants/actualLeads';
import LeadFormPopup from './LeadFormPopup/LeadFormPopup';
import FilterButtonPopup from './FilterButtonPopup/FilterButtonPopup'; // ← Import the Filter popup

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
        const act = ld.lead_activity;

        // We define "isActive" as:
        const isActive =
          st === 'New Lead' ||
          st === 'In Progress' ||
          st === 'Quoted' ||
          st === 'Move on Hold';

        if (!isActive) {
          return false;
        }

        // If In Progress => exclude if next_action is "Survey Completed" or "Completed"
        if (st === 'In Progress') {
          if (na === 'Survey Completed' || na === 'Completed') {
            return false;
          }
          // Also exclude if lead_activity is In Home Estimate / Virtual Estimate
          if (act === 'In Home Estimate' || act === 'Virtual Estimate') {
            return false;
          }
        }
        return true;
      });

    case 'Closed Leads':
      return leads.filter(
        (ld) => ld.lead_status === 'Bad Lead' || ld.lead_status === 'Declined'
      );

    case 'My Appointments':
      // Includes next_action === 'Survey Completed' OR 'Completed'
      return leads.filter(
        (ld) =>
          ld.lead_status === 'In Progress' &&
          (ld.lead_activity === 'In Home Estimate' || ld.lead_activity === 'Virtual Estimate') &&
          (ld.next_action === 'Survey Completed' || ld.next_action === 'Completed')
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
 * Filter leads by search query
 */
function filterLeadsBySearch(leads, searchQuery) {
  if (!searchQuery.trim()) return leads; // Return all if no search query

  console.log("Filtering leads with search query:", searchQuery);
  console.log("Total leads before filtering:", leads.length);

  const normalizedQuery = searchQuery.trim().toLowerCase();
  const normalizedPhoneQuery = normalizedQuery.replace(/\D/g, ''); // Remove non-digit characters

  // Only search for phone if we have at least 3 digits
  const searchPhone = normalizedPhoneQuery.length >= 3;

  const filteredLeads = leads.filter(lead => {
    // Check job_number (convert to string first in case it's a number)
    if (String(lead.job_number).includes(normalizedQuery)) {
      console.log("Match by job number:", lead.job_number);
      return true;
    }

    // Check customer_name
    if (lead.customer_name && lead.customer_name.toLowerCase().includes(normalizedQuery)) {
      console.log("Match by customer name:", lead.customer_name);
      return true;
    }

    // Check customer_email
    if (lead.customer_email && lead.customer_email.toLowerCase().includes(normalizedQuery)) {
      console.log("Match by email:", lead.customer_email);
      return true;
    }

    // Check customer_phone_number (normalized version)
    if (searchPhone && lead.customer_phone_number) {
      // Remove all non-digit characters for comparison
      const normalizedPhone = lead.customer_phone_number.replace(/\D/g, '');
      if (normalizedPhone.includes(normalizedPhoneQuery)) {
        console.log("Match by phone:", lead.customer_phone_number, "Query:", normalizedPhoneQuery);
        return true;
      }
    }

    // No match
    return false;
  });

  console.log("Filtered leads count:", filteredLeads.length);
  return filteredLeads;
}

function Leads() {
  const [leads, setLeads] = useState(Array.isArray(actualLeads) ? [...actualLeads] : []);
  const [currentPage, setCurrentPage] = useState(1);
  const leadsPerPage = 20;

  const [activeTab, setActiveTab] = useState('Active Leads');
  const [selectedLead, setSelectedLead] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  const leadsListRef = useRef(null);
  const [scrollPosition, setScrollPosition] = useState(0);

  const [showLeadForm, setShowLeadForm] = useState(false);
  const [editingLead, setEditingLead] = useState(null);

  const [showInventoryFullScreen, setShowInventoryFullScreen] = useState(false);
  const [inventoryRoom, setInventoryRoom] = useState(null);

  // NEW: Control FilterButtonPopup visibility
  const [showFilterPopup, setShowFilterPopup] = useState(false);

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

  // Effect to reset page when search query changes
  useEffect(() => {
    setCurrentPage(1); // Reset to first page when search query changes
  }, [searchQuery]);

  // 2) Apply filters
  let filteredLeads;
  if (searchQuery.trim()) {
    // If search is active, search across ALL leads regardless of tab
    filteredLeads = filterLeadsBySearch(sortedLeads, searchQuery);
    console.log("Search mode active, found:", filteredLeads.length, "matches");
  } else {
    // Otherwise use the tab filter only
    filteredLeads = filterLeadsByTab(sortedLeads, activeTab);
    console.log("Tab filter mode, showing:", filteredLeads.length, "leads for tab:", activeTab);
  }

  // 2.5) If My Appointments => custom sort:
  if (activeTab === 'My Appointments' && !searchQuery.trim()) {
    filteredLeads.sort((a, b) => {
      // 1) next_action='Completed' => rank 0 => goes on top
      const rankA = a.next_action === 'Completed' ? 0 : 1;
      const rankB = b.next_action === 'Completed' ? 0 : 1;
      if (rankA !== rankB) {
        return rankA - rankB; // 0 => appear first
      }

      // 2) among the rest => sort ascending by survey date/time
      const dateA = parseSurveyDateTime(a);
      const dateB = parseSurveyDateTime(b);
      if (!dateA && !dateB) return 0;
      if (!dateA) return 1;
      if (!dateB) return -1;
      return dateA - dateB;
    });
  }

  // 2.6) If Active Leads tab => prioritize "New Lead" status
  if (activeTab === 'Active Leads' && !searchQuery.trim()) {
    filteredLeads.sort((a, b) => {
      // First priority: "New Lead" status
      if (a.lead_status === 'New Lead' && b.lead_status !== 'New Lead') return -1;
      if (a.lead_status !== 'New Lead' && b.lead_status === 'New Lead') return 1;

      // Next: newest first
      return new Date(b.creation_date_time) - new Date(a.creation_date_time);
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

  const handleLeadClick = (lead) => {
    if (leadsListRef.current) {
      setScrollPosition(leadsListRef.current.scrollTop);
    }
    setSelectedLead(lead);
  };

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
    console.log('Updated lead data => ', updatedLead);
    setLeads((prevLeads) =>
      prevLeads.map((ld) => (ld.lead_id === updatedLead.lead_id ? updatedLead : ld))
    );
    if (selectedLead && selectedLead.lead_id === updatedLead.lead_id) {
      setSelectedLead(updatedLead);
    }
  };

  // Edit lead
  const handleEditLead = (lead) => {
    setEditingLead(lead);
    setShowLeadForm(true);
  };

  // Change tab => reset page and clear search
  const handleChangeTab = (newTab) => {
    setActiveTab(newTab);
    setCurrentPage(1);
  };

  // Inventory => open/close
  const openInventoryFullScreen = () => {
    setShowInventoryFullScreen(true);
  };
  const closeInventoryFullScreen = () => {
    setShowInventoryFullScreen(false);
  };

  const isDesktopScreen = window.innerWidth >= 1024;

  // If Inventory is open => show full-screen
  if (showInventoryFullScreen) {
    return (
      <div className={styles.container}>
        <HeaderDashboard
          isLeadSelected={!!selectedLead}
          onBack={handleBack}
          isInInventory
          inRoom={!!inventoryRoom}
          roomName={inventoryRoom?.name || ''}
          onRoomBack={() => setInventoryRoom(null)}
          onCloseInventory={closeInventoryFullScreen}
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

  // Otherwise => normal UI
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
          onInventoryFullScreen={openInventoryFullScreen}
        />
      ) : (
        <>
          <LeadsFilterBar activeTab={activeTab} onTabChange={handleChangeTab} />
          <LeadsSearchBar
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
          />

          <div className={styles.actionsContainer}>
            {/*
              Pass a callback to open the Filter popup:
              When onClick, sets "showFilterPopup" = true
            */}
            <LeadsActionButtons onOpenFilterPopup={() => setShowFilterPopup(true)} />

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
            activeTab={searchQuery.trim() ? 'Search Results' : activeTab}
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

      {/* Conditionally render the FilterButtonPopup */}
      {showFilterPopup && (
        <FilterButtonPopup onClose={() => setShowFilterPopup(false)} />
      )}
    </div>
  );
}

export default Leads;
