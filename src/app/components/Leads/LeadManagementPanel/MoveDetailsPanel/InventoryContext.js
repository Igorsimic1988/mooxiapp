'use client'
import React, { createContext, useContext, useState } from "react";

const InventoryContext = createContext();

export const InventoryProvider = ({ children }) => {
  const [inventoryByStop, setInventoryByStop] = useState({});

  return (
    <InventoryContext.Provider
      value={{
        inventoryByStop,
        setInventoryByStop,
      }}
    >
      {children}
    </InventoryContext.Provider>
  );
};

export const useInventoryContext = () => useContext(InventoryContext);
