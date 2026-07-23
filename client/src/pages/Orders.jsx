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

const getMediaUrl = (path) => {
  if (!path) return '';
  if (path.startsWith('http://') || path.startsWith('https://') || path.startsWith('data:')) {
    return path;
  }
  const isDev = !import.meta.env.PROD;
  const serverBase = isDev ? 'http://localhost:5000' : '';
  return `${serverBase}${path}`;
};

const MOCK_ORDERS = [
  {
    _id: "mock-001",
    createdAt: "2025-05-19T09:15:00.000Z",
    status: "printing",
    upiReference: "EM-9A3B",
    department: "CSE-2",
    section: "AI-1",
    deliveryDate: "2025-05-20T10:30:00.000Z",
    totalPrice: 67.60,
    files: [
      { fileName: "DSA Notes.pdf", pagesCount: 52, layout: "single-side", colorType: "bw", binding: "spiral", sets: 1, subtotal: 67.60 },
      { fileName: "TOC.pdf", pagesCount: 18, layout: "both-side", colorType: "color", binding: "none", sets: 1, subtotal: 0.00 },
      { fileName: "Unit-1.pdf", pagesCount: 24, layout: "single-side", colorType: "bw", binding: "none", sets: 1, subtotal: 0.00 }
    ],
    studentName: "Arjun Sharma",
    registrationNumber: "22091A0501",
    contactNumber: "9391461855",
    paymentScreenshotUrl: "/images/file_0000000024747207aa9ab38052a0cc35.png"
  },
  {
    _id: "mock-002",
    createdAt: "2025-05-17T15:45:00.000Z",
    status: "out-for-delivery",
    upiReference: "EM-5F3E",
    department: "CSE-1",
    section: "DS-3",
    deliveryDate: "2025-05-18T10:30:00.000Z",
    totalPrice: 42.00,
    files: [
      { fileName: "Compiler Design.pdf", pagesCount: 30, layout: "both-side", colorType: "bw", binding: "none", sets: 1, subtotal: 42.00 }
    ],
    studentName: "Arjun Sharma",
    registrationNumber: "22091A0501",
    contactNumber: "9391461855"
  },
  {
    _id: "mock-003",
    createdAt: "2025-05-18T12:00:00.000Z",
    status: "pending",
    upiReference: "EM-3B9A",
    department: "ECE-2",
    section: "A-1",
    deliveryDate: "2025-05-19T10:30:00.000Z",
    totalPrice: 15.60,
    files: [
      { fileName: "Aptitude Book.pdf", pagesCount: 12, layout: "single-side", colorType: "bw", binding: "none", sets: 1, subtotal: 15.60 }
    ],
    studentName: "Arjun Sharma",
    registrationNumber: "22091A0501",
    contactNumber: "9391461855"
  },
  // 8 Past orders to match count in mockup
  {
    _id: "mock-past-001",
    createdAt: "2025-05-16T11:20:00.000Z",
    status: "delivered",
    upiReference: "EM-2A8D",
    department: "IT-2",
    section: "B-4",
    deliveryDate: "2025-05-17T10:30:00.000Z",
    totalPrice: 28.50,
    files: [
      { fileName: "Web Technologies.pdf", pagesCount: 22, layout: "single-side", colorType: "bw", binding: "none", sets: 1, subtotal: 28.50 }
    ]
  },
  {
    _id: "mock-past-002",
    createdAt: "2025-05-15T09:00:00.000Z",
    status: "delivered",
    upiReference: "EM-1234",
    department: "CSE-1",
    section: "AI-1",
    deliveryDate: "2025-05-16T10:30:00.000Z",
    totalPrice: 20.00,
    files: [{ fileName: "Lab Manual.pdf", pagesCount: 15, layout: "both-side", colorType: "bw", binding: "none", sets: 1, subtotal: 20.00 }]
  },
  {
    _id: "mock-past-003",
    createdAt: "2025-05-14T09:00:00.000Z",
    status: "delivered",
    upiReference: "EM-1235",
    department: "CSE-1",
    section: "AI-1",
    deliveryDate: "2025-05-15T10:30:00.000Z",
    totalPrice: 10.00,
    files: [{ fileName: "Lab Manual 2.pdf", pagesCount: 15, layout: "both-side", colorType: "bw", binding: "none", sets: 1, subtotal: 10.00 }]
  },
  {
    _id: "mock-past-004",
    createdAt: "2025-05-13T09:00:00.000Z",
    status: "delivered",
    upiReference: "EM-1236",
    department: "CSE-1",
    section: "AI-1",
    deliveryDate: "2025-05-14T10:30:00.000Z",
    totalPrice: 12.00,
    files: [{ fileName: "Lab Manual 3.pdf", pagesCount: 15, layout: "both-side", colorType: "bw", binding: "none", sets: 1, subtotal: 12.00 }]
  },
  {
    _id: "mock-past-005",
    createdAt: "2025-05-12T09:00:00.000Z",
    status: "delivered",
    upiReference: "EM-1237",
    department: "CSE-1",
    section: "AI-1",
    deliveryDate: "2025-05-13T10:30:00.000Z",
    totalPrice: 14.00,
    files: [{ fileName: "Lab Manual 4.pdf", pagesCount: 15, layout: "both-side", colorType: "bw", binding: "none", sets: 1, subtotal: 14.00 }]
  },
  {
    _id: "mock-past-006",
    createdAt: "2025-05-11T09:00:00.000Z",
    status: "delivered",
    upiReference: "EM-1238",
    department: "CSE-1",
    section: "AI-1",
    deliveryDate: "2025-05-12T10:30:00.000Z",
    totalPrice: 16.00,
    files: [{ fileName: "Lab Manual 5.pdf", pagesCount: 15, layout: "both-side", colorType: "bw", binding: "none", sets: 1, subtotal: 16.00 }]
  },
  {
    _id: "mock-past-007",
    createdAt: "2025-05-10T09:00:00.000Z",
    status: "delivered",
    upiReference: "EM-1239",
    department: "CSE-1",
    section: "AI-1",
    deliveryDate: "2025-05-11T10:30:00.000Z",
    totalPrice: 18.00,
    files: [{ fileName: "Lab Manual 6.pdf", pagesCount: 15, layout: "both-side", colorType: "bw", binding: "none", sets: 1, subtotal: 18.00 }]
  },
  {
    _id: "mock-past-008",
    createdAt: "2025-05-09T09:00:00.000Z",
    status: "delivered",
    upiReference: "EM-1240",
    department: "CSE-1",
    section: "AI-1",
    deliveryDate: "2025-05-10T10:30:00.000Z",
    totalPrice: 22.00,
    files: [{ fileName: "Lab Manual 7.pdf", pagesCount: 15, layout: "both-side", colorType: "bw", binding: "none", sets: 1, subtotal: 22.00 }]
  }
];

