import React, { useState, useEffect } from 'react';
import { Search, GraduationCap, SlidersHorizontal } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import ProductCard from '../components/ProductCard';

const CATEGORIES = ['All', 'Textbooks', 'Electronics', 'Stationery', 'Clothing', 'Hostel Essentials', 'Lab Equipment', 'Projects', 'Other'];

export const CollegeMarket = () => {
  const { user } = useAuth();
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchVal, setSearchVal] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');

  useEffect(() => {
    const fetchListings = async () => {
      setLoading(true);
      try {
        const { data } = await api.get('/listings/college');
        setListings(data);
      } catch (err) {
        console.error('Error fetching college listings:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchListings();
  }, []);

  const filtered = listings.filter((item) => {
    const matchesSearch = !searchVal || item.title.toLowerCase().includes(searchVal.toLowerCase()) || item.description?.toLowerCase().includes(searchVal.toLowerCase());
    const matchesCat = activeCategory === 'All' || item.category === activeCategory;
    return matchesSearch && matchesCat;
  });

  return (
    <div className="max-w-[1360px] mx-auto px-5 lg:px-8 pt-5 lg:pt-8 pb-28 lg:pb-12">

      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-1">
          <div className="w-10 h-10 bg-[#F4F1FF] rounded-[12px] flex items-center justify-center">
            <GraduationCap className="w-5 h-5 text-[#6C4EFF] stroke-[1.8]" />
          </div>
          <div>
            <h1 className="text-[22px] lg:text-[28px] font-bold text-[#111827]">College Market</h1>
            <p className="text-[12px] text-[#9CA3AF]">{user?.college || 'Your College'}</p>
          </div>
        </div>
      </div>

      {/* Search + Filter bar */}
      <div className="flex gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9CA3AF]" />
          <input
            type="text"
            placeholder="Search in your college..."
            value={searchVal}
            onChange={(e) => setSearchVal(e.target.value)}
            className="w-full h-11 pl-11 pr-4 bg-[#FAFAFF] border border-[#E9E6F8] rounded-full text-[13px] text-[#111827] placeholder-[#9CA3AF] focus:bg-white focus:border-[#6C4EFF]/30 focus:outline-none focus:ring-2 focus:ring-[#6C4EFF]/10 transition-all"
          />
        </div>
        <button className="w-11 h-11 rounded-full bg-[#FAFAFF] border border-[#E9E6F8] flex items-center justify-center text-[#9CA3AF] hover:text-[#6C4EFF] hover:border-[#6C4EFF]/30 transition-all flex-shrink-0">
          <SlidersHorizontal className="w-[18px] h-[18px]" />
        </button>
      </div>

      {/* Category pills */}
      <div className="flex gap-2 overflow-x-auto no-scrollbar pb-4 -mx-1 px-1 mb-2">
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`px-4 py-[7px] rounded-full text-[12px] font-semibold whitespace-nowrap transition-all ${
              activeCategory === cat
                ? 'bg-[#6C4EFF] text-white shadow-sm'
                : 'bg-[#FAFAFF] border border-[#E9E6F8] text-[#6B7280] hover:bg-[#F4F1FF] hover:text-[#6C4EFF]'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Results count */}
      <p className="text-[12px] text-[#9CA3AF] mb-5">
        {loading ? 'Loading...' : `${filtered.length} item${filtered.length !== 1 ? 's' : ''} found`}
      </p>

      {/* Grid */}
      {loading ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((n) => (
            <div key={n} className="bg-white border border-[#E9E6F8]/70 rounded-[20px] overflow-hidden animate-pulse">
              <div className="aspect-square bg-[#F4F1FF]" />
              <div className="p-3.5 flex flex-col gap-2">
                <div className="h-3.5 bg-[#F4F1FF] rounded-full w-3/4" />
                <div className="h-3.5 bg-[#F4F1FF] rounded-full w-1/2" />
              </div>
            </div>
          ))}
        </div>
      ) : filtered.length > 0 ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {filtered.map((item) => (
            <ProductCard key={item._id} product={item} />
          ))}
        </div>
      ) : (
        <div className="text-center py-20">
          <div className="w-16 h-16 bg-[#F4F1FF] rounded-full flex items-center justify-center mx-auto mb-4">
            <GraduationCap className="w-7 h-7 text-[#6C4EFF] stroke-[1.8]" />
          </div>
          <h3 className="font-bold text-[16px] text-[#111827] mb-1">No college listings yet</h3>
          <p className="text-[13px] text-[#9CA3AF]">Be the first to list an item for your college!</p>
        </div>
      )}
    </div>
  );
};

export default CollegeMarket;
