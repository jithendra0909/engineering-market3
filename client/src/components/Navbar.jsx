import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Search, ChevronDown, Bell, User as UserIcon, LogOut, LayoutDashboard } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Logo } from './Logo';
import api from '../api/axios';
import './Navbar.css';

export const Navbar = () => {
  const { user, isLoggedIn, logout, isAdmin, showToast, unreadNotificationsCount, unreadChatCount } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isCatOpen, setIsCatOpen] = useState(false);
  const [searchVal, setSearchVal] = useState('');
  const searchInputRef = useRef(null);
  const dropdownRef = useRef(null);
  const catDropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
      if (catDropdownRef.current && !catDropdownRef.current.contains(event.target)) {
        setIsCatOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const isActive = (path) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchVal.trim()) {
      navigate(`/general-market?search=${encodeURIComponent(searchVal)}`);
    }
  };

  return (
    <>
      {/* ══════════ DESKTOP NAVBAR ══════════ */}
      {!['/vendors'].includes(location.pathname) && (
      <header className="navbar-desktop">
        <div className="navbar-desktop-container">
          
          {/* Logo */}
          <Link to="/" className="navbar-logo-link">
            <Logo size={34} showText={true} textClass="logo-text" />
          </Link>

          {/* Desktop Search */}
          <form onSubmit={handleSearch} className="navbar-search-form">
            <div className="navbar-search-wrapper">
              <Search className="navbar-search-icon" />
              <input
                ref={searchInputRef}
                type="text"
                placeholder="Search for items, services, or vendors..."
                value={searchVal}
                onChange={(e) => setSearchVal(e.target.value)}
                className="navbar-search-input"
              />
            </div>
          </form>

          {/* Navigation Links */}
          <nav className="navbar-nav-links">
            <Link
              to="/"
              className={`navbar-nav-item ${isActive('/') ? 'active' : ''}`}
            >
              Home
            </Link>

            {/* Categories Dropdown */}
            <div className="navbar-dropdown-wrapper" ref={catDropdownRef}>
              <button
                onClick={() => setIsCatOpen(!isCatOpen)}
                className={`navbar-nav-item ${(isActive('/general-market') || isActive('/college-market')) ? 'active' : ''}`}
              >
                Categories
                <ChevronDown className={`navbar-chevron-icon ${isCatOpen ? 'open' : ''}`} />
              </button>

              {isCatOpen && (
                <div className="navbar-dropdown-menu animate-scaleIn">
                  <Link to="/college-market" onClick={() => setIsCatOpen(false)} className="navbar-dropdown-item">
                    College Market
                  </Link>
                  <Link to="/general-market" onClick={() => setIsCatOpen(false)} className="navbar-dropdown-item">
                    General Market
                  </Link>
                </div>
              )}
            </div>

            <Link
              to="/vendors"
              className={`navbar-nav-item ${isActive('/vendors') ? 'active' : ''}`}
            >
              Vendors
            </Link>

            {isLoggedIn && (
              <Link
                to="/chat"
                className={`navbar-nav-item ${isActive('/chat') ? 'active' : ''}`}
              >
                Messages
                {unreadChatCount > 0 && (
                  <span className="navbar-unread-dot" />
                )}
              </Link>
            )}
          </nav>

          {/* Right Actions */}
          <div className="navbar-actions">
            <button
              onClick={() => searchInputRef.current?.focus()}
              className="navbar-action-btn"
            >
              <Search style={{ width: '18px', height: '18px' }} />
            </button>

            {isLoggedIn && user ? (
              <>
                <button
                  onClick={() => navigate('/notifications')}
                  className="navbar-action-btn"
                >
                  <Bell style={{ width: '18px', height: '18px' }} />
                  {unreadNotificationsCount > 0 && (
                    <span className="navbar-notif-badge" />
                  )}
                </button>

                {/* Profile dropdown */}
                <div className="navbar-dropdown-wrapper" ref={dropdownRef}>
                  <button
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    className="navbar-profile-avatar-btn"
                  >
                    {user.profileImageUrl ? (
                      <img src={user.profileImageUrl} alt={user?.fullName || 'User profile'} className="navbar-avatar-img" />
                    ) : (
                      <UserIcon style={{ width: '16px', height: '16px', color: '#6B7280' }} />
                    )}
                  </button>

                  {isDropdownOpen && (
                    <div className="navbar-profile-menu animate-scaleIn">
                      <div className="navbar-profile-info">
                        <p className="navbar-profile-name">{user.fullName}</p>
                        <p className="navbar-profile-email">{user.email}</p>
                      </div>
                      <Link to="/profile" onClick={() => setIsDropdownOpen(false)} className="navbar-profile-link">
                        <UserIcon style={{ width: '16px', height: '16px' }} /> My Profile
                      </Link>
                      {isAdmin && (
                        <Link to="/admin/dashboard" onClick={() => setIsDropdownOpen(false)} className="navbar-profile-link">
                          <LayoutDashboard style={{ width: '16px', height: '16px' }} /> Admin Dashboard
                        </Link>
                      )}
                      <button
                        onClick={() => {
                          setIsDropdownOpen(false);
                          logout();
                        }}
                        className="navbar-logout-btn"
                      >
                        <LogOut style={{ width: '16px', height: '16px' }} /> Log Out
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="navbar-auth-links">
                <Link to="/login" className="navbar-login-link">
                  Log In
                </Link>
                <Link to="/signup" className="navbar-signup-link">
                  Sign Up
                </Link>
              </div>
            )}
          </div>
        </div>
      </header>
      )}

      {/* ══════════ MOBILE HEADER ══════════ */}
      {!['/vendors', '/orders', '/profile', '/chat'].includes(location.pathname) && !location.pathname.startsWith('/chat') && (
      <header className="navbar-mobile">
        <div className="navbar-mobile-container">
          <Link to="/" className="navbar-logo-link">
            <Logo size={30} showText={true} textClass="logo-text" />
          </Link>

          <div className="navbar-mobile-actions">
            <button onClick={() => navigate('/general-market')} className="navbar-mobile-btn">
              <Search style={{ width: '20px', height: '20px' }} />
            </button>
            <button
              onClick={() => navigate('/notifications')}
              className="navbar-mobile-btn"
            >
              <Bell style={{ width: '20px', height: '20px' }} />
              {isLoggedIn && unreadNotificationsCount > 0 && (
                <span className="navbar-notif-badge" />
              )}
            </button>
            <Link to={isLoggedIn ? '/profile' : '/login'} className="navbar-mobile-avatar-link">
              {user?.profileImageUrl ? (
                <img src={user.profileImageUrl} alt={user?.fullName || 'User profile'} className="navbar-avatar-img" />
              ) : (
                <UserIcon style={{ width: '18px', height: '18px' }} />
              )}
            </Link>
          </div>
        </div>
      </header>
      )}
    </>
  );
};

export default Navbar;
