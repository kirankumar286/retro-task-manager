import React, { createContext, useState, useEffect, useContext, useCallback } from 'react';
import api from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [profile, setProfile] = useState(null);

  const fetchProfile = useCallback(async () => {
    try {
      const response = await api.get('/api/users/profile/');
      setProfile(response.data);
    } catch (err) {
      console.error('Failed to load profile', err);
    }
  }, []);

  useEffect(() => {
    // Check if user session exists on initial load
    const storedUser = localStorage.getItem('user');
    const storedToken = localStorage.getItem('access_token');
    if (storedUser && storedToken) {
      try {
        setUser(JSON.parse(storedUser));
        fetchProfile();
      } catch (e) {
        localStorage.clear();
      }
    }
    setLoading(false);
  }, [fetchProfile]);

  const login = async (username, password) => {
    setError(null);
    try {
      const response = await api.post('/api/auth/login/', { username, password });
      const { access, refresh, user: userData } = response.data;
      localStorage.setItem('access_token', access);
      localStorage.setItem('refresh_token', refresh);
      localStorage.setItem('user', JSON.stringify(userData));
      setUser(userData);
      fetchProfile();
      return { success: true };
    } catch (err) {
      const msg = err.response?.data?.detail || err.response?.data?.non_field_errors?.[0] || 'Login failed. Check your credentials.';
      setError(msg);
      return { success: false, error: msg };
    }
  };

  const register = async (username, email, password) => {
    setError(null);
    try {
      const response = await api.post('/api/auth/register/', { username, email, password });
      const { access, refresh, user: userData } = response.data;
      localStorage.setItem('access_token', access);
      localStorage.setItem('refresh_token', refresh);
      localStorage.setItem('user', JSON.stringify(userData));
      setUser(userData);
      fetchProfile();
      return { success: true };
    } catch (err) {
      let msg = 'Registration failed.';
      if (err.response?.data) {
        const firstKey = Object.keys(err.response.data)[0];
        const val = err.response.data[firstKey];
        msg = Array.isArray(val) ? `${firstKey.toUpperCase()}: ${val[0]}` : String(val);
      }
      setError(msg);
      return { success: false, error: msg };
    }
  };

  const logout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user');
    setUser(null);
    setProfile(null);
  };

  return (
    <AuthContext.Provider value={{ user, profile, fetchProfile, loading, error, setError, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
