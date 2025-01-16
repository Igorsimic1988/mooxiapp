// src/components/Inventory/Inventory.js

import React, { useState, useEffect, useRef } from 'react';
import styles from './Inventory.module.css';
import RoomList from './RoomList/RoomList';
import HouseHeader from './HouseHeader/HouseHeader';
import FooterNavigation from './FooterNavigation/FooterNavigation';
import ItemSelection from './ItemSelection/ItemSelection';
import SearchHeader from './SearchHeader/SearchHeader';
import rooms from '../../../../../../data/constants/AllRoomsList'; // Import rooms data
import allItems from '../../../../../../data/constants/funitureItems'; // Import allItems
import InventoryDesktop from './InventoryDesktop/InventoryDesktop';
import { v4 as uuidv4 } from 'uuid'; // For unique IDs
import ItemPopup from './ItemSelection/Item/ItemPopup/ItemPopup';
import { generateGroupingKey } from './utils/generateGroupingKey'; // Adjust path if needed

// Rooms to show by default
const defaultRoomIds = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13];

/**
 * Inventory
 *
 * Props:
 *   - onCloseInventory(): closes the entire Inventory screen
 */
function Inventory({ onCloseInventory }) {
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLetter, setSelectedLetter] = useState(null);
  const [selectedSubButton, setSelectedSubButton] = useState({ letter: null, subButton: null });
  const [roomItemSelections, setRoomItemSelections] = useState(() =>
    rooms.reduce((acc, room) => {
      acc[room.id] = [];
      return acc;
    }, {})
  );
  const [isSpecialHVisible, setIsSpecialHVisible] = useState(false);
  const [isToggled, setIsToggled] = useState(true);

  const [isDesktop, setIsDesktop] = useState(window.innerWidth >= 1024);
  const prevTotalLbsRef = useRef(null);

  // For item popups
  const [popupData, setPopupData] = useState(null);
  const handleOpenPopup = (item, itemInstance) => setPopupData({ item, itemInstance });
  const handleClosePopup = () => setPopupData(null);

  const [displayedRooms, setDisplayedRooms] = useState(
    rooms.filter((room) => defaultRoomIds.includes(room.id))
  );
  const [isMyItemsActive, setIsMyItemsActive] = useState(false);
  const [isDeleteActive, setIsDeleteActive] = useState(false);

  // Adjust the viewport height var
  useEffect(() => {
    function setVh() {
      document.documentElement.style.setProperty('--vh', `${window.innerHeight * 0.01}px`);
    }
    setVh();
    window.addEventListener('resize', setVh);
    return () => window.removeEventListener('resize', setVh);
  }, []);

  // “Start Fresh” => push a new item
  const handleStartFresh = (newItemInstance) => {
    if (!selectedRoom) return;
    setRoomItemSelections((prev) => {
      const current = prev[selectedRoom.id] || [];
      return {
        ...prev,
        [selectedRoom.id]: [...current, newItemInstance],
      };
    });
  };

  // Switch rooms
  const handleRoomSelect = (room) => {
    setSelectedRoom(room);
  };

  // -------------------------------------------
  // If a user is in a room => show items;
  // else => show the list of rooms
  // -------------------------------------------

  // Go back to main room list
  const handleBackToRooms = () => {
    setSelectedRoom(null);
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

  // --------------------------------------------------
  // DO NOT CHANGE: handleLetterSelect, handleSubButtonSelect
  // --------------------------------------------------
  const handleLetterSelect = (letter) => {
    setIsMyItemsActive(false);
    if (selectedLetter === letter) {
      // Deselect
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
      selectedSubButton &&
      selectedSubButton.subButton === subButton &&
      selectedSubButton.letter === letter
    ) {
      setSelectedSubButton({ letter: null, subButton: null });
      setSelectedLetter(null);
    } else {
      setSelectedSubButton({ letter, subButton });
      setSelectedLetter(letter);
      setSearchQuery('');
    }
  };
  // --------------------------------------------------

  // Increase/decrease items
  const handleItemSelection = (clickedItem, action) => {
    if (!selectedRoom) return;
    if (!action) {
      // default => either 'increase' or 'decrease' depending on isDeleteActive
      action = isDeleteActive ? 'decrease' : 'increase';
    }

    setRoomItemSelections((prev) => {
      const current = [...(prev[selectedRoom.id] || [])];
      if (action === 'decrease') {
        let idx = -1;
        if (isMyItemsActive) {
          idx = current.findIndex((itm) => itm.groupingKey === clickedItem.groupingKey);
        } else {
          const itemIdToDelete = clickedItem.id?.toString();
          idx = current.findIndex((itm) => itm.itemId === itemIdToDelete);
        }
        if (idx !== -1) current.splice(idx, 1);
      } else {
        // increase
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
          // normal item from allItems
          let defaultPacking = {};
          if (clickedItem.packing && clickedItem.packing.length > 0) {
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
        current.push(newItemInstance);
      }

      return {
        ...prev,
        [selectedRoom.id]: current,
      };
    });
  };

  // Toggling room visibility
  const handleToggleRoom = (roomId) => {
    if (roomId === 13) return; // always show Boxes
    const found = rooms.find((r) => r.id === roomId);
    if (!found) return;

    setDisplayedRooms((prev) => {
      if (prev.some((r) => r.id === roomId)) {
        return prev.filter((r) => r.id !== roomId);
      } else {
        return [...prev, found];
      }
    });
  };

  // Always ensure 'Boxes' is visible
  useEffect(() => {
    const boxesRoom = rooms.find((r) => r.id === 13);
    if (boxesRoom && !displayedRooms.some((r) => r.id === 13)) {
      setDisplayedRooms((prev) => [...prev, boxesRoom]);
    }
  }, [displayedRooms]);

  // Count items in the current room
  const getItemCountForCurrentRoom = () => {
    if (!selectedRoom) return 0;
    return (roomItemSelections[selectedRoom.id] || []).length;
  };

  // Updating an item from the ItemPopup
  const handleUpdateItem = (updatedItemInstance, originalItemInstance) => {
    if (!selectedRoom) return;
    setRoomItemSelections((prev) => {
      const next = { ...prev };
      let arr = [...(next[selectedRoom.id] || [])];

      // gather all from same groupingKey
      const groupItems = arr.filter(
        (itm) => itm.groupingKey === originalItemInstance.groupingKey
      );
      if (groupItems.length === 0) return next; // not found

      // Remove them
      arr = arr.filter((itm) => itm.groupingKey !== originalItemInstance.groupingKey);

      // update groupingKey
      const newKey = generateGroupingKey(updatedItemInstance);
      updatedItemInstance.groupingKey = newKey;

      const count = updatedItemInstance.count ?? 1;
      const newGroup = [];
      for (let i = 0; i < count; i++) {
        newGroup.push({
          ...updatedItemInstance,
          id: i === 0 ? originalItemInstance.id : uuidv4(),
        });
      }
      arr = [...arr, ...newGroup];
      next[selectedRoom.id] = arr;
      return next;
    });
  };

  // Adding brand new item
  const handleAddItem = (newItemInstance) => {
    if (!selectedRoom) return;
    setRoomItemSelections((prev) => {
      const arr = [...(prev[selectedRoom.id] || [])];
      newItemInstance.groupingKey = generateGroupingKey(newItemInstance);

      const count = newItemInstance.count ?? 1;
      for (let i = 0; i < count; i++) {
        arr.push({
          ...newItemInstance,
          id: i === 0 ? newItemInstance.id : uuidv4(),
        });
      }
      return { ...prev, [selectedRoom.id]: arr };
    });
  };

  // Auto-adding boxes if toggle is ON
  useEffect(() => {
    if (!isToggled) return;

    let totalLbs = 0;
    const excludedRoomId = '13';
    const excludedItemIds = ['529', '530', '531', '532', '533', '534', '535', '536', '537'];
    Object.keys(roomItemSelections).forEach((rId) => {
      if (rId === excludedRoomId) return;
      const items = roomItemSelections[rId];
      items.forEach((i) => {
        if (!excludedItemIds.includes(i.itemId)) {
          const lbsVal = parseFloat(i.lbs || i.item.lbs);
          if (!isNaN(lbsVal)) {
            totalLbs += lbsVal;
          }
        }
      });
    });

    if (prevTotalLbsRef.current === totalLbs) return;
    prevTotalLbsRef.current = totalLbs;

    // Calculate boxes
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

    setRoomItemSelections((prev) => {
      const copy = { ...prev };
      const boxesArr = copy['13'] || [];
      // remove autoAdded
      const nonAuto = boxesArr.filter((bx) => !bx.autoAdded);

      // push new auto boxes
      const newBoxes = [];
      boxesToAdd.forEach((bx) => {
        for (let i = 0; i < bx.count; i++) {
          const itemData = allItems.find((it) => it.id.toString() === bx.itemId);
          if (itemData) {
            let packing = {};
            if (itemData.packing && itemData.packing.length > 0) {
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

      copy['13'] = [...nonAuto, ...newBoxes];
      return copy;
    });
  }, [isToggled, roomItemSelections]);

  // Desktop or Mobile
  useEffect(() => {
    function handleResize() {
      setIsDesktop(window.innerWidth >= 1024);
    }
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // If desktop => show InventoryDesktop
  if (isDesktop) {
    return (
      <InventoryDesktop
        roomItemSelections={roomItemSelections}
        setRoomItemSelections={setRoomItemSelections}
        displayedRooms={displayedRooms}
        setDisplayedRooms={setDisplayedRooms}
        isToggled={isToggled}
        setIsToggled={setIsToggled}
        selectedRoom={selectedRoom}
        setSelectedRoom={setSelectedRoom}
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
      />
    );
  }

  // MOBILE => We'll add a small "arrow" icon in this header or let the parent do it.
  // For now, we rely on the parent controlling the arrow.
  // We'll provide "handleBack" as a reference if needed.

  return (
    <div className={styles.inventoryContainer}>
      <header className={styles.header}>
        {/* 
          If a room is selected => show SearchHeader,
          else => show HouseHeader 
        */}
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
            onToggleRoom={handleToggleRoom}
            rooms={rooms}
            displayedRooms={displayedRooms}
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
            itemClickCounts={roomItemSelections[selectedRoom.id] || {}}
            onItemClick={handleItemSelection}
            itemCount={getItemCountForCurrentRoom()}
            isMyItemsActive={isMyItemsActive}
            setIsMyItemsActive={setIsMyItemsActive}
            isDeleteActive={isDeleteActive}
            itemInstances={roomItemSelections[selectedRoom.id] || []}
            onUpdateItem={handleUpdateItem}
            onAddItem={handleAddItem}
            isToggled={isToggled}
            setIsToggled={setIsToggled}
            onStartFresh={handleStartFresh}
            // "Back to rooms" method
            onBackToRooms={handleBackToRooms}
            onOpenPopup={handleOpenPopup}
          />
        ) : (
          <RoomList
            onRoomSelect={handleRoomSelect}
            roomItemSelections={roomItemSelections}
            displayedRooms={displayedRooms}
          />
        )}
      </main>

      {/* If an item popup is open */}
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
        // We'll call handleBackToRooms if "inRoom", else close Inventory
        onBackToRooms={handleBackToRooms}
        isDeleteActive={isDeleteActive}
        setIsDeleteActive={setIsDeleteActive}
        isSpecialHVisible={isSpecialHVisible}
        setIsSpecialHVisible={setIsSpecialHVisible}
        roomItemSelections={roomItemSelections}
        setRoomItemSelections={setRoomItemSelections}
        selectedRoom={selectedRoom}
        displayedRooms={displayedRooms}
        onCloseInventory={onCloseInventory}
      />
    </div>
  );
}

export default Inventory;
