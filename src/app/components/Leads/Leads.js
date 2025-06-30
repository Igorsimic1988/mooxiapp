"use client"; 

import React, { useState, useEffect, useRef, useMemo, useLayoutEffect } from "react";
import styles from "./Leads.module.css";

import HeaderDashboard from "./HeaderDashboard/HeaderDashboard";
import LeadsFilterBar from "./LeadsFilterBar/LeadsFilterBar";
import LeadsSearchBar from "./LeadsSearchBar/LeadsSearchBar";
import LeadsActionButtons from "./LeadsActionButtons/LeadsActionButtons";
import AddNewLeadButton from "./AddNewLeadButton/AddNewLeadButton";
import LeadsList from "./LeadsList/LeadsList";
import LeadManagementPanel from "./LeadManagementPanel/LeadManagementPanel";
import Inventory from "./LeadManagementPanel/MoveDetailsPanel/OriginDetails/Inventory/Inventory";
import LeadFormPopup from "./LeadFormPopup/LeadFormPopup";
import FilterButtonPopup from "./FilterButtonPopup/FilterButtonPopup";
import LeadsDesktop from "./LeadsDesktop/LeadsDesktop";
import { getAllLeads, createLead, updateLead } from "src/app/services/leadsService";
import { useAccessToken } from "src/app/lib/useAccessToken";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createEvent } from "src/app/services/eventService";

/**
 * Utility to parse lead.survey_date + lead.survey_time => JS Date object
 */
