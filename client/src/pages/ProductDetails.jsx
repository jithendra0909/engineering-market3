import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Phone, Heart, MapPin, Tag, GraduationCap, Clock, ChevronLeft, MessageCircle, Flag } from 'lucide-react';
import api from '../api/axios';
import VerificationRequiredModal from '../components/VerificationRequiredModal';
import './ProductDetails.css';

export const ProductDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isLoggedIn, isVerified, showToast } = useAuth();

  const [listing, setListing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedImg, setSelectedImg] = useState(0);
  const [isGateOpen, setIsGateOpen] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [reportReason, setReportReason] = useState('Inappropriate Image');
  const [reportNotes, setReportNotes] = useState('');
  const [reporting, setReporting] = useState(false);

  const WhatsAppIcon = (props) => (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M12.012 2c-5.506 0-9.989 4.478-9.99 9.984a9.96 9.96 0 0 0 1.333 4.982L2 22l5.233-1.371a9.994 9.994 0 0 0 4.779 1.21c5.507 0 9.99-4.479 9.991-9.985-.002-5.507-4.483-9.985-9.992-9.985zM6.83 16.967l-.318-.506a8.217 8.217 0 0 1-1.258-4.478c.001-4.529 3.69-8.214 8.222-8.214 4.53 0 8.217 3.687 8.219 8.217 0 4.53-3.69 8.215-8.222 8.215a8.204 8.204 0 0 1-4.183-1.139l-.3-.179-3.11.815.832-3.032zM15.485 13.6c-.282-.141-1.664-.82-1.921-.912-.257-.094-.443-.141-.63.141-.186.28-.724.912-.887 1.096-.164.183-.328.206-.61.064a7.81 7.81 0 0 1-2.274-1.402 8.602 8.602 0 0 1-1.573-1.956c-.163-.282-.017-.434.124-.575.127-.127.282-.328.423-.492a1.9 1.9 0 0 0 .282-.47c.093-.188.047-.352-.024-.493-.07-.141-.63-1.517-.863-2.079-.226-.546-.453-.47-.63-.478-.162-.008-.35-.01-.539-.01-.19 0-.498.07-.757.352-.26.282-.99.967-.99 2.359 0 1.391 1.012 2.735 1.153 2.923.142.188 1.993 3.044 4.829 4.265 2.836 1.22 2.836.814 3.344.767.509-.047 1.664-.678 1.899-1.334.234-.656.234-1.219.164-1.334-.07-.116-.257-.209-.539-.35z"/>
    </svg>
  );

  useEffect(() => {
    const fetchListing = async () => {
      try {
        const { data } = await api.get(`/listings/${id}`);
        setListing(data);
        if (user?.savedListings?.includes(data._id)) setIsSaved(true);
      } catch (err) {
        showToast('Failed to load listing', 'error');
        navigate('/');
      } finally {
        setLoading(false);
      }
    };
    fetchListing();
  }, [id]);

  const handleContact = async () => {
    if (!isLoggedIn || !isVerified) {
      setIsGateOpen(true);
      return;
    }
    
    const sellerId = listing.seller?._id || listing.seller;
    if (user?._id === sellerId) {
      showToast('This is your listing!', 'info');
      return;
    }

    try {
      const { data } = await api.post('/chats', { listingId: listing._id });
      navigate(`/chat?conversationId=${data._id}`);
    } catch (err) {
      const errMsg = err.response?.data?.message || 'Failed to contact seller';
      showToast(errMsg, 'error');
    }
  };

  const handleSave = async () => {
    if (!isLoggedIn) { navigate('/login'); return; }
    try {
      const { data } = await api.post(`/listings/${id}/save`);
      setIsSaved(data.saved);
      showToast(data.message, 'success');
    } catch { showToast('Failed to save', 'error'); }
  };

  const handleReport = async (e) => {
    e.preventDefault();
    if (!isLoggedIn) {
      navigate('/login');
      return;
    }
    setReporting(true);
    try {
      const reasonText = reportNotes.trim()
        ? `${reportReason} - ${reportNotes.trim()}`
        : reportReason;
        
      const { data } = await api.post(`/listings/${id}/report`, { reason: reasonText });
      showToast(data.message, 'success');
      setIsReportModalOpen(false);
      setListing(prev => ({
        ...prev,
        reports: [...(prev.reports || []), { reporter: user._id, reason: reasonText }]
      }));
    } catch (err) {
      const errMsg = err.response?.data?.message || 'Failed to submit report';
      showToast(errMsg, 'error');
    } finally {
      setReporting(false);
    }
  };

  if (loading) {
    return (
      <div className="details-page-container animate-pulse">
        <div style={{ height: '24px', width: '96px', backgroundColor: '#F4F1FF', borderRadius: '9999px', marginBottom: '1.5rem' }} />
        <div className="details-layout">
          <div className="details-gallery-col" style={{ aspectRatio: '1/1', backgroundColor: '#F4F1FF', borderRadius: '24px' }} />
          <div className="details-info-col" style={{ gap: '1rem' }}>
            <div style={{ height: '28px', backgroundColor: '#F4F1FF', borderRadius: '9999px', width: '75%' }} />
            <div style={{ height: '32px', backgroundColor: '#F4F1FF', borderRadius: '9999px', width: '25%' }} />
            <div style={{ height: '16px', backgroundColor: '#F4F1FF', borderRadius: '9999px', width: '100%' }} />
            <div style={{ height: '16px', backgroundColor: '#F4F1FF', borderRadius: '9999px', width: '66%' }} />
          </div>
        </div>
      </div>
    );
  }

  if (!listing) return null;

  const timeAgo = (date) => {
    const diff = Date.now() - new Date(date).getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    if (hours < 1) return 'Just now';
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  };

  return (
    <div className="details-page-container">

      {/* Back button */}
      <button
        onClick={() => navigate(-1)}
        className="details-back-btn"
      >
        <ChevronLeft style={{ width: '16px', height: '16px' }} /> Back
      </button>

      {/* Status banners */}
      {listing.isSold && (
        <div className="details-status-banner sold">
          <span>🏷️</span> This item has been sold and is no longer available.
        </div>
      )}
      {listing.isRemoved && (
        <div className="details-status-banner removed">
          <span>🚫</span> This listing has been removed.
        </div>
      )}
      {listing.isExpired && !listing.isSold && !listing.isRemoved && (
        <div className="details-status-banner expired">
          <span>⏰</span> This listing has expired. Contact the seller to check availability.
        </div>
      )}

      <div className="details-layout">
        {/* Left: Image gallery */}
        <div className="details-gallery-col">
          {/* Main image */}
          <div className="details-main-img-box">
            <img
              src={listing.images[selectedImg]}
              alt={listing.title}
              className="details-main-img"
            />
          </div>

          {/* Thumbnails */}
          {listing.images.length > 1 && (
            <div className="details-thumbs-list no-scrollbar">
              {listing.images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedImg(idx)}
                  className={`details-thumb-btn ${selectedImg === idx ? 'active' : ''}`}
                >
                  <img src={img} alt="" className="details-thumb-img" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right: Details */}
        <div className="details-info-col">
          {/* Category + Time */}
          <div className="details-meta-row">
            <span className="details-cat-pill">
              <Tag style={{ width: '12px', height: '12px' }} /> {listing.category}
            </span>
            <span className="details-time-pill">
              <Clock style={{ width: '12px', height: '12px' }} /> {timeAgo(listing.createdAt)}
            </span>
          </div>

          {/* Title */}
          <h1 className="details-title">
            {listing.title}
          </h1>

          {/* Price */}
          <p className="details-price">
            {listing.listingType === 'donate' ? (
              <span style={{ color: '#6C4EFF' }}>Free / Donation</span>
            ) : (
              `₹${listing.price}`
            )}
          </p>

          {/* Meta info */}
          <div className="details-chips-row">
            <span className="details-chip">
              <MapPin style={{ width: '14px', height: '14px', color: '#9CA3AF' }} /> {listing.sellerCollege}
            </span>
            <span className="details-chip">
              {listing.condition}
            </span>
            <span className="details-chip">
              {listing.marketType === 'college' ? (
                <><GraduationCap style={{ width: '14px', height: '14px', color: '#9CA3AF' }} /> College Market</>
              ) : (
                'General Market'
              )}
            </span>
          </div>

          {/* Description */}
          <div className="details-desc-box">
            <h3 className="details-desc-title">Description</h3>
            <p className="details-desc-text">
              {listing.description}
            </p>
          </div>

          {/* Seller card */}
          <div className="details-seller-card">
            <h3 className="details-seller-title">Seller</h3>
            <div className="details-seller-info">
              <div className="details-seller-avatar">
                {listing.seller?.profileImageUrl ? (
                  <img src={listing.seller.profileImageUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  listing.seller?.fullName?.charAt(0) || 'S'
                )}
              </div>
              <div>
                <p className="details-seller-name">{listing.seller?.fullName}</p>
                <p className="details-seller-sub">
                  {listing.seller?.department} · {listing.seller?.year}
                </p>
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="details-actions-row">
            {isLoggedIn && user?._id === (listing.seller?._id || listing.seller) ? (
              <button
                disabled
                className="details-chat-btn"
              >
                <MessageCircle style={{ width: '20px', height: '20px' }} /> Your Listing
              </button>
            ) : (
              <button
                onClick={handleContact}
                className="details-chat-btn"
              >
                <MessageCircle style={{ width: '20px', height: '20px' }} /> Chat with Seller
              </button>
            )}
            <button
              onClick={handleSave}
              className={`details-save-btn ${isSaved ? 'saved' : ''}`}
            >
              <Heart style={{ width: '20px', height: '20px', strokeWidth: 2, fill: isSaved ? '#6C4EFF' : 'none' }} />
            </button>
            <button
              onClick={() => setIsShareModalOpen(true)}
              className="details-wa-share-btn"
              title="Share to WhatsApp Group"
            >
              <WhatsAppIcon style={{ width: '20px', height: '20px' }} />
            </button>
          </div>

          {isLoggedIn && user?._id !== listing.seller?._id && (
            <div className="details-report-wrapper">
              <button
                onClick={() => setIsReportModalOpen(true)}
                disabled={listing.reports?.some(r => r.reporter === user?._id || r.reporter?._id === user?._id)}
                className={`details-report-btn ${
                  listing.reports?.some(r => r.reporter === user?._id || r.reporter?._id === user?._id) ? 'reported' : ''
                }`}
              >
                <Flag style={{ width: '14px', height: '14px' }} />
                {listing.reports?.some(r => r.reporter === user?._id || r.reporter?._id === user?._id)
                  ? 'You have reported this item'
                  : 'Report this listing'}
              </button>
            </div>
          )}
        </div>
      </div>

      <VerificationRequiredModal isOpen={isGateOpen} onClose={() => setIsGateOpen(false)} />

      {/* WhatsApp Share Preview Modal */}
      {isShareModalOpen && (() => {
        const shareText = `📢 *Engineering Market Listing*

*Product:* ${listing.title}
*Price:* ${listing.listingType === 'donate' ? 'Free / Donation' : `₹${listing.price}`}
*Condition:* ${listing.condition}
*College:* ${listing.sellerCollege}

*Description:* ${listing.description.slice(0, 150)}${listing.description.length > 150 ? '...' : ''}

🔗 *View details here:* ${window.location.href}`;

        return (
          <div style={{ position: 'fixed', inset: 0, zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
            <div style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }} onClick={() => setIsShareModalOpen(false)} />
            <div style={{ position: 'relative', width: '100%', maxWidth: '440px', backgroundColor: '#ffffff', borderRadius: '24px', overflow: 'hidden', padding: '1.5rem', zIndex: 10, display: 'flex', flexDirection: 'column', gap: '1rem', border: '1px solid #E9E6F8', textAlign: 'left' }}>
              <h3 style={{ fontWeight: 700, fontSize: '16px', color: '#111827', display: 'flex', alignItems: 'center', gap: '0.5rem', margin: 0 }}>
                <WhatsAppIcon style={{ width: '20px', height: '20px', color: '#059669' }} /> WhatsApp Group Quick-Share
              </h3>
              <p style={{ fontSize: '12px', color: '#6B7280', margin: 0 }}>
                Here is the clean, formatted message for your college groups. Copy it or share directly to WhatsApp.
              </p>
              
              <div style={{ backgroundColor: 'rgba(238,249,242,0.5)', border: '1px solid #d1fae5', borderRadius: '16px', padding: '1rem', fontFamily: 'monospace', fontSize: '11px', color: '#374151', lineHeight: 1.625, whiteSpace: 'pre-wrap', userSelect: 'all', maxHeight: '220px', overflowY: 'auto' }}>
                {shareText}
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
                <button
                  type="button"
                  onClick={() => setIsShareModalOpen(false)}
                  style={{ flex: 1, height: '44px', border: '1px solid #E9E6F8', color: '#6B7280', fontWeight: 700, fontSize: '13px', borderRadius: '9999px', background: 'none', cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard?.writeText(shareText);
                    showToast('Message copied to clipboard!', 'success');
                  }}
                  style={{ flex: 1, height: '44px', border: '1px solid #a7f3d0', backgroundColor: '#ffffff', color: '#047857', fontWeight: 700, fontSize: '13px', borderRadius: '9999px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.375rem' }}
                >
                  Copy Message
                </button>
                <a
                  href={`https://api.whatsapp.com/send?text=${encodeURIComponent(shareText)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ flex: 1, height: '44px', backgroundColor: '#059669', color: '#ffffff', fontWeight: 700, fontSize: '13px', borderRadius: '9999px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.375rem', textDecoration: 'none' }}
                >
                  Send
                </a>
              </div>
            </div>
          </div>
        );
      })()}

      {/* Report Listing Modal Overlay */}
      {isReportModalOpen && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
          <div style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }} onClick={() => setIsReportModalOpen(false)} />
          <form onSubmit={handleReport} style={{ position: 'relative', width: '100%', maxWidth: '420px', backgroundColor: '#ffffff', borderRadius: '24px', overflow: 'hidden', padding: '1.5rem', zIndex: 10, display: 'flex', flexDirection: 'column', gap: '1rem', border: '1px solid #E9E6F8', textAlign: 'left' }}>
            <h3 style={{ fontWeight: 700, fontSize: '16px', color: '#111827', display: 'flex', alignItems: 'center', gap: '0.5rem', margin: 0 }}>
              <Flag style={{ width: '20px', height: '20px', color: '#e11d48' }} /> Report Inappropriate Listing
            </h3>
            <p style={{ fontSize: '12px', color: '#6B7280', margin: 0 }}>
              If this listing contains inappropriate images, offensive language, spam, or scams, please report it.
            </p>
            
            <div>
              <label style={{ fontSize: '12px', fontWeight: 600, color: '#6B7280', display: 'block', marginBottom: '0.375rem' }}>Reason</label>
              <select
                value={reportReason}
                onChange={(e) => setReportReason(e.target.value)}
                style={{ width: '100%', height: '44px', paddingLeft: '0.75rem', paddingRight: '0.75rem', backgroundColor: '#FAFAFF', border: '1px solid #E9E6F8', borderRadius: '12px', fontSize: '13px', color: '#111827', cursor: 'pointer' }}
              >
                <option value="Inappropriate Image">Inappropriate Image</option>
                <option value="Scam or Fraud">Scam or Fraud</option>
                <option value="Incorrect Information">Incorrect Information</option>
                <option value="Other">Other (Describe below)</option>
              </select>
            </div>

            <div>
              <label style={{ fontSize: '12px', fontWeight: 600, color: '#6B7280', display: 'block', marginBottom: '0.375rem' }}>Additional Details (Optional)</label>
              <textarea
                value={reportNotes}
                onChange={(e) => setReportNotes(e.target.value)}
                placeholder="Provide details about why you are reporting this listing..."
                rows={3}
                style={{ width: '100%', padding: '0.75rem', backgroundColor: '#FAFAFF', border: '1px solid #E9E6F8', borderRadius: '12px', fontSize: '13px', color: '#111827', resize: 'none' }}
              />
            </div>

            <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
              <button
                type="button"
                onClick={() => setIsReportModalOpen(false)}
                style={{ flex: 1, height: '44px', border: '1px solid #E9E6F8', color: '#6B7280', fontWeight: 700, fontSize: '13px', borderRadius: '9999px', background: 'none', cursor: 'pointer' }}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={reporting}
                style={{ flex: 1, height: '44px', backgroundColor: '#e11d48', color: '#ffffff', fontWeight: 700, fontSize: '13px', borderRadius: '9999px', border: 'none', cursor: 'pointer' }}
              >
                {reporting ? 'Submitting...' : 'Submit Report'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default ProductDetails;
