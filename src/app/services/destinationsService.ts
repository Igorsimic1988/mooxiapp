import { DestinationsInput } from "./types";
export const createDestination = async ({destinationsData, leadId, token}: {destinationsData: DestinationsInput; leadId: string; token: string;}) => {

    const res = await fetch("/api/destinations/create", {
        method: "POST",
        headers: { 
            "Content-Type": "application/json",
            'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
            body: destinationsData,
            leadId: leadId,
        }),
    });

    const data = await res.json();
    if (!res.ok) {
        throw new Error(data.error || "Failed to create destination");
    }
    return data;
};

export const updateDestination= async ({id, data, token}:
    {id: string,
    data: Partial<DestinationsInput>,
    token: string}
  ) => {
    const res = await fetch('/api/destinations/update', {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ id, ...data }),
    });
  
    const response = await res.json();
  
    if (!res.ok) {
      throw new Error(response.error || 'Failed to update destination');
    }
  
    return response.destinations;
  };

  export const getAllDestinations = async ({leadId}: {leadId: string;}) => {
    const res = await fetch(`/api/destinations/readAllByLead?leadId=${leadId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
  
    const data = await res.json();
  
    if (!res.ok) {
      throw new Error(data.error || 'Failed to fetch all destinations');
    }
  
    return data.destinations;
};

export const getDestinationById = async ({id}: {id: string;}) => {
    const res = await fetch(`/api/destinations/read?id=${id}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
  
    const data = await res.json();
  
    if (!res.ok) {
      throw new Error(data.error || 'Failed to fetch destination');
    }
  
    return data.destinations;
};


