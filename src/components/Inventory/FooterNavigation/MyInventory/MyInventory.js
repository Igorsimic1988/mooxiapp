// src/components/MyInventory/MyInventory.js

import React, { useState, useEffect, useRef, useCallback } from 'react';
import styles from "./MyInventory.module.css";
import rooms from '../../../../data/constants/AllRoomsList';

import { optionsData } from '../../../../data/constants/optionsData';

import { ReactComponent as MyInventoryPopupIcon } from "../../../../assets/icons/MyInventoryPopupIcon.svg";
import { ReactComponent as CloseIcon } from "../../../../assets/icons/Close.svg";

// Import tag icons
// Import tag icons
import { ReactComponent as CpPackedByMoversIcon } from "../../../../assets/icons/cp_packed_by_movers.svg";
import { ReactComponent as PboPackedByCustomerIcon } from "../../../../assets/icons/pbo_packed_by_customer.svg";
import { ReactComponent as CratingIcon } from "../../../../assets/icons/crating.svg";
import { ReactComponent as BlanketWrappedIcon } from "../../../../assets/icons/blanket_wrapped.svg";
import { ReactComponent as PaperBlanketWrappedIcon } from "../../../../assets/icons/paper_blanket_wrapped.svg";
import { ReactComponent as PurchasedBlanketsIcon } from "../../../../assets/icons/purchased_blankets.svg";
import { ReactComponent as PackAndLeaveBehindIcon } from "../../../../assets/icons/pack_and_leave_behind.svg";
import { ReactComponent as KeepBlanketOnIcon } from "../../../../assets/icons/keep_blanket_on.svg";
import { ReactComponent as UnpackingIcon } from "../../../../assets/icons/unpacking.svg";
import { ReactComponent as InspectAndRepackIcon } from "../../../../assets/icons/inspect_and_repack.svg";
import { ReactComponent as BulkyIcon } from "../../../../assets/icons/bulky.svg";
import { ReactComponent as DisassemblyIcon } from "../../../../assets/icons/disassembly.svg";
import { ReactComponent as AssemblyIcon } from "../../../../assets/icons/assembly.svg";
import { ReactComponent as PressboardIcon } from "../../../../assets/icons/pressboard.svg";
import { ReactComponent as FragileIcon } from "../../../../assets/icons/fragile.svg";
import { ReactComponent as MayorApplianceIcon } from "../../../../assets/icons/mayor_appliance.svg";
import { ReactComponent as ExtraordinaryValueIcon } from "../../../../assets/icons/extraordinary_value.svg";
import { ReactComponent as KitFurnitureAssemblyIcon } from "../../../../assets/icons/kit_furniture_assembly.svg";
import { ReactComponent as ExcludedIcon } from "../../../../assets/icons/excluded.svg";
import { ReactComponent as MayNotShipIcon } from "../../../../assets/icons/may_not_ship.svg";
import { ReactComponent as ItemInClosetIcon } from "../../../../assets/icons/item_in_closet.svg";
import { ReactComponent as HoistingOriginIcon } from "../../../../assets/icons/hoisting_origin.svg";
import { ReactComponent as CraneOriginIcon } from "../../../../assets/icons/crane_origin.svg";
import { ReactComponent as MovingWithinPremisesIcon } from "../../../../assets/icons/moving_within_premises.svg";
import { ReactComponent as HelpWithLoadingIcon } from "../../../../assets/icons/help_with_loading.svg";
import { ReactComponent as DisposalIcon } from "../../../../assets/icons/disposal.svg";
import { ReactComponent as ItemForCompanyStorageIcon } from "../../../../assets/icons/item_for_company_storage.svg";
import { ReactComponent as HelpWithUnloadingIcon } from "../../../../assets/icons/help_with_unloading.svg";
import { ReactComponent as HoistingDestinationIcon } from "../../../../assets/icons/hoisting_destination.svg";
import { ReactComponent as CraneDestinationIcon } from "../../../../assets/icons/crane_destination.svg";
import { ReactComponent as MainDropOffIcon } from "../../../../assets/icons/main_drop_off.svg";
import { ReactComponent as SecondDropIcon } from "../../../../assets/icons/second_drop.svg";
import { ReactComponent as ThirdDropIcon } from "../../../../assets/icons/third_drop.svg";
import { ReactComponent as PostStorageMainDropIcon } from "../../../../assets/icons/post_storage_main_drop.svg";
import { ReactComponent as PostStorageSecondDropIcon } from "../../../../assets/icons/post_storage_second_drop.svg";
import { ReactComponent as PostStorageThirdDropIcon } from "../../../../assets/icons/post_storage_third_drop.svg";

