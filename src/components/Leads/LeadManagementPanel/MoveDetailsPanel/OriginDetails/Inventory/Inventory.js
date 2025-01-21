// src/components/Leads/LeadManagementPanel/MoveDetailsPanel/OriginDetails/Inventory/Inventory.js

import React, { useState, useEffect, useRef } from 'react';
import styles from './Inventory.module.css';
import RoomList from './RoomList/RoomList';
import HouseHeader from './HouseHeader/HouseHeader';
import FooterNavigation from './FooterNavigation/FooterNavigation';
import ItemSelection from './ItemSelection/ItemSelection';
import SearchHeader from './SearchHeader/SearchHeader';

import rooms from '../../../../../../data/constants/AllRoomsList';
import allItems from '../../../../../../data/constants/funitureItems';

import InventoryDesktop from './InventoryDesktop/InventoryDesktop';
import { v4 as uuidv4 } from 'uuid';
import ItemPopup from './ItemSelection/Item/ItemPopup/ItemPopup';
import { generateGroupingKey } from './utils/generateGroupingKey';

// inventoryService
import {
  getInventoryByLeadId,
  createOrUpdateInventory,
} from '../../../../../../services/inventoryService';

const defaultRoomIds = [1,2,3,4,5,6,7,8,9,10,11,12,13];

