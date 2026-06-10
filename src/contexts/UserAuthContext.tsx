import { createContext, useContext, useState, type ReactNode } from "react";

export interface UserProfile {
  id: number;
  email: string;
  name: string;
  phone?: string | null;
}

interface UserAuthContextType {
  user: UserProfile | null;
  token: string | null;
  login: (token: string, user: UserProfile) => void;
  logout: () => void;
  isLoggedIn: boolean;
}

const UserAuthContext = createContext<UserAuthContextType | null>(null);

const USER_TOKEN_KEY = "bhoomi_user_token";
const USER_DATA_KEY = "bhoomi_user_data";

export function UserAuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem(USER_TOKEN_KEY));
  const [user, setUser] = useState<UserProfile | null>(() => {
    try {
      const stored = localStorage.getItem(USER_DATA_KEY);
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  const login = (t: string, u: UserProfile) => {
    localStorage.setItem(USER_TOKEN_KEY, t);
    localStorage.setItem(USER_DATA_KEY, JSON.stringify(u));
    setToken(t);
    setUser(u);
  };

  const logout = () => {
    localStorage.removeItem(USER_TOKEN_KEY);
    localStorage.removeItem(USER_DATA_KEY);
    setToken(null);
    setUser(null);
  };

  return (
    <UserAuthContext.Provider value={{ token, user, login, logout, isLoggedIn: !!token && !!user }}>
      {children}
    </UserAuthContext.Provider>
  );
}

export function useUserAuth() {
  const ctx = useContext(UserAuthContext);
  if (!ctx) throw new Error("useUserAuth must be used within UserAuthProvider");
  return ctx;
}
