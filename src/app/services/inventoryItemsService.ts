import { InventoryItemInput } from "./types";

export const getInventoryByOriginId = async ({originId}: {originId: string;}) => {
    const res = await fetch(`/api/inventoryItem/getInventoryByOriginId?originId=${originId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
  
    const data = await res.json();
  
    if (!res.ok) {
      throw new Error(data.error || 'Failed to fetch inventoryItem');
    }
  
    return {
      inventoryItems: data.inventoryItems,
      itemsByRoom: data.itemsByRoom,
      displayedRooms: data.displayedRooms,
      autoBoxEnabled: data.autoBoxEnabled,
    };
  };


    export const syncInventory = async ({ stopId, stopType, displayedRooms, itemsByRoom, inventoryItems, autoBoxEnabled }: { stopId: string;  stopType: 'origin' | 'destination';displayedRooms: number[]; itemsByRoom: Record<number, InventoryItemInput[]>; inventoryItems: InventoryItemInput[];autoBoxEnabled: boolean; }) => {
      const res = await fetch('/api/inventoryItem/full-inventory', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({stopId, stopType, displayedRooms, itemsByRoom, inventoryItems, autoBoxEnabled}),
      });
    
      const response = await res.json();
    
      if (!res.ok) {
        throw new Error(response.error || 'Failed to sync inventory data');
      }
    
      return response; 
    };

    export const getInventoryByDestinationId = async ({destinationId}: {destinationId: string;}) => {
      const res = await fetch(`/api/inventoryItem/getInventoryByDestinationId?destinationId=${destinationId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
    
      const data = await res.json();
    
      if (!res.ok) {
        throw new Error(data.error || 'Failed to fetch inventoryItem');
      }
    
      return {
        inventoryItems: data.inventoryItems,
        itemsByRoom: data.itemsByRoom,
        displayedRooms: data.displayedRooms,
        autoBoxEnabled: data.autoBoxEnabled,
      };
    };

    export const updateInventoryTags = async ({ stopId, stopType, updatedInventoryItems }: { stopId: string;  stopType: 'origin' | 'destination'; updatedInventoryItems: Partial<InventoryItemInput>[]; }) => {
      const res = await fetch('/api/inventoryItem/updateTags', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({stopId, stopType,updatedInventoryItems}),
      });
    
      const response = await res.json();
    
      if (!res.ok) {
        throw new Error(response.error || 'Failed to sync inventory data');
      }
    
      return response; 
    };