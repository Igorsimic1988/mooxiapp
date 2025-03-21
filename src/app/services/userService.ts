export const deleteUser = async ({id}: {id: string;}) => {
    const res = await fetch("/api/brand/delete", {
        method: "DELETE",
        headers: { 
            "Content-Type": "application/json",
        },
        body: JSON.stringify({id}),
    });

    const data = await res.json();
    if (!res.ok) {
        throw new Error(data.error || "Failed to delete user");
    }
    return data;
};

export const getUser = async ({id}: {id: string;}) => {
    const res = await fetch(`/api/brand/read?id=${id}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
  
    const data = await res.json();
  
    if (!res.ok) {
      throw new Error(data.error || 'Failed to fetch user');
    }
  
    return data;
};

export const updateUser = async ({id, name, lastName, password}:
    {id: string, name?:string; lastName?:string; password?:string,}
  ) => {
    const res = await fetch('/api/user/update', {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ id, name, lastName, password}),
    });
  
    const data = await res.json();
  
    if (!res.ok) {
      throw new Error(data.error || 'Failed to update user');
    }
  
    return data;
  };