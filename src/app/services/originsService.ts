import { OriginInput } from "./types";
export const createOrigin = async ({originsData, leadId, token}: {originsData: OriginInput; leadId: string; token: string;}) => {

    const res = await fetch("/api/origins/create", {
        method: "POST",
        headers: { 
            "Content-Type": "application/json",
            'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
            body: originsData,
            leadId: leadId,
        }),
    });

    const data = await res.json();
    if (!res.ok) {
        throw new Error(data.error || "Failed to create origin");
    }
    return data;
};

export const updateOrigin= async ({id, data, token}:
    {id: string,
    data: Partial<OriginInput>,
    token: string}
  ) => {
    const res = await fetch('/api/origins/update', {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ id, ...data }),
    });
  
    const response = await res.json();
  
    if (!res.ok) {
      throw new Error(response.error || 'Failed to update origin');
    }
  
    return response.origins;
  };

  export const getAllOrigins = async ({leadId}: {leadId: string;}) => {
    const res = await fetch(`/api/origins/readAllByLead?leadId=${leadId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
  
    const data = await res.json();
  
    if (!res.ok) {
      throw new Error(data.error || 'Failed to fetch all origins');
    }
  
    return data.origins;
};

export const getOiriginById = async ({id}: {id: string;}) => {
    const res = await fetch(`/api/origins/read?id=${id}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
  
    const data = await res.json();
  
    if (!res.ok) {
      throw new Error(data.error || 'Failed to fetch origin');
    }
  
    return data.origins;
};
