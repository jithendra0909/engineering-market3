import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Menu, Bell, User, Copy, Phone, Download, 
  ChevronDown, CheckCircle, Play, FileText, 
  Truck, RefreshCw, Headset, ArrowLeft, Grid, 
  Search, ExternalLink, Check, Clock, XCircle, 
  AlertCircle, Eye, ChevronUp, CheckSquare
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';

const getMediaUrl = (path) => {
  if (!path) return '';
  let url = path;

  // Cloudinary fix: PDFs stored under /image/upload/ return HTTP 401. Replace with /raw/upload/
  if (url.includes('cloudinary.com') && url.includes('/image/upload/') && url.toLowerCase().includes('.pdf')) {
    url = url.replace('/image/upload/', '/raw/upload/');
  }

  if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('data:')) {
    return url;
  }
  const isDev = !import.meta.env.PROD;
  const serverBase = isDev ? 'http://localhost:5000' : '';
  return `${serverBase}${url}`;
};

export const PrintDashboard = () => {
  const navigate = useNavigate();
  const { user, isAdmin, showToast } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('verification'); // verification, active, delivery
  
  // View limit states for "View All" collapses
  const [showAllVerification, setShowAllVerification] = useState(false);
  const [showAllActive, setShowAllActive] = useState(false);
  const [showAllDelivery, setShowAllDelivery] = useState(false);
  
  // Selected classroom filter for Section 2
  const [selectedClassroom, setSelectedClassroom] = useState(null);
  
  // Image screenshot lightbox overlay
  const [selectedScreenshot, setSelectedScreenshot] = useState(null);

  // Fetch all orders
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

  // Update Status helper
  const updateStatus = async (id, newStatus) => {
    try {
      await api.put(`/print/orders/${id}/status`, { status: newStatus });
      showToast(`Order status updated to ${newStatus}!`, 'success');
      fetchAllOrders();
    } catch (err) {
      showToast('Failed to update order status.', 'error');
    }
  };

  // Copy helper
  const copyToClipboard = (text, label) => {
    navigator.clipboard.writeText(text);
    showToast(`${label} copied to clipboard!`, 'success');
  };

  // Get downloadable URL with Cloudinary attachment flag
  const getDownloadableUrl = (url, fileName) => {
    if (!url) return '';
    let fullUrl = getMediaUrl(url);
    if (fullUrl.includes('cloudinary.com') && !fullUrl.includes('/fl_attachment')) {
      fullUrl = fullUrl.replace('/upload/', '/upload/fl_attachment/');
    }
    return fullUrl;
  };

  // Open PDF directly in new tab for easy Ctrl+P printing
  const handleOpenPrintFile = (url) => {
    if (!url) {
      showToast('No PDF link available for this file.', 'error');
      return;
    }
    if (url.startsWith('large-file://')) {
      showToast('Registered file metadata reference. Original document is with student.', 'info');
      return;
    }
    const fullUrl = getMediaUrl(url);
    window.open(fullUrl, '_blank', 'noopener,noreferrer');
  };

  // Download PDF file directly to device
  const handleDownloadFile = async (url, fileName) => {
    if (!url) {
      showToast('No download link available for this file.', 'error');
      return;
    }

    if (url.startsWith('large-file://')) {
      showToast(`Registered file metadata reference: ${fileName}`, 'info');
      return;
    }

    try {
      const downloadUrl = getDownloadableUrl(url, fileName);
      const response = await fetch(downloadUrl);
      if (response.ok) {
        const blob = await response.blob();
        const blobUrl = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = blobUrl;
        a.download = fileName || 'document.pdf';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        setTimeout(() => URL.revokeObjectURL(blobUrl), 1000);
        showToast(`Downloading ${fileName}...`, 'success');
        return;
      }
    } catch (e) {
      console.warn('Blob fetch download fallback:', e);
    }

    // Direct anchor fallback
    const a = document.createElement('a');
    a.href = getDownloadableUrl(url, fileName);
    a.target = '_blank';
    a.rel = 'noopener noreferrer';
    a.download = fileName || 'document.pdf';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    showToast(`Downloading ${fileName}...`, 'success');
  };

  // Download files trigger for entire order
  const downloadAllFiles = (files) => {
    if (!files || files.length === 0) {
      showToast('No files attached to this order.', 'error');
      return;
    }
    files.forEach(file => {
      handleDownloadFile(file.pdfFileUrl, file.fileName);
    });
  };

  // Group verification queue items
  const verificationQueue = orders.filter(o => o.status === 'pending');
  // Group active printing jobs
  const activeJobs = orders.filter(o => o.status === 'printing');
  // Group out-for-delivery logs
  const deliveryLogs = orders.filter(o => o.status === 'out-for-delivery');

  // Dynamic classroom chips counts based on active printing list
  const classroomChips = ['CSE-2', 'IT-2', 'ECE-3', 'DS-3'];
  const getClassroomCount = (classroom) => {
    const [dept, sec] = classroom.split('-');
    return activeJobs.filter(o => o.department === dept && o.section === sec).length;
  };

  // Format date helper
  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });
  };

  // Handle active jobs classroom filter
  const getFilteredActiveJobs = () => {
    if (!selectedClassroom) return activeJobs;
    const [dept, sec] = selectedClassroom.split('-');
    return activeJobs.filter(o => o.department === dept && o.section === sec);
  };

  const filteredActiveJobs = getFilteredActiveJobs();

  return (
    <div className="min-h-screen bg-[#F8FAFC] font-sans antialiased text-[#111827] pb-32">
      
      {/* ── HEADER (80px) ── */}
      <header className="h-[80px] bg-white border-b border-[#E5E7EB] sticky top-0 z-40 px-6">
        <div className="max-w-[600px] h-full mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3.5">
            <button 
              onClick={() => navigate('/vendors/print-studio')} 
              className="w-11 h-11 rounded-full border border-[#E5E7EB] flex items-center justify-center hover:bg-[#F8FAFC] transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-gray-600 stroke-[2.5]" />
            </button>
            <div className="w-[1px] h-6 bg-gray-200" />
            <div className="text-left">
              <h1 className="text-[16px] font-bold text-[#111827] tracking-tight leading-none">EM Print Studio</h1>
              <p className="text-[11px] text-[#6B7280] font-medium mt-1 leading-none">Print Shop Dashboard</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button 
              onClick={fetchAllOrders}
              className="w-10 h-10 rounded-full border border-[#E5E7EB] flex items-center justify-center bg-white text-gray-500 hover:text-[#6D5DF6] transition-colors relative"
            >
              <RefreshCw className="w-4.5 h-4.5" />
            </button>
            <div className="w-10 h-10 rounded-full bg-[#FAF9FF] border border-[#6D5DF6]/20 flex items-center justify-center text-[#6D5DF6] font-bold text-[13px] select-none">
              EP
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-[600px] mx-auto px-6 mt-6 space-y-6">

        {/* ── TOP SEGMENTED TABS ── */}
        <div className="bg-white border border-[#E5E7EB] rounded-[22px] p-2 flex shadow-sm select-none">
          {[
            { id: 'verification', label: 'Verification', count: verificationQueue.length },
            { id: 'active', label: 'Active Jobs', count: activeJobs.length },
            { id: 'delivery', label: 'Delivery Logs', count: deliveryLogs.length }
          ].map(tab => {
            const isSelected = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 py-3 text-[12.5px] font-bold rounded-[20px] transition-all flex flex-col items-center justify-center gap-0.5 border ${
                  isSelected 
                    ? 'bg-[#6D5DF6]/8 border-[#6D5DF6]/30 text-[#6D5DF6]' 
                    : 'bg-white border-transparent text-[#6B7280] hover:text-[#111827]'
                }`}
              >
                <span>{tab.label}</span>
                <span className={`text-[10px] px-2 py-0.5 rounded-full ${
                  isSelected ? 'bg-[#6D5DF6] text-white' : 'bg-gray-100 text-gray-500'
                }`}>
                  {tab.count}
                </span>
              </button>
            );
          })}
        </div>

        {/* ── TAB SECTIONS CONTENT ── */}
        <div className="space-y-6">

          {/* ── SECTION 1: VERIFICATION QUEUE ── */}
          {activeTab === 'verification' && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4"
            >
              <div className="text-left">
                <h2 className="text-[17px] font-bold text-[#111827] tracking-tight">Verification Queue</h2>
                <p className="text-[12px] text-[#6B7280] font-medium leading-none mt-1">Verify payments and start printing</p>
              </div>

              {verificationQueue.length === 0 ? (
                <div className="bg-white rounded-[22px] border border-[#E5E7EB] p-12 text-center shadow-sm">
                  <div className="w-14 h-14 bg-emerald-50 border border-emerald-100 text-emerald-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <Check className="w-6 h-6 stroke-[3]" />
                  </div>
                  <h3 className="text-[15.5px] font-bold text-gray-800">All Payments Verified</h3>
                  <p className="text-[12px] text-gray-500 mt-1">Verification queue is completely clear!</p>
                </div>
              ) : (
                <div className="space-y-4.5">
                  {(showAllVerification ? verificationQueue : verificationQueue.slice(0, 3)).map(order => (
                    <div 
                      key={order._id} 
                      className="bg-white border border-[#E5E7EB] rounded-[22px] p-5.5 shadow-[0_10px_30px_rgba(15,23,42,0.03)] hover:shadow-md transition-all text-left space-y-4.5"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-[#FAF9FF] border border-[#6D5DF6]/15 rounded-xl flex items-center justify-center text-[#6D5DF6] shrink-0">
                            <FileText className="w-5.5 h-5.5" />
                          </div>
                          <div>
                            <span className="text-[10px] text-[#6B7280] font-bold block uppercase leading-none">Order ID</span>
                            <span className="text-[14px] font-bold text-gray-800 leading-none mt-1 block">
                              {`EM-${new Date(order.createdAt).getFullYear()}-${order._id.substring(order._id.length - 8).toUpperCase()}`}
                            </span>
                          </div>
                        </div>
                        <div className="text-right">
                          <span className="text-[10px] text-[#6B7280] font-bold block uppercase leading-none">Placed At</span>
                          <span className="text-[12.5px] font-semibold text-gray-700 leading-none mt-1 block">
                            {formatTime(order.createdAt)}
                          </span>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-y-3.5 gap-x-2 border-t border-b border-[#F3F4F6] py-3.5 text-[12.5px]">
                        <div>
                          <span className="text-[10px] text-[#9CA3AF] font-bold block uppercase">Student Name</span>
                          <span className="text-gray-800 font-semibold">{order.studentName}</span>
                        </div>
                        <div>
                          <span className="text-[10px] text-[#9CA3AF] font-bold block uppercase">UPI Reference</span>
                          <div className="flex items-center gap-1.5 mt-0.5">
                            <span className="bg-[#FAF9FF] border border-[#6D5DF6]/15 text-[#6D5DF6] font-bold px-2 py-0.5 rounded-lg text-[11px]">
                              {order.upiReference}
                            </span>
                            <button 
                              onClick={() => copyToClipboard(order.upiReference, 'UPI reference')}
                              className="text-gray-400 hover:text-gray-600 transition-colors"
                            >
                              <Copy className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                        <div>
                          <span className="text-[10px] text-[#9CA3AF] font-bold block uppercase">Department / Section</span>
                          <span className="text-gray-800 font-semibold">{order.department} • Room {order.section}</span>
                        </div>
                        <div>
                          <span className="text-[10px] text-[#9CA3AF] font-bold block uppercase">Transaction Amount</span>
                          <span className="text-[#6D5DF6] font-bold text-[14px]">₹{order.totalPrice.toFixed(2)}</span>
                        </div>
                      </div>

                      {/* Display Payment Screenshot proof preview inside */}
                      {order.paymentScreenshotUrl && (
                        <div className="flex items-center gap-3 bg-[#F8FAFC] border border-[#E5E7EB] rounded-xl p-3.5">
                          <div className="w-12 h-12 bg-white border border-[#E5E7EB] rounded-lg overflow-hidden shrink-0 relative group">
                            <img src={order.paymentScreenshotUrl} alt="" className="w-full h-full object-cover" />
                          </div>
                          <div className="flex-1 text-left min-w-0">
                            <span className="text-[11.5px] font-semibold text-gray-700 block truncate">Transaction Receipt Screenshot</span>
                            <button 
                              onClick={() => setSelectedScreenshot(order.paymentScreenshotUrl)}
                              className="text-[11px] text-[#6D5DF6] font-bold hover:underline"
                            >
                              Tap to View Image
                            </button>
                          </div>
                        </div>
                      )}

                      {/* Files Detailed Printing Specification Breakdown */}
                      <div className="bg-[#F8FAFC] rounded-2xl p-3.5 border border-[#E5E7EB] space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] text-gray-500 font-extrabold uppercase tracking-wider block">
                            Files to Print ({order.files?.length})
                          </span>
                          <button
                            onClick={() => downloadAllFiles(order.files)}
                            className="text-[11px] font-bold text-[#6D5DF6] hover:underline flex items-center gap-1"
                          >
                            <Download className="w-3.5 h-3.5" /> Download All ({order.files?.length})
                          </button>
                        </div>

                        <div className="space-y-2.5">
                          {order.files?.map((file, idx) => (
                            <div key={idx} className="bg-white rounded-xl p-3 border border-gray-200/80 space-y-2 text-left shadow-2xs">
                              {/* File name & copy count */}
                              <div className="flex items-start justify-between gap-2 border-b border-gray-100 pb-2">
                                <div className="flex items-center gap-2 flex-1 min-w-0">
                                  <FileText className="w-4 h-4 text-rose-500 shrink-0" />
                                  <span className="text-[13px] font-bold text-gray-800 truncate" title={file.fileName}>
                                    {file.fileName}
                                  </span>
                                </div>
                                <span className="bg-[#6D5DF6]/10 text-[#6D5DF6] text-[11px] font-extrabold px-2 py-0.5 rounded-md shrink-0">
                                  {file.sets} {file.sets === 1 ? 'Copy' : 'Copies'} ({file.pagesCount} pgs)
                                </span>
                              </div>

                              {/* Printing Badges Specs */}
                              <div className="flex flex-wrap gap-1.5 text-[10.5px]">
                                {/* Color specification */}
                                <span className={`px-2 py-0.5 rounded-md font-bold ${
                                  file.colorType === 'color' 
                                    ? 'bg-amber-100 text-amber-900 border border-amber-200' 
                                    : 'bg-gray-100 text-gray-700 border border-gray-200'
                                }`}>
                                  {file.colorType === 'color' ? '🎨 Full Color' : '⬛ Black & White'}
                                </span>

                                {/* Layout specification */}
                                <span className={`px-2 py-0.5 rounded-md font-bold ${
                                  file.layout === 'both-side'
                                    ? 'bg-emerald-100 text-emerald-900 border border-emerald-200'
                                    : file.layout === 'four-pages'
                                    ? 'bg-purple-100 text-purple-900 border border-purple-200'
                                    : 'bg-blue-100 text-blue-900 border border-blue-200'
                                }`}>
                                  {file.layout === 'both-side' ? '🔄 Double-Sided (2-Sided)' : file.layout === 'four-pages' ? '📊 1/4 Page (4 pg/sheet)' : '📄 Single-Sided'}
                                </span>

                                {/* Binding specification */}
                                <span className={`px-2 py-0.5 rounded-md font-bold ${
                                  file.binding === 'spiral'
                                    ? 'bg-indigo-100 text-indigo-900 border border-indigo-200'
                                    : 'bg-gray-100 text-gray-500 border border-gray-200'
                                }`}>
                                  {file.binding === 'spiral' ? '🌀 Spiral Binding' : '📎 No Binding'}
                                </span>
                              </div>

                              {/* Student custom instructions note if present */}
                              {file.instructions && (
                                <div className="bg-amber-50 border border-amber-200 rounded-lg p-2 text-[11px] text-amber-900 font-semibold">
                                  📝 <span className="font-extrabold">Student Note:</span> {file.instructions}
                                </div>
                              )}

                              {/* Direct action buttons per file */}
                              <div className="flex items-center gap-2 pt-1">
                                <button
                                  onClick={() => handleOpenPrintFile(file.pdfFileUrl)}
                                  className="flex-1 h-8 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 text-[11px] font-bold flex items-center justify-center gap-1 transition-all"
                                >
                                  <ExternalLink className="w-3.5 h-3.5 text-[#6D5DF6]" /> Open / Print PDF
                                </button>
                                <button
                                  onClick={() => handleDownloadFile(file.pdfFileUrl, file.fileName)}
                                  className="flex-1 h-8 rounded-lg bg-[#6D5DF6] hover:bg-[#5C4EE5] text-white text-[11px] font-bold flex items-center justify-center gap-1 transition-all"
                                >
                                  <Download className="w-3.5 h-3.5" /> Download PDF
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      <button
                        onClick={() => updateStatus(order._id, 'printing')}
                        className="w-full h-[52px] rounded-[16px] border border-[#6D5DF6] text-[#6D5DF6] font-bold text-[13.5px] bg-white hover:bg-[#6D5DF6]/5 transition-all select-none active:scale-[0.99] flex items-center justify-center gap-1.5"
                      >
                        <CheckSquare className="w-4.5 h-4.5 stroke-[2.5]" />
                        Verify Payment & Start Printing
                      </button>
                    </div>
                  ))}

                  {verificationQueue.length > 3 && (
                    <button
                      onClick={() => setShowAllVerification(!showAllVerification)}
                      className="w-full h-[50px] bg-white border border-[#E5E7EB] rounded-2xl flex items-center justify-center gap-1.5 text-[13px] font-bold text-gray-600 hover:text-gray-900 transition-colors shadow-sm"
                    >
                      <span>{showAllVerification ? 'View Less' : `View All (${verificationQueue.length})`}</span>
                      <ChevronDown className={`w-4 h-4 transition-transform ${showAllVerification ? 'rotate-180' : ''}`} />
                    </button>
                  )}
                </div>
              )}
            </motion.div>
          )}

          {/* ── SECTION 2: ACTIVE JOBS QUEUE ── */}
          {activeTab === 'active' && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4"
            >
              <div className="text-left">
                <h2 className="text-[17px] font-bold text-[#111827] tracking-tight">Active Job Queue</h2>
                <p className="text-[12px] text-[#6B7280] font-medium leading-none mt-1">Print and prepare orders for delivery</p>
              </div>

              {/* Classroom Chips horizontal selector */}
              <div className="flex items-center gap-2 overflow-x-auto pb-1 select-none scrollbar-none">
                <button 
                  onClick={() => setSelectedClassroom(null)}
                  className={`p-2.5 rounded-xl border flex items-center justify-center shrink-0 transition-all ${
                    !selectedClassroom 
                      ? 'bg-[#6D5DF6] border-[#6D5DF6] text-white shadow-sm' 
                      : 'bg-white border-[#E5E7EB] text-[#6B7280] hover:text-[#111827]'
                  }`}
                >
                  <Grid className="w-4.5 h-4.5" />
                </button>
                {classroomChips.map(cName => {
                  const count = getClassroomCount(cName);
                  const isSelected = selectedClassroom === cName;
                  return (
                    <button
                      key={cName}
                      onClick={() => setSelectedClassroom(isSelected ? null : cName)}
                      className={`h-[38px] px-4 rounded-xl border text-[12.5px] font-bold flex items-center gap-1.5 shrink-0 transition-all ${
                        isSelected 
                          ? 'bg-[#6D5DF6] border-[#6D5DF6] text-white shadow-sm' 
                          : 'bg-white border-[#E5E7EB] text-gray-700 hover:text-gray-900'
                      }`}
                    >
                      <span>{cName}</span>
                      <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                        isSelected ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-500'
                      }`}>
                        {count} {count === 1 ? 'Order' : 'Orders'}
                      </span>
                    </button>
                  );
                })}
              </div>

              {filteredActiveJobs.length === 0 ? (
                <div className="bg-white rounded-[22px] border border-[#E5E7EB] p-12 text-center shadow-sm">
                  <div className="w-14 h-14 bg-gray-50 border border-gray-100 text-gray-400 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <FileText className="w-6 h-6" />
                  </div>
                  <h3 className="text-[15.5px] font-bold text-gray-800">No Active Jobs</h3>
                  <p className="text-[12px] text-gray-500 mt-1">No printing jobs match the active selection.</p>
                </div>
              ) : (
                <div className="space-y-4.5">
                  {(showAllActive ? filteredActiveJobs : filteredActiveJobs.slice(0, 3)).map(order => {
                    const totalPagesCount = order.files?.reduce((acc, f) => acc + (f.pagesCount * f.sets), 0) || 0;
                    return (
                      <div 
                        key={order._id} 
                        className="bg-white border border-[#E5E7EB] rounded-[22px] p-5.5 shadow-[0_10px_30px_rgba(15,23,42,0.03)] hover:shadow-md transition-all text-left space-y-4"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-[#FAF9FF] border border-[#6D5DF6]/15 rounded-xl flex items-center justify-center text-[#6D5DF6]">
                              <Play className="w-4.5 h-4.5 animate-pulse" />
                            </div>
                            <div>
                              <span className="text-[10px] text-[#6B7280] font-bold block uppercase leading-none">Order ID</span>
                              <span className="text-[14px] font-bold text-gray-800 leading-none mt-1 block">
                                {`EM-${new Date(order.createdAt).getFullYear()}-${order._id.substring(order._id.length - 8).toUpperCase()}`}
                              </span>
                            </div>
                          </div>
                          <span className="bg-[#FAF9FF] border border-[#6D5DF6]/20 text-[#6D5DF6] font-bold text-[10.5px] px-2.5 py-0.5 rounded-full select-none">
                            Printing Active
                          </span>
                        </div>

                        <div className="grid grid-cols-2 gap-y-3 gap-x-2 border-t border-[#F3F4F6] pt-3.5 text-[12.5px]">
                          <div>
                            <span className="text-[10px] text-[#9CA3AF] font-bold block uppercase">Student Name</span>
                            <span className="text-gray-800 font-semibold">{order.studentName}</span>
                          </div>
                          <div>
                            <span className="text-[10px] text-[#9CA3AF] font-bold block uppercase">Classroom Destination</span>
                            <span className="text-gray-800 font-semibold">{order.department} • Room {order.section}</span>
                          </div>
                          <div>
                            <span className="text-[10px] text-[#9CA3AF] font-bold block uppercase">Printing Specs</span>
                            <span className="text-gray-700 font-medium">
                              {order.files?.length} files • {totalPagesCount} pages total
                            </span>
                          </div>
                          <div>
                            <span className="text-[10px] text-[#9CA3AF] font-bold block uppercase">Paid Value</span>
                            <span className="text-[#6D5DF6] font-black text-[13.5px]">₹{order.totalPrice.toFixed(2)}</span>
                          </div>
                        </div>

                        {/* Detailed Files list inside the card */}
                        <div className="bg-[#F8FAFC] rounded-2xl p-3.5 border border-[#E5E7EB] space-y-3">
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] text-gray-500 font-extrabold uppercase tracking-wider block">
                              Files to Print ({order.files?.length})
                            </span>
                            <button
                              onClick={() => downloadAllFiles(order.files)}
                              className="text-[11px] font-bold text-[#6D5DF6] hover:underline flex items-center gap-1"
                            >
                              <Download className="w-3.5 h-3.5" /> Download All ({order.files?.length})
                            </button>
                          </div>

                          <div className="space-y-2.5">
                            {order.files?.map((file, idx) => (
                              <div key={idx} className="bg-white rounded-xl p-3 border border-gray-200/80 space-y-2 text-left shadow-2xs">
                                {/* File name & copy count */}
                                <div className="flex items-start justify-between gap-2 border-b border-gray-100 pb-2">
                                  <div className="flex items-center gap-2 flex-1 min-w-0">
                                    <FileText className="w-4 h-4 text-rose-500 shrink-0" />
                                    <span className="text-[13px] font-bold text-gray-800 truncate" title={file.fileName}>
                                      {file.fileName}
                                    </span>
                                  </div>
                                  <span className="bg-[#6D5DF6]/10 text-[#6D5DF6] text-[11px] font-extrabold px-2 py-0.5 rounded-md shrink-0">
                                    {file.sets} {file.sets === 1 ? 'Copy' : 'Copies'} ({file.pagesCount} pgs)
                                  </span>
                                </div>

                                {/* Printing Badges Specs */}
                                <div className="flex flex-wrap gap-1.5 text-[10.5px]">
                                  {/* Color specification */}
                                  <span className={`px-2 py-0.5 rounded-md font-bold ${
                                    file.colorType === 'color' 
                                      ? 'bg-amber-100 text-amber-900 border border-amber-200' 
                                      : 'bg-gray-100 text-gray-700 border border-gray-200'
                                  }`}>
                                    {file.colorType === 'color' ? '🎨 Full Color' : '⬛ Black & White'}
                                  </span>

                                  {/* Layout specification */}
                                  <span className={`px-2 py-0.5 rounded-md font-bold ${
                                    file.layout === 'both-side'
                                      ? 'bg-emerald-100 text-emerald-900 border border-emerald-200'
                                      : file.layout === 'four-pages'
                                      ? 'bg-purple-100 text-purple-900 border border-purple-200'
                                      : 'bg-blue-100 text-blue-900 border border-blue-200'
                                  }`}>
                                    {file.layout === 'both-side' ? '🔄 Double-Sided (2-Sided)' : file.layout === 'four-pages' ? '📊 1/4 Page (4 pg/sheet)' : '📄 Single-Sided'}
                                  </span>

                                  {/* Binding specification */}
                                  <span className={`px-2 py-0.5 rounded-md font-bold ${
                                    file.binding === 'spiral'
                                      ? 'bg-indigo-100 text-indigo-900 border border-indigo-200'
                                      : 'bg-gray-100 text-gray-500 border border-gray-200'
                                  }`}>
                                    {file.binding === 'spiral' ? '🌀 Spiral Binding' : '📎 No Binding'}
                                  </span>
                                </div>

                                {/* Student custom instructions note if present */}
                                {file.instructions && (
                                  <div className="bg-amber-50 border border-amber-200 rounded-lg p-2 text-[11px] text-amber-900 font-semibold">
                                    📝 <span className="font-extrabold">Student Note:</span> {file.instructions}
                                  </div>
                                )}

                                {/* Direct action buttons per file */}
                                <div className="flex items-center gap-2 pt-1">
                                  <button
                                    onClick={() => handleOpenPrintFile(file.pdfFileUrl)}
                                    className="flex-1 h-8 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 text-[11px] font-bold flex items-center justify-center gap-1 transition-all"
                                  >
                                    <ExternalLink className="w-3.5 h-3.5 text-[#6D5DF6]" /> Open / Print PDF
                                  </button>
                                  <button
                                    onClick={() => handleDownloadFile(file.pdfFileUrl, file.fileName)}
                                    className="flex-1 h-8 rounded-lg bg-[#6D5DF6] hover:bg-[#5C4EE5] text-white text-[11px] font-bold flex items-center justify-center gap-1 transition-all"
                                  >
                                    <Download className="w-3.5 h-3.5" /> Download PDF
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>

                        <div className="pt-1">
                          <button
                            onClick={() => updateStatus(order._id, 'out-for-delivery')}
                            className="w-full h-[52px] rounded-[16px] bg-[#6D5DF6] hover:bg-[#5C4EE5] text-white font-bold text-[13.5px] transition-all select-none active:scale-[0.99] flex items-center justify-center gap-1.5 shadow-sm"
                          >
                            <Truck className="w-4.5 h-4.5" />
                            Dispatch Order to Runner
                          </button>
                        </div>
                      </div>
                    );
                  })}

                  {filteredActiveJobs.length > 3 && (
                    <button
                      onClick={() => setShowAllActive(!showAllActive)}
                      className="w-full h-[50px] bg-white border border-[#E5E7EB] rounded-2xl flex items-center justify-center gap-1.5 text-[13px] font-bold text-gray-600 hover:text-gray-900 transition-colors shadow-sm"
                    >
                      <span>{showAllActive ? 'View Less' : `View All Active Jobs (${filteredActiveJobs.length})`}</span>
                      <ChevronDown className={`w-4 h-4 transition-transform ${showAllActive ? 'rotate-180' : ''}`} />
                    </button>
                  )}
                </div>
              )}
            </motion.div>
          )}

          {/* ── SECTION 3: DELIVERY LOGS ── */}
          {activeTab === 'delivery' && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4"
            >
              <div className="text-left">
                <h2 className="text-[17px] font-bold text-[#111827] tracking-tight">Delivery Logs</h2>
                <p className="text-[12px] text-[#6B7280] font-medium leading-none mt-1">Orders on the way to classrooms</p>
              </div>

              {deliveryLogs.length === 0 ? (
                <div className="bg-white rounded-[22px] border border-[#E5E7EB] p-12 text-center shadow-sm">
                  <div className="w-14 h-14 bg-gray-50 border border-gray-100 text-gray-400 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <Truck className="w-6 h-6" />
                  </div>
                  <h3 className="text-[15.5px] font-bold text-gray-800">No Dispatched Deliveries</h3>
                  <p className="text-[12px] text-gray-500 mt-1">All printing orders are currently in-house.</p>
                </div>
              ) : (
                <div className="space-y-4.5">
                  {(showAllDelivery ? deliveryLogs : deliveryLogs.slice(0, 3)).map(order => {
                    const totalPagesCount = order.files?.reduce((acc, f) => acc + (f.pagesCount * f.sets), 0) || 0;
                    return (
                      <div 
                        key={order._id} 
                        className="bg-white border border-[#E5E7EB] rounded-[22px] p-5.5 shadow-[0_10px_30px_rgba(15,23,42,0.03)] hover:shadow-md transition-all text-left space-y-4"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-amber-50 border border-amber-100 rounded-xl flex items-center justify-center text-amber-600">
                              <Truck className="w-5 h-5" />
                            </div>
                            <div>
                              <span className="text-[10px] text-[#6B7280] font-bold block uppercase leading-none">Order ID</span>
                              <span className="text-[14px] font-bold text-gray-800 leading-none mt-1 block">
                                {`EM-${new Date(order.createdAt).getFullYear()}-${order._id.substring(order._id.length - 8).toUpperCase()}`}
                              </span>
                            </div>
                          </div>
                          <span className="bg-amber-55 text-amber-800 font-bold text-[10.5px] px-2.5 py-0.5 rounded-full select-none border border-amber-100 bg-[#FFFBEB]">
                            Out For Delivery
                          </span>
                        </div>

                        <div className="grid grid-cols-2 gap-y-3 gap-x-2 border-t border-b border-[#F3F4F6] py-3.5 text-[12.5px]">
                          <div>
                            <span className="text-[10px] text-[#9CA3AF] font-bold block uppercase">Student Name</span>
                            <span className="text-gray-800 font-semibold">{order.studentName}</span>
                          </div>
                          <div>
                            <span className="text-[10px] text-[#9CA3AF] font-bold block uppercase">Destination Room</span>
                            <span className="text-gray-800 font-semibold">{order.department} • Room {order.section}</span>
                          </div>
                          <div>
                            <span className="text-[10px] text-[#9CA3AF] font-bold block uppercase">Print Volume</span>
                            <span className="text-gray-700 font-medium">
                              {order.files?.length} files • {totalPagesCount} pages
                            </span>
                          </div>
                          <div>
                            <span className="text-[10px] text-[#9CA3AF] font-bold block uppercase">Recipient Call</span>
                            <a href={`tel:${order.contactNumber}`} className="text-[#6D5DF6] font-bold hover:underline">
                              {order.contactNumber}
                            </a>
                          </div>
                        </div>

                        {/* Runner details card */}
                        <div className="flex items-center justify-between bg-slate-50 border border-gray-100 rounded-xl p-3.5">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-full bg-indigo-100 border border-indigo-200 flex items-center justify-center text-indigo-600 text-[12px] font-bold uppercase select-none">
                              R
                            </div>
                            <div className="text-left">
                              <span className="text-[10px] text-gray-400 block font-bold leading-none uppercase">Assigned Runner</span>
                              <span className="text-[12.5px] font-bold text-gray-800 leading-none mt-1 block">Ramesh</span>
                            </div>
                          </div>
                          <a 
                            href="tel:9391461855" 
                            className="w-9 h-9 rounded-lg bg-white border border-[#E5E7EB] hover:text-[#6D5DF6] hover:border-[#6D5DF6] flex items-center justify-center transition-colors shadow-sm"
                            title="Call Runner Ramesh"
                          >
                            <Phone className="w-4 h-4" />
                          </a>
                        </div>

                        <button
                          onClick={() => updateStatus(order._id, 'delivered')}
                          className="w-full h-[52px] rounded-[16px] border border-[#6D5DF6] text-[#6D5DF6] font-bold text-[13.5px] bg-white hover:bg-[#6D5DF6]/5 transition-all select-none active:scale-[0.99] flex items-center justify-center gap-1.5 shadow-sm"
                        >
                          <CheckCircle className="w-4.5 h-4.5 stroke-[2.5]" />
                          Confirm Handover
                        </button>
                      </div>
                    );
                  })}

                  {deliveryLogs.length > 3 && (
                    <button
                      onClick={() => setShowAllDelivery(!showAllDelivery)}
                      className="w-full h-[50px] bg-white border border-[#E5E7EB] rounded-2xl flex items-center justify-center gap-1.5 text-[13px] font-bold text-gray-600 hover:text-gray-900 transition-colors shadow-sm"
                    >
                      <span>{showAllDelivery ? 'View Less' : `View All Delivery Logs (${deliveryLogs.length})`}</span>
                      <ChevronDown className={`w-4 h-4 transition-transform ${showAllDelivery ? 'rotate-180' : ''}`} />
                    </button>
                  )}
                </div>
              )}
            </motion.div>
          )}

        </div>

      </main>

      {/* ── TRANSACTION PROOF LIGHTBOX SCREENSHOT SCREEN ── */}
      <AnimatePresence>
        {selectedScreenshot && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedScreenshot(null)}
            className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4 cursor-zoom-out"
          >
            <motion.div 
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              className="max-w-[500px] w-full max-h-[80vh] bg-white rounded-3xl overflow-hidden p-2 relative shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <img 
                src={selectedScreenshot} 
                alt="Receipt screenshot verification detail" 
                className="w-full max-h-[75vh] object-contain rounded-2xl block" 
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
};

export default PrintDashboard;
