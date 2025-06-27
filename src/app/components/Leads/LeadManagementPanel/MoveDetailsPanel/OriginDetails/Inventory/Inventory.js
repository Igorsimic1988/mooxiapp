"use client";

import React, { useState, useEffect, useRef, useMemo, useCallback } from "react";
import styles from "./Inventory.module.css";
import Fuse from 'fuse.js';

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
import { v4 as uuidv4 } from "uuid";
import { generateGroupingKey } from "./utils/generateGroupingKey";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getAllFurnitureItems } from "src/app/services/furnitureService";
import { getInventoryByOriginId, syncInventory, getInventoryByDestinationId } from "src/app/services/inventoryItemsService";
import { useUiState } from "../../UiStateContext";
import { useInventoryContext } from "../../InventoryContext";
import { addDefaultTags } from "./utils/addDefaultTags";

// Default room IDs
const defaultRoomIds = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13];

// Fuse.js configuration for fuzzy search
const fuseOptions = {
  keys: ['name', 'tags'],
  threshold: 0.3,
  includeScore: true,
  minMatchCharLength: 2,
  shouldSort: true,
  findAllMatches: true,
  ignoreLocation: true,
};

function Inventory({
  lead,
  onCloseInventory,
  inventoryRoom,
  setInventoryRoom,
}) {

  // Fetch furniture items from backend
  const { data: allItems = [], isLoading: itemsLoading } = useQuery({
    queryKey: ['furnitureItems', lead?.brandId],
    queryFn: () => getAllFurnitureItems({ brandId: lead?.brandId }),
    enabled: !!lead?.brandId,
  });

  // Create Fuse instance with better memoization
  const fuse = useMemo(() => {
    if (!allItems || allItems.length === 0) return null;
    
    try {
      return new Fuse(allItems, fuseOptions);
    } catch (error) {
      console.error('Error creating Fuse instance:', error);
      return null;
    }
  }, [allItems]);

  const queryClient = useQueryClient();

  // Sync mutation for backend
  const syncAllInventoryDataMutation = useMutation({
    mutationFn: ({stopId, stopType, displayedRooms, itemsByRoom, deleteItemIds}) => {
      const inventoryItems = Object.values(itemsByRoom).flat();
      const autoBoxEnabled = isToggled;
      
      return syncInventory({
        stopId, 
        stopType, 
        displayedRooms, 
        itemsByRoom,
        inventoryItems,
        autoBoxEnabled,
        deleteItemIds,
      });
    },
    onSuccess: (_data, variables) => {
      const { stopType, stopId } = variables;
      if (stopType === 'origin'){
        queryClient.invalidateQueries(['inventoryByOrigin', stopId]);
      } else {
        queryClient.invalidateQueries(['inventoryByDestination', stopId]);
      }
    },
    onError: (err) => {
      console.error("Sync error:", err);
    }
  });

  // Stop selection from context
  const { selectedOriginStopId, setSelectedOriginStopId, selectedDestinationStopId, setSelectedDestinationStopId } = useUiState();
  const selectedStopInfo = useMemo(() => {
    if (selectedOriginStopId) {
      return {
        type: 'origin',
        id: selectedOriginStopId,
        setId: setSelectedOriginStopId
      };
    } else if (selectedDestinationStopId) {
      return {
        type: 'destination',
        id: selectedDestinationStopId,
        setId: setSelectedDestinationStopId
      };
    }
    return null;
  }, [selectedOriginStopId, selectedDestinationStopId, setSelectedOriginStopId, setSelectedDestinationStopId]);
  const selectedStop = useMemo(() => {
    if (!lead || !selectedStopInfo) return null;
  
    const list = selectedStopInfo.type === 'origin' ? lead.origins : lead.destinations;
    return list?.find((stop) => stop.id === selectedStopInfo.id) || null;
  }, [lead, selectedStopInfo]);
  


  const { inventoryByStop, setInventoryByStop } = useInventoryContext();

const stopId = selectedStopInfo?.id;

const getStopData = useCallback((stopId) => {
  if (!stopId || !inventoryByStop || typeof inventoryByStop !== 'object') {
    return {
      displayedRooms: defaultRoomIds.slice(),
      itemsByRoom: {},
      inventoryItems: [],
      autoBoxEnabled: true,
      deleteItemIds: [],
    };
  }

  const stopData = inventoryByStop[stopId];

  return {
    displayedRooms: stopData?.displayedRooms || defaultRoomIds.slice(),
    itemsByRoom: stopData?.itemsByRoom || {},
    inventoryItems: stopData?.inventoryItems || [],
    autoBoxEnabled: stopData?.autoBoxEnabled ?? true,
    deleteItemIds: stopData?.deleteItemIds || [],
  };
}, [inventoryByStop]);




const isToggled = useMemo(() => {
  if (!stopId || !inventoryByStop || !inventoryByStop[stopId]) return true;
  return inventoryByStop[stopId].autoBoxEnabled ?? true;
}, [stopId, inventoryByStop]);

const setIsToggled = (newValue) => {
  setInventoryByStop((prev) => {
    const stopData = getStopData(stopId);
    const currentValue = stopData.autoBoxEnabled ?? true;
    const resolvedValue = typeof newValue === 'function' ? newValue(currentValue) : newValue;

    return {
      ...prev,
      [stopId]: {
        ...stopData,
        autoBoxEnabled: resolvedValue,
      },
    };
  });
};
  


  // Inventory context

  useEffect(() => {
  console.log('inventoryByStop:', inventoryByStop);
}, [inventoryByStop]);

  const [hasLoadedInventory, setHasLoadedInventory] = useState(false);
  
  // Selected room
  const selectedRoom = inventoryRoom;

  // Search/filter states
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedLetter, setSelectedLetter] = useState(null);
  const [selectedSubButton, setSelectedSubButton] = useState({
    letter: null,
    subButton: null,
  });

  // UI toggles
  const [isSpecialHVisible, setIsSpecialHVisible] = useState(false);
  const [isDesktop, setIsDesktop] = useState(false);
  const [isMyItemsActive, setIsMyItemsActive] = useState(false);
  const [isDeleteActive, setIsDeleteActive] = useState(false);

  // For auto-box tracking
  const prevTotalLbsRef = useRef(null);

  // Popup state
  const [popupData, setPopupData] = useState(null);

  const handleOpenPopup = useCallback((item, itemInstance) => {
    setPopupData({ item, itemInstance });
  }, []);
  
  const handleClosePopup = useCallback(() => {
    setPopupData(null);
  }, []);

  // iOS Safari height fix
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

  const inventoryQueryKey = selectedStopInfo.type === 'origin'
  ? ['inventoryByOrigin', selectedStopInfo.id]
  : ['inventoryByDestination', selectedStopInfo.id];

