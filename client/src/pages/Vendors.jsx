import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, 
  Search, 
  Bell, 
  Printer, 
  LayoutGrid, 
  Star, 
  ChevronRight, 
  ShieldCheck, 
  Lock, 
  Headset, 
  Award,
  Home,
  MessageSquare,
  Plus,
  Store,
  User
} from 'lucide-react';

export const Vendors = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('All');
  const [searchVal, setSearchVal] = useState('');

  return (
    <div className="w-full bg-[#FAFAFA] min-h-screen flex justify-center items-start font-sans antialiased">
      {/* Mobile viewport frame container */}
      <div className="w-full max-w-[420px] min-h-screen bg-white shadow-[0_8px_30px_rgba(0,0,0,0.05)] border-x border-[#ECECEC] flex flex-col relative pb-[104px]">
        
        {/* Sticky Header (Height 76px) */}
        <header className="sticky top-0 z-40 bg-white h-[76px] px-5 flex items-center justify-between border-b border-[#ECECEC]/30">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => navigate(-1)} 
              className="w-10 h-10 flex items-center justify-start text-[#111111] hover:opacity-75 transition-opacity"
            >
              <ArrowLeft className="w-6 h-6 stroke-[2]" />
            </button>
            <h1 className="text-[26px] font-bold text-[#111111] tracking-tight">Vendors</h1>
          </div>
          
          <div className="flex items-center gap-4">
            <button className="text-[#111111] hover:opacity-75 transition-opacity">
              <Search className="w-6 h-6 stroke-[2]" />
            </button>
            <button className="relative text-[#111111] hover:opacity-75 transition-opacity">
              <Bell className="w-6 h-6 stroke-[2]" />
              <span className="absolute top-[2px] right-[2px] w-2.5 h-2.5 bg-[#E5484D] rounded-full border border-white" />
            </button>
          </div>
        </header>

        {/* Scrollable Main Area */}
        <div className="px-5 py-6 flex-grow space-y-6">
          
          {/* Search Bar Input (Height 58px) */}
          <motion.div 
            whileTap={{ scale: 0.98 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="w-full h-[58px] border border-[#EAEAEA] rounded-[18px] bg-[#FFFFFF] px-4 flex items-center gap-3 shadow-[0_2px_8px_rgba(0,0,0,0.01)]"
          >
            <Search className="w-5 h-5 text-[#999999] stroke-[2]" />
            <input 
              type="text" 
              placeholder="Search vendors or services..." 
              value={searchVal}
              onChange={(e) => setSearchVal(e.target.value)}
              className="flex-grow bg-transparent text-[15px] text-[#111111] placeholder-[#999999] font-medium outline-none border-none py-1"
            />
          </motion.div>

          {/* Horizontal scroll filter chips (Height 48px) */}
          <div className="flex items-center gap-3 overflow-x-auto scrollbar-hide py-1">
            <button 
              onClick={() => setActiveTab('All')}
              className={`h-[48px] px-6 rounded-[16px] flex items-center gap-2.5 font-semibold text-[15px] transition-all border shrink-0 ${
                activeTab === 'All' 
                  ? 'bg-[#F3EEFC] border-[#5B5BFF]/30 text-[#7C5CFF]' 
                  : 'bg-white border-[#ECECEC] text-[#555555]'
              }`}
            >
              <LayoutGrid className="w-4 h-4 stroke-[2.2]" />
              All
            </button>

            <button 
              onClick={() => setActiveTab('Printing')}
              className={`h-[48px] px-6 rounded-[16px] flex items-center gap-2.5 font-semibold text-[15px] transition-all border shrink-0 ${
                activeTab === 'Printing' 
                  ? 'bg-[#F3EEFC] border-[#5B5BFF]/30 text-[#7C5CFF]' 
                  : 'bg-white border-[#ECECEC] text-[#555555]'
              }`}
            >
              <Printer className="w-4 h-4 stroke-[2.2]" />
              Printing
            </button>
          </div>

          {/* Popular Vendor block */}
          <div className="space-y-4">
            <h2 className="text-[24px] font-bold text-[#111111] tracking-tight mt-[12px]">Popular Vendor</h2>
            
            {/* Vendor Card - EM Printf Hub (Height 160px) */}
            {(activeTab === 'All' || activeTab === 'Printing') && (
              <motion.div 
                whileTap={{ y: -4 }}
                transition={{ duration: 0.2, ease: "easeOut" }}
                onClick={() => navigate('/vendors/print-studio')}
                className="w-full h-[160px] bg-white border border-[#ECECEC] rounded-[22px] p-4 flex items-center gap-4 shadow-[0_8px_30px_rgba(0,0,0,0.05)] cursor-pointer hover:border-[#5B5BFF]/30 transition-all text-left"
              >
                {/* Purple square printer icon badge (80x80) */}
                <div className="w-20 h-20 bg-[#F3EEFC] rounded-[16px] flex items-center justify-center shrink-0">
                  <Printer className="w-10 h-10 text-[#7C5CFF] stroke-[2]" />
                </div>

                {/* Card central content details */}
                <div className="flex-grow flex flex-col justify-center min-w-0">
                  <h3 className="text-[22px] font-bold text-[#111111] truncate leading-tight">EM Printf Hub</h3>
                  <p className="text-[14px] text-[#555555] font-semibold mt-0.5">Printing Services</p>
                  <p className="text-[12px] text-[#888888] font-medium mt-1 truncate">ID Cards • Photocopies • Spiral Binding</p>
                  
                  {/* Verified Badge pill */}
                  <div className="mt-2.5 flex">
                    <span className="bg-[#ECFDF5] text-[#10B981] text-[12px] font-bold px-2.5 py-1 rounded-full flex items-center gap-1">
                      <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l5-5z" clipRule="evenodd" />
                      </svg>
                      Verified
                    </span>
                  </div>
                </div>

                {/* Right actions and stats info */}
                <div className="flex flex-col items-end justify-between h-full py-1 shrink-0">
                  <div className="flex flex-col items-end">
                    <div className="flex items-center gap-1 text-[14px] font-bold text-[#111111]">
                      <Star className="w-4 h-4 fill-[#FBBF24] text-[#FBBF24]" />
                      4.8
                      <span className="text-[#888888] font-medium">(256)</span>
                    </div>
                    <span className="text-[12px] font-semibold text-[#888888] mt-1">0.3 km</span>
                  </div>
                  
                  <ChevronRight className="w-6 h-6 text-[#888888] stroke-[2.5] mb-2" />
                </div>
              </motion.div>
            )}
          </div>

          {/* Verification / Security Pillars */}
          <div className="bg-white border border-[#ECECEC] rounded-[16px] p-5 shadow-[0_8px_30px_rgba(0,0,0,0.05)] text-center mt-[12px]">
            <div className="grid grid-cols-4 divide-x divide-[#ECECEC]">
              {/* Card 1: Verified Vendors */}
              <div className="flex flex-col items-center px-1 text-center">
                <ShieldCheck className="w-7 h-7 text-[#7C5CFF] stroke-[2] mb-2" />
                <h4 className="text-[11px] font-bold text-[#111111] leading-tight">Verified Vendors</h4>
                <p className="text-[9px] text-[#888888] mt-1 font-medium leading-tight">Trusted & verified</p>
              </div>

              {/* Card 2: Safe & Secure */}
              <div className="flex flex-col items-center px-1 text-center">
                <Lock className="w-7 h-7 text-[#10B981] stroke-[2] mb-2" />
                <h4 className="text-[11px] font-bold text-[#111111] leading-tight">Safe & Secure</h4>
                <p className="text-[9px] text-[#888888] mt-1 font-medium leading-tight">Your safety matters</p>
              </div>

              {/* Card 3: Support */}
              <div className="flex flex-col items-center px-1 text-center">
                <Headset className="w-7 h-7 text-[#3B6FE0] stroke-[2] mb-2" />
                <h4 className="text-[11px] font-bold text-[#111111] leading-tight">Support</h4>
                <p className="text-[9px] text-[#888888] mt-1 font-medium leading-tight">We're here to help</p>
              </div>

              {/* Card 4: Top Rated */}
              <div className="flex flex-col items-center px-1 text-center">
                <Award className="w-7 h-7 text-[#FBBF24] stroke-[2] mb-2" />
                <h4 className="text-[11px] font-bold text-[#111111] leading-tight">Top Rated</h4>
                <p className="text-[9px] text-[#888888] mt-1 font-medium leading-tight">Quality assured</p>
              </div>
            </div>
          </div>

        </div>

        {/* Sticky/Fixed bottom navigation menu (Height 84px) */}
        <div className="fixed bottom-0 left-0 right-0 max-w-[420px] mx-auto bg-white border-t border-[#ECECEC] h-[84px] px-6 flex items-center justify-between z-50">
          
          {/* Home Active tab (as in the screenshot) */}
          <button 
            onClick={() => navigate('/')} 
            className="flex flex-col items-center justify-center gap-1 flex-1 h-full text-[#5B5BFF]"
          >
            <motion.div whileTap={{ scale: 1.08 }}>
              <Home className="w-6 h-6 stroke-[2]" />
            </motion.div>
            <span className="text-[11px] font-semibold">Home</span>
          </button>

          {/* Chat Tab */}
          <button 
            onClick={() => navigate('/chat')} 
            className="flex flex-col items-center justify-center gap-1 flex-1 h-full text-[#888888]"
          >
            <motion.div whileTap={{ scale: 1.08 }}>
              <MessageSquare className="w-6 h-6 stroke-[2]" />
            </motion.div>
            <span className="text-[11px] font-semibold">Chat</span>
          </button>

          {/* Large purple gradient Center Plus circle button */}
          <div className="flex-1 flex justify-center relative -top-3">
            <motion.button 
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate('/listing/new')}
              className="w-16 h-16 rounded-full bg-gradient-to-tr from-[#5B5BFF] to-[#7C5CFF] text-white flex items-center justify-center shadow-[0_8px_25px_rgba(91,91,255,0.4)] transition-all z-10"
            >
              <Plus className="w-8 h-8 stroke-[2.5]" />
            </motion.button>
          </div>

          {/* Vendors Tab */}
          <button 
            onClick={() => navigate('/vendors')} 
            className="flex flex-col items-center justify-center gap-1 flex-1 h-full text-[#888888]"
          >
            <motion.div whileTap={{ scale: 1.08 }}>
              <Store className="w-6 h-6 stroke-[2]" />
            </motion.div>
            <span className="text-[11px] font-semibold">Vendors</span>
          </button>

          {/* Profile Tab */}
          <button 
            onClick={() => navigate('/profile')} 
            className="flex flex-col items-center justify-center gap-1 flex-1 h-full text-[#888888]"
          >
            <motion.div whileTap={{ scale: 1.08 }}>
              <User className="w-6 h-6 stroke-[2]" />
            </motion.div>
            <span className="text-[11px] font-semibold">Profile</span>
          </button>
        </div>

      </div>
    </div>
  );
};

export default Vendors;
