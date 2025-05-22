import { FurnitureInput } from "./types";

export const getAllFurnitureItems = async ({brandId}: {brandId: string;}) => {
    const res = await fetch(`/api/furniture/readAll?brandId=${brandId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
  
    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.error || 'Failed to fetch all furniture items');
    }
  
    return data.furnitureItems;
};

export const getFurnitureItemById = async ({id}: {id: string;}) => {
    const res = await fetch(`/api/furniture/readById?id=${id}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
  
    const data = await res.json();
  
    if (!res.ok) {
      throw new Error(data.error || 'Failed to fetch furniture item');
    }
  
    return data.furnitureItem;
};

export const updateFurnitureItem = async ({id, data, token}:
    {id: string,
    data: { lbs?: number; cuft?: number },
    token: string}
  ) => {
    const res = await fetch('/api/furniture/update', {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ id, ...data }),
    });
  
    const response = await res.json();
  
    if (!res.ok) {
      throw new Error(response.error || 'Failed to update item');
    }
  
    return response.item;
  };

  export const createFurnitureItem = async ({ data, token }: { data: FurnitureInput; token: string; }) => {
    const res = await fetch('/api/furniture/create', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });
  
    const response = await res.json();
  
    if (!res.ok) {
      throw new Error(response.error || 'Failed to create furniture item');
    }
  
    return response; 
  };
  