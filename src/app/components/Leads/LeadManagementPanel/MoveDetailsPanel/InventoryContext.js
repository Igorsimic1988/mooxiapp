'use client'
import React, { createContext, useContext, useState } from "react";

const InventoryContext = createContext();

export const InventoryProvider = ({ children }) => {
  const [itemsByRoom, setItemsByRoom] = useState({});
  const [displayedRooms, setDisplayedRooms] = useState([]);
  const [inventoryItems, setInventoryItems] = useState([]);

  return (
    <InventoryContext.Provider
      value={{
        itemsByRoom,
        setItemsByRoom,
        displayedRooms,
        setDisplayedRooms,
        inventoryItems,
        setInventoryItems,
      }}
    >
      {children}
    </InventoryContext.Provider>
  );
};

export const useInventoryContext = () => useContext(InventoryContext);
