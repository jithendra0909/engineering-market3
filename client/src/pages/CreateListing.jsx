import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ChevronLeft, Upload, X, Plus } from 'lucide-react';
import api from '../api/axios';

const CATEGORIES = ['Textbooks', 'Electronics', 'Stationery', 'Clothing', 'Hostel Essentials', 'Lab Equipment', 'Projects', 'Other'];
const CONDITIONS = ['Brand New', 'Like New', 'Good', 'Fair'];
const MARKET_TYPES = [
  { value: 'general', label: 'General Market', desc: 'Visible to all students' },
  { value: 'college', label: 'College Market', desc: 'Only your college students' },
];

export const CreateListing = () => {
  const navigate = useNavigate();
  const { user, showToast } = useAuth();
  const [searchParams] = useSearchParams();
  const listingTypeParam = searchParams.get('type') || 'sell';

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [category, setCategory] = useState('');
  const [condition, setCondition] = useState('');
  const [marketType, setMarketType] = useState('general');
  const [listingType, setListingType] = useState(listingTypeParam);
  const [whatsappNumber, setWhatsappNumber] = useState(user?.whatsappNumber || '');
  const [images, setImages] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [submitting, setSubmitting] = useState(false);

  const handleImageAdd = (e) => {
    const files = Array.from(e.target.files);
    if (images.length + files.length > 5) {
      showToast('Maximum 5 images allowed', 'error');
      return;
    }
    const newPreviews = files.map(f => URL.createObjectURL(f));
    setImages(prev => [...prev, ...files]);
    setPreviews(prev => [...prev, ...newPreviews]);
  };

  const removeImage = (idx) => {
    setImages(prev => prev.filter((_, i) => i !== idx));
    setPreviews(prev => prev.filter((_, i) => i !== idx));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title || !description || !category || !condition || images.length === 0) {
      showToast('Please fill all required fields and add at least 1 image', 'error');
      return;
    }
    if (listingType === 'sell' && (!price || Number(price) <= 0)) {
      showToast('Please enter a valid price', 'error');
      return;
    }

    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('title', title);
      formData.append('description', description);
      formData.append('price', listingType === 'donate' ? 0 : price);
      formData.append('category', category);
      formData.append('condition', condition);
      formData.append('listingType', listingType);
      formData.append('marketType', marketType);
      formData.append('whatsappNumber', whatsappNumber);
      images.forEach(img => formData.append('images', img));

      await api.post('/listings', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      showToast('Listing created successfully!', 'success');
      navigate('/');
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to create listing', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const inputClass = "w-full h-12 px-4 bg-[#FAFAFF] border border-[#E9E6F8] rounded-[14px] text-[13px] text-[#111827] placeholder-[#9CA3AF] focus:bg-white focus:border-[#6C4EFF]/30 focus:outline-none focus:ring-2 focus:ring-[#6C4EFF]/10 transition-all";
  const labelClass = "text-[12px] font-semibold text-[#6B7280] block mb-1.5";

  return (
    <div className="max-w-[600px] mx-auto px-5 pt-5 pb-28 lg:pb-12">

      {/* Back */}
      <button onClick={() => navigate(-1)} className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-[#6B7280] hover:text-[#6C4EFF] transition-colors mb-5">
        <ChevronLeft className="w-4 h-4" /> Back
      </button>

      <h1 className="text-[22px] font-bold text-[#111827] mb-1">
        {listingType === 'donate' ? 'Donate an Item' : 'Sell an Item'}
      </h1>
      <p className="text-[13px] text-[#9CA3AF] mb-6">
        {listingType === 'donate' ? 'Give items to students in need.' : 'List your item for other students to buy.'}
      </p>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">

        {/* Listing Type Toggle */}
        <div>
          <label className={labelClass}>Listing Type</label>
          <div className="flex gap-2">
            {['sell', 'donate'].map(t => (
              <button
                key={t}
                type="button"
                onClick={() => setListingType(t)}
                className={`flex-1 py-[9px] rounded-full text-[12px] font-semibold transition-all border ${
                  listingType === t
                    ? 'bg-[#6C4EFF] text-white border-[#6C4EFF]'
                    : 'bg-[#FAFAFF] border-[#E9E6F8] text-[#6B7280] hover:bg-[#F4F1FF]'
                }`}
              >
                {t === 'sell' ? 'Sell' : 'Donate'}
              </button>
            ))}
          </div>
        </div>

        {/* Title */}
        <div>
          <label className={labelClass}>Title *</label>
          <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Data Structures Using C Textbook" className={inputClass} />
        </div>

        {/* Description */}
        <div>
          <label className={labelClass}>Description *</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe your item, its condition, and why you're selling/donating..."
            rows={4}
            className="w-full px-4 py-3 bg-[#FAFAFF] border border-[#E9E6F8] rounded-[14px] text-[13px] text-[#111827] placeholder-[#9CA3AF] focus:bg-white focus:border-[#6C4EFF]/30 focus:outline-none focus:ring-2 focus:ring-[#6C4EFF]/10 transition-all resize-none"
          />
        </div>

        {/* Price (only for sell) */}
        {listingType === 'sell' && (
          <div>
            <label className={labelClass}>Price (₹) *</label>
            <input type="number" value={price} onChange={(e) => setPrice(e.target.value)} placeholder="250" min="1" className={inputClass} />
          </div>
        )}

        {/* Category + Condition */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={labelClass}>Category *</label>
            <select value={category} onChange={(e) => setCategory(e.target.value)} className={`${inputClass} appearance-none cursor-pointer`}>
              <option value="">Select</option>
              {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className={labelClass}>Condition *</label>
            <select value={condition} onChange={(e) => setCondition(e.target.value)} className={`${inputClass} appearance-none cursor-pointer`}>
              <option value="">Select</option>
              {CONDITIONS.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
        </div>

        {/* Market Type */}
        <div>
          <label className={labelClass}>Market</label>
          <div className="flex gap-2">
            {MARKET_TYPES.map(m => (
              <button
                key={m.value}
                type="button"
                onClick={() => setMarketType(m.value)}
                className={`flex-1 py-3 px-3 rounded-[14px] text-left transition-all border ${
                  marketType === m.value
                    ? 'bg-[#F4F1FF] border-[#6C4EFF]/30'
                    : 'bg-[#FAFAFF] border-[#E9E6F8] hover:bg-[#F4F1FF]'
                }`}
              >
                <p className={`text-[12px] font-bold ${marketType === m.value ? 'text-[#6C4EFF]' : 'text-[#111827]'}`}>{m.label}</p>
                <p className="text-[10px] text-[#9CA3AF] mt-0.5">{m.desc}</p>
              </button>
            ))}
          </div>
        </div>

        {/* WhatsApp */}
        <div>
          <label className={labelClass}>WhatsApp for Contact</label>
          <input type="tel" value={whatsappNumber} onChange={(e) => setWhatsappNumber(e.target.value)} placeholder="+91 9876543210" className={inputClass} />
        </div>

        {/* Images */}
        <div>
          <label className={labelClass}>Photos * (max 5)</label>
          <div className="flex gap-3 overflow-x-auto no-scrollbar pb-2">
            {previews.map((p, idx) => (
              <div key={idx} className="relative w-20 h-20 flex-shrink-0 rounded-[12px] overflow-hidden border border-[#E9E6F8]">
                <img src={p} alt="" className="w-full h-full object-cover" />
                <button
                  type="button"
                  onClick={() => removeImage(idx)}
                  className="absolute top-1 right-1 w-5 h-5 bg-black/50 rounded-full flex items-center justify-center text-white"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}
            {images.length < 5 && (
              <label className="w-20 h-20 flex-shrink-0 rounded-[12px] border-2 border-dashed border-[#E9E6F8] flex items-center justify-center cursor-pointer hover:border-[#6C4EFF]/30 hover:bg-[#FAFAFF] transition-all">
                <Plus className="w-5 h-5 text-[#9CA3AF]" />
                <input type="file" accept="image/*" multiple onChange={handleImageAdd} className="hidden" />
              </label>
            )}
          </div>
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={submitting}
          className="w-full h-12 bg-[#6C4EFF] hover:bg-[#8A72FF] text-white font-bold text-[14px] rounded-full shadow-sm transition-all active:scale-[0.98] disabled:opacity-60 flex items-center justify-center gap-2 mt-2"
        >
          {submitting ? (
            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <>Publish Listing</>
          )}
        </button>
      </form>
    </div>
  );
};

export default CreateListing;
