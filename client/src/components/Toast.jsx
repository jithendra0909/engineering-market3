import React from 'react';
import { useAuth } from '../context/AuthContext';
import { AlertCircle, CheckCircle, Info } from 'lucide-react';
import './Toast.css';

export const Toast = () => {
  const { toast } = useAuth();

  if (!toast) return null;

  const typeClassMap = {
    success: 'toast-success',
    error: 'toast-error',
    info: 'toast-info',
  };

  const IconComponentMap = {
    success: CheckCircle,
    error: AlertCircle,
    info: Info,
  };

  const typeKey = toast.type || 'info';
  const typeClass = typeClassMap[typeKey] || typeClassMap.info;
  const Icon = IconComponentMap[typeKey] || IconComponentMap.info;

  return (
    <div className="toast-wrapper animate-fadeInUp">
      <div className={`toast-container ${typeClass}`}>
        <Icon className="toast-icon" />
        <span className="toast-message">{toast.message}</span>
      </div>
    </div>
  );
};

export default Toast;
