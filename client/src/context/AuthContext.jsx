import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../api/axios';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('em_token'));
  const [loading, setLoading] = useState(true);
  const [colleges, setColleges] = useState([]);
  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'info') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const loadUser = async () => {
    try {
      const { data } = await api.get('/auth/me');
      setUser(data);
    } catch (err) {
      console.error('Load user error:', err.response?.data?.message || err.message);
      // Clear invalid token
      localStorage.removeItem('em_token');
      setToken(null);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const fetchColleges = async () => {
    try {
      const { data } = await api.get('/colleges');
      setColleges(data);
    } catch (err) {
      console.error('Error fetching colleges:', err);
    }
  };

  useEffect(() => {
    if (token) {
      localStorage.setItem('em_token', token);
      loadUser();
    } else {
      localStorage.removeItem('em_token');
      setUser(null);
      setLoading(false);
    }
    fetchColleges();
  }, [token]);

  const login = async (email, password) => {
    setLoading(true);
    try {
      const { data } = await api.post('/auth/login', { email, password });
      setToken(data.token);
      setUser(data);
      showToast('Logged in successfully!', 'success');
      return { success: true };
    } catch (err) {
      const msg = err.response?.data?.message || 'Login failed';
      showToast(msg, 'error');
      return { success: false, message: msg };
    } finally {
      setLoading(false);
    }
  };

  const signup = async (formData) => {
    setLoading(true);
    try {
      const { data } = await api.post('/auth/signup', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      setToken(data.token);
      setUser(data);
      showToast('Registration successful! Account pending verification.', 'success');
      return { success: true };
    } catch (err) {
      const msg = err.response?.data?.message || 'Registration failed';
      showToast(msg, 'error');
      return { success: false, message: msg };
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('em_token');
    showToast('Logged out successfully!', 'info');
  };

  const updateProfile = (updatedUser) => {
    setUser(updatedUser);
  };

  const isLoggedIn = !!user;
  const isAdmin = user?.role === 'admin';
  const isVerified = user?.verificationStatus === 'approved';

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        colleges,
        toast,
        isLoggedIn,
        isAdmin,
        isVerified,
        login,
        signup,
        logout,
        showToast,
        updateProfile,
        loadUser
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
