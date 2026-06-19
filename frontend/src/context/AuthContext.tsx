"use client";

import {
  createContext,
  useEffect,
  useState,
  ReactNode,
} from "react";

interface AuthContextType {
  isAuthenticated: boolean;
  userID: string | null;
  login: (id: string) => void;
  logout: () => void;
}

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthContext =
  createContext<AuthContextType | null>(null);

export const AuthProvider = ({
  children,
}: AuthProviderProps) => {
  const [isAuthenticated, setIsAuthenticated] =
    useState<boolean>(false);

  const [userID, setUserID] =
    useState<string | null>(null);

  useEffect(() => {
    const auth =
      localStorage.getItem("isAuthenticated") ===
      "true";

    const user =
      localStorage.getItem("userID");

    setIsAuthenticated(auth);
    setUserID(user);
  }, []);

  const login = (id: string) => {
    setIsAuthenticated(true);
    setUserID(id);

    localStorage.setItem(
      "isAuthenticated",
      "true"
    );

    localStorage.setItem(
      "userID",
      id
    );
  };

  const logout = () => {
    setIsAuthenticated(false);
    setUserID(null);

    localStorage.removeItem(
      "isAuthenticated"
    );

    localStorage.removeItem(
      "userID"
    );

    localStorage.removeItem(
      "username"
    );

    localStorage.removeItem(
      "token"
    );
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        userID,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};