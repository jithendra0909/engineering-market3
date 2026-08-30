import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  User as UserIcon, ShieldCheck, ShieldAlert, Camera, MapPin,
  Tag, Heart, Gift, LogOut, ChevronRight, ChevronLeft, Clock, XCircle,
  Package, Settings, Bell, Pen, BadgeCheck, Trash2, CheckCircle2, RefreshCw,
  ClipboardList, LayoutDashboard
} from 'lucide-react';
import api from '../api/axios';
import './Profile.css';

const DEPARTMENTS = [
  'Computer Science and Engineering',
  'Electronics and Communication Engineering',
  'Electrical Engineering',
  'Mechanical Engineering',
  'Civil Engineering',
  'Information Technology',
  'Chemical Engineering',
  'Other'
];

const YEARS = ['1st Year', '2nd Year', '3rd Year', '4th Year'];

export const Profile = () => {
  const { user, logout, isVerified, showToast, unreadNotificationsCount, colleges, updateProfile, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [myListings, setMyListings] = useState([]);
  const [savedListings, setSavedListings] = useState([]);
  const [activeTab, setActiveTab] = useState(null); // 'listings', 'saved', 'donations', 'sold'
  const [showInfoModal, setShowInfoModal] = useState(false);
  const [loading, setLoading] = useState(true);

  // Profile Form States
  const [editName, setEditName] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editWhatsapp, setEditWhatsapp] = useState('');
  const [editRegNo, setEditRegNo] = useState('');
  const [editDept, setEditDept] = useState('');
  const [editYear, setEditYear] = useState('1st Year');
  const [editCollege, setEditCollege] = useState('');
  const [editIdCardFile, setEditIdCardFile] = useState(null);
  const [editIdCardPreview, setEditIdCardPreview] = useState('');
  const [saveLoading, setSaveLoading] = useState(false);
  const [editError, setEditError] = useState('');

  useEffect(() => {
    if (showInfoModal && user) {
      setEditName(user.fullName || '');
      setEditEmail(user.email || '');
      const digitsOnly = user.whatsappNumber?.replace(/^\+91\s?/, '') || '';
      setEditWhatsapp(digitsOnly);
      setEditRegNo(user.registrationNumber || '');
      setEditDept(user.department || '');
      setEditYear(user.year || '1st Year');
      setEditCollege(user.college || '');
      setEditIdCardPreview(user.idCardImageUrl || '');
      setEditIdCardFile(null);
      setEditError('');
    }
  }, [showInfoModal, user]);

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setEditError('');

    if (!editName || !editEmail || !editWhatsapp || !editRegNo || !editDept || !editYear || !editCollege) {
      setEditError('Please fill in all fields.');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.(edu\.in|com)$/i;
    if (!emailRegex.test(editEmail)) {
      setEditError('Email must end with .edu.in or .com.');
      return;
    }

    if (editWhatsapp.length !== 10) {
      setEditError('WhatsApp number must be exactly 10 digits.');
      return;
    }

    setSaveLoading(true);
    try {
      const formData = new FormData();
      formData.append('fullName', editName);
      formData.append('email', editEmail);
      formData.append('whatsappNumber', '+91' + editWhatsapp);
      formData.append('registrationNumber', editRegNo);
      formData.append('department', editDept);
      formData.append('year', editYear);
      formData.append('college', editCollege);

      if (editIdCardFile) {
        const compressImage = (file) => {
          return new Promise((resolve) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = (event) => {
              const img = new Image();
              img.src = event.target.result;
              img.onload = () => {
                const canvas = document.createElement('canvas');
                const MAX_WIDTH = 1200;
                const MAX_HEIGHT = 1200;
                let width = img.width;
                let height = img.height;

                if (width > height) {
                  if (width > MAX_WIDTH) {
                    height *= MAX_WIDTH / width;
                    width = MAX_WIDTH;
                  }
                } else {
                  if (height > MAX_HEIGHT) {
                    width *= MAX_HEIGHT / height;
                    height = MAX_HEIGHT;
                  }
                }

                canvas.width = width;
                canvas.height = height;
                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0, width, height);
                canvas.toBlob((blob) => {
                  const compressedFile = new File([blob], file.name.replace(/\.[^/.]+$/, "") + ".jpg", {
                    type: 'image/jpeg',
                    lastModified: Date.now()
                  });
                  resolve(compressedFile);
                }, 'image/jpeg', 0.7);
              };
            };
          });
        };

        const compressed = await compressImage(editIdCardFile);
        formData.append('idCardImage', compressed);
      }

      const { data } = await api.put('/auth/profile', formData, {
        headers: { 'Content-Type': undefined }
      });

      updateProfile(data);
      showToast('Profile updated successfully!', 'success');
      setShowInfoModal(false);
    } catch (err) {
      console.error('Error saving profile:', err);
      setEditError(err.response?.data?.message || 'Failed to update profile.');
    } finally {
      setSaveLoading(false);
    }
  };

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

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getStatusConfig = () => {
    const status = user?.verificationStatus || 'pending';
    switch (status) {
      case 'approved':
        return { icon: ShieldCheck, label: 'Verified', color: '#059669', bg: '#EEF9F2', border: '#a7f3d0', bannerText: 'Your account is verified', bannerSub: 'You can now buy, sell, donate and connect with other students.' };
      case 'rejected':
        return { icon: XCircle, label: 'Restricted', color: '#e11d48', bg: '#fff1f2', border: '#ffe4e6', bannerText: 'Account Restricted', bannerSub: 'Your account access has been restricted. Please contact support.' };
      default:
        return { icon: Clock, label: 'Pending', color: '#d97706', bg: '#fffbeb', border: '#fde68a', bannerText: 'Verification pending', bannerSub: 'Your student account is being reviewed by the admin team.' };
    }
  };

  const statusConfig = getStatusConfig();
  const StatusIcon = statusConfig.icon;

  if (activeTab === 'listings') {
    return (
      <div className="profile-subview-container">
        <div className="profile-subview-header">
          <button onClick={() => setActiveTab(null)} className="profile-icon-btn">
            <ChevronLeft style={{ width: '20px', height: '20px', color: '#111827', strokeWidth: 2.5 }} />
          </button>
          <h1 className="profile-subview-title">My Listings</h1>
        </div>

        {activeItems.length === 0 ? (
          <div className="profile-empty-state">
            <Tag className="profile-empty-icon" />
            <p className="profile-empty-title">No active listings</p>
            <p className="profile-empty-sub">Your active listings for sale or donation will appear here.</p>
          </div>
        ) : (
          <div className="profile-items-list">
            {activeItems.map((listing) => {
              const daysLeft = listing.expiresAt
                ? Math.ceil((new Date(listing.expiresAt) - new Date()) / (1000 * 60 * 60 * 24))
                : 30;
              const expired = daysLeft <= 0;

              return (
                <div key={listing._id} className="profile-item-card">
                  <div 
                    onClick={() => navigate(`/listing/${listing._id}`)}
                    className="profile-item-img-box"
                  >
                    <img
                      src={listing.images?.[0] || '/images/file_00000000968c71f8895e41375cd51838.png'}
                      alt=""
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                  </div>

                  <div 
                    onClick={() => navigate(`/listing/${listing._id}`)}
                    className="profile-item-details"
                  >
                    <div>
                      <h4 className="profile-item-title">{listing.title}</h4>
                      <div className="profile-item-meta">
                        <span className="profile-item-price">
                          {listing.listingType === 'donate' ? 'Free' : `₹${listing.price}`}
                        </span>
                        <span className={`profile-item-badge ${listing.status === 'sold' ? 'sold' : 'available'}`}>
                          {listing.status}
                        </span>
                        {expired && listing.status === 'available' && (
                          <span className="profile-item-badge expired">
                            Expired
                          </span>
                        )}
                      </div>
                    </div>

                    <p className="profile-item-status-text" style={{ color: expired && listing.status === 'available' ? '#e11d48' : '#9CA3AF' }}>
                      {listing.status === 'sold'
                        ? 'Item marked as sold'
                        : (expired
                          ? 'Expired - Hidden from public feed'
                          : `Expires in ${daysLeft} days`
                        )
                      }
                    </p>
                  </div>

                  <div className="profile-item-actions">
                    <button
                      onClick={() => handleDelete(listing._id)}
                      className="profile-icon-btn"
                      style={{ border: '1px solid #ECECEC' }}
                      title="Delete Listing"
                    >
                      <Trash2 style={{ width: '14px', height: '14px', color: '#f43f5e' }} />
                    </button>

                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      {listing.status === 'available' && (
                        <button
                          onClick={() => handleMarkSold(listing._id)}
                          style={{ padding: '6px 12px', backgroundColor: '#EEF9F2', color: '#059669', border: '1px solid #a7f3d0', borderRadius: '9999px', fontSize: '11px', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
                        >
                          <CheckCircle2 style={{ width: '14px', height: '14px' }} /> Mark Sold
                        </button>
                      )}

                      {listing.status === 'available' && (
                        <button
                          onClick={() => handleRenew(listing._id)}
                          style={{ padding: '6px 12px', borderRadius: '9999px', fontSize: '11px', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', backgroundColor: expired ? '#6D4AFF' : '#F7F4FF', color: expired ? '#ffffff' : '#6D4AFF', border: expired ? 'none' : '1px solid #E8E0F8' }}
                        >
                          <RefreshCw style={{ width: '12px', height: '12px' }} /> Renew
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
      <div className="profile-subview-container">
        <div className="profile-subview-header">
          <button onClick={() => setActiveTab(null)} className="profile-icon-btn">
            <ChevronLeft style={{ width: '20px', height: '20px', color: '#111827', strokeWidth: 2.5 }} />
          </button>
          <h1 className="profile-subview-title">Sold Items</h1>
        </div>

        {soldItems.length === 0 ? (
          <div className="profile-empty-state">
            <CheckCircle2 className="profile-empty-icon" />
            <p className="profile-empty-title">No sold items yet</p>
            <p className="profile-empty-sub">Items you mark as sold will appear here.</p>
          </div>
        ) : (
          <div className="profile-items-list">
            {soldItems.map((listing) => (
              <div key={listing._id} className="profile-item-card">
                <div 
                  onClick={() => navigate(`/listing/${listing._id}`)}
                  className="profile-item-img-box"
                >
                  <img
                    src={listing.images?.[0] || '/images/file_00000000968c71f8895e41375cd51838.png'}
                    alt=""
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                </div>
                <div 
                  onClick={() => navigate(`/listing/${listing._id}`)}
                  className="profile-item-details"
                >
                  <div>
                    <h4 className="profile-item-title">{listing.title}</h4>
                    <div className="profile-item-meta">
                      <span className="profile-item-price">
                        {listing.listingType === 'donate' ? 'Free' : `₹${listing.price}`}
                      </span>
                      <span className="profile-item-badge sold">
                        Sold
                      </span>
                    </div>
                  </div>
                  <p className="profile-item-status-text">Item marked as sold</p>
                </div>
                <div className="profile-item-actions">
                  <button
                    onClick={() => handleDelete(listing._id)}
                    className="profile-icon-btn"
                    style={{ border: '1px solid #ECECEC' }}
                    title="Delete Listing"
                  >
                    <Trash2 style={{ width: '14px', height: '14px', color: '#f43f5e' }} />
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
      <div className="profile-subview-container">
        <div className="profile-subview-header">
          <button onClick={() => setActiveTab(null)} className="profile-icon-btn">
            <ChevronLeft style={{ width: '20px', height: '20px', color: '#111827', strokeWidth: 2.5 }} />
          </button>
          <h1 className="profile-subview-title">Saved Items</h1>
        </div>

        {savedListings.length === 0 ? (
          <div className="profile-empty-state">
            <Heart className="profile-empty-icon" />
            <p className="profile-empty-title">No saved items</p>
            <p className="profile-empty-sub">Tap the heart icon on any listing to save it.</p>
          </div>
        ) : (
          <div className="profile-items-list">
            {savedListings.map((listing) => (
              <div key={listing._id} className="profile-item-card">
                <div className="profile-item-img-box" onClick={() => navigate(`/listing/${listing._id}`)}>
                  <img src={listing.images?.[0] || '/images/file_00000000968c71f8895e41375cd51838.png'} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
                <div className="profile-item-details" onClick={() => navigate(`/listing/${listing._id}`)}>
                  <div>
                    <h4 className="profile-item-title">{listing.title}</h4>
                    <p className="profile-item-price" style={{ marginTop: '4px' }}>
                      {listing.listingType === 'donate' ? 'Free' : `₹${listing.price}`}
                    </p>
                  </div>
                  <p className="profile-item-status-text">{listing.sellerCollege}</p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <button
                    onClick={() => handleUnsave(listing._id)}
                    style={{ width: '36px', height: '36px', borderRadius: '9999px', backgroundColor: '#FFF0F0', color: '#f43f5e', border: '1px solid #ffe4e6', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
                    title="Unsave"
                  >
                    <Heart style={{ width: '16px', height: '16px', fill: '#f43f5e', stroke: 'none' }} />
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
      <div className="profile-subview-container">
        <div className="profile-subview-header">
          <button onClick={() => setActiveTab(null)} className="profile-icon-btn">
            <ChevronLeft style={{ width: '20px', height: '20px', color: '#111827', strokeWidth: 2.5 }} />
          </button>
          <h1 className="profile-subview-title">My Donations</h1>
        </div>

        {myDonations.length === 0 ? (
          <div className="profile-empty-state">
            <Gift className="profile-empty-icon" />
            <p className="profile-empty-title">No donations yet</p>
            <p className="profile-empty-sub">Items you list as "Donate" will appear here.</p>
          </div>
        ) : (
          <div className="profile-items-list">
            {myDonations.map((listing) => (
              <div key={listing._id} className="profile-item-card" onClick={() => navigate(`/listing/${listing._id}`)}>
                <div className="profile-item-img-box">
                  <img src={listing.images?.[0] || '/images/file_00000000968c71f8895e41375cd51838.png'} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
                <div className="profile-item-details">
                  <div>
                    <h4 className="profile-item-title">{listing.title}</h4>
                    <span style={{ display: 'inline-block', fontSize: '10px', fontWeight: 600, padding: '2px 8px', borderRadius: '9999px', backgroundColor: '#F4F1FF', color: '#6D4AFF', marginTop: '4px' }}>
                      Donation
                    </span>
                  </div>
                  <p className="profile-item-status-text">{listing.sellerCollege}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="profile-page-container">

      {/* PAGE HEADER */}
      <div className="profile-header-bar">
        <h1 className="profile-header-title">Profile</h1>
        <div className="profile-header-actions">
          <button 
            onClick={() => showToast('Profile settings are managed by campus administration.', 'info')}
            className="profile-icon-btn"
          >
            <Settings style={{ width: '20px', height: '20px', strokeWidth: 1.8 }} />
          </button>
          <button 
            onClick={() => navigate('/notifications')}
            className="profile-icon-btn"
          >
            <Bell style={{ width: '20px', height: '20px', strokeWidth: 1.8 }} />
            {unreadNotificationsCount > 0 && (
              <span className="profile-badge-dot" />
            )}
          </button>
        </div>
      </div>

      {/* PROFILE CARD */}
      <div className="profile-card">
        <div className="profile-card-content">

          {/* Avatar */}
          <div className="profile-avatar-wrapper">
            <div className="profile-avatar-img-box">
              {user?.profileImageUrl ? (
                <img src={user.profileImageUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                <UserIcon style={{ width: '36px', height: '36px', color: '#B8A5E3', strokeWidth: 1.5 }} />
              )}
            </div>
            <button className="profile-camera-btn">
              <Camera style={{ width: '13px', height: '13px', color: '#6B7280', strokeWidth: 2 }} />
            </button>
          </div>

          {/* User info */}
          <div className="profile-user-info">
            <div className="profile-name-row">
              <h2 className="profile-user-name">{user?.fullName}</h2>
              {isVerified && (
                <BadgeCheck style={{ width: '18px', height: '18px', color: '#6D4AFF', fill: '#6D4AFF', flexShrink: 0 }} />
              )}
            </div>
            <p className="profile-user-dept">{user?.department} • {user?.year}</p>
            <div className="profile-user-location">
              <MapPin style={{ width: '13px', height: '13px', color: '#9CA3AF', strokeWidth: 2, flexShrink: 0 }} />
              <p style={{ fontSize: '12px', color: '#9CA3AF', margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user?.college}</p>
            </div>

            {/* Edit Profile button */}
            <button 
              onClick={() => setShowInfoModal(true)}
              className="profile-edit-btn"
            >
              <Pen style={{ width: '12px', height: '12px', strokeWidth: 2 }} />
              Edit Profile
            </button>
          </div>

          <ChevronRight style={{ width: '20px', height: '20px', color: '#D1D5DB', flexShrink: 0, marginTop: '4px' }} />
        </div>
      </div>

      {/* STATS ROW */}
      <div className="profile-stats-row">
        {[
          { icon: Package, value: activeItems.length, label: 'Listings', key: 'listings' },
          { icon: Heart, value: savedListings.length, label: 'Saved', key: 'saved' },
          { icon: Gift, value: donationCount, label: 'Donations', key: 'donations' },
        ].map((stat) => (
          <button key={stat.label} onClick={() => setActiveTab(stat.key)} className="profile-stat-btn">
            <div className="profile-stat-header">
              <stat.icon style={{ width: '16px', height: '16px', color: '#6D4AFF', strokeWidth: 1.8 }} />
              <span className="profile-stat-val">{stat.value}</span>
            </div>
            <span className="profile-stat-label">{stat.label}</span>
          </button>
        ))}
      </div>

      {/* VERIFICATION BANNER */}
      <div className="profile-verification-banner" style={{ backgroundColor: isVerified ? '#F7F4FF' : statusConfig.bg, borderColor: isVerified ? '#E8E0F8' : statusConfig.border }}>
        <div style={{ width: '2.75rem', height: '2.75rem', borderRadius: '9999px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, backgroundColor: isVerified ? '#E8E0F8' : statusConfig.bg }}>
          <StatusIcon style={{ width: '20px', height: '20px', color: statusConfig.color, strokeWidth: 1.8 }} />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{ fontSize: '14px', fontWeight: 700, color: '#111827', margin: 0 }}>{statusConfig.bannerText}</p>
          <p style={{ fontSize: '11px', color: '#6B7280', marginTop: '2px', lineHeight: 1.625, margin: 0 }}>{statusConfig.bannerSub}</p>
        </div>
        {isVerified && (
          <div style={{ position: 'relative', width: '3.5rem', height: '3.5rem', flexShrink: 0 }}>
            <img
              src="/images/graduation-cap-3d.png"
              alt="Verified"
              style={{ width: '100%', height: '100%', objectFit: 'contain' }}
              onError={(e) => { e.target.style.display = 'none'; }}
            />
            <div style={{ position: 'absolute', bottom: '-4px', right: '-4px', width: '1.25rem', height: '1.25rem', backgroundColor: '#10b981', borderRadius: '9999px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <ShieldCheck style={{ width: '12px', height: '12px', color: '#ffffff', strokeWidth: 2.5 }} />
            </div>
          </div>
        )}
      </div>

      {/* MY ACTIVITY */}
      <h3 className="profile-activity-section-title">My Activity</h3>
      <div className="profile-activity-list">
        {[
          {
            icon: ClipboardList,
            iconBg: '#F3EFFF',
            iconColor: '#6C4EFF',
            title: 'My Orders',
            sub: 'Track and view your print requests',
            action: () => navigate('/orders'),
          },
          {
            icon: Tag,
            iconBg: '#EEF9F2',
            iconColor: '#059669',
            title: 'My Listings',
            sub: 'Manage your active items',
            count: activeItems.length,
            key: 'listings',
          },
          {
            icon: CheckCircle2,
            iconBg: '#F0FDF4',
            iconColor: '#10b981',
            title: 'Sold Items',
            sub: 'View items you have sold',
            count: soldItems.length,
            key: 'sold',
          },
          {
            icon: Heart,
            iconBg: '#FFF4ED',
            iconColor: '#fb923c',
            title: 'Saved Items',
            sub: 'Items you have saved',
            count: savedListings.length,
            key: 'saved',
          },
          {
            icon: Gift,
            iconBg: '#FFF0F0',
            iconColor: '#fb7185',
            title: 'My Donations',
            sub: 'Items you donated',
            count: donationCount,
            key: 'donations',
          },
        ].map((item) => (
          <button
            key={item.title}
            onClick={() => {
              if (item.action) {
                item.action();
              } else {
                setActiveTab(item.key);
              }
            }}
            className="profile-activity-item"
          >
            <div className="profile-activity-icon-box" style={{ backgroundColor: item.iconBg }}>
              <item.icon style={{ width: '18px', height: '18px', color: item.iconColor, strokeWidth: 1.8 }} />
            </div>
            <div className="profile-activity-info">
              <p className="profile-activity-title">{item.title}</p>
              <p className="profile-activity-sub">{item.sub}</p>
            </div>
            <ChevronRight style={{ width: '18px', height: '18px', color: '#D1D5DB', flexShrink: 0 }} />
          </button>
        ))}
      </div>

      {/* ADMIN CONTROLS */}
      {(isAdmin || user?.role === 'admin') && (
        <>
          <h3 className="profile-activity-section-title">Admin Controls</h3>
          <div className="profile-activity-list">
            <button 
              onClick={() => navigate('/admin/dashboard')}
              className="profile-activity-item"
            >
              <div className="profile-activity-icon-box" style={{ backgroundColor: '#FAF9FF', border: '1px solid rgba(108,78,255,0.15)' }}>
                <LayoutDashboard style={{ width: '18px', height: '18px', color: '#6C4EFF', strokeWidth: 1.8 }} />
              </div>
              <div className="profile-activity-info">
                <p className="profile-activity-title">System Admin Dashboard</p>
                <p className="profile-activity-sub">Verify users, manage listings & view logs</p>
              </div>
              <ChevronRight style={{ width: '18px', height: '18px', color: '#D1D5DB', flexShrink: 0 }} />
            </button>

            <button 
              onClick={() => navigate('/vendors/print-dashboard')}
              className="profile-activity-item"
            >
              <div className="profile-activity-icon-box" style={{ backgroundColor: '#FAF9FF', border: '1px solid rgba(109,93,246,0.15)' }}>
                <ClipboardList style={{ width: '18px', height: '18px', color: '#6D5DF6', strokeWidth: 1.8 }} />
              </div>
              <div className="profile-activity-info">
                <p className="profile-activity-title">Print Shop Dashboard</p>
                <p className="profile-activity-sub">Verify payments, download prints & checkouts</p>
              </div>
              <ChevronRight style={{ width: '18px', height: '18px', color: '#D1D5DB', flexShrink: 0 }} />
            </button>
          </div>
        </>
      )}

      {/* ACCOUNT */}
      <h3 className="profile-activity-section-title">Account</h3>
      <div className="profile-activity-list">
        <button 
          onClick={() => setShowInfoModal(true)}
          className="profile-activity-item"
        >
          <div className="profile-activity-icon-box" style={{ backgroundColor: '#F7F4FF' }}>
            <UserIcon style={{ width: '18px', height: '18px', color: '#6D4AFF', strokeWidth: 1.8 }} />
          </div>
          <div className="profile-activity-info">
            <p className="profile-activity-title">Personal Information</p>
            <p className="profile-activity-sub">Name, email, phone & more</p>
          </div>
          <ChevronRight style={{ width: '18px', height: '18px', color: '#D1D5DB', flexShrink: 0 }} />
        </button>

        <button
          onClick={handleLogout}
          className="profile-activity-item"
        >
          <div className="profile-activity-icon-box" style={{ backgroundColor: '#fff1f2' }}>
            <LogOut style={{ width: '18px', height: '18px', color: '#f43f5e', strokeWidth: 1.8 }} />
          </div>
          <div className="profile-activity-info">
            <p className="profile-activity-title" style={{ color: '#e11d48' }}>Log Out</p>
            <p className="profile-activity-sub">Sign out of your account</p>
          </div>
        </button>
      </div>

      {/* PERSONAL INFO MODAL */}
      {showInfoModal && (
        <div className="profile-modal-overlay">
          <div className="profile-modal-content animate-scaleIn">
            <div className="profile-modal-header">
              <h3 className="profile-modal-title">Edit Profile Details</h3>
              <button 
                onClick={() => setShowInfoModal(false)}
                className="profile-icon-btn"
              >
                <XCircle style={{ width: '20px', height: '20px', color: '#9CA3AF' }} />
              </button>
            </div>
            
            <form onSubmit={handleSaveProfile}>
              <div className="profile-modal-body">
                {editError && (
                  <div style={{ padding: '0.75rem', backgroundColor: '#fff1f2', border: '1px solid #ffe4e6', borderRadius: '12px', color: '#e11d48', fontSize: '12px', fontWeight: 500 }}>
                    {editError}
                  </div>
                )}

                {/* Full Name */}
                <div>
                  <label className="auth-label">Full Name</label>
                  <input
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    placeholder="John Doe"
                    className="auth-input"
                  />
                </div>

                {/* Email Address */}
                <div>
                  <label className="auth-label">Email Address</label>
                  <input
                    type="email"
                    value={editEmail}
                    onChange={(e) => setEditEmail(e.target.value)}
                    placeholder="user@domain.com"
                    className="auth-input"
                  />
                </div>

                {/* WhatsApp Number */}
                <div>
                  <label className="auth-label">WhatsApp Number</label>
                  <div className="auth-input-wrapper">
                    <span style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', fontSize: '13px', fontWeight: 700, color: '#111827' }}>+91</span>
                    <input
                      type="tel"
                      value={editWhatsapp}
                      onChange={(e) => setEditWhatsapp(e.target.value.replace(/\D/g, '').slice(0, 10))}
                      placeholder="9876543210"
                      className="auth-input"
                      style={{ paddingLeft: '3.5rem' }}
                    />
                  </div>
                </div>

                {/* Registration Number */}
                <div>
                  <label className="auth-label">Registration Number</label>
                  <input
                    type="text"
                    value={editRegNo}
                    onChange={(e) => setEditRegNo(e.target.value)}
                    placeholder="21BCE0001"
                    className="auth-input"
                  />
                </div>

                {/* Department + Year */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.75rem' }}>
                  <div>
                    <label className="auth-label">Department</label>
                    <select
                      value={editDept}
                      onChange={(e) => setEditDept(e.target.value)}
                      className="auth-input"
                      style={{ cursor: 'pointer' }}
                    >
                      <option value="">Select</option>
                      {DEPARTMENTS.map((d) => <option key={d} value={d}>{d}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="auth-label">Year</label>
                    <select
                      value={editYear}
                      onChange={(e) => setEditYear(e.target.value)}
                      className="auth-input"
                      style={{ cursor: 'pointer' }}
                    >
                      {YEARS.map((y) => <option key={y} value={y}>{y}</option>)}
                    </select>
                  </div>
                </div>

                {/* College Campus */}
                <div>
                  <label className="auth-label">College Campus</label>
                  <select
                    value={editCollege}
                    onChange={(e) => setEditCollege(e.target.value)}
                    className="auth-input"
                    style={{ cursor: 'pointer' }}
                  >
                    <option value="">Select your college</option>
                    {colleges && colleges.length > 0 ? (
                      colleges.map((c) => <option key={c._id || c.name} value={c.name}>{c.name}</option>)
                    ) : (
                      <option value="Vignan's Institute of Engineering for Women (VIEW)">Vignan's Institute of Engineering for Women (VIEW)</option>
                    )}
                  </select>
                </div>

                {/* ID Card Re-upload */}
                <div>
                  <label className="auth-label">
                    {editYear === '1st Year' 
                      ? 'College ID Card or Admission Fee Receipt / Allotment Order' 
                      : 'College ID Card (Upload new image for verification)'}
                  </label>
                  <label style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', border: '2px dashed #E9E6F8', borderRadius: '16px', padding: '1rem', cursor: 'pointer', backgroundColor: '#FAFAFF' }}>
                    {editIdCardPreview ? (
                      <img src={editIdCardPreview} alt="ID Preview" style={{ maxHeight: '120px', objectFit: 'contain', borderRadius: '10px' }} />
                    ) : (
                      <div style={{ textAlign: 'center', padding: '1rem 0', color: '#9CA3AF' }}>
                        <Camera style={{ width: '24px', height: '24px', margin: '0 auto 6px auto' }} />
                        <p style={{ fontSize: '11px', fontWeight: 600, margin: 0 }}>
                          {editYear === '1st Year'
                            ? 'Upload ID, fee receipt, or allotment order'
                            : 'Upload ID card'}
                        </p>
                      </div>
                    )}
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files[0];
                        if (file) {
                          setEditIdCardFile(file);
                          const reader = new FileReader();
                          reader.onloadend = () => setEditIdCardPreview(reader.result);
                          reader.readAsDataURL(file);
                        }
                      }}
                      style={{ display: 'none' }}
                    />
                  </label>
                </div>
              </div>
              
              {/* Footer */}
              <div className="profile-modal-footer">
                <button 
                  type="button"
                  onClick={() => setShowInfoModal(false)}
                  style={{ padding: '8px 16px', border: '1px solid #ECECEC', backgroundColor: '#ffffff', color: '#111827', fontWeight: 600, fontSize: '12px', borderRadius: '9999px', cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  disabled={saveLoading}
                  style={{ padding: '8px 20px', backgroundColor: '#6D4AFF', color: '#ffffff', fontWeight: 700, fontSize: '12px', borderRadius: '9999px', border: 'none', cursor: 'pointer', opacity: saveLoading ? 0.6 : 1 }}
                >
                  {saveLoading ? 'Saving...' : (user?.verificationStatus === 'rejected' ? 'Save & Re-verify' : 'Save Changes')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default Profile;
