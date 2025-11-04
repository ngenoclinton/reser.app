'use client';
import { account } from "../config/appwriteClient";
import { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true); // ✅ rename
  const isAuthenticated = !!user;

  useEffect(() => {
    const cachedUser = localStorage.getItem('user');
    if (cachedUser) setUser(JSON.parse(cachedUser));

    const fetchUser = async () => {
      try {
        const userData = await account.get();
        setUser(userData);
        localStorage.setItem('user', JSON.stringify(userData));
      } catch {
        setUser(null);
        localStorage.removeItem('user');
      } finally {
        setAuthLoading(false); // ✅ rename
      }
    };

    fetchUser();
  }, []);

  const login = (userData) => {
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData)); // ✅ keep in sync
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user'); // ✅ clear cache on logout
  };

  return (
    <AuthContext.Provider
      value={{ user, login, logout, authLoading, isAuthenticated }} // ✅ export authLoading
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
};
