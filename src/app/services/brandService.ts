export const createBrand = async ({nameOfBrand, token}: {nameOfBrand: string; token: string;}) => {
    const res = await fetch("/api/brand/create", {
        method: "POST",
        headers: { 
            "Content-Type": "application/json",
            'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({nameOfBrand}),
    });

    const data = await res.json();
    if (!res.ok) {
        throw new Error(data.error || "Failed to create brand");
    }
    return data;
};

export const deleteBrand = async ({id, token}: {id: string; token: string;}) => {
    const res = await fetch("/api/brand/delete", {
        method: "DELETE",
        headers: { 
            "Content-Type": "application/json",
            'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({id}),
    });

    const data = await res.json();
    if (!res.ok) {
        throw new Error(data.error || "Failed to delete brand");
    }
    return data;
};

export const getBrand = async ({id}: {id: string;}) => {
    const res = await fetch(`/api/brand/read?id=${id}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
  
    const data = await res.json();
  
    if (!res.ok) {
      throw new Error(data.error || 'Failed to fetch brand');
    }
  
    return data.brand;
};

export const updateBrand = async ({id, name, token}: {id: string; name: string; token:string;}) => {
    const res = await fetch("/api/brand/update", {
        method: "PATCH",
        headers: { 
            "Content-Type": "application/json",
            'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({id, name}),
    });

    const data = await res.json();
    if (!res.ok) {
        throw new Error(data.error || "Failed to update brand");
    }
    return data;
};
  