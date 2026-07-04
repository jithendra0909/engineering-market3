import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Phone, Heart, MapPin, Tag, GraduationCap, Clock, ChevronLeft, Share2, MessageCircle } from 'lucide-react';
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
    try {
      const { data } = await api.post(`/listings/${id}/contact`);
      const whatsappUrl = `https://wa.me/${data.sellerWhatsappNumber}?text=${encodeURIComponent(`Hi! I'm interested in your "${listing.title}" listed on Engineering Market. ${data.message}`)}`;
      window.open(whatsappUrl, '_blank');
    } catch (err) {
      showToast('Failed to contact seller', 'error');
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
            <button
              onClick={handleContact}
              className="flex-1 bg-[#6C4EFF] hover:bg-[#8A72FF] text-white font-bold text-[14px] py-3.5 rounded-full shadow-sm transition-all active:scale-[0.98] flex items-center justify-center gap-2"
            >
              <MessageCircle className="w-5 h-5" /> Contact Seller
            </button>
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
        </div>
      </div>

      <VerificationRequiredModal isOpen={isGateOpen} onClose={() => setIsGateOpen(false)} />
    </div>
  );
};

export default ProductDetails;
