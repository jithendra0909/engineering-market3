import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useAuth } from '../context/AuthContext';
import {
  GraduationCap, Store, Tag, Heart, Search, ChevronRight,
  ShieldCheck, BookOpen, Lock, MapPin, Star, ArrowRight,
  Facebook, Instagram, Twitter, Youtube, Linkedin,
  ChevronLeft as ArrowLeft
} from 'lucide-react';
import HeroCarousel from '../components/HeroCarousel';
import ProductCard from '../components/ProductCard';
import VerificationRequiredModal from '../components/VerificationRequiredModal';
import api from '../api/axios';
import { Logo } from '../components/Logo';
import './Home.css';

export const Home = () => {
  const { isLoggedIn, isVerified, showToast } = useAuth();
  const navigate = useNavigate();
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isGateOpen, setIsGateOpen] = useState(false);
  const [testimonialIdx, setTestimonialIdx] = useState(0);

  useEffect(() => {
    const fetchListings = async () => {
      try {
        const { data } = await api.get('/listings');
        setListings(data.slice(0, 4));
      } catch (err) {
        console.error('Error fetching listings:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchListings();
  }, []);

  const handleGatedAction = (path) => {
    if (!isLoggedIn || !isVerified) {
      showToast('You are not verified', 'error');
      setIsGateOpen(true);
    } else {
      navigate(path);
    }
  };

  const handleMockClick = (e, label) => {
    e.preventDefault();
    showToast(`"${label}" section is coming soon!`, 'info');
  };

  /* ── Testimonials data ── */
  const testimonials = [
    {
      quote: '"Found my textbook at half the price! Engineering Market is a lifesaver."',
      name: 'Rohan Mehta',
      dept: 'Computer Engineering',
      initials: 'RM',
      colorStyle: { backgroundColor: '#F4F1FF', color: '#6C4EFF' },
    },
    {
      quote: '"Sold my old calculator within a day. Super easy and trustworthy platform."',
      name: 'Priya Sharma',
      dept: 'Electronics Engineering',
      initials: 'PS',
      colorStyle: { backgroundColor: '#EEF9F2', color: '#047857' },
    },
    {
      quote: '"Great place to find hostel essentials and study materials."',
      name: 'Aman Verma',
      dept: 'Mechanical Engineering',
      initials: 'AV',
      colorStyle: { backgroundColor: '#FFF4ED', color: '#c2410c' },
    },
  ];

  /* ── Skeleton loader for product cards ── */
  const Skeleton = () => (
    <div className="product-card animate-pulse">
      <div className="product-card-image-wrapper" style={{ backgroundColor: '#F4F1FF' }} />
      <div className="product-card-info">
        <div style={{ height: '14px', backgroundColor: '#F4F1FF', borderRadius: '9999px', width: '75%' }} />
        <div style={{ height: '14px', backgroundColor: '#F4F4FF', borderRadius: '9999px', width: '50%' }} />
        <div style={{ height: '12px', backgroundColor: '#F4F1FF', borderRadius: '9999px', width: '66%' }} />
      </div>
    </div>
  );

  const origin = typeof window !== 'undefined' ? window.location.origin : 'https://engineering-market.vercel.app';

  const homeJsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": `${origin}/#organization`,
        "name": "Engineering Market",
        "url": `${origin}/`,
        "logo": `${origin}/icons/icon-512x512.svg`,
        "description": "Student-to-student marketplace for engineering college tools, books, and equipment."
      },
      {
        "@type": "WebSite",
        "@id": `${origin}/#website`,
        "url": `${origin}/`,
        "name": "Engineering Market",
        "description": "Buy, sell, and donate engineering college essentials on campus.",
        "publisher": {
          "@id": `${origin}/#organization`
        },
        "potentialAction": {
          "@type": "SearchAction",
          "target": `${origin}/general-market?search={search_term_string}`,
          "query-input": "required name=search_term_string"
        }
      }
    ]
  };

  return (
    <div className="home-page">
      <Helmet>
        <title>Engineering Market — Buy, Sell & Donate on Campus | Student Marketplace</title>
        <meta name="title" content="Engineering Market — Buy, Sell & Donate on Campus | Student Marketplace" />
        <meta name="description" content="The dedicated campus marketplace for engineering students. Buy & sell drafters, scientific calculators, lab aprons, textbooks, and electronics within your college." />
        <link rel="canonical" href={`${origin}/`} />
        
        {/* Open Graph */}
        <meta property="og:type" content="website" />
        <meta property="og:url" content={`${origin}/`} />
        <meta property="og:title" content="Engineering Market — Student Campus Marketplace" />
        <meta property="og:description" content="Buy, sell, and donate engineering college essentials within your campus community." />
        <meta property="og:image" content={`${origin}/images/em_gift_studio_hero_banner.png`} />

        {/* Twitter */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:url" content={`${origin}/`} />
        <meta name="twitter:title" content="Engineering Market — Student Campus Marketplace" />
        <meta name="twitter:description" content="Buy, sell, and donate engineering college essentials within your campus community." />
        <meta name="twitter:image" content={`${origin}/images/em_gift_studio_hero_banner.png`} />

        {/* Structured Data */}
        <script type="application/ld+json">
          {JSON.stringify(homeJsonLd)}
        </script>
      </Helmet>

      {/* Semantic Top Heading for Search Engines */}
      <h1 className="sr-only">Engineering Market — Buy, Sell & Donate Engineering College Essentials on Campus</h1>

      {/* DECORATIVE BACKGROUND BLOBS */}
      <div className="home-bg-blobs">
        <div className="home-blob-1 animate-pulse-soft" />
        <div className="home-blob-2 animate-pulse-soft" />
        <div className="home-blob-3" />
      </div>

      <div className="home-container">

        {/* MOBILE SEARCH BAR */}
        <div className="home-mobile-search">
          <div className="home-mobile-search-wrapper">
            <Search className="home-mobile-search-icon" />
            <input
              type="text"
              placeholder="Search for items, services, or vendors..."
              onFocus={() => navigate('/general-market')}
              readOnly
              className="home-mobile-search-input"
            />
          </div>
        </div>

        {/* HERO CAROUSEL */}
        <section>
          <HeroCarousel />
        </section>

        {/* MARKET CARDS + TRENDING ITEMS */}
        <section className="home-markets-section">

          {/* Market selection cards */}
          <div className="home-market-cards-col">
            {/* College Market */}
            <div className="home-market-card-box">
              <div>
                <div className="home-market-icon-wrapper">
                  <GraduationCap className="home-market-icon" />
                </div>
                <h3 className="home-market-card-title">College Market</h3>
                <p className="home-market-card-desc">
                  Buy, sell, or donate within your college community.
                </p>
              </div>
              <button
                onClick={() => {
                  if (!isLoggedIn) {
                    setIsGateOpen(true);
                  } else {
                    navigate('/college-market');
                  }
                }}
                className="home-market-card-btn"
              >
                Explore College <ChevronRight style={{ width: '14px', height: '14px' }} />
              </button>
            </div>

            {/* General Market */}
            <div className="home-market-card-box">
              <div>
                <div className="home-market-icon-wrapper">
                  <Store className="home-market-icon" />
                </div>
                <h3 className="home-market-card-title">General Market</h3>
                <p className="home-market-card-desc">
                  Discover items listed by verified students across different colleges.
                </p>
              </div>
              <button
                onClick={() => navigate('/general-market')}
                className="home-market-card-btn"
              >
                Explore General <ChevronRight style={{ width: '14px', height: '14px' }} />
              </button>
            </div>
          </div>

          {/* Trending Items */}
          <div className="home-trending-col">
            <div className="home-section-header">
              <h2 className="home-section-title">Trending Items</h2>
              <button
                onClick={() => navigate('/general-market')}
                className="home-view-all-btn"
              >
                View All <ArrowRight style={{ width: '14px', height: '14px' }} />
              </button>
            </div>

            {loading ? (
              <div className="home-skeleton-grid">
                {[1, 2, 3, 4].map(n => <Skeleton key={n} />)}
              </div>
            ) : listings.length > 0 ? (
              <>
                {/* Mobile horizontal scroll */}
                <div className="home-trending-mobile-scroll no-scrollbar">
                  {listings.map((item) => (
                    <div key={item._id} className="home-trending-mobile-item">
                      <ProductCard product={item} />
                    </div>
                  ))}
                </div>
                {/* Desktop grid */}
                <div className="home-trending-desktop-grid">
                  {listings.map((item) => (
                    <ProductCard key={item._id} product={item} />
                  ))}
                </div>
              </>
            ) : (
              <div className="home-empty-listings">
                <p style={{ fontSize: '14px', fontWeight: 500 }}>No items available yet</p>
              </div>
            )}
          </div>
        </section>

        {/* QUICK ACTIONS + TOP VENDORS */}
        <section className="home-quick-actions-section">

          {/* Quick Actions */}
          <div className="home-quick-actions-col">
            <h2 className="home-section-title" style={{ marginBottom: '1.25rem' }}>Quick Actions</h2>
            <div className="home-quick-actions-grid">
              {[
                { icon: Tag, label: 'Buy', sub: 'Find great items', action: () => navigate('/general-market'), iconColor: '#6C4EFF', bg: '#F4F1FF' },
                { icon: Tag, label: 'Sell', sub: 'List your items', action: () => handleGatedAction('/listing/new?type=sell'), iconColor: '#059669', bg: '#EEF9F2' },
                { icon: Heart, label: 'Donate', sub: 'Give to those in need', action: () => handleGatedAction('/listing/new?type=donate'), iconColor: '#f43f5e', bg: '#fff1f2' },
              ].map((item) => (
                <button
                  key={item.label}
                  onClick={item.action}
                  className="home-quick-action-card"
                >
                  <div className="home-quick-action-icon-box" style={{ backgroundColor: item.bg }}>
                    <item.icon style={{ width: '20px', height: '20px', color: item.iconColor, strokeWidth: 1.8 }} />
                  </div>
                  <div>
                    <p className="home-quick-action-label">{item.label}</p>
                    <p className="home-quick-action-sub">{item.sub}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Top Vendors Coming Soon */}
          <div className="home-quick-actions-col">
            <h2 className="home-section-title" style={{ marginBottom: '1.25rem' }}>
              Top Vendors <span style={{ fontSize: '12px', fontWeight: 600, color: '#9CA3AF' }}>(Coming Soon)</span>
            </h2>
            <Link
              to="/vendors"
              onClick={(e) => {
                showToast('Vendor dashboard is coming soon!', 'info');
              }}
              className="home-vendors-banner-link"
            >
              <img
                src="/images/file_0000000089387207ae3efbac0454e8bd.png"
                alt="Vendor Section Coming Soon"
                className="home-vendors-banner-img"
              />
            </Link>
          </div>
        </section>

        {/* TRUST FEATURES */}
        <section className="home-trust-section">
          {[
            { icon: ShieldCheck, title: 'Trusted & Verified', sub: 'All users and vendors are verified for safety.', iconColor: '#6C4EFF', bg: '#F4F1FF' },
            { icon: BookOpen, title: 'Student Focused', sub: 'Built exclusively for engineering students.', iconColor: '#059669', bg: '#EEF9F2' },
            { icon: Lock, title: 'Secure Transactions', sub: 'Safe and secure payments and communications.', iconColor: '#2563eb', bg: '#eff6ff' },
            { icon: MapPin, title: 'Local & Reliable', sub: 'Connect with trusted local vendors and peers.', iconColor: '#ea580c', bg: '#fff7ed' },
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

        {/* TESTIMONIALS */}
        <section className="home-testimonials-section">
          <div className="home-section-header">
            <h2 className="home-section-title">What Students Say</h2>
            <div className="home-testimonial-nav">
              <button
                onClick={() => setTestimonialIdx(Math.max(0, testimonialIdx - 1))}
                disabled={testimonialIdx === 0}
                className="home-testimonial-arrow"
              >
                <ArrowLeft style={{ width: '16px', height: '16px' }} />
              </button>
              <button
                onClick={() => setTestimonialIdx(Math.min(testimonials.length - 1, testimonialIdx + 1))}
                disabled={testimonialIdx >= testimonials.length - 1}
                className="home-testimonial-arrow"
              >
                <ChevronRight style={{ width: '16px', height: '16px' }} />
              </button>
            </div>
          </div>

          {/* Mobile horizontal scroll */}
          <div className="home-testimonials-mobile-scroll no-scrollbar">
            {testimonials.map((t, i) => (
              <TestimonialCard key={i} t={t} />
            ))}
          </div>
          {/* Desktop grid */}
          <div className="home-testimonials-desktop-grid">
            {testimonials.map((t, i) => (
              <TestimonialCard key={i} t={t} />
            ))}
          </div>
        </section>

        {/* FOOTER */}
        <footer className="home-footer">
          <div className="home-footer-grid">

            {/* Brand column */}
            <div className="home-footer-brand-col">
              <Link to="/" style={{ textDecoration: 'none' }}>
                <Logo size={30} showText={true} textClass="logo-text" />
              </Link>
              <p className="home-footer-brand-desc">
                The all-in-one marketplace for engineering students. Buy, sell, and donate with trust.
              </p>
              <div className="home-footer-socials">
                {[Facebook, Instagram, Twitter, Youtube, Linkedin].map((Icon, i) => (
                  <button
                    key={i}
                    onClick={(e) => handleMockClick(e, 'Social Media')}
                    className="home-footer-social-btn"
                  >
                    <Icon style={{ width: '14px', height: '14px' }} />
                  </button>
                ))}
              </div>
            </div>

            {/* Link columns */}
            {[
              { title: 'Marketplace', links: [['All Categories', '/general-market'], ['College Market', '/college-market'], ['General Market', '/general-market'], ['Trending Items', '/general-market']] },
              { title: 'Company', links: [['About Us', '#'], ['How it Works', '#'], ['Our Mission', '#'], ['Contact Us', '#']] },
              { title: 'Support', links: [['Help Center', '#'], ['Safety Tips', '#'], ['Terms of Service', '#'], ['Privacy Policy', '#']] },
              { title: 'For Students', links: [['Study Resources', '#'], ['Engineering Blogs', '#'], ['Student Discounts', '#'], ['University Partners', '#']] },
            ].map((col) => (
              <div key={col.title} className="home-footer-links-col">
                <h4 className="home-footer-col-title">{col.title}</h4>
                <div className="home-footer-links-list">
                  {col.links.map(([label, href]) => (
                    href === '#' ? (
                      <button
                        key={label}
                        onClick={(e) => handleMockClick(e, label)}
                        className="home-footer-link"
                      >
                        {label}
                      </button>
                    ) : (
                      <Link key={label} to={href} className="home-footer-link">
                        {label}
                      </Link>
                    )
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Copyright bar */}
          <div className="home-footer-bottom">
            <p className="home-footer-copy">© 2026 Engineering Market. All rights reserved.</p>
            <div className="home-footer-legal-links">
              <button onClick={(e) => handleMockClick(e, 'Privacy Policy')} className="home-footer-link" style={{ fontSize: '11px' }}>Privacy Policy</button>
              <button onClick={(e) => handleMockClick(e, 'Terms of Service')} className="home-footer-link" style={{ fontSize: '11px' }}>Terms of Service</button>
            </div>
          </div>
        </footer>
      </div>

      {/* Verification Gate Modal */}
      <VerificationRequiredModal isOpen={isGateOpen} onClose={() => setIsGateOpen(false)} />
    </div>
  );
};

/* ── Testimonial Card sub-component ── */
const TestimonialCard = ({ t }) => (
  <div className="testimonial-card">
    <div className="testimonial-user-info">
      <div className="testimonial-avatar" style={t.colorStyle}>
        {t.initials}
      </div>
      <div>
        <p className="testimonial-name">{t.name}</p>
        <p className="testimonial-dept">{t.dept}</p>
      </div>
    </div>
    <p className="testimonial-quote">{t.quote}</p>
    <div className="testimonial-stars">
      {[1, 2, 3, 4, 5].map(n => (
        <Star key={n} className="testimonial-star-icon" />
      ))}
    </div>
  </div>
);

export default Home;
