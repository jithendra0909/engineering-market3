import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Home, MessageSquare, Plus, X, Package, User } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';

export const MobileBottomNav = ({ isCreateOpen, setIsCreateOpen }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isLoggedIn } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (!isLoggedIn) {
      setUnreadCount(0);
      return;
    }

    const fetchUnreadCount = async () => {
      try {
        const { data } = await api.get('/chats/unread/count');
        setUnreadCount(data.count);
      } catch (err) {
        console.error('Error fetching unread count:', err);
      }
    };

    fetchUnreadCount();
    const interval = setInterval(fetchUnreadCount, 12000);
    return () => clearInterval(interval);
  }, [isLoggedIn, location.pathname]);

  const handleTabClick = (path) => {
    setIsCreateOpen(false);
    navigate(path);
  };

  const isActive = (path) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  const tabClass = (path) =>
    `flex flex-col items-center justify-center gap-0.5 flex-1 h-full transition-all relative ${
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

        {/* Chat */}
        <button onClick={() => handleTabClick('/chat')} className={tabClass('/chat')}>
          <MessageSquare className="w-[22px] h-[22px] stroke-[1.8]" />
          <span className="text-[10px] font-semibold">Chat</span>
          {unreadCount > 0 && (
            <span className="absolute top-2.5 right-6 w-2 h-2 bg-rose-500 rounded-full animate-pulse" />
          )}
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
