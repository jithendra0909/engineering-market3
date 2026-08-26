import React, { useState, useEffect } from 'react';
import { Search, Gift, SlidersHorizontal } from 'lucide-react';
import api from '../api/axios';
import GiftProductCard from '../components/GiftProductCard';
import './GiftStudioProducts.css';

export const GiftStudioProducts = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchVal, setSearchVal] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [showSort, setShowSort] = useState(false);
  const [sortBy, setSortBy] = useState('newest');

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [productsRes, categoriesRes] = await Promise.all([
          api.get('/gift/products'),
          api.get('/gift/categories')
        ]);
        setProducts(productsRes.data);
        setCategories(categoriesRes.data);
      } catch (err) {
        console.error('Error fetching gift studio data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const filtered = products.filter((item) => {
    const matchesSearch = !searchVal || item.title.toLowerCase().includes(searchVal.toLowerCase()) || item.description?.toLowerCase().includes(searchVal.toLowerCase());
    const matchesCat = activeCategory === 'All' || item.category === activeCategory;
    return matchesSearch && matchesCat;
  }).sort((a, b) => {
    if (sortBy === 'price-asc') return (a.basePrice || 0) - (b.basePrice || 0);
    if (sortBy === 'price-desc') return (b.basePrice || 0) - (a.basePrice || 0);
    return new Date(b.createdAt) - new Date(a.createdAt);
  });

  return (
    <div className="market-page-container">

      {/* Header */}
      <div className="market-header">
        <h1 className="market-header-title">EM Gift Studio</h1>
        <p className="market-header-subtitle">Browse all personalized gifts — photo frames, mugs, keychains and more.</p>
      </div>

      {/* Search + Filter bar */}
      <div className="market-filter-bar">
        <div className="market-search-wrapper">
          <Search className="market-search-icon" />
          <input
            type="text"
            placeholder="Search gifts..."
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
        <button
          onClick={() => setActiveCategory('All')}
          className={`market-cat-pill ${activeCategory === 'All' ? 'active' : ''}`}
        >
          All
        </button>
        {categories.map((cat) => (
          <button
            key={cat._id}
            onClick={() => setActiveCategory(cat.name)}
            className={`market-cat-pill ${activeCategory === cat.name ? 'active' : ''}`}
          >
            {cat.name}
          </button>
        ))}
      </div>

      {/* Results count */}
      <p className="market-results-count">
        {loading ? 'Loading...' : `${filtered.length} gift${filtered.length !== 1 ? 's' : ''} found`}
      </p>

      {/* Grid */}
      {loading ? (
        <div className="market-grid">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
            <div key={n} className="gift-card animate-pulse">
              <div className="gift-card-img-wrapper" style={{ backgroundColor: '#F4F1FF' }} />
              <div className="gift-card-content">
                <div style={{ height: '14px', backgroundColor: '#F4F1FF', borderRadius: '9999px', width: '75%' }} />
                <div style={{ height: '14px', backgroundColor: '#F4F1FF', borderRadius: '9999px', width: '50%' }} />
              </div>
            </div>
          ))}
        </div>
      ) : filtered.length > 0 ? (
        <div className="market-grid">
          {filtered.map((item) => (
            <GiftProductCard key={item._id} product={item} />
          ))}
        </div>
      ) : (
        <div className="market-empty">
          <div className="market-empty-icon-box">
            <Gift style={{ width: '28px', height: '28px', color: '#6C4EFF', strokeWidth: 1.8 }} />
          </div>
          <h3 className="market-empty-title">No gifts found</h3>
          <p className="market-empty-desc">Try adjusting your search or filters.</p>
        </div>
      )}
    </div>
  );
};

export default GiftStudioProducts;
