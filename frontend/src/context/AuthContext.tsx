"use client";

import {
  createContext,
  useEffect,
  useSyncExternalStore,
  ReactNode,
} from "react";
import { socket } from "@/lib/socket/socket";

const AUTH_CHANGE_EVENT = "auth-state-change";

const subscribeToAuth = (onStoreChange: () => void) => {
  window.addEventListener("storage", onStoreChange);
  window.addEventListener(AUTH_CHANGE_EVENT, onStoreChange);

  return () => {
    window.removeEventListener("storage", onStoreChange);
    window.removeEventListener(AUTH_CHANGE_EVENT, onStoreChange);
  };
};

const getIsAuthenticated = () =>
  localStorage.getItem("isAuthenticated") === "true";

const getUserID = () => localStorage.getItem("userID");

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
  const isAuthenticated = useSyncExternalStore(
    subscribeToAuth,
    getIsAuthenticated,
    () => false,
  );
  const userID = useSyncExternalStore(
    subscribeToAuth,
    getUserID,
    () => null,
  );

  useEffect(() => {
    if (!isAuthenticated || !userID) {
      socket.disconnect();
      return;
    }

    const token = localStorage.getItem("token");
    if (!token) {
      socket.disconnect();
      return;
    }

    socket.auth = { token };
    socket.connect();

    return () => {
      socket.disconnect();
    };
  }, [isAuthenticated, userID]);

  const login = (id: string) => {
    localStorage.setItem(
      "isAuthenticated",
      "true"
    );

    localStorage.setItem(
      "userID",
      id
    );
    window.dispatchEvent(new Event(AUTH_CHANGE_EVENT));
  };

  const logout = () => {
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
    window.dispatchEvent(new Event(AUTH_CHANGE_EVENT));
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