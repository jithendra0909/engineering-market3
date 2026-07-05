import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Search, ChevronDown, Bell, User as UserIcon, LogOut, LayoutDashboard } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const Navbar = () => {
  const { user, isLoggedIn, logout, isAdmin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isCatOpen, setIsCatOpen] = useState(false);
  const [searchVal, setSearchVal] = useState('');

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
      <header className="hidden lg:block sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-[#E9E6F8]/60">
        <div className="max-w-[1360px] mx-auto h-[64px] px-8 flex items-center justify-between gap-6">
          
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 flex-shrink-0">
            <div className="w-[34px] h-[34px] bg-[#111827] rounded-full flex items-center justify-center">
              <span className="text-white text-[11px] font-extrabold tracking-tight leading-none">EM</span>
            </div>
            <span className="text-[15px] font-bold text-[#111827] tracking-[-0.01em]">Engineering Market</span>
          </Link>

          {/* Desktop Search */}
          <form onSubmit={handleSearch} className="flex-1 max-w-[380px]">
            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9CA3AF]" />
              <input
                type="text"
                placeholder="Search for items, services, or vendors..."
                value={searchVal}
                onChange={(e) => setSearchVal(e.target.value)}
                className="w-full h-[38px] pl-10 pr-4 bg-[#FAFAFF] border border-[#E9E6F8] rounded-full text-[13px] text-[#111827] placeholder-[#9CA3AF] focus:bg-white focus:border-[#6C4EFF]/30 focus:outline-none focus:ring-2 focus:ring-[#6C4EFF]/10 transition-all"
              />
            </div>
          </form>

          {/* Navigation Links */}
          <nav className="flex items-center gap-1">
            <Link
              to="/"
              className={`px-3.5 py-[7px] rounded-full text-[13px] font-semibold transition-all ${
                isActive('/') ? 'text-[#6C4EFF] bg-[#F4F1FF]' : 'text-[#6B7280] hover:text-[#111827] hover:bg-[#FAFAFF]'
              }`}
            >
              Home
            </Link>

            {/* Categories Dropdown */}
            <div className="relative">
              <button
                onClick={() => setIsCatOpen(!isCatOpen)}
                onBlur={() => setTimeout(() => setIsCatOpen(false), 200)}
                className={`px-3.5 py-[7px] rounded-full text-[13px] font-semibold transition-all flex items-center gap-1 ${
                  isActive('/general-market') || isActive('/college-market')
                    ? 'text-[#6C4EFF] bg-[#F4F1FF]'
                    : 'text-[#6B7280] hover:text-[#111827] hover:bg-[#FAFAFF]'
                }`}
              >
                Categories
                <ChevronDown className={`w-3.5 h-3.5 transition-transform ${isCatOpen ? 'rotate-180' : ''}`} />
              </button>

              {isCatOpen && (
                <div className="absolute top-full left-0 mt-2 w-52 bg-white border border-[#E9E6F8] rounded-2xl shadow-lg py-1.5 z-50 animate-scaleIn origin-top-left">
                  <Link to="/college-market" className="flex items-center gap-3 px-4 py-2.5 text-[13px] font-medium text-[#6B7280] hover:bg-[#FAFAFF] hover:text-[#6C4EFF] transition-colors rounded-xl mx-1.5">
                    College Market
                  </Link>
                  <Link to="/general-market" className="flex items-center gap-3 px-4 py-2.5 text-[13px] font-medium text-[#6B7280] hover:bg-[#FAFAFF] hover:text-[#6C4EFF] transition-colors rounded-xl mx-1.5">
                    General Market
                  </Link>
                </div>
              )}
            </div>

            <Link
              to="/vendors"
              className={`px-3.5 py-[7px] rounded-full text-[13px] font-semibold transition-all ${
                isActive('/vendors') ? 'text-[#6C4EFF] bg-[#F4F1FF]' : 'text-[#6B7280] hover:text-[#111827] hover:bg-[#FAFAFF]'
              }`}
            >
              Vendors
            </Link>

            <Link
              to="/orders"
              className={`px-3.5 py-[7px] rounded-full text-[13px] font-semibold transition-all ${
                isActive('/orders') ? 'text-[#6C4EFF] bg-[#F4F1FF]' : 'text-[#6B7280] hover:text-[#111827] hover:bg-[#FAFAFF]'
              }`}
            >
              Orders
            </Link>
          </nav>

          {/* Right Actions */}
          <div className="flex items-center gap-2">
            <button className="w-[34px] h-[34px] rounded-full flex items-center justify-center text-[#6B7280] hover:bg-[#FAFAFF] hover:text-[#111827] transition-all">
              <Search className="w-[18px] h-[18px]" />
            </button>

            {isLoggedIn && user ? (
              <>
                <button className="relative w-[34px] h-[34px] rounded-full flex items-center justify-center text-[#6B7280] hover:bg-[#FAFAFF] hover:text-[#111827] transition-all">
                  <Bell className="w-[18px] h-[18px]" />
                  <span className="absolute top-[6px] right-[6px] w-[7px] h-[7px] bg-[#E5484D] rounded-full ring-2 ring-white" />
                </button>

                {/* Profile dropdown */}
                <div className="relative">
                  <button
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    onBlur={() => setTimeout(() => setIsDropdownOpen(false), 200)}
                    className="w-[34px] h-[34px] rounded-full overflow-hidden border border-[#E9E6F8] hover:border-[#6C4EFF]/30 transition-all flex items-center justify-center bg-[#FAFAFF]"
                  >
                    {user.profileImageUrl ? (
                      <img src={user.profileImageUrl} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <UserIcon className="w-4 h-4 text-[#6B7280]" />
                    )}
                  </button>

                  {isDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-56 bg-white border border-[#E9E6F8] rounded-2xl shadow-lg py-1.5 z-50 animate-scaleIn origin-top-right">
                      <div className="px-4 py-3 border-b border-[#E9E6F8]">
                        <p className="font-bold text-[13px] text-[#111827] truncate">{user.fullName}</p>
                        <p className="text-[11px] text-[#9CA3AF] truncate mt-0.5">{user.email}</p>
                      </div>
                      <Link to="/profile" className="flex items-center gap-2.5 px-4 py-2.5 text-[13px] font-medium text-[#6B7280] hover:bg-[#FAFAFF] hover:text-[#6C4EFF] transition-colors">
                        <UserIcon className="w-4 h-4" /> My Profile
                      </Link>
                      {isAdmin && (
                        <Link to="/admin/dashboard" className="flex items-center gap-2.5 px-4 py-2.5 text-[13px] font-medium text-[#6B7280] hover:bg-[#FAFAFF] hover:text-[#6C4EFF] transition-colors">
                          <LayoutDashboard className="w-4 h-4" /> Admin Dashboard
                        </Link>
                      )}
                      <button
                        onClick={logout}
                        className="w-full flex items-center gap-2.5 px-4 py-2.5 text-[13px] font-medium text-rose-600 hover:bg-rose-50 transition-colors border-t border-[#E9E6F8] mt-1"
                      >
                        <LogOut className="w-4 h-4" /> Log Out
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="flex items-center gap-2 ml-1">
                <Link to="/login" className="text-[13px] font-semibold text-[#6C4EFF] hover:text-[#8A72FF] px-3 py-1.5 transition-colors">
                  Log In
                </Link>
                <Link to="/signup" className="bg-[#6C4EFF] hover:bg-[#8A72FF] text-white text-[13px] font-semibold px-4 py-[7px] rounded-full shadow-sm transition-all active:scale-[0.98]">
                  Sign Up
                </Link>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* ══════════ MOBILE HEADER ══════════ */}
      {/* Hidden on /vendors, /orders, /profile — those pages render their own headers */}
      {!['/vendors', '/orders', '/profile'].includes(location.pathname) && (
      <header className="lg:hidden sticky top-0 z-50 bg-white/90 backdrop-blur-xl border-b border-[#E9E6F8]/40">
        <div className="px-5 h-[56px] flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-[30px] h-[30px] bg-[#111827] rounded-full flex items-center justify-center">
              <span className="text-white text-[10px] font-extrabold tracking-tight leading-none">EM</span>
            </div>
            <span className="text-[14px] font-bold text-[#111827] tracking-[-0.01em]">Engineering Market</span>
          </Link>

          <div className="flex items-center gap-0.5">
            <button onClick={() => navigate('/general-market')} className="w-9 h-9 rounded-full flex items-center justify-center text-[#6B7280] hover:text-[#111827] transition-colors">
              <Search className="w-[20px] h-[20px]" />
            </button>
            <Link to={isLoggedIn ? '/profile' : '/login'} className="relative w-9 h-9 rounded-full flex items-center justify-center text-[#6B7280] hover:text-[#111827] transition-colors">
              <Bell className="w-[20px] h-[20px]" />
              {isLoggedIn && <span className="absolute top-[5px] right-[5px] w-[7px] h-[7px] bg-[#E5484D] rounded-full ring-2 ring-white" />}
            </Link>
            <Link to={isLoggedIn ? '/profile' : '/login'} className="w-9 h-9 rounded-full border border-[#E9E6F8] flex items-center justify-center text-[#6B7280] overflow-hidden bg-[#FAFAFF]">
              {user?.profileImageUrl ? (
                <img src={user.profileImageUrl} alt="" className="w-full h-full object-cover" />
              ) : (
                <UserIcon className="w-[18px] h-[18px]" />
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
