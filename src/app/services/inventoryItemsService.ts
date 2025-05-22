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
    };};


  export const createInventoryItem = async ({ data, token }: { data: InventoryItemInput; token: string; }) => {
    const res = await fetch('/api/inventoryItem/create', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });
  
    const response = await res.json();
  
    if (!res.ok) {
      throw new Error(response.error || 'Failed to create inventory item');
    }
  
    return response; 
  };

  export const deleteInventoryItem = async ({id}: {id: string;}) => {
    const res = await fetch("/api/inventoryItem/delete", {
        method: "DELETE",
        headers: { 
            "Content-Type": "application/json",
        },
        body: JSON.stringify({id}),
    });
  
    const data = await res.json();
    if (!res.ok) {
        throw new Error(data.error || "Failed to delete inventory item");
    }
    return data;
  };

  export const updateInventoryItem= async ({id, data}:
      {id: string,
      data: Partial<InventoryItemInput>}
    ) => {
      const res = await fetch('/api/inventoryItem/update', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id, ...data }),
      });
    
      const response = await res.json();
    
      if (!res.ok) {
        throw new Error(response.error || 'Failed to update inventory item');
      }
    
      return response.inventoryItem;
    };

    export const mergeInventoryItem = async ({ fromId, intoId }:
      {fromId: string,
      intoId: string}
    ) => {
      const res = await fetch('/api/inventoryItem/merge', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ fromId, intoId }),
      });
    
      const response = await res.json();
    
      if (!res.ok) {
        throw new Error(response.error || 'Failed to merge inventory item');
      }
    
      return response;
    };