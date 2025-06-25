"use client";

import React, { useState, useEffect, useRef, useCallback } from 'react';
import styles from "./MyInventory.module.css";
import rooms from '../../../../../../../../data/constants/AllRoomsList';
import { optionsData } from '../../../../../../../../data/constants/optionsData';
import Icon from 'src/app/components/Icon';

/**
 * Convert "Drop off 2" => "2_drop", "Post Storage Drop off 3" => "post_storage_3_drop"
 */
function labelToDropTag(labelString) {
  const trimmed = labelString.trim().toLowerCase();
  if (trimmed === 'main drop off') return 'main_drop_off';

  const dropMatch = trimmed.match(/^drop off\s+(\d+)$/);
  if (dropMatch) {
    return `${dropMatch[1]}_drop`;
  }
  if (trimmed === 'post storage main drop off') {
    return 'post_storage_main_drop';
  }
  const psDropMatch = trimmed.match(/^post storage drop off\s+(\d+)$/);
  if (psDropMatch) {
    return `post_storage_${psDropMatch[1]}_drop`;
  }
  // fallback => slug
  return trimmed.replace(/\s+/g, '_').replace(/[^\w_]/g, '');
}

/**
 * Master dictionary from tag => Icon
 */
const tagIcons = {
  // Packing & item tags
  cp_packed_by_movers: 'CpPackedByMovers',
  pbo_packed_by_customer: 'PboPackedByCustomer',
  crating: 'Crating',
  blanket_wrapped: 'BlanketWrapped',
  paper_blanket_wrapped: 'PaperBlanketWrapped',
  purchased_blankets: 'PurchasedBlankets',
  pack_and_leave_behind: 'PackAndLeaveBehind',
  swap_blanket_for_shrink_wrap: 'SwapBlanketForShrinkWrap',
  customer_provided_box: 'CustomerProvidedBox',
  sold_box_no_labor: 'SoldBoxNoLabor',
  unpacking: 'Unpacking',
  inspect_and_repack: 'InspectAndRepack',
  bulky: 'Bulky',
  disassembly: 'Disassembly',
  assembly: 'Assembly',
  pressboard: 'PressBoard',
  fragile: 'Fragile',
  mayor_appliance: 'MayorAppliance',
  extraordinary_value: 'ExtraordinaryValue',
  kit_furniture_assembly: 'KitFurnitureAssembly',

  // Possibly hidden in UI logic, but we still have icons:
  excluded: 'Excluded',
  may_not_ship: 'MayNotShip',

  // Load points
  item_in_closet: 'ItemInCloset',
  hoisting_origin: 'HoistingOrigin',
  crane_origin: 'CraneOrigin',
  moving_within_premises: 'MovingWithinPremises',
  help_with_loading: 'HelpWithLoading',

  // Five special location tags
  disposal: 'Disposal',
  item_for_company_storage: 'ItemForCompanyStorage',
  help_with_unloading: 'HelpWithLoading',
  hoisting_destination: 'HoistingDestination',
  crane_destination: 'CraneDestination',

  // Numeric stops already present:
  main_drop_off: 'MainDropOff',
  '2_drop': 'Drop2',
  '3_drop': 'Drop3',
  post_storage_main_drop: 'PostStorageMainDrop',
  'post_storage_2_drop': 'PostStorage2Drop',
  'post_storage_3_drop': 'PostStorage3Drop',

  // Additional numeric stops up to 9:
  '4_drop': 'Drop4',
  '5_drop': 'Drop5',
  '6_drop': 'Drop6',
  '7_drop': 'Drop7',
  '8_drop': 'Drop8',
  '9_drop': 'Drop9',

  post_storage_4_drop: 'PostStorage4Drop',
  post_storage_5_drop: 'PostStorage5Drop',
  post_storage_6_drop: 'PostStorage6Drop',
  post_storage_7_drop: 'PostStorage7Drop',
  post_storage_8_drop: 'PostStorage8Drop',
  post_storage_9_drop: 'PostStorage9Drop',
};

/** 
 * Identify if the given tag is "4_drop", "5_drop", "post_storage_9_drop", etc.
 * i.e. numeric drop beyond #3
 */
function isNumericDropBeyond3(tagValue) {
  // e.g. "4_drop"
  const m1 = tagValue.match(/^(\d+)_drop$/);
  if (m1) {
    const num = parseInt(m1[1], 10);
    return num > 3; 
  }
  // e.g. "post_storage_(\d+)_drop"
  const m2 = tagValue.match(/^post_storage_(\d+)_drop$/);
  if (m2) {
    const num = parseInt(m2[1], 10);
    return num > 3;
  }
  return false;
}

/**
 * MyInventory Component
 */
