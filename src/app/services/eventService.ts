import { Events } from "@prisma/client";
export const createEvent = async ({
    type,
    data,
    token,
  }: {
    type: Events;
    data: Record<string, unknown>
    token: string;
  }) => {
    const res = await fetch('/api/event/createEvent', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({
        type,
        data,
      }),
    });
  
    const responseData = await res.json();
  
    if (!res.ok) {
      throw new Error(responseData.error || 'Failed to create event record');
    }
  
    return data; 
  };