"use client";
// If you're using Next.js 13 app router, you often need "use client" at the top

import React, { useState, useEffect, useRef, useMemo } from "react";
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
import { generateGroupingKey } from "./utils/generateGroupingKey";
import { useAccessToken } from "src/app/lib/useAccessToken";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getAllFurnitureItems } from "src/app/services/furnitureService";
import { createInventoryItem, deleteInventoryItem, getInventoryByOriginId, updateInventoryItem } from "src/app/services/inventoryItemsService";
import { useUiState } from "../../UiStateContext";
import { updateOrigin } from 'src/app/services/originsService';
import { useInventoryContext } from "../../InventoryContext";
import { generateAutoBoxes } from './utils/generateAutoBoxes';
// The “default displayed” rooms as numeric IDs

function Inventory({
  lead,
  onCloseInventory,
  inventoryRoom,    // the currently selected room object (for mobile)
  setInventoryRoom, // function to set selected room object (for mobile)
}) {

   const token = useAccessToken();
  const { data: allItems = [] } = useQuery({
    queryKey: ['furnitureItems', lead?.brandId],
    queryFn: () => getAllFurnitureItems({ brandId: lead?.brandId }),
    enabled: !!lead?.brandId,
  });

  const queryClient = useQueryClient();
    const createInventoryItemMutation = useMutation({
      mutationFn: (data) =>createInventoryItem({data, token}),
      onSuccess:(createdInventoryItem) => {
        console.log("New inventory item created:", createdInventoryItem);
        queryClient.invalidateQueries(['inventoryByOrigin', selectedOriginStopId]);
      },
      onError: (err) => {
        console.log(err)
      }
    });
  const deleteInventoryItemMutation = useMutation({
    mutationFn: deleteInventoryItem,
    onSuccess: () => {
      console.log('InventoryItem deleted!');
      queryClient.invalidateQueries(['inventoryByOrigin', selectedOriginStopId]);
    },
    onError: (err) => {
      console.error('Failed to delete inventory item', err);
    }
  });

    const updateInventoryItemMutation = useMutation({
        mutationFn: ({id, data}) =>updateInventoryItem({id, data}),
      onSuccess:(updatedInventoryItem) => {
        console.log("Updated inventory item:", updatedInventoryItem);
        queryClient.invalidateQueries(['inventoryByOrigin', selectedOriginStopId]);
      },
      onError: (err) => {
        console.log(err)
      }
    });

      const updateOriginMutation = useMutation({
        mutationFn: ({id, data }) =>updateOrigin({id, data, token}),
        onSuccess:(updatedOrigin) => {
          //console.log("Updated origin:", updatedOrigin);
          queryClient.invalidateQueries(['inventoryByOrigin', selectedOriginStopId]);
        },
        onError: (err) => {
          console.log(err)
        }
      });
  
  // Which "Stop" index we’re on (0-based)
  const { selectedOriginStopId, setSelectedOriginStopId } = useUiState();
  const { itemsByRoom,
    setItemsByRoom,
    displayedRooms,
    setDisplayedRooms,
    inventoryItems,
    setInventoryItems } = useInventoryContext();


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
  const refreshAutoBoxes = (updatedInventory) => {
    const result = generateAutoBoxes({
      inventoryItems: updatedInventory,
      allItems,
      originId: selectedOriginStopId,
      prevTotalLbs: prevTotalLbsRef.current,
    });
  
    if (!result) return;
  
    setItemsByRoom((prev) => ({
      ...prev,
      [13]: result.updatedRoom13,
    }));
  
    setInventoryItems(() => {
      const rest = updatedInventory.filter((itm) => itm.roomId !== 13 || !itm.autoAdded);
      return [...rest, ...result.autoBoxes];
    });
  
    prevTotalLbsRef.current = result.totalLbs;
  };

  const applyInventoryUpdates = ({ roomId, updatedRoomItems, updatedInventoryItems, refreshBoxes = false }) => {
    setItemsByRoom(prev => ({
      ...prev,
      [roomId]: updatedRoomItems,
    }));
  
    setInventoryItems(updatedInventoryItems);
    if (refreshBoxes && isToggled) {
      refreshAutoBoxes(updatedInventoryItems);
    }
  };
  
  

  
  

  // ==================== LOAD INVENTORY ON MOUNT ====================

  const { data: inventoryData } = useQuery({
    queryKey: ['inventoryByOrigin', selectedOriginStopId],
    queryFn: () => getInventoryByOriginId({ originId: selectedOriginStopId }),
    enabled: !!selectedOriginStopId, 
  });
  useEffect(() => {
    if (inventoryData) {
      setItemsByRoom(inventoryData.itemsByRoom || {});
      setDisplayedRooms(inventoryData.displayedRooms || []);
      setInventoryItems(inventoryData.inventoryItems || []);
    }
  }, [inventoryData]);
  
  console.log('inventoryItems ', inventoryItems)
  useEffect(() => {
    //console.log('Selected Origin Stop ID:', selectedOriginStopId);
  }, [selectedOriginStopId]);
  
  const selectedRoom = inventoryRoom;
  



  // ==================== CHECK DESKTOP OR MOBILE ====================
  useEffect(() => {
    function handleResize() {
      setIsDesktop(window.innerWidth >= 1024);
    }
    window.addEventListener("resize", handleResize);
    handleResize(); // Run once on mount
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // ==================== ROOM + ITEM LOGIC (MOBILE) ====================

  const handleStartFresh = async (newItemInstance) => {
    if (!selectedRoom) return;
  
    const roomId = selectedRoom.id;    
    const baseItem = allItems.find(
      (f) => f.id === newItemInstance.furnitureItemId
    );
    const defaultPacking =
        baseItem.packingType && baseItem.packingQuantity
          ? { [baseItem.packingType]: baseItem.packingQuantity }
          : {};
  
    const resetItem = {
      originId: selectedOriginStopId,
      roomId,
      furnitureItemId: newItemInstance.furnitureItemId,
      name: baseItem.name,
      imageName: baseItem.imageName,
      letters: baseItem.letters,
      search: baseItem.search,
      tags: baseItem.tags || [],
      notes: "",
      cuft: baseItem.cuft,
      lbs: baseItem.lbs,
      packingNeeds: defaultPacking,
      uploadedImages: [],
      cameraImages: [],
      autoAdded: false,
      count: 1,
    };
    resetItem.groupingKey = generateGroupingKey(resetItem);
  
    const currentRoomItems = itemsByRoom[roomId] || [];
  const updatedRoomItems = [...currentRoomItems];
  const updatedInventoryItems = [...inventoryItems];

  const originalItemIndex = updatedRoomItems.findIndex(
    (itm) => itm.groupingKey === newItemInstance.groupingKey
  );

  const duplicate = updatedInventoryItems.find(
    (itm) =>
      itm.groupingKey === resetItem.groupingKey &&
      itm.groupingKey !== newItemInstance.groupingKey // da ne uzme samog sebe
  );

  if (duplicate) {
    const mergedItem = {
      ...duplicate,
      count: duplicate.count + 1,
    };

    const filteredRoom = updatedRoomItems.filter((itm) => itm.groupingKey !== newItemInstance.groupingKey);
    const filteredInventory = updatedInventoryItems.filter((itm) => itm.groupingKey !== newItemInstance.groupingKey);

    const finalRoomItems = filteredRoom.map((itm) =>
      itm.groupingKey === duplicate.groupingKey ? mergedItem : itm
    );
    const finalInventoryItems = filteredInventory.map((itm) =>
      itm.groupingKey === duplicate.groupingKey ? mergedItem : itm
    );

    applyInventoryUpdates({
      roomId,
      updatedRoomItems: finalRoomItems,
      updatedInventoryItems: finalInventoryItems,
      refreshBoxes: true, 
    });

    return { ...mergedItem }; 
  }

  updatedRoomItems[originalItemIndex] = resetItem;
  const inventoryIndex = updatedInventoryItems.findIndex(
    (itm) => itm.groupingKey === newItemInstance.groupingKey
  );
  updatedInventoryItems[inventoryIndex] = resetItem;

  applyInventoryUpdates({
    roomId,
    updatedRoomItems,
    updatedInventoryItems,
    refreshBoxes: true, 
  });

  return { ...resetItem };
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
  
    const roomId = selectedRoom.id;
    const current = itemsByRoom[roomId] || [];
    const doAction = action || (isDeleteActive ? "decrease" : "increase");
  
    const hasFurnitureId = !!clickedItem.furnitureItemId;
    const furnitureItemId = hasFurnitureId
      ? Number(clickedItem.furnitureItemId)
      : Number(clickedItem.id);
  
    const groupingKey = generateGroupingKey({
      furnitureItemId,
      roomId,
      tags: clickedItem.tags || [],
      notes: clickedItem.notes || '',
      cuft: clickedItem.cuft || '',
      lbs: clickedItem.lbs || '',
      packingNeeds: clickedItem.packingNeeds || {},
      link: clickedItem.link || '',
      uploadedImages: clickedItem.uploadedImages || [],
      cameraImages: clickedItem.cameraImages || [],
    });
  
    const existingItem = current.find((item) => item.groupingKey === groupingKey);
  
    let updatedRoomItems;
    let updatedInventoryItems;
  
    if (doAction === "decrease") {
      if (!existingItem) return;
  
      if (existingItem.count > 1) {
        const updatedItem = { ...existingItem, count: existingItem.count - 1 };
  
        updatedRoomItems = current.map((itm) =>
          itm.groupingKey === groupingKey ? updatedItem : itm
        );
  
        updatedInventoryItems = inventoryItems.map((itm) =>
          itm.groupingKey === groupingKey ? updatedItem : itm
        );
      } else {
        updatedRoomItems = current.filter((itm) => itm.groupingKey !== groupingKey);
        updatedInventoryItems = inventoryItems.filter((itm) => itm.groupingKey !== groupingKey);
      }
    } else {
      const defaultPacking =
        clickedItem.packingType && clickedItem.packingQuantity
          ? { [clickedItem.packingType]: clickedItem.packingQuantity }
          : {};
  
      const newItemInstance = {
        originId: selectedOriginStopId,
        roomId,
        furnitureItemId,
        name: clickedItem.name,
        imageName: clickedItem.imageName,
        letters: [...(clickedItem.letters || [])],
        search: clickedItem.search,
        tags: [...(clickedItem.tags || [])],
        notes: clickedItem.notes || '',
        cuft: clickedItem.cuft || '',
        lbs: clickedItem.lbs || '',
        packingNeeds: isMyItemsActive
          ? { ...clickedItem.packingNeeds }
          : defaultPacking,
        link: clickedItem.link || '',
        autoAdded: clickedItem.autoAdded || false,
        uploadedImages: [...(clickedItem.uploadedImages || [])],
        cameraImages: [...(clickedItem.cameraImages || [])],
        groupingKey,
        count: 1,
      };
  
      if (existingItem) {
        const updatedItem = {
          ...existingItem,
          count: existingItem.count + 1,
        };
  
        updatedRoomItems = current.map((itm) =>
          itm.groupingKey === groupingKey ? updatedItem : itm
        );
  
        updatedInventoryItems = inventoryItems.map((itm) =>
          itm.groupingKey === groupingKey ? updatedItem : itm
        );
      } else {
        updatedRoomItems = [...current, newItemInstance];
        updatedInventoryItems = [...inventoryItems, newItemInstance];
      }
    }
  
    applyInventoryUpdates({
      roomId,
      updatedRoomItems,
      updatedInventoryItems,
      refreshBoxes: true, 
    });
  };
  
  
  
  
  const handleToggleRoom = (roomId) => {
    if (roomId === 13) return; // Boxes should always stay
  
    const isVisible = displayedRooms.includes(roomId);
    let updated = isVisible
      ? displayedRooms.filter((id) => id !== roomId)
      : [...displayedRooms, roomId];
  
    // Ensure Boxes (13) is always included
    if (!updated.includes(13)) {
      updated.push(13);
    }
    setDisplayedRooms(updated);

  };
  

  const getItemCountForCurrentRoom = () => {
    if (!selectedRoom) return 0;
    const items = itemsByRoom[selectedRoom.id] || [];
    return items.reduce((total, item) => total + (item.count || 1), 0);
  };
  

  // ==================== POPUP: UPDATE / ADD ITEM ====================
  const handleUpdateItem = (updatedItemInstance, originalItemInstance) => {
    if (!selectedRoom) return;
    const roomId = selectedRoom.id;
    const currentItems = itemsByRoom[roomId] || [];

    const originalKey = originalItemInstance.groupingKey;
    const newKey = updatedItemInstance.groupingKey || generateGroupingKey(updatedItemInstance);
  
    const updatedItem = {
      ...updatedItemInstance,
      originId: selectedOriginStopId,
      roomId,
      groupingKey: newKey,
      count: updatedItemInstance.count,
    };
    let updatedRoomItems = [...currentItems];
    let updatedInventoryItems = [...inventoryItems];
    const duplicate = newKey !== originalKey
  ? inventoryItems.find((item) => item.groupingKey === newKey)
  : null;

if (duplicate) {
  const mergedCount = duplicate.count + updatedItem.count;

  updatedRoomItems = updatedRoomItems.filter(
    (itm) => itm.groupingKey !== originalKey
  );
  updatedInventoryItems = updatedInventoryItems.filter(
    (itm) => itm.groupingKey !== originalKey
  );

  const updatedDuplicate = {
    ...duplicate,
    count: mergedCount,
  };

  updatedRoomItems = updatedRoomItems.map((itm) =>
    itm.groupingKey === newKey ? updatedDuplicate : itm
  );
  updatedInventoryItems = updatedInventoryItems.map((itm) =>
    itm.groupingKey === newKey ? updatedDuplicate : itm
  );
} else {
  updatedRoomItems = updatedRoomItems.map((itm) =>
    itm.groupingKey === originalKey ? updatedItem : itm
  );
  updatedInventoryItems = updatedInventoryItems.map((itm) =>
    itm.groupingKey === originalKey ? updatedItem : itm
  );
}
applyInventoryUpdates({ roomId, updatedRoomItems, updatedInventoryItems,refreshBoxes: true});


};
  
  
  const handleDeleteItem = (itemToDelete) => {
    const roomId = selectedRoom?.id;
    if (!roomId) return;
  
    const currentItems = itemsByRoom[roomId] || [];
    const currentItem = currentItems.find(itm => itm.groupingKey === itemToDelete.groupingKey);
    if (!currentItem) return;
    let updatedRoomItems;
    let updatedInventory;
    if (currentItem.count > 1) {
      const updatedItem = { ...currentItem, count: currentItem.count - 1 };
      updatedRoomItems = currentItems.map(itm =>
        itm.groupingKey === itemToDelete.groupingKey ? updatedItem : itm
      );
  
      updatedInventory = inventoryItems.map(itm =>
        itm.groupingKey === itemToDelete.groupingKey ? updatedItem : itm
      );
    } else {
      updatedRoomItems = currentItems.filter(itm => itm.groupingKey !== itemToDelete.groupingKey);
      updatedInventory = inventoryItems.filter(itm => itm.groupingKey !== itemToDelete.groupingKey);
    }
    applyInventoryUpdates({ roomId, updatedRoomItems, updatedInventory, refreshBoxes: false   });
    setTimeout(() => {
      refreshAutoBoxes();
    }, 0);
  };
  const handleAddItem = (newItemInstance) => {
    if (!selectedRoom) return;
  
    const roomId = selectedRoom.id;
    const groupingKey = newItemInstance.groupingKey || generateGroupingKey(newItemInstance);
    const itemData = {
      ...newItemInstance,
      originId: selectedOriginStopId,
      roomId,
      groupingKey,
      count: 1,
    };

    const currentRoomItems = itemsByRoom[roomId] || [];
    const existingInRoom = currentRoomItems.find(item => item.groupingKey === groupingKey);
  
    let updatedRoomItems;
    if (existingInRoom) {
      updatedRoomItems = currentRoomItems.map(item =>
        item.groupingKey === groupingKey
          ? { ...item, count: item.count + 1 }
          : item
      );
    } else {
      updatedRoomItems = [...currentRoomItems, itemData];
    }
  
    const existingInInventory = inventoryItems.find(item => item.groupingKey === groupingKey);
  
    let updatedInventoryItems;
    if (existingInInventory) {
      updatedInventoryItems = inventoryItems.map(item =>
        item.groupingKey === groupingKey
          ? { ...item, count: item.count + 1 }
          : item
      );
    } else {
      updatedInventoryItems = [...inventoryItems, itemData];
    }
    applyInventoryUpdates({ roomId, updatedRoomItems, updatedInventoryItems, refreshBoxes: true });
    
    
  }; 
  

  // Close entire Inventory
  const handleClose = () => {
    onCloseInventory();
  };
  const displayedRoomObjects = (displayedRooms || []).map((rId) => {
    const found = rooms.find((rm) => rm.id === rId);
    return found || { id: rId, name: `Room #${rId}` };
  });
  useEffect(() => {
    if (selectedRoom && itemsByRoom[selectedRoom.id]) {
      console.log('Room Items Updated:', itemsByRoom[selectedRoom.id]);
    }
  }, [itemsByRoom, selectedRoom]);

  const currentRoomInstances = useMemo(() => {
    return itemsByRoom[selectedRoom?.id] || [];
  }, [itemsByRoom, selectedRoom])

  
  


  // ==================== DESKTOP VIEW ====================
  if (isDesktop) {
    return (
      <InventoryDesktop
        // The entire multi-stop object
        inventoryItems={inventoryItems}
        stopIndex={selectedOriginStopId}
        setStopIndex={setSelectedOriginStopId}
        // The “subset” for this stop
        itemsByRoom={itemsByRoom}
        displayedRooms={displayedRoomObjects}
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
        handleDeleteItem={handleDeleteItem}
        handleAddItem={handleAddItem}
        handleStartFresh={handleStartFresh}
        // Delete toggle
        isDeleteActive={isDeleteActive}
        setIsDeleteActive={setIsDeleteActive}
        handleToggleRoom={handleToggleRoom}
      />
    );
  }

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
            displayedRooms={displayedRooms} // numeric IDs
            onToggleRoom={handleToggleRoom}
            lead={lead}
            stopIndex={selectedOriginStopId}
            onStopIndexChange={setSelectedOriginStopId}
          />
        )}
      </header>

      <main className={styles.mainContent}>
        {selectedRoom ? (
          <ItemSelection
            allItems={allItems}
            room={selectedRoom}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            selectedLetter={selectedLetter}
            selectedSubButton={selectedSubButton}
            onLetterSelect={handleLetterSelect}
            onSubButtonSelect={handleSubButtonSelect}
            itemClickCounts={currentRoomInstances || []}
            itemInstances={currentRoomInstances || []}
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
            itemsByRoom={itemsByRoom}
            displayedRooms={displayedRoomObjects}
           
          />
        )}
      </main>
      
      

      {popupData && selectedRoom &&(
        <ItemPopup
          item={popupData.item}
          itemInstance={popupData.itemInstance}
          itemInstances={currentRoomInstances}
          handleDeleteItem={handleDeleteItem}
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
        itemsByRoom={itemsByRoom}
        selectedRoom={selectedRoom}
        displayedRooms={displayedRooms}
        onCloseInventory={handleClose}
        lead={lead}
      />
    </div>
  );
}

export default Inventory;
