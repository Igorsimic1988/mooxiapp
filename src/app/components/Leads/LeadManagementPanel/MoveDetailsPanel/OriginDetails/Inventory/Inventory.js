"use client";
// If you're using Next.js 13 app router, you often need "use client" at the top

import React, { useState, useEffect, useRef, useCallback } from "react";
import styles from "./Inventory.module.css";

// Child components
import RoomList from "./RoomList/RoomList";
import HouseHeader from "./HouseHeader/HouseHeader";
import FooterNavigation from "./FooterNavigation/FooterNavigation";
import ItemSelection from "./ItemSelection/ItemSelection";
import SearchHeader from "./SearchHeader/SearchHeader";
import InventoryDesktop from "./InventoryDesktop/InventoryDesktop";
import ItemPopup from "./ItemSelection/Item/ItemPopup/ItemPopup";

// Data + Utils
import rooms from "../../../../../../data/constants/AllRoomsList";
import allItems from "../../../../../../data/constants/funitureItems";
import { v4 as uuidv4 } from "uuid";
import { generateGroupingKey } from "./utils/generateGroupingKey";

// Inventory Service
import {
  getInventoryByLeadId,
  createOrUpdateInventory,
} from "../../../../../../services/inventoryService";

// The “default displayed” rooms as numeric IDs
const defaultRoomIds = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13];