const inventoryQueryFn = selectedStopInfo.type === 'origin'
  ? () => getInventoryByOriginId({ originId: selectedStopInfo.id })
  : () => getInventoryByDestinationId({ destinationId: selectedStopInfo.id });

const { data: inventoryData } = useQuery({
  queryKey: inventoryQueryKey,
  queryFn: inventoryQueryFn,
  enabled: !!selectedStopInfo.id,
});
useEffect(() => {
  if (inventoryData && selectedStopInfo?.id) {

    setInventoryByStop((prev) => ({
      ...prev,
      [selectedStopInfo.id]: {
        itemsByRoom: inventoryData.itemsByRoom || {},
        displayedRooms: inventoryData.displayedRooms || [],
        inventoryItems: inventoryData.inventoryItems || [],
        autoBoxEnabled:
          inventoryData.autoBoxEnabled !== undefined
            ? inventoryData.autoBoxEnabled
            : true,
        deleteItemIds: inventoryData.deleteItemIds || [], 

      },
    }));
         setHasLoadedInventory(true);

  }
}, [inventoryData, selectedStopInfo]);


  useEffect(() => {
    function handleResize() {
      setIsDesktop(window.innerWidth >= 1024);
    }
    window.addEventListener("resize", handleResize);
    handleResize();
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Handle room selection
  const handleRoomSelect = useCallback((room) => {
    if (setInventoryRoom) setInventoryRoom(room);
  }, [setInventoryRoom]);

  const handleBackToRooms = useCallback(() => {
    if (setInventoryRoom) setInventoryRoom(null);
    setSearchQuery("");
    setSelectedLetter(null);
    setSelectedSubButton({ letter: null, subButton: null });
  }, [setInventoryRoom]);

  // Optimized search handler with debouncing
  const searchTimeoutRef = useRef(null);
  const handleSearch = useCallback((query) => {
    // Clear previous timeout
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
    
    // Update search query immediately for UI responsiveness
    setSearchQuery(query);
    
    // Debounce the actual search logic
    searchTimeoutRef.current = setTimeout(() => {
      setIsMyItemsActive(false);
      setSelectedLetter(null);
      setSelectedSubButton({ letter: null, subButton: null });
    }, 100);
  }, []);

  const handleSearchClick = useCallback(() => {
    setIsMyItemsActive(false);
    setSelectedLetter(null);
    setSelectedSubButton({ letter: null, subButton: null });
  }, []);

  const handleLetterSelect = useCallback((letter) => {
    setIsMyItemsActive(false);
    if (selectedLetter === letter) {
      setSelectedLetter(null);
      setSelectedSubButton({ letter: null, subButton: null });
    } else {
      setSelectedLetter(letter);
      setSelectedSubButton({ letter: null, subButton: null });
      setSearchQuery("");
    }
  }, [selectedLetter]);

  const handleSubButtonSelect = useCallback((letter, subButton) => {
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
  }, [selectedSubButton]);

  // Handle item selection (add/remove individual instances)
  const handleItemSelection = useCallback((clickedItem, action) => {
    if (!selectedRoom || !selectedStopInfo) return;
    const hasFurnitureId = !!clickedItem.furnitureItemId;
    const furnitureItemId = hasFurnitureId
      ? Number(clickedItem.furnitureItemId)
      : Number(clickedItem.id);
    const doAction = action || (isDeleteActive ? "decrease" : "increase");
  
   

    setInventoryByStop((prev) => {
      const stopData = getStopData(selectedStopInfo.id);
      const items = [...(stopData.itemsByRoom[selectedRoom.id] || [])];
      const deleteItemIds = [...(stopData.deleteItemIds || [])];

      if (doAction === "decrease") {
        // Remove one instance
        let idx = -1;
        if (isMyItemsActive) {
          idx = items.findIndex(
            (itm) => itm.groupingKey === clickedItem.groupingKey
          );
        }else {
          const itemIdToDelete = clickedItem.furnitureItemId?.toString() || clickedItem.id?.toString();
          idx = items.findIndex((itm) => itm.furnitureItemId?.toString() === itemIdToDelete);
        }
        if (idx !== -1) {
          const [removedItem] = items.splice(idx, 1);
          if (removedItem?.id) {
            deleteItemIds.push(removedItem.id);
          }
        }
      } else {
        // Add new instance
        let newItemInstance;
        const { tags, packingNeeds } = addDefaultTags(clickedItem, selectedRoom.id, lead, selectedStop);
        if (isMyItemsActive) {
          newItemInstance = {
            id: uuidv4(),
            furnitureItemId,
            roomId: selectedRoom.id, 
            tags,
            notes: clickedItem.notes || "",
            cuft: clickedItem.cuft || "",
            lbs: clickedItem.lbs || "",
            packingNeeds,
            link: clickedItem.link || "",
            uploadedImages: [...(clickedItem.uploadedImages || [])],
            cameraImages: [...(clickedItem.cameraImages || [])],
            groupingKey: clickedItem.groupingKey,
            name: clickedItem.name || "", 
            imageName: clickedItem.imageName || "", 
            letters: [...(clickedItem.letters || [])], 
            search: clickedItem.search ,
          };
        } else {
          // Create new from furniture item
          //const furnitureId = clickedItem.id?.toString();
          newItemInstance = {
            id: uuidv4(),
            furnitureItemId,
            roomId: selectedRoom.id,
            tags,
            notes: "",
            cuft: clickedItem.cuft || "",
            lbs: clickedItem.lbs || "",
            packingNeeds,
            link: "",
            uploadedImages: [],
            cameraImages: [],
            name: clickedItem.name || "", 
            imageName: clickedItem.imageName || "",
            letters: [...(clickedItem.letters || [])],
            search: clickedItem.search ?? true,
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
        deleteItemIds,
      };
      return { ...prev, [selectedStopInfo.id]: updatedStopData };
    });
  }, [selectedRoom, selectedStopInfo, isDeleteActive, isMyItemsActive, getStopData, setInventoryByStop]);

  // Other callbacks optimized similarly...

  const handleToggleRoom = useCallback((roomId) => {
    if (roomId === 13 || !selectedStopInfo) return;

    setInventoryByStop((prev) => {
      const stopData = getStopData(selectedStopInfo.id);
      const oldDisplayed = stopData.displayedRooms || [];

      let newDisplayed;
      if (oldDisplayed.includes(roomId)) {
        newDisplayed = oldDisplayed.filter((id) => id !== roomId);
      } else {
        newDisplayed = [...oldDisplayed, roomId];
      }

      if (!newDisplayed.includes(13)) {
        newDisplayed.push(13);
      }


      const updatedStopData = {
        ...stopData,
        displayedRooms: newDisplayed,
      };
      return { ...prev, [selectedStopInfo.id]: updatedStopData };
    });
  }, [selectedStopInfo, getStopData, setInventoryByStop]);

  const getItemCountForCurrentRoom = useCallback(() => {
    if (!selectedRoom || !selectedStopInfo) return 0;
    const stopData = getStopData(selectedStopInfo.id);
    const items = stopData.itemsByRoom[selectedRoom.id] || [];
    return items.length;
  }, [selectedRoom, selectedStopInfo, getStopData]);
  
  
  const handleUpdateItem = useCallback((updatedItemInstance, originalItemInstance) => {
    if (!selectedRoom || !selectedStopInfo) return;
    
    setInventoryByStop((prev) => {
      const stopData = getStopData(selectedStopInfo.id);
      const items = [...(stopData.itemsByRoom[selectedRoom.id] || [])];
      
      const idx = items.findIndex((itm) => itm.id === originalItemInstance.id);
      if (idx === -1) return prev;

      const updated = {
        ...updatedItemInstance,
        id: originalItemInstance.id,
        groupingKey: generateGroupingKey(updatedItemInstance),
      };
      items[idx] = updated;

      const updatedStopData = {
        ...stopData,
        itemsByRoom: {
          ...stopData.itemsByRoom,
          [selectedRoom.id]: items,
        },
      };
      return { ...prev, [selectedStopInfo.id]: updatedStopData };
    });
  }, [selectedRoom, selectedStopInfo, getStopData, setInventoryByStop]);

  const handleAddItem = useCallback((newItemInstance) => {
    if (!selectedRoom || !selectedStopInfo) return;
    
    setInventoryByStop((prev) => {
      const stopData = getStopData(selectedStopInfo.id);
      const items = [...(stopData.itemsByRoom[selectedRoom.id] || [])];
      
      const itemToAdd = {
        ...newItemInstance,
        id: uuidv4(),
        groupingKey: generateGroupingKey(newItemInstance),
      };
      items.push(itemToAdd);

      const updatedStopData = {
        ...stopData,
        itemsByRoom: {
          ...stopData.itemsByRoom,
          [selectedRoom.id]: items,
        },
      };
      return { ...prev, [selectedStopInfo.id]: updatedStopData };
    });
  }, [selectedRoom, selectedStopInfo, getStopData, setInventoryByStop]);

  // Auto-add boxes logic
  useEffect(() => {
    if (!isToggled || !selectedStopInfo || !hasLoadedInventory) return;

    const stopData = getStopData(selectedStopInfo.id);
    const itemsByRoom = stopData.itemsByRoom || {};

    let totalLbs = 0;
    const excludedRoomId = 13;
    const excludedIds = ["529", "530", "531", "532", "533", "534", "535", "536", "537"];

    Object.keys(itemsByRoom).forEach((roomId) => {
      if (Number(roomId) === excludedRoomId) return;
      itemsByRoom[roomId].forEach((itm) => {
        if (!excludedIds.includes(itm.furnitureItemId)) {
          const lbsVal = parseFloat(itm.lbs || itm.item?.lbs || 0);
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

    setInventoryByStop((prev) => {
      const updatedStopData = { ...getStopData(selectedStopInfo.id) };
      const itemsByRoom2 = { ...updatedStopData.itemsByRoom };
      const oldBoxes = itemsByRoom2["13"] || [];
      const nonAuto = oldBoxes.filter((bx) => !bx.autoAdded);

      const newBoxes = [];
      boxesToAdd.forEach((bx) => {
        for (let i = 0; i < bx.count; i++) {
          const itemData = allItems.find((it) => it.id.toString() === bx.itemId);
          if (itemData) {
            let packing = {};
            if (itemData.packingNeeds?.length) {
              itemData.packingNeeds.forEach((p) => {
                packing[p.type] = p.quantity;
              });
            }
            const newInst = {
              id: uuidv4(),
              furnitureItemId: bx.itemId,
              tags: [...(itemData.tags || [])],
              notes: "",
              cuft: itemData.cuft || "",
              lbs: itemData.lbs || "",
              packingNeeds: packing,
              autoAdded: true,
              groupingKey: "",
              sortKey: `auto-${bx.itemId}-${i}`,
            };
            newInst.groupingKey = generateGroupingKey(newInst);
            newBoxes.push(newInst);
          }
        }
      });

      itemsByRoom2["13"] = [...nonAuto, ...newBoxes];
      
      return {
        ...prev,
        [selectedStopInfo.id]: {
          ...updatedStopData,
          itemsByRoom: itemsByRoom2,
        },
      };
    });
  }, [isToggled, selectedStopInfo, getStopData, allItems, hasLoadedInventory, setInventoryByStop]);

  // Close and sync
  const handleClose = async () => {
    try {
      const stopSyncs = Object.entries(inventoryByStop).map(([stopId, stopData]) => {
        const isOrigin = lead?.origins?.some((s) => String(s.id) === stopId);
        const stopType = isOrigin ? "origin" : "destination";
        return syncAllInventoryDataMutation.mutateAsync({
          stopId,
          stopType,
          displayedRooms: stopData.displayedRooms,
          itemsByRoom: stopData.itemsByRoom,
          deleteItemIds: stopData.deleteItemIds || [], 
        });
      });
      
      await Promise.all(stopSyncs);
      setInventoryByStop((prev) => {
        const updated = { ...prev };
        for (const stopId in updated) {
          updated[stopId] = {
            ...updated[stopId],
            deleteItemIds: [],
          };
        }
      });
      onCloseInventory();
    } catch (error) {
      console.error("Sync failed:", error);
    }
  };

  // Desktop view
  if (isDesktop && selectedStopInfo) {
    const stopData = getStopData(selectedStopInfo.id);
    const displayedRoomObjects = (stopData.displayedRooms || []).map((rId) => {
      const found = rooms.find((rm) => rm.id === rId);
      return found || { id: rId, name: `Room #${rId}` };
    });

    return (
      <InventoryDesktop
        inventoryByStop={inventoryByStop}
        setInventoryByStop={setInventoryByStop}
        stopIndex={selectedStopInfo.id}
        setStopIndex={selectedStopInfo.setId}
        roomItemSelections={stopData.itemsByRoom}     
        setRoomItemSelections={(fnOrObj) => {
          setInventoryByStop((prev) => {
            const oldStopData = prev[selectedStopInfo.id] || {
              itemsByRoom: {},
              deleteItemIds: [],
              displayedRooms: defaultRoomIds.slice(),
              autoBoxEnabled: true,
              inventoryItems: [],
            };
        
            const oldItems = oldStopData.itemsByRoom;
            const newItems = typeof fnOrObj === "function" ? fnOrObj(oldItems) : fnOrObj;
        
            return {
              ...prev,
              [selectedStopInfo.id]: {
                ...oldStopData,
                itemsByRoom: newItems,
              },
            };
          });
        }}
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
        handleItemSelection={handleItemSelection}
        handleUpdateItem={handleUpdateItem}
        handleAddItem={handleAddItem}
        isDeleteActive={isDeleteActive}
        setIsDeleteActive={setIsDeleteActive}
        handleToggleRoom={handleToggleRoom}
        allItems={allItems}
        selectedStopInfo={selectedStopInfo}
        fuse={fuse}
      />
    );
  }

  // Mobile view
  if (!selectedStopInfo) {
    return <div>Please select a stop</div>;
  }

  // Show loading state while items are being fetched
  if (itemsLoading) {
    return (
      <div className={styles.inventoryContainer}>
        <div className={styles.loadingState}>Loading inventory...</div>
      </div>
    );
  }

  const stopData = getStopData(selectedStopInfo.id);
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
            rooms={rooms}
            displayedRooms={stopData.displayedRooms}
            onToggleRoom={handleToggleRoom}
            lead={lead}
            stopIndex={selectedStopInfo.id}
            onStopIndexChange={selectedStopInfo.setId}
          />
        )}
      </header>

      <main 
        className={`${styles.mainContent} ${selectedRoom ? styles.inRoom : styles.roomList}`}
      >
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
            itemClickCounts={stopData.itemsByRoom[selectedRoom.id] || []}
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
            onBackToRooms={handleBackToRooms}
            onOpenPopup={handleOpenPopup}
            fuse={fuse}
          />
        ) : (
          <RoomList
            onRoomSelect={handleRoomSelect}
            itemsByRoom={stopData.itemsByRoom}
            displayedRooms={displayedRoomObjects}
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
          handleDeleteItem={handleItemSelection}
          onOpenPopup={handleOpenPopup} 
          lead={lead}
          selectedRoom={selectedRoom}
          roomItemSelections={stopData.itemsByRoom}
          selectedStop={selectedStop}
          setRoomItemSelections={(fnOrObj) => {
            setInventoryByStop((prev) => {
              const oldStopData = getStopData(selectedStopInfo.id);
              const oldItems = oldStopData.itemsByRoom;
              const newItems =
                typeof fnOrObj === "function" ? fnOrObj(oldItems) : fnOrObj;
              return {
                ...prev,
                [selectedStopInfo.id]: {
                  ...oldStopData,
                  itemsByRoom: newItems,
                },
              };
            });
          }}
        />
      )}

      <FooterNavigation
        inRoom={!!selectedRoom}
        onBackToRooms={handleBackToRooms}
        isDeleteActive={isDeleteActive}
        setIsDeleteActive={setIsDeleteActive}
        isSpecialHVisible={isSpecialHVisible}
        setIsSpecialHVisible={setIsSpecialHVisible}
        roomItemSelections={stopData.itemsByRoom}
        setRoomItemSelections={(fnOrObj) => {
          setInventoryByStop((prev) => {
            const oldStopData = getStopData(selectedStopInfo.id);
            const oldItems = oldStopData.itemsByRoom;
            const newItems =
              typeof fnOrObj === "function" ? fnOrObj(oldItems) : fnOrObj;
            return {
              ...prev,
              [selectedStopInfo.id]: {
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