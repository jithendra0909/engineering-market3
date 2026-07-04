import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export const VerifiedOnly = ({ children }) => {
  const { user, isVerified, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50">
        <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
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
