import { LeadInput } from "./types";


 
export const createLead = async ({leadsData, token}: {leadsData: LeadInput; token: string;}) => {
  console.log("Sending new lead to API:", leadsData);
  

    const res = await fetch("/api/leads/create", {
        method: "POST",
        headers: { 
            "Content-Type": "application/json",
            'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(leadsData),
    });

    const data = await res.json();
    if (!res.ok) {
        throw new Error(data.error || "Failed to create lead");
    }
    return data;
};

export const updateLead= async ({id, data, token}:
    {id: string,
    data: Partial<LeadInput>,
    token: string}
  ) => {

    const res = await fetch('/api/leads/update', {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ id, ...data }),
    });
  
    const response = await res.json();
  
    if (!res.ok) {
      throw new Error(response.error || 'Failed to update lead');
    }
  
    return response.lead;
  };

  export const getAllLeads = async (token: string) => {
    const res = await fetch(`/api/leads/read`, {
      method: 'GET',
      headers:{'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    });
  
    const data = await res.json();
  
    if (!res.ok) {
      throw new Error(data.error || 'Failed to fetch all leads');
    }
  
    return data.leads;
};

export const createStatusHistory = async ({
  leadId,
  leadStatus,
  leadActivity,
  nextAction,
  token,
}: {
  leadId: string;
  leadStatus?: string;
  leadActivity?: string;
  nextAction?: string;
  token: string;
}) => {
  const res = await fetch('/api/leads/statusHistoryCreate', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({
      leadId,
      leadStatus,
      leadActivity,
      nextAction,
    }),
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.error || 'Failed to create status history record');
  }

  return data; 
};
