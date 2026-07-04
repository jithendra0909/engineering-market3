import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  User as UserIcon, ShieldCheck, ShieldAlert, Award, Grid, Heart,
  Gift, LogOut, ChevronRight, Clock, XCircle, Package
} from 'lucide-react';
import api from '../api/axios';
import ProductCard from '../components/ProductCard';

export const Profile = () => {
  const { user, logout, isVerified, showToast } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('listings');
  const [myListings, setMyListings] = useState([]);
  const [savedListings, setSavedListings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [listingsRes] = await Promise.all([
          api.get('/listings'),
        ]);
        const all = listingsRes.data;
        setMyListings(all.filter(l => l.seller?._id === user?._id || l.seller === user?._id));

        if (user?.savedListings?.length > 0) {
          const saved = all.filter(l => user.savedListings.includes(l._id));
          setSavedListings(saved);
        }
      } catch (err) {
        console.error('Error fetching profile data:', err);
      } finally {
        setLoading(false);
      }
    };
    if (user) fetchData();
  }, [user]);

  const getStatusConfig = () => {
    const status = user?.verificationStatus || 'pending';
    switch (status) {
      case 'approved':
        return { icon: ShieldCheck, label: 'Verified', color: 'text-emerald-600', bg: 'bg-[#EEF9F2]', border: 'border-emerald-200' };
      case 'rejected':
        return { icon: XCircle, label: 'Rejected', color: 'text-rose-600', bg: 'bg-rose-50', border: 'border-rose-200' };
      default:
        return { icon: Clock, label: 'Pending', color: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-200' };
    }
  };

  const statusConfig = getStatusConfig();
  const StatusIcon = statusConfig.icon;

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const tabs = [
    { id: 'listings', label: 'My Listings', icon: Grid, count: myListings.length },
    { id: 'saved', label: 'Saved', icon: Heart, count: savedListings.length },
  ];

  return (
    <div className="max-w-[1360px] mx-auto px-5 lg:px-8 pt-5 lg:pt-8 pb-28 lg:pb-12">

      {/* ── Profile header card ── */}
      <div className="bg-white border border-[#E9E6F8]/70 rounded-[24px] p-6 lg:p-8 mb-6">
        <div className="flex items-start gap-4 lg:gap-6">
          {/* Avatar */}
          <div className="w-16 h-16 lg:w-20 lg:h-20 rounded-full bg-[#F4F1FF] flex items-center justify-center text-[#6C4EFF] font-bold text-[20px] lg:text-[24px] overflow-hidden flex-shrink-0 border-2 border-[#E9E6F8]">
            {user?.profileImageUrl ? (
              <img src={user.profileImageUrl} alt="" className="w-full h-full object-cover" />
            ) : (
              user?.fullName?.charAt(0) || 'U'
            )}
          </div>

          {/* Info */}
          <div className="flex-1">
            <div className="flex items-start justify-between">
              <div>
                <h1 className="text-[20px] lg:text-[24px] font-bold text-[#111827]">{user?.fullName}</h1>
                <p className="text-[12px] text-[#9CA3AF] mt-0.5">{user?.email}</p>
              </div>
              <span className={`inline-flex items-center gap-1.5 text-[11px] font-bold px-3 py-1.5 rounded-full border ${statusConfig.color} ${statusConfig.bg} ${statusConfig.border}`}>
                <StatusIcon className="w-3.5 h-3.5" /> {statusConfig.label}
              </span>
            </div>

            {/* Details */}
            <div className="flex flex-wrap gap-x-5 gap-y-1 mt-3">
              <span className="text-[12px] text-[#6B7280]"><strong className="text-[#111827]">Dept:</strong> {user?.department}</span>
              <span className="text-[12px] text-[#6B7280]"><strong className="text-[#111827]">Year:</strong> {user?.year}</span>
              <span className="text-[12px] text-[#6B7280]"><strong className="text-[#111827]">Reg:</strong> {user?.registrationNumber}</span>
            </div>
            <p className="text-[12px] text-[#9CA3AF] mt-1">{user?.college}</p>
          </div>
        </div>

        {/* Quick stats */}
        <div className="grid grid-cols-3 gap-4 mt-6 pt-6 border-t border-[#E9E6F8]/60">
          <div className="text-center">
            <p className="text-[18px] font-bold text-[#111827]">{myListings.length}</p>
            <p className="text-[11px] text-[#9CA3AF]">Listings</p>
          </div>
          <div className="text-center">
            <p className="text-[18px] font-bold text-[#111827]">{savedListings.length}</p>
            <p className="text-[11px] text-[#9CA3AF]">Saved</p>
          </div>
          <div className="text-center">
            <p className="text-[18px] font-bold text-[#111827]">0</p>
            <p className="text-[11px] text-[#9CA3AF]">Orders</p>
          </div>
        </div>
      </div>

      {/* ── Tabs ── */}
      <div className="flex gap-2 mb-6 overflow-x-auto no-scrollbar">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`inline-flex items-center gap-2 px-4 py-[7px] rounded-full text-[12px] font-semibold whitespace-nowrap transition-all ${
              activeTab === tab.id
                ? 'bg-[#6C4EFF] text-white shadow-sm'
                : 'bg-[#FAFAFF] border border-[#E9E6F8] text-[#6B7280] hover:bg-[#F4F1FF]'
            }`}
          >
            <tab.icon className="w-3.5 h-3.5" /> {tab.label} ({tab.count})
          </button>
        ))}
      </div>

      {/* ── Tab content ── */}
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
      ) : (
        <>
          {activeTab === 'listings' && (
            myListings.length > 0 ? (
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {myListings.map((item) => (
                  <ProductCard key={item._id} product={item} />
                ))}
              </div>
            ) : (
              <div className="text-center py-16">
                <div className="w-14 h-14 bg-[#F4F1FF] rounded-full flex items-center justify-center mx-auto mb-3">
                  <Package className="w-6 h-6 text-[#6C4EFF] stroke-[1.8]" />
                </div>
                <h3 className="font-bold text-[15px] text-[#111827] mb-1">No listings yet</h3>
                <p className="text-[12px] text-[#9CA3AF]">Start selling or donating items to the community.</p>
              </div>
            )
          )}

          {activeTab === 'saved' && (
            savedListings.length > 0 ? (
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {savedListings.map((item) => (
                  <ProductCard key={item._id} product={item} />
                ))}
              </div>
            ) : (
              <div className="text-center py-16">
                <div className="w-14 h-14 bg-[#F4F1FF] rounded-full flex items-center justify-center mx-auto mb-3">
                  <Heart className="w-6 h-6 text-[#6C4EFF] stroke-[1.8]" />
                </div>
                <h3 className="font-bold text-[15px] text-[#111827] mb-1">No saved items</h3>
                <p className="text-[12px] text-[#9CA3AF]">Bookmark items you love to find them here later.</p>
              </div>
            )
          )}
        </>
      )}

      {/* ── Logout button ── */}
      <div className="mt-8">
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 text-[13px] font-semibold text-rose-600 hover:text-rose-700 px-4 py-2.5 rounded-full border border-rose-200 hover:bg-rose-50 transition-all"
        >
          <LogOut className="w-4 h-4" /> Log Out
        </button>
      </div>
    </div>
  );
};

export default Profile;
