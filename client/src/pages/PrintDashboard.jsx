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

const getMediaUrl = (path) => {
  if (!path) return '';
  if (path.startsWith('http://') || path.startsWith('https://') || path.startsWith('data:')) {
    return path;
  }
  const isDev = !import.meta.env.PROD;
  const serverBase = isDev ? 'http://localhost:5000' : '';
  return `${serverBase}${path}`;
};

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
  
  // Track which files are currently downloading
  const [downloadingFiles, setDownloadingFiles] = useState(new Set());
  // Track expanded order cards for "show full details" toggle
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

  // ─── SIGNED URL DOWNLOAD SYSTEM ───
  const getSignedUrl = async (url) => {
    if (!url || !url.includes('cloudinary.com')) return getMediaUrl(url);
    try {
      const { data } = await api.get('/print/signed-url', { params: { url } });
      return data.signedUrl || getMediaUrl(url);
    } catch (e) {
      console.warn('Signed URL fetch failed, using original:', e);
      return getMediaUrl(url);
    }
  };

  const handleOpenPrintFile = async (url) => {
    if (!url) {
      showToast('No PDF link available for this file.', 'error');
      return;
    }
    if (url.startsWith('large-file://')) {
      showToast('This is a registered reference. Student brings the original document.', 'info');
      return;
    }
    showToast('Preparing PDF for viewing...', 'info');
    const signedUrl = await getSignedUrl(url);
    window.open(signedUrl, '_blank', 'noopener,noreferrer');
  };

  const handleDownloadFile = async (url, fileName) => {
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
      const signedUrl = await getSignedUrl(url);
      const response = await fetch(signedUrl);
      if (response.ok) {
        const blob = await response.blob();
        const blobUrl = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = blobUrl;
        a.download = fileName || 'document.pdf';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        setTimeout(() => URL.revokeObjectURL(blobUrl), 2000);
        showToast(`Downloaded ${fileName}!`, 'success');
      } else {
        // Fallback: open directly
        window.open(signedUrl, '_blank');
        showToast(`Opening ${fileName} in new tab...`, 'info');
      }
    } catch (e) {
      console.warn('Download failed:', e);
      const signedUrl = await getSignedUrl(url);
      window.open(signedUrl, '_blank');
      showToast(`Opening ${fileName} in new tab...`, 'info');
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

  // ─── HELPERS ───
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

  // Calculate effective sheets needed for a file
  const calcSheets = (file) => {
    const pages = file.pagesCount || 1;
    const sets = file.sets || 1;
    if (file.layout === 'both-side') return Math.ceil(pages / 2) * sets;
    if (file.layout === 'four-pages') return Math.ceil(pages / 4) * sets;
    return pages * sets;
  };

  // ─── REUSABLE: Detailed File Card ───
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
        className="bg-white rounded-2xl border border-gray-200 shadow-[0_2px_8px_rgba(0,0,0,0.04)] overflow-hidden"
      >
        {/* File Header */}
        <div className="px-4 py-3 border-b border-gray-100 bg-gradient-to-r from-slate-50 to-white">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-2.5 flex-1 min-w-0">
              <div className="w-9 h-9 rounded-xl bg-rose-50 border border-rose-100 flex items-center justify-center shrink-0">
                <FileText className="w-4.5 h-4.5 text-rose-500" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[13px] font-bold text-gray-800 truncate leading-tight" title={file.fileName}>
                  {file.fileName}
                </p>
                <p className="text-[11px] text-gray-400 font-medium mt-0.5">
                  File {idx + 1} • ₹{file.subtotal?.toFixed(2) || '—'}
                </p>
              </div>
            </div>
            <div className="text-right shrink-0">
              <span className="bg-[#6D5DF6]/10 text-[#6D5DF6] text-[11px] font-extrabold px-2.5 py-1 rounded-lg inline-block">
                {file.sets} {file.sets === 1 ? 'Copy' : 'Copies'}
              </span>
            </div>
          </div>
        </div>
        
        {/* Print Specifications Grid */}
        <div className="px-4 py-3 space-y-3">
          {/* Specs Row 1: Key numbers */}
          <div className="grid grid-cols-3 gap-2">
            <div className="bg-blue-50 rounded-xl p-2.5 text-center border border-blue-100">
              <p className="text-[10px] text-blue-500 font-bold uppercase tracking-wide">Pages</p>
              <p className="text-[16px] font-black text-blue-700 leading-tight">{file.pagesCount}</p>
            </div>
            <div className="bg-purple-50 rounded-xl p-2.5 text-center border border-purple-100">
              <p className="text-[10px] text-purple-500 font-bold uppercase tracking-wide">Total Print</p>
              <p className="text-[16px] font-black text-purple-700 leading-tight">{totalPages}</p>
            </div>
            <div className="bg-emerald-50 rounded-xl p-2.5 text-center border border-emerald-100">
              <p className="text-[10px] text-emerald-500 font-bold uppercase tracking-wide">Sheets</p>
              <p className="text-[16px] font-black text-emerald-700 leading-tight">{sheetsNeeded}</p>
            </div>
          </div>
          
          {/* Specs Row 2: Print settings badges */}
          <div className="flex flex-wrap gap-1.5">
            <span className={`px-2.5 py-1 rounded-lg text-[11px] font-bold border ${
              file.colorType === 'color' 
                ? 'bg-amber-50 text-amber-800 border-amber-200' 
                : 'bg-gray-50 text-gray-700 border-gray-200'
            }`}>
              {file.colorType === 'color' ? '🎨 Color' : '⬛ B&W'}
            </span>
            <span className={`px-2.5 py-1 rounded-lg text-[11px] font-bold border ${
              file.layout === 'both-side'
                ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                : file.layout === 'four-pages'
                ? 'bg-violet-50 text-violet-800 border-violet-200'
                : 'bg-sky-50 text-sky-800 border-sky-200'
            }`}>
              {file.layout === 'both-side' ? '🔄 Double-Sided' : file.layout === 'four-pages' ? '📊 4-in-1' : '📄 Single-Sided'}
            </span>
            <span className={`px-2.5 py-1 rounded-lg text-[11px] font-bold border ${
              file.binding === 'spiral'
                ? 'bg-indigo-50 text-indigo-800 border-indigo-200'
                : 'bg-gray-50 text-gray-500 border-gray-200'
            }`}>
              {file.binding === 'spiral' ? '🌀 Spiral Bind' : '📎 No Binding'}
            </span>
          </div>
          
          {/* Student instructions */}
          {file.instructions && (
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-[11.5px] text-amber-900 font-semibold leading-relaxed">
              <span className="font-extrabold text-amber-700">📝 Student Note:</span> {file.instructions}
            </div>
          )}
        </div>
        
        {/* Action Buttons */}
        <div className="px-4 pb-3 grid grid-cols-2 gap-2">
          <button
            onClick={() => handleOpenPrintFile(file.pdfFileUrl)}
            className="h-10 rounded-xl border-2 border-gray-200 text-gray-700 hover:border-[#6D5DF6] hover:text-[#6D5DF6] text-[11.5px] font-bold flex items-center justify-center gap-1.5 transition-all active:scale-[0.97]"
          >
            <ExternalLink className="w-4 h-4" /> Open PDF
          </button>
          <button
            onClick={() => handleDownloadFile(file.pdfFileUrl, file.fileName)}
            disabled={isDownloading}
            className={`h-10 rounded-xl text-white text-[11.5px] font-bold flex items-center justify-center gap-1.5 transition-all active:scale-[0.97] ${
              isDownloading 
                ? 'bg-gray-400 cursor-wait' 
                : 'bg-[#6D5DF6] hover:bg-[#5C4EE5] shadow-sm'
            }`}
          >
            {isDownloading ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" /> Downloading…
              </>
            ) : (
              <>
                <Download className="w-4 h-4" /> Download
              </>
            )}
          </button>
        </div>
      </motion.div>
    );
  };

  // ─── REUSABLE: Order Info Grid ───
  const OrderInfoGrid = ({ order, compact = false }) => {
    const totalPages = order.files?.reduce((acc, f) => acc + (f.pagesCount * f.sets), 0) || 0;
    const totalSheets = order.files?.reduce((acc, f) => acc + calcSheets(f), 0) || 0;
    const hasColor = order.files?.some(f => f.colorType === 'color');
    const hasBinding = order.files?.some(f => f.binding === 'spiral');
    
    return (
      <div className={`grid gap-y-3 gap-x-3 text-[12.5px] ${compact ? 'grid-cols-2' : 'grid-cols-2 sm:grid-cols-3'}`}>
        <div>
          <span className="text-[10px] text-[#9CA3AF] font-bold block uppercase tracking-wide">👤 Student</span>
          <span className="text-gray-800 font-bold">{order.studentName}</span>
        </div>
        <div>
          <span className="text-[10px] text-[#9CA3AF] font-bold block uppercase tracking-wide">🆔 Reg. Number</span>
          <span className="text-gray-800 font-semibold">{order.registrationNumber || '—'}</span>
        </div>
        <div>
          <span className="text-[10px] text-[#9CA3AF] font-bold block uppercase tracking-wide">📞 Contact</span>
          <a href={`tel:${order.contactNumber}`} className="text-[#6D5DF6] font-bold hover:underline">
            {order.contactNumber}
          </a>
        </div>
        <div>
          <span className="text-[10px] text-[#9CA3AF] font-bold block uppercase tracking-wide">🏫 Dept / Section</span>
          <span className="text-gray-800 font-semibold">{order.department} • Section {order.section}</span>
        </div>
        <div>
          <span className="text-[10px] text-[#9CA3AF] font-bold block uppercase tracking-wide">📅 Delivery Date</span>
          <span className="text-gray-800 font-semibold">{order.deliveryDate ? formatDate(order.deliveryDate) : '—'}</span>
        </div>
        <div>
          <span className="text-[10px] text-[#9CA3AF] font-bold block uppercase tracking-wide">💰 Total Paid</span>
          <span className="text-[#6D5DF6] font-black text-[15px]">₹{order.totalPrice?.toFixed(2)}</span>
        </div>
        {!compact && (
          <>
            <div>
              <span className="text-[10px] text-[#9CA3AF] font-bold block uppercase tracking-wide">📄 Total Pages</span>
              <span className="text-gray-800 font-bold text-[14px]">{totalPages}</span>
            </div>
            <div>
              <span className="text-[10px] text-[#9CA3AF] font-bold block uppercase tracking-wide">📋 Total Sheets</span>
              <span className="text-gray-800 font-bold text-[14px]">{totalSheets}</span>
            </div>
            <div>
              <span className="text-[10px] text-[#9CA3AF] font-bold block uppercase tracking-wide">🏷️ Print Type</span>
              <span className="text-gray-700 font-semibold text-[12px]">
                {hasColor ? '🎨 Color' : '⬛ B&W'}{hasBinding ? ' • 🌀 Spiral' : ''}
              </span>
            </div>
          </>
        )}
      </div>
    );
  };

  // ─── REUSABLE: UPI & Screenshot Section ───
  const PaymentProof = ({ order }) => (
    <div className="bg-gradient-to-r from-emerald-50 to-teal-50 rounded-2xl p-4 border border-emerald-200 space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-[10px] text-emerald-600 font-extrabold uppercase tracking-wider">💳 Payment Verification</span>
      </div>
      <div className="flex items-center gap-3">
        <div className="flex-1">
          <span className="text-[10px] text-gray-500 font-bold block uppercase">UPI Reference</span>
          <div className="flex items-center gap-2 mt-1">
            <span className="bg-white border border-emerald-200 text-emerald-700 font-bold px-3 py-1 rounded-lg text-[12px] font-mono tracking-wide">
              {order.upiReference}
            </span>
            <button 
              onClick={() => copyToClipboard(order.upiReference, 'UPI reference')}
              className="text-gray-400 hover:text-emerald-600 transition-colors p-1"
            >
              <Copy className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
        {order.paymentScreenshotUrl && (
          <button 
            onClick={() => setSelectedScreenshot(order.paymentScreenshotUrl)}
            className="w-14 h-14 bg-white border-2 border-emerald-200 rounded-xl overflow-hidden shrink-0 hover:border-[#6D5DF6] transition-colors group relative"
          >
            <img src={order.paymentScreenshotUrl} alt="" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all flex items-center justify-center">
              <Eye className="w-4 h-4 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
          </button>
        )}
      </div>
    </div>
  );

  // ─── REUSABLE: Files Section with Download All ───
  const FilesSection = ({ order }) => (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Layers className="w-4 h-4 text-gray-400" />
          <span className="text-[11px] text-gray-500 font-extrabold uppercase tracking-wider">
            Files to Print ({order.files?.length})
          </span>
        </div>
        {order.files?.length > 1 && (
          <button
            onClick={() => downloadAllFiles(order.files)}
            className="text-[11px] font-bold text-[#6D5DF6] hover:text-[#5C4EE5] flex items-center gap-1 hover:underline transition-colors"
          >
            <Download className="w-3.5 h-3.5" /> Download All
          </button>
        )}
      </div>
      <div className="space-y-3">
        {order.files?.map((file, idx) => (
          <FileDetailCard key={idx} file={file} idx={idx} />
        ))}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#F8FAFC] font-sans antialiased text-[#111827] pb-32">
      
      {/* ── HEADER ── */}
      <header className="h-[80px] bg-white border-b border-[#E5E7EB] sticky top-0 z-40 px-4 sm:px-6">
        <div className="max-w-[640px] h-full mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => navigate('/vendors/print-studio')} 
              className="w-11 h-11 rounded-full border border-[#E5E7EB] flex items-center justify-center hover:bg-[#F8FAFC] transition-colors active:scale-95"
            >
              <ArrowLeft className="w-5 h-5 text-gray-600 stroke-[2.5]" />
            </button>
            <div className="w-[1px] h-6 bg-gray-200" />
            <div className="text-left">
              <h1 className="text-[15px] sm:text-[16px] font-bold text-[#111827] tracking-tight leading-none">EM Print Studio</h1>
              <p className="text-[11px] text-[#6B7280] font-medium mt-1 leading-none">Print Dashboard</p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <button 
              onClick={fetchAllOrders}
              className="w-10 h-10 rounded-full border border-[#E5E7EB] flex items-center justify-center bg-white text-gray-500 hover:text-[#6D5DF6] transition-colors active:scale-95"
            >
              <RefreshCw className="w-4.5 h-4.5" />
            </button>
            <div className="w-10 h-10 rounded-full bg-[#FAF9FF] border border-[#6D5DF6]/20 flex items-center justify-center text-[#6D5DF6] font-bold text-[13px] select-none">
              EP
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-[640px] mx-auto px-4 sm:px-6 mt-6 space-y-6">

        {/* ── SEGMENTED TABS ── */}
        <div className="bg-white border border-[#E5E7EB] rounded-[22px] p-1.5 flex shadow-sm select-none">
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
                className={`flex-1 py-3 text-[12px] sm:text-[12.5px] font-bold rounded-[20px] transition-all flex flex-col items-center justify-center gap-0.5 border ${
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

        {/* ── TAB CONTENT ── */}
        <div className="space-y-6">

          {/* ═══════════════════════════════════════════════════════════════════
              SECTION 1: VERIFICATION QUEUE
             ═══════════════════════════════════════════════════════════════════ */}
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
                <div className="space-y-5">
                  {(showAllVerification ? verificationQueue : verificationQueue.slice(0, 3)).map(order => {
                    const isExpanded = expandedOrders.has(order._id);
                    return (
                      <motion.div 
                        key={order._id}
                        layout
                        className="bg-white border border-[#E5E7EB] rounded-[22px] shadow-[0_10px_30px_rgba(15,23,42,0.04)] hover:shadow-lg transition-all text-left overflow-hidden"
                      >
                        {/* Order Header */}
                        <div className="p-5 pb-4 space-y-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-[#FAF9FF] border border-[#6D5DF6]/15 rounded-xl flex items-center justify-center text-[#6D5DF6] shrink-0">
                                <FileText className="w-5 h-5" />
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

                          {/* Quick Summary (always visible) */}
                          <div className="grid grid-cols-2 gap-y-3 gap-x-3 border-t border-[#F3F4F6] pt-4 text-[12.5px]">
                            <div>
                              <span className="text-[10px] text-[#9CA3AF] font-bold block uppercase">👤 Student</span>
                              <span className="text-gray-800 font-bold">{order.studentName}</span>
                            </div>
                            <div>
                              <span className="text-[10px] text-[#9CA3AF] font-bold block uppercase">💰 Amount</span>
                              <span className="text-[#6D5DF6] font-black text-[15px]">₹{order.totalPrice?.toFixed(2)}</span>
                            </div>
                          </div>

                          {/* Expand toggle for full details */}
                          <button
                            onClick={() => toggleExpanded(order._id)}
                            className="w-full flex items-center justify-center gap-1.5 text-[11.5px] font-bold text-gray-400 hover:text-[#6D5DF6] py-1.5 transition-colors"
                          >
                            {isExpanded ? 'Hide' : 'Show'} Full Details
                            <ChevronDown className={`w-3.5 h-3.5 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                          </button>
                        </div>

                        {/* Expanded Details */}
                        <AnimatePresence>
                          {isExpanded && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: 'auto', opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.25 }}
                              className="overflow-hidden"
                            >
                              <div className="px-5 pb-5 space-y-4">
                                {/* Full Info Grid */}
                                <div className="bg-[#F8FAFC] rounded-2xl p-4 border border-[#E5E7EB]">
                                  <OrderInfoGrid order={order} />
                                </div>

                                {/* Payment Proof */}
                                <PaymentProof order={order} />

                                {/* Files */}
                                <FilesSection order={order} />
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>

                        {/* Action Button */}
                        <div className="px-5 pb-5">
                          <button
                            onClick={() => updateStatus(order._id, 'printing')}
                            className="w-full h-[52px] rounded-[16px] border-2 border-[#6D5DF6] text-[#6D5DF6] font-bold text-[13.5px] bg-white hover:bg-[#6D5DF6] hover:text-white transition-all select-none active:scale-[0.98] flex items-center justify-center gap-1.5"
                          >
                            <CheckSquare className="w-4.5 h-4.5 stroke-[2.5]" />
                            Verify Payment & Start Printing
                          </button>
                        </div>
                      </motion.div>
                    );
                  })}

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

          {/* ═══════════════════════════════════════════════════════════════════
              SECTION 2: ACTIVE JOBS
             ═══════════════════════════════════════════════════════════════════ */}
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

              {/* Classroom Chips */}
              <div className="flex items-center gap-2 overflow-x-auto pb-1 select-none scrollbar-none">
                <button 
                  onClick={() => setSelectedClassroom(null)}
                  className={`p-2.5 rounded-xl border flex items-center justify-center shrink-0 transition-all active:scale-95 ${
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
                      className={`h-[38px] px-4 rounded-xl border text-[12.5px] font-bold flex items-center gap-1.5 shrink-0 transition-all active:scale-95 ${
                        isSelected 
                          ? 'bg-[#6D5DF6] border-[#6D5DF6] text-white shadow-sm' 
                          : 'bg-white border-[#E5E7EB] text-gray-700 hover:text-gray-900'
                      }`}
                    >
                      <span>{cName}</span>
                      <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                        isSelected ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-500'
                      }`}>
                        {count}
                      </span>
                    </button>
                  );
                })}
              </div>

              {filteredActiveJobs.length === 0 ? (
                <div className="bg-white rounded-[22px] border border-[#E5E7EB] p-12 text-center shadow-sm">
                  <div className="w-14 h-14 bg-gray-50 border border-gray-100 text-gray-400 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <Printer className="w-6 h-6" />
                  </div>
                  <h3 className="text-[15.5px] font-bold text-gray-800">No Active Jobs</h3>
                  <p className="text-[12px] text-gray-500 mt-1">No printing jobs match the active selection.</p>
                </div>
              ) : (
                <div className="space-y-5">
                  {(showAllActive ? filteredActiveJobs : filteredActiveJobs.slice(0, 3)).map(order => {
                    const isExpanded = expandedOrders.has(order._id);
                    const totalPages = order.files?.reduce((acc, f) => acc + (f.pagesCount * f.sets), 0) || 0;
                    const totalSheets = order.files?.reduce((acc, f) => acc + calcSheets(f), 0) || 0;
                    
                    return (
                      <motion.div 
                        key={order._id}
                        layout
                        className="bg-white border border-[#E5E7EB] rounded-[22px] shadow-[0_10px_30px_rgba(15,23,42,0.04)] hover:shadow-lg transition-all text-left overflow-hidden"
                      >
                        {/* Active Job Header with print summary */}
                        <div className="p-5 pb-4 space-y-4">
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
                            <span className="bg-[#FAF9FF] border border-[#6D5DF6]/20 text-[#6D5DF6] font-bold text-[10.5px] px-2.5 py-0.5 rounded-full select-none animate-pulse">
                              Printing Active
                            </span>
                          </div>

                          {/* Quick Print Summary Cards */}
                          <div className="grid grid-cols-4 gap-2">
                            <div className="bg-blue-50 rounded-xl p-2 text-center border border-blue-100">
                              <p className="text-[9px] text-blue-500 font-bold uppercase">Files</p>
                              <p className="text-[15px] font-black text-blue-700">{order.files?.length}</p>
                            </div>
                            <div className="bg-purple-50 rounded-xl p-2 text-center border border-purple-100">
                              <p className="text-[9px] text-purple-500 font-bold uppercase">Pages</p>
                              <p className="text-[15px] font-black text-purple-700">{totalPages}</p>
                            </div>
                            <div className="bg-emerald-50 rounded-xl p-2 text-center border border-emerald-100">
                              <p className="text-[9px] text-emerald-500 font-bold uppercase">Sheets</p>
                              <p className="text-[15px] font-black text-emerald-700">{totalSheets}</p>
                            </div>
                            <div className="bg-amber-50 rounded-xl p-2 text-center border border-amber-100">
                              <p className="text-[9px] text-amber-500 font-bold uppercase">Paid</p>
                              <p className="text-[14px] font-black text-amber-700">₹{order.totalPrice?.toFixed(0)}</p>
                            </div>
                          </div>

                          {/* Quick student info */}
                          <div className="grid grid-cols-2 gap-y-2.5 gap-x-3 border-t border-[#F3F4F6] pt-3 text-[12.5px]">
                            <div>
                              <span className="text-[10px] text-[#9CA3AF] font-bold block uppercase">👤 Student</span>
                              <span className="text-gray-800 font-bold">{order.studentName}</span>
                            </div>
                            <div>
                              <span className="text-[10px] text-[#9CA3AF] font-bold block uppercase">🏫 Destination</span>
                              <span className="text-gray-800 font-semibold">{order.department} • Room {order.section}</span>
                            </div>
                          </div>

                          <button
                            onClick={() => toggleExpanded(order._id)}
                            className="w-full flex items-center justify-center gap-1.5 text-[11.5px] font-bold text-gray-400 hover:text-[#6D5DF6] py-1 transition-colors"
                          >
                            {isExpanded ? 'Hide' : 'Show'} Full Details & Files
                            <ChevronDown className={`w-3.5 h-3.5 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                          </button>
                        </div>

                        {/* Expanded: Full Details + All Files */}
                        <AnimatePresence>
                          {isExpanded && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: 'auto', opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.25 }}
                              className="overflow-hidden"
                            >
                              <div className="px-5 pb-5 space-y-4">
                                <div className="bg-[#F8FAFC] rounded-2xl p-4 border border-[#E5E7EB]">
                                  <OrderInfoGrid order={order} />
                                </div>
                                <FilesSection order={order} />
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>

                        {/* Always show Download All + Dispatch buttons */}
                        <div className="px-5 pb-5 space-y-2.5">
                          <button
                            onClick={() => downloadAllFiles(order.files)}
                            className="w-full h-[44px] rounded-[14px] border-2 border-gray-200 text-gray-700 hover:border-[#6D5DF6] hover:text-[#6D5DF6] font-bold text-[12.5px] transition-all select-none active:scale-[0.98] flex items-center justify-center gap-1.5"
                          >
                            <Download className="w-4 h-4" />
                            Download All {order.files?.length} File(s)
                          </button>
                          <button
                            onClick={() => updateStatus(order._id, 'out-for-delivery')}
                            className="w-full h-[52px] rounded-[16px] bg-[#6D5DF6] hover:bg-[#5C4EE5] text-white font-bold text-[13.5px] transition-all select-none active:scale-[0.98] flex items-center justify-center gap-1.5 shadow-sm"
                          >
                            <Truck className="w-4.5 h-4.5" />
                            Dispatch Order to Runner
                          </button>
                        </div>
                      </motion.div>
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

          {/* ═══════════════════════════════════════════════════════════════════
              SECTION 3: DELIVERY LOGS
             ═══════════════════════════════════════════════════════════════════ */}
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
                <div className="space-y-5">
                  {(showAllDelivery ? deliveryLogs : deliveryLogs.slice(0, 3)).map(order => {
                    const totalPages = order.files?.reduce((acc, f) => acc + (f.pagesCount * f.sets), 0) || 0;
                    return (
                      <div 
                        key={order._id} 
                        className="bg-white border border-[#E5E7EB] rounded-[22px] p-5 shadow-[0_10px_30px_rgba(15,23,42,0.04)] hover:shadow-lg transition-all text-left space-y-4"
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
                          <span className="bg-[#FFFBEB] text-amber-800 font-bold text-[10.5px] px-2.5 py-0.5 rounded-full select-none border border-amber-100">
                            Out For Delivery
                          </span>
                        </div>

                        <div className="grid grid-cols-2 gap-y-3 gap-x-3 border-t border-b border-[#F3F4F6] py-3.5 text-[12.5px]">
                          <div>
                            <span className="text-[10px] text-[#9CA3AF] font-bold block uppercase">👤 Student</span>
                            <span className="text-gray-800 font-bold">{order.studentName}</span>
                          </div>
                          <div>
                            <span className="text-[10px] text-[#9CA3AF] font-bold block uppercase">🏫 Destination</span>
                            <span className="text-gray-800 font-semibold">{order.department} • Room {order.section}</span>
                          </div>
                          <div>
                            <span className="text-[10px] text-[#9CA3AF] font-bold block uppercase">📄 Volume</span>
                            <span className="text-gray-700 font-medium">
                              {order.files?.length} files • {totalPages} pages
                            </span>
                          </div>
                          <div>
                            <span className="text-[10px] text-[#9CA3AF] font-bold block uppercase">📞 Contact</span>
                            <a href={`tel:${order.contactNumber}`} className="text-[#6D5DF6] font-bold hover:underline">
                              {order.contactNumber}
                            </a>
                          </div>
                        </div>

                        {/* Runner details */}
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
                          className="w-full h-[52px] rounded-[16px] border-2 border-[#6D5DF6] text-[#6D5DF6] font-bold text-[13.5px] bg-white hover:bg-[#6D5DF6] hover:text-white transition-all select-none active:scale-[0.98] flex items-center justify-center gap-1.5"
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

      {/* ── SCREENSHOT LIGHTBOX ── */}
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
