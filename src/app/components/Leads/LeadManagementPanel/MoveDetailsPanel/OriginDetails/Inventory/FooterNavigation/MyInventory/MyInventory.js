import React, { useState, useEffect, useRef, useCallback } from 'react';
import styles from "./MyInventory.module.css";
import rooms from '../../../../../../../../data/constants/AllRoomsList';
import { optionsData } from '../../../../../../../../data/constants/optionsData';
import Image from 'next/image';

import MyInventoryPopupIcon from "../../../../../../../../assets/icons/MyInventoryPopupIcon.svg";
import CloseIcon from "../../../../../../../../assets/icons/Close.svg";

/** 
 * ============== ICON IMPORTS ==============
 *  Include all tags, including your five special ones
 */
import CpPackedByMoversIcon from "../../../../../../../../assets/icons/cp_packed_by_movers.svg";
import PboPackedByCustomerIcon from "../../../../../../../../assets/icons/pbo_packed_by_customer.svg";
import CratingIcon from "../../../../../../../../assets/icons/crating.svg";
import BlanketWrappedIcon from "../../../../../../../../assets/icons/blanket_wrapped.svg";
import PaperBlanketWrappedIcon from "../../../../../../../../assets/icons/paper_blanket_wrapped.svg";
import PurchasedBlanketsIcon from "../../../../../../../../assets/icons/purchased_blankets.svg";
import PackAndLeaveBehindIcon from "../../../../../../../../assets/icons/pack_and_leave_behind.svg";
import KeepBlanketOnIcon from "../../../../../../../../assets/icons/keep_blanket_on.svg";
import UnpackingIcon from "../../../../../../../../assets/icons/unpacking.svg";
import InspectAndRepackIcon from "../../../../../../../../assets/icons/inspect_and_repack.svg";
import BulkyIcon from "../../../../../../../../assets/icons/bulky.svg";
import DisassemblyIcon from "../../../../../../../../assets/icons/disassembly.svg";
import AssemblyIcon from "../../../../../../../../assets/icons/assembly.svg";
import PressboardIcon from "../../../../../../../../assets/icons/pressboard.svg";
import FragileIcon from "../../../../../../../../assets/icons/fragile.svg";
import MayorApplianceIcon from "../../../../../../../../assets/icons/mayor_appliance.svg";
import ExtraordinaryValueIcon from "../../../../../../../../assets/icons/extraordinary_value.svg";
import KitFurnitureAssemblyIcon from "../../../../../../../../assets/icons/kit_furniture_assembly.svg";
import ExcludedIcon from "../../../../../../../../assets/icons/excluded.svg";
import MayNotShipIcon from "../../../../../../../../assets/icons/may_not_ship.svg";
import ItemInClosetIcon from "../../../../../../../../assets/icons/item_in_closet.svg";
import HoistingOriginIcon from "../../../../../../../../assets/icons/hoisting_origin.svg";
import CraneOriginIcon from "../../../../../../../../assets/icons/crane_origin.svg";
import MovingWithinPremisesIcon from "../../../../../../../../assets/icons/moving_within_premises.svg";
import HelpWithLoadingIcon from "../../../../../../../../assets/icons/help_with_loading.svg";

/** 
 * The five special tags 
 * (which are also in dropPoints, but we want them always visible).
 */
import  DisposalIcon from "../../../../../../../../assets/icons/disposal.svg";
import  ItemForCompanyStorageIcon from "../../../../../../../../assets/icons/item_for_company_storage.svg";
import  HelpWithUnloadingIcon from "../../../../../../../../assets/icons/help_with_unloading.svg";
import  HoistingDestinationIcon from "../../../../../../../../assets/icons/hoisting_destination.svg";
import  CraneDestinationIcon from "../../../../../../../../assets/icons/crane_destination.svg";

/** Numeric drop points (already have 2_drop, 3_drop, etc.) */
import  MainDropOffIcon from "../../../../../../../../assets/icons/main_drop_off.svg";
import  TwoDropIcon from "../../../../../../../../assets/icons/2_drop.svg";
import  ThreeDropIcon from "../../../../../../../../assets/icons/3_drop.svg";
import  PostStorageMainDropIcon from "../../../../../../../../assets/icons/post_storage_main_drop.svg";
import  PostStorage2DropIcon from "../../../../../../../../assets/icons/post_storage_2_drop.svg";
import  PostStorage3DropIcon from "../../../../../../../../assets/icons/post_storage_3_drop.svg";

/** 
 * ============== ADDITIONAL DROP ICON IMPORTS ==============
 * for 4_drop through 9_drop, and post_storage_4_drop through post_storage_9_drop
 */
import  FourDropIcon from "../../../../../../../../assets/icons/4_drop.svg";
import  FiveDropIcon from "../../../../../../../../assets/icons/5_drop.svg";
import  SixDropIcon from "../../../../../../../../assets/icons/6_drop.svg";
import  SevenDropIcon from "../../../../../../../../assets/icons/7_drop.svg";
import  EightDropIcon from "../../../../../../../../assets/icons/8_drop.svg";
import  NineDropIcon from "../../../../../../../../assets/icons/9_drop.svg";

