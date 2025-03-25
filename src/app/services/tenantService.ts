export const getTenant = async ({id}: {id: string;}) => {
    const res = await fetch(`/api/tenant/read?id=${id}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
  
    const data = await res.json();
  
    if (!res.ok) {
      throw new Error(data.error || 'Failed to fetch tenant');
    }
  
    return data.tenant;
};

export const updateTenant = async ({id, name, token}: {id: string; name: string; token:string;}) => {
    const res = await fetch("/api/tenant/update", {
        method: "PATCH",
        headers: { 
            "Content-Type": "application/json",
            'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({id, name}),
    });

    const data = await res.json();
    if (!res.ok) {
        throw new Error(data.error || "Failed to update tenant");
    }
    return data.tenant;
};