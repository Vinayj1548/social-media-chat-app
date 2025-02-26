import { createContext, useState, useEffect } from "react";

// Create Auth Context
export const AuthContext = createContext();

// AuthProvider component to wrap around App
export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(
    localStorage.getItem("isAuthenticated") === "true"
  );
  const [userID, setUserID] = useState(localStorage.getItem("user") || null);

  // Persist authentication state in localStorage
  useEffect(() => {
    localStorage.setItem("isAuthenticated", isAuthenticated);
  }, [isAuthenticated]);

  // Login function
  const login = (userId) => {
    localStorage.setItem("isAuthenticated", "true");
    localStorage.setItem("user", userId);
    setIsAuthenticated(true);
    setUserID(userId);
  };

  // Logout function
  const logout = () => {
    localStorage.removeItem("isAuthenticated");
    localStorage.removeItem("user");
    setIsAuthenticated(false);
    setUserID(null);
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, userID, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
