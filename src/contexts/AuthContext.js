import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { ENDPOINTS } from '../utils/api';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [admin, setAdmin] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('ghost_feedback_token'));
  const [loading, setLoading] = useState(true);

  // Configure axios defaults
  useEffect(() => {
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      verifyToken();
    } else {
      setLoading(false);
    }
  }, [token]);

  const verifyToken = async () => {
    try {
      const response = await axios.post(ENDPOINTS.VERIFY, { token });
      if (response.data.valid) {
        setAdmin(response.data.admin);
        setToken(token);
      } else {
        logout();
      }
    } catch (error) {
      console.error('Token verification failed:', error);
      logout();
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    try {
      setLoading(true);
      const response = await axios.post(ENDPOINTS.LOGIN, { email, password });
      
      const { token: newToken, admin: adminData } = response.data;
      
      // Store token in localStorage
      localStorage.setItem('ghost_feedback_token', newToken);
      
      // Set axios default header
      axios.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
      
      // Update state
      setToken(newToken);
      setAdmin(adminData);
      
      toast.success('Login successful!');
      return { success: true };
      
    } catch (error) {
      const errorMessage = error.response?.data?.error || 'Login failed. Please try again.';
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    // Remove token from localStorage
    localStorage.removeItem('ghost_feedback_token');
    
    // Remove axios default header
    delete axios.defaults.headers.common['Authorization'];
    
    // Clear state
    setToken(null);
    setAdmin(null);
    
    toast.success('Logged out successfully');
  };

  const refreshToken = async () => {
    try {
      const response = await axios.post(ENDPOINTS.REFRESH, { token });
      const { token: newToken, admin: adminData } = response.data;
      
      // Update stored token
      localStorage.setItem('ghost_feedback_token', newToken);
      axios.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
      
      setToken(newToken);
      setAdmin(adminData);
      
      return { success: true };
    } catch (error) {
      console.error('Token refresh failed:', error);
      logout();
      return { success: false };
    }
  };

  const changePassword = async (currentPassword, newPassword) => {
    try {
      const response = await axios.post(ENDPOINTS.CHANGE_PASSWORD, {
        token,
        currentPassword,
        newPassword
      });
      
      toast.success('Password changed successfully!');
      return { success: true };
      
    } catch (error) {
      const errorMessage = error.response?.data?.error || 'Password change failed.';
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  // Auto-refresh token before expiration
  useEffect(() => {
    if (!token) return;

    const tokenRefreshInterval = setInterval(() => {
      // Refresh token every 23 hours (assuming 24h expiry)
      refreshToken();
    }, 23 * 60 * 60 * 1000);

    return () => clearInterval(tokenRefreshInterval);
  }, [token]);

  const value = {
    admin,
    token,
    loading,
    login,
    logout,
    refreshToken,
    changePassword,
    isAuthenticated: !!admin && !!token
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
