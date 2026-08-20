import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './VerifiedOnly.css';

export const VerifiedOnly = ({ children }) => {
  const { user, isVerified, loading } = useAuth();

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="spinner-ring animate-spin" />
      </div>
    );
  }

  // If not verified, redirect to profile or show unverified message
  if (!isVerified) {
    return <Navigate to="/profile" replace />;
  }

  return children;
};

export default VerifiedOnly;
