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

  const { data: inventoryData } = useQuery({
    queryKey: ['inventoryByOrigin', selectedOriginStopId],
    queryFn: () => getInventoryByOriginId({ originId: selectedOriginStopId }),
    enabled: !!selectedOriginStopId, 
  });
  const inventoryItems = inventoryData?.inventoryItems || [];
  const itemsByRoom = inventoryData?.itemsByRoom || {};
  const displayedRooms = inventoryData?.displayedRooms || [];
  useEffect(() => {
    //console.log('Selected Origin Stop ID:', selectedOriginStopId);
  }, [selectedOriginStopId]);
  
  const selectedRoom = inventoryRoom;

  useEffect(() => {
    if (!selectedOriginStopId || !Array.isArray(inventoryData)) return;
  
    const hasRealItems = inventoryData.some(item => item.furnitureItemId !== null);
  
    if (inventoryData.length === 0 || !hasRealItems) {
      const placeholderItem = allItems.find(item => item.id === 640);
      if (!placeholderItem) return;
  
      const defaultPacking =
        placeholderItem.packingType && placeholderItem.packingQuantity
          ? { [placeholderItem.packingType]: placeholderItem.packingQuantity }
          : {};
  
      const initialItem = {
        originId: selectedOriginStopId,
        roomId: 13,
        furnitureItemId: placeholderItem.id,
        name: placeholderItem.name,
        imageName: placeholderItem.imageName,
        letters: placeholderItem.letters,
        search: placeholderItem.search,
        tags: placeholderItem.tags || [],
        notes: "Initial item",
        cuft: placeholderItem.cuft || "",
        lbs: placeholderItem.lbs || "",
        packingNeeds: defaultPacking,
        uploadedImages: [],
        cameraImages: [],
        autoAdded: true,
        groupingKey: generateGroupingKey({
          furnitureItemId: placeholderItem.id,
          roomId: 13,
          autoAdded: true,
        }),
      };
  
      console.log("Pozivam mutate sa:", initialItem);
  
      createInventoryItemMutation.mutate(initialItem, {
        onSuccess: (createdItem) => {
          const updatedItemsByRoom = {
            ...itemsByRoom,
            13: [...(itemsByRoom[13] || []), createdItem],
          };
  
          updateOriginMutation.mutate({
            id: selectedOriginStopId,
            data: {
              itemsByRoom: updatedItemsByRoom,
            },
          });
        }
      });
    }
  }, [inventoryData, selectedOriginStopId, allItems]);
  



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

  const handleStartFresh = (newItemInstance) => {
    if (!selectedRoom) return;
  
    const roomId = selectedRoom.id;    
    const baseItem = allItems.find(
      (f) => f.id === newItemInstance.furnitureItemId
    );
  
    const resetItem = {
      originId: selectedOriginStopId,
      roomId,
      furnitureItemId: newItemInstance.furnitureItemId,
      name: baseItem.name,
      imageName: baseItem.imageName,
      letters: baseItem.letters,
      search: baseItem.search,
      tags: [],
      notes: "",
      cuft: baseItem.cuft,
      lbs: baseItem.lbs,
      packingNeeds: {},
      uploadedImages: [],
      cameraImages: [],
      autoAdded: false,
      count: 1,
    };
    resetItem.groupingKey = generateGroupingKey(resetItem);
  
    updateInventoryItemMutation.mutate({
      id: newItemInstance.id,
      data: resetItem,
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
    console.log('group   ', groupingKey)
  
    const existingItem = current.find((item) => item.groupingKey === groupingKey);
  
    if (doAction === "decrease") {
      if (!existingItem?.id) return;
  
      deleteInventoryItemMutation.mutate(
        { id: existingItem.id },
        {
          onSuccess: ({item}) => {
            const updated = item === null
            ? current.filter((itm) => itm.id !== existingItem.id)
            : current.map((itm) =>
                itm.id === item.id ? item : itm
              );
  
            updateOriginMutation.mutate({
              id: selectedOriginStopId,
              data: {
                itemsByRoom: {
                  ...itemsByRoom,
                  [roomId]: updated,
                },
              },
            });
          },
        }
      );
    } else {
      console.log('jjeeee')
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
  
      createInventoryItemMutation.mutate(newItemInstance, {
        onSuccess: (createdOrUpdatedItem) => {
          // Bilo da je kreiran novi ili povećan postojeći, osveži lokalni state
          const existingIndex = current.findIndex(
            (item) => item.groupingKey === createdOrUpdatedItem.groupingKey
          );
  
          const updated =
            existingIndex !== -1
              ? current.map((itm, i) =>
                  i === existingIndex ? createdOrUpdatedItem : itm
                )
              : [...current, createdOrUpdatedItem];
  
          updateOriginMutation.mutate({
            id: selectedOriginStopId,
            data: {
              itemsByRoom: {
                ...itemsByRoom,
                [roomId]: updated,
              },
            },
          });
        },
      });
    }
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
  
    updateOriginMutation.mutate({
      id: selectedOriginStopId,
      data: {
        displayedRooms: updated,
      },
    });
  };
  
  const handleSetRoomItemSelections = (fnOrObj) => {
    if (!selectedRoom) return;
  
    const roomId = selectedRoom.id;
    const oldItems = itemsByRoom[roomId] || [];
  
    const newItems =
      typeof fnOrObj === "function"
        ? fnOrObj({ [roomId]: oldItems })[roomId]
        : fnOrObj[roomId];
  
    const createdItems = [];
    const updatedItems = [];
  
    const updatedItemsByRoom = { ...itemsByRoom };
  
    newItems.forEach((item) => {
      const payload = {
        ...item,
        originId: selectedOriginStopId,
        roomId,
        groupingKey: item.groupingKey || generateGroupingKey(item),
      };
  
      if (!item.id) {
        createInventoryItemMutation.mutate(payload, {
          onSuccess: (created) => {
            createdItems.push(created);
            updatedItemsByRoom[roomId] = [...(updatedItemsByRoom[roomId] || []), created];
  
            if (createdItems.length + updatedItems.length === newItems.length) {
              updateOriginMutation.mutate({
                id: selectedOriginStopId,
                data: {
                  itemsByRoom: updatedItemsByRoom,
                },
              });
            }
          },
        });
      } else {
        updateInventoryItemMutation.mutate(
          { id: item.id, data: payload },
          {
            onSuccess: (updated) => {
              updatedItems.push(updated);
              const others = (updatedItemsByRoom[roomId] || []).filter(
                (i) => i.id !== updated.id
              );
              updatedItemsByRoom[roomId] = [...others, updated];
  
              if (createdItems.length + updatedItems.length === newItems.length) {
                updateOriginMutation.mutate({
                  id: selectedOriginStopId,
                  data: {
                    itemsByRoom: updatedItemsByRoom,
                  },
                });
              }
            },
          }
        );
      }
    });
  };
  
  

  const getItemCountForCurrentRoom = () => {
    if (!selectedRoom) return 0;
    const items = itemsByRoom[selectedRoom.id] || [];
    return items.length;
  };

  // ==================== POPUP: UPDATE / ADD ITEM ====================
  const handleUpdateItem = (updatedItemInstance, originalItemInstance) => {
    if (!selectedRoom) return;
    const roomId = selectedRoom.id;
    const currentItems = itemsByRoom[roomId] || [];
  
    const existingItem = currentItems.find(
      (item) => item.groupingKey === originalItemInstance.groupingKey
    );
  
    if (!existingItem) return;
  
    const updatedPayload = {
      ...updatedItemInstance,
      originId: selectedOriginStopId,
      roomId,
      groupingKey: updatedItemInstance.groupingKey,
      count: updatedItemInstance.count,
    };
  
    updateInventoryItemMutation.mutate(
      {
        id: existingItem.id,
        data: updatedPayload,
      },
      {
        onSuccess: (updatedItemFromServer) => {
          const updatedRoomItems = currentItems.map((itm) =>
            itm.id === existingItem.id ? updatedItemFromServer : itm
          );
  
          updateOriginMutation.mutate({
            id: selectedOriginStopId,
            data: {
              itemsByRoom: {
                ...itemsByRoom,
                [roomId]: updatedRoomItems,
              },
            },
          });
        },
      }
    );
  };
  
  
  const handleDeleteItem = (id) => {
    const roomId = selectedRoom?.id;
    if (!roomId) return;
  
    const currentItems = itemsByRoom[roomId] || [];
  
    deleteInventoryItemMutation.mutate(
      { id },
      {
        onSuccess: ({ item: updatedItem }) => {
          let updatedItems;
  
          if (updatedItem === null) {
            updatedItems = currentItems.filter((itm) => itm.id !== id);
          } else {
            updatedItems = currentItems.map((itm) =>
              itm.id === id ? updatedItem : itm
            );
          }
  
          updateOriginMutation.mutate({
            id: selectedOriginStopId,
            data: {
              itemsByRoom: {
                ...itemsByRoom,
                [roomId]: updatedItems,
              },
            },
          });
        },
      }
    );
  };
  const handleAddItem = (newItemInstance) => {
    if (!selectedRoom) return;
  
    const roomId = selectedRoom.id;
    const itemData = {
      ...newItemInstance,
      originId: selectedOriginStopId,
      roomId,
      groupingKey: newItemInstance.groupingKey || generateGroupingKey(newItemInstance),
    };
  
    createInventoryItemMutation.mutate(itemData, {
      onSuccess: (updatedOrCreatedItem) => {
        const currentItems = itemsByRoom[roomId] || [];
        const existingIndex = currentItems.findIndex(
          (item) => item.groupingKey === updatedOrCreatedItem.groupingKey
        );
  
        let updated;
        if (existingIndex !== -1) {
          updated = [...currentItems];
          updated[existingIndex] = updatedOrCreatedItem;
        } else {
          updated = [...currentItems, updatedOrCreatedItem];
        }
  
        updateOriginMutation.mutate({
          id: selectedOriginStopId,
          data:{
            itemsByRoom: {
              ...itemsByRoom,
              [roomId]: updated,
            },
          }
        });
      },

    });
  };

  const handleMergeItems = (fromId, intoId, mergedItem) => {
    if (!selectedRoom || !itemsByRoom[selectedRoom.id]) return;
  
    const roomId = selectedRoom.id;
    const currentItems = itemsByRoom[roomId];
  
    const updatedRoomItems = currentItems
      .filter((itm) => itm.id !== fromId && itm.id !== intoId)
      .concat(mergedItem);
  
    updateOriginMutation.mutate({
      id: selectedOriginStopId,
      data: {
        itemsByRoom: {
          ...itemsByRoom,
          [roomId]: updatedRoomItems,
        },
      },
    });
  };
  
  

  // ==================== AUTO-ADD BOXES (if isToggled) ====================
  useEffect(() => {
    if (!isToggled || !inventoryItems) return;
  
    let totalLbs = 0;
    const excludedRoomId = 13;
    const excludedIds = ["529", "530", "531", "532", "533", "534", "535", "536", "537"];
  
    inventoryItems.forEach((itm) => {
      if (itm.roomId === excludedRoomId) return;
      if (!excludedIds.includes(itm.furnitureItemId?.toString())) {
        const lbsVal = parseFloat(itm.lbs || itm.furnitureItem?.lbs);
        if (!isNaN(lbsVal)) {
          totalLbs += lbsVal;
        }
      }
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
  
    // Step 1: Delete old autoAdded from DB
    const currentBoxes = itemsByRoom[13] || [];
    //const nonAuto = currentBoxes.filter((itm) => !itm.autoAdded);
    const autoAdded = currentBoxes.filter((itm) => itm.autoAdded);
  
    // Step 2: Create new autoAdded
    const usedGroupingKeys = [];
  
    boxesToAdd.forEach((bx) => {
      const itemData = allItems.find((it) => it.id.toString() === bx.itemId.toString());
      if (!itemData  || bx.count === 0) return;
      const groupingKey = generateGroupingKey({
        furnitureItemId: itemData.id,
        roomId: 13,
        autoAdded: true,
      });
      usedGroupingKeys.push(groupingKey);
  
      const packing =
        itemData.packingType && itemData.packingQuantity
          ? { [itemData.packingType]: itemData.packingQuantity }
          : {};
          const existing = autoAdded.find((itm) => itm.groupingKey === groupingKey);
  
        const payload = {
          originId: selectedOriginStopId,
          furnitureItemId: itemData.id,
          roomId: 13,
          name: itemData.name,
          imageName: itemData.imageName,
          letters: [...itemData.letters],
          search: itemData.search,
          tags: [...itemData.tags],
          notes: "",
          cuft: itemData.cuft || "",
          lbs: itemData.lbs || "",
          packingNeeds: packing,
          uploadedImages: [],
          cameraImages: [],
          autoAdded: true,
          groupingKey,
          count: bx.count,
        }
        if (existing) {
          if (existing.count !== bx.count) {
            updateInventoryItemMutation.mutate({ id: existing.id, data: payload });
          }
        } else {
          createInventoryItemMutation.mutate(payload);
        }
      }
    );
    autoAdded.forEach((itm) => {
      const stillNeeded = usedGroupingKeys.includes(itm.groupingKey);
      if (!stillNeeded) {
        deleteInventoryItemMutation.mutate({ id: itm.id });
      }
    });
  }, [isToggled, inventoryItems, allItems, selectedOriginStopId]);
  
  

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
  }, [itemsByRoom, selectedRoom]);
  
  


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
        setRoomItemSelections={handleSetRoomItemSelections}
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
        onMergeItems={handleMergeItems}
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
          onMergeItems={handleMergeItems}
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
        itemsByRoom={itemsByRoom}
        setRoomItemSelections={handleSetRoomItemSelections}
        selectedRoom={selectedRoom}
        displayedRooms={displayedRooms}
        onCloseInventory={handleClose}
        lead={lead}
      />
    </div>
  );
}

export default Inventory;
