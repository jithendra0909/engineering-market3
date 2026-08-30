import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Search, Tag, SlidersHorizontal } from 'lucide-react';
import api from '../api/axios';
import ProductCard from '../components/ProductCard';
import './GeneralMarket.css';

const CATEGORIES = ['All', 'Textbooks', 'Electronics', 'Stationery', 'Clothing', 'Hostel Essentials', 'Lab Equipment', 'Projects', 'Other'];

export const GeneralMarket = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchVal, setSearchVal] = useState(searchParams.get('search') || '');
  const [activeCategory, setActiveCategory] = useState('All');
  const [showSort, setShowSort] = useState(false);
  const [sortBy, setSortBy] = useState('newest');

  const origin = typeof window !== 'undefined' ? window.location.origin : 'https://engineering-market.in';

  useEffect(() => {
    const fetchListings = async () => {
      setLoading(true);
      try {
        const { data } = await api.get('/listings/general');
        setListings(data);
      } catch (err) {
        console.error('Error fetching general listings:', err);
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
  }).sort((a, b) => {
    if (sortBy === 'price-asc') return (a.price || 0) - (b.price || 0);
    if (sortBy === 'price-desc') return (b.price || 0) - (a.price || 0);
    return new Date(b.createdAt) - new Date(a.createdAt);
  });

  return (
    <div className="market-page-container">
      <Helmet>
        <title>General Market — Buy & Sell Across All Colleges | Engineering Market</title>
        <meta name="title" content="General Market — Buy & Sell Across All Colleges | Engineering Market" />
        <meta name="description" content="Discover textbooks, calculators, electronics, lab tools, and hostel gear from verified engineering students across all college campuses." />
        <link rel="canonical" href={`${origin}/general-market`} />
        
        <meta property="og:type" content="website" />
        <meta property="og:url" content={`${origin}/general-market`} />
        <meta property="og:title" content="General Market — Buy & Sell Across All Colleges" />
        <meta property="og:description" content="Discover items listed by verified students across all engineering campuses." />
        <meta property="og:image" content={`${origin}/images/em_gift_studio_hero_banner.png`} />

        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:url" content={`${origin}/general-market`} />
        <meta name="twitter:title" content="General Market — Buy & Sell Across All Colleges" />
        <meta name="twitter:description" content="Discover items listed by verified students across all engineering campuses." />
        <meta name="twitter:image" content={`${origin}/images/em_gift_studio_hero_banner.png`} />
      </Helmet>

      {/* Header */}
      <div className="market-header">
        <h1 className="market-header-title">General Market</h1>
        <p className="market-header-subtitle">Discover items from verified students across all colleges.</p>
      </div>

      {/* Search + Filter bar */}
      <div className="market-filter-bar">
        <div className="market-search-wrapper">
          <Search className="market-search-icon" />
          <input
            type="text"
            placeholder="Search items..."
            value={searchVal}
            onChange={(e) => setSearchVal(e.target.value)}
            className="market-search-input"
          />
        </div>
        <div className="market-sort-wrapper">
          <button
            onClick={() => setShowSort(!showSort)}
            className={`market-sort-btn ${(showSort || sortBy !== 'newest') ? 'active' : ''}`}
          >
            <SlidersHorizontal style={{ width: '18px', height: '18px' }} />
          </button>
          {showSort && (
            <div className="market-sort-dropdown animate-scaleIn">
              <div className="market-sort-header">
                <span className="market-sort-title">Sort by</span>
              </div>
              {[
                { value: 'newest', label: 'Newest First' },
                { value: 'price-asc', label: 'Price: Low to High' },
                { value: 'price-desc', label: 'Price: High to Low' },
              ].map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => {
                    setSortBy(opt.value);
                    setShowSort(false);
                  }}
                  className={`market-sort-option ${sortBy === opt.value ? 'active' : ''}`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Category pills */}
      <div className="market-category-pills no-scrollbar">
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`market-cat-pill ${activeCategory === cat ? 'active' : ''}`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Results count */}
      <p className="market-results-count">
        {loading ? 'Loading...' : `${filtered.length} item${filtered.length !== 1 ? 's' : ''} found`}
      </p>

      {/* Grid */}
      {loading ? (
        <div className="market-grid">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
            <div key={n} className="product-card animate-pulse">
              <div className="product-card-image-wrapper" style={{ backgroundColor: '#F4F1FF' }} />
              <div className="product-card-info">
                <div style={{ height: '14px', backgroundColor: '#F4F1FF', borderRadius: '9999px', width: '75%' }} />
                <div style={{ height: '14px', backgroundColor: '#F4F1FF', borderRadius: '9999px', width: '50%' }} />
              </div>
            </div>
          ))}
        </div>
      ) : filtered.length > 0 ? (
        <div className="market-grid">
          {filtered.map((item) => (
            <ProductCard key={item._id} product={item} />
          ))}
        </div>
      ) : (
        <div className="market-empty">
          <div className="market-empty-icon-box">
            <Tag style={{ width: '28px', height: '28px', color: '#6C4EFF', strokeWidth: 1.8 }} />
          </div>
          <h3 className="market-empty-title">No items found</h3>
          <p className="market-empty-desc">Try adjusting your search or filters.</p>
        </div>
      )}
    </div>
  );
};

export default GeneralMarket;
