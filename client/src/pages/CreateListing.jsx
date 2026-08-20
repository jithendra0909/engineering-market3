import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ChevronLeft, X, Plus } from 'lucide-react';
import api from '../api/axios';
import './CreateListing.css';

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

      const compressedImages = await Promise.all(images.map(img => compressImage(img)));
      compressedImages.forEach(img => formData.append('images', img));

      await api.post('/listings', formData, {
        headers: { 'Content-Type': undefined },
      });

      showToast('Listing created successfully!', 'success');
      navigate('/');
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to create listing', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="create-page-container">

      {/* Back */}
      <button onClick={() => navigate(-1)} className="create-back-btn">
        <ChevronLeft style={{ width: '16px', height: '16px' }} /> Back
      </button>

      <h1 className="create-title">
        {listingType === 'donate' ? 'Donate an Item' : 'Sell an Item'}
      </h1>
      <p className="create-subtitle">
        {listingType === 'donate' ? 'Give items to students in need.' : 'List your item for other students to buy.'}
      </p>

      <form onSubmit={handleSubmit} className="create-form">

        {/* Listing Type Toggle */}
        <div className="create-field">
          <label className="create-label">Listing Type</label>
          <div className="create-toggle-row">
            {['sell', 'donate'].map(t => (
              <button
                key={t}
                type="button"
                onClick={() => setListingType(t)}
                className={`create-toggle-btn ${listingType === t ? 'active' : ''}`}
              >
                {t === 'sell' ? 'Sell' : 'Donate'}
              </button>
            ))}
          </div>
        </div>

        {/* Title */}
        <div className="create-field">
          <label className="create-label">Title *</label>
          <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Data Structures Using C Textbook" className="create-input" />
        </div>

        {/* Description */}
        <div className="create-field">
          <label className="create-label">Description *</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe your item, its condition, and why you're selling/donating..."
            rows={4}
            className="create-textarea"
          />
        </div>

        {/* Price (only for sell) */}
        {listingType === 'sell' && (
          <div className="create-field">
            <label className="create-label">Price (₹) *</label>
            <input type="number" value={price} onChange={(e) => setPrice(e.target.value)} placeholder="250" min="1" className="create-input" />
          </div>
        )}

        {/* Category + Condition */}
        <div className="create-grid-2">
          <div className="create-field">
            <label className="create-label">Category *</label>
            <select value={category} onChange={(e) => setCategory(e.target.value)} className="create-select">
              <option value="">Select</option>
              {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div className="create-field">
            <label className="create-label">Condition *</label>
            <select value={condition} onChange={(e) => setCondition(e.target.value)} className="create-select">
              <option value="">Select</option>
              {CONDITIONS.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
        </div>

        {/* Market Type */}
        <div className="create-field">
          <label className="create-label">Market</label>
          <div className="create-market-cards">
            {MARKET_TYPES.map(m => (
              <button
                key={m.value}
                type="button"
                onClick={() => setMarketType(m.value)}
                className={`create-market-card-btn ${marketType === m.value ? 'active' : ''}`}
              >
                <p className={`create-market-label ${marketType === m.value ? 'active' : ''}`}>{m.label}</p>
                <p className="create-market-desc">{m.desc}</p>
              </button>
            ))}
          </div>
        </div>

        {/* WhatsApp */}
        <div className="create-field">
          <label className="create-label">WhatsApp for Contact</label>
          <input type="tel" value={whatsappNumber} onChange={(e) => setWhatsappNumber(e.target.value)} placeholder="+91 9876543210" className="create-input" />
        </div>

        {/* Images */}
        <div className="create-field">
          <label className="create-label">Photos * (max 5)</label>
          <div className="create-photos-row no-scrollbar">
            {previews.map((p, idx) => (
              <div key={idx} className="create-photo-item">
                <img src={p} alt="" className="create-photo-img" />
                <button
                  type="button"
                  onClick={() => removeImage(idx)}
                  className="create-photo-remove"
                >
                  <X style={{ width: '12px', height: '12px' }} />
                </button>
              </div>
            ))}
            {images.length < 5 && (
              <label className="create-photo-add-btn">
                <Plus style={{ width: '20px', height: '20px', color: '#9CA3AF' }} />
                <input type="file" accept="image/*" multiple onChange={handleImageAdd} style={{ display: 'none' }} />
              </label>
            )}
          </div>
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={submitting}
          className="create-submit-btn"
        >
          {submitting ? (
            <div className="auth-btn-spinner animate-spin" />
          ) : (
            <>Publish Listing</>
          )}
        </button>
      </form>
    </div>
  );
};

export default CreateListing;