import  PostStorage4DropIcon from "../../../../../../../../assets/icons/post_storage_4_drop.svg";
import  PostStorage5DropIcon from "../../../../../../../../assets/icons/post_storage_5_drop.svg";
import  PostStorage6DropIcon from "../../../../../../../../assets/icons/post_storage_6_drop.svg";
import  PostStorage7DropIcon from "../../../../../../../../assets/icons/post_storage_7_drop.svg";
import  PostStorage8DropIcon from "../../../../../../../../assets/icons/post_storage_8_drop.svg";
import  PostStorage9DropIcon from "../../../../../../../../assets/icons/post_storage_9_drop.svg";

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
  cp_packed_by_movers: CpPackedByMoversIcon,
  pbo_packed_by_customer: PboPackedByCustomerIcon,
  crating: CratingIcon,
  blanket_wrapped: BlanketWrappedIcon,
  paper_blanket_wrapped: PaperBlanketWrappedIcon,
  purchased_blankets: PurchasedBlanketsIcon,
  pack_and_leave_behind: PackAndLeaveBehindIcon,
  keep_blanket_on: KeepBlanketOnIcon,
  unpacking: UnpackingIcon,
  inspect_and_repack: InspectAndRepackIcon,
  bulky: BulkyIcon,
  disassembly: DisassemblyIcon,
  assembly: AssemblyIcon,
  pressboard: PressboardIcon,
  fragile: FragileIcon,
  mayor_appliance: MayorApplianceIcon,
  extraordinary_value: ExtraordinaryValueIcon,
  kit_furniture_assembly: KitFurnitureAssemblyIcon,

  // Possibly hidden in UI logic, but we still have icons:
  excluded: ExcludedIcon,
  may_not_ship: MayNotShipIcon,

  // Load points
  item_in_closet: ItemInClosetIcon,
  hoisting_origin: HoistingOriginIcon,
  crane_origin: CraneOriginIcon,
  moving_within_premises: MovingWithinPremisesIcon,
  help_with_loading: HelpWithLoadingIcon,

  // Five special location tags
  disposal: DisposalIcon,
  item_for_company_storage: ItemForCompanyStorageIcon,
  help_with_unloading: HelpWithUnloadingIcon,
  hoisting_destination: HoistingDestinationIcon,
  crane_destination: CraneDestinationIcon,

  // Numeric stops already present:
  main_drop_off: MainDropOffIcon,
  '2_drop': TwoDropIcon,
  '3_drop': ThreeDropIcon,
  post_storage_main_drop: PostStorageMainDropIcon,
  'post_storage_2_drop': PostStorage2DropIcon,
  'post_storage_3_drop': PostStorage3DropIcon,

  // Additional numeric stops up to 9:
  '4_drop': FourDropIcon,
  '5_drop': FiveDropIcon,
  '6_drop': SixDropIcon,
  '7_drop': SevenDropIcon,
  '8_drop': EightDropIcon,
  '9_drop': NineDropIcon,

  post_storage_4_drop: PostStorage4DropIcon,
  post_storage_5_drop: PostStorage5DropIcon,
  post_storage_6_drop: PostStorage6DropIcon,
  post_storage_7_drop: PostStorage7DropIcon,
  post_storage_8_drop: PostStorage8DropIcon,
  post_storage_9_drop: PostStorage9DropIcon,
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
  roomItemSelections = {},
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
  const activeStops = lead?.destinationStops?.filter(s => s.isActive) || [];
  const activeDropPointsSet = new Set();
  activeStops.forEach((stop) => {
    const val = labelToDropTag(stop.label);
    activeDropPointsSet.add(val);
  });

  // Combine all base tags from optionsData
  const allBaseTags = [
    ...optionsData.itemTags.packing,
    ...optionsData.itemTags.extraAttention,
    ...optionsData.locationTags.loadPoints,
    ...optionsData.locationTags.dropPoints,
  ];

  // For DESCRIPTIVE SYMBOLS
  // Hide numeric drop points beyond 3 (like 4_drop, 5_drop, post_storage_9_drop).
  // But keep the five special location tags even if they appear in dropPoints.
  // They are not numeric stops.
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
      // If it’s one of the five special => keep
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
        // Put "13" last (some special logic?), otherwise sort numerically
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

      // group by groupingKey
      const grouped = {};
      for (const inst of roomArr) {
        const gk = inst.groupingKey || 'no-group';
        if (!grouped[gk]) {
          grouped[gk] = {
            itemId: inst.itemId,
            itemName: inst.item?.name || '(Unnamed)',
            tags: Array.isArray(inst.tags) ? [...inst.tags] : [],
            cuft: parseFloat(inst.cuft) || 0,
            lbs: parseFloat(inst.lbs) || 0,
            count: 1,
          };
        } else {
          grouped[gk].count += 1;
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
            <Image src = {MyInventoryPopupIcon} alt = 'myInventoryPopupIcon' className={styles.icon}/>
            <p>My Inventory</p>
          </div>
          <div className={styles.closeButton}>
            <button type="button" onClick={handleClose} aria-label="Close">
              <Image src = {CloseIcon} alt = 'closeIcon' className={styles.closeIcon}/>
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
                          // (except the 5 special tags).
                          const filteredTags = itm.tags.filter(tVal => {
                            const isDrop = optionsData.locationTags.dropPoints.some(
                              (dp) => dp.value === tVal
                            );
                            // If it's a numeric stop (like "4_drop") and not active => hide
                            // But if it's one of the 5 special => keep
                            if (isDrop) {
                              if (
                                tVal === 'disposal' ||
                                tVal === 'item_for_company_storage' ||
                                tVal === 'help_with_unloading' ||
                                tVal === 'hoisting_destination' ||
                                tVal === 'crane_destination'
                              ) {
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
                                  <span>{itm.itemName}</span>
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
                                        <Image src = {IconComp} alt = 'iconComp' width={24} height={24}/>
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
                      <Image src = {IconComponent} alt = 'iconComponent' width={24} height={24}/>
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
