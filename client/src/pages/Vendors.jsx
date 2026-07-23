import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Printer, 
  LayoutGrid, 
  Star, 
  ChevronRight, 
  ShieldCheck, 
  Lock, 
  Headset, 
  Award,
  Search
} from 'lucide-react';

export const Vendors = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('All');
  const [searchVal, setSearchVal] = useState('');

  return (
    <div className="max-w-[1360px] mx-auto px-5 lg:px-8 pt-5 lg:pt-8 pb-28 lg:pb-12 flex flex-col gap-8 font-sans antialiased text-gray-700">
      
      {/* ── HEADER ── */}
      <div className="text-left">
        <h1 className="text-[22px] lg:text-[28px] font-bold text-[#111827] tracking-tight leading-tight">Vendors</h1>
        <p className="text-[13px] text-gray-400 mt-1">Discover verified vendors and services on campus.</p>
      </div>

      {/* ── SEARCH & CHIPS BAR ── */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
        
        {/* Search Input Box */}
        <motion.div 
          whileTap={{ scale: 0.99 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
          className="w-full sm:max-w-md h-12 border border-[#EAEAEA] rounded-[18px] bg-white px-4 flex items-center gap-3 shadow-[0_2px_8px_rgba(0,0,0,0.01)]"
        >
          <Search className="w-5 h-5 text-gray-400 stroke-[2]" />
          <input 
            type="text" 
            placeholder="Search vendors or services..." 
            value={searchVal}
            onChange={(e) => setSearchVal(e.target.value)}
            className="flex-grow bg-transparent text-[14px] text-[#111827] placeholder-gray-400 font-medium outline-none border-none py-1"
          />
        </motion.div>

        {/* Categories Tabs Filter */}
        <div className="flex items-center gap-3 self-start sm:self-auto overflow-x-auto scrollbar-hide py-1">
          <button 
            onClick={() => setActiveTab('All')}
            className={`h-11 px-5 rounded-[16px] flex items-center gap-2 font-bold text-[13.5px] transition-all border shrink-0 ${
              activeTab === 'All' 
                ? 'bg-[#F4F1FF] border-[#6C4EFF]/20 text-[#6C4EFF]' 
                : 'bg-white border-[#EBEBEB] text-[#555555] hover:bg-[#FAFAFA]'
            }`}
          >
            <LayoutGrid className="w-4 h-4 stroke-[2]" />
            All
          </button>

          <button 
            onClick={() => setActiveTab('Printing')}
            className={`h-11 px-5 rounded-[16px] flex items-center gap-2 font-bold text-[13.5px] transition-all border shrink-0 ${
              activeTab === 'Printing' 
                ? 'bg-[#F4F1FF] border-[#6C4EFF]/20 text-[#6C4EFF]' 
                : 'bg-white border-[#EBEBEB] text-[#555555] hover:bg-[#FAFAFA]'
            }`}
          >
            <Printer className="w-4 h-4 stroke-[2]" />
            Printing
          </button>
        </div>
      </div>

      {/* ── POPULAR VENDOR SECTION ── */}
      <div className="space-y-4">
        <h2 className="text-[17.5px] font-bold text-gray-800 tracking-tight">Popular Vendors</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {(activeTab === 'All' || activeTab === 'Printing') && (
            <motion.div 
              whileHover={{ y: -3 }}
              whileTap={{ scale: 0.99 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              onClick={() => navigate('/vendors/print-studio')}
              className="bg-white border border-[#EBEBEB] rounded-[22px] p-5 flex items-center gap-4 shadow-sm cursor-pointer hover:border-[#6C4EFF]/30 transition-all text-left"
            >
              {/* Purple square printer icon badge */}
              <div className="w-20 h-20 bg-[#F4F1FF] rounded-[16px] flex items-center justify-center shrink-0">
                <Printer className="w-10 h-10 text-[#6C4EFF] stroke-[2]" />
              </div>

              {/* Card central content details */}
              <div className="flex-grow flex flex-col justify-center min-w-0">
                <h3 className="text-[19px] font-bold text-[#111827] truncate leading-tight">EM Printf Hub</h3>
                <p className="text-[13px] text-[#6C4EFF] font-bold mt-1">Printing Services</p>
                <p className="text-[12px] text-gray-400 mt-1.5 truncate">ID Cards • Photocopies • Spiral Binding</p>
                
                {/* Verified Badge pill */}
                <div className="mt-2.5 flex">
                  <span className="bg-[#ECFDF5] text-[#10B981] text-[11px] font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1">
                    <svg className="w-3 h-3 fill-current" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l5-5z" clipRule="evenodd" />
                    </svg>
                    Verified
                  </span>
                </div>
              </div>

              {/* Right actions and stats info */}
              <div className="flex flex-col items-end justify-between self-stretch py-0.5 shrink-0">
                <div className="flex items-center gap-1 text-[13px] font-bold text-[#111827]">
                  <Star className="w-4 h-4 fill-[#FBBF24] text-[#FBBF24]" />
                  4.8
                  <span className="text-gray-400 font-medium">(256)</span>
                </div>
                
                <ChevronRight className="w-5 h-5 text-gray-400 stroke-[2.5]" />
              </div>
            </motion.div>
          )}
        </div>
      </div>

      {/* ── SECURITY PILLARS ROW ── */}
      <div className="bg-white border border-[#EBEBEB] rounded-[22px] p-6 shadow-sm mt-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 divide-y md:divide-y-0 md:divide-x divide-gray-100">
          
          {/* Card 1 */}
          <div className="flex flex-col items-center text-center p-2">
            <ShieldCheck className="w-7 h-7 text-[#6C4EFF] stroke-[2] mb-2" />
            <h4 className="text-[12px] font-bold text-gray-800 leading-tight">Verified Vendors</h4>
            <p className="text-[10px] text-gray-400 mt-1 font-medium leading-tight">Trusted & verified</p>
          </div>

          {/* Card 2 */}
          <div className="flex flex-col items-center text-center p-2 pt-6 md:pt-2">
            <Lock className="w-7 h-7 text-emerald-500 stroke-[2] mb-2" />
            <h4 className="text-[12px] font-bold text-gray-800 leading-tight">Safe & Secure</h4>
            <p className="text-[10px] text-gray-400 mt-1 font-medium leading-tight">Your safety matters</p>
          </div>

          {/* Card 3 */}
          <div className="flex flex-col items-center text-center p-2 pt-6 md:pt-2">
            <Headset className="w-7 h-7 text-[#3B6FE0] stroke-[2] mb-2" />
            <h4 className="text-[12px] font-bold text-gray-800 leading-tight">Support</h4>
            <p className="text-[10px] text-gray-400 mt-1 font-medium leading-tight">We're here to help</p>
          </div>

          {/* Card 4 */}
          <div className="flex flex-col items-center text-center p-2 pt-6 md:pt-2">
            <Award className="w-7 h-7 text-[#FBBF24] stroke-[2] mb-2" />
            <h4 className="text-[12px] font-bold text-gray-800 leading-tight">Top Rated</h4>
            <p className="text-[10px] text-gray-400 mt-1 font-medium leading-tight">Quality assured</p>
          </div>
        </div>
      </div>

    </div>
  );
};

export default Vendors;
