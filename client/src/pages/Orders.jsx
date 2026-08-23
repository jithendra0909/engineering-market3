import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, HelpCircle, FileText, Calendar, 
  MapPin, Check, ChevronDown, ChevronUp, Copy, 
  MessageSquare, ShieldCheck, Eye, Printer, Truck, Laptop, Headset,
  Home as HomeIcon, User as UserIcon, Plus
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import './Orders.css';

const getMediaUrl = (path) => {
  if (!path) return '';
  let url = path;

  if (url.includes('cloudinary.com') && url.includes('/image/upload/') && url.toLowerCase().includes('.pdf')) {
    url = url.replace('/image/upload/', '/raw/upload/');
  }

  if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('data:')) {
    return url;
  }
  const isDev = !import.meta.env.PROD;
  const serverBase = isDev
    ? 'http://localhost:5000'
    : (import.meta.env.VITE_API_URL ? import.meta.env.VITE_API_URL.replace(/\/api\/?$/, '') : '');
  return `${serverBase}${url}`;
};

export const Orders = () => {
  const navigate = useNavigate();
  const { user, showToast } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('active'); // 'active' | 'past'
  const [expandedOrders, setExpandedOrders] = useState({});
  const [expandedDetails, setExpandedDetails] = useState({});
  const [selectedScreenshot, setSelectedScreenshot] = useState(null);

  const fetchOrders = async () => {
    try {
      const { data } = await api.get('/print/my-orders');
      setOrders(data);
    } catch (err) {
      console.error(err);
      showToast('Failed to load your print orders.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [showToast]);

  const copyToClipboard = (text, label) => {
    navigator.clipboard.writeText(text);
    showToast(`${label} copied to clipboard!`, 'success');
  };

  const toggleOrderExpand = (id) => {
    setExpandedOrders(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const toggleDetailsExpand = (id) => {
    setExpandedDetails(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'pending':
      case 'printing':
        return <span className="orders-status-chip in-progress">In Progress</span>;
      case 'out-for-delivery':
        return <span className="orders-status-chip out-for-delivery">Out for Delivery</span>;
      case 'delivered':
        return <span className="orders-status-chip delivered">At Your Desk</span>;
      case 'cancelled':
        return <span className="orders-status-chip cancelled">Cancelled</span>;
      default:
        return <span className="orders-status-chip" style={{ backgroundColor: '#f9fafb', color: '#4b5563', border: '1px solid #e5e7eb' }}>{status}</span>;
    }
  };

  const getLayoutLabel = (layout) => {
    switch (layout) {
      case 'single-side': return 'Single Side';
      case 'both-side': return 'Double Side';
      case 'four-pages': return '1/4 Layout';
      default: return layout;
    }
  };

  const formatFilename = (url) => {
    if (!url) return 'Print_Document.pdf';
    const parts = url.split('/');
    const lastPart = parts[parts.length - 1];
    return lastPart.substring(lastPart.indexOf('-') + 1) || lastPart;
  };

  const getStepTime = (baseDateStr, stepIndex, currentStatus) => {
    const base = new Date(baseDateStr);
    const format = (d) => {
      return d.toLocaleDateString(undefined, { 
        day: 'numeric', month: 'short' 
      }) + ', ' + d.toLocaleTimeString(undefined, { 
        hour: '2-digit', minute: '2-digit', hour12: true 
      });
    };

    if (stepIndex === 0) return format(base);
    if (stepIndex === 1) {
      if (['pending'].includes(currentStatus)) return '-';
      return format(new Date(base.getTime() + 3 * 60000));
    }
    if (stepIndex === 2) {
      if (['pending', 'paid'].includes(currentStatus)) return '-';
      return format(new Date(base.getTime() + 10 * 60000));
    }
    if (stepIndex === 3) {
      if (['pending', 'paid', 'printing'].includes(currentStatus)) return '-';
      return format(new Date(base.getTime() + 20 * 60000));
    }
    if (stepIndex === 4) {
      if (currentStatus !== 'delivered') return '-';
      return format(new Date(base.getTime() + 30 * 60000));
    }
    return '-';
  };

  const activeOrdersList = orders.filter(o => !['delivered', 'cancelled'].includes(o.status));
  const pastOrdersList = orders.filter(o => ['delivered', 'cancelled'].includes(o.status));
  const currentList = activeTab === 'active' ? activeOrdersList : pastOrdersList;

  return (
    <div className="orders-page-container">
      
      {/* HEADER */}
      <header className="orders-header">
        <div className="orders-header-inner">
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <button 
              onClick={() => navigate('/profile')}
              className="profile-icon-btn"
              style={{ border: '1px solid #ECECEC' }}
            >
              <ArrowLeft style={{ width: '20px', height: '20px', color: '#1f2937', strokeWidth: 2 }} />
            </button>
            <div style={{ textAlign: 'left' }}>
              <h1 style={{ fontSize: '17.5px', fontWeight: 700, color: '#1f2937', margin: 0, letterSpacing: '-0.025em' }}>My Orders</h1>
              <p style={{ fontSize: '11.5px', color: '#6B7280', fontWeight: 500, marginTop: '2px', margin: 0, lineHeight: 1 }}>Track and manage your print orders</p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <a href="tel:9391461855" style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13.5px', fontWeight: 600, color: '#4b5563', textDecoration: 'none' }}>
              <HelpCircle style={{ width: '18px', height: '18px', color: '#6b7280' }} />
              <span>Help</span>
            </a>
            
            <a 
              href="https://wa.me/9391461855" 
              target="_blank" 
              rel="noreferrer"
              className="profile-icon-btn"
              style={{ border: '1px solid #ECECEC', backgroundColor: '#ffffff' }}
              title="Contact WhatsApp"
            >
              <svg style={{ width: '20px', height: '20px', fill: '#10b981' }} viewBox="0 0 24 24">
                <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.514 2.266 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.502-5.724-1.455L0 24zm6.59-4.846c1.6.95 3.197 1.45 4.817 1.45 5.548 0 10.063-4.515 10.066-10.067.002-2.69-1.04-5.218-2.93-7.108C16.66 1.54 14.135.495 11.454.495c-5.553 0-10.07 4.515-10.074 10.069-.001 1.73.454 3.42 1.316 4.921l-.974 3.56 3.652-.958zm13.11-6.177c-.3-.15-1.782-.88-2.057-.98-.275-.1-.475-.15-.675.15-.2.3-.775.98-.95 1.18-.175.2-.35.225-.65.075-.3-.15-1.267-.467-2.414-1.492-.893-.797-1.495-1.78-1.67-2.08-.175-.3-.02-.463.13-.612.135-.133.3-.35.45-.525.15-.175.2-.3.3-.5.1-.2.05-.375-.025-.525-.075-.15-.675-1.625-.925-2.225-.244-.588-.492-.51-.675-.52-.172-.007-.37-.01-.568-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.782-.728 2.032-1.43.25-.702.25-1.303.175-1.43-.075-.127-.275-.202-.575-.352z"/>
              </svg>
            </a>
          </div>
        </div>
      </header>

      {/* SEGMENTED FILTER TABS */}
      <div className="orders-main-wrapper" style={{ textStyle: 'left' }}>
        <div className="orders-tab-bar">
          <button 
            onClick={() => setActiveTab('active')}
            className={`orders-tab-btn ${activeTab === 'active' ? 'active' : ''}`}
          >
            Active Prints
            <span style={{ marginLeft: '8px', width: '22px', height: '22px', borderRadius: '9999px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', fontWeight: 900, backgroundColor: activeTab === 'active' ? '#FAF9FF' : '#FAFAFA', color: activeTab === 'active' ? '#6D5DF6' : '#6b7280', border: '1px solid #ECECEC' }}>
              {activeOrdersList.length}
            </span>
          </button>
          
          <button 
            onClick={() => setActiveTab('past')}
            className={`orders-tab-btn ${activeTab === 'past' ? 'active' : ''}`}
          >
            Past History
            <span style={{ marginLeft: '8px', width: '22px', height: '22px', borderRadius: '9999px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', fontWeight: 900, backgroundColor: activeTab === 'past' ? '#FAF9FF' : '#FAFAFA', color: activeTab === 'past' ? '#6D5DF6' : '#6b7280', border: '1px solid #ECECEC' }}>
              {pastOrdersList.length}
            </span>
          </button>
        </div>
      </div>

      <main className="orders-main-wrapper" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        
        {/* STATUS BANNER */}
        <div style={{ width: '100%' }}>
          <img 
            src="/images/em_print_orders_banner.jpg" 
            alt="Printf Hub Classroom Delivery Banner" 
            style={{ width: '100%', height: 'auto', display: 'block', borderRadius: '22px', boxShadow: '0 10px 30px rgba(0,0,0,0.05)' }}
            onError={(e) => { e.target.style.display = 'none'; }}
          />
        </div>

        {/* ORDERS QUEUE */}
        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {[1, 2].map(i => (
              <div key={i} className="animate-pulse" style={{ height: '176px', backgroundColor: '#ffffff', borderRadius: '22px', border: '1px solid #ECECEC' }} />
            ))}
          </div>
        ) : currentList.length === 0 ? (
          <div className="orders-empty-card">
            <div style={{ width: '56px', height: '56px', backgroundColor: '#f9fafb', border: '1px solid #f3f4f6', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem auto', color: '#9CA3AF' }}>
              <FileText style={{ width: '28px', height: '28px' }} />
            </div>
            <h3 style={{ fontSize: '15px', fontWeight: 700, color: '#111827', marginBottom: '4px' }}>No Orders Found</h3>
            <p style={{ fontSize: '12.5px', color: '#6B7280', marginBottom: '1.5rem', fontWeight: 600 }}>
              There are no orders listed in this tab segment.
            </p>
            <button
              onClick={() => navigate('/vendors/print-studio')}
              style={{ backgroundColor: '#6D5DF6', color: '#ffffff', fontWeight: 700, fontSize: '13px', padding: '10px 24px', borderRadius: '12px', border: 'none', cursor: 'pointer' }}
            >
              Order Prints
            </button>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {currentList.map((order) => {
              const isExpanded = !!expandedOrders[order._id];
              const isDetailsExpanded = !!expandedDetails[order._id];
              const isCancelled = order.status === 'cancelled';
              
              const activeIndex = order.status === 'pending' ? 1 : 
                                  order.status === 'printing' ? 2 :
                                  order.status === 'out-for-delivery' ? 3 :
                                  order.status === 'delivered' ? 4 : 2;

              const orderFiles = order.files && order.files.length > 0 
                ? order.files 
                : [{
                    fileName: formatFilename(order.pdfFileUrl),
                    pdfFileUrl: order.pdfFileUrl,
                    pagesCount: 1,
                    layout: order.layout,
                    colorType: order.colorType,
                    binding: order.binding,
                    sets: order.sets,
                    instructions: order.instructions,
                    subtotal: order.totalPrice
                  }];

              const totalFilesCount = orderFiles.length;
              const totalPagesCount = orderFiles.reduce((acc, f) => acc + (f.pagesCount * f.sets), 0);
              const totalSetsCount = orderFiles.reduce((acc, f) => acc + f.sets, 0);

              return (
                <div 
                  key={order._id}
                  className="orders-card"
                >
                  
                  {/* Order Card Summary header */}
                  <div className="orders-card-header">
                    <div style={{ width: '44px', height: '44px', borderRadius: '9999px', backgroundColor: '#6D5DF6', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ffffff', flexShrink: 0 }}>
                      <FileText style={{ width: '22px', height: '22px' }} />
                    </div>

                    <div style={{ flex: 1, minWidth: 0, textAlign: 'left' }}>
                      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '12px' }}>
                        <div style={{ textAlign: 'left' }}>
                          <span style={{ fontSize: '12px', color: '#8C939F', fontWeight: 600, display: 'block' }}>Order ID</span>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '2px' }}>
                            <h4 style={{ fontSize: '15.5px', fontWeight: 700, color: '#374151', margin: 0, lineHeight: 1 }}>
                              {order._id.startsWith('mock') ? `EM-2025-05${order._id.substring(order._id.length - 2)}-001` : `EM-${new Date(order.createdAt).getFullYear()}-${order._id.substring(order._id.length - 8).toUpperCase()}`}
                            </h4>
                            <button 
                              onClick={() => copyToClipboard(order._id.startsWith('mock') ? `EM-2025-05${order._id.substring(order._id.length - 2)}-001` : `EM-${new Date(order.createdAt).getFullYear()}-${order._id.substring(order._id.length - 8).toUpperCase()}`, 'Order ID')}
                              className="profile-icon-btn"
                              style={{ width: '24px', height: '24px' }}
                            >
                              <Copy style={{ width: '14px', height: '14px', color: '#9ca3af' }} />
                            </button>
                          </div>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          {getStatusBadge(order.status)}
                          <button 
                            onClick={() => toggleOrderExpand(order._id)}
                            className="profile-icon-btn"
                            style={{ width: '32px', height: '32px', border: '1px solid #ECECEC', borderRadius: '8px', backgroundColor: '#ffffff' }}
                          >
                            {isExpanded ? <ChevronUp style={{ width: '18px', height: '18px', color: '#6B7280' }} /> : <ChevronDown style={{ width: '18px', height: '18px', color: '#6B7280' }} />}
                          </button>
                        </div>
                      </div>

                      {/* Card meta columns details */}
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '14px', marginTop: '1rem', fontSize: '12.5px', color: '#6B7280' }}>
                        <div style={{ textAlign: 'left' }}>
                          <span style={{ fontSize: '12px', color: '#8C939F', fontWeight: 600, display: 'block' }}>UPI Reference Note</span>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '4px' }}>
                            <span style={{ backgroundColor: '#FAF9FF', border: '1px solid rgba(109,93,246,0.15)', color: '#6D5DF6', fontWeight: 700, padding: '2px 10px', borderRadius: '8px', fontSize: '11px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                              <span style={{ fontSize: '10px', color: '#6D5DF6' }}>✪</span>
                              {order.upiReference}
                            </span>
                            <button 
                              onClick={() => copyToClipboard(order.upiReference, 'UPI Reference Code')}
                              className="profile-icon-btn"
                              style={{ width: '20px', height: '20px' }}
                            >
                              <Copy style={{ width: '12px', height: '12px', color: '#9ca3af' }} />
                            </button>
                          </div>
                        </div>

                        <div style={{ textAlign: 'left' }}>
                          <span style={{ fontSize: '12px', color: '#8C939F', fontWeight: 600, display: 'block' }}>Placed on</span>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '6px', color: '#6b7280', fontWeight: 500 }}>
                            <Calendar style={{ width: '16px', height: '16px', color: '#9CA3AF' }} />
                            {new Date(order.createdAt).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })}, {new Date(order.createdAt).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}
                          </div>
                        </div>

                        <div style={{ textAlign: 'left' }}>
                          <span style={{ fontSize: '12px', color: '#8C939F', fontWeight: 600, display: 'block' }}>Delivering to</span>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '6px', color: '#6b7280', fontWeight: 500 }}>
                            <MapPin style={{ width: '16px', height: '16px', color: '#9CA3AF' }} />
                            {order.department} • Room {order.section}
                          </div>
                        </div>
                      </div>

                    </div>
                  </div>

                  {/* EXPANDED DETAILS PORTAL BLOCK */}
                  {isExpanded && (
                    <div className="animate-slideDown" style={{ borderTop: '1px solid #ECECEC' }}>
                      
                      {/* Timeline progress line nodes */}
                      {!isCancelled && (
                        <div style={{ padding: '1.75rem 1.25rem', backgroundColor: 'rgba(250,249,255,0.4)', borderBottom: '1px solid #ECECEC', overflowX: 'auto' }}>
                          <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', minWidth: '350px' }}>
                            
                            <div style={{ position: 'absolute', left: '36px', right: '36px', top: '15px', height: '3px', zIndex: 0, display: 'flex', alignItems: 'center', justifyContent: 'space-between', pointerEvents: 'none', width: 'calc(100% - 72px)' }}>
                              <div style={{ height: '3px', flex: 1, margin: '0 2px', backgroundColor: activeIndex >= 1 ? '#10b981' : '#ECECEC' }} />
                              <div style={{ height: '3px', flex: 1, margin: '0 2px', backgroundColor: activeIndex >= 2 ? '#6D5DF6' : '#ECECEC' }} />
                              <div style={{ height: '3px', flex: 1, margin: '0 2px', backgroundColor: activeIndex >= 3 ? '#6D5DF6' : '#ECECEC' }} />
                              <div style={{ height: '3px', flex: 1, margin: '0 2px', backgroundColor: activeIndex >= 4 ? '#10b981' : '#ECECEC' }} />
                            </div>

                            {[
                              { label: 'Ordered', icon: Check },
                              { label: 'Paid (Verified)', icon: Check },
                              { label: 'Printing', icon: Printer },
                              { label: 'Out for Delivery', icon: Truck },
                              { label: 'At Your Desk', icon: Laptop }
                            ].map((step, idx) => {
                              const isDone = idx <= activeIndex;
                              const isCurrent = idx === activeIndex;
                              const stepTime = getStepTime(order.createdAt, idx, order.status);
                              const StepIcon = step.icon;

                              return (
                                <div key={idx} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', zIndex: 10, userSelect: 'none', maxWidth: '18%' }}>
                                  <div style={{ width: '32px', height: '32px', borderRadius: '9999px', border: '2px solid', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.3s ease', backgroundColor: isCurrent ? '#ffffff' : (isDone ? '#10b981' : '#ffffff'), borderColor: isCurrent ? '#6D5DF6' : (isDone ? '#10b981' : '#ECECEC'), color: isCurrent ? '#6D5DF6' : (isDone ? '#ffffff' : '#9CA3AF') }}>
                                    {isDone && !isCurrent ? (
                                      <Check style={{ width: '14px', height: '14px', strokeWidth: 3 }} />
                                    ) : (
                                      <StepIcon style={{ width: '18px', height: '18px', color: isCurrent ? '#6D5DF6' : '#9CA3AF', strokeWidth: 2.2 }} />
                                    )}
                                  </div>
                                  
                                  <span style={{ fontSize: '10px', marginTop: '8px', fontWeight: 900, textAlign: 'center', color: isCurrent ? '#6D5DF6' : (isDone ? '#111827' : '#9CA3AF') }}>
                                    {idx + 1}. {step.label}
                                  </span>
                                  
                                  <span style={{ fontSize: '8px', color: '#9CA3AF', fontWeight: 700, marginTop: '4px', textAlign: 'center' }}>
                                    {stepTime}
                                  </span>
                                </div>
                              );
                            })}

                          </div>
                        </div>
                      )}

                      {/* Accordion Details summary details */}
                      <div style={{ padding: '1.25rem' }}>
                        
                        <div style={{ border: '1px solid #ECECEC', borderRadius: '18px', backgroundColor: '#ffffff', padding: '1rem' }}>
                          
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingBottom: '14px', marginBottom: '14px', borderBottom: '1px solid #F5F5F5' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <FileText style={{ width: '16px', height: '16px', color: '#6D5DF6' }} />
                              <span style={{ fontSize: '13px', fontWeight: 900, color: '#111827' }}>Order Details</span>
                            </div>
                            <button 
                              type="button"
                              onClick={() => toggleDetailsExpand(order._id)}
                              className="profile-icon-btn"
                              style={{ width: '28px', height: '28px', border: '1px solid #ECECEC' }}
                            >
                              {isDetailsExpanded ? <ChevronUp style={{ width: '14px', height: '14px', color: '#6b7280' }} /> : <ChevronDown style={{ width: '14px', height: '14px', color: '#6b7280' }} />}
                            </button>
                          </div>

                          {/* Quick receipt values preview */}
                          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', fontSize: '12.5px', fontWeight: 600, color: '#6B7280' }}>
                            <div style={{ textAlign: 'left' }}>
                              <span style={{ fontSize: '9.5px', color: '#9CA3AF', textTransform: 'uppercase', fontWeight: 800, display: 'block' }}>Total Files</span>
                              <span style={{ color: '#111827', fontWeight: 700, marginTop: '2px', display: 'block' }}>{totalFilesCount}</span>
                            </div>
                            <div style={{ textAlign: 'left' }}>
                              <span style={{ fontSize: '9.5px', color: '#9CA3AF', textTransform: 'uppercase', fontWeight: 800, display: 'block' }}>Total Pages</span>
                              <span style={{ color: '#111827', fontWeight: 700, marginTop: '2px', display: 'block' }}>{totalPagesCount}</span>
                            </div>
                            <div style={{ textAlign: 'left' }}>
                              <span style={{ fontSize: '9.5px', color: '#9CA3AF', textTransform: 'uppercase', fontWeight: 800, display: 'block' }}>Total Sets</span>
                              <span style={{ color: '#111827', fontWeight: 700, marginTop: '2px', display: 'block' }}>{totalSetsCount}</span>
                            </div>
                            <div style={{ textAlign: 'left' }}>
                              <span style={{ fontSize: '9.5px', color: '#9CA3AF', textTransform: 'uppercase', fontWeight: 800, display: 'block' }}>Amount Paid</span>
                              <span style={{ color: '#6D5DF6', fontWeight: 900, marginTop: '2px', display: 'block' }}>₹{order.totalPrice.toFixed(2)}</span>
                            </div>
                          </div>

                          {/* Expanded Table & Receipt verification proof */}
                          {isDetailsExpanded && (
                            <div className="animate-fadeIn" style={{ marginTop: '1.25rem', borderTop: '1px solid #F5F5F5', paddingTop: '1.125rem', display: 'flex', flexDirection: 'column', gap: '1.25rem', textAlign: 'left' }}>
                              
                              <div>
                                <span style={{ fontSize: '10px', color: '#9CA3AF', textTransform: 'uppercase', fontWeight: 800, display: 'block', marginBottom: '8px' }}>Print Items List</span>
                                <div style={{ border: '1px solid #ECECEC', borderRadius: '12px', overflowX: 'auto', fontSize: '12.5px' }}>
                                  <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse', minWidth: '580px' }}>
                                    <thead>
                                      <tr style={{ backgroundColor: '#FAF9FF', borderBottom: '1px solid #ECECEC', color: '#9CA3AF', fontWeight: 700 }}>
                                        <th style={{ padding: '12px' }}>File Name</th>
                                        <th style={{ padding: '12px' }}>Pages</th>
                                        <th style={{ padding: '12px' }}>Layout</th>
                                        <th style={{ padding: '12px' }}>Color</th>
                                        <th style={{ padding: '12px' }}>Binding</th>
                                        <th style={{ padding: '12px', textAlign: 'right' }}>Price</th>
                                      </tr>
                                    </thead>
                                    <tbody style={{ fontWeight: 600 }}>
                                      {orderFiles.map((file, fIdx) => (
                                        <tr key={fIdx} style={{ borderBottom: '1px solid #ECECEC' }}>
                                          <td style={{ padding: '12px', color: '#111827', fontWeight: 700, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '240px' }}>{file.fileName}</td>
                                          <td style={{ padding: '12px', color: '#111827' }}>{file.pagesCount} pgs • {file.sets} sets</td>
                                          <td style={{ padding: '12px', textTransform: 'uppercase', color: '#6B7280' }}>{getLayoutLabel(file.layout)}</td>
                                          <td style={{ padding: '12px', textTransform: 'uppercase', color: '#6B7280' }}>{file.colorType === 'bw' ? 'B&W' : 'Color'}</td>
                                          <td style={{ padding: '12px', color: '#6B7280' }}>{file.binding === 'spiral' ? 'Spiral' : 'None'}</td>
                                          <td style={{ padding: '12px', textAlign: 'right', color: '#6D5DF6', fontWeight: 700 }}>
                                            ₹{file.subtotal?.toFixed(2) || (order.totalPrice / totalFilesCount).toFixed(2)}
                                          </td>
                                        </tr>
                                      ))}
                                    </tbody>
                                  </table>
                                </div>
                              </div>

                              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem' }}>
                                <div style={{ border: '1px solid #ECECEC', borderRadius: '12px', padding: '12px', display: 'flex', flexDirection: 'column', textAlign: 'left' }}>
                                  <span style={{ fontSize: '9.5px', color: '#9CA3AF', textTransform: 'uppercase', fontWeight: 800, display: 'block', marginBottom: '4px' }}>Delivering classroom location</span>
                                  <p style={{ fontSize: '13px', fontWeight: 700, color: '#111827', margin: 0 }}>
                                    Department: {order.department} • Room: {order.section}
                                  </p>
                                </div>
                                <div style={{ border: '1px solid #ECECEC', borderRadius: '12px', padding: '12px', display: 'flex', flexDirection: 'column', textAlign: 'left' }}>
                                  <span style={{ fontSize: '9.5px', color: '#9CA3AF', textTransform: 'uppercase', fontWeight: 800, display: 'block', marginBottom: '4px' }}>Delivery Date & Time slot</span>
                                  <p style={{ fontSize: '13px', fontWeight: 700, color: '#111827', margin: 0 }}>
                                    {new Date(order.deliveryDate).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}
                                  </p>
                                </div>
                              </div>

                              {orderFiles.some(f => f.instructions) && (
                                <div style={{ border: '1px solid #ECECEC', borderRadius: '12px', padding: '12px', backgroundColor: '#FAFAFA', textAlign: 'left' }}>
                                  <span style={{ fontSize: '9.5px', color: '#9CA3AF', textTransform: 'uppercase', fontWeight: 800, display: 'block', marginBottom: '4px' }}>Printing Instructions</span>
                                  <ul style={{ listStyleType: 'disc', paddingLeft: '1rem', fontSize: '12px', fontWeight: 600, color: '#6B7280', margin: 0 }}>
                                    {orderFiles.map((f, fIdx) => f.instructions && (
                                      <li key={fIdx}>
                                        <span style={{ fontWeight: 800, color: '#111827' }}>{f.fileName}:</span> "{f.instructions}"
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                              )}

                              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem', borderTop: '1px solid #F5F5F5', paddingTop: '1rem' }}>
                                
                                <div style={{ border: '1px solid #ECECEC', borderRadius: '12px', padding: '12px', backgroundColor: '#FAF9FF', position: 'relative', overflow: 'hidden', textAlign: 'left' }}>
                                  <span style={{ fontSize: '9.5px', color: '#9CA3AF', textTransform: 'uppercase', fontWeight: 800, display: 'block' }}>Payment Method</span>
                                  <span style={{ fontSize: '13px', fontWeight: 900, color: '#111827', marginTop: '2px', display: 'block' }}>UPI</span>
                                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '8px' }}>
                                    <span style={{ fontSize: '11px', fontWeight: 700, color: '#6B7280' }}>Ref Note: {order.upiReference}</span>
                                    <span style={{ backgroundColor: '#EEF9F2', color: '#059669', fontWeight: 800, fontSize: '8px', textTransform: 'uppercase', padding: '2px 8px', borderRadius: '9999px', border: '1px solid #a7f3d0', display: 'inline-flex', alignItems: 'center', gap: '2px' }}>
                                      <ShieldCheck style={{ width: '10px', height: '10px', fill: '#059669', stroke: '#ffffff' }} />
                                      Verified
                                    </span>
                                  </div>
                                </div>

                                <div style={{ border: '1px solid #ECECEC', borderRadius: '12px', padding: '12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#ffffff', textAlign: 'left' }}>
                                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                    {order.paymentScreenshotUrl ? (
                                      <div 
                                        onClick={() => setSelectedScreenshot(getMediaUrl(order.paymentScreenshotUrl))}
                                        style={{ width: '40px', height: '40px', backgroundColor: '#f3f4f6', border: '1px solid #e5e7eb', borderRadius: '8px', overflow: 'hidden', cursor: 'pointer', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                                      >
                                        <img 
                                          src={getMediaUrl(order.paymentScreenshotUrl)} 
                                          alt="" 
                                          style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                                        />
                                      </div>
                                    ) : (
                                      <div style={{ width: '40px', height: '40px', backgroundColor: '#f3f4f6', borderRadius: '8px', border: '1px dashed #d1d5db', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9ca3af', flexShrink: 0, fontSize: '10px' }}>
                                        No Image
                                      </div>
                                    )}
                                    <div>
                                      <span style={{ fontSize: '10px', color: '#9CA3AF', fontWeight: 700, display: 'block' }}>Receipt Image</span>
                                      <span style={{ fontSize: '11px', fontWeight: 800, color: '#374151' }}>Audit Proof</span>
                                    </div>
                                  </div>

                                  {order.paymentScreenshotUrl && (
                                    <button 
                                      type="button"
                                      onClick={() => setSelectedScreenshot(getMediaUrl(order.paymentScreenshotUrl))}
                                      style={{ color: '#6D5DF6', textDecoration: 'none', fontSize: '12px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '2px', backgroundColor: '#FAF9FF', border: '1px solid rgba(109,93,246,0.1)', padding: '6px 12px', borderRadius: '8px', cursor: 'pointer' }}
                                    >
                                      <Eye style={{ width: '14px', height: '14px' }} /> View
                                    </button>
                                  )}
                                </div>

                              </div>

                            </div>
                          )}

                          <button 
                            type="button"
                            onClick={() => toggleDetailsExpand(order._id)}
                            style={{ width: '100%', marginTop: '1rem', height: '44px', border: '1px solid #EBEBEB', color: '#6D5DF6', fontWeight: 700, fontSize: '13px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', backgroundColor: '#ffffff', cursor: 'pointer' }}
                          >
                            View Full Details
                            {isDetailsExpanded ? <ChevronUp style={{ width: '16px', height: '16px' }} /> : <ChevronDown style={{ width: '16px', height: '16px' }} />}
                          </button>

                        </div>

                      </div>
                    </div>
                  )}

                </div>
              );
            })}
          </div>
        )}

        {/* HELP CARD */}
        <div style={{ backgroundColor: '#ffffff', borderRadius: '22px', border: '1px solid #ECECEC', padding: '1.25rem', display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '12px', boxShadow: '0 10px 30px rgba(0,0,0,0.05)', textAlign: 'left' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div style={{ width: '44px', height: '44px', backgroundColor: '#fff1f2', border: '1px solid #ffe4e6', borderRadius: '9999px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#6D5DF6', flexShrink: 0 }}>
              <Headset style={{ width: '22px', height: '22px' }} />
            </div>
            <div>
              <h4 style={{ fontSize: '13px', fontWeight: 800, color: '#111827', margin: 0 }}>Need Help with your order?</h4>
              <p style={{ fontSize: '11.5px', color: '#6B7280', marginTop: '2px', fontWeight: 600, margin: 0 }}>Contact us on WhatsApp: <span style={{ color: '#6D5DF6', fontWeight: 900 }}>9391461855</span></p>
            </div>
          </div>
          <a 
            href="https://wa.me/9391461855"
            target="_blank"
            rel="noreferrer"
            style={{ height: '40px', paddingLeft: '1.125rem', paddingRight: '1.125rem', border: '1px solid #ECECEC', backgroundColor: '#ffffff', color: '#111827', fontWeight: 700, fontSize: '12.5px', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '6px', textDecoration: 'none' }}
          >
            Chat with Us
          </a>
        </div>

      </main>

      {/* LIGHTBOX RECEIPT OVERLAY */}
      {selectedScreenshot && (
        <div 
          onClick={() => setSelectedScreenshot(null)}
          style={{ position: 'fixed', inset: 0, zIndex: 50, backgroundColor: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem', cursor: 'pointer' }}
        >
          <div style={{ maxWidth: '500px', width: '100%', backgroundColor: '#ffffff', borderRadius: '24px', overflow: 'hidden', padding: '8px', position: 'relative', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)' }}>
            <img 
              src={selectedScreenshot} 
              alt="Audit Screenshot proof" 
              style={{ width: '100%', maxHeight: '75vh', objectFit: 'contain', borderRadius: '16px', display: 'block' }} 
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="%239CA3AF" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>';
              }}
            />
          </div>
        </div>
      )}

    </div>
  );
};

export default Orders;
