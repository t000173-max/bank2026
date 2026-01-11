import { deleteToken, getToken, setToken } from "@/api/storage";
import { createContext, useContext, useEffect, useMemo, useState } from "react";

type AuthContextType = {
  token: string | null;
  isAuthed: boolean;
  saveToken: (t: string) => Promise<void>;
  logout: () => Promise<void>;
  loading: boolean;
};

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setTokenState] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const t = await getToken();
      setTokenState(t);
      setLoading(false);
    })();
  }, []);

  const saveToken = async (t: string) => {
    await setToken(t);
    setTokenState(t);
  };

  const logout = async () => {
    await deleteToken();
    setTokenState(null);
  };

  const value = useMemo(
    () => ({ token, isAuthed: !!token, saveToken, logout, loading }),
    [token, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};