function Inventory({
  lead,
  onCloseInventory,
  inventoryRoom,    // the currently selected room object (for mobile)
  setInventoryRoom, // function to set selected room object (for mobile)
}) {
  // Which "Stop" index we’re on (0-based)
  const [stopIndex, setStopIndex] = useState(0);

  // Keep track if we’ve loaded data so we don’t immediately overwrite
  const [hasLoadedInventory, setHasLoadedInventory] = useState(false);

  // The big object keyed by stopIndex => { displayedRooms, itemsByRoom }
  const [inventoryByStop, setInventoryByStop] = useState({});

  // If mobile, "inventoryRoom" is the selected room object
  const selectedRoom = inventoryRoom;

  // Searching/filtering states
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedLetter, setSelectedLetter] = useState(null);
  const [selectedSubButton, setSelectedSubButton] = useState({
    letter: null,
    subButton: null,
  });

  // Toggles
  const [isSpecialHVisible, setIsSpecialHVisible] = useState(false);
  const [isToggled, setIsToggled] = useState(true); // e.g. auto-box toggle
  const [isDesktop, setIsDesktop] = useState(false);
  const [isMyItemsActive, setIsMyItemsActive] = useState(false);
  const [isDeleteActive, setIsDeleteActive] = useState(false);

  // For tracking & auto-adding boxes
  const prevTotalLbsRef = useRef(null);

  // Item popup data
  const [popupData, setPopupData] = useState(null);
  const handleOpenPopup = (item, itemInstance) => setPopupData({ item, itemInstance });
  const handleClosePopup = () => setPopupData(null);

  // ==================== FIX FOR iOS SAFARI HEIGHT (like in Leads.js) ====================
  useEffect(() => {
    function setAppHeight() {
      document.documentElement.style.setProperty(
        "--app-height",
        `${window.innerHeight}px`
      );
    }
    window.addEventListener("resize", setAppHeight);
    setAppHeight();
    return () => window.removeEventListener("resize", setAppHeight);
  }, []);

  // ==================== LOAD INVENTORY ON MOUNT ====================
  useEffect(() => {
    if (lead?.lead_id && lead?.tenant_id) {
      const existing = getInventoryByLeadId(lead.lead_id, lead.tenant_id);
      if (existing && existing.inventoryByStop) {
        // Already in new shape
        setInventoryByStop(existing.inventoryByStop);
      } else if (existing && existing.roomItemSelections) {
        // Old shape => convert to new shape for stop 0
        const old = existing.roomItemSelections; // { [roomId]: items }
        setInventoryByStop({
          0: {
            displayedRooms: defaultRoomIds.slice(),
            itemsByRoom: { ...old },
          },
        });
      }
    }
    setHasLoadedInventory(true);
  }, [lead]);

  // ==================== SAVE CHANGES ====================
  useEffect(() => {
    if (!hasLoadedInventory) return;
    if (lead?.lead_id && lead?.tenant_id) {
      createOrUpdateInventory(lead.lead_id, lead.tenant_id, inventoryByStop);
    }
  }, [inventoryByStop, lead, hasLoadedInventory]);

  // ==================== CHECK DESKTOP OR MOBILE ====================
  useEffect(() => {
    function handleResize() {
      setIsDesktop(window.innerWidth >= 1024);
    }
    window.addEventListener("resize", handleResize);
    handleResize(); // Run once on mount
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // ------------------- Helpers -------------------
  const getStopData = useCallback(
    (stopIdx) => {
      let stopData = inventoryByStop[stopIdx];
      if (!stopData) {
        stopData = {
          displayedRooms: defaultRoomIds.slice(), // store numeric IDs
          itemsByRoom: {}, // { [roomId]: [itemInstances] }
        };
      }
      return stopData;
    },
    [inventoryByStop]
  );

  // For debugging
  useEffect(() => {
    if (lead?.lead_id && lead?.tenant_id) {
      console.log("Current Inventory Record:", {
        lead_id: lead.lead_id,
        tenant_id: lead.tenant_id,
        inventoryByStop,
      });
    }
  }, [lead, inventoryByStop]);

  // ==================== ROOM + ITEM LOGIC (MOBILE) ====================
  const handleStartFresh = (newItemInstance) => {
    if (!selectedRoom) return;
    setInventoryByStop((prev) => {
      const stopData = getStopData(stopIndex);
      const items = stopData.itemsByRoom[selectedRoom.id] || [];
      const updatedItems = [...items, newItemInstance];
      const updatedStopData = {
        ...stopData,
        itemsByRoom: {
          ...stopData.itemsByRoom,
          [selectedRoom.id]: updatedItems,
        },
      };
      return { ...prev, [stopIndex]: updatedStopData };
    });
  };

  const handleRoomSelect = (room) => {
    if (setInventoryRoom) setInventoryRoom(room);
  };

  const handleBackToRooms = () => {
    if (setInventoryRoom) setInventoryRoom(null);
    setSearchQuery("");
    setSelectedLetter(null);
    setSelectedSubButton({ letter: null, subButton: null });
  };

  // Searching
  const handleSearch = (query) => {
    setIsMyItemsActive(false);
    setSearchQuery(query);
    setSelectedLetter(null);
    setSelectedSubButton({ letter: null, subButton: null });
  };
  const handleSearchClick = () => {
    setIsMyItemsActive(false);
    setSelectedLetter(null);
    setSelectedSubButton({ letter: null, subButton: null });
  };

  const handleLetterSelect = (letter) => {
    setIsMyItemsActive(false);
    if (selectedLetter === letter) {
      setSelectedLetter(null);
      setSelectedSubButton({ letter: null, subButton: null });
    } else {
      setSelectedLetter(letter);
      setSelectedSubButton({ letter: null, subButton: null });
      setSearchQuery("");
    }
  };
  const handleSubButtonSelect = (letter, subButton) => {
    setIsMyItemsActive(false);
    if (
      selectedSubButton.letter === letter &&
      selectedSubButton.subButton === subButton
    ) {
      setSelectedSubButton({ letter: null, subButton: null });
      setSelectedLetter(null);
    } else {
      setSelectedSubButton({ letter, subButton });
      setSelectedLetter(letter);
      setSearchQuery("");
    }
  };

  const handleItemSelection = (clickedItem, action) => {
    if (!selectedRoom) return;
    const doAction = action || (isDeleteActive ? "decrease" : "increase");

    setInventoryByStop((prev) => {
      const stopData = getStopData(stopIndex);
      const items = [...(stopData.itemsByRoom[selectedRoom.id] || [])];

      if (doAction === "decrease") {
        let idx = -1;
        if (isMyItemsActive) {
          // Decrease from "My Items" by groupingKey
          idx = items.findIndex(
            (itm) => itm.groupingKey === clickedItem.groupingKey
          );
        } else {
          // Standard item removal by itemId
          const itemIdToDelete = clickedItem.id?.toString();
          idx = items.findIndex((itm) => itm.itemId === itemIdToDelete);
        }
        if (idx !== -1) items.splice(idx, 1);
      } else {
        // "increase"
        let newItemInstance;
        if (isMyItemsActive) {
          // Creating new from existing item instance
          newItemInstance = {
            id: uuidv4(),
            itemId: clickedItem.itemId,
            item: { ...clickedItem.item },
            tags: [...clickedItem.tags],
            notes: clickedItem.notes || "",
            cuft: clickedItem.cuft || "",
            lbs: clickedItem.lbs || "",
            packingNeedsCounts: { ...clickedItem.packingNeedsCounts },
            link: clickedItem.link || "",
            uploadedImages: [...(clickedItem.uploadedImages || [])],
            cameraImages: [...(clickedItem.cameraImages || [])],
            groupingKey: clickedItem.groupingKey,
          };
        } else {
          // New item from allItems
          let defaultPacking = {};
          if (clickedItem.packing?.length) {
            clickedItem.packing.forEach((pack) => {
              defaultPacking[pack.type] = pack.quantity;
            });
          }
          newItemInstance = {
            id: uuidv4(),
            itemId: clickedItem.id.toString(),
            item: { ...clickedItem },
            tags: [...clickedItem.tags],
            notes: "",
            cuft: clickedItem.cuft || "",
            lbs: clickedItem.lbs || "",
            packingNeedsCounts: defaultPacking,
            link: "",
            uploadedImages: [],
            cameraImages: [],
          };
          newItemInstance.groupingKey = generateGroupingKey(newItemInstance);
        }
        items.push(newItemInstance);
      }

      const updatedStopData = {
        ...stopData,
        itemsByRoom: {
          ...stopData.itemsByRoom,
          [selectedRoom.id]: items,
        },
      };
      return { ...prev, [stopIndex]: updatedStopData };
    });
  };

  const handleToggleRoom = (roomId) => {
    // Keep "Boxes" (#13) always
    if (roomId === 13) return;

    setInventoryByStop((prev) => {
      const stopData = getStopData(stopIndex);
      const oldDisplayed = stopData.displayedRooms || [];

      let newDisplayed;
      if (oldDisplayed.includes(roomId)) {
        newDisplayed = oldDisplayed.filter((id) => id !== roomId);
      } else {
        newDisplayed = [...oldDisplayed, roomId];
      }

      // Ensure #13 is always included
      if (!newDisplayed.includes(13)) {
        newDisplayed.push(13);
      }

      const updatedStopData = {
        ...stopData,
        displayedRooms: newDisplayed,
      };
      return { ...prev, [stopIndex]: updatedStopData };
    });
  };

  const getItemCountForCurrentRoom = () => {
    if (!selectedRoom) return 0;
    const stopData = getStopData(stopIndex);
    const items = stopData.itemsByRoom[selectedRoom.id] || [];
    return items.length;
  };

  // ==================== POPUP: UPDATE / ADD ITEM ====================
  const handleUpdateItem = (updatedItemInstance, originalItemInstance) => {
    if (!selectedRoom) return;
    setInventoryByStop((prev) => {
      const stopData = getStopData(stopIndex);
      let arr = [...(stopData.itemsByRoom[selectedRoom.id] || [])];

      // find all items with the same groupingKey
      const groupItems = arr.filter(
        (itm) => itm.groupingKey === originalItemInstance.groupingKey
      );
      if (!groupItems.length) return prev;

      // remove old group
      arr = arr.filter(
        (itm) => itm.groupingKey !== originalItemInstance.groupingKey
      );

      // new grouping key
      const newKey = generateGroupingKey(updatedItemInstance);
      updatedItemInstance.groupingKey = newKey;

      // create new group
      const count = updatedItemInstance.count ?? 1;
      const newGroup = [];
      for (let i = 0; i < count; i++) {
        newGroup.push({
          ...updatedItemInstance,
          id: i === 0 ? originalItemInstance.id : uuidv4(),
        });
      }

      const updatedStopData = {
        ...stopData,
        itemsByRoom: {
          ...stopData.itemsByRoom,
          [selectedRoom.id]: [...arr, ...newGroup],
        },
      };
      return { ...prev, [stopIndex]: updatedStopData };
    });
  };

  const handleAddItem = (newItemInstance) => {
    if (!selectedRoom) return;
    setInventoryByStop((prev) => {
      const stopData = getStopData(stopIndex);
      let arr = [...(stopData.itemsByRoom[selectedRoom.id] || [])];

      newItemInstance.groupingKey = generateGroupingKey(newItemInstance);
      const count = newItemInstance.count ?? 1;
      for (let i = 0; i < count; i++) {
        arr.push({
          ...newItemInstance,
          id: i === 0 ? newItemInstance.id : uuidv4(),
        });
      }

      const updatedStopData = {
        ...stopData,
        itemsByRoom: {
          ...stopData.itemsByRoom,
          [selectedRoom.id]: arr,
        },
      };
      return { ...prev, [stopIndex]: updatedStopData };
    });
  };

  // ==================== AUTO-ADD BOXES (if isToggled) ====================
  useEffect(() => {
    if (!isToggled) return;

    const stopData = getStopData(stopIndex);
    const itemsByRoom = stopData.itemsByRoom || {};

    // Calculate total LBS
    let totalLbs = 0;
    const excludedRoomId = 13;
    const excludedIds = ["529", "530", "531", "532", "533", "534", "535", "536", "537"];

    Object.keys(itemsByRoom).forEach((rId) => {
      if (Number(rId) === excludedRoomId) return;
      itemsByRoom[rId].forEach((itm) => {
        if (!excludedIds.includes(itm.itemId)) {
          const lbsVal = parseFloat(itm.lbs || itm.item.lbs);
          if (!isNaN(lbsVal)) {
            totalLbs += lbsVal;
          }
        }
      });
    });

    if (prevTotalLbsRef.current === totalLbs) return;
    prevTotalLbsRef.current = totalLbs;

    const boxesPer200lbs = 3;
    const nUnits = Math.ceil(totalLbs / 200);
    const totalBoxes = nUnits * boxesPer200lbs;

    const distribution = [
      { percent: 0.10, itemId: "533" },
      { percent: 0.05, itemId: "529" },
      { percent: 0.20, itemId: "534" },
      { percent: 0.45, itemId: "535" },
      { percent: 0.20, itemId: "536" },
    ];
    const boxesToAdd = distribution.map((dist) => ({
      itemId: dist.itemId,
      count: Math.round(totalBoxes * dist.percent),
    }));

    // Update the "Boxes" array
    setInventoryByStop((prev) => {
      const updatedStopData = getStopData(stopIndex);
      const itemsByRoom2 = { ...updatedStopData.itemsByRoom };
      const oldBoxes = itemsByRoom2["13"] || [];
      const nonAuto = oldBoxes.filter((bx) => !bx.autoAdded);

      const newBoxes = [];
      boxesToAdd.forEach((bx) => {
        for (let i = 0; i < bx.count; i++) {
          const itemData = allItems.find((it) => it.id.toString() === bx.itemId);
          if (itemData) {
            let packing = {};
            if (itemData.packing?.length) {
              itemData.packing.forEach((p) => {
                packing[p.type] = p.quantity;
              });
            }
            const newInst = {
              id: uuidv4(),
              itemId: bx.itemId,
              item: { ...itemData },
              tags: [...itemData.tags],
              notes: "",
              cuft: itemData.cuft || "",
              lbs: itemData.lbs || "",
              packingNeedsCounts: packing,
              autoAdded: true,
              groupingKey: "",
            };
            newInst.groupingKey = generateGroupingKey(newInst);
            newBoxes.push(newInst);
          }
        }
      });

      itemsByRoom2["13"] = [...nonAuto, ...newBoxes];
      return {
        ...prev,
        [stopIndex]: {
          ...updatedStopData,
          itemsByRoom: itemsByRoom2,
        },
      };
    });
  }, [isToggled, stopIndex, getStopData]);

  // Close entire Inventory
  const handleClose = () => {
    onCloseInventory();
  };

  // ==================== DESKTOP VIEW ====================
  if (isDesktop) {
    const stopData = getStopData(stopIndex);

    // Convert numeric IDs to room objects
    const displayedRoomObjects = (stopData.displayedRooms || []).map((rId) => {
      const found = rooms.find((rm) => rm.id === rId);
      return found || { id: rId, name: `Room #${rId}` };
    });

    return (
      <InventoryDesktop
        // The entire multi-stop object
        inventoryByStop={inventoryByStop}
        setInventoryByStop={setInventoryByStop}
        stopIndex={stopIndex}
        setStopIndex={setStopIndex}
        // The “subset” for this stop
        roomItemSelections={stopData.itemsByRoom}
        // crucial so we can mutate items
        setRoomItemSelections={(fnOrObj) => {
          setInventoryByStop((prev) => {
            const oldStopData = getStopData(stopIndex);
            const oldItems = oldStopData.itemsByRoom;
            const newItems =
              typeof fnOrObj === "function" ? fnOrObj(oldItems) : fnOrObj;
            return {
              ...prev,
              [stopIndex]: {
                ...oldStopData,
                itemsByRoom: newItems,
              },
            };
          });
        }}
        displayedRooms={displayedRoomObjects}
        // Toggles
        isToggled={isToggled}
        setIsToggled={setIsToggled}
        selectedRoom={selectedRoom}
        setSelectedRoom={setInventoryRoom}
        rooms={rooms}
        searchQuery={searchQuery}
        handleSearch={handleSearch}
        handleSearchClick={handleSearchClick}
        selectedLetter={selectedLetter}
        setSelectedLetter={setSelectedLetter}
        selectedSubButton={selectedSubButton}
        setSelectedSubButton={setSelectedSubButton}
        isMyItemsActive={isMyItemsActive}
        setIsMyItemsActive={setIsMyItemsActive}
        setSearchQuery={setSearchQuery}
        onCloseDesktopInventory={handleClose}
        lead={lead}
        // item add/update logic
        handleItemSelection={handleItemSelection}
        handleUpdateItem={handleUpdateItem}
        handleAddItem={handleAddItem}
        handleStartFresh={handleStartFresh}
        // Delete toggle
        isDeleteActive={isDeleteActive}
        setIsDeleteActive={setIsDeleteActive}
        handleToggleRoom={handleToggleRoom}
      />
    );
  }

  // ==================== MOBILE VIEW ====================
  const stopData = getStopData(stopIndex);

  // Convert numeric IDs (e.g. 1,2,13) to room objects
  const displayedRoomObjects = (stopData.displayedRooms || []).map((rId) => {
    const found = rooms.find((rm) => rm.id === rId);
    return found || { id: rId, name: `Room #${rId}` };
  });

  return (
    <div className={styles.inventoryContainer}>
      <header className={styles.header}>
        {selectedRoom ? (
          <SearchHeader
            roomName={selectedRoom.name}
            searchQuery={searchQuery}
            onSearch={handleSearch}
            onSearchClick={handleSearchClick}
            onSearchFocus={handleSearchClick}
          />
        ) : (
          <HouseHeader
            rooms={rooms} // your master list
            displayedRooms={stopData.displayedRooms} // numeric IDs
            onToggleRoom={handleToggleRoom}
            lead={lead}
            stopIndex={stopIndex}
            onStopIndexChange={setStopIndex}
          />
        )}
      </header>

      <main className={styles.mainContent}>
        {selectedRoom ? (
          <ItemSelection
            room={selectedRoom}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            selectedLetter={selectedLetter}
            selectedSubButton={selectedSubButton}
            onLetterSelect={handleLetterSelect}
            onSubButtonSelect={handleSubButtonSelect}
            itemClickCounts={stopData.itemsByRoom[selectedRoom.id] || {}}
            itemInstances={stopData.itemsByRoom[selectedRoom.id] || []}
            onItemClick={handleItemSelection}
            itemCount={getItemCountForCurrentRoom()}
            isMyItemsActive={isMyItemsActive}
            setIsMyItemsActive={setIsMyItemsActive}
            isDeleteActive={isDeleteActive}
            onUpdateItem={handleUpdateItem}
            onAddItem={handleAddItem}
            isToggled={isToggled}
            setIsToggled={setIsToggled}
            onStartFresh={handleStartFresh}
            onBackToRooms={handleBackToRooms}
            onOpenPopup={handleOpenPopup}
          />
        ) : (
          <RoomList
            onRoomSelect={handleRoomSelect}
            roomItemSelections={stopData.itemsByRoom}
            displayedRooms={displayedRoomObjects}
           
          />
        )}
      </main>

      {popupData && (
        <ItemPopup
          item={popupData.item}
          itemInstance={popupData.itemInstance}
          onClose={handleClosePopup}
          onUpdateItem={handleUpdateItem}
          onAddItem={handleAddItem}
          onStartFresh={handleStartFresh}
          lead={lead}
        />
      )}

      <FooterNavigation
        inRoom={!!selectedRoom}
        onBackToRooms={handleBackToRooms}
        isDeleteActive={isDeleteActive}
        setIsDeleteActive={setIsDeleteActive}
        isSpecialHVisible={isSpecialHVisible}
        setIsSpecialHVisible={setIsSpecialHVisible}
        // The item data for this stop
        roomItemSelections={stopData.itemsByRoom}
        // Pass a function so MyInventory / SpecialH in mobile can update items
        setRoomItemSelections={(fnOrObj) => {
          setInventoryByStop((prev) => {
            const oldStopData = getStopData(stopIndex);
            const oldItems = oldStopData.itemsByRoom;
            const newItems =
              typeof fnOrObj === "function" ? fnOrObj(oldItems) : fnOrObj;
            return {
              ...prev,
              [stopIndex]: {
                ...oldStopData,
                itemsByRoom: newItems,
              },
            };
          });
        }}
        selectedRoom={selectedRoom}
        displayedRooms={stopData.displayedRooms}
        onCloseInventory={handleClose}
        lead={lead}
      />
    </div>
  );
}

export default Inventory;
