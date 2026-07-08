import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Phone, Heart, MapPin, Tag, GraduationCap, Clock, ChevronLeft, Share2, MessageCircle, Flag } from 'lucide-react';
import api from '../api/axios';
import VerificationRequiredModal from '../components/VerificationRequiredModal';

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
  const [reportReason, setReportReason] = useState('Inappropriate Image');
  const [reportNotes, setReportNotes] = useState('');
  const [reporting, setReporting] = useState(false);

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
      <div className="max-w-[1360px] mx-auto px-5 lg:px-8 pt-5 lg:pt-8 pb-28 lg:pb-12 animate-pulse">
        <div className="h-6 w-24 bg-[#F4F1FF] rounded-full mb-6" />
        <div className="lg:flex gap-10">
          <div className="lg:w-1/2 aspect-square bg-[#F4F1FF] rounded-[24px]" />
          <div className="flex-1 mt-6 lg:mt-0 flex flex-col gap-4">
            <div className="h-7 bg-[#F4F1FF] rounded-full w-3/4" />
            <div className="h-8 bg-[#F4F1FF] rounded-full w-1/4" />
            <div className="h-4 bg-[#F4F1FF] rounded-full w-full" />
            <div className="h-4 bg-[#F4F1FF] rounded-full w-2/3" />
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
    <div className="max-w-[1360px] mx-auto px-5 lg:px-8 pt-5 lg:pt-8 pb-28 lg:pb-12">

      {/* Back button */}
      <button
        onClick={() => navigate(-1)}
        className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-[#6B7280] hover:text-[#6C4EFF] transition-colors mb-5"
      >
        <ChevronLeft className="w-4 h-4" /> Back
      </button>

      <div className="lg:flex gap-10">
        {/* ── Left: Image gallery ── */}
        <div className="lg:w-1/2 lg:flex-shrink-0">
          {/* Main image */}
          <div className="aspect-square bg-[#FAFAFF] rounded-[24px] overflow-hidden border border-[#E9E6F8]/70 mb-3">
            <img
              src={listing.images[selectedImg]}
              alt={listing.title}
              className="w-full h-full object-cover"
            />
          </div>

          {/* Thumbnails */}
          {listing.images.length > 1 && (
            <div className="flex gap-2 overflow-x-auto no-scrollbar">
              {listing.images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedImg(idx)}
                  className={`w-16 h-16 rounded-[12px] overflow-hidden border-2 flex-shrink-0 transition-all ${
                    selectedImg === idx ? 'border-[#6C4EFF]' : 'border-[#E9E6F8]/70 hover:border-[#6C4EFF]/30'
                  }`}
                >
                  <img src={img} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* ── Right: Details ── */}
        <div className="flex-1 mt-6 lg:mt-0 flex flex-col">
          {/* Category + Time */}
          <div className="flex items-center gap-3 mb-3">
            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#6C4EFF] bg-[#F4F1FF] px-2.5 py-1 rounded-full">
              <Tag className="w-3 h-3" /> {listing.category}
            </span>
            <span className="inline-flex items-center gap-1 text-[11px] font-medium text-[#9CA3AF]">
              <Clock className="w-3 h-3" /> {timeAgo(listing.createdAt)}
            </span>
          </div>

          {/* Title */}
          <h1 className="text-[22px] lg:text-[26px] font-bold text-[#111827] leading-tight mb-2">
            {listing.title}
          </h1>

          {/* Price */}
          <p className="text-[26px] font-extrabold text-[#111827] mb-4">
            {listing.listingType === 'donate' ? (
              <span className="text-[#6C4EFF]">Free / Donation</span>
            ) : (
              `₹${listing.price}`
            )}
          </p>

          {/* Meta info */}
          <div className="flex flex-wrap items-center gap-3 mb-6">
            <span className="inline-flex items-center gap-1.5 text-[12px] font-medium text-[#6B7280] bg-[#FAFAFF] border border-[#E9E6F8]/70 px-3 py-1.5 rounded-full">
              <MapPin className="w-3.5 h-3.5 text-[#9CA3AF]" /> {listing.sellerCollege}
            </span>
            <span className="inline-flex items-center gap-1.5 text-[12px] font-medium text-[#6B7280] bg-[#FAFAFF] border border-[#E9E6F8]/70 px-3 py-1.5 rounded-full">
              {listing.condition}
            </span>
            <span className="inline-flex items-center gap-1.5 text-[12px] font-medium text-[#6B7280] bg-[#FAFAFF] border border-[#E9E6F8]/70 px-3 py-1.5 rounded-full">
              {listing.marketType === 'college' ? (
                <><GraduationCap className="w-3.5 h-3.5 text-[#9CA3AF]" /> College Market</>
              ) : (
                'General Market'
              )}
            </span>
          </div>

          {/* Description */}
          <div className="mb-6">
            <h3 className="font-bold text-[14px] text-[#111827] mb-2">Description</h3>
            <p className="text-[13px] text-[#6B7280] leading-relaxed whitespace-pre-line">
              {listing.description}
            </p>
          </div>

          {/* Seller card */}
          <div className="bg-[#FAFAFF] border border-[#E9E6F8]/70 rounded-[20px] p-4 mb-6">
            <h3 className="font-bold text-[13px] text-[#111827] mb-3">Seller</h3>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[#F4F1FF] flex items-center justify-center text-[#6C4EFF] font-bold text-[12px] overflow-hidden flex-shrink-0">
                {listing.seller?.profileImageUrl ? (
                  <img src={listing.seller.profileImageUrl} alt="" className="w-full h-full object-cover" />
                ) : (
                  listing.seller?.fullName?.charAt(0) || 'S'
                )}
              </div>
              <div>
                <p className="font-bold text-[13px] text-[#111827]">{listing.seller?.fullName}</p>
                <p className="text-[11px] text-[#9CA3AF]">
                  {listing.seller?.department} · {listing.seller?.year}
                </p>
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex gap-3 mt-auto">
            {isLoggedIn && user?._id === (listing.seller?._id || listing.seller) ? (
              <button
                disabled
                className="flex-1 bg-[#E9E6F8] text-[#9CA3AF] font-semibold text-[14px] py-3.5 rounded-full flex items-center justify-center gap-2 cursor-not-allowed"
              >
                <MessageCircle className="w-5 h-5" /> Your Listing
              </button>
            ) : (
              <button
                onClick={handleContact}
                className="flex-1 bg-[#6C4EFF] hover:bg-[#8A72FF] text-white font-bold text-[14px] py-3.5 rounded-full shadow-sm transition-all active:scale-[0.98] flex items-center justify-center gap-2"
              >
                <MessageCircle className="w-5 h-5" /> Chat with Seller
              </button>
            )}
            <button
              onClick={handleSave}
              className={`w-[52px] h-[52px] rounded-full border flex items-center justify-center flex-shrink-0 transition-all ${
                isSaved
                  ? 'bg-[#F4F1FF] border-[#6C4EFF]/30 text-[#6C4EFF]'
                  : 'bg-white border-[#E9E6F8] text-[#9CA3AF] hover:text-[#6C4EFF] hover:border-[#6C4EFF]/30'
              }`}
            >
              <Heart className={`w-5 h-5 stroke-[2] ${isSaved ? 'fill-[#6C4EFF]' : ''}`} />
            </button>
            <button
              onClick={() => {
                navigator.clipboard?.writeText(window.location.href);
                showToast('Link copied!', 'success');
              }}
              className="w-[52px] h-[52px] rounded-full border border-[#E9E6F8] bg-white flex items-center justify-center text-[#9CA3AF] hover:text-[#6C4EFF] hover:border-[#6C4EFF]/30 transition-all flex-shrink-0"
            >
              <Share2 className="w-5 h-5 stroke-[2]" />
            </button>
          </div>

          {isLoggedIn && user?._id !== listing.seller?._id && (
            <div className="flex justify-center mt-5">
              <button
                onClick={() => setIsReportModalOpen(true)}
                disabled={listing.reports?.some(r => r.reporter === user?._id || r.reporter?._id === user?._id)}
                className={`flex items-center gap-1.5 text-xs font-semibold hover:underline ${
                  listing.reports?.some(r => r.reporter === user?._id || r.reporter?._id === user?._id)
                    ? 'text-[#9CA3AF] cursor-default hover:no-underline'
                    : 'text-rose-600 hover:text-rose-700'
                }`}
              >
                <Flag className="w-3.5 h-3.5" />
                {listing.reports?.some(r => r.reporter === user?._id || r.reporter?._id === user?._id)
                  ? 'You have reported this item'
                  : 'Report this listing'}
              </button>
            </div>
          )}
        </div>
      </div>

      <VerificationRequiredModal isOpen={isGateOpen} onClose={() => setIsGateOpen(false)} />

      {/* Report Listing Modal Overlay */}
      {isReportModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsReportModalOpen(false)} />
          <form onSubmit={handleReport} className="relative w-full max-w-[420px] bg-white rounded-3xl overflow-hidden p-6 z-10 flex flex-col gap-4 border border-[#E9E6F8] text-left">
            <h3 className="font-bold text-base text-[#111827] flex items-center gap-2">
              <Flag className="w-5 h-5 text-rose-600" /> Report Inappropriate Listing
            </h3>
            <p className="text-xs text-[#6B7280]">
              If this listing contains inappropriate images, offensive language, spam, or scams, please report it.
            </p>
            
            <div>
              <label className="text-[12px] font-semibold text-[#6B7280] block mb-1.5">Reason</label>
              <select
                value={reportReason}
                onChange={(e) => setReportReason(e.target.value)}
                className="w-full h-11 px-3 bg-[#FAFAFF] border border-[#E9E6F8] rounded-xl text-[13px] text-[#111827] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#6C4EFF]/10 transition-all cursor-pointer"
              >
                <option value="Inappropriate Image">Inappropriate Image</option>
                <option value="Scam or Fraud">Scam or Fraud</option>
                <option value="Incorrect Information">Incorrect Information</option>
                <option value="Other">Other (Describe below)</option>
              </select>
            </div>

            <div>
              <label className="text-[12px] font-semibold text-[#6B7280] block mb-1.5">Additional Details (Optional)</label>
              <textarea
                value={reportNotes}
                onChange={(e) => setReportNotes(e.target.value)}
                placeholder="Provide details about why you are reporting this listing..."
                rows={3}
                className="w-full p-3 bg-[#FAFAFF] border border-[#E9E6F8] rounded-xl text-[13px] text-[#111827] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#6C4EFF]/10 transition-all resize-none"
              />
            </div>

            <div className="flex gap-3 mt-2">
              <button
                type="button"
                onClick={() => setIsReportModalOpen(false)}
                className="flex-1 h-11 border border-[#E9E6F8] text-[#6B7280] font-bold text-[13px] rounded-full hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={reporting}
                className="flex-1 h-11 bg-rose-600 hover:bg-rose-700 text-white font-bold text-[13px] rounded-full transition-colors flex items-center justify-center disabled:opacity-60"
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
