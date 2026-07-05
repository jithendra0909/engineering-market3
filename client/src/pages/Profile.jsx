import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  User as UserIcon, ShieldCheck, ShieldAlert, Camera, MapPin,
  Tag, Heart, Gift, LogOut, ChevronRight, Clock, XCircle,
  Package, Settings, Bell, Pen, BadgeCheck
} from 'lucide-react';
import api from '../api/axios';

export const Profile = () => {
  const { user, logout, isVerified, showToast } = useAuth();
  const navigate = useNavigate();
  const [myListings, setMyListings] = useState([]);
  const [savedListings, setSavedListings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [listingsRes] = await Promise.all([api.get('/listings')]);
        const all = listingsRes.data;
        setMyListings(all.filter(l => l.seller?._id === user?._id || l.seller === user?._id));
        if (user?.savedListings?.length > 0) {
          setSavedListings(all.filter(l => user.savedListings.includes(l._id)));
        }
      } catch (err) {
        console.error('Error fetching profile data:', err);
      } finally {
        setLoading(false);
      }
    };
    if (user) fetchData();
  }, [user]);

  const donationCount = myListings.filter(l => l.listingType === 'donate').length;

  const getStatusConfig = () => {
    const status = user?.verificationStatus || 'pending';
    switch (status) {
      case 'approved':
        return { icon: ShieldCheck, label: 'Verified', color: 'text-emerald-600', bg: 'bg-[#EEF9F2]', border: 'border-emerald-200', bannerText: 'Your account is verified', bannerSub: 'You can now buy, sell, donate and connect with other students.' };
      case 'rejected':
        return { icon: XCircle, label: 'Rejected', color: 'text-rose-600', bg: 'bg-rose-50', border: 'border-rose-200', bannerText: 'Verification rejected', bannerSub: 'Please contact support or re-submit your ID card.' };
      default:
        return { icon: Clock, label: 'Pending', color: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-200', bannerText: 'Verification pending', bannerSub: 'Your ID card is being reviewed by the admin team.' };
    }
  };

  const statusConfig = getStatusConfig();
  const StatusIcon = statusConfig.icon;

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="max-w-[560px] mx-auto px-5 pt-2 pb-28 lg:pb-12">

      {/* ═══════════════════════════════════════
          PAGE HEADER (mobile)
          ═══════════════════════════════════════ */}
      <div className="flex items-center justify-between py-4 lg:py-6">
        <h1 className="text-[22px] lg:text-[26px] font-bold text-[#111827]">Profile</h1>
        <div className="flex items-center gap-1">
          <button className="w-9 h-9 rounded-full flex items-center justify-center text-[#111827] hover:bg-[#F7F4FF] transition-colors">
            <Settings className="w-[20px] h-[20px] stroke-[1.8]" />
          </button>
          <button className="relative w-9 h-9 rounded-full flex items-center justify-center text-[#111827] hover:bg-[#F7F4FF] transition-colors">
            <Bell className="w-[20px] h-[20px] stroke-[1.8]" />
            <span className="absolute top-[6px] right-[6px] w-[7px] h-[7px] bg-rose-500 rounded-full border-[1.5px] border-white" />
          </button>
        </div>
      </div>

      {/* ═══════════════════════════════════════
          PROFILE CARD
          ═══════════════════════════════════════ */}
      <div className="bg-white border border-[#ECECEC] rounded-[24px] p-6 mb-3">
        <div className="flex items-start gap-4">

          {/* Avatar with camera icon */}
          <div className="relative flex-shrink-0">
            <div className="w-[72px] h-[72px] rounded-full bg-[#E8E0F8] flex items-center justify-center overflow-hidden">
              {user?.profileImageUrl ? (
                <img src={user.profileImageUrl} alt="" className="w-full h-full object-cover" />
              ) : (
                <UserIcon className="w-9 h-9 text-[#B8A5E3] stroke-[1.5]" />
              )}
            </div>
            <button className="absolute -bottom-0.5 -left-0.5 w-[26px] h-[26px] bg-white rounded-full border border-[#ECECEC] flex items-center justify-center shadow-sm hover:bg-[#F7F4FF] transition-colors">
              <Camera className="w-[13px] h-[13px] text-[#6B7280] stroke-[2]" />
            </button>
          </div>

          {/* User info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5">
              <h2 className="text-[17px] font-bold text-[#111827] truncate">{user?.fullName}</h2>
              {isVerified && (
                <BadgeCheck className="w-[18px] h-[18px] text-[#6D4AFF] flex-shrink-0 fill-[#6D4AFF] stroke-white" />
              )}
            </div>
            <p className="text-[13px] text-[#6B7280] mt-0.5">{user?.department} • {user?.year}</p>
            <div className="flex items-center gap-1.5 mt-1.5">
              <MapPin className="w-[13px] h-[13px] text-[#9CA3AF] flex-shrink-0 stroke-[2]" />
              <p className="text-[12px] text-[#9CA3AF] truncate">{user?.college}</p>
            </div>

            {/* Edit Profile button */}
            <button className="inline-flex items-center gap-1.5 mt-3 px-4 py-[6px] border border-[#ECECEC] rounded-full text-[12px] font-semibold text-[#111827] hover:bg-[#F7F4FF] hover:border-[#D9D5EC] transition-all active:scale-[0.97]">
              <Pen className="w-[12px] h-[12px] stroke-[2]" />
              Edit Profile
            </button>
          </div>

          {/* Chevron */}
          <ChevronRight className="w-5 h-5 text-[#D1D5DB] flex-shrink-0 mt-1" />
        </div>
      </div>

      {/* ═══════════════════════════════════════
          STATS ROW
          ═══════════════════════════════════════ */}
      <div className="grid grid-cols-3 border border-[#ECECEC] rounded-[20px] bg-white mb-5 divide-x divide-[#ECECEC]">
        {[
          { icon: Package, value: myListings.length, label: 'Listings', color: 'text-[#6D4AFF]' },
          { icon: Heart, value: savedListings.length, label: 'Saved', color: 'text-[#6D4AFF]' },
          { icon: Gift, value: donationCount, label: 'Donations', color: 'text-[#6D4AFF]' },
        ].map((stat) => (
          <div key={stat.label} className="flex flex-col items-center py-4 gap-1">
            <div className="flex items-center gap-1.5">
              <stat.icon className={`w-[16px] h-[16px] ${stat.color} stroke-[1.8]`} />
              <span className="text-[16px] font-bold text-[#111827]">{stat.value}</span>
            </div>
            <span className="text-[11px] text-[#9CA3AF] font-medium">{stat.label}</span>
          </div>
        ))}
      </div>

      {/* ═══════════════════════════════════════
          VERIFICATION BANNER
          ═══════════════════════════════════════ */}
      <div className={`rounded-[20px] p-5 mb-6 flex items-center gap-4 border ${
        isVerified ? 'bg-[#F7F4FF] border-[#E8E0F8]' : `${statusConfig.bg} ${statusConfig.border}`
      }`}>
        <div className={`w-11 h-11 rounded-full flex items-center justify-center flex-shrink-0 ${
          isVerified ? 'bg-[#E8E0F8]' : statusConfig.bg
        }`}>
          <StatusIcon className={`w-5 h-5 ${statusConfig.color} stroke-[1.8]`} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[14px] font-bold text-[#111827]">{statusConfig.bannerText}</p>
          <p className="text-[11px] text-[#6B7280] mt-0.5 leading-relaxed">{statusConfig.bannerSub}</p>
        </div>
        {isVerified && (
          <div className="relative w-14 h-14 flex-shrink-0">
            <img
              src="/images/graduation-cap-3d.png"
              alt="Verified"
              className="w-full h-full object-contain"
              onError={(e) => { e.target.style.display = 'none'; }}
            />
            <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-emerald-500 rounded-full flex items-center justify-center">
              <ShieldCheck className="w-3 h-3 text-white stroke-[2.5]" />
            </div>
          </div>
        )}
      </div>

      {/* ═══════════════════════════════════════
          MY ACTIVITY
          ═══════════════════════════════════════ */}
      <h3 className="text-[15px] font-bold text-[#111827] mb-3">My Activity</h3>
      <div className="bg-white border border-[#ECECEC] rounded-[20px] overflow-hidden mb-6 divide-y divide-[#ECECEC]">
        {[
          {
            icon: Tag,
            iconBg: 'bg-[#EEF9F2]',
            iconColor: 'text-emerald-600',
            title: 'My Listings',
            sub: 'Manage your active and sold items',
            count: myListings.length,
          },
          {
            icon: Heart,
            iconBg: 'bg-[#FFF4ED]',
            iconColor: 'text-orange-400',
            title: 'Saved Items',
            sub: 'Items you have saved',
            count: savedListings.length,
          },
          {
            icon: Gift,
            iconBg: 'bg-[#FFF0F0]',
            iconColor: 'text-rose-400',
            title: 'My Donations',
            sub: 'Items you donated',
            count: donationCount,
          },
        ].map((item) => (
          <button
            key={item.title}
            className="w-full flex items-center gap-4 px-5 py-4 hover:bg-[#FAFAFF] transition-colors text-left group"
          >
            <div className={`w-10 h-10 ${item.iconBg} rounded-full flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform`}>
              <item.icon className={`w-[18px] h-[18px] ${item.iconColor} stroke-[1.8]`} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[14px] font-semibold text-[#111827]">{item.title}</p>
              <p className="text-[11px] text-[#9CA3AF] mt-0.5">{item.sub}</p>
            </div>
            <ChevronRight className="w-[18px] h-[18px] text-[#D1D5DB] flex-shrink-0 group-hover:text-[#9CA3AF] transition-colors" />
          </button>
        ))}
      </div>

      {/* ═══════════════════════════════════════
          ACCOUNT
          ═══════════════════════════════════════ */}
      <h3 className="text-[15px] font-bold text-[#111827] mb-3">Account</h3>
      <div className="bg-white border border-[#ECECEC] rounded-[20px] overflow-hidden mb-6 divide-y divide-[#ECECEC]">
        <button className="w-full flex items-center gap-4 px-5 py-4 hover:bg-[#FAFAFF] transition-colors text-left group">
          <div className="w-10 h-10 bg-[#F7F4FF] rounded-full flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
            <UserIcon className="w-[18px] h-[18px] text-[#6D4AFF] stroke-[1.8]" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[14px] font-semibold text-[#111827]">Personal Information</p>
            <p className="text-[11px] text-[#9CA3AF] mt-0.5">Name, email, phone & more</p>
          </div>
          <ChevronRight className="w-[18px] h-[18px] text-[#D1D5DB] flex-shrink-0 group-hover:text-[#9CA3AF] transition-colors" />
        </button>

        {/* Logout */}
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-4 px-5 py-4 hover:bg-rose-50/50 transition-colors text-left group"
        >
          <div className="w-10 h-10 bg-rose-50 rounded-full flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
            <LogOut className="w-[18px] h-[18px] text-rose-500 stroke-[1.8]" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[14px] font-semibold text-rose-600">Log Out</p>
            <p className="text-[11px] text-[#9CA3AF] mt-0.5">Sign out of your account</p>
          </div>
        </button>
      </div>

    </div>
  );
};

export default Profile;
