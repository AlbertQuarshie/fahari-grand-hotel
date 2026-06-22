import { createContext, useState, useEffect, useContext } from "react";
import { loginUser, registerGuest, getMe } from "../api/auth.api";
import toast from "react-hot-toast";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      try {
        const access = localStorage.getItem("access");
        const storedUser = localStorage.getItem("user");

        if (access && storedUser) {
          // restore from localStorage first (instant)
          setUser(JSON.parse(storedUser));
        }
      } catch {
        localStorage.removeItem("access");
        localStorage.removeItem("refresh");
        localStorage.removeItem("user");
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  const login = async (username, password) => {
    // Step 1: get tokens
    const tokenData = await loginUser(username, password);
    localStorage.setItem("access", tokenData.access);
    localStorage.setItem("refresh", tokenData.refresh);

    // Step 2: fetch full user profile using the new token
    const userData = await getMe();
    localStorage.setItem("user", JSON.stringify(userData));

    setUser(userData);
    toast.success(`Welcome back, ${userData.first_name || userData.username}!`);
    return userData;
  };

  const register = async (formData) => {
    const data = await registerGuest(formData);
    toast.success("Account created! Please log in.");
    return data;
  };

  const logout = () => {
    localStorage.removeItem("access");
    localStorage.removeItem("refresh");
    localStorage.removeItem("user");
    setUser(null);
    toast.success("Logged out");
  };

  const value = {
    user,
    role: user?.role || null,
    isAuthenticated: !!user,
    loading,
    login,
    register,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};