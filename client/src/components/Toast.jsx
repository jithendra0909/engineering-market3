import React from 'react';
import { useAuth } from '../context/AuthContext';
import { AlertCircle, CheckCircle, Info } from 'lucide-react';

export const Toast = () => {
  const { toast } = useAuth();

  if (!toast) return null;

  const styles = {
    success: { bg: 'bg-[#EEF9F2] border-emerald-200', text: 'text-emerald-800', Icon: CheckCircle },
    error: { bg: 'bg-rose-50 border-rose-200', text: 'text-rose-800', Icon: AlertCircle },
    info: { bg: 'bg-[#F4F1FF] border-[#E9E6F8]', text: 'text-[#6C4EFF]', Icon: Info },
  };

  const s = styles[toast.type] || styles.info;

  return (
    <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[60] animate-fadeInUp">
      <div className={`flex items-center gap-2.5 border px-4 py-3 rounded-full shadow-lg backdrop-blur-xl max-w-sm ${s.bg}`}>
        <s.Icon className={`w-[18px] h-[18px] flex-shrink-0 ${s.text}`} />
        <span className={`text-[13px] font-semibold ${s.text}`}>{toast.message}</span>
      </div>
    </div>
  );
};

export default Toast;
