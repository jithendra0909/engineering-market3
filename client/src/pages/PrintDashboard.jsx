import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Menu, Bell, User, Copy, Phone, Download, 
  ChevronDown, CheckCircle, Play, FileText, 
  Truck, RefreshCw, Headset, ArrowLeft, Grid, 
  Search, ExternalLink, Check, Clock, XCircle, 
  AlertCircle, Eye, ChevronUp, CheckSquare,
  Printer, Calendar, Hash, BookOpen, Layers
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import './PrintDashboard.css';

export const PrintDashboard = () => {
  const navigate = useNavigate();
  const { user, isAdmin, showToast } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('verification');
  
  const [showAllVerification, setShowAllVerification] = useState(false);
  const [showAllActive, setShowAllActive] = useState(false);
  const [showAllDelivery, setShowAllDelivery] = useState(false);
  
  const [selectedClassroom, setSelectedClassroom] = useState(null);
  const [selectedScreenshot, setSelectedScreenshot] = useState(null);
  
  const [downloadingFiles, setDownloadingFiles] = useState(new Set());
  const [expandedOrders, setExpandedOrders] = useState(new Set());

  const fetchAllOrders = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/print/all-orders');
      setOrders(data);
    } catch (err) {
      console.error(err);
      showToast('Failed to load printing orders queue.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user && !isAdmin && user.role !== 'admin') {
      showToast('Unauthorized access to Print Dashboard', 'error');
      navigate('/');
      return;
    }
    fetchAllOrders();
  }, [user, isAdmin]);

  const updateStatus = async (id, newStatus) => {
    try {
      await api.put(`/print/orders/${id}/status`, { status: newStatus });
      showToast(`Order status updated to ${newStatus}!`, 'success');
      fetchAllOrders();
    } catch (err) {
      showToast('Failed to update order status.', 'error');
    }
  };

  const copyToClipboard = (text, label) => {
    navigator.clipboard.writeText(text);
    showToast(`${label} copied to clipboard!`, 'success');
  };

  const toggleExpanded = (orderId) => {
    setExpandedOrders(prev => {
      const next = new Set(prev);
      if (next.has(orderId)) next.delete(orderId);
      else next.add(orderId);
      return next;
    });
  };

  const fetchPdfBlob = async (url, mode, fileName) => {
    if (url.includes('supabase.co')) {
      const response = await fetch(url);
      if (!response.ok) throw new Error('Failed to fetch from Supabase');
      return await response.blob();
    }
    
    if (url.startsWith('/api/print/file/')) {
      let endpoint = url.replace('/api', '');
      if (mode === 'download') endpoint += '?download=true';
      const response = await api.get(endpoint, { responseType: 'blob' });
      return response.data;
    }
    
    const response = await api.get('/print/proxy-pdf', {
      params: { url, mode, fileName },
      responseType: 'blob'
    });
    return response.data;
  };

  const handleOpenPrintFile = async (url, fileName = 'document.pdf') => {
    if (!url) {
      showToast('No PDF link available for this file.', 'error');
      return;
    }
    if (url.startsWith('large-file://')) {
      showToast('This is a registered reference. Student brings the original document.', 'info');
      return;
    }
    showToast('Preparing PDF for viewing...', 'info');
    try {
      const blob = await fetchPdfBlob(url, 'view', fileName);
      const blobUrl = URL.createObjectURL(new Blob([blob], { type: 'application/pdf' }));
      window.open(blobUrl, '_blank', 'noopener,noreferrer');
    } catch (e) {
      console.error('Failed to open PDF:', e);
      const errMsg = e.response?.data?.message || 'Failed to open PDF file from server.';
      showToast(errMsg, 'error');
    }
  };

  const handleDownloadFile = async (url, fileName = 'document.pdf') => {
    if (!url) {
      showToast('No download link available for this file.', 'error');
      return;
    }
    if (url.startsWith('large-file://')) {
      showToast(`Registered reference: ${fileName}. Student brings original.`, 'info');
      return;
    }

    const fileKey = url;
    setDownloadingFiles(prev => new Set(prev).add(fileKey));

    try {
      showToast(`Downloading ${fileName}...`, 'info');
      const blob = await fetchPdfBlob(url, 'download', fileName);
      const blobUrl = URL.createObjectURL(new Blob([blob], { type: 'application/pdf' }));
      const a = document.createElement('a');
      a.href = blobUrl;
      a.download = fileName || 'document.pdf';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setTimeout(() => URL.revokeObjectURL(blobUrl), 5000);
      showToast(`Downloaded ${fileName}!`, 'success');
    } catch (e) {
      console.error('Download failed:', e);
      const errMsg = e.response?.data?.message || `Failed to download ${fileName}`;
      showToast(errMsg, 'error');
    } finally {
      setDownloadingFiles(prev => {
        const next = new Set(prev);
        next.delete(fileKey);
        return next;
      });
    }
  };

  const downloadAllFiles = (files) => {
    if (!files || files.length === 0) {
      showToast('No files attached to this order.', 'error');
      return;
    }
    showToast(`Downloading ${files.length} file(s)...`, 'info');
    files.forEach((file, i) => {
      setTimeout(() => handleDownloadFile(file.pdfFileUrl, file.fileName), i * 600);
    });
  };

  const verificationQueue = orders.filter(o => o.status === 'pending');
  const activeJobs = orders.filter(o => o.status === 'printing');
  const deliveryLogs = orders.filter(o => o.status === 'out-for-delivery');

  const classroomChips = ['CSE-2', 'IT-2', 'ECE-3', 'DS-3'];
  const getClassroomCount = (classroom) => {
    const [dept, sec] = classroom.split('-');
    return activeJobs.filter(o => o.department === dept && o.section === sec).length;
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });
  };
  
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(undefined, { day: '2-digit', month: 'short', year: 'numeric' });
  };

  const getFilteredActiveJobs = () => {
    if (!selectedClassroom) return activeJobs;
    const [dept, sec] = selectedClassroom.split('-');
    return activeJobs.filter(o => o.department === dept && o.section === sec);
  };
  const filteredActiveJobs = getFilteredActiveJobs();

  const calcSheets = (file) => {
    const pages = file.pagesCount || 1;
    const sets = file.sets || 1;
    if (file.layout === 'both-side') return Math.ceil(pages / 2) * sets;
    if (file.layout === 'four-pages') return Math.ceil(pages / 4) * sets;
    return pages * sets;
  };

  const FileDetailCard = ({ file, idx }) => {
    const isDownloading = downloadingFiles.has(file.pdfFileUrl);
    const sheetsNeeded = calcSheets(file);
    const totalPages = (file.pagesCount || 1) * (file.sets || 1);
    
    return (
      <motion.div 
        key={idx} 
        initial={{ opacity: 0, y: 5 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: idx * 0.05 }}
        className="print-dash-file-card"
      >
        {/* File Header */}
        <div className="print-dash-file-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1, minWidth: 0 }}>
            <div className="print-dash-file-icon-box">
              <FileText style={{ width: '18px', height: '18px', color: '#f43f5e' }} />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <p className="print-dash-file-title" title={file.fileName}>
                {file.fileName}
              </p>
              <p className="print-dash-file-sub">
                File {idx + 1} • ₹{file.subtotal?.toFixed(2) || '—'}
              </p>
            </div>
          </div>
          <div style={{ textAlign: 'right', flexShrink: 0 }}>
            <span className="print-dash-badge-purple">
              {file.sets} {file.sets === 1 ? 'Copy' : 'Copies'}
            </span>
          </div>
        </div>
        
        {/* Print Specifications Grid */}
        <div className="print-dash-file-body">
          <div className="print-dash-stat-grid">
            <div className="print-dash-stat-box blue">
              <p className="print-dash-stat-title">Pages</p>
              <p className="print-dash-stat-val">{file.pagesCount}</p>
            </div>
            <div className="print-dash-stat-box purple">
              <p className="print-dash-stat-title">Total Print</p>
              <p className="print-dash-stat-val">{totalPages}</p>
            </div>
            <div className="print-dash-stat-box emerald">
              <p className="print-dash-stat-title">Sheets</p>
              <p className="print-dash-stat-val">{sheetsNeeded}</p>
            </div>
          </div>
          
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
            <span style={{ padding: '4px 10px', borderRadius: '8px', fontSize: '11px', fontWeight: 700, border: '1px solid', backgroundColor: file.colorType === 'color' ? '#fffbeb' : '#f9fafb', color: file.colorType === 'color' ? '#92400e' : '#374151', borderColor: file.colorType === 'color' ? '#fde68a' : '#e5e7eb' }}>
              {file.colorType === 'color' ? '🎨 Color' : '⬛ B&W'}
            </span>
            <span style={{ padding: '4px 10px', borderRadius: '8px', fontSize: '11px', fontWeight: 700, border: '1px solid', backgroundColor: file.layout === 'both-side' ? '#ecfdf5' : (file.layout === 'four-pages' ? '#faf5ff' : '#f0f9ff'), color: file.layout === 'both-side' ? '#065f46' : (file.layout === 'four-pages' ? '#6b21a8' : '#075985'), borderColor: file.layout === 'both-side' ? '#a7f3d0' : (file.layout === 'four-pages' ? '#e9d5ff' : '#bae6fd') }}>
              {file.layout === 'both-side' ? '🔄 Double-Sided' : file.layout === 'four-pages' ? '📊 4-in-1' : '📄 Single-Sided'}
            </span>
            <span style={{ padding: '4px 10px', borderRadius: '8px', fontSize: '11px', fontWeight: 700, border: '1px solid', backgroundColor: file.binding === 'spiral' ? '#e0e7ff' : '#f9fafb', color: file.binding === 'spiral' ? '#3730a3' : '#6b7280', borderColor: file.binding === 'spiral' ? '#c7d2fe' : '#e5e7eb' }}>
              {file.binding === 'spiral' ? '🌀 Spiral Bind' : '📎 No Binding'}
            </span>
          </div>
          
          {file.instructions && (
            <div className="print-dash-note-box">
              <span style={{ fontWeight: 800, color: '#b45309' }}>📝 Student Note:</span> {file.instructions}
            </div>
          )}
        </div>
        
        {/* Action Buttons */}
        <div className="print-dash-file-footer">
          <button
            onClick={() => handleOpenPrintFile(file.pdfFileUrl, file.fileName)}
            className="print-dash-btn-outline"
          >
            <ExternalLink style={{ width: '16px', height: '16px' }} /> Open PDF
          </button>
          <button
            onClick={() => handleDownloadFile(file.pdfFileUrl, file.fileName)}
            disabled={isDownloading}
            className="print-dash-btn-primary"
            style={{ opacity: isDownloading ? 0.6 : 1 }}
          >
            {isDownloading ? (
              <>
                <RefreshCw style={{ width: '16px', height: '16px' }} className="animate-spin" /> Downloading…
              </>
            ) : (
              <>
                <Download style={{ width: '16px', height: '16px' }} /> Download
              </>
            )}
          </button>
        </div>
      </motion.div>
    );
  };

  const OrderInfoGrid = ({ order, compact = false }) => {
    const totalPages = order.files?.reduce((acc, f) => acc + (f.pagesCount * f.sets), 0) || 0;
    const totalSheets = order.files?.reduce((acc, f) => acc + calcSheets(f), 0) || 0;
    const hasColor = order.files?.some(f => f.colorType === 'color');
    const hasBinding = order.files?.some(f => f.binding === 'spiral');
    
    return (
      <div style={{ display: 'grid', gridTemplateColumns: compact ? 'repeat(2, 1fr)' : 'repeat(3, 1fr)', gap: '12px', fontSize: '12.5px' }}>
        <div>
          <span style={{ fontSize: '10px', color: '#9CA3AF', fontWeight: 700, display: 'block', textTransform: 'uppercase' }}>👤 Student</span>
          <span style={{ color: '#1f2937', fontWeight: 700 }}>{order.studentName}</span>
        </div>
        <div>
          <span style={{ fontSize: '10px', color: '#9CA3AF', fontWeight: 700, display: 'block', textTransform: 'uppercase' }}>🆔 Reg. Number</span>
          <span style={{ color: '#1f2937', fontWeight: 600 }}>{order.registrationNumber || '—'}</span>
        </div>
        <div>
          <span style={{ fontSize: '10px', color: '#9CA3AF', fontWeight: 700, display: 'block', textTransform: 'uppercase' }}>📞 Contact</span>
          <a href={`tel:${order.contactNumber}`} style={{ color: '#6D5DF6', fontWeight: 700, textDecoration: 'none' }}>
            {order.contactNumber}
          </a>
        </div>
        <div>
          <span style={{ fontSize: '10px', color: '#9CA3AF', fontWeight: 700, display: 'block', textTransform: 'uppercase' }}>🏫 Dept / Section</span>
          <span style={{ color: '#1f2937', fontWeight: 600 }}>{order.department} • Section {order.section}</span>
        </div>
        <div>
          <span style={{ fontSize: '10px', color: '#9CA3AF', fontWeight: 700, display: 'block', textTransform: 'uppercase' }}>📅 Delivery Date</span>
          <span style={{ color: '#1f2937', fontWeight: 600 }}>{order.deliveryDate ? formatDate(order.deliveryDate) : '—'}</span>
        </div>
        <div>
          <span style={{ fontSize: '10px', color: '#9CA3AF', fontWeight: 700, display: 'block', textTransform: 'uppercase' }}>💰 Total Paid</span>
          <span style={{ color: '#6D5DF6', fontWeight: 900, fontSize: '15px' }}>₹{order.totalPrice?.toFixed(2)}</span>
        </div>
        {!compact && (
          <>
            <div>
              <span style={{ fontSize: '10px', color: '#9CA3AF', fontWeight: 700, display: 'block', textTransform: 'uppercase' }}>📄 Total Pages</span>
              <span style={{ color: '#1f2937', fontWeight: 700, fontSize: '14px' }}>{totalPages}</span>
            </div>
            <div>
              <span style={{ fontSize: '10px', color: '#9CA3AF', fontWeight: 700, display: 'block', textTransform: 'uppercase' }}>📋 Total Sheets</span>
              <span style={{ color: '#1f2937', fontWeight: 700, fontSize: '14px' }}>{totalSheets}</span>
            </div>
            <div>
              <span style={{ fontSize: '10px', color: '#9CA3AF', fontWeight: 700, display: 'block', textTransform: 'uppercase' }}>🏷️ Print Type</span>
              <span style={{ color: '#374151', fontWeight: 600, fontSize: '12px' }}>
                {hasColor ? '🎨 Color' : '⬛ B&W'}{hasBinding ? ' • 🌀 Spiral' : ''}
              </span>
            </div>
          </>
        )}
      </div>
    );
  };

  const PaymentProof = ({ order }) => (
    <div className="print-dash-payment-box">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ fontSize: '10px', color: '#059669', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em' }}>💳 Payment Verification</span>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <div style={{ flex: 1 }}>
          <span style={{ fontSize: '10px', color: '#6b7280', fontWeight: 700, display: 'block', textTransform: 'uppercase' }}>UPI Reference</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
            <span style={{ backgroundColor: '#ffffff', border: '1px solid #a7f3d0', color: '#047857', fontWeight: 700, padding: '4px 12px', borderRadius: '8px', fontSize: '12px', fontFamily: 'monospace' }}>
              {order.upiReference}
            </span>
            <button 
              onClick={() => copyToClipboard(order.upiReference, 'UPI reference')}
              className="profile-icon-btn"
              style={{ width: '28px', height: '28px' }}
            >
              <Copy style={{ width: '14px', height: '14px', color: '#9ca3af' }} />
            </button>
          </div>
        </div>
        {order.paymentScreenshotUrl && (
          <button 
            onClick={() => setSelectedScreenshot(order.paymentScreenshotUrl)}
            style={{ width: '56px', height: '56px', backgroundColor: '#ffffff', border: '2px solid #a7f3d0', borderRadius: '12px', overflow: 'hidden', flexShrink: 0, cursor: 'pointer', padding: 0 }}
          >
            <img src={order.paymentScreenshotUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          </button>
        )}
      </div>
    </div>
  );

  const FilesSection = ({ order }) => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Layers style={{ width: '16px', height: '16px', color: '#9ca3af' }} />
          <span style={{ fontSize: '11px', color: '#6b7280', fontWeight: 800, textTransform: 'uppercase' }}>
            Files to Print ({order.files?.length})
          </span>
        </div>
        {order.files?.length > 1 && (
          <button
            onClick={() => downloadAllFiles(order.files)}
            style={{ fontSize: '11px', fontWeight: 700, color: '#6D5DF6', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
          >
            <Download style={{ width: '14px', height: '14px' }} /> Download All
          </button>
        )}
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {order.files?.map((file, idx) => (
          <FileDetailCard key={idx} file={file} idx={idx} />
        ))}
      </div>
    </div>
  );

  return (
    <div className="print-dash-page">
      
      {/* HEADER */}
      <header className="print-dash-header">
        <div className="print-dash-header-inner">
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <button 
              onClick={() => navigate('/vendors/print-studio')} 
              className="profile-icon-btn"
              style={{ width: '44px', height: '44px', border: '1px solid #E5E7EB' }}
            >
              <ArrowLeft style={{ width: '20px', height: '20px', color: '#4b5563', strokeWidth: 2.5 }} />
            </button>
            <div style={{ width: '1px', height: '24px', backgroundColor: '#e5e7eb' }} />
            <div style={{ textAlign: 'left' }}>
              <h1 style={{ fontSize: '16px', fontWeight: 700, color: '#111827', margin: 0, lineHeight: 1 }}>EM Print Studio</h1>
              <p style={{ fontSize: '11px', color: '#6B7280', fontWeight: 500, marginTop: '4px', margin: 0 }}>Print Dashboard</p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <button 
              onClick={fetchAllOrders}
              className="profile-icon-btn"
              style={{ width: '40px', height: '40px', border: '1px solid #E5E7EB', backgroundColor: '#ffffff' }}
            >
              <RefreshCw style={{ width: '18px', height: '18px', color: '#6b7280' }} />
            </button>
            <div style={{ width: '40px', height: '40px', borderRadius: '9999px', backgroundColor: '#FAF9FF', border: '1px solid rgba(109,93,246,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#6D5DF6', fontWeight: 700, fontSize: '13px' }}>
              EP
            </div>
          </div>
        </div>
      </header>

      <main className="print-dash-main">

        {/* SEGMENTED TABS */}
        <div className="print-dash-tabs">
          {[
            { id: 'verification', label: 'Verify', count: verificationQueue.length },
            { id: 'active', label: 'Active', count: activeJobs.length },
            { id: 'delivery', label: 'Delivery', count: deliveryLogs.length }
          ].map(tab => {
            const isSelected = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`print-dash-tab-btn ${isSelected ? 'selected' : ''}`}
              >
                <span>{tab.label}</span>
                <span className={`print-dash-tab-badge ${isSelected ? 'selected' : 'unselected'}`}>
                  {tab.count}
                </span>
              </button>
            );
          })}
        </div>

        {/* TAB CONTENT */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

          {/* VERIFICATION QUEUE */}
          {activeTab === 'verification' && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}
            >
              <div style={{ textAlign: 'left' }}>
                <h2 style={{ fontSize: '17px', fontWeight: 700, color: '#111827', margin: 0 }}>Verification Queue</h2>
                <p style={{ fontSize: '12px', color: '#6B7280', fontWeight: 500, marginTop: '4px', margin: 0 }}>Verify payments and start printing</p>
              </div>

              {verificationQueue.length === 0 ? (
                <div className="print-dash-order-card" style={{ padding: '3rem', textAlign: 'center' }}>
                  <div style={{ width: '56px', height: '56px', backgroundColor: '#ecfdf5', border: '1px solid #a7f3d0', color: '#059669', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem auto' }}>
                    <Check style={{ width: '24px', height: '24px', strokeWidth: 3 }} />
                  </div>
                  <h3 style={{ fontSize: '15.5px', fontWeight: 700, color: '#1f2937', margin: 0 }}>All Payments Verified</h3>
                  <p style={{ fontSize: '12px', color: '#6b7280', marginTop: '4px', margin: 0 }}>Verification queue is completely clear!</p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                  {(showAllVerification ? verificationQueue : verificationQueue.slice(0, 3)).map(order => {
                    const isExpanded = expandedOrders.has(order._id);
                    return (
                      <motion.div 
                        key={order._id}
                        layout
                        className="print-dash-order-card"
                      >
                        <div style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                              <div style={{ width: '40px', height: '40px', backgroundColor: '#FAF9FF', border: '1px solid rgba(109,93,246,0.15)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#6D5DF6', flexShrink: 0 }}>
                                <FileText style={{ width: '20px', height: '20px' }} />
                              </div>
                              <div>
                                <span style={{ fontSize: '10px', color: '#6B7280', fontWeight: 700, display: 'block', textTransform: 'uppercase' }}>Order ID</span>
                                <span style={{ fontSize: '14px', fontWeight: 700, color: '#1f2937', display: 'block', marginTop: '2px' }}>
                                  {`EM-${new Date(order.createdAt).getFullYear()}-${order._id.substring(order._id.length - 8).toUpperCase()}`}
                                </span>
                              </div>
                            </div>
                            <div style={{ textAlign: 'right' }}>
                              <span style={{ fontSize: '10px', color: '#6B7280', fontWeight: 700, display: 'block', textTransform: 'uppercase' }}>Placed At</span>
                              <span style={{ fontSize: '12.5px', fontWeight: 600, color: '#374151', display: 'block', marginTop: '2px' }}>
                                {formatTime(order.createdAt)}
                              </span>
                            </div>
                          </div>

                          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px', borderTop: '1px solid #F3F4F6', paddingTop: '1rem', fontSize: '12.5px' }}>
                            <div>
                              <span style={{ fontSize: '10px', color: '#9CA3AF', fontWeight: 700, display: 'block', textTransform: 'uppercase' }}>👤 Student</span>
                              <span style={{ color: '#1f2937', fontWeight: 700 }}>{order.studentName}</span>
                            </div>
                            <div>
                              <span style={{ fontSize: '10px', color: '#9CA3AF', fontWeight: 700, display: 'block', textTransform: 'uppercase' }}>💰 Amount</span>
                              <span style={{ color: '#6D5DF6', fontWeight: 900, fontSize: '15px' }}>₹{order.totalPrice?.toFixed(2)}</span>
                            </div>
                          </div>

                          <button
                            onClick={() => toggleExpanded(order._id)}
                            style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', fontSize: '11.5px', fontWeight: 700, color: '#9ca3af', background: 'none', border: 'none', cursor: 'pointer', paddingTop: '6px' }}
                          >
                            {isExpanded ? 'Hide' : 'Show'} Full Details
                            <ChevronDown style={{ width: '14px', height: '14px', transform: isExpanded ? 'rotate(180deg)' : 'none' }} />
                          </button>
                        </div>

                        <AnimatePresence>
                          {isExpanded && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: 'auto', opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.25 }}
                              style={{ overflow: 'hidden' }}
                            >
                              <div style={{ padding: '0 1.25rem 1.25rem 1.25rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                <div style={{ backgroundColor: '#F8FAFC', borderRadius: '16px', padding: '1rem', border: '1px solid #E5E7EB' }}>
                                  <OrderInfoGrid order={order} />
                                </div>
                                <PaymentProof order={order} />
                                <FilesSection order={order} />
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>

                        <div style={{ padding: '0 1.25rem 1.25rem 1.25rem' }}>
                          <button
                            onClick={() => updateStatus(order._id, 'printing')}
                            style={{ width: '100%', height: '52px', borderRadius: '16px', border: '2px solid #6D5DF6', color: '#6D5DF6', fontWeight: 700, fontSize: '13.5px', backgroundColor: '#ffffff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
                          >
                            <CheckSquare style={{ width: '18px', height: '18px' }} />
                            Verify Payment & Start Printing
                          </button>
                        </div>
                      </motion.div>
                    );
                  })}

                  {verificationQueue.length > 3 && (
                    <button
                      onClick={() => setShowAllVerification(!showAllVerification)}
                      style={{ width: '100%', height: '50px', backgroundColor: '#ffffff', border: '1px solid #E5E7EB', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', fontSize: '13px', fontWeight: 700, color: '#4b5563', cursor: 'pointer' }}
                    >
                      <span>{showAllVerification ? 'View Less' : `View All (${verificationQueue.length})`}</span>
                      <ChevronDown style={{ width: '16px', height: '16px', transform: showAllVerification ? 'rotate(180deg)' : 'none' }} />
                    </button>
                  )}
                </div>
              )}
            </motion.div>
          )}

          {/* ACTIVE JOBS */}
          {activeTab === 'active' && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}
            >
              <div style={{ textAlign: 'left' }}>
                <h2 style={{ fontSize: '17px', fontWeight: 700, color: '#111827', margin: 0 }}>Active Job Queue</h2>
                <p style={{ fontSize: '12px', color: '#6B7280', fontWeight: 500, marginTop: '4px', margin: 0 }}>Print and prepare orders for delivery</p>
              </div>

              {/* Classroom Chips */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', overflowX: 'auto', paddingBottom: '4px' }}>
                <button 
                  onClick={() => setSelectedClassroom(null)}
                  style={{ padding: '10px', borderRadius: '12px', border: `1px solid ${!selectedClassroom ? '#6D5DF6' : '#E5E7EB'}`, backgroundColor: !selectedClassroom ? '#6D5DF6' : '#ffffff', color: !selectedClassroom ? '#ffffff' : '#6B7280', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, cursor: 'pointer' }}
                >
                  <Grid style={{ width: '18px', height: '18px' }} />
                </button>
                {classroomChips.map(cName => {
                  const count = getClassroomCount(cName);
                  const isSelected = selectedClassroom === cName;
                  return (
                    <button
                      key={cName}
                      onClick={() => setSelectedClassroom(isSelected ? null : cName)}
                      style={{ height: '38px', paddingLeft: '1rem', paddingRight: '1rem', borderRadius: '12px', border: `1px solid ${isSelected ? '#6D5DF6' : '#E5E7EB'}`, backgroundColor: isSelected ? '#6D5DF6' : '#ffffff', color: isSelected ? '#ffffff' : '#374151', fontSize: '12.5px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0, cursor: 'pointer' }}
                    >
                      <span>{cName}</span>
                      <span style={{ fontSize: '10px', fontWeight: 700, padding: '2px 6px', borderRadius: '9999px', backgroundColor: isSelected ? 'rgba(255,255,255,0.2)' : '#f3f4f6', color: isSelected ? '#ffffff' : '#6b7280' }}>
                        {count}
                      </span>
                    </button>
                  );
                })}
              </div>

              {filteredActiveJobs.length === 0 ? (
                <div className="print-dash-order-card" style={{ padding: '3rem', textAlign: 'center' }}>
                  <div style={{ width: '56px', height: '56px', backgroundColor: '#f9fafb', border: '1px solid #f3f4f6', color: '#9ca3af', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem auto' }}>
                    <Printer style={{ width: '24px', height: '24px' }} />
                  </div>
                  <h3 style={{ fontSize: '15.5px', fontWeight: 700, color: '#1f2937', margin: 0 }}>No Active Jobs</h3>
                  <p style={{ fontSize: '12px', color: '#6b7280', marginTop: '4px', margin: 0 }}>No printing jobs match the active selection.</p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                  {(showAllActive ? filteredActiveJobs : filteredActiveJobs.slice(0, 3)).map(order => {
                    const isExpanded = expandedOrders.has(order._id);
                    const totalPages = order.files?.reduce((acc, f) => acc + (f.pagesCount * f.sets), 0) || 0;
                    const totalSheets = order.files?.reduce((acc, f) => acc + calcSheets(f), 0) || 0;
                    
                    return (
                      <motion.div 
                        key={order._id}
                        layout
                        className="print-dash-order-card"
                      >
                        <div style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                              <div style={{ width: '40px', height: '40px', backgroundColor: '#FAF9FF', border: '1px solid rgba(109,93,246,0.15)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#6D5DF6' }}>
                                <Play style={{ width: '18px', height: '18px' }} className="animate-pulse" />
                              </div>
                              <div>
                                <span style={{ fontSize: '10px', color: '#6B7280', fontWeight: 700, display: 'block', textTransform: 'uppercase' }}>Order ID</span>
                                <span style={{ fontSize: '14px', fontWeight: 700, color: '#1f2937', display: 'block', marginTop: '2px' }}>
                                  {`EM-${new Date(order.createdAt).getFullYear()}-${order._id.substring(order._id.length - 8).toUpperCase()}`}
                                </span>
                              </div>
                            </div>
                            <span style={{ backgroundColor: '#FAF9FF', border: '1px solid rgba(109,93,246,0.2)', color: '#6D5DF6', fontWeight: 700, fontSize: '10.5px', padding: '2px 10px', borderRadius: '9999px' }}>
                              Printing Active
                            </span>
                          </div>

                          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px' }}>
                            <div className="print-dash-stat-box blue">
                              <p className="print-dash-stat-title">Files</p>
                              <p style={{ fontSize: '15px', fontWeight: 900, margin: 0 }}>{order.files?.length}</p>
                            </div>
                            <div className="print-dash-stat-box purple">
                              <p className="print-dash-stat-title">Pages</p>
                              <p style={{ fontSize: '15px', fontWeight: 900, margin: 0 }}>{totalPages}</p>
                            </div>
                            <div className="print-dash-stat-box emerald">
                              <p className="print-dash-stat-title">Sheets</p>
                              <p style={{ fontSize: '15px', fontWeight: 900, margin: 0 }}>{totalSheets}</p>
                            </div>
                            <div className="print-dash-stat-box" style={{ backgroundColor: '#fffbeb', borderColor: '#fde68a', color: '#b45309' }}>
                              <p className="print-dash-stat-title">Paid</p>
                              <p style={{ fontSize: '14px', fontWeight: 900, margin: 0 }}>₹{order.totalPrice?.toFixed(0)}</p>
                            </div>
                          </div>

                          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px', borderTop: '1px solid #F3F4F6', paddingTop: '12px', fontSize: '12.5px' }}>
                            <div>
                              <span style={{ fontSize: '10px', color: '#9CA3AF', fontWeight: 700, display: 'block', textTransform: 'uppercase' }}>👤 Student</span>
                              <span style={{ color: '#1f2937', fontWeight: 700 }}>{order.studentName}</span>
                            </div>
                            <div>
                              <span style={{ fontSize: '10px', color: '#9CA3AF', fontWeight: 700, display: 'block', textTransform: 'uppercase' }}>🏫 Destination</span>
                              <span style={{ color: '#1f2937', fontWeight: 600 }}>{order.department} • Room {order.section}</span>
                            </div>
                          </div>

                          <button
                            onClick={() => toggleExpanded(order._id)}
                            style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', fontSize: '11.5px', fontWeight: 700, color: '#9ca3af', background: 'none', border: 'none', cursor: 'pointer', paddingTop: '4px' }}
                          >
                            {isExpanded ? 'Hide' : 'Show'} Full Details & Files
                            <ChevronDown style={{ width: '14px', height: '14px', transform: isExpanded ? 'rotate(180deg)' : 'none' }} />
                          </button>
                        </div>

                        <AnimatePresence>
                          {isExpanded && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: 'auto', opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.25 }}
                              style={{ overflow: 'hidden' }}
                            >
                              <div style={{ padding: '0 1.25rem 1.25rem 1.25rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                <div style={{ backgroundColor: '#F8FAFC', borderRadius: '16px', padding: '1rem', border: '1px solid #E5E7EB' }}>
                                  <OrderInfoGrid order={order} />
                                </div>
                                <FilesSection order={order} />
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>

                        <div style={{ padding: '0 1.25rem 1.25rem 1.25rem', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                          <button
                            onClick={() => downloadAllFiles(order.files)}
                            className="print-dash-btn-outline"
                            style={{ height: '44px', borderRadius: '14px' }}
                          >
                            <Download style={{ width: '16px', height: '16px' }} />
                            Download All {order.files?.length} File(s)
                          </button>
                          <button
                            onClick={() => updateStatus(order._id, 'out-for-delivery')}
                            className="print-dash-btn-primary"
                            style={{ height: '52px', borderRadius: '16px', fontSize: '13.5px' }}
                          >
                            <Truck style={{ width: '18px', height: '18px' }} />
                            Dispatch Order to Runner
                          </button>
                        </div>
                      </motion.div>
                    );
                  })}

                  {filteredActiveJobs.length > 3 && (
                    <button
                      onClick={() => setShowAllActive(!showAllActive)}
                      style={{ width: '100%', height: '50px', backgroundColor: '#ffffff', border: '1px solid #E5E7EB', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', fontSize: '13px', fontWeight: 700, color: '#4b5563', cursor: 'pointer' }}
                    >
                      <span>{showAllActive ? 'View Less' : `View All Active Jobs (${filteredActiveJobs.length})`}</span>
                      <ChevronDown style={{ width: '16px', height: '16px', transform: showAllActive ? 'rotate(180deg)' : 'none' }} />
                    </button>
                  )}
                </div>
              )}
            </motion.div>
          )}

          {/* DELIVERY LOGS */}
          {activeTab === 'delivery' && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}
            >
              <div style={{ textAlign: 'left' }}>
                <h2 style={{ fontSize: '17px', fontWeight: 700, color: '#111827', margin: 0 }}>Delivery Logs</h2>
                <p style={{ fontSize: '12px', color: '#6B7280', fontWeight: 500, marginTop: '4px', margin: 0 }}>Orders on the way to classrooms</p>
              </div>

              {deliveryLogs.length === 0 ? (
                <div className="print-dash-order-card" style={{ padding: '3rem', textAlign: 'center' }}>
                  <div style={{ width: '56px', height: '56px', backgroundColor: '#f9fafb', border: '1px solid #f3f4f6', color: '#9ca3af', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem auto' }}>
                    <Truck style={{ width: '24px', height: '24px' }} />
                  </div>
                  <h3 style={{ fontSize: '15.5px', fontWeight: 700, color: '#1f2937', margin: 0 }}>No Dispatched Deliveries</h3>
                  <p style={{ fontSize: '12px', color: '#6b7280', marginTop: '4px', margin: 0 }}>All printing orders are currently in-house.</p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                  {(showAllDelivery ? deliveryLogs : deliveryLogs.slice(0, 3)).map(order => {
                    const totalPages = order.files?.reduce((acc, f) => acc + (f.pagesCount * f.sets), 0) || 0;
                    return (
                      <div 
                        key={order._id} 
                        className="print-dash-order-card"
                        style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <div style={{ width: '40px', height: '40px', backgroundColor: '#fffbeb', border: '1px solid #fde68a', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#d97706' }}>
                              <Truck style={{ width: '20px', height: '20px' }} />
                            </div>
                            <div>
                              <span style={{ fontSize: '10px', color: '#6B7280', fontWeight: 700, display: 'block', textTransform: 'uppercase' }}>Order ID</span>
                              <span style={{ fontSize: '14px', fontWeight: 700, color: '#1f2937', display: 'block', marginTop: '2px' }}>
                                {`EM-${new Date(order.createdAt).getFullYear()}-${order._id.substring(order._id.length - 8).toUpperCase()}`}
                              </span>
                            </div>
                          </div>
                          <span style={{ backgroundColor: '#fffbeb', color: '#92400e', fontWeight: 700, fontSize: '10.5px', padding: '2px 10px', borderRadius: '9999px', border: '1px solid #fde68a' }}>
                            Out For Delivery
                          </span>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px', borderTop: '1px solid #F3F4F6', borderBottom: '1px solid #F3F4F6', paddingTop: '14px', paddingBottom: '14px', fontSize: '12.5px' }}>
                          <div>
                            <span style={{ fontSize: '10px', color: '#9CA3AF', fontWeight: 700, display: 'block', textTransform: 'uppercase' }}>👤 Student</span>
                            <span style={{ color: '#1f2937', fontWeight: 700 }}>{order.studentName}</span>
                          </div>
                          <div>
                            <span style={{ fontSize: '10px', color: '#9CA3AF', fontWeight: 700, display: 'block', textTransform: 'uppercase' }}>🏫 Destination</span>
                            <span style={{ color: '#1f2937', fontWeight: 600 }}>{order.department} • Room {order.section}</span>
                          </div>
                          <div>
                            <span style={{ fontSize: '10px', color: '#9CA3AF', fontWeight: 700, display: 'block', textTransform: 'uppercase' }}>📄 Volume</span>
                            <span style={{ color: '#374151', fontWeight: 500 }}>
                              {order.files?.length} files • {totalPages} pages
                            </span>
                          </div>
                          <div>
                            <span style={{ fontSize: '10px', color: '#9CA3AF', fontWeight: 700, display: 'block', textTransform: 'uppercase' }}>📞 Contact</span>
                            <a href={`tel:${order.contactNumber}`} style={{ color: '#6D5DF6', fontWeight: 700, textDecoration: 'none' }}>
                              {order.contactNumber}
                            </a>
                          </div>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#f8fafc', border: '1px solid #f1f5f9', borderRadius: '12px', padding: '14px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <div style={{ width: '36px', height: '36px', borderRadius: '9999px', backgroundColor: '#e0e7ff', border: '1px solid #c7d2fe', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#4338ca', fontSize: '12px', fontWeight: 700 }}>
                              R
                            </div>
                            <div style={{ textAlign: 'left' }}>
                              <span style={{ fontSize: '10px', color: '#9ca3af', display: 'block', fontWeight: 700, textTransform: 'uppercase' }}>Assigned Runner</span>
                              <span style={{ fontSize: '12.5px', fontWeight: 700, color: '#1f2937', display: 'block', marginTop: '2px' }}>Ramesh</span>
                            </div>
                          </div>
                          <a 
                            href="tel:9391461855" 
                            className="profile-icon-btn"
                            style={{ width: '36px', height: '36px', border: '1px solid #E5E7EB', backgroundColor: '#ffffff' }}
                            title="Call Runner Ramesh"
                          >
                            <Phone style={{ width: '16px', height: '16px' }} />
                          </a>
                        </div>

                        <button
                          onClick={() => updateStatus(order._id, 'delivered')}
                          style={{ width: '100%', height: '52px', borderRadius: '16px', border: '2px solid #6D5DF6', color: '#6D5DF6', fontWeight: 700, fontSize: '13.5px', backgroundColor: '#ffffff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
                        >
                          <CheckCircle style={{ width: '18px', height: '18px' }} />
                          Confirm Handover
                        </button>
                      </div>
                    );
                  })}

                  {deliveryLogs.length > 3 && (
                    <button
                      onClick={() => setShowAllDelivery(!showAllDelivery)}
                      style={{ width: '100%', height: '50px', backgroundColor: '#ffffff', border: '1px solid #E5E7EB', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', fontSize: '13px', fontWeight: 700, color: '#4b5563', cursor: 'pointer' }}
                    >
                      <span>{showAllDelivery ? 'View Less' : `View All Delivery Logs (${deliveryLogs.length})`}</span>
                      <ChevronDown style={{ width: '16px', height: '16px', transform: showAllDelivery ? 'rotate(180deg)' : 'none' }} />
                    </button>
                  )}
                </div>
              )}
            </motion.div>
          )}

        </div>

      </main>

      {/* SCREENSHOT LIGHTBOX */}
      <AnimatePresence>
        {selectedScreenshot && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedScreenshot(null)}
            style={{ position: 'fixed', inset: 0, zIndex: 50, backgroundColor: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem', cursor: 'zoom-out' }}
          >
            <motion.div 
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              style={{ maxWidth: '500px', width: '100%', maxHeight: '80vh', backgroundColor: '#ffffff', borderRadius: '24px', overflow: 'hidden', padding: '8px', position: 'relative', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)' }}
              onClick={(e) => e.stopPropagation()}
            >
              <img 
                src={selectedScreenshot} 
                alt="Receipt screenshot verification detail" 
                style={{ width: '100%', maxHeight: '75vh', objectFit: 'contain', borderRadius: '16px', display: 'block' }} 
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
};

export default PrintDashboard;
