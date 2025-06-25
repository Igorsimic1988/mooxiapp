"use client";

import React, { useState, useEffect, useRef, useCallback } from 'react';

import SimpleToggle from '../../SimpleToggle/SimpleToggle';
import OriginDetails from './OriginDetails/OriginDetails';
import DestinationDetails from './DestinationDetails/DestinationDetails';
import LogisticsDetails from './LogisticsDetails/LogisticsDetails';
import EstimateDetails from './EstimateDetails/EstimateDetails';
import styles from './MoveDetailsPanel.module.css';
import Icon from '../../../Icon';

// Import your typeOfServiceChoices from the constants file
import typeOfServiceChoices from '../../../../data/constants/typeOfServiceChoices';
import { useForm } from 'react-hook-form';
import { useMutation } from "@tanstack/react-query";
import { updateOrigin } from 'src/app/services/originsService';
import { updateDestination } from 'src/app/services/destinationsService';
import { useAccessToken } from "src/app/lib/useAccessToken";
import { useQueryClient } from '@tanstack/react-query';

/** Generate time slots from 7:00 AM to 9:00 PM in 15-min increments */
function generateTimeSlots() {
  const slots = [];
  let hour = 7;
  let minute = 0;
  while (hour < 21) {
    const suffix = hour >= 12 ? 'PM' : 'AM';
    let displayHour = hour % 12;
    if (displayHour === 0) displayHour = 12;
    const mm = minute.toString().padStart(2, '0');
    slots.push(`${displayHour}:${mm} ${suffix}`);
    minute += 15;
    if (minute >= 60) {
      minute = 0;
      hour += 1;
    }
  }
  return slots;
}
const timeSlots = generateTimeSlots();

const etaRequestOptions = ['Flexible', 'Morning', 'Midday', 'Afternoon', 'Late Afternoon'];
const storageOptions = [
  'Few items',
  'Less than half',
  'Half of the items',
  'More than half',
  'Almost all',
  'All items',
];

