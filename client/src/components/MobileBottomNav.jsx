import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Home, MessageSquare, Plus, X, Store, User } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import './MobileBottomNav.css';

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
    `mobile-nav-tab ${isActive(path) ? 'active' : ''}`;

  return (
    <div className="mobile-bottom-nav">
      {/* Frosted glass bar */}
      <div className="mobile-bottom-nav-bar">
        
        {/* Home */}
        <button onClick={() => handleTabClick('/')} className={tabClass('/')}>
          <Home className="mobile-nav-icon" />
          <span className="mobile-nav-label">Home</span>
        </button>

        {/* Chat */}
        <button onClick={() => handleTabClick('/chat')} className={tabClass('/chat')}>
          <MessageSquare className="mobile-nav-icon" />
          <span className="mobile-nav-label">Chat</span>
          {unreadCount > 0 && (
            <span className="mobile-nav-badge" />
          )}
        </button>

        {/* Center FAB — raised purple circle */}
        <div className="mobile-nav-center-slot">
          <button
            onClick={() => setIsCreateOpen(!isCreateOpen)}
            className="mobile-nav-fab"
          >
            {isCreateOpen ? (
              <X className="mobile-nav-fab-icon" />
            ) : (
              <Plus className="mobile-nav-fab-icon" />
            )}
          </button>
        </div>

        {/* Vendors */}
        <button onClick={() => handleTabClick('/vendors')} className={tabClass('/vendors')}>
          <Store className="mobile-nav-icon" />
          <span className="mobile-nav-label">Vendors</span>
        </button>

        {/* Profile */}
        <button onClick={() => handleTabClick('/profile')} className={tabClass('/profile')}>
          <User className="mobile-nav-icon" />
          <span className="mobile-nav-label">Profile</span>
        </button>
      </div>
    </div>
  );
};

export default MobileBottomNav;