// ...import all other tag icons

// Create a mapping of tag names to icons
const tagIcons = {
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
    excluded: ExcludedIcon,
    may_not_ship: MayNotShipIcon,
    item_in_closet: ItemInClosetIcon,
    hoisting_origin: HoistingOriginIcon,
    crane_origin: CraneOriginIcon,
    moving_within_premises: MovingWithinPremisesIcon,
    help_with_loading: HelpWithLoadingIcon,
    disposal: DisposalIcon,
    item_for_company_storage: ItemForCompanyStorageIcon,
    help_with_unloading: HelpWithUnloadingIcon,
    hoisting_destination: HoistingDestinationIcon,
    crane_destination: CraneDestinationIcon,
    main_drop_off: MainDropOffIcon,
    second_drop: SecondDropIcon,
    third_drop: ThirdDropIcon,
    post_storage_main_drop: PostStorageMainDropIcon,
    post_storage_second_drop: PostStorageSecondDropIcon,
    post_storage_third_drop: PostStorageThirdDropIcon,
  };

  function MyInventory({ setIsMyInventoryVisible, roomItemSelections, displayedRooms }) {
    const handleClose = useCallback(() => {
      setIsMyInventoryVisible(false);
    }, [setIsMyInventoryVisible]);
  
    const popupContentRef = useRef(null);
  
    // State for main options ('listOfItems' or 'descriptiveSymbols')
    const [selectedOption, setSelectedOption] = useState('listOfItems');
  
    const getGroupedItemsByRoom = useCallback(() => {
      // Initialize grand totals
      let grandTotalItems = 0;
      let grandTotalLbs = 0;
      let grandTotalCuft = 0;
  
      // Get rooms with items
      const roomsWithItems = Object.keys(roomItemSelections)
        .filter(
          (roomId) =>
            displayedRooms.some((room) => room.id.toString() === roomId) && // Only include visible rooms
            roomItemSelections[roomId].length > 0
        )
        .sort((a, b) => {
          // Place roomId '13' (Boxes room) last
          if (a === '13') return 1;
          if (b === '13') return -1;
          // Otherwise, sort numerically
          return parseInt(a) - parseInt(b);
        })
        .map((roomId) => {
          const roomItems = roomItemSelections[roomId];
          const room = rooms.find((r) => r.id.toString() === roomId);
  
          // Group items by groupingKey
          const groupedItems = roomItems.reduce((acc, itemInstance) => {
            const key = itemInstance.groupingKey;
            if (!acc[key]) {
              acc[key] = {
                itemId: itemInstance.itemId,
                itemName: itemInstance.item.name,
                tags: itemInstance.tags,
                cuft: parseFloat(itemInstance.cuft) || 0,
                lbs: parseFloat(itemInstance.lbs) || 0,
                count: 1,
              };
            } else {
              acc[key].count += 1;
            }
            return acc;
          }, {});
  
          const groupedItemsArray = Object.values(groupedItems);
  
          // Calculate room totals
          const totalItems = groupedItemsArray.reduce((sum, item) => sum + item.count, 0);
          const totalLbs = groupedItemsArray.reduce(
            (sum, item) => sum + item.count * item.lbs,
            0
          );
          const totalCuft = groupedItemsArray.reduce(
            (sum, item) => sum + item.count * item.cuft,
            0
          );
  
          // Accumulate grand totals
          grandTotalItems += totalItems;
          grandTotalLbs += totalLbs;
          grandTotalCuft += totalCuft;
  
          return {
            roomId,
            roomName: room ? room.name : 'Unknown Room',
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
  
    const mainOptions = [
      { value: 'listOfItems', label: 'List of items' },
      { value: 'descriptiveSymbols', label: 'Descriptive Symbols' },
    ];
  
    // Click outside handler
    useEffect(() => {
      const handleClickOutside = (event) => {
        if (
          popupContentRef.current &&
          !popupContentRef.current.contains(event.target)
        ) {
          handleClose();
        }
      };
  
      document.addEventListener('mousedown', handleClickOutside);
  
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }, [handleClose]);

    const allTags = [
      ...optionsData.itemTags.packing,
      ...optionsData.itemTags.extraAttention,
      ...optionsData.locationTags.loadPoints,
      ...optionsData.locationTags.dropPoints,
    ].map(tag => ({
      value: tag.value,
      label: tag.label,
      IconComponent: tagIcons[tag.value],
    }));
  
    return (
      <div className={styles.popup}>
        <div className={styles.popupContent} ref={popupContentRef}>
          {/* Header */}
          <div className={styles.header}>
            <div className={styles.title}>
              <MyInventoryPopupIcon className={styles.icon} />
              <p>My Inventory</p>
            </div>
            <div className={styles.closeButton}>
              <button onClick={handleClose} aria-label="Close">
                <CloseIcon className={styles.closeIcon} />
              </button>
            </div>
          </div>
  
          {/* Main Options */}
          <div className={styles.radioGroup}>
            {mainOptions.map((option) => (
              <label key={option.value} className={styles.radioLabel}>
                <input
                  type="radio"
                  name="inventoryOption"
                  value={option.value}
                  checked={selectedOption === option.value}
                  onChange={(e) => setSelectedOption(e.target.value)}
                  className={styles.radioInput}
                />
                <span className={styles.radioText}>{option.label}</span>
              </label>
            ))}
          </div>
  
          {/* Table Headers */}
          {selectedOption === 'listOfItems' && (
            <>
              <div className={styles.tableHeader}>
                <div className={styles.descriptionHeader}>Description</div>
                <div className={styles.qtyHeader}>Qty</div>
                <div className={styles.tagsHeader}>Tags</div>
              </div>
  
              {/* Scrollable Content */}
              <div className={styles.content}>
                {/* Render Rooms with Items */}
                {getGroupedItemsByRoom().roomsWithItems.map((room, roomIndex) => (
                  <div
                    key={room.roomId}
                    className={`${styles.roomSection} ${
                      roomIndex === 0 ? styles.firstRoom : ''
                    }`}
                  >
                    {/* Room Name */}
                    <h3 className={styles.roomName}>{room.roomName}</h3>
  
                    {/* Items Table */}
                    <div className={styles.itemsTable}>
                      {room.groupedItems.map((item, index) => {
                        // Determine if item has 'excluded' or 'may_not_ship' tags
                        const hasExcludedTag = item.tags.includes('excluded');
                        const hasMayNotShipTag = item.tags.includes('may_not_ship');
  
                        // Remove 'excluded' and 'may_not_ship' from tags to display
                        const displayTags = item.tags.filter(
                          (tag) => tag !== 'excluded' && tag !== 'may_not_ship'
                        );
  
                        return (
                          <div key={index} className={styles.itemRow}>
                            <div className={styles.descriptionCell}>
                              {/* Use flex container for alignment */}
                              <div className={styles.descriptionContent}>
                                {hasExcludedTag && (
                                  <span className={styles.symbol}>
                                    <strong>X</strong>
                                  </span>
                                )}
                                {hasMayNotShipTag && !hasExcludedTag && (
                                  <span className={styles.symbol}>
                                    <strong>?</strong>
                                  </span>
                                )}
                                <span
                                  className={
                                    hasExcludedTag ? styles.strikethrough : ''
                                  }
                                >
                                  {item.itemName}
                                </span>
                              </div>
                            </div>
                            <div className={styles.qtyCell}>{item.count}</div>
                            <div className={styles.tagsCell}>
                              {displayTags.map((tag, idx) => {
                                const TagIcon = tagIcons[tag];
                                return (
                                  <span key={idx} className={styles.tag}>
                                    {TagIcon ? (
                                      <TagIcon width={24} height={24} />
                                    ) : (
                                      tag
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
                  <div className={`${styles.itemRow} ${styles.grandTotalRow}`}>
                    <div className={styles.descriptionCell}>Grand Total:</div>
                    <div className={styles.qtyCell}>
                      {getGroupedItemsByRoom().grandTotalItems}
                    </div>
                    <div className={styles.tagsCell}>
                      {Math.round(getGroupedItemsByRoom().grandTotalLbs)} lbs&nbsp;&nbsp;
                      {Math.round(getGroupedItemsByRoom().grandTotalCuft)} Cuft
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
  
  {selectedOption === 'descriptiveSymbols' && (
          <>
            {/* Scrollable Content with different background */}
            <div className={`${styles.content} ${styles.descriptiveContent}`}>
              <div className={styles.descriptiveSymbolsContainer}>
                {allTags.map(({ value, label, IconComponent }) => (
                  <div key={value} className={styles.tagRow}>
                    <div className={styles.tagIcon}>
                      {IconComponent && <IconComponent width={24} height={24} />}
                    </div>
                    <div className={styles.tagName}>
                      {label}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default MyInventory;