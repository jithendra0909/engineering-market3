import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Search, Bell } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const Orders = () => {
  const navigate = useNavigate();
  const { showToast } = useAuth();

  return (
    <div className="flex flex-col bg-[#EEEAF8]" style={{ minHeight: 'calc(100vh - 64px)' }}>

      {/* ── Mobile sub-header (← Orders | 🔍 🔔) ── */}
      <div className="flex lg:hidden items-center justify-between px-5 py-3.5 bg-white">
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => navigate(-1)}
            className="w-8 h-8 flex items-center justify-center text-[#111827]"
          >
            <ChevronLeft className="w-5 h-5 stroke-[2.5]" />
          </button>
          <h1 className="text-[16px] font-bold text-[#111827]">Orders</h1>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => navigate('/general-market')}
            className="w-9 h-9 flex items-center justify-center text-[#111827]"
          >
            <Search className="w-[18px] h-[18px] stroke-[2]" />
          </button>
          <button
            onClick={() => showToast('You have no new notifications.', 'info')}
            className="relative w-9 h-9 flex items-center justify-center text-[#111827]"
          >
            <Bell className="w-[18px] h-[18px] stroke-[2]" />
            <span className="absolute top-1.5 right-1.5 w-[7px] h-[7px] bg-rose-500 rounded-full border border-white" />
          </button>
        </div>
      </div>

      {/* ── Full-page coming soon illustration ── */}
      <div className="flex-1 flex items-center justify-center pb-20 lg:pb-0">
        <img
          src="/images/file_000000007a6471fdaa57a29b5d44bc0e.png"
          alt="Orders Coming Soon — We are working hard to bring something amazing for you."
          className="w-full max-w-[480px] lg:max-w-[520px] h-auto object-contain px-4"
        />
      </div>
    </div>
  );
};

export default Orders;
