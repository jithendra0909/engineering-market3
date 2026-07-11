import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
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

/* ═══════════════════════════════════════════════
   HOME PAGE — Premium Apple-inspired layout
   Mobile-first, responsive up to 1440px desktop
   ═══════════════════════════════════════════════ */

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
      color: 'bg-[#F4F1FF] text-[#6C4EFF]',
    },
    {
      quote: '"Sold my old calculator within a day. Super easy and trustworthy platform."',
      name: 'Priya Sharma',
      dept: 'Electronics Engineering',
      initials: 'PS',
      color: 'bg-[#EEF9F2] text-emerald-700',
    },
    {
      quote: '"Great place to find hostel essentials and study materials."',
      name: 'Aman Verma',
      dept: 'Mechanical Engineering',
      initials: 'AV',
      color: 'bg-[#FFF4ED] text-orange-700',
    },
  ];

  /* ── Skeleton loader for product cards ── */
  const Skeleton = () => (
    <div className="bg-white border border-[#E9E6F8]/70 rounded-[20px] overflow-hidden animate-pulse">
      <div className="aspect-square bg-[#F4F1FF]" />
      <div className="p-3.5 flex flex-col gap-2">
        <div className="h-3.5 bg-[#F4F1FF] rounded-full w-3/4" />
        <div className="h-3.5 bg-[#F4F1FF] rounded-full w-1/2" />
        <div className="h-3 bg-[#F4F1FF] rounded-full w-2/3" />
      </div>
    </div>
  );

  return (
    <div className="relative overflow-hidden">

      {/* ╔══════════════════════════════════════╗
          ║   DECORATIVE BACKGROUND BLOBS       ║
          ╚══════════════════════════════════════╝ */}
      <div className="absolute top-0 left-0 w-full h-[600px] pointer-events-none overflow-hidden -z-10">
        <div className="absolute -top-20 -left-20 w-[300px] h-[300px] bg-[#6C4EFF]/[0.06] rounded-full blur-3xl animate-pulse-soft" />
        <div className="absolute top-10 right-0 w-[250px] h-[250px] bg-[#E14BA1]/[0.04] rounded-full blur-3xl animate-pulse-soft" style={{ animationDelay: '2s' }} />
        <div className="absolute top-40 left-1/3 w-[200px] h-[200px] bg-[#6C4EFF]/[0.03] rounded-full blur-3xl" />
      </div>

      <div className="max-w-[1360px] mx-auto px-5 lg:px-8 pt-5 lg:pt-8 pb-28 lg:pb-12 flex flex-col gap-10 lg:gap-14">

        {/* ╔══════════════════════════════════════╗
            ║   MOBILE SEARCH BAR                  ║
            ╚══════════════════════════════════════╝ */}
        <div className="block lg:hidden">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-[#9CA3AF]" />
            <input
              type="text"
              placeholder="Search for items, services, or vendors..."
              onFocus={() => navigate('/general-market')}
              readOnly
              className="w-full h-11 pl-11 pr-4 bg-[#FAFAFF] border border-[#E9E6F8] rounded-full text-[13px] text-[#111827] placeholder-[#9CA3AF] cursor-pointer"
            />
          </div>
        </div>

        {/* ╔══════════════════════════════════════╗
            ║   HERO CAROUSEL                      ║
            ╚══════════════════════════════════════╝ */}
        <section>
          <HeroCarousel />
        </section>

        {/* ╔══════════════════════════════════════╗
            ║   MARKET CARDS + TRENDING ITEMS      ║
            ║   Desktop: side-by-side layout       ║
            ║   Mobile: stacked                    ║
            ╚══════════════════════════════════════╝ */}
        <section className="flex flex-col lg:flex-row gap-8 lg:gap-10">

          {/* ── Market selection cards (left column on desktop) ── */}
          <div className="flex flex-row lg:flex-col gap-4 lg:gap-5 lg:w-[280px] lg:flex-shrink-0">
            {/* College Market */}
            <div className="flex-1 bg-white border border-[#E9E6F8]/70 rounded-[20px] p-5 lg:p-6 flex flex-col justify-between gap-4 hover:shadow-md transition-shadow">
              <div>
                <div className="w-11 h-11 bg-[#F4F1FF] rounded-[14px] flex items-center justify-center mb-3">
                  <GraduationCap className="w-5 h-5 text-[#6C4EFF] stroke-[1.8]" />
                </div>
                <h3 className="font-bold text-[15px] text-[#111827]">College Market</h3>
                <p className="text-[12px] text-[#9CA3AF] mt-1 leading-relaxed">
                  Buy, sell, or donate within your college community.
                </p>
              </div>
              <button
                onClick={() => handleGatedAction('/college-market')}
                className="inline-flex items-center gap-1 text-[12px] font-bold text-[#6C4EFF] hover:gap-2 transition-all text-left"
              >
                Explore College <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* General Market */}
            <div className="flex-1 bg-white border border-[#E9E6F8]/70 rounded-[20px] p-5 lg:p-6 flex flex-col justify-between gap-4 hover:shadow-md transition-shadow">
              <div>
                <div className="w-11 h-11 bg-[#F4F1FF] rounded-[14px] flex items-center justify-center mb-3">
                  <Store className="w-5 h-5 text-[#6C4EFF] stroke-[1.8]" />
                </div>
                <h3 className="font-bold text-[15px] text-[#111827]">General Market</h3>
                <p className="text-[12px] text-[#9CA3AF] mt-1 leading-relaxed">
                  Discover items listed by verified students across different colleges.
                </p>
              </div>
              <button
                onClick={() => handleGatedAction('/general-market')}
                className="inline-flex items-center gap-1 text-[12px] font-bold text-[#6C4EFF] hover:gap-2 transition-all text-left"
              >
                Explore General <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* ── Trending Items (right column on desktop) ── */}
          <div className="flex-1 flex flex-col gap-5">
            <div className="flex items-end justify-between">
              <h2 className="text-[18px] lg:text-[20px] font-bold text-[#111827]">Trending Items</h2>
              <button
                onClick={() => handleGatedAction('/general-market')}
                className="text-[12px] font-bold text-[#6C4EFF] flex items-center gap-0.5 hover:gap-1.5 transition-all text-left"
              >
                View All <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Mobile: horizontal scroll · Desktop: 4-col grid */}
            {loading ? (
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {[1, 2, 3, 4].map(n => <Skeleton key={n} />)}
              </div>
            ) : listings.length > 0 ? (
              <>
                {/* Mobile horizontal scroll */}
                <div className="flex lg:hidden gap-3 overflow-x-auto no-scrollbar pb-2 -mx-1 px-1">
                  {listings.map((item) => (
                    <div key={item._id} className="w-[155px] flex-shrink-0">
                      <ProductCard product={item} />
                    </div>
                  ))}
                </div>
                {/* Desktop grid */}
                <div className="hidden lg:grid grid-cols-4 gap-4">
                  {listings.map((item) => (
                    <ProductCard key={item._id} product={item} />
                  ))}
                </div>
              </>
            ) : (
              <div className="text-center py-12 text-[#9CA3AF]">
                <p className="text-sm font-medium">No items available yet</p>
              </div>
            )}
          </div>
        </section>

        {/* ╔══════════════════════════════════════╗
            ║   QUICK ACTIONS + TOP VENDORS        ║
            ╚══════════════════════════════════════╝ */}
        <section className="flex flex-col-reverse lg:flex-row gap-8 lg:gap-10">

          {/* Quick Actions */}
          <div className="lg:flex-1">
            <h2 className="text-[18px] lg:text-[20px] font-bold text-[#111827] mb-5">Quick Actions</h2>
            <div className="grid grid-cols-3 gap-4">
              {[
                { icon: Tag, label: 'Buy', sub: 'Find great items', action: () => navigate('/general-market'), color: 'text-[#6C4EFF]', bg: 'bg-[#F4F1FF]' },
                { icon: Tag, label: 'Sell', sub: 'List your items', action: () => handleGatedAction('/listing/new?type=sell'), color: 'text-emerald-600', bg: 'bg-[#EEF9F2]' },
                { icon: Heart, label: 'Donate', sub: 'Give to those in need', action: () => handleGatedAction('/listing/new?type=donate'), color: 'text-rose-500', bg: 'bg-rose-50' },
              ].map((item) => (
                <button
                  key={item.label}
                  onClick={item.action}
                  className="bg-white border border-[#E9E6F8]/70 rounded-[20px] p-5 flex flex-col items-center text-center gap-2.5 hover:shadow-md hover:-translate-y-0.5 transition-all group"
                >
                  <div className={`w-11 h-11 ${item.bg} rounded-full flex items-center justify-center group-hover:scale-110 transition-transform`}>
                    <item.icon className={`w-5 h-5 ${item.color} stroke-[1.8]`} />
                  </div>
                  <div>
                    <p className="font-bold text-[13px] text-[#111827]">{item.label}</p>
                    <p className="text-[10px] text-[#9CA3AF] mt-0.5 hidden sm:block">{item.sub}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Top Vendors Coming Soon — Full banner */}
          <div className="lg:flex-1">
            <h2 className="text-[18px] lg:text-[20px] font-bold text-[#111827] mb-5">
              Top Vendors <span className="text-[12px] font-semibold text-[#9CA3AF]">(Coming Soon)</span>
            </h2>
            <Link
              to="/vendors"
              onClick={(e) => {
                showToast('Vendor dashboard is coming soon!', 'info');
              }}
              className="block rounded-[20px] overflow-hidden h-[160px] lg:h-[180px] group"
            >
              <img
                src="/images/file_0000000089387207ae3efbac0454e8bd.png"
                alt="Vendor Section Coming Soon"
                className="w-full h-full object-cover object-center group-hover:scale-[1.02] transition-transform duration-500"
              />
            </Link>
          </div>
        </section>

        {/* ╔══════════════════════════════════════╗
            ║   TRUST FEATURES                     ║
            ╚══════════════════════════════════════╝ */}
        <section className="grid grid-cols-2 lg:grid-cols-4 gap-5 lg:gap-8 py-4 lg:py-8 border-t border-[#E9E6F8]/60">
          {[
            { icon: ShieldCheck, title: 'Trusted & Verified', sub: 'All users and vendors are verified for safety.', color: 'text-[#6C4EFF]', bg: 'bg-[#F4F1FF]' },
            { icon: BookOpen, title: 'Student Focused', sub: 'Built exclusively for engineering students.', color: 'text-emerald-600', bg: 'bg-[#EEF9F2]' },
            { icon: Lock, title: 'Secure Transactions', sub: 'Safe and secure payments and communications.', color: 'text-blue-600', bg: 'bg-blue-50' },
            { icon: MapPin, title: 'Local & Reliable', sub: 'Connect with trusted local vendors and peers.', color: 'text-orange-600', bg: 'bg-orange-50' },
          ].map((feat) => (
            <div key={feat.title} className="flex flex-col items-center text-center p-4 lg:p-6">
              <div className={`w-12 h-12 ${feat.bg} rounded-full flex items-center justify-center mb-3`}>
                <feat.icon className={`w-5 h-5 ${feat.color} stroke-[1.8]`} />
              </div>
              <h4 className="font-bold text-[13px] text-[#111827]">{feat.title}</h4>
              <p className="text-[11px] text-[#9CA3AF] mt-1 leading-relaxed max-w-[200px]">{feat.sub}</p>
            </div>
          ))}
        </section>

        {/* ╔══════════════════════════════════════╗
            ║   TESTIMONIALS                       ║
            ╚══════════════════════════════════════╝ */}
        <section className="flex flex-col gap-6">
          <div className="flex items-center justify-between">
            <h2 className="text-[18px] lg:text-[20px] font-bold text-[#111827]">What Students Say</h2>
            <div className="hidden lg:flex gap-2">
              <button
                onClick={() => setTestimonialIdx(Math.max(0, testimonialIdx - 1))}
                disabled={testimonialIdx === 0}
                className="w-8 h-8 rounded-full border border-[#E9E6F8] flex items-center justify-center text-[#9CA3AF] hover:text-[#111827] hover:border-[#6C4EFF]/30 disabled:opacity-30 transition-all"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => setTestimonialIdx(Math.min(testimonials.length - 1, testimonialIdx + 1))}
                disabled={testimonialIdx >= testimonials.length - 1}
                className="w-8 h-8 rounded-full border border-[#E9E6F8] flex items-center justify-center text-[#9CA3AF] hover:text-[#111827] hover:border-[#6C4EFF]/30 disabled:opacity-30 transition-all"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Mobile: horizontal scroll · Desktop: 3-col grid */}
          <div className="flex lg:hidden gap-4 overflow-x-auto no-scrollbar pb-2 -mx-1 px-1">
            {testimonials.map((t, i) => (
              <TestimonialCard key={i} t={t} />
            ))}
          </div>
          <div className="hidden lg:grid grid-cols-3 gap-6">
            {testimonials.map((t, i) => (
              <TestimonialCard key={i} t={t} />
            ))}
          </div>
        </section>

        {/* ╔══════════════════════════════════════╗
            ║   FOOTER                             ║
            ╚══════════════════════════════════════╝ */}
        <footer className="border-t border-[#E9E6F8]/60 pt-10 lg:pt-14">
          <div className="grid grid-cols-2 lg:grid-cols-6 gap-8 lg:gap-6">

            {/* Brand column */}
            <div className="col-span-2 lg:col-span-2 flex flex-col gap-4">
              <Link to="/">
                <Logo size={30} showText={true} textClass="text-[14px] font-bold text-[#111827]" />
              </Link>
              <p className="text-[12px] text-[#9CA3AF] leading-relaxed max-w-[260px]">
                The all-in-one marketplace for engineering students. Buy, sell, and donate with trust.
              </p>
              <div className="flex gap-3 mt-1">
                {[Facebook, Instagram, Twitter, Youtube, Linkedin].map((Icon, i) => (
                  <button
                    key={i}
                    onClick={(e) => handleMockClick(e, 'Social Media')}
                    className="w-8 h-8 rounded-full bg-[#FAFAFF] border border-[#E9E6F8]/70 flex items-center justify-center text-[#9CA3AF] hover:text-[#6C4EFF] hover:border-[#6C4EFF]/30 transition-all"
                  >
                    <Icon className="w-3.5 h-3.5" />
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
              <div key={col.title} className="flex flex-col gap-3">
                <h4 className="font-bold text-[13px] text-[#111827]">{col.title}</h4>
                <div className="flex flex-col gap-2">
                  {col.links.map(([label, href]) => (
                    href === '#' ? (
                      <button
                        key={label}
                        onClick={(e) => handleMockClick(e, label)}
                        className="text-[12px] text-[#9CA3AF] hover:text-[#6C4EFF] transition-colors text-left"
                      >
                        {label}
                      </button>
                    ) : (
                      <Link key={label} to={href} className="text-[12px] text-[#9CA3AF] hover:text-[#6C4EFF] transition-colors">
                        {label}
                      </Link>
                    )
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Copyright bar */}
          <div className="mt-10 pt-6 border-t border-[#E9E6F8]/60 flex flex-col sm:flex-row items-center justify-between gap-3 pb-4">
            <p className="text-[11px] text-[#9CA3AF]">© 2026 Engineering Market. All rights reserved.</p>
            <div className="flex gap-4">
              <button onClick={(e) => handleMockClick(e, 'Privacy Policy')} className="text-[11px] text-[#9CA3AF] hover:text-[#6C4EFF] transition-colors">Privacy Policy</button>
              <button onClick={(e) => handleMockClick(e, 'Terms of Service')} className="text-[11px] text-[#9CA3AF] hover:text-[#6C4EFF] transition-colors">Terms of Service</button>
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
  <div className="bg-white border border-[#E9E6F8]/70 rounded-[20px] p-5 flex flex-col justify-between gap-4 min-w-[260px] lg:min-w-0 hover:shadow-md transition-shadow">
    <div className="flex items-center gap-3">
      <div className={`w-10 h-10 rounded-full ${t.color} flex items-center justify-center font-bold text-[12px]`}>
        {t.initials}
      </div>
      <div>
        <p className="font-bold text-[13px] text-[#111827]">{t.name}</p>
        <p className="text-[10px] text-[#9CA3AF]">{t.dept}</p>
      </div>
    </div>
    <p className="text-[12px] text-[#6B7280] leading-relaxed italic">{t.quote}</p>
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map(n => (
        <Star key={n} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
      ))}
    </div>
  </div>
);

export default Home;
