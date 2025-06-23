'use client'
import React, { createContext, useState, useContext } from 'react';

const UiStateContext = createContext();

export const UiStateProvider = ({ children }) => {
  const [isOriginCollapsed, setIsOriginCollapsed] = useState(false);
  const [isDestinationCollapsed, setIsDestinationCollapsed] = useState(true);
  const [isLogisticsCollapsed, setIsLogisticsCollapsed] = useState(true);
  const [isEstimateCollapsed, setIsEstimateCollapsed] = useState(true);
  const [activeOption, setActiveOption] = useState('estimate'); 
  const [moveInActiveOption, setMoveInActiveOption] = useState('estimate'); // New state for Move In tab
  const [selectedOriginStopId, setSelectedOriginStopId] = useState(null); 
  const [selectedDestinationStopId, setSelectedDestinationStopId] = useState(null); 

  return (
    <UiStateContext.Provider
      value={{
        isOriginCollapsed,
        setIsOriginCollapsed,
        isDestinationCollapsed,
        setIsDestinationCollapsed,
        isLogisticsCollapsed,
        setIsLogisticsCollapsed,
        isEstimateCollapsed,
        setIsEstimateCollapsed,
        activeOption,
        setActiveOption,
        moveInActiveOption,              // Add this
        setMoveInActiveOption,           // Add this
        selectedOriginStopId,            
        setSelectedOriginStopId,
        selectedDestinationStopId,
        setSelectedDestinationStopId,
      }}
    >
      {children}
    </UiStateContext.Provider>
  );
};

export const useUiState = () => useContext(UiStateContext);