function Inventory({
  lead,
  onCloseInventory,
  inventoryRoom,
  setInventoryRoom,
}) {
  const selectedRoom = inventoryRoom;

  // --- state variables ---
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLetter, setSelectedLetter] = useState(null);
  const [selectedSubButton, setSelectedSubButton] = useState({ letter: null, subButton: null });

  // We keep track if we've loaded from DB so we don't immediately overwrite
  const [hasLoadedInventory, setHasLoadedInventory] = useState(false);

  const [roomItemSelections, setRoomItemSelections] = useState(() =>
    rooms.reduce((acc, r) => {
      acc[r.id] = [];
      return acc;
    }, {})
  );

  const [isSpecialHVisible, setIsSpecialHVisible] = useState(false);
  const [isToggled, setIsToggled] = useState(true);
  const [isDesktop, setIsDesktop] = useState(window.innerWidth >= 1024);
  const [isMyItemsActive, setIsMyItemsActive] = useState(false);
  const [isDeleteActive, setIsDeleteActive] = useState(false);

  const prevTotalLbsRef = useRef(null);

  const [popupData, setPopupData] = useState(null);
  const handleOpenPopup = (item, itemInstance) => setPopupData({ item, itemInstance });
  const handleClosePopup = () => setPopupData(null);

  const [displayedRooms, setDisplayedRooms] = useState(
    rooms.filter(r => defaultRoomIds.includes(r.id))
  );

  // --- 1) Load from DB on mount ---
  useEffect(() => {
    if (lead && lead.lead_id && lead.tenant_id) {
      const existing = getInventoryByLeadId(lead.lead_id, lead.tenant_id);
      if (existing && existing.roomItemSelections) {
        setRoomItemSelections(existing.roomItemSelections);
      }
    }
    // after we do this load, set hasLoadedInventory => true
    setHasLoadedInventory(true);
  }, [lead]);

  // --- 2) Whenever roomItemSelections changes => do incremental save
  useEffect(() => {
    // If we haven't actually loaded from DB yet, skip saving
    if (!hasLoadedInventory) return;

    if (lead && lead.lead_id && lead.tenant_id) {
      createOrUpdateInventory(lead.lead_id, lead.tenant_id, roomItemSelections);
    }
  }, [roomItemSelections, lead, hasLoadedInventory]);

  // --- handle resizing ---
  useEffect(() => {
    function handleResize() {
      setIsDesktop(window.innerWidth >= 1024);
    }
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // --- setVH for mobile Safari, etc. ---
  useEffect(() => {
    function setVh() {
      document.documentElement.style.setProperty('--vh', `${window.innerHeight * 0.01}px`);
    }
    setVh();
    window.addEventListener('resize', setVh);
    return () => window.removeEventListener('resize', setVh);
  }, []);

  // =========== ROOM + ITEM LOGIC ===========

  const handleStartFresh = (newItemInstance) => {
    if (!selectedRoom) return;
    setRoomItemSelections(prev => {
      const current = prev[selectedRoom.id] || [];
      return {
        ...prev,
        [selectedRoom.id]: [...current, newItemInstance],
      };
    });
  };

  const handleRoomSelect = (room) => {
    if (setInventoryRoom) setInventoryRoom(room);
  };

  const handleBackToRooms = () => {
    if (setInventoryRoom) setInventoryRoom(null);
    setSearchQuery('');
    setSelectedLetter(null);
    setSelectedSubButton({ letter: null, subButton: null });
  };

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
      setSearchQuery('');
    }
  };
  const handleSubButtonSelect = (letter, subButton) => {
    setIsMyItemsActive(false);
    if (
      selectedSubButton &&
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

  const handleItemSelection = (clickedItem, action) => {
    if (!selectedRoom) return;
    if (!action) {
      action = isDeleteActive ? 'decrease' : 'increase';
    }
    setRoomItemSelections(prev => {
      const current = [...(prev[selectedRoom.id] || [])];
      if (action === 'decrease') {
        let idx = -1;
        if (isMyItemsActive) {
          idx = current.findIndex(itm => itm.groupingKey === clickedItem.groupingKey);
        } else {
          const itemIdToDelete = clickedItem.id?.toString();
          idx = current.findIndex(itm => itm.itemId === itemIdToDelete);
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
          // from allItems
          let defaultPacking = {};
          if (clickedItem.packing && clickedItem.packing.length > 0) {
            clickedItem.packing.forEach(pack => {
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
      return { ...prev, [selectedRoom.id]: current };
    });
  };

  const handleToggleRoom = (roomId) => {
    if (roomId === 13) return;
    const found = rooms.find(r => r.id === roomId);
    if (!found) return;
    setDisplayedRooms(prev => {
      if (prev.some(r => r.id === roomId)) {
        return prev.filter(r => r.id !== roomId);
      } else {
        return [...prev, found];
      }
    });
  };

  // Always ensure 'Boxes' is visible
  useEffect(() => {
    const boxesRoom = rooms.find(r => r.id === 13);
    if (boxesRoom && !displayedRooms.some(r => r.id === 13)) {
      setDisplayedRooms(prev => [...prev, boxesRoom]);
    }
  }, [displayedRooms]);

  const getItemCountForCurrentRoom = () => {
    if (!selectedRoom) return 0;
    return (roomItemSelections[selectedRoom.id] || []).length;
  };

  const handleUpdateItem = (updatedItemInstance, originalItemInstance) => {
    if (!selectedRoom) return;
    setRoomItemSelections(prev => {
      const copy = { ...prev };
      let arr = [...(copy[selectedRoom.id] || [])];
      const groupItems = arr.filter(itm => itm.groupingKey === originalItemInstance.groupingKey);
      if (!groupItems.length) return copy;

      // remove old group
      arr = arr.filter(itm => itm.groupingKey !== originalItemInstance.groupingKey);

      // new grouping key
      const newKey = generateGroupingKey(updatedItemInstance);
      updatedItemInstance.groupingKey = newKey;

      // Add new group
      const count = updatedItemInstance.count ?? 1;
      const newGroup = [];
      for (let i = 0; i < count; i++) {
        newGroup.push({
          ...updatedItemInstance,
          id: i === 0 ? originalItemInstance.id : uuidv4(),
        });
      }
      copy[selectedRoom.id] = [...arr, ...newGroup];
      return copy;
    });
  };

  const handleAddItem = (newItemInstance) => {
    if (!selectedRoom) return;
    setRoomItemSelections(prev => {
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

  useEffect(() => {
    if (!isToggled) return;

    let totalLbs = 0;
    const excludedRoomId = '13';
    const excludedIds = ['529','530','531','532','533','534','535','536','537'];
    Object.keys(roomItemSelections).forEach(rId => {
      if (rId === excludedRoomId) return;
      roomItemSelections[rId].forEach(itm => {
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
    const boxesToAdd = distribution.map(dist => ({
      itemId: dist.itemId,
      count: Math.round(totalBoxes * dist.percent),
    }));

    setRoomItemSelections(prev => {
      const copy = { ...prev };
      const boxesArr = copy['13'] || [];
      const nonAuto = boxesArr.filter(bx => !bx.autoAdded);

      const newBoxes = [];
      boxesToAdd.forEach(bx => {
        for (let i=0; i<bx.count; i++){
          const itemData = allItems.find(it => it.id.toString() === bx.itemId);
          if (itemData) {
            let packing = {};
            if (itemData.packing && itemData.packing.length>0) {
              itemData.packing.forEach(p => {
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

  // We do real-time saving above, so we can just close
  const handleClose = () => {
    onCloseInventory();
  };

  // If desktop => InventoryDesktop
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
      />
    );
  }

  // Otherwise => mobile UI
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
            onBackToRooms={handleBackToRooms}
            onOpenPopup={handleOpenPopup}
          />
        ) : (
          <RoomList
            onRoomSelect={handleRoomSelect}
            roomItemSelections={roomItemSelections}
            displayedRooms={displayedRooms}
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
        roomItemSelections={roomItemSelections}
        setRoomItemSelections={setRoomItemSelections}
        selectedRoom={selectedRoom}
        displayedRooms={displayedRooms}
        onCloseInventory={handleClose}
      />
    </div>
  );
}

export default Inventory;
