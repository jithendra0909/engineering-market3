import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { 
  Printer, LayoutGrid, Star, ChevronRight, 
  ShieldCheck, Lock, Headset, Award, Search, Gift
} from 'lucide-react';
import './Vendors.css';

export const Vendors = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('All');
  const [searchVal, setSearchVal] = useState('');
  const [showComingSoon, setShowComingSoon] = useState(false);

  const origin = typeof window !== 'undefined' ? window.location.origin : 'https://engineering-market.vercel.app';

  // Filter vendors based on active tab and search
  const showPrintHub = (activeTab === 'All' || activeTab === 'Printing') && 
    (!searchVal || 'em printf hub printing'.includes(searchVal.toLowerCase()));
  const showGiftStudio = (activeTab === 'All' || activeTab === 'Gifts') && 
    (!searchVal || 'em gift studio personalized gifts photo frames'.includes(searchVal.toLowerCase()));

  return (
    <div className="home-page">
      <Helmet>
        <title>Campus Vendors — Gifts, Prints & More | Engineering Market</title>
        <meta name="title" content="Campus Vendors — Gifts, Prints & More | Engineering Market" />
        <meta name="description" content="Connect with verified campus vendors for personalized photo frames, printing services, and engineering student essentials." />
        <link rel="canonical" href={`${origin}/vendors`} />

        <meta property="og:type" content="website" />
        <meta property="og:url" content={`${origin}/vendors`} />
        <meta property="og:title" content="Campus Vendors — Gifts, Prints & More" />
        <meta property="og:description" content="Connect with verified campus vendors on Engineering Market." />
        <meta property="og:image" content={`${origin}/images/em_gift_studio_hero_banner.png`} />

        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:url" content={`${origin}/vendors`} />
        <meta name="twitter:title" content="Campus Vendors — Gifts, Prints & More" />
        <meta name="twitter:description" content="Connect with verified campus vendors on Engineering Market." />
        <meta name="twitter:image" content={`${origin}/images/em_gift_studio_hero_banner.png`} />
      </Helmet>

      {/* Decorative background blobs */}
      <div className="home-bg-blobs">
        <div className="home-blob-1" />
        <div className="home-blob-2" />
      </div>

      <div className="vendors-page-container">

        {/* HEADER */}
        <div>
          <h1 className="home-section-title">Vendors</h1>
          <p style={{ fontSize: '12px', color: '#9CA3AF', marginTop: '0.25rem', margin: 0, lineHeight: 1.625 }}>Discover verified vendors and services on campus.</p>
        </div>

        {/* SEARCH & CHIPS BAR */}
        <div className="vendors-search-bar-row">
          
          {/* Search */}
          <div className="home-mobile-search-wrapper" style={{ width: '100%', maxWidth: '28rem' }}>
            <Search className="home-mobile-search-icon" />
            <input 
              type="text" 
              placeholder="Search vendors or services..." 
              value={searchVal}
              onChange={(e) => setSearchVal(e.target.value)}
              className="home-mobile-search-input"
            />
          </div>

          {/* Category Tabs */}
          <div className="vendors-tabs-row no-scrollbar">
            <button 
              onClick={() => setActiveTab('All')}
              className={`vendors-tab-btn ${activeTab === 'All' ? 'active' : ''}`}
            >
              <LayoutGrid style={{ width: '14px', height: '14px', strokeWidth: 2 }} />
              All
            </button>

            <button 
              onClick={() => setActiveTab('Printing')}
              className={`vendors-tab-btn ${activeTab === 'Printing' ? 'active' : ''}`}
            >
              <Printer style={{ width: '14px', height: '14px', strokeWidth: 2 }} />
              Printing
            </button>

            <button 
              onClick={() => setActiveTab('Gifts')}
              className={`vendors-tab-btn ${activeTab === 'Gifts' ? 'active' : ''}`}
            >
              <Gift style={{ width: '14px', height: '14px', strokeWidth: 2 }} />
              Gifts
            </button>
          </div>
        </div>

        {/* POPULAR VENDORS */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <h2 className="home-section-title">Popular Vendors</h2>
          
          <div className="vendors-grid">
            {/* EM Printf Hub (Coming Soon) */}
            {showPrintHub && (
              <button
                onClick={() => setShowComingSoon(true)}
                className="vendor-card-btn"
              >
                <div className="vendor-card-icon-box">
                  <Printer style={{ width: '32px', height: '32px', color: '#6C4EFF', strokeWidth: 1.8 }} />
                </div>

                <div className="vendor-card-info">
                  <h3 className="vendor-card-title">EM Printf Hub</h3>
                  <p className="vendor-card-service">Printing Services</p>
                  <p className="vendor-card-tags">ID Cards • Photocopies • Spiral Binding</p>
                  
                  <div style={{ marginTop: '0.5rem', display: 'flex' }}>
                    <span className="vendor-verified-badge">
                      <ShieldCheck style={{ width: '12px', height: '12px' }} />
                      Verified
                    </span>
                  </div>
                </div>

                <div className="vendor-card-meta">
                  <div className="vendor-rating">
                    <Star style={{ width: '14px', height: '14px', fill: '#fbbf24', color: '#fbbf24' }} />
                    4.8
                    <span className="vendor-rating-count">(256)</span>
                  </div>
                  
                  <ChevronRight style={{ width: '16px', height: '16px', color: '#9CA3AF' }} />
                </div>
              </button>
            )}

            {/* EM Gift Studio (Active) */}
            {showGiftStudio && (
              <button
                onClick={() => navigate('/vendors/gift-studio')}
                className="vendor-card-btn"
              >
                <div className="vendor-card-icon-box">
                  <Gift style={{ width: '32px', height: '32px', color: '#6C4EFF', strokeWidth: 1.8 }} />
                </div>

                <div className="vendor-card-info">
                  <h3 className="vendor-card-title">EM Gift Studio</h3>
                  <p className="vendor-card-service">Personalized Gifts</p>
                  <p className="vendor-card-tags">Photo Frames • Custom Gifts</p>
                  
                  <div style={{ marginTop: '0.5rem', display: 'flex' }}>
                    <span className="vendor-verified-badge">
                      <ShieldCheck style={{ width: '12px', height: '12px' }} />
                      Verified
                    </span>
                  </div>
                </div>

                <div className="vendor-card-meta">
                  <div className="vendor-rating">
                    <Star style={{ width: '14px', height: '14px', fill: '#fbbf24', color: '#fbbf24' }} />
                    4.9
                    <span className="vendor-rating-count">(128)</span>
                  </div>
                  
                  <ChevronRight style={{ width: '16px', height: '16px', color: '#9CA3AF' }} />
                </div>
              </button>
            )}
          </div>
        </div>

        {/* TRUST FEATURES */}
        <section className="home-trust-section">
          {[
            { icon: ShieldCheck, title: 'Verified Vendors', sub: 'Trusted & verified for your safety.', iconColor: '#6C4EFF', bg: '#F4F1FF' },
            { icon: Lock, title: 'Safe & Secure', sub: 'Your transactions are always protected.', iconColor: '#059669', bg: '#EEF9F2' },
            { icon: Headset, title: 'Support', sub: "We're here to help you, always.", iconColor: '#2563eb', bg: '#eff6ff' },
            { icon: Award, title: 'Top Rated', sub: 'Quality assured by student reviews.', iconColor: '#ea580c', bg: '#fff7ed' },
          ].map((feat) => (
            <div key={feat.title} className="home-trust-item">
              <div className="home-trust-icon-box" style={{ backgroundColor: feat.bg }}>
                <feat.icon style={{ width: '20px', height: '20px', color: feat.iconColor, strokeWidth: 1.8 }} />
              </div>
              <h4 className="home-trust-title">{feat.title}</h4>
              <p className="home-trust-sub">{feat.sub}</p>
            </div>
          ))}
        </section>

      </div>

      {/* COMING SOON MODAL */}
      {showComingSoon && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(4px)', padding: '1.5rem' }} onClick={() => setShowComingSoon(false)}>
          <div style={{ backgroundColor: '#ffffff', borderRadius: '24px', padding: '2rem', maxWidth: '24rem', width: '100%', textAlign: 'center', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)' }} onClick={(e) => e.stopPropagation()}>
            <div style={{ width: '4rem', height: '4rem', backgroundColor: '#F4F1FF', borderRadius: '9999px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem auto' }}>
              <Printer style={{ width: '32px', height: '32px', color: '#6C4EFF', strokeWidth: 1.5 }} />
            </div>
            <h2 style={{ fontSize: '20px', fontWeight: 800, color: '#111827', margin: 0 }}>EM Printf Hub</h2>
            <p style={{ fontSize: '13px', color: '#9CA3AF', marginTop: '0.5rem', lineHeight: 1.625 }}>
              We're putting the finishing touches on our printing service. Upload PDFs, get classroom delivery — launching very soon!
            </p>
            <div style={{ marginTop: '1rem', padding: '0.625rem 1.5rem', backgroundColor: '#F4F1FF', color: '#6C4EFF', fontWeight: 700, fontSize: '12px', borderRadius: '9999px', border: '1px solid rgba(108, 78, 255, 0.2)', display: 'inline-block' }}>
              🚀 Coming Soon
            </div>
            <button
              onClick={() => setShowComingSoon(false)}
              style={{ marginTop: '1rem', display: 'block', width: '100%', fontSize: '13px', fontWeight: 600, color: '#9CA3AF', background: 'none', border: 'none', cursor: 'pointer' }}
            >
              Close
            </button>
          </div>
        </div>
      )}

    </div>
  );
};

export default Vendors;