function parseSurveyDateTime(lead) {
  if (!lead || !lead.surveyDate) return null;
  const d = new Date(lead.surveyDate);
  if (isNaN(d)) return null;

  if (lead.surveyTime) {
    const regex = /^(\d{1,2}):(\d{2})\s?(AM|PM)$/i;
    const match = lead.surveyTime.match(regex);
    if (match) {
      let hour = parseInt(match[1], 10);
      const minute = parseInt(match[2], 10);
      const ampm = match[3].toUpperCase();
      if (ampm === "PM" && hour < 12) hour += 12;
      if (ampm === "AM" && hour === 12) hour = 0;
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
    case "Active Leads":
      return leads.filter((ld) => {
        const st = ld.leadStatus;
        const na = ld.nextAction;
        const act = ld.leadActivity;

        // "isActive" is one of these statuses:
        const isActive =
          st === "New Lead" ||
          st === "In Progress" ||
          st === "Quoted" ||
          st === "Move on Hold";

        if (!isActive) return false;

        // Additional exclusions for "In Progress"
        if (st === "In Progress") {
          if (na === "Survey Completed" || na === "Completed") {
            return false;
          }
          // Also exclude if lead_activity is "In Home Estimate" or "Virtual Estimate"
          if (act === "In Home Estimate" || act === "Virtual Estimate") {
            return false;
          }
        }
        return true;
      });

    case "Lost Leads":
      return leads.filter(
        (ld) => ld.leadStatus === "Bad Lead" || ld.leadStatus === "Declined"
      );

    case "My Appointments":
      // Show leads that:
      // 1) lead_status is "In Progress"
      // 2) lead_activity is "In Home Estimate" or "Virtual Estimate"
      // 3) next_action is "Survey Completed" or "Completed"
      return leads.filter(
        (ld) =>
          ld.leadStatus === "In Progress" &&
          (ld.leadActivity === "In Home Estimate" ||
            ld.leadActivity === "Virtual Estimate") &&
          (ld.nextAction === "Survey Completed" ||
            ld.nextAction === "Completed")
      );

    case "Pending":
      return leads.filter((ld) => ld.leadStatus === "");

    case "Booked":
      // Double-check spelling for "Canceled"
      return leads.filter(
        (ld) => ld.leadStatus === "Booked" || ld.leadStatus === "Canceled"
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
  const normalizedPhoneQuery = normalizedQuery.replace(/\D/g, "");
  const searchPhone = normalizedPhoneQuery.length >= 3;

  return leads.filter((lead) => {
    // 1) job_number
    if (String(lead.jobNumber).includes(normalizedQuery)) return true;
    // 2) customer_name
    if (
      lead.customerName &&
      lead.customerName.toLowerCase().includes(normalizedQuery)
    )
      return true;
    // 3) customer_email
    if (
      lead.customerEmail &&
      lead.customerEmail.toLowerCase().includes(normalizedQuery)
    )
      return true;
    // 4) phone partial match
    if (searchPhone && lead.customerPhoneNumber) {
      const normalizedPhone = lead.customerPhoneNumber.replace(/\D/g, "");
      if (normalizedPhone.includes(normalizedPhoneQuery)) return true;
    }

    return false;
  });
}

/**
 * Apply secondary filters from FilterButtonPopup
 */
function applySecondaryFilters(leads, filterParams) {
  if (!Array.isArray(leads)) return [];
  
  const {
    selectedCompany,
    selectedSalesRep,
    selectedMode,
    selectedWorkflow,
    selectedWhere,
    fromDate,
    toDate,
    checkedStatuses,
  } = filterParams;
  
  // Filter by company
  let result = leads;
  if (selectedCompany !== "All companies") {
    result = result.filter(lead => lead.companyName === selectedCompany);
  }
  
  // Filter by sales rep
  if (selectedSalesRep !== "All sales") {
    result = result.filter(lead => lead.salesName === selectedSalesRep);
  }
  
  // Filter by status
  if (checkedStatuses && checkedStatuses.length > 0) {
    result = result.filter(lead => checkedStatuses.includes(lead.leadStatus));
  }
  
  // Apply date filters or workflow filters
  if (selectedMode === "date" && selectedWhere !== "Select" && fromDate && toDate) {
    const fromDateObj = new Date(fromDate);
    const toDateObj = new Date(toDate);
    toDateObj.setHours(23, 59, 59, 999); // Set to end of day
    
    result = result.filter(lead => {
      let dateToCompare;
      
      switch (selectedWhere) {
        case "Creation Date":
          dateToCompare = new Date(lead.creationDateTime);
          break;
        case "Move Date":
          // Assuming move_date field exists
          dateToCompare = lead.moveDate ? new Date(lead.moveDate) : null;
          break;
        case "Appointment Date":
          dateToCompare = lead.surveyDate ? new Date(lead.surveyDate) : null;
          break;
        case "Sales Activity":
          // Look for the most recent status history item
          if (Array.isArray(lead.events)) {
            // Sort by changed_at in descending order
            const activityEvents = lead.events.filter((e) => e.type === "LEAD_ACTIVITY_CHANGED");
            if (activityEvents.length > 0) {
              const sorted = [...activityEvents].sort(
              (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
            );
            dateToCompare = new Date(sorted[0].created_at);
          } else {
            dateToCompare = null;
          }
        }else{
            dateToCompare = null;
          }
      }
      
      if (!dateToCompare) return false;
      
      return dateToCompare >= fromDateObj && dateToCompare <= toDateObj;
    });
  } else if (selectedMode === "workflow" && selectedWorkflow !== "Show All") {
    // Workflow filtering implementation
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const nextWeek = new Date(today);
    nextWeek.setDate(nextWeek.getDate() + 7);
    
    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();
    const nextMonth = currentMonth === 11 ? 0 : currentMonth + 1;
    const nextMonthYear = currentMonth === 11 ? currentYear + 1 : currentYear;
    
    switch (selectedWorkflow) {
      case "Today workflow":
        // Filter leads with survey_date today
        result = result.filter(lead => {
          if (!lead.surveyDate) return false;
          const surveyDate = new Date(lead.surveyDate);
          surveyDate.setHours(0, 0, 0, 0);
          return surveyDate.getTime() === today.getTime();
        });
        break;
      case "Tomorrow workflow":
        // Filter leads with survey_date tomorrow
        result = result.filter(lead => {
          if (!lead.surveyDate) return false;
          const surveyDate = new Date(lead.surveyDate);
          surveyDate.setHours(0, 0, 0, 0);
          return surveyDate.getTime() === tomorrow.getTime();
        });
        break;
      case "Next 7 days":
        // Filter leads with survey_date in the next 7 days
        result = result.filter(lead => {
          if (!lead.surveyDate) return false;
          const surveyDate = new Date(lead.surveyDate);
          return surveyDate >= today && surveyDate <= nextWeek;
        });
        break;
      case "Current Month":
        // Filter leads with survey_date in the current month
        result = result.filter(lead => {
          if (!lead.surveyDate) return false;
          const surveyDate = new Date(lead.surveyDate);
          return surveyDate.getMonth() === currentMonth && 
                 surveyDate.getFullYear() === currentYear;
        });
        break;
      case "Next Month":
        // Filter leads with survey_date in the next month
        result = result.filter(lead => {
          if (!lead.surveyDate) return false;
          const surveyDate = new Date(lead.surveyDate);
          return surveyDate.getMonth() === nextMonth && 
                 surveyDate.getFullYear() === nextMonthYear;
        });
        break;
      default:
        // No additional filtering needed
        break;
    }
  }
  
  return result;
}

function Leads() {
  // All leads
  const token = useAccessToken();
  const {
    data: leads = [],
    refetch,
  } = useQuery({
    queryKey: ['leads', token],
    queryFn: () => getAllLeads(token),
    enabled: !!token,
  });
  const queryClient = useQueryClient();

  const createLeadMutation = useMutation({
    mutationFn: (newLeadData) =>createLead({leadsData: newLeadData, token}),
    onSuccess:(createdLead) => {
      console.log("New lead created:", createdLead);
      queryClient.invalidateQueries(['leads']);
    },
    onError: (err) => {
      console.log(err)
    }
  });

  const [desktopScrollPosition, setDesktopScrollPosition] = useState(0);


  const updateLeadMutation = useMutation({
    mutationFn: ({id, data, token}) =>updateLead({id, data, token}),
    onSuccess:(updatedLead) => {
      console.log("Updated lead:", updatedLead);
    },
    onError: (err) => {
      console.log(err)
    }
  });

  const createEventMutation = useMutation({
    mutationFn: ({ type, data, token}) => createEvent({ type, data, token }),
    onSuccess:() => {
      console.log("Event create successfully")
    },
    onError: (err) => {
      console.log(err)
    }
  })

  // Tabs
  const [activeTab, setActiveTab] = useState("Active Leads");

  // Search
  const [searchQuery, setSearchQuery] = useState("");

  // Lead selection
  const [selectedLead, setSelectedLead] = useState(null);
  const [editingLead, setEditingLead] = useState(null);

  // Transfer mode
  const [transferModeActive, setTransferModeActive] = useState(false);
  const [selectedSalesRepForTransfer, setSelectedSalesRepForTransfer] = useState("");

  // NEW STATE FOR ANIMATION
  const [recentlyUpdatedLeadId, setRecentlyUpdatedLeadId] = useState(null);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const leadsPerPage = 20;

  // Inventory full-screen
  const [showInventoryFullScreen, setShowInventoryFullScreen] = useState(false);
  const [inventoryRoom, setInventoryRoom] = useState(null);
  const [inventoryScrollPosition, setInventoryScrollPosition] = useState(0);

  // Lead Form (New or Edit)
  const [showLeadForm, setShowLeadForm] = useState(false);

  // Keep track of scroll position in leads list
  const leadsListRef = useRef(null);
  const [scrollPosition, setScrollPosition] = useState(0);
  const mainContainerRef = useRef(null);

  // Filter popup
  const [showFilterPopup, setShowFilterPopup] = useState(false);

  // Filter states
  const [selectedCompany, setSelectedCompany] = useState("All companies");
  const [selectedSalesRep, setSelectedSalesRep] = useState("All sales");
  const [selectedMode, setSelectedMode] = useState("workflow"); // or 'date'
  const [selectedWorkflow, setSelectedWorkflow] = useState("Show All");

  const [selectedWhere, setSelectedWhere] = useState("Select");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  const statusOptions = [
    { label: "New Lead", color: "#59B779" },
    { label: "Move on Hold", color: "#616161" },
    { label: "In Progress", color: "#FAA61A" },
    { label: "Quoted", color: "#FFC61E" },
    { label: "Bad Lead", color: "#f65676" },
    { label: "Declined", color: "#D9534F" },
    { label: "Booked", color: "#3fa9f5" },
    { label: "Canceled", color: "#2f3236" },
  ];
  const [checkedStatuses, setCheckedStatuses] = useState(
    statusOptions.map((s) => s.label)
  );

  // Create a memoized filter state string
  const filterStateString = useMemo(() => {
    return JSON.stringify({
      company: selectedCompany,
      salesRep: selectedSalesRep,
      mode: selectedMode,
      workflow: selectedWorkflow,
      where: selectedWhere,
      from: fromDate,
      to: toDate,
      statuses: [...checkedStatuses].sort().join(',')
    });
  }, [
    selectedCompany,
    selectedSalesRep,
    selectedMode,
    selectedWorkflow,
    selectedWhere,
    fromDate,
    toDate,
    checkedStatuses
  ]);

  // Track if we're on desktop
  const [isDesktop, setIsDesktop] = useState(false);

  // On mount -> set the app height and check for desktop
  useEffect(() => {
    function setAppHeight() {
      document.documentElement.style.setProperty(
        "--app-height",
        `${window.innerHeight}px`
      );
    }
    
    function checkDesktop() {
      setIsDesktop(window.innerWidth >= 1024);
    }
    
    window.addEventListener("resize", setAppHeight);
    window.addEventListener("resize", checkDesktop);
    setAppHeight();
    checkDesktop();
    
    return () => {
      window.removeEventListener("resize", setAppHeight);
      window.removeEventListener("resize", checkDesktop);
    };
  }, []);

  // Reset pagination when search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  // Reset pagination when filters change, using a stable dependency array
  useEffect(() => {
    // Only reset page if we're not on the first page already
    if (currentPage !== 1) {
      setCurrentPage(1);
    }
  }, [filterStateString, currentPage]);

  // Restore scroll position after inventory closes - using useLayoutEffect for instant restoration
  useLayoutEffect(() => {
    if (!showInventoryFullScreen && inventoryScrollPosition > 0) {
      // Immediately restore scroll before browser paints
      const markedElement = document.querySelector('[data-scroll-restore="true"]');
      if (markedElement) {
        markedElement.scrollTop = inventoryScrollPosition;
        markedElement.removeAttribute('data-scroll-restore');
      } else if (mainContainerRef.current) {
        // Try main container
        mainContainerRef.current.scrollTop = inventoryScrollPosition;
        
        // If main container doesn't scroll, try its children
        if (mainContainerRef.current.scrollTop === 0) {
          const scrollableElements = mainContainerRef.current.querySelectorAll('*');
          for (let el of scrollableElements) {
            const styles = window.getComputedStyle(el);
            if (styles.overflow === 'auto' || styles.overflow === 'scroll' || 
                styles.overflowY === 'auto' || styles.overflowY === 'scroll') {
              el.scrollTop = inventoryScrollPosition;
              if (el.scrollTop > 0) break;
            }
          }
        }
      } else if (leadsListRef.current) {
        leadsListRef.current.scrollTop = inventoryScrollPosition;
      }
      
      // Reset scroll position
      setInventoryScrollPosition(0);
    }
  }, [showInventoryFullScreen, inventoryScrollPosition]);

  // Sort leads newest-first
  const sortedLeads = [...leads].sort(
    (a, b) => new Date(b.creationDateTime) - new Date(a.creationDateTime)
  );

  // Apply filters
  let filteredLeads;
  if (searchQuery.trim()) {
    // If there is a search, just do the text/phone filter
    // Search takes precedence over all other filters
    filteredLeads = filterLeadsBySearch(sortedLeads, searchQuery);
  } else {
    // First filter by tab
    filteredLeads = filterLeadsByTab(sortedLeads, activeTab);
    
    // Then apply secondary filters from the FilterButtonPopup
    filteredLeads = applySecondaryFilters(filteredLeads, {
      selectedCompany,
      selectedSalesRep,
      selectedMode,
      selectedWorkflow,
      selectedWhere,
      fromDate,
      toDate,
      checkedStatuses,
    });
  }

  // Additional sorts for "My Appointments" or "Active Leads"
  if (activeTab === "My Appointments" && !searchQuery.trim()) {
    filteredLeads.sort((a, b) => {
      // "Completed" leads first
      const rankA = a.nextAction === "Completed" ? 0 : 1;
      const rankB = b.nextAction === "Completed" ? 0 : 1;
      if (rankA !== rankB) return rankA - rankB;

      // Then sort by earliest date
      const dateA = parseSurveyDateTime(a);
      const dateB = parseSurveyDateTime(b);
      if (!dateA && !dateB) return 0;
      if (!dateA) return 1;
      if (!dateB) return -1;
      return dateA - dateB;
    });
  }

  if (activeTab === "Active Leads" && !searchQuery.trim()) {
    filteredLeads.sort((a, b) => {
      // "New Lead" first
      if (a.leadStatus === "New Lead" && b.leadStatus !== "New Lead") return -1;
      if (a.leadStatus !== "New Lead" && b.leadStatus === "New Lead") return 1;

      // Then by newest creation
      return (
        new Date(b.creationDateTime) - new Date(a.creationDateTime)
      );
    });
  }

  // Pagination
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

  // Click a lead in the list - UPDATED WITH ANIMATION
  const handleLeadClick = (lead) => {
    // If transfer mode is active, update the lead's sales_name
    if (transferModeActive && selectedSalesRepForTransfer) {
      // Update the lead
      handleLeadUpdated(lead.id, { salesName: selectedSalesRepForTransfer });
      
      // Track this lead as recently updated for animation
      setRecentlyUpdatedLeadId(lead.id);
      
      // Clear the animation after 1.5 seconds
      setTimeout(() => {
        setRecentlyUpdatedLeadId(null);
      }, 400);
      
      // Log the transfer action
      console.log(`Transferred lead ${lead.jobNumber} to ${selectedSalesRepForTransfer}`);
    } else {
      // Normal mode - open the lead details panel
      if (leadsListRef.current) {
        setScrollPosition(leadsListRef.current.scrollTop);
      }
      setSelectedLead(lead);
    }
  };

  const handleBack = () => {
    setSelectedLead(null);
    // Clear inventory scroll position to avoid conflicts
    setInventoryScrollPosition(0);
    // restore scroll after short delay
    setTimeout(() => {
      if (leadsListRef.current) {
        leadsListRef.current.scrollTop = scrollPosition;
      }
    }, 0);
  };

  // CRUD: Create new lead
  const handleLeadCreated = (newLeadData) => {
    createLeadMutation.mutate(newLeadData);
  };

  // CRUD: Update existing lead
  const handleLeadUpdated = (id, updates) => {
    // Console log so you can follow all changes
    console.log("UPDATE LEAD → id:", id, "updates:", updates);
    
    updateLeadMutation.mutate({ id, data: updates, token }, {
      onSuccess: (updatedLead) => {
        console.log("Lead updated successfully:", updatedLead);
        
        // Update the selected lead immediately with the updates
        // This ensures the UI reflects changes right away
        setSelectedLead((prev) => {
          if (prev && (prev.id === id || prev.lead_id === id)) {
            return {
              ...prev,
              ...updates, // Apply the updates immediately
              ...updatedLead, // Then apply any additional data from the server
            };
          }
          return prev;
        });
        
        // Also update the leads in the query cache
        queryClient.setQueryData(['leads', token], (oldData) => {
          if (!oldData) return oldData;
          return oldData.map(lead => {
            if (lead.id === id || lead.lead_id === id) {
              return {
                ...lead,
                ...updates,
                ...updatedLead,
              };
            }
            return lead;
          });
        });
        
        // Then refetch to ensure consistency
        refetch();
        
        // Handle events for status changes
        const prev = selectedLead;
        if (prev) {
          if (updates.leadStatus && updates.leadStatus !== prev.leadStatus) {
            createEventMutation.mutate({
              type: "LEAD_STATUS_CHANGED",
              data: {
                leadId: updatedLead.id,
                field: "leadStatus",
                oldValue: prev.leadStatus || null,
                newValue: updates.leadStatus || null,
              },
              token,
            });
          }
          
          if (updates.leadActivity && updates.leadActivity !== prev.leadActivity) {
            createEventMutation.mutate({
              type: "LEAD_ACTIVITY_CHANGED",
              data: {
                leadId: updatedLead.id,
                field: "leadActivity",
                oldValue: prev.leadActivity || null,
                newValue: updates.leadActivity || null,
              },
              token,
            });
          }
          
          if (updates.nextAction && updates.nextAction !== prev.nextAction) {
            createEventMutation.mutate({
              type: "NEXT_ACTION_CHANGED",
              data: {
                leadId: updatedLead.id,
                field: "nextAction",
                oldValue: prev.nextAction || null,
                newValue: updates.nextAction || null,
              },
              token,
            });
          }
        }
      },
      onError: (err) => {
        console.error("Failed to update lead:", err);
      }
    });
  };

  // Edit lead
  const handleEditLead = (lead) => {
    setEditingLead(lead);
    setShowLeadForm(true);
  };

  // Switch tabs => reset page
  const handleChangeTab = (newTab) => {
    setActiveTab(newTab);
    setCurrentPage(1);
  };

  // Handle transfer mode change
  const handleTransferModeChange = (isActive) => {
    setTransferModeActive(isActive);
    
    // Reset selected sales rep if transfer mode is disabled
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
  
  const handleLeadRefetch = async () => {
    const freshLeads = await refetch(); // ovo refetchuje sve leadove
    const updatedLead = freshLeads.data?.find(ld => ld.id === selectedLead?.id);
    if (updatedLead) {
      setSelectedLead(updatedLead);
    }
  };

  // Inventory
  const openInventoryFullScreen = () => {
    // Save current scroll position before opening inventory
    let savedPosition = 0;
    
    if (selectedLead) {
      // We're in LeadManagementPanel view
      // Try to find the scrolling element - it might be the main container or a child
      if (mainContainerRef.current) {
        // Check main container
        savedPosition = mainContainerRef.current.scrollTop;
        
        // If main container doesn't scroll, check for scrolling children
        if (savedPosition === 0) {
          const scrollableElements = mainContainerRef.current.querySelectorAll('*');
          for (let el of scrollableElements) {
            if (el.scrollTop > 0) {
              savedPosition = el.scrollTop;
              // Store reference to the scrolling element for restoration
              el.setAttribute('data-scroll-restore', 'true');
              break;
            }
          }
        }
      }
      
      // Also save window scroll as fallback
      if (savedPosition === 0) {
        savedPosition = window.pageYOffset || document.documentElement.scrollTop;
      }
    } else if (leadsListRef.current) {
      // We're in leads list view
      savedPosition = leadsListRef.current.scrollTop;
    } else {
      // Fallback to general scroll position
      savedPosition = scrollPosition;
    }
    
    setInventoryScrollPosition(savedPosition);
    setShowInventoryFullScreen(true);
    handleLeadRefetch();
  };
  
  const closeInventoryFullScreen = () => {
    setShowInventoryFullScreen(false);
    handleLeadRefetch();
    // Scroll restoration handled by useLayoutEffect
  };

  // Count how many filters are active
  function getActiveFilterCount() {
    let count = 0;
    // 1) Company
    if (selectedCompany !== "All companies") count++;
    // 2) Sales Rep
    if (selectedSalesRep !== "All sales") count++;
    // 3) Workflow
    if (selectedWorkflow !== "Show All") count++;
    // 4) Date filter
    const hasFullDateFilter =
      selectedWhere !== "Select" && fromDate && toDate;
    if (hasFullDateFilter) count++;
    // 5) Status => if not all are checked => it's a filter
    if (checkedStatuses.length < statusOptions.length) count++;
    return count;
  }

  const filterCount = getActiveFilterCount();

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
          isDesktopInventory={isDesktop}
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

  // Show desktop version if on desktop
  if (isDesktop) {
    return (
      <LeadsDesktop
        // Data
        leads={leads}
        refetch={refetch}
        
        // State
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        selectedLead={selectedLead}
        setSelectedLead={setSelectedLead}
        editingLead={editingLead}
        setEditingLead={setEditingLead}
        transferModeActive={transferModeActive}
        setTransferModeActive={setTransferModeActive}
        selectedSalesRepForTransfer={selectedSalesRepForTransfer}
        setSelectedSalesRepForTransfer={setSelectedSalesRepForTransfer}
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
        leadsPerPage={leadsPerPage}
        showLeadForm={showLeadForm}
        setShowLeadForm={setShowLeadForm}
        showFilterPopup={showFilterPopup}
        setShowFilterPopup={setShowFilterPopup}
        
        // ADD THESE NEW PROPS FOR INVENTORY SCROLL
        showInventoryFullScreen={showInventoryFullScreen}
        setShowInventoryFullScreen={setShowInventoryFullScreen}
        inventoryScrollPosition={inventoryScrollPosition}
        setInventoryScrollPosition={setInventoryScrollPosition}
        inventoryRoom={inventoryRoom}
        setInventoryRoom={setInventoryRoom}
        mainContainerRef={mainContainerRef}
        
        // Filter states
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
        
        // Handlers
        handleLeadCreated={handleLeadCreated}
        handleLeadUpdated={handleLeadUpdated}
        handleEditLead={handleEditLead}
        openInventoryFullScreen={openInventoryFullScreen}
        closeInventoryFullScreen={closeInventoryFullScreen}  // ADD THIS
        handleLeadRefetch={handleLeadRefetch}  // ADD THIS
        
        // Computed values
        currentLeads={currentLeads}
        totalLeads={totalLeads}
        totalPages={totalPages}
        startIndex={startIndex}
        endIndex={endIndex}
        filterCount={filterCount}
        
        // ANIMATION PROPS
        recentlyUpdatedLeadId={recentlyUpdatedLeadId}
        setRecentlyUpdatedLeadId={setRecentlyUpdatedLeadId}
        desktopScrollPosition={desktopScrollPosition}
      setDesktopScrollPosition={setDesktopScrollPosition}
      />
    );
  }

  // Mobile view - normal leads screen
  return (
    <div className={styles.container} ref={mainContainerRef}>
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
          <LeadsFilterBar
            activeTab={activeTab}
            onTabChange={handleChangeTab}
          />
          <LeadsSearchBar
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
          />

          <div className={styles.actionsContainer}>
            <LeadsActionButtons
              onOpenFilterPopup={() => setShowFilterPopup(true)}
              filterCount={filterCount}
              onTransferLead={handleTransferLead}
              onTransferModeChange={handleTransferModeChange}
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
          filterCount={filterCount}
        />
      )}
    </div>
  );
}

export default Leads;