function MoveDetailsPanel({ onShowInventory, lead, onLeadUpdated }) {

    const {
      watch,
      setValue,
    } = useForm({
      defaultValues: {
        moveDate: lead?.moveDate || '',
        deliveryDate: lead?.deliveryDate || '',
        serviceType: lead?.serviceType || 'Moving',
        etaRequest: lead?.etaRequest || 'Flexible',
        addStorage: Boolean(lead?.addStorage),
        storageItems: lead?.storageItems || 'All items',
        timePromised: Boolean(lead?.timePromised),
        arrivalTime: lead?.arrivalTime || '',
      },
    });

  const moveDate = watch('moveDate');
  const deliveryDate = watch('deliveryDate');
  const etaRequest = watch('etaRequest');
  const addStorage = watch('addStorage');
  const serviceType = watch('serviceType');
  const storageItems = watch('storageItems');
  const timePromised = watch('timePromised');
  const arrivalTime = watch('arrivalTime');

  const queryClient = useQueryClient();
  const token = useAccessToken();
  const [originStops, setOriginStops] = useState(lead.origins || []);
  const [destinationStops, setDestinationStops] = useState(lead.destinations || []);


  const updateOriginMutation = useMutation({
    mutationFn: ({ id, data }) => updateOrigin({ id, data, token }),
    onSuccess: (updatedOrigin) => {
      console.log("Updated origin:", updatedOrigin);
        setOriginStops((prev) =>
        prev.map((s) =>
          s.id === updatedOrigin.id ? { ...s, ...updatedOrigin } : s
        )
      );
        queryClient.setQueryData(['origins'], (prev) =>
        Array.isArray(prev)
          ? prev.map((s) =>
              s.id === updatedOrigin.id ? { ...s, ...updatedOrigin } : s
            )
          : prev
      );
  
      queryClient.invalidateQueries(['origins']);
      queryClient.invalidateQueries(['leads']);
    },
    onError: (err) => {
      console.log(err);
    },
  });
  

  const handleOriginUpdated = (id, updates) => {
    console.log("UPDATE Origin → id:", id); 
    updateOriginMutation.mutate({ id, data: updates });
  };

  const updateDestinationMutation = useMutation({
      mutationFn: ({id, data}) =>updateDestination({id, data, token}),
    onSuccess:(updatedDestination) => {
      console.log("Updated destination:", updatedDestination);
      setDestinationStops((prev) =>
        prev.map((s) =>
          s.id === updatedDestination.id ? { ...s, ...updatedDestination } : s
        )
      );
        queryClient.setQueryData(['destinations'], (prev) =>
        Array.isArray(prev)
          ? prev.map((s) =>
              s.id === updatedDestination.id ? { ...s, ...updatedDestination } : s
            )
          : prev
      );
  
      queryClient.invalidateQueries(['destinations']);
      queryClient.invalidateQueries(['leads']);
    },
    onError: (err) => {
      console.log(err)
    }
  });

  const handleDestinationUpdated = (id, updates) => {
    updateDestinationMutation.mutate(
      { id, data: updates }
    );
  };


  // Tabs
  const [selectedIndex, setSelectedIndex] = useState(0);
  const isSelectedTab = (idx) => idx === selectedIndex;

  // ---------- Move/Delivery Date ----------
  const [showMoveCalendar, setShowMoveCalendar] = useState(false);
  const [showDeliveryCalendar, setShowDeliveryCalendar] = useState(false);

  const [calendarMonth, setCalendarMonth] = useState(new Date());
  const [daysInMonth, setDaysInMonth] = useState([]);

  // ---------- Type of Service ----------
  const [showTypeOfServiceDropdown, setShowTypeOfServiceDropdown] = useState(false);

  // ---------- ETA Request ----------
  const [showETARequestDropdown, setShowETARequestDropdown] = useState(false);

  // ---------- "Add storage" toggle + items dropdown ----------
  const [storageDropdownOpen, setStorageDropdownOpen] = useState(false);

  // ---------- Time Promised (Arrival Time) ----------
  const [arrivalStart, setArrivalStart] = useState('');
  const [showStartTimeDropdown, setShowStartTimeDropdown] = useState(false);
  const [showIncrementsGrid, setShowIncrementsGrid] = useState(false);




  // For the calendars
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  useEffect(() => {
    const y = calendarMonth.getFullYear();
    const m = calendarMonth.getMonth();
    const totalDays = new Date(y, m + 1, 0).getDate();
    const arr = [];
    for (let i = 1; i <= totalDays; i++) arr.push(i);
    setDaysInMonth(arr);
  }, [calendarMonth]);

  const goPrevMonth = () => {
    setCalendarMonth((prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  };
  const goNextMonth = () => {
    setCalendarMonth((prev) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
  };

  // Refs for outside-click detection
  const moveCalendarRef = useRef(null);
  const deliveryCalendarRef = useRef(null);
  const typeOfServiceRef = useRef(null);
  const etaRequestRef = useRef(null);
  const storageRef = useRef(null);
  const startTimeDropdownRef = useRef(null);
  const incrementsGridRef = useRef(null);

  // Helper => default to +2h if user didn't select increment
  const defaultToTwoHours = useCallback(() => {
    if (!arrivalStart) return;
    const [hhmm, ampm] = arrivalStart.split(' ');
    const [hS, mS] = hhmm.split(':');
    let hh = Number(hS);
    let mm = Number(mS);
    let suffix = ampm;
    hh += 2;
    while (hh > 12) {
      hh -= 12;
      suffix = suffix === 'AM' ? 'PM' : 'AM';
    }
    if (hh === 0) hh = 12;
    const mmStr = mm.toString().padStart(2, '0');
    const endTime = `${hh}:${mmStr} ${suffix}`;
    setValue('arrivalTime',`${arrivalStart} - ${endTime}`)

    if (onLeadUpdated) {
      onLeadUpdated(lead.id, {
        timePromised: true,
        arrivalTime: `${arrivalStart} - ${endTime}`,
      });
    }
  }, [arrivalStart, setValue, onLeadUpdated, lead.id]);

  // Outside click => close popups
  useEffect(() => {
    function handleClickOutside(e) {
      if (showMoveCalendar && moveCalendarRef.current && !moveCalendarRef.current.contains(e.target)) {
        setShowMoveCalendar(false);
      }
      if (showDeliveryCalendar && deliveryCalendarRef.current && !deliveryCalendarRef.current.contains(e.target)) {
        setShowDeliveryCalendar(false);
      }
      if (showTypeOfServiceDropdown && typeOfServiceRef.current && !typeOfServiceRef.current.contains(e.target)) {
        setShowTypeOfServiceDropdown(false);
      }
      if (showETARequestDropdown && etaRequestRef.current && !etaRequestRef.current.contains(e.target)) {
        setShowETARequestDropdown(false);
      }
      if (storageDropdownOpen && storageRef.current && !storageRef.current.contains(e.target)) {
        setStorageDropdownOpen(false);
      }

      if (showIncrementsGrid && arrivalStart && !arrivalTime) {
        if (incrementsGridRef.current && !incrementsGridRef.current.contains(e.target)) {
          defaultToTwoHours();
          setShowIncrementsGrid(false);
        }
      }
      if (showStartTimeDropdown && startTimeDropdownRef.current && !startTimeDropdownRef.current.contains(e.target)) {
        setShowStartTimeDropdown(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [
    showMoveCalendar,
    showDeliveryCalendar,
    showTypeOfServiceDropdown,
    showETARequestDropdown,
    storageDropdownOpen,
    showStartTimeDropdown,
    showIncrementsGrid,
    arrivalStart,
    arrivalTime,
    defaultToTwoHours,
  ]);

  // ---------- "Add Storage" ----------
  const handleToggleStorage = (value) => {
    setValue('addStorage', value);

    // If toggling storage OFF => only clear delivery date if NOT Weight/Volume Based
    if (!value) {
      const isWeightOrVolumeBased = lead?.rateType === 'Weight Based' || lead?.rateType === 'Volume Based';
      
      if (!isWeightOrVolumeBased) {
        setValue('deliveryDate', '')
        if (onLeadUpdated) {
          onLeadUpdated(lead.id, {
            addStorage: false,
            storageItems: '',
            deliveryDate: '',
          });
        }
      } else {
        // Keep delivery date for Weight/Volume Based
        if (onLeadUpdated) {
          onLeadUpdated(lead.id, {
            addStorage: false,
            storageItems: '',
          });
        }
      }
    } else {
      // If toggling storage ON => keep current or set default
      if (onLeadUpdated) {
        onLeadUpdated(lead.id, {
          addStorage: true,
          storageItems: storageItems,
        });
      }
    }
  };

  const handleSelectStorage = (option) => {
    setValue('storageItems', option)
    setStorageDropdownOpen(false);
    if (onLeadUpdated) {
      onLeadUpdated(lead.id, {
        addStorage: true,
        storageItems: option,
      });
    }
  };

  // ---------- "Time Promised" ----------
  const handleToggleTimePromised = (value) => {
    setValue('timePromised', value);
    if (!value) {
      setValue('arrivalTime','')
    }
    if (onLeadUpdated) {
      onLeadUpdated(lead.id, {
        timePromised: value,
        arrivalTime: value ? arrivalTime : '',
      });
    }
  };
  const handleSetArrivalTime = (rangeStr) => {
    setValue('arrivalTime',rangeStr)
    if (onLeadUpdated) {
      onLeadUpdated(lead.id, {
        timePromised: true,
        arrivalTime: rangeStr,
      });
    }
  };

  // ---------- "Type of Service" ----------
  const handleSelectServiceType = (svcName) => {
    setValue('serviceType', svcName)
    setShowTypeOfServiceDropdown(false);
    if (onLeadUpdated) {
      onLeadUpdated(lead.id,{
        serviceType: svcName,
      });
    }
  };

  // ---------- "Move Date" ----------
  const handleSelectMoveDate = (dateObj) => {
    const dateStr = dateObj.toDateString();
    setValue('moveDate', dateStr)
    if (onLeadUpdated) {
      onLeadUpdated(lead.id, {
        moveDate: dateStr,
      });
    }
  };

  // ---------- "Delivery Date" ----------
  const handleSelectDeliveryDate = (dateObj) => {
    const dateStr = dateObj.toDateString();
    setValue('deliveryDate', dateStr)
    if (onLeadUpdated) {
      onLeadUpdated(lead.id, {
        deliveryDate: dateStr,
      });
    }
  };

  // ---------- "ETA Request" ----------
  const handleSelectEtaRequest = (opt) => {
    setValue('etaRequest', opt)
    setShowETARequestDropdown(false);
    if (onLeadUpdated) {
      onLeadUpdated(lead.id, {
        etaRequest: opt,
      });
    }
  };

  // Convert stored strings back into Date objects for comparison
  const selectedMoveDateObj = moveDate ? new Date(moveDate) : null;
  const selectedDeliveryDateObj = deliveryDate ? new Date(deliveryDate) : null;

  return (
    <div className={styles.panelContainer}>
      {/* ---------- TABS ---------- */}
      <div className={styles.sectionsRow}>
  <div
    className={`${styles.sectionItem} ${isSelectedTab(0) ? styles.selected : ''}`}
    onClick={() => setSelectedIndex(0)}
  >
    <Icon name="TruckCouch" className={`${styles.sectionIcon} ${isSelectedTab(0) ? styles.iconActive : ''}`} />
    <span className={`${styles.sectionText} ${isSelectedTab(0) ? styles.textActive : ''}`}>
      Move
    </span>
  </div>

  <div
    className={`${styles.sectionItem} ${isSelectedTab(1) ? styles.selected : ''}`}
    onClick={() => setSelectedIndex(1)}
  >
    <Icon name="Notebook" className={`${styles.sectionIcon} ${isSelectedTab(1) ? styles.iconActive : ''}`} />
    <span className={`${styles.sectionText} ${isSelectedTab(1) ? styles.textActive : ''}`}>
      Notes
    </span>
  </div>

  <div
    className={`${styles.sectionItem} ${isSelectedTab(2) ? styles.selected : ''}`}
    onClick={() => setSelectedIndex(2)}
  >
    <Icon name="EmailWithDot" className={`${styles.sectionIcon} ${isSelectedTab(2) ? styles.iconActive : ''}`} />
    <span className={`${styles.sectionText} ${isSelectedTab(2) ? styles.textActive : ''}`}>
      Email
    </span>
  </div>

  {false && ( // Set to true when you want to show the Availability tab
    <div
      className={`${styles.sectionItem} ${isSelectedTab(3) ? styles.selected : ''}`}
      onClick={() => setSelectedIndex(3)}
    >
      <div className={styles.greenDot}></div>
      <span className={`${styles.sectionText} ${isSelectedTab(3) ? styles.textActive : ''}`}>
        Availability
      </span>
    </div>
  )}
</div>

      {/* ---------- MOVE DATE ---------- */}
      <div className={`${styles.inputContainer} ${showMoveCalendar ? styles.activeInput : ''}`} style={{ position: 'relative' }}>
        <button
          type="button"
          className={styles.dateButton}
          onClick={() => {
            setShowMoveCalendar((prev) => !prev);
            setShowDeliveryCalendar(false);
          }}
        >
          <span className={styles.oneLineEllipsis}>
            <span className={styles.dateLabelPrefix}>Move Date:</span>
            <span className={moveDate ? styles.dateSelected : styles.datePlaceholder}>
              {moveDate || ''}
            </span>
          </span>
          <div className={styles.calendarRightIconWrapper}>
            <Icon name="Calendar" className={styles.calendarIcon} />
          </div>
        </button>

        {showMoveCalendar && (
          <div className={styles.calendarPopup} ref={moveCalendarRef}>
            <div className={styles.calendarHeader}>
              <button onClick={goPrevMonth}>Prev</button>
              <span>
                {calendarMonth.toLocaleString('default', { month: 'long' })}{' '}
                {calendarMonth.getFullYear()}
              </span>
              <button onClick={goNextMonth}>Next</button>
            </div>
            <div className={styles.calendarGrid}>
              {daysInMonth.map((day) => {
                const dayDate = new Date(calendarMonth.getFullYear(), calendarMonth.getMonth(), day);
                // cannot pick a date in the past
                const disabled = dayDate < today;
                // check if this day is the currently selected "moveDate"
                const isSelected =
                  selectedMoveDateObj &&
                  dayDate.toDateString() === selectedMoveDateObj.toDateString();

                return (
                  <button
                    key={day}
                    type="button"
                    className={`${styles.calendarDay} ${
                      isSelected ? styles.selectedDay : ''
                    }`}
                    style={{
                      opacity: disabled ? 0.4 : 1,
                      cursor: disabled ? 'not-allowed' : 'pointer',
                    }}
                    onClick={() => {
                      if (!disabled) {
                        handleSelectMoveDate(dayDate);
                        setShowMoveCalendar(false);
                      }
                    }}
                  >
                    {day}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* ---------- TYPE OF SERVICE (DROPDOWN) ---------- */}
      <div
        className={`${styles.storageDropdown} ${showTypeOfServiceDropdown ? styles.activeInput : ''}`}
        style={{ marginTop: '10px' }}
        onClick={() => {
          setShowTypeOfServiceDropdown((prev) => !prev);
          setShowETARequestDropdown(false);
          setStorageDropdownOpen(false);
          setShowMoveCalendar(false);
          setShowDeliveryCalendar(false);
        }}
        ref={typeOfServiceRef}
      >
        <span className={styles.oneLineEllipsis}>
          <span className={styles.inputLabel}>Type of Service:</span>
          <span className={styles.inputValue}> {serviceType}</span>
        </span>
        <Icon name="UnfoldMore" className={styles.moreIcon}/>

        {showTypeOfServiceDropdown && (
          <div className={styles.dropdownMenu}>
            {typeOfServiceChoices.map((svc) => {
              const isSelected = svc.name === serviceType;
              return (
                <div
                  key={svc.id}
                  className={`${styles.dropdownOption} ${isSelected ? styles.selectedOption : ''}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleSelectServiceType(svc.name);
                  }}
                >
                  {svc.name}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ---------- ADD STORAGE TOGGLE ---------- */}
      <div className={styles.storageContainer}>
        <span className={styles.addStorageText}>Add storage</span>
        <SimpleToggle isToggled={addStorage} onToggle={handleToggleStorage} />
      </div>

      {/* If toggled => show Storage dropdown */}
      {addStorage && (
        <div
          className={`${styles.storageDropdown} ${storageDropdownOpen ? styles.activeInput : ''}`}
          onClick={() => {
            setStorageDropdownOpen((prev) => !prev);
            setShowTypeOfServiceDropdown(false);
            setShowETARequestDropdown(false);
            setShowMoveCalendar(false);
            setShowDeliveryCalendar(false);
          }}
          ref={storageRef}
        >
          <span className={styles.oneLineEllipsis}>
            <span className={styles.inputLabel}>Items in storage:</span>
            <span className={styles.inputValue}> {storageItems}</span>
          </span>
          <Icon name="UnfoldMore" className={styles.moreIcon}/>
          {storageDropdownOpen && (
            <div className={styles.dropdownMenu}>
              {storageOptions.map((option) => {
                const isSelected = option === storageItems;
                return (
                  <div
                    key={option}
                    className={`${styles.dropdownOption} ${
                      isSelected ? styles.selectedOption : ''
                    }`}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSelectStorage(option);
                    }}
                  >
                    {option}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      <div className={styles.spacing30}></div>

      {/* ---------- DELIVERY DATE ---------- */}
      {/* Always visible, but disabled unless Weight/Volume Based Quote OR Add Storage is ON */}
      {(() => {
        const isWeightOrVolumeBased = lead?.rateType === 'Weight Based' || lead?.rateType === 'Volume Based';
        const isEnabled = isWeightOrVolumeBased || addStorage;
        
        return (
          <div
            className={`${styles.inputContainer} ${showDeliveryCalendar ? styles.activeInput : ''} ${
              !isEnabled ? styles.disabledContainer : ''
            }`}
            style={{ position: 'relative' }}
          >
            <button
              type="button"
              className={styles.dateButton}
              onClick={() => {
                if (!isEnabled) return;
                setShowDeliveryCalendar((prev) => !prev);
                setShowMoveCalendar(false);
              }}
              disabled={!isEnabled}
            >
              <span className={styles.oneLineEllipsis}>
                <span className={styles.dateLabelPrefix}>Delivery Date:</span>
                <span className={deliveryDate ? styles.dateSelected : styles.datePlaceholder}>
                  {deliveryDate || ''}
                </span>
              </span>
              <div className={styles.calendarRightIconWrapper}>
                <Icon name="Calendar" className={styles.calendarIcon} />
              </div>
            </button>

            {showDeliveryCalendar && (
              <div className={styles.calendarPopup} ref={deliveryCalendarRef}>
                <div className={styles.calendarHeader}>
                  <button onClick={goPrevMonth}>Prev</button>
                  <span>
                    {calendarMonth.toLocaleString('default', { month: 'long' })}{' '}
                    {calendarMonth.getFullYear()}
                  </span>
                  <button onClick={goNextMonth}>Next</button>
                </div>
                <div className={styles.calendarGrid}>
                  {daysInMonth.map((day) => {
                    const dayDate = new Date(calendarMonth.getFullYear(), calendarMonth.getMonth(), day);

                    let earliestDelivery = new Date(today.getTime());
                    if (moveDate) {
                      const moveDateObj = new Date(moveDate);
                      moveDateObj.setHours(0, 0, 0, 0);
                      if (!isNaN(moveDateObj)) {
                        earliestDelivery = moveDateObj;
                      }
                    }

                    const disabled = dayDate < earliestDelivery;

                    const isSelected =
                      selectedDeliveryDateObj &&
                      dayDate.toDateString() === selectedDeliveryDateObj.toDateString();

                    return (
                      <button
                        key={day}
                        type="button"
                        className={`${styles.calendarDay} ${
                          isSelected ? styles.selectedDay : ''
                        }`}
                        style={{
                          opacity: disabled ? 0.4 : 1,
                          cursor: disabled ? 'not-allowed' : 'pointer',
                        }}
                        onClick={() => {
                          if (!disabled) {
                            handleSelectDeliveryDate(dayDate);
                            setShowDeliveryCalendar(false);
                          }
                        }}
                      >
                        {day}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        );
      })()}

      {/* ---------- ETA REQUEST (DROPDOWN) ---------- */}
      <div
        className={`${styles.storageDropdown} ${showETARequestDropdown ? styles.activeInput : ''}`}
        style={{ marginTop: '10px' }}
        onClick={() => {
          setShowETARequestDropdown((prev) => !prev);
          setShowTypeOfServiceDropdown(false);
          setStorageDropdownOpen(false);
          setShowMoveCalendar(false);
          setShowDeliveryCalendar(false);
        }}
        ref={etaRequestRef}
      >
        <span className={styles.oneLineEllipsis}>
          <span className={styles.inputLabel}>ETA Request:</span>
          <span className={styles.inputValue}> {etaRequest}</span>
        </span>
        <Icon name="UnfoldMore" className={styles.moreIcon} />

        {showETARequestDropdown && (
          <div className={styles.dropdownMenu}>
            {etaRequestOptions.map((opt) => {
              const isSelected = opt === etaRequest;
              return (
                <div
                  key={opt}
                  className={`${styles.dropdownOption} ${
                    isSelected ? styles.selectedOption : ''
                  }`}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleSelectEtaRequest(opt);
                  }}
                >
                  {opt}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ---------- TIME PROMISED TOGGLE ---------- */}
      <div className={styles.timePromisedRow}>
        <span className={styles.timePromisedText}>Time promised</span>
        <SimpleToggle isToggled={timePromised} onToggle={handleToggleTimePromised} />
      </div>

      {timePromised && (
        <div
          className={`${styles.arrivalTimeInput} ${showStartTimeDropdown || showIncrementsGrid ? styles.activeInput : ''}`}
          onClick={() => {
            const newVal = !showStartTimeDropdown;
            if (!newVal && arrivalStart && !arrivalTime && showIncrementsGrid) {
              defaultToTwoHours();
            }
            setShowStartTimeDropdown(newVal);
            setShowIncrementsGrid(false);
          }}
        >
          <span className={styles.oneLineEllipsis}>
            <span className={styles.inputLabel}>Arrival Time:</span>
            <span className={styles.inputValue}> {arrivalTime || 'Select'}</span>
          </span>
          <div className={styles.inputIconContainer}>
            <Icon name="Clock" className={styles.inputIcon} />
          </div>

          {showStartTimeDropdown && (
            <div
              className={styles.timeDropdown}
              ref={startTimeDropdownRef}
              onClick={(e) => e.stopPropagation()}
            >
              {timeSlots.map((slot) => {
                const isSelected = slot === arrivalStart;
                return (
                  <div
                    key={slot}
                    className={`${styles.timeOption} ${
                      isSelected ? styles.selectedOption : ''
                    }`}
                    onClick={(e) => {
                      e.stopPropagation();
                      setArrivalStart(slot);
                      setValue('arrivalTime','')
                      setShowIncrementsGrid(true);
                      setShowStartTimeDropdown(false);
                    }}
                  >
                    {slot}
                  </div>
                );
              })}
            </div>
          )}

          {showIncrementsGrid && (
            <div
              className={styles.addHoursGrid}
              ref={incrementsGridRef}
              onClick={(e) => e.stopPropagation()}
            >
              {[2, 4, 6, 8].map((inc) => (
                <button
                  key={inc}
                  className={styles.addHoursButton}
                  onClick={(e) => {
                    e.stopPropagation();
                    const [hhmm, ampm] = arrivalStart.split(' ');
                    const [hS, mS] = hhmm.split(':');
                    let hh = Number(hS);
                    let mm = Number(mS);
                    let suffix = ampm;
                    hh += inc;
                    while (hh > 12) {
                      hh -= 12;
                      suffix = suffix === 'AM' ? 'PM' : 'AM';
                    }
                    if (hh === 0) hh = 12;
                    const mmStr = mm.toString().padStart(2, '0');
                    const rangeStr = `${arrivalStart} - ${hh}:${mmStr} ${suffix}`;
                    setValue('arrivalTime',rangeStr)
                    setShowIncrementsGrid(false);
                    handleSetArrivalTime(rangeStr);
                  }}
                >
                  +{inc}h
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      <div className={styles.spacing20}></div>

      {/* PASS in isCollapsed states from local state */}
      <OriginDetails
        onShowInventory={onShowInventory}
        onOriginUpdated={handleOriginUpdated}
        onDestinationUpdated={handleDestinationUpdated}
        lead={lead}
        originStops={originStops}
        setOriginStops={setOriginStops}
        destinationStops={destinationStops}
      />

      <DestinationDetails
        lead={lead}
        isStorageToggled={addStorage}
        onOriginUpdated={handleOriginUpdated}
        onDestinationUpdated={handleDestinationUpdated}
        originStops={originStops}
        destinationStops={destinationStops}
        setDestinationStops={setDestinationStops}
      />

      <LogisticsDetails
        lead={lead}
        onLeadUpdated={onLeadUpdated}
        isStorageEnabled={addStorage}
      />

      <EstimateDetails
        lead={lead}
        onLeadUpdated={onLeadUpdated}
         isStorageEnabled={addStorage}
      />
    </div>
  );
}

export default MoveDetailsPanel;