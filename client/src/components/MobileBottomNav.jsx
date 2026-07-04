import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Home, Store, Plus, X, Package, User } from 'lucide-react';

export const MobileBottomNav = ({ isCreateOpen, setIsCreateOpen }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleTabClick = (path) => {
    setIsCreateOpen(false);
    navigate(path);
  };

  const isActive = (path) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  const tabClass = (path) =>
    `flex flex-col items-center justify-center gap-0.5 flex-1 h-full transition-all ${
      isActive(path) ? 'text-[#6C4EFF]' : 'text-[#9CA3AF]'
    }`;

  return (
    <div className="lg:hidden fixed bottom-0 left-0 right-0 z-50">
      {/* Frosted glass bar */}
      <div className="relative bg-white/90 backdrop-blur-xl border-t border-[#E9E6F8]/60 h-[68px] pb-safe flex items-center">
        
        {/* Home */}
        <button onClick={() => handleTabClick('/')} className={tabClass('/')}>
          <Home className="w-[22px] h-[22px] stroke-[1.8]" />
          <span className="text-[10px] font-semibold">Home</span>
        </button>

        {/* Vendors */}
        <button onClick={() => handleTabClick('/vendors')} className={tabClass('/vendors')}>
          <Store className="w-[22px] h-[22px] stroke-[1.8]" />
          <span className="text-[10px] font-semibold">Vendors</span>
        </button>

        {/* Center FAB — raised purple circle */}
        <div className="flex-1 flex items-center justify-center relative">
          <button
            onClick={() => setIsCreateOpen(!isCreateOpen)}
            className="absolute -top-5 w-[52px] h-[52px] bg-[#6C4EFF] hover:bg-[#8A72FF] text-white rounded-full flex items-center justify-center shadow-[0_4px_20px_rgba(108,78,255,0.35)] active:scale-95 transition-all z-10"
          >
            {isCreateOpen ? (
              <X className="w-6 h-6 stroke-[2.5]" />
            ) : (
              <Plus className="w-6 h-6 stroke-[2.5]" />
            )}
          </button>
        </div>

        {/* Orders */}
        <button onClick={() => handleTabClick('/orders')} className={tabClass('/orders')}>
          <Package className="w-[22px] h-[22px] stroke-[1.8]" />
          <span className="text-[10px] font-semibold">Orders</span>
        </button>

        {/* Profile */}
        <button onClick={() => handleTabClick('/profile')} className={tabClass('/profile')}>
          <User className="w-[22px] h-[22px] stroke-[1.8]" />
          <span className="text-[10px] font-semibold">Profile</span>
        </button>
      </div>
    </div>
  );
};

export default MobileBottomNav;
