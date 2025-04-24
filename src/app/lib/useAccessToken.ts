import { useEffect, useState } from "react";

export function useAccessToken() {
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedToken = localStorage.getItem("access-token");
      setToken(storedToken);
    }
  }, []);

  return token;
}
