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
import FilterButtonPopup from './FilterButtonPopup/FilterButtonPopup';

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
      // next_action === 'Survey Completed' OR 'Completed'
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
  if (!searchQuery.trim()) return leads;

  const normalizedQuery = searchQuery.trim().toLowerCase();
  const normalizedPhoneQuery = normalizedQuery.replace(/\D/g, '');
  const searchPhone = normalizedPhoneQuery.length >= 3;

  return leads.filter(lead => {
    if (String(lead.job_number).includes(normalizedQuery)) return true;
    if (lead.customer_name && lead.customer_name.toLowerCase().includes(normalizedQuery)) return true;
    if (lead.customer_email && lead.customer_email.toLowerCase().includes(normalizedQuery)) return true;
    if (searchPhone && lead.customer_phone_number) {
      const normalizedPhone = lead.customer_phone_number.replace(/\D/g, '');
      if (normalizedPhone.includes(normalizedPhoneQuery)) return true;
    }
    return false;
  });
}

function Leads() {
  // All leads
  const [leads, setLeads] = useState(Array.isArray(actualLeads) ? [...actualLeads] : []);
  // Tabs
  const [activeTab, setActiveTab] = useState('Active Leads');
  // Searching
  const [searchQuery, setSearchQuery] = useState('');

  // Lead selection
  const [selectedLead, setSelectedLead] = useState(null);
  const [editingLead, setEditingLead]   = useState(null);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const leadsPerPage = 20;

  // Inventory
  const [showInventoryFullScreen, setShowInventoryFullScreen] = useState(false);
  const [inventoryRoom, setInventoryRoom] = useState(null);

  // Lead Form
  const [showLeadForm, setShowLeadForm] = useState(false);

  // The scrolled position in the leads list
  const leadsListRef = useRef(null);
  const [scrollPosition, setScrollPosition] = useState(0);

  // Controls whether the Filter popup is showing
  const [showFilterPopup, setShowFilterPopup] = useState(false);

  // ------------- FILTER STATES -------------
  const [selectedCompany, setSelectedCompany] = useState('All companies');
  const [selectedSalesRep, setSelectedSalesRep] = useState('All sales');
  const [selectedMode, setSelectedMode]       = useState('workflow'); // or 'date'
  const [selectedWorkflow, setSelectedWorkflow] = useState('Show All');

  // NOTE: changed default to "Select" instead of "Creation Date"
  const [selectedWhere, setSelectedWhere] = useState('Select');
  
  const [fromDate, setFromDate] = useState('');
  const [toDate,   setToDate]   = useState('');

  // For statuses
  const statusOptions = [
    { label: 'New Lead',     color: '#59B779' },
    { label: 'Move on Hold', color: '#616161' },
    { label: 'In Progress',  color: '#FAA61A' },
    { label: 'Quoted',       color: '#FFC61E' },
    { label: 'Bad Lead',     color: '#f65676' },
    { label: 'Declined',     color: '#D9534F' },
    { label: 'Booked',       color: '#3fa9f5' },
    { label: 'Canceled',     color: '#2f3236' },
  ];
  const [checkedStatuses, setCheckedStatuses] = useState(
    statusOptions.map((s) => s.label) // all checked initially
  );

  // On mount => set app height
  useEffect(() => {
    function setAppHeight() {
      document.documentElement.style.setProperty('--app-height', `${window.innerHeight}px`);
    }
    window.addEventListener('resize', setAppHeight);
    setAppHeight();
    return () => window.removeEventListener('resize', setAppHeight);
  }, []);

  // Sort newest-first
  const sortedLeads = [...leads].sort(
    (a, b) => new Date(b.creation_date_time) - new Date(a.creation_date_time)
  );

  // If the search query changes => reset to page 1
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  // ---------- 2) APPLY FILTERS ----------
  let filteredLeads;

  if (searchQuery.trim()) {
    filteredLeads = filterLeadsBySearch(sortedLeads, searchQuery);
  } else {
    filteredLeads = filterLeadsByTab(sortedLeads, activeTab);
  }

  // Additional sorts for special tabs
  if (activeTab === 'My Appointments' && !searchQuery.trim()) {
    filteredLeads.sort((a, b) => {
      const rankA = a.next_action === 'Completed' ? 0 : 1;
      const rankB = b.next_action === 'Completed' ? 0 : 1;
      if (rankA !== rankB) return rankA - rankB;
      const dateA = parseSurveyDateTime(a);
      const dateB = parseSurveyDateTime(b);
      if (!dateA && !dateB) return 0;
      if (!dateA) return 1;
      if (!dateB) return -1;
      return dateA - dateB;
    });
  }
  if (activeTab === 'Active Leads' && !searchQuery.trim()) {
    filteredLeads.sort((a, b) => {
      if (a.lead_status === 'New Lead' && b.lead_status !== 'New Lead') return -1;
      if (a.lead_status !== 'New Lead' && b.lead_status === 'New Lead') return 1;
      return new Date(b.creation_date_time) - new Date(a.creation_date_time);
    });
  }

  // Pagination
  const totalLeads = filteredLeads.length;
  const totalPages = Math.ceil(totalLeads / leadsPerPage);
  const startIndex = (currentPage - 1) * leadsPerPage;
  const endIndex   = Math.min(startIndex + leadsPerPage, totalLeads);
  const currentLeads = filteredLeads.slice(startIndex, endIndex);

  const handleNextPage = () => {
    if (currentPage < totalPages) setCurrentPage(prev => prev + 1);
  };
  const handlePrevPage = () => {
    if (currentPage > 1) setCurrentPage(prev => prev - 1);
  };

  // Lead selection in the list
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

  // Creating + updating leads
  const handleLeadCreated = (newLead) => {
    setLeads(prev => [...prev, newLead]);
  };

  const handleLeadUpdated = (updatedLead) => {
    setLeads(prevLeads =>
      prevLeads.map(ld => (ld.lead_id === updatedLead.lead_id ? updatedLead : ld))
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

  // Change tab => reset page
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
            <LeadsActionButtons
              onOpenFilterPopup={() => setShowFilterPopup(true)}
            />
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
        />
      )}
    </div>
  );
}

export default Leads;