function MyInventory({
  lead,
  setIsMyInventoryVisible,
  roomItemSelections = {},  // Individual items approach
  displayedRooms = []
}) {
  const handleClose = useCallback(() => {
    setIsMyInventoryVisible(false);
  }, [setIsMyInventoryVisible]);

  const popupContentRef = useRef(null);

  // "listOfItems" or "descriptiveSymbols"
  const [selectedOption, setSelectedOption] = useState('listOfItems');

  useEffect(() => {
    function handleClickOutside(e) {
      if (
        popupContentRef.current &&
        !popupContentRef.current.contains(e.target)
      ) {
        handleClose();
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [handleClose]);

  // Build a set of "active" drop points from lead
  // Support both destinationStops (old) and destinations (new)
  const destinationStops = lead?.destinations || [];
  const activeStops = destinationStops.filter(s => s.isActive && (s.isVisible ?? true));
  
  const postStorageStops = activeStops.filter((s) => s.postStorage);
  const normalStops = activeStops.filter((s) => !s.postStorage);
  
  const labeledActiveStops = activeStops
    .map((stop) => {
      const isPost = stop.postStorage;
      const group = isPost ? postStorageStops : normalStops;
      const position = group.indexOf(stop);
      const isFirst = position === 0;

      const label = isPost
        ? isFirst
          ? "Post Storage Main Drop off"
          : `Post Storage Drop off ${position + 1}`
        : isFirst
          ? "Main Drop off"
          : `Drop off ${position + 1}`;

      return { ...stop, label };
    })
    .filter((s) => s.isActive);
    
  const activeDropPointsSet = new Set(
    labeledActiveStops.map((s) => labelToDropTag(s.label))
  );

  // Combine all base tags from optionsData
  const allBaseTags = [
    ...optionsData.itemTags.packing,
    ...optionsData.itemTags.extraAttention,
    ...optionsData.locationTags.loadPoints,
    ...optionsData.locationTags.dropPoints,
  ];

  // For DESCRIPTIVE SYMBOLS
  const fiveSpecialValues = [
    'disposal',
    'item_for_company_storage',
    'help_with_unloading',
    'hoisting_destination',
    'crane_destination',
  ];

  const tagsForDescriptiveSymbols = allBaseTags
    .map((tag) => ({
      value: tag.value,
      label: tag.label,
      IconComponent: tagIcons[tag.value],
    }))
    .filter(({ value }) => {
      // If it's one of the five special => keep
      if (fiveSpecialValues.includes(value)) return true;

      // If it's a numeric drop beyond 3 => hide
      if (isNumericDropBeyond3(value)) return false;

      // Otherwise keep
      return true;
    });

  // For LIST OF ITEMS tab => group by room
  const getGroupedItemsByRoom = useCallback(() => {
    let grandTotalItems = 0;
    let grandTotalLbs = 0;
    let grandTotalCuft = 0;

    const validRoomIds = Object.keys(roomItemSelections)
      .filter((roomId) => {
        const numId = parseInt(roomId, 10);
        if (!displayedRooms.includes(numId)) return false;
        const arr = roomItemSelections[roomId];
        return Array.isArray(arr) && arr.length > 0;
      })
      .sort((a, b) => {
        // Put "13" last (boxes room), otherwise sort numerically
        if (a === '13') return 1;
        if (b === '13') return -1;
        return parseInt(a) - parseInt(b);
      });

    const roomsWithItems = validRoomIds.map((roomId) => {
      const numId = parseInt(roomId, 10);
      const roomArr = roomItemSelections[roomId];
      const roomObj = rooms.find(r => r.id === numId) || {
        id: numId,
        name: `Room #${roomId}`,
      };

      // Group individual items by groupingKey for display
      const grouped = {};
      for (const inst of roomArr) {
        const gk = inst.groupingKey || 'no-group';
        if (!grouped[gk]) {
          grouped[gk] = {
            // Support both field names for compatibility
            furnitureItemId: inst.furnitureItemId,
            name: inst.name|| '(Unnamed)',
            tags: Array.isArray(inst.tags) ? [...inst.tags] : [],
            cuft: parseFloat(inst.cuft) || 0,
            lbs: parseFloat(inst.lbs) || 0,
            count: 1,  // Start at 1 for each individual item
          };
        } else {
          grouped[gk].count += 1;  // Increment for display
        }
      }

      const groupedItemsArray = Object.values(grouped);
      const totalItems = groupedItemsArray.reduce((acc, i) => acc + i.count, 0);
      const totalLbs = groupedItemsArray.reduce((acc, i) => acc + i.count * i.lbs, 0);
      const totalCuft = groupedItemsArray.reduce((acc, i) => acc + i.count * i.cuft, 0);

      grandTotalItems += totalItems;
      grandTotalLbs += totalLbs;
      grandTotalCuft += totalCuft;

      return {
        roomId,
        roomName: roomObj.name,
        groupedItems: groupedItemsArray,
        totalItems,
        totalLbs,
        totalCuft,
      };
    });

    return {
      roomsWithItems,
      grandTotalItems,
      grandTotalLbs,
      grandTotalCuft,
    };
  }, [roomItemSelections, displayedRooms]);

  const {
    roomsWithItems,
    grandTotalItems,
    grandTotalLbs,
    grandTotalCuft,
  } = getGroupedItemsByRoom();

  // The two tabs
  const tabOptions = [
    { value: 'listOfItems', label: 'List of items' },
    { value: 'descriptiveSymbols', label: 'Descriptive Symbols' },
  ];

  return (
    <div className={styles.popup}>
      <div className={styles.popupContent} ref={popupContentRef}>

        {/* Header */}
        <div className={styles.header}>
          <div className={styles.title}>
            <Icon name="MyInventoryPopupIcon" className={styles.icon}/>
            <p>My Inventory</p>
          </div>
          <div className={styles.closeButton}>
            <button type="button" onClick={handleClose} aria-label="Close">
              <Icon name="Close" width={20} height={20} className={styles.closeIcon}/>
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className={styles.radioGroup}>
          {tabOptions.map(opt => (
            <label key={opt.value} className={styles.radioLabel}>
              <input
                type="radio"
                name="inventoryOption"
                value={opt.value}
                checked={selectedOption === opt.value}
                onChange={(e) => setSelectedOption(e.target.value)}
                className={styles.radioInput}
              />
              <span className={styles.radioText}>{opt.label}</span>
            </label>
          ))}
        </div>

        {/* ================ LIST OF ITEMS TAB ================ */}
        {selectedOption === 'listOfItems' && (
          <>
            {roomsWithItems.length > 0 ? (
              <>
                <div className={styles.tableHeader}>
                  <div className={styles.descriptionHeader}>Description</div>
                  <div className={styles.qtyHeader}>Qty</div>
                  <div className={styles.tagsHeader}>Tags</div>
                </div>

                <div className={styles.content}>
                  {roomsWithItems.map((room, idxRoom) => (
                    <div
                      key={`room-${room.roomId}`}
                      className={`${styles.roomSection} ${
                        idxRoom === 0 ? styles.firstRoom : ''
                      }`}
                    >
                      <h3 className={styles.roomName}>{room.roomName}</h3>
                      <div className={styles.itemsTable}>
                        {room.groupedItems.map((itm, idxItem) => {
                          // Filter numeric drop tags that are not in active stops
                          const filteredTags = itm.tags.filter(tVal => {
                            const isDrop = optionsData.locationTags.dropPoints.some(
                              (dp) => dp.value === tVal
                            );
                            // If it's a numeric stop (like "4_drop") and not active => hide
                            // But if it's one of the 5 special => keep
                            if (isDrop) {
                              if (fiveSpecialValues.includes(tVal)) {
                                return true; // Always keep
                              }
                              // else only keep if active
                              return activeDropPointsSet.has(tVal);
                            }
                            return true;
                          });

                          return (
                            <div
                              key={`itm-${idxItem}`}
                              className={styles.itemRow}
                            >
                              <div className={styles.descriptionCell}>
                                <div className={styles.descriptionContent}>
                                  <span>{itm.name}</span>
                                </div>
                              </div>
                              <div className={styles.qtyCell}>{itm.count}</div>
                              <div className={styles.tagsCell}>
                                {filteredTags.map((tg, i2) => {
                                  const IconComp = tagIcons[tg];
                                  return (
                                    <span
                                      key={`tag-${i2}`}
                                      className={styles.tag}
                                    >
                                      {IconComp ? (
                                        <Icon name={IconComp} width={24} height={24}/>
                                      ) : (
                                        tg
                                      )}
                                    </span>
                                  );
                                })}
                              </div>
                            </div>
                          );
                        })}

                        {/* Room Totals */}
                        <div className={`${styles.itemRow} ${styles.totalRow}`}>
                          <div className={styles.descriptionCell}>Total:</div>
                          <div className={styles.qtyCell}>{room.totalItems}</div>
                          <div className={styles.tagsCell}>
                            {Math.round(room.totalLbs)} lbs&nbsp;&nbsp;
                            {Math.round(room.totalCuft)} Cuft
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}

                  {/* Grand Total */}
                  <div className={styles.grandTotalSection}>
                    <div
                      className={`${styles.itemRow} ${styles.grandTotalRow}`}
                    >
                      <div className={styles.descriptionCell}>Grand Total:</div>
                      <div className={styles.qtyCell}>{grandTotalItems}</div>
                      <div className={styles.tagsCell}>
                        {Math.round(grandTotalLbs)} lbs&nbsp;&nbsp;
                        {Math.round(grandTotalCuft)} Cuft
                      </div>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <div className={styles.noItemsMessage}>
                Add items to see them here.
              </div>
            )}
          </>
        )}

        {/* ============== DESCRIPTIVE SYMBOLS TAB ============== */}
        {selectedOption === 'descriptiveSymbols' && (
          <div className={`${styles.content} ${styles.descriptiveContent}`}>
            <div className={styles.descriptiveSymbolsContainer}>
              {tagsForDescriptiveSymbols.map(({ value, label, IconComponent }) => (
                <div key={value} className={styles.tagRow}>
                  <div className={styles.tagIcon}>
                    {IconComponent && (
                      <Icon name={IconComponent} width={24} height={24}/>
                    )}
                  </div>
                  <div className={styles.tagName}>{label}</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default MyInventory;