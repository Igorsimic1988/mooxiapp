import React, { useState, useEffect, useRef, useCallback } from 'react';
import styles from './Inventory.module.css';

// Child components
import RoomList from './RoomList/RoomList';
import HouseHeader from './HouseHeader/HouseHeader';
import FooterNavigation from './FooterNavigation/FooterNavigation';
import ItemSelection from './ItemSelection/ItemSelection';
import SearchHeader from './SearchHeader/SearchHeader';
import InventoryDesktop from './InventoryDesktop/InventoryDesktop';
import ItemPopup from './ItemSelection/Item/ItemPopup/ItemPopup';

// Data + Utils
import rooms from '../../../../../../data/constants/AllRoomsList';
import allItems from '../../../../../../data/constants/funitureItems';
import { v4 as uuidv4 } from 'uuid';
import { generateGroupingKey } from './utils/generateGroupingKey';

// Inventory Service
import {
  getInventoryByLeadId,
  createOrUpdateInventory,
} from '../../../../../../services/inventoryService';

// The “default displayed” rooms as numeric IDs
const defaultRoomIds = [1,2,3,4,5,6,7,8,9,10,11,12,13];

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

  /**
   * inventoryByStop structure:
   * {
   *   [stopIndex]: {
   *     displayedRooms: number[],   // e.g. [1,2,13]
   *     itemsByRoom: { [roomId]: arrayOfItemInstances }
   *   },
   *   ...
   * }
   */
  const [inventoryByStop, setInventoryByStop] = useState({});

  // If mobile, "inventoryRoom" is the selected room object
  const selectedRoom = inventoryRoom;

  // Searching/filtering states
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLetter, setSelectedLetter] = useState(null);
  const [selectedSubButton, setSelectedSubButton] = useState({
    letter: null,
    subButton: null,
  });

  // Toggles
  const [isSpecialHVisible, setIsSpecialHVisible] = useState(false);
  const [isToggled, setIsToggled] = useState(true);  // e.g., auto-box toggle
  const [isDesktop, setIsDesktop] = useState(window.innerWidth >= 1024);
  const [isMyItemsActive, setIsMyItemsActive] = useState(false);
  const [isDeleteActive, setIsDeleteActive] = useState(false);

  // For tracking & auto-adding boxes
  const prevTotalLbsRef = useRef(null);

  // Item popup
  const [popupData, setPopupData] = useState(null);
  const handleOpenPopup = (item, itemInstance) => setPopupData({ item, itemInstance });
  const handleClosePopup = () => setPopupData(null);

  // 1) Load from DB on mount
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

  // 2) Whenever inventoryByStop changes => do incremental save
  useEffect(() => {
    if (!hasLoadedInventory) return;
    if (lead?.lead_id && lead?.tenant_id) {
      createOrUpdateInventory(lead.lead_id, lead.tenant_id, inventoryByStop);
    }
  }, [inventoryByStop, lead, hasLoadedInventory]);

  // Handle resizing for desktop vs mobile
  useEffect(() => {
    function handleResize() {
      setIsDesktop(window.innerWidth >= 1024);
    }
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // setVH for mobile Safari, etc.
  useEffect(() => {
    function setVh() {
      document.documentElement.style.setProperty('--vh', `${window.innerHeight * 0.01}px`);
    }
    setVh();
    window.addEventListener('resize', setVh);
    return () => window.removeEventListener('resize', setVh);
  }, []);

  // ------------------- Helpers for this “stop” -------------------

  // Returns the data object for the current stop (creating if missing)
  const getStopData = useCallback(
    (stopIdx) => {
      let stopData = inventoryByStop[stopIdx];
      if (!stopData) {
        stopData = {
          displayedRooms: defaultRoomIds.slice(),  // store numeric IDs
          itemsByRoom: {}, // { [roomId]: [itemInstances] }
        };
      }
      return stopData;
    },
    [inventoryByStop]
  );

  // ------------------- ROOM + ITEM LOGIC -------------------

  // For "Start Fresh" => add a brand new item instance
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

  // For selecting a room (in mobile)
  const handleRoomSelect = (room) => {
    if (setInventoryRoom) setInventoryRoom(room);
  };

  // Return to the room list (mobile)
  const handleBackToRooms = () => {
    if (setInventoryRoom) setInventoryRoom(null);
    setSearchQuery('');
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

  // Letter / sub-letter
  const handleLetterSelect = (letter) => {
    setIsMyItemsActive(false);
    if (selectedLetter === letter) {
      setSelectedLetter(null);
      setSelectedSubButton({ letter: null, subButton: null });
    } else {
      setSelectedLetter(letter);
      setSelectedSubButton({ letter: null, subButton: null });
      setSearchQuery('');
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
      setSearchQuery('');
    }
  };

  // Increase / decrease items
  const handleItemSelection = (clickedItem, action) => {
    if (!selectedRoom) return;
    const doAction = action || (isDeleteActive ? 'decrease' : 'increase');

    setInventoryByStop((prev) => {
      const stopData = getStopData(stopIndex);
      const items = [...(stopData.itemsByRoom[selectedRoom.id] || [])];

      if (doAction === 'decrease') {
        let idx = -1;
        if (isMyItemsActive) {
          idx = items.findIndex((itm) => itm.groupingKey === clickedItem.groupingKey);
        } else {
          const itemIdToDelete = clickedItem.id?.toString();
          idx = items.findIndex((itm) => itm.itemId === itemIdToDelete);
        }
        if (idx !== -1) items.splice(idx, 1);
      } else {
        // "increase"
        let newItemInstance;
        if (isMyItemsActive) {
          newItemInstance = {
            id: uuidv4(),
            itemId: clickedItem.itemId,
            item: { ...clickedItem.item },
            tags: [...clickedItem.tags],
            notes: clickedItem.notes || '',
            cuft: clickedItem.cuft || '',
            lbs: clickedItem.lbs || '',
            packingNeedsCounts: { ...clickedItem.packingNeedsCounts },
            link: clickedItem.link || '',
            uploadedImages: [...(clickedItem.uploadedImages || [])],
            cameraImages: [...(clickedItem.cameraImages || [])],
            groupingKey: clickedItem.groupingKey,
          };
        } else {
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
            notes: '',
            cuft: clickedItem.cuft || '',
            lbs: clickedItem.lbs || '',
            packingNeedsCounts: defaultPacking,
            link: '',
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

  // Toggling rooms in “Add Room” popup => local to the current stop
  const handleToggleRoom = (roomId) => {
    // If you want to keep "Boxes" always => skip if roomId=13
    // Otherwise, remove this if you want it toggleable
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

      // If you want to ensure #13 is always in the array:
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

  // Count how many items are in the currently selected room
  const getItemCountForCurrentRoom = () => {
    if (!selectedRoom) return 0;
    const stopData = getStopData(stopIndex);
    const items = stopData.itemsByRoom[selectedRoom.id] || [];
    return items.length;
  };

  // "Update Item" from popup
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
      arr = arr.filter((itm) => itm.groupingKey !== originalItemInstance.groupingKey);

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

  // "Add Item" from popup
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

  // Auto-add boxes if toggled
  useEffect(() => {
    if (!isToggled) return;

    const stopData = getStopData(stopIndex);
    const itemsByRoom = stopData.itemsByRoom || {};

    // Calculate total LBS
    let totalLbs = 0;
    const excludedRoomId = 13;
    const excludedIds = ['529','530','531','532','533','534','535','536','537'];

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
      { percent: 0.10, itemId: '533' },
      { percent: 0.05, itemId: '529' },
      { percent: 0.20, itemId: '534' },
      { percent: 0.45, itemId: '535' },
      { percent: 0.20, itemId: '536' },
    ];
    const boxesToAdd = distribution.map((dist) => ({
      itemId: dist.itemId,
      count: Math.round(totalBoxes * dist.percent),
    }));

    // Update the "Boxes" array
    setInventoryByStop((prev) => {
      const updatedStopData = getStopData(stopIndex);
      const itemsByRoom2 = { ...updatedStopData.itemsByRoom };
      const oldBoxes = itemsByRoom2['13'] || [];
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
              notes: '',
              cuft: itemData.cuft || '',
              lbs: itemData.lbs || '',
              packingNeedsCounts: packing,
              autoAdded: true,
              groupingKey: '',
            };
            newInst.groupingKey = generateGroupingKey(newInst);
            newBoxes.push(newInst);
          }
        }
      });

      itemsByRoom2['13'] = [...nonAuto, ...newBoxes];
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

  // ---------------------------------------------------------
  // DESKTOP RENDER
  // ---------------------------------------------------------
  if (isDesktop) {
    const stopData = getStopData(stopIndex);

    return (
      <InventoryDesktop
        // The entire multi-stop object
        inventoryByStop={inventoryByStop}
        setInventoryByStop={setInventoryByStop}
        stopIndex={stopIndex}
        setStopIndex={setStopIndex}

        // The “subset” for this stop: displayedRooms + itemsByRoom
        roomItemSelections={stopData.itemsByRoom}
        displayedRooms={stopData.displayedRooms}

        // Toggle, search, etc.
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
      />
    );
  }

  // ---------------------------------------------------------
  // MOBILE RENDER
  // ---------------------------------------------------------
  const stopData = getStopData(stopIndex);

  // Convert numeric IDs (e.g. 1,2,13) to room objects so <RoomList> can display them
  const displayedRoomObjects = (stopData.displayedRooms || []).map((rId) => {
    // find the matching object in 'rooms'
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
            displayedRooms={stopData.displayedRooms} // still numeric IDs for toggling
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
            // The items for the currently selected room
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
            displayedRooms={displayedRoomObjects}  // pass actual room objects
            selectedRoom={selectedRoom}
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
        setRoomItemSelections={(fnOrObj) => {
          setInventoryByStop((prev) => {
            const oldStopData = getStopData(stopIndex);
            const oldItems = oldStopData.itemsByRoom;
            const newItems =
              typeof fnOrObj === 'function' ? fnOrObj(oldItems) : fnOrObj;
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
        // For the Footer, if you need to display the "rooms" or let them be toggled:
        displayedRooms={stopData.displayedRooms} 
        onCloseInventory={handleClose}
      />
    </div>
  );
}

export default Inventory;
