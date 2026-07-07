import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  User as UserIcon, ShieldCheck, ShieldAlert, Camera, MapPin,
  Tag, Heart, Gift, LogOut, ChevronRight, ChevronLeft, Clock, XCircle,
  Package, Settings, Bell, Pen, BadgeCheck, Trash2, CheckCircle2, RefreshCw
} from 'lucide-react';
import api from '../api/axios';

export const Profile = () => {
  const { user, logout, isVerified, showToast } = useAuth();
  const navigate = useNavigate();
  const [myListings, setMyListings] = useState([]);
  const [savedListings, setSavedListings] = useState([]);
  const [activeTab, setActiveTab] = useState(null); // 'listings', 'saved', 'donations', 'sold'
  const [showInfoModal, setShowInfoModal] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      const [listingsRes] = await Promise.all([api.get('/listings')]);
      const all = listingsRes.data;
      setMyListings(all.filter(l => l.seller?._id === user?._id || l.seller === user?._id));
      if (user?.savedListings?.length > 0) {
        setSavedListings(all.filter(l => user.savedListings.includes(l._id)));
      } else {
        setSavedListings([]);
      }
    } catch (err) {
      console.error('Error fetching profile data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) fetchData();
  }, [user]);

  const activeItems = myListings.filter(l => l.status === 'available');
  const soldItems = myListings.filter(l => l.status === 'sold');
  const donationCount = myListings.filter(l => l.listingType === 'donate' && l.status === 'available').length;

  const handleRenew = async (id) => {
    try {
      const { data } = await api.post(`/listings/${id}/renew`);
      showToast(data.message, 'success');
      fetchData();
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to renew listing', 'error');
    }
  };

  const handleMarkSold = async (id) => {
    try {
      await api.put(`/listings/${id}`, { status: 'sold' });
      showToast('Listing marked as sold', 'success');
      fetchData();
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to mark as sold', 'error');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this listing?')) return;
    try {
      await api.delete(`/listings/${id}`);
      showToast('Listing deleted successfully', 'success');
      fetchData();
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to delete listing', 'error');
    }
  };

  const handleUnsave = async (id) => {
    try {
      const { data } = await api.post(`/listings/${id}/save`);
      showToast(data.message, 'success');
      setSavedListings(prev => prev.filter(l => l._id !== id));
    } catch (err) {
      showToast('Failed to unsave item', 'error');
    }
  };

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

  if (activeTab === 'listings') {
    return (
      <div className="max-w-[560px] mx-auto px-5 pt-2 pb-28 lg:pb-12">
        <div className="flex items-center gap-3 py-4 lg:py-6 border-b border-[#ECECEC] mb-5">
          <button onClick={() => setActiveTab(null)} className="w-9 h-9 rounded-full flex items-center justify-center hover:bg-[#F7F4FF] transition-colors">
            <ChevronLeft className="w-5 h-5 text-[#111827] stroke-[2.5]" />
          </button>
          <h1 className="text-[20px] font-bold text-[#111827]">My Listings</h1>
        </div>

        {activeItems.length === 0 ? (
          <div className="text-center py-16 bg-white border border-[#ECECEC] rounded-[24px]">
            <Tag className="w-10 h-10 text-[#B8A5E3] mx-auto mb-3" />
            <p className="font-bold text-[#111827]">No active listings</p>
            <p className="text-[12px] text-[#9CA3AF] mt-1">Your active listings for sale or donation will appear here.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {activeItems.map((listing) => {
              const expired = listing.expiresAt && new Date(listing.expiresAt).getTime() <= Date.now();
              const diff = listing.expiresAt ? new Date(listing.expiresAt).getTime() - Date.now() : 0;
              const daysLeft = Math.ceil(diff / (1000 * 60 * 60 * 24));

              return (
                <div key={listing._id} className="bg-white border border-[#ECECEC] rounded-[20px] p-4 flex gap-4">
                  {/* Image */}
                  <div 
                    onClick={() => navigate(`/listing/${listing._id}`)}
                    className="w-20 h-20 bg-[#FAFAFF] rounded-[14px] overflow-hidden border border-[#E9E6F8]/70 flex-shrink-0 cursor-pointer"
                  >
                    <img
                      src={listing.images?.[0] || '/images/file_00000000968c71f8895e41375cd51838.png'}
                      alt=""
                      className="w-full h-full object-cover"
                    />
                  </div>

                  {/* Details */}
                  <div 
                    onClick={() => navigate(`/listing/${listing._id}`)}
                    className="flex-1 min-w-0 flex flex-col justify-between cursor-pointer"
                  >
                    <div>
                      <h4 className="font-bold text-[14px] text-[#111827] truncate">{listing.title}</h4>
                      <div className="flex flex-wrap items-center gap-1.5 mt-1">
                        <span className="text-[12px] font-bold text-[#111827]">
                          {listing.listingType === 'donate' ? 'Free' : `₹${listing.price}`}
                        </span>
                        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                          listing.status === 'sold'
                            ? 'bg-rose-50 text-rose-600 border border-rose-100'
                            : 'bg-emerald-50 text-emerald-600 border border-emerald-100'
                        }`}>
                          {listing.status}
                        </span>
                        {expired && listing.status === 'available' && (
                          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-amber-50 text-amber-600 border border-amber-100 uppercase tracking-wider">
                            Expired
                          </span>
                        )}
                      </div>
                    </div>

                    <p className={`text-[11px] font-medium ${expired && listing.status === 'available' ? 'text-rose-500 font-semibold' : 'text-[#9CA3AF]'}`}>
                      {listing.status === 'sold'
                        ? 'Item marked as sold'
                        : (expired
                          ? 'Expired - Hidden from public feed'
                          : `Expires in ${daysLeft} days`
                        )
                      }
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col justify-between items-end flex-shrink-0 gap-2">
                    {/* Delete action */}
                    <button
                      onClick={() => handleDelete(listing._id)}
                      className="w-8 h-8 rounded-full border border-[#ECECEC] flex items-center justify-center text-rose-500 hover:bg-rose-50 hover:border-rose-100 transition-colors"
                      title="Delete Listing"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>

                    <div className="flex gap-2">
                      {/* Mark as Sold */}
                      {listing.status === 'available' && (
                        <button
                          onClick={() => handleMarkSold(listing._id)}
                          className="px-3 py-1.5 bg-[#EEF9F2] text-emerald-600 border border-emerald-100 rounded-full text-[11px] font-semibold hover:bg-emerald-100 transition-colors flex items-center gap-1"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5 animate-pulse" /> Mark Sold
                        </button>
                      )}

                      {/* Renew */}
                      {listing.status === 'available' && (
                        <button
                          onClick={() => handleRenew(listing._id)}
                          className={`px-3 py-1.5 rounded-full text-[11px] font-semibold transition-colors flex items-center gap-1 ${
                            expired
                              ? 'bg-[#6D4AFF] text-white hover:bg-[#5939D5]'
                              : 'bg-[#F7F4FF] text-[#6D4AFF] border border-[#E8E0F8] hover:bg-[#E8E0F8]'
                          }`}
                        >
                          <RefreshCw className="w-3 h-3" /> Renew
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  }

  if (activeTab === 'sold') {
    return (
      <div className="max-w-[560px] mx-auto px-5 pt-2 pb-28 lg:pb-12">
        <div className="flex items-center gap-3 py-4 lg:py-6 border-b border-[#ECECEC] mb-5">
          <button onClick={() => setActiveTab(null)} className="w-9 h-9 rounded-full flex items-center justify-center hover:bg-[#F7F4FF] transition-colors">
            <ChevronLeft className="w-5 h-5 text-[#111827] stroke-[2.5]" />
          </button>
          <h1 className="text-[20px] font-bold text-[#111827]">Sold Items</h1>
        </div>

        {soldItems.length === 0 ? (
          <div className="text-center py-16 bg-white border border-[#ECECEC] rounded-[24px]">
            <CheckCircle2 className="w-10 h-10 text-[#B8A5E3] mx-auto mb-3" />
            <p className="font-bold text-[#111827]">No sold items yet</p>
            <p className="text-[12px] text-[#9CA3AF] mt-1">Items you mark as sold will appear here.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {soldItems.map((listing) => (
              <div key={listing._id} className="bg-white border border-[#ECECEC] rounded-[20px] p-4 flex gap-4">
                <div 
                  onClick={() => navigate(`/listing/${listing._id}`)}
                  className="w-20 h-20 bg-[#FAFAFF] rounded-[14px] overflow-hidden border border-[#E9E6F8]/70 flex-shrink-0 cursor-pointer"
                >
                  <img
                    src={listing.images?.[0] || '/images/file_00000000968c71f8895e41375cd51838.png'}
                    alt=""
                    className="w-full h-full object-cover"
                  />
                </div>
                <div 
                  onClick={() => navigate(`/listing/${listing._id}`)}
                  className="flex-1 min-w-0 flex flex-col justify-between cursor-pointer"
                >
                  <div>
                    <h4 className="font-bold text-[14px] text-[#111827] truncate">{listing.title}</h4>
                    <div className="flex flex-wrap items-center gap-1.5 mt-1">
                      <span className="text-[12px] font-bold text-[#111827]">
                        {listing.listingType === 'donate' ? 'Free' : `₹${listing.price}`}
                      </span>
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-rose-50 text-rose-600 border border-rose-100 uppercase tracking-wider">
                        Sold
                      </span>
                    </div>
                  </div>
                  <p className="text-[11px] text-[#9CA3AF] font-medium">Item marked as sold</p>
                </div>
                <div className="flex flex-col justify-between items-end flex-shrink-0">
                  <button
                    onClick={() => handleDelete(listing._id)}
                    className="w-8 h-8 rounded-full border border-[#ECECEC] flex items-center justify-center text-rose-500 hover:bg-rose-50 hover:border-rose-100 transition-colors"
                    title="Delete Listing"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  if (activeTab === 'saved') {
    return (
      <div className="max-w-[560px] mx-auto px-5 pt-2 pb-28 lg:pb-12">
        <div className="flex items-center gap-3 py-4 lg:py-6 border-b border-[#ECECEC] mb-5">
          <button onClick={() => setActiveTab(null)} className="w-9 h-9 rounded-full flex items-center justify-center hover:bg-[#F7F4FF] transition-colors">
            <ChevronLeft className="w-5 h-5 text-[#111827] stroke-[2.5]" />
          </button>
          <h1 className="text-[20px] font-bold text-[#111827]">Saved Items</h1>
        </div>

        {savedListings.length === 0 ? (
          <div className="text-center py-16 bg-white border border-[#ECECEC] rounded-[24px]">
            <Heart className="w-10 h-10 text-[#B8A5E3] mx-auto mb-3" />
            <p className="font-bold text-[#111827]">No saved items</p>
            <p className="text-[12px] text-[#9CA3AF] mt-1">Tap the heart icon on any listing to save it.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {savedListings.map((listing) => (
              <div key={listing._id} className="bg-white border border-[#ECECEC] rounded-[20px] p-4 flex gap-4">
                <div className="w-20 h-20 bg-[#FAFAFF] rounded-[14px] overflow-hidden border border-[#E9E6F8]/70 flex-shrink-0 cursor-pointer" onClick={() => navigate(`/listing/${listing._id}`)}>
                  <img src={listing.images?.[0] || '/images/file_00000000968c71f8895e41375cd51838.png'} alt="" className="w-full h-full object-cover" />
                </div>
                <div className="flex-1 min-w-0 flex flex-col justify-between cursor-pointer" onClick={() => navigate(`/listing/${listing._id}`)}>
                  <div>
                    <h4 className="font-bold text-[14px] text-[#111827] truncate hover:text-[#6D4AFF] transition-colors">{listing.title}</h4>
                    <p className="text-[12px] font-bold text-[#111827] mt-1">
                      {listing.listingType === 'donate' ? 'Free' : `₹${listing.price}`}
                    </p>
                  </div>
                  <p className="text-[11px] text-[#9CA3AF] truncate">{listing.sellerCollege}</p>
                </div>
                <div className="flex items-center justify-center flex-shrink-0">
                  <button
                    onClick={() => handleUnsave(listing._id)}
                    className="w-9 h-9 rounded-full bg-[#FFF0F0] text-rose-500 border border-rose-100 flex items-center justify-center hover:scale-105 active:scale-95 transition-all"
                    title="Unsave"
                  >
                    <Heart className="w-4 h-4 fill-rose-500 stroke-none" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  if (activeTab === 'donations') {
    const myDonations = myListings.filter(l => l.listingType === 'donate');
    return (
      <div className="max-w-[560px] mx-auto px-5 pt-2 pb-28 lg:pb-12">
        <div className="flex items-center gap-3 py-4 lg:py-6 border-b border-[#ECECEC] mb-5">
          <button onClick={() => setActiveTab(null)} className="w-9 h-9 rounded-full flex items-center justify-center hover:bg-[#F7F4FF] transition-colors">
            <ChevronLeft className="w-5 h-5 text-[#111827] stroke-[2.5]" />
          </button>
          <h1 className="text-[20px] font-bold text-[#111827]">My Donations</h1>
        </div>

        {myDonations.length === 0 ? (
          <div className="text-center py-16 bg-white border border-[#ECECEC] rounded-[24px]">
            <Gift className="w-10 h-10 text-[#B8A5E3] mx-auto mb-3" />
            <p className="font-bold text-[#111827]">No donations yet</p>
            <p className="text-[12px] text-[#9CA3AF] mt-1">Items you list as "Donate" will appear here.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {myDonations.map((listing) => (
              <div key={listing._id} className="bg-white border border-[#ECECEC] rounded-[20px] p-4 flex gap-4 cursor-pointer" onClick={() => navigate(`/listing/${listing._id}`)}>
                <div className="w-20 h-20 bg-[#FAFAFF] rounded-[14px] overflow-hidden border border-[#E9E6F8]/70 flex-shrink-0">
                  <img src={listing.images?.[0] || '/images/file_00000000968c71f8895e41375cd51838.png'} alt="" className="w-full h-full object-cover" />
                </div>
                <div className="flex-1 min-w-0 flex flex-col justify-between">
                  <div>
                    <h4 className="font-bold text-[14px] text-[#111827] truncate">{listing.title}</h4>
                    <span className="inline-block text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[#F4F1FF] text-[#6D4AFF] mt-1">
                      Donation
                    </span>
                  </div>
                  <p className="text-[11px] text-[#9CA3AF]">{listing.sellerCollege}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="max-w-[560px] mx-auto px-5 pt-2 pb-28 lg:pb-12">

      {/* ═══════════════════════════════════════
          PAGE HEADER (mobile)
          ═══════════════════════════════════════ */}
      <div className="flex items-center justify-between py-4 lg:py-6">
        <h1 className="text-[22px] lg:text-[26px] font-bold text-[#111827]">Profile</h1>
        <div className="flex items-center gap-1">
          <button 
            onClick={() => showToast('Profile settings are managed by campus administration.', 'info')}
            className="w-9 h-9 rounded-full flex items-center justify-center text-[#111827] hover:bg-[#F7F4FF] transition-colors"
          >
            <Settings className="w-[20px] h-[20px] stroke-[1.8]" />
          </button>
          <button 
            onClick={() => showToast('You have no new notifications.', 'info')}
            className="relative w-9 h-9 rounded-full flex items-center justify-center text-[#111827] hover:bg-[#F7F4FF] transition-colors"
          >
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
            <button 
              onClick={() => setShowInfoModal(true)}
              className="inline-flex items-center gap-1.5 mt-3 px-4 py-[6px] border border-[#ECECEC] rounded-full text-[12px] font-semibold text-[#111827] hover:bg-[#F7F4FF] hover:border-[#D9D5EC] transition-all active:scale-[0.97]"
            >
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
          { icon: Package, value: activeItems.length, label: 'Listings', color: 'text-[#6D4AFF]', key: 'listings' },
          { icon: Heart, value: savedListings.length, label: 'Saved', color: 'text-[#6D4AFF]', key: 'saved' },
          { icon: Gift, value: donationCount, label: 'Donations', color: 'text-[#6D4AFF]', key: 'donations' },
        ].map((stat) => (
          <button key={stat.label} onClick={() => setActiveTab(stat.key)} className="flex flex-col items-center py-4 gap-1 hover:bg-[#FAFAFF] transition-colors">
            <div className="flex items-center gap-1.5">
              <stat.icon className={`w-[16px] h-[16px] ${stat.color} stroke-[1.8]`} />
              <span className="text-[16px] font-bold text-[#111827]">{stat.value}</span>
            </div>
            <span className="text-[11px] text-[#9CA3AF] font-medium">{stat.label}</span>
          </button>
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
            sub: 'Manage your active items',
            count: activeItems.length,
            key: 'listings',
          },
          {
            icon: CheckCircle2,
            iconBg: 'bg-[#F0FDF4]',
            iconColor: 'text-emerald-500',
            title: 'Sold Items',
            sub: 'View items you have sold',
            count: soldItems.length,
            key: 'sold',
          },
          {
            icon: Heart,
            iconBg: 'bg-[#FFF4ED]',
            iconColor: 'text-orange-400',
            title: 'Saved Items',
            sub: 'Items you have saved',
            count: savedListings.length,
            key: 'saved',
          },
          {
            icon: Gift,
            iconBg: 'bg-[#FFF0F0]',
            iconColor: 'text-rose-400',
            title: 'My Donations',
            sub: 'Items you donated',
            count: donationCount,
            key: 'donations',
          },
        ].map((item) => (
          <button
            key={item.title}
            onClick={() => setActiveTab(item.key)}
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
        <button 
          onClick={() => setShowInfoModal(true)}
          className="w-full flex items-center gap-4 px-5 py-4 hover:bg-[#FAFAFF] transition-colors text-left group"
        >
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

      {/* ═══════════════════════════════════════
          PERSONAL INFO MODAL
          ═══════════════════════════════════════ */}
      {showInfoModal && (
        <div className="fixed inset-0 bg-[#111827]/40 backdrop-blur-sm flex items-center justify-center z-50 p-5">
          <div className="bg-white rounded-[28px] border border-[#ECECEC] w-full max-w-[400px] overflow-hidden shadow-xl animate-in fade-in zoom-in duration-200">
            {/* Header */}
            <div className="px-6 py-5 border-b border-[#ECECEC] flex items-center justify-between">
              <h3 className="font-bold text-[16px] text-[#111827]">Personal Information</h3>
              <button 
                onClick={() => setShowInfoModal(false)}
                className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-[#F7F4FF] text-[#9CA3AF] hover:text-[#111827] transition-colors"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>
            
            {/* Body */}
            <div className="p-6 flex flex-col gap-4">
              {[
                { label: 'Full Name', value: user?.fullName },
                { label: 'Email Address', value: user?.email },
                { label: 'Registration Number', value: user?.registrationNumber },
                { label: 'WhatsApp Number', value: user?.whatsappNumber },
                { label: 'Department / Year', value: `${user?.department} / ${user?.year}` },
                { label: 'College Campus', value: user?.college },
              ].map((item) => (
                <div key={item.label}>
                  <span className="text-[10px] font-bold text-[#9CA3AF] uppercase tracking-wider block mb-0.5">{item.label}</span>
                  <span className="text-[13px] font-semibold text-[#111827] block leading-normal">{item.value || 'N/A'}</span>
                </div>
              ))}
            </div>
            
            {/* Footer */}
            <div className="px-6 py-4 bg-[#FAFAFF] border-t border-[#ECECEC] flex justify-end">
              <button 
                onClick={() => setShowInfoModal(false)}
                className="px-5 py-2 bg-[#6D4AFF] hover:bg-[#5939D5] text-white font-bold text-[12px] rounded-full transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default Profile;