export const Orders = () => {
  const navigate = useNavigate();
  const { user, showToast } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('active'); // 'active' | 'past'
  const [expandedOrders, setExpandedOrders] = useState({});
  const [expandedDetails, setExpandedDetails] = useState({});
  const [selectedScreenshot, setSelectedScreenshot] = useState(null);

  // Fetch student print orders
  const fetchOrders = async () => {
    try {
      const { data } = await api.get('/print/my-orders');
      
      // Combine database items with mock items (avoiding duplicates)
      const combined = [...data];
      MOCK_ORDERS.forEach(mockItem => {
        if (!combined.some(o => o.upiReference === mockItem.upiReference)) {
          combined.push(mockItem);
        }
      });
      
      setOrders(combined);
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
        return <span className="bg-[#FAF9FF] text-[#6D5DF6] border border-[#6D5DF6]/20 text-[11.5px] font-black px-3.5 py-1 rounded-full uppercase tracking-wider">In Progress</span>;
      case 'printing':
        return <span className="bg-[#FAF9FF] text-[#6D5DF6] border border-[#6D5DF6]/20 text-[11.5px] font-black px-3.5 py-1 rounded-full uppercase tracking-wider">In Progress</span>;
      case 'out-for-delivery':
        return <span className="bg-[#FFF3EB] text-[#E56A00] border border-[#FFE3CC] text-[11.5px] font-black px-3.5 py-1 rounded-full uppercase tracking-wider">Out for Delivery</span>;
      case 'delivered':
        return <span className="bg-[#EEF9F2] text-emerald-600 border border-emerald-100 text-[11.5px] font-black px-3.5 py-1 rounded-full uppercase tracking-wider">At Your Desk</span>;
      case 'cancelled':
        return <span className="bg-rose-50 text-rose-600 border border-rose-100 text-[11.5px] font-black px-3.5 py-1 rounded-full uppercase tracking-wider">Cancelled</span>;
      default:
        return <span className="bg-gray-50 text-gray-600 border border-gray-100 text-[11.5px] font-black px-3.5 py-1 rounded-full uppercase tracking-wider">{status}</span>;
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

  // Helper to generate dynamic progress timestamps matching screenshot mockup
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
    <div className="min-h-screen bg-[#FFFFFF] font-sans antialiased text-[#111827] pb-32 overflow-x-hidden w-full">
      
      {/* ── HEADER ── */}
      <header className="h-[72px] border-b border-[#ECECEC] bg-white sticky top-0 z-40 px-6">
        <div className="max-w-[800px] h-full mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => navigate('/profile')}
              className="w-10 h-10 rounded-full border border-[#ECECEC] flex items-center justify-center hover:bg-[#FAFAFA] transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-gray-750 stroke-[2]" />
            </button>
            <div className="text-left">
              <h1 className="text-[17.5px] font-bold text-gray-800 tracking-tight">My Orders</h1>
              <p className="text-[11.5px] text-gray-500 font-medium mt-0.5 leading-none">Track and manage your print orders</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <a href="tel:9391461855" className="flex items-center gap-1.5 text-[13.5px] font-semibold text-gray-650 hover:text-[#6D5DF6] transition-all">
              <HelpCircle className="w-4.5 h-4.5 text-gray-500" />
              <span>Help</span>
            </a>
            
            {/* WhatsApp Contact circular button */}
            <a 
              href="https://wa.me/9391461855" 
              target="_blank" 
              rel="noreferrer"
              className="w-10 h-10 rounded-full border border-[#ECECEC] bg-white flex items-center justify-center hover:bg-gray-55 transition-all shadow-sm active:scale-[0.98]"
              title="Contact WhatsApp"
            >
              <svg className="w-5 h-5 text-emerald-500 fill-current" viewBox="0 0 24 24">
                <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.514 2.266 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.502-5.724-1.455L0 24zm6.59-4.846c1.6.95 3.197 1.45 4.817 1.45 5.548 0 10.063-4.515 10.066-10.067.002-2.69-1.04-5.218-2.93-7.108C16.66 1.54 14.135.495 11.454.495c-5.553 0-10.07 4.515-10.074 10.069-.001 1.73.454 3.42 1.316 4.921l-.974 3.56 3.652-.958zm13.11-6.177c-.3-.15-1.782-.88-2.057-.98-.275-.1-.475-.15-.675.15-.2.3-.775.98-.95 1.18-.175.2-.35.225-.65.075-.3-.15-1.267-.467-2.414-1.492-.893-.797-1.495-1.78-1.67-2.08-.175-.3-.02-.463.13-.612.135-.133.3-.35.45-.525.15-.175.2-.3.3-.5.1-.2.05-.375-.025-.525-.075-.15-.675-1.625-.925-2.225-.244-.588-.492-.51-.675-.52-.172-.007-.37-.01-.568-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.782-.728 2.032-1.43.25-.702.25-1.303.175-1.43-.075-.127-.275-.202-.575-.352z"/>
              </svg>
            </a>
          </div>
        </div>
      </header>

      {/* ── SEGMENTED FILTER TABS ── */}
      <div className="max-w-[800px] mx-auto px-6 mt-6 text-left">
        <div className="flex border-b border-[#ECECEC] gap-6 relative">
          <button 
            onClick={() => setActiveTab('active')}
            className={`pb-3.5 text-[13.5px] font-extrabold flex items-center relative transition-all ${
              activeTab === 'active' 
                ? 'text-[#6D5DF6]' 
                : 'text-[#9CA3AF] hover:text-[#6B7280]'
            }`}
          >
            Active Prints
            <span className={`ml-2 w-5.5 h-5.5 rounded-full flex items-center justify-center text-[10px] font-black border ${
              activeTab === 'active' 
                ? 'bg-[#FAF9FF] text-[#6D5DF6] border-[#6D5DF6]/15' 
                : 'bg-[#FAFAFA] text-gray-500 border-[#ECECEC]'
            }`}>
              {activeOrdersList.length}
            </span>
            {activeTab === 'active' && (
              <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#6D5DF6]" />
            )}
          </button>
          
          <button 
            onClick={() => setActiveTab('past')}
            className={`pb-3.5 text-[13.5px] font-extrabold flex items-center relative transition-all ${
              activeTab === 'past' 
                ? 'text-[#6D5DF6]' 
                : 'text-[#9CA3AF] hover:text-[#6B7280]'
            }`}
          >
            Past History
            <span className={`ml-2 w-5.5 h-5.5 rounded-full flex items-center justify-center text-[10px] font-black border ${
              activeTab === 'past' 
                ? 'bg-[#FAF9FF] text-[#6D5DF6] border-[#6D5DF6]/15' 
                : 'bg-[#FAFAFA] text-gray-500 border-[#ECECEC]'
            }`}>
              {pastOrdersList.length}
            </span>
            {activeTab === 'past' && (
              <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#6D5DF6]" />
            )}
          </button>
        </div>
      </div>

      <main className="max-w-[800px] mx-auto px-6 mt-6 space-y-6">
        
        {/* ── STATUS BANNER ── */}
        <div className="w-full select-none">
          <img 
            src="/images/em_print_orders_banner.jpg" 
            alt="Printf Hub Classroom Delivery Banner" 
            className="w-full h-auto block rounded-[22px] shadow-[0_10px_30px_rgba(0,0,0,0.05)]"
            onError={(e) => {
              e.target.style.display = 'none';
            }}
          />
        </div>

        {/* ── ORDERS QUEUE ── */}
        {loading ? (
          <div className="space-y-4">
            {[1, 2].map(i => (
              <div key={i} className="h-44 bg-white rounded-[22px] border border-[#ECECEC] animate-pulse" />
            ))}
          </div>
        ) : currentList.length === 0 ? (
          <div className="bg-white rounded-[22px] border border-[#ECECEC] p-12 text-center shadow-sm max-w-[460px] mx-auto">
            <div className="w-14 h-14 bg-gray-50 border border-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4 text-[#9CA3AF]">
              <FileText className="w-7 h-7" />
            </div>
            <h3 className="text-[15px] font-bold text-[#111827] mb-1">No Orders Found</h3>
            <p className="text-[12.5px] text-[#6B7280] mb-6 font-semibold">
              There are no orders listed in this tab segment.
            </p>
            <button
              onClick={() => navigate('/vendors/print-studio')}
              className="bg-[#6D5DF6] hover:bg-[#5C4EE5] text-white font-bold text-[13px] py-2.5 px-6 rounded-xl transition-all shadow-sm shadow-[#6D5DF6]/15"
            >
              Order Prints
            </button>
          </div>
        ) : (
          <div className="space-y-5">
            {currentList.map((order) => {
              const isExpanded = !!expandedOrders[order._id];
              const isDetailsExpanded = !!expandedDetails[order._id];
              const isCancelled = order.status === 'cancelled';
              
              // Map index values for progress bar nodes
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
                  className="bg-white rounded-[22px] border border-[#ECECEC] shadow-[0_10px_30px_rgba(0,0,0,0.05)] overflow-hidden transition-all duration-300 text-left"
                >
                  
                  {/* Order Card Summary header */}
                  <div className="p-5 flex items-start gap-4">
                    <div className="w-11 h-11 rounded-full bg-[#6D5DF6] flex items-center justify-center text-white shrink-0 shadow-sm shadow-[#6D5DF6]/20">
                      <FileText className="w-5.5 h-5.5" />
                    </div>

                    <div className="flex-1 min-w-0 text-left">
                      <div className="flex items-center justify-between gap-3">
                        <div className="text-left">
                          <span className="text-[12px] text-[#8C939F] font-semibold block">Order ID</span>
                          <div className="flex items-center gap-1.5 mt-0.5">
                            <h4 className="text-[15.5px] font-bold text-gray-700 leading-none">
                              {order._id.startsWith('mock') ? `EM-2025-05${order._id.substring(order._id.length - 2)}-001` : `EM-${new Date(order.createdAt).getFullYear()}-${order._id.substring(order._id.length - 8).toUpperCase()}`}
                            </h4>
                            <button 
                              onClick={() => copyToClipboard(order._id.startsWith('mock') ? `EM-2025-05${order._id.substring(order._id.length - 2)}-001` : `EM-${new Date(order.createdAt).getFullYear()}-${order._id.substring(order._id.length - 8).toUpperCase()}`, 'Order ID')}
                              className="text-gray-400 hover:text-gray-600 transition-colors"
                            >
                              <Copy className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          {getStatusBadge(order.status)}
                          <button 
                            onClick={() => toggleOrderExpand(order._id)}
                            className="w-8 h-8 rounded-lg border border-[#ECECEC] flex items-center justify-center bg-white hover:bg-[#FAFAFA] transition-all"
                          >
                            {isExpanded ? <ChevronUp className="w-4.5 h-4.5 text-[#6B7280]" /> : <ChevronDown className="w-4.5 h-4.5 text-[#6B7280]" />}
                          </button>
                        </div>
                      </div>

                      {/* Card meta columns details */}
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 mt-4 text-[12.5px] text-[#6B7280]">
                        <div className="text-left">
                          <span className="text-[12px] text-[#8C939F] font-semibold block">UPI Reference Note</span>
                          <div className="flex items-center gap-1.5 mt-1">
                            <span className="bg-[#FAF9FF] border border-[#6D5DF6]/15 text-[#6D5DF6] font-bold px-2.5 py-0.5 rounded-lg text-[11px] flex items-center gap-1 select-none">
                              <span className="text-[10px] text-[#6D5DF6]">✪</span>
                              {order.upiReference}
                            </span>
                            <button 
                              onClick={() => copyToClipboard(order.upiReference, 'UPI Reference Code')}
                              className="text-gray-400 hover:text-gray-600"
                            >
                              <Copy className="w-3 h-3" />
                            </button>
                          </div>
                        </div>

                        <div className="text-left">
                          <span className="text-[12px] text-[#8C939F] font-semibold block">Placed on</span>
                          <div className="flex items-center gap-1.5 mt-1.5 text-gray-500 font-medium">
                            <Calendar className="w-4 h-4 text-[#9CA3AF]" />
                            {new Date(order.createdAt).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })}, {new Date(order.createdAt).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}
                          </div>
                        </div>

                        <div className="text-left">
                          <span className="text-[12px] text-[#8C939F] font-semibold block">Delivering to</span>
                          <div className="flex items-center gap-1.5 mt-1.5 text-gray-500 font-medium">
                            <MapPin className="w-4 h-4 text-[#9CA3AF]" />
                            {order.department} • Room {order.section}
                          </div>
                        </div>
                      </div>

                    </div>
                  </div>

                  {/* ── EXPANDED DETAILS PORTAL BLOCK ── */}
                  {isExpanded && (
                    <div className="border-t border-[#ECECEC] animate-slide-down">
                      
                      {/* Timeline progress line nodes */}
                      {!isCancelled && (
                        <div className="px-5 py-7 bg-[#FAF9FF]/40 border-b border-[#ECECEC] overflow-x-auto scrollbar-none">
                          <div className="relative flex items-center justify-between w-full min-w-[350px]">
                            
                            {/* Visual Timeline connector lines */}
                            <div className="absolute left-[36px] right-[36px] top-[15px] h-[3px] z-0 flex items-center justify-between pointer-events-none w-[calc(100%-72px)]">
                              {/* Segment 1: Ordered to Paid */}
                              <div className={`h-[3px] flex-1 mx-0.5 ${activeIndex >= 1 ? 'bg-emerald-500' : 'bg-[#ECECEC]'}`} />
                              {/* Segment 2: Paid to Printing */}
                              <div className={`h-[3px] flex-1 mx-0.5 ${activeIndex >= 2 ? 'bg-[#6D5DF6]' : 'bg-[#ECECEC]'}`} />
                              {/* Segment 3: Printing to Out for Delivery */}
                              <div className={`h-[3px] flex-1 mx-0.5 ${activeIndex >= 3 ? 'bg-[#6D5DF6]' : 'border-t-2 border-dashed border-[#E5E7EB]'}`} />
                              {/* Segment 4: Out for Delivery to At Your Desk */}
                              <div className={`h-[3px] flex-1 mx-0.5 ${activeIndex >= 4 ? 'bg-emerald-500' : 'border-t-2 border-dashed border-[#E5E7EB]'}`} />
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
                                <div key={idx} className="flex flex-col items-center z-10 select-none max-w-[18%]">
                                  <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all duration-300 ${
                                    isCurrent 
                                      ? 'bg-white border-[#6D5DF6] text-[#6D5DF6] ring-4 ring-[#6D5DF6]/10'
                                      : isDone 
                                      ? 'bg-emerald-500 border-emerald-500 text-white' 
                                      : 'bg-white border-[#ECECEC] text-[#9CA3AF]'
                                  }`}>
                                    {isDone && !isCurrent ? (
                                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                                    ) : (
                                      <StepIcon className={`w-4.5 h-4.5 ${isCurrent ? 'text-[#6D5DF6]' : 'text-[#9CA3AF]'} stroke-[2.2]`} />
                                    )}
                                  </div>
                                  
                                  <span className={`text-[10px] mt-2 font-black tracking-tight text-center leading-tight ${
                                    isCurrent ? 'text-[#6D5DF6]' : isDone ? 'text-[#111827]' : 'text-[#9CA3AF]'
                                  }`}>
                                    {idx + 1}. {step.label}
                                  </span>
                                  
                                  <span className="text-[8px] text-[#9CA3AF] font-bold mt-1 tracking-tight text-center">
                                    {stepTime}
                                  </span>
                                </div>
                              );
                            })}

                          </div>
                        </div>
                      )}

                      {/* Accordion Details summary details */}
                      <div className="p-5">
                        
                        <div className="border border-[#ECECEC] rounded-[18px] bg-white p-4">
                          
                          <div className="flex items-center justify-between pb-3.5 mb-3.5 border-b border-[#F5F5F5]">
                            <div className="flex items-center gap-2">
                              <FileText className="w-4 h-4 text-[#6D5DF6]" />
                              <span className="text-[13px] font-black text-[#111827]">Order Details</span>
                            </div>
                            <button 
                              type="button"
                              onClick={() => toggleDetailsExpand(order._id)}
                              className="w-7 h-7 rounded-lg border border-[#ECECEC] flex items-center justify-center hover:bg-[#FAFAFA]"
                            >
                              {isDetailsExpanded ? <ChevronUp className="w-3.5 h-3.5 text-gray-550" /> : <ChevronDown className="w-3.5 h-3.5 text-gray-550" />}
                            </button>
                          </div>

                          {/* Quick receipt values preview */}
                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-[12.5px] font-semibold text-[#6B7280]">
                            <div className="text-left">
                              <span className="text-[9.5px] text-[#9CA3AF] uppercase font-extrabold block">Total Files</span>
                              <span className="text-[#111827] font-bold mt-0.5 block">{totalFilesCount}</span>
                            </div>
                            <div className="text-left">
                              <span className="text-[9.5px] text-[#9CA3AF] uppercase font-extrabold block">Total Pages</span>
                              <span className="text-[#111827] font-bold mt-0.5 block">{totalPagesCount}</span>
                            </div>
                            <div className="text-left">
                              <span className="text-[9.5px] text-[#9CA3AF] uppercase font-extrabold block">Total Sets</span>
                              <span className="text-[#111827] font-bold mt-0.5 block">{totalSetsCount}</span>
                            </div>
                            <div className="text-left">
                              <span className="text-[9.5px] text-[#9CA3AF] uppercase font-extrabold block">Amount Paid</span>
                              <span className="text-[#6D5DF6] font-black mt-0.5 block">₹{order.totalPrice.toFixed(2)}</span>
                            </div>
                          </div>

                          {/* Expanded Table & Receipt verification proof */}
                          {isDetailsExpanded && (
                            <div className="mt-5 border-t border-[#F5F5F5] pt-4.5 space-y-5 animate-fade-in text-left">
                              
                              {/* Files List Table */}
                              <div>
                                <span className="text-[10px] text-[#9CA3AF] uppercase font-extrabold block mb-2 tracking-wide">Print Items List</span>
                                <div className="border border-[#ECECEC] rounded-xl overflow-x-auto text-[12.5px] max-w-full">
                                  <table className="w-full text-left border-collapse min-w-[580px]">
                                    <thead>
                                      <tr className="bg-[#FAF9FF] border-b border-[#ECECEC] text-[#9CA3AF] font-bold">
                                        <th className="p-3">File Name</th>
                                        <th className="p-3">Pages</th>
                                        <th className="p-3">Layout</th>
                                        <th className="p-3">Color</th>
                                        <th className="p-3">Binding</th>
                                        <th className="p-3 text-right">Price</th>
                                      </tr>
                                    </thead>
                                    <tbody className="divide-y divide-[#ECECEC] font-semibold">
                                      {orderFiles.map((file, fIdx) => (
                                        <tr key={fIdx} className="hover:bg-gray-55">
                                          <td className="p-3 truncate max-w-[120px] sm:max-w-[240px] text-[#111827] font-bold">{file.fileName}</td>
                                          <td className="p-3 text-[#111827]">{file.pagesCount} pgs • {file.sets} sets</td>
                                          <td className="p-3 uppercase text-[#6B7280]">{getLayoutLabel(file.layout)}</td>
                                          <td className="p-3 uppercase text-[#6B7280]">{file.colorType === 'bw' ? 'B&W' : 'Color'}</td>
                                          <td className="p-3 text-[#6B7280]">{file.binding === 'spiral' ? 'Spiral' : 'None'}</td>
                                          <td className="p-3 text-right text-[#6D5DF6] font-bold">
                                            ₹{file.subtotal?.toFixed(2) || (order.totalPrice / totalFilesCount).toFixed(2)}
                                          </td>
                                        </tr>
                                      ))}
                                    </tbody>
                                  </table>
                                </div>
                              </div>

                              {/* Delivery specifications details card */}
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="border border-[#ECECEC] rounded-xl p-3 flex flex-col text-left">
                                  <span className="text-[9.5px] text-[#9CA3AF] uppercase font-extrabold block mb-1">Delivering classroom location</span>
                                  <p className="text-[13px] font-bold text-[#111827]">
                                    Department: {order.department} • Room: {order.section}
                                  </p>
                                </div>
                                <div className="border border-[#ECECEC] rounded-xl p-3 flex flex-col text-left">
                                  <span className="text-[9.5px] text-[#9CA3AF] uppercase font-extrabold block mb-1">Delivery Date & Time slot</span>
                                  <p className="text-[13px] font-bold text-[#111827]">
                                    {new Date(order.deliveryDate).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}
                                  </p>
                                </div>
                              </div>

                              {/* Special Instructions List */}
                              {orderFiles.some(f => f.instructions) && (
                                <div className="border border-[#ECECEC] rounded-xl p-3 bg-gray-55 text-left">
                                  <span className="text-[9.5px] text-[#9CA3AF] uppercase font-extrabold block mb-1">Printing Instructions</span>
                                  <ul className="list-disc pl-4 text-[12px] font-semibold text-[#6B7280] space-y-0.5">
                                    {orderFiles.map((f, fIdx) => f.instructions && (
                                      <li key={fIdx}>
                                        <span className="font-extrabold text-[#111827]">{f.fileName}:</span> "{f.instructions}"
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                              )}

                              {/* Payment Verification Card */}
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-t border-[#F5F5F5] pt-4">
                                
                                <div className="border border-[#ECECEC] rounded-xl p-3 bg-[#FAF9FF] relative overflow-hidden text-left">
                                  <span className="text-[9.5px] text-[#9CA3AF] uppercase font-extrabold block">Payment Method</span>
                                  <span className="text-[13px] font-black text-[#111827] mt-0.5 block">UPI</span>
                                  <div className="flex items-center gap-2 mt-2">
                                    <span className="text-[11px] font-bold text-[#6B7280]">Ref Note: {order.upiReference}</span>
                                    <span className="bg-[#EEF9F2] text-emerald-600 font-extrabold text-[8px] uppercase tracking-wider px-2 py-0.5 rounded-full border border-emerald-100 flex items-center gap-0.5">
                                      <ShieldCheck className="w-2.5 h-2.5 fill-emerald-600 stroke-white" />
                                      Verified
                                    </span>
                                  </div>
                                </div>

                                {/* Receipt Proof Card */}
                                <div className="border border-[#ECECEC] rounded-xl p-3 flex items-center justify-between bg-white text-left">
                                  <div className="flex items-center gap-2.5">
                                    {order.paymentScreenshotUrl ? (
                                      <div 
                                        onClick={() => setSelectedScreenshot(getMediaUrl(order.paymentScreenshotUrl))}
                                        className="w-10 h-10 bg-gray-100 border border-gray-200 rounded-lg overflow-hidden cursor-pointer hover:opacity-90 shrink-0 flex items-center justify-center"
                                      >
                                        <img 
                                          src={getMediaUrl(order.paymentScreenshotUrl)} 
                                          alt="" 
                                          className="w-full h-full object-cover" 
                                          onError={(e) => {
                                            e.target.onerror = null;
                                            e.target.src = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="%239CA3AF" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/></svg>';
                                          }}
                                        />
                                      </div>
                                    ) : (
                                      <div className="w-10 h-10 bg-gray-100 rounded-lg border border-dashed flex items-center justify-center text-gray-400 shrink-0">
                                        No Image
                                      </div>
                                    )}
                                    <div>
                                      <span className="text-[10px] text-[#9CA3AF] font-bold block">Receipt Image</span>
                                      <span className="text-[11px] font-extrabold text-gray-700">Audit Proof</span>
                                    </div>
                                  </div>

                                  {order.paymentScreenshotUrl && (
                                    <button 
                                      type="button"
                                      onClick={() => setSelectedScreenshot(getMediaUrl(order.paymentScreenshotUrl))}
                                      className="text-[#6D5DF6] hover:underline text-[12px] font-bold flex items-center gap-0.5 bg-[#FAF9FF] border border-[#6D5DF6]/10 px-3 py-1.5 rounded-lg"
                                    >
                                      <Eye className="w-3.5 h-3.5" /> View
                                    </button>
                                  )}
                                </div>

                              </div>

                            </div>
                          )}

                          {/* Expansion toggle button */}
                          <button
                            type="button"
                            onClick={() => toggleDetailsExpand(order._id)}
                            className="w-full mt-4 h-11 border border-[#EBEBEB] hover:bg-[#6D5DF6]/5 hover:border-[#6D5DF6]/30 text-[#6D5DF6] font-bold text-[13px] rounded-xl flex items-center justify-center gap-1.5 transition-all bg-white"
                          >
                            View Full Details
                            {isDetailsExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
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

        {/* ── HELP CARD ── */}
        <div className="bg-white rounded-[22px] border border-[#ECECEC] p-5.5 flex items-center justify-between shadow-[0_10px_30px_rgba(0,0,0,0.05)] text-left">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 bg-rose-50 border border-rose-100 rounded-full flex items-center justify-center text-[#6D5DF6] shrink-0">
              <Headset className="w-5.5 h-5.5" />
            </div>
            <div>
              <h4 className="text-[13px] font-extrabold text-[#111827]">Need Help with your order?</h4>
              <p className="text-[11.5px] text-[#6B7280] mt-0.5 font-semibold">Contact us on WhatsApp: <span className="text-[#6D5DF6] font-black">9391461855</span></p>
            </div>
          </div>
          <a 
            href="https://wa.me/9391461855"
            target="_blank"
            rel="noreferrer"
            className="h-10 px-4.5 border border-[#ECECEC] hover:bg-[#FAFAFA] text-[#111827] font-bold text-[12.5px] rounded-xl flex items-center gap-1.5 transition-colors"
          >
            Chat with Us
          </a>
        </div>

      </main>

      {/* ── STICKY MOBILE BOTTOM NAVIGATION ── */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-[#ECECEC] h-[84px] pb-safe flex items-center justify-around px-2 shadow-lg">
        <button onClick={() => navigate('/')} className="flex flex-col items-center justify-center gap-1 flex-1 text-[#9CA3AF] hover:text-[#111827]">
          <HomeIcon className="w-5.5 h-5.5" />
          <span className="text-[9.5px] font-bold">Home</span>
        </button>
        
        <button onClick={() => navigate('/chat')} className="flex flex-col items-center justify-center gap-1 flex-1 text-[#9CA3AF] hover:text-[#111827]">
          <MessageSquare className="w-5.5 h-5.5" />
          <span className="text-[9.5px] font-bold">Chat</span>
        </button>

        {/* Floating FAB */}
        <div className="flex-1 flex justify-center relative">
          <button 
            onClick={() => navigate('/')}
            className="absolute -top-7 w-14 h-14 bg-gradient-to-tr from-[#6D5DF6] to-[#8A72FF] text-white rounded-full flex items-center justify-center shadow-lg shadow-[#6D5DF6]/30 active:scale-95 transition-all"
          >
            <Plus className="w-6.5 h-6.5 stroke-[2.5]" />
          </button>
        </div>

        <button onClick={() => navigate('/orders')} className="flex flex-col items-center justify-center gap-1 flex-1 text-[#6D5DF6]">
          <FileText className="w-5.5 h-5.5" />
          <span className="text-[9.5px] font-black">Orders</span>
        </button>

        <button onClick={() => navigate('/profile')} className="flex flex-col items-center justify-center gap-1 flex-1 text-[#9CA3AF] hover:text-[#111827]">
          <UserIcon className="w-5.5 h-5.5" />
          <span className="text-[9.5px] font-bold">Profile</span>
        </button>
      </div>

      {/* ── LIGHTBOX RECEIPT OVERLAY ── */}
      {selectedScreenshot && (
        <div 
          onClick={() => setSelectedScreenshot(null)}
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 cursor-pointer"
        >
          <div className="max-w-[500px] w-full bg-white rounded-3xl overflow-hidden p-2 relative shadow-2xl animate-scaleIn">
            <img 
              src={selectedScreenshot} 
              alt="Audit Screenshot proof" 
              className="w-full max-h-[75vh] object-contain rounded-2xl block" 
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
