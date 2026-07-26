import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Printer, LayoutGrid, Star, ChevronRight, 
  ShieldCheck, Lock, Headset, Award, Search
} from 'lucide-react';

export const Vendors = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('All');
  const [searchVal, setSearchVal] = useState('');

  return (
    <div className="relative overflow-hidden">

      {/* Decorative background blobs — matches Home page */}
      <div className="absolute top-0 left-0 w-full h-[500px] pointer-events-none overflow-hidden -z-10">
        <div className="absolute -top-20 -left-20 w-[300px] h-[300px] bg-[#6C4EFF]/[0.06] rounded-full blur-3xl" />
        <div className="absolute top-10 right-0 w-[250px] h-[250px] bg-[#E14BA1]/[0.04] rounded-full blur-3xl" />
      </div>

      <div className="max-w-[1360px] mx-auto px-5 lg:px-8 pt-5 lg:pt-8 pb-28 lg:pb-12 flex flex-col gap-8 lg:gap-10">

        {/* ── HEADER ── */}
        <div className="text-left">
          <h1 className="text-[18px] lg:text-[20px] font-bold text-[#111827] tracking-tight">Vendors</h1>
          <p className="text-[12px] text-[#9CA3AF] mt-1 leading-relaxed">Discover verified vendors and services on campus.</p>
        </div>

        {/* ── SEARCH & CHIPS BAR ── */}
        <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
          
          {/* Search — Home page style */}
          <div className="relative w-full sm:max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-[#9CA3AF]" />
            <input 
              type="text" 
              placeholder="Search vendors or services..." 
              value={searchVal}
              onChange={(e) => setSearchVal(e.target.value)}
              className="w-full h-11 pl-11 pr-4 bg-[#FAFAFF] border border-[#E9E6F8] rounded-full text-[13px] text-[#111827] placeholder-[#9CA3AF]"
            />
          </div>

          {/* Category Tabs — matching Home card style */}
          <div className="flex items-center gap-3 self-start sm:self-auto overflow-x-auto no-scrollbar py-1">
            <button 
              onClick={() => setActiveTab('All')}
              className={`h-10 px-5 rounded-full flex items-center gap-2 font-bold text-[12px] transition-all border shrink-0 ${
                activeTab === 'All' 
                  ? 'bg-[#F4F1FF] border-[#6C4EFF]/20 text-[#6C4EFF]' 
                  : 'bg-white border-[#E9E6F8]/70 text-[#9CA3AF] hover:text-[#111827] hover:border-[#6C4EFF]/30'
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5 stroke-[2]" />
              All
            </button>

            <button 
              onClick={() => setActiveTab('Printing')}
              className={`h-10 px-5 rounded-full flex items-center gap-2 font-bold text-[12px] transition-all border shrink-0 ${
                activeTab === 'Printing' 
                  ? 'bg-[#F4F1FF] border-[#6C4EFF]/20 text-[#6C4EFF]' 
                  : 'bg-white border-[#E9E6F8]/70 text-[#9CA3AF] hover:text-[#111827] hover:border-[#6C4EFF]/30'
              }`}
            >
              <Printer className="w-3.5 h-3.5 stroke-[2]" />
              Printing
            </button>
          </div>
        </div>

        {/* ── POPULAR VENDORS ── */}
        <div className="flex flex-col gap-5">
          <h2 className="text-[18px] lg:text-[20px] font-bold text-[#111827]">Popular Vendors</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {(activeTab === 'All' || activeTab === 'Printing') && (
              <button
                onClick={() => navigate('/vendors/print-studio')}
                className="bg-white border border-[#E9E6F8]/70 rounded-[20px] p-5 flex items-center gap-4 hover:shadow-md hover:-translate-y-0.5 transition-all text-left group"
              >
                {/* Icon badge — Home page style */}
                <div className="w-16 h-16 bg-[#F4F1FF] rounded-[14px] flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                  <Printer className="w-8 h-8 text-[#6C4EFF] stroke-[1.8]" />
                </div>

                {/* Content */}
                <div className="flex-grow flex flex-col justify-center min-w-0">
                  <h3 className="font-bold text-[15px] text-[#111827] truncate leading-tight">EM Printf Hub</h3>
                  <p className="text-[12px] text-[#6C4EFF] font-bold mt-0.5">Printing Services</p>
                  <p className="text-[11px] text-[#9CA3AF] mt-1 truncate">ID Cards • Photocopies • Spiral Binding</p>
                  
                  {/* Verified badge */}
                  <div className="mt-2 flex">
                    <span className="bg-[#EEF9F2] text-emerald-600 text-[10px] font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1">
                      <ShieldCheck className="w-3 h-3" />
                      Verified
                    </span>
                  </div>
                </div>

                {/* Rating + Arrow */}
                <div className="flex flex-col items-end justify-between self-stretch py-0.5 shrink-0">
                  <div className="flex items-center gap-1 text-[13px] font-bold text-[#111827]">
                    <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                    4.8
                    <span className="text-[#9CA3AF] font-medium text-[11px]">(256)</span>
                  </div>
                  
                  <ChevronRight className="w-4 h-4 text-[#9CA3AF] group-hover:text-[#6C4EFF] transition-colors" />
                </div>
              </button>
            )}
          </div>
        </div>

        {/* ── TRUST FEATURES — Matches Home page exactly ── */}
        <section className="grid grid-cols-2 lg:grid-cols-4 gap-5 lg:gap-8 py-4 lg:py-8 border-t border-[#E9E6F8]/60">
          {[
            { icon: ShieldCheck, title: 'Verified Vendors', sub: 'Trusted & verified for your safety.', color: 'text-[#6C4EFF]', bg: 'bg-[#F4F1FF]' },
            { icon: Lock, title: 'Safe & Secure', sub: 'Your transactions are always protected.', color: 'text-emerald-600', bg: 'bg-[#EEF9F2]' },
            { icon: Headset, title: 'Support', sub: "We're here to help you, always.", color: 'text-blue-600', bg: 'bg-blue-50' },
            { icon: Award, title: 'Top Rated', sub: 'Quality assured by student reviews.', color: 'text-orange-600', bg: 'bg-orange-50' },
          ].map((feat) => (
            <div key={feat.title} className="flex flex-col items-center text-center p-4 lg:p-6">
              <div className={`w-12 h-12 ${feat.bg} rounded-full flex items-center justify-center mb-3`}>
                <feat.icon className={`w-5 h-5 ${feat.color} stroke-[1.8]`} />
              </div>
              <h4 className="font-bold text-[13px] text-[#111827]">{feat.title}</h4>
              <p className="text-[11px] text-[#9CA3AF] mt-1 leading-relaxed max-w-[200px]">{feat.sub}</p>
            </div>
          ))}
        </section>

      </div>
    </div>
  );
};

export default Vendors;
