import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, Headset, UploadCloud, FileText, 
  Trash2, Plus, Minus, Check, Lock, AlertTriangle, 
  ShieldCheck, XCircle, Info, Copy, ShieldAlert
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';

export const PrintStudio = () => {
  const navigate = useNavigate();
  const { user, showToast } = useAuth();

  // Student Details State
  const [useMyDetails, setUseMyDetails] = useState(true);
  const [deliverToAnother, setDeliverToAnother] = useState(false);
  const [studentName, setStudentName] = useState('');
  const [registrationNumber, setRegistrationNumber] = useState('');
  const [contactNumber, setContactNumber] = useState('');

  // Delivery Details State
  const [department, setDepartment] = useState('');
  const [section, setSection] = useState('');
  const [deliveryDate, setDeliveryDate] = useState('');
  const [dateError, setDateError] = useState(false);

  const todayDateString = (() => {
    const localDate = new Date();
    const yyyy = localDate.getFullYear();
    const mm = String(localDate.getMonth() + 1).padStart(2, '0');
    const dd = String(localDate.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  })();

  const earliestAllowedDate = (() => {
    const localDate = new Date(Date.now() + 2 * 86400000); // 2 days / 48 hours from now
    const dd = String(localDate.getDate()).padStart(2, '0');
    const mm = String(localDate.getMonth() + 1).padStart(2, '0');
    const yyyy = localDate.getFullYear();
    return `${dd}-${mm}-${yyyy}`;
  })();

  // Files State
  const [files, setFiles] = useState([]);
  const fileInputRef = useRef(null);

  // Modal State
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [upiRefCode, setUpiRefCode] = useState('');
  const [paymentScreenshot, setPaymentScreenshot] = useState(null);
  const [paymentScreenshotPreview, setPaymentScreenshotPreview] = useState('');
  const [submittingOrder, setSubmittingOrder] = useState(false);

  // Departments & Slots Config
  const DEPARTMENTS = ['CSE', 'ECE', 'EEE', 'MECH', 'CIVIL', 'IT', 'AI', 'DS'];
  const SECTIONS = ['AI-1', 'AI-2', 'CSE-1', 'CSE-2', 'DS-1', 'DS-2', 'ECE-1', 'ECE-2', 'MECH-1'];

  // Load User Data
  useEffect(() => {
    if (user && useMyDetails) {
      setStudentName(user.fullName || '');
      setRegistrationNumber(user.registrationNumber || '');
      setContactNumber(user.whatsappNumber || '');
    }
  }, [user, useMyDetails]);

  // Dynamic values calculation
  const totalFiles = files.length;
  const totalPages = files.reduce((acc, f) => acc + (f.pages * f.sets), 0);
  const totalSets = files.reduce((acc, f) => acc + f.sets, 0);

  const calculateFileSubtotal = (fileObj) => {
    let sheets = fileObj.pages;
    if (fileObj.layout === 'both-side') {
      sheets = Math.ceil(fileObj.pages / 2);
    } else if (fileObj.layout === 'four-pages') {
      sheets = Math.ceil(fileObj.pages / 4);
    }
    const perPaperRate = fileObj.colorType === 'bw' ? 1.3 : 3.5;
    const bindingCost = fileObj.binding === 'spiral' ? 30 : 0;
    return parseFloat(((sheets * perPaperRate * fileObj.sets) + (bindingCost * fileObj.sets)).toFixed(2));
  };

  const subtotal = parseFloat(files.reduce((acc, f) => acc + calculateFileSubtotal(f), 0).toFixed(2));
  const totalPayable = subtotal;

  // Date validation (48 hours / 2 days check)
  const validateDeliveryDateTime = (dateVal) => {
    if (!dateVal) return;
    const selectedDate = new Date(dateVal + 'T00:00:00');
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const diffTime = selectedDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 2) {
      setDateError(true);
    } else {
      setDateError(false);
    }
  };

  const handleDateChange = (e) => {
    setDeliveryDate(e.target.value);
    validateDeliveryDateTime(e.target.value);
  };

  const handleUseMyDetails = (checked) => {
    setUseMyDetails(checked);
    if (checked) {
      setDeliverToAnother(false);
      if (user) {
        setStudentName(user.fullName || '');
        setRegistrationNumber(user.registrationNumber || '');
        setContactNumber(user.whatsappNumber || '');
      }
    }
  };

  const handleDeliverToAnother = (checked) => {
    setDeliverToAnother(checked);
    if (checked) {
      setUseMyDetails(false);
      setStudentName('');
      setRegistrationNumber('');
      setContactNumber('');
    }
  };

  // PDF Page counting scanner
  const parsePdfPageCount = async (file) => {
    return new Promise((resolve) => {
      // For large files (> 5MB), read only the last 2MB chunk to prevent memory crash and regex lockups
      const CHUNK_SIZE = 2 * 1024 * 1024;
      const fileSlice = file.size > CHUNK_SIZE ? file.slice(file.size - CHUNK_SIZE) : file;

      const reader = new FileReader();
      reader.onload = function() {
        try {
          const text = reader.result;
          const matches = text.match(/\/Count\s+(\d+)/g);
          if (matches) {
            const lastMatch = matches[matches.length - 1];
            const count = parseInt(lastMatch.match(/\d+/)[0], 10);
            resolve(count || 1);
          } else {
            resolve(1);
          }
        } catch (e) {
          resolve(1);
        }
      };
      reader.onerror = () => resolve(1);
      reader.readAsBinaryString(fileSlice);
    });
  };

  // Upload PDFs local handler
  const handleFileChange = async (e) => {
    const selectedFiles = Array.from(e.target.files);
    if (selectedFiles.length === 0) return;

    const pdfs = selectedFiles.filter(file => file.type === 'application/pdf');
    if (pdfs.length === 0) {
      showToast('Please select actual PDF files.', 'error');
      return;
    }
    
    for (let file of pdfs) {
      const tempId = Date.now() + '-' + Math.random();
      const pagesCount = await parsePdfPageCount(file);

      const fileItem = {
        id: tempId,
        fileName: file.name,
        pages: pagesCount,
        sets: 1,
        layout: 'single-side',
        colorType: 'bw',
        binding: 'none',
        instructions: '',
        fileObject: file,
        pdfFileUrl: '',
        uploading: true
      };

      setFiles(prev => [...prev, fileItem]);

      try {
        const formData = new FormData();
        formData.append('pdf', file);
        
        const response = await api.post('/print/upload-pdf', formData, {
          headers: { 'Content-Type': undefined },
          timeout: 5 * 60 * 1000 // 5 minutes for large PDFs
        });

        setFiles(prev => prev.map(f => f.id === tempId ? { 
          ...f, 
          pdfFileUrl: response.data.url, 
          pages: response.data.pagesCount || f.pages,
          uploading: false 
        } : f));

      } catch (err) {
        showToast(`Failed to upload ${file.name}`, 'error');
        setFiles(prev => prev.filter(f => f.id !== tempId));
      }
    }
  };

  const updateFileSpec = (id, key, value) => {
    setFiles(prev => prev.map(f => f.id === id ? { ...f, [key]: value } : f));
  };

  const removeFile = (id) => {
    setFiles(prev => prev.filter(f => f.id !== id));
  };

  const handleProceedToPayment = () => {
    if (files.length === 0) {
      showToast('Please upload at least one PDF file.', 'error');
      return;
    }
    if (files.some(f => f.uploading)) {
      showToast('Please wait until all files finish uploading.', 'error');
      return;
    }
    if (!department.trim() || !section.trim()) {
      showToast('Please fill in your department and section.', 'error');
      return;
    }
    if (!deliveryDate) {
      showToast('Please select a delivery date.', 'error');
      return;
    }
    if (dateError) {
      showToast(`Cannot checkout: delivery date must be at least 2 days away. Earliest available date is ${earliestAllowedDate}.`, 'error');
      return;
    }

    const chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    let code = '';
    for (let i = 0; i < 4; i++) {
      code += chars[Math.floor(Math.random() * chars.length)];
    }
    setUpiRefCode(`EM-${code}`);
    setIsPaymentModalOpen(true);
  };

  // Upload Payment Screenshot
  const handleScreenshotChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      showToast('Only image files are allowed as payment receipt proof.', 'error');
      return;
    }

    const previewUrl = URL.createObjectURL(file);
    setPaymentScreenshotPreview(previewUrl);

    try {
      const formData = new FormData();
      formData.append('screenshot', file);
      
      const response = await api.post('/print/upload-screenshot', formData, {
        headers: { 'Content-Type': undefined },
        timeout: 60 * 1000 // 1 minute for screenshots
      });
      setPaymentScreenshot(response.data.url);
    } catch (err) {
      showToast('Receipt upload failed. Please try again.', 'error');
    }
  };

  // Submit Order
  const handleVerifySubmit = async () => {
    if (submittingOrder) return;
    if (!paymentScreenshot) {
      showToast('Please upload the payment transaction receipt screenshot.', 'error');
      return;
    }

    setSubmittingOrder(true);
    try {
      const mappedFiles = files.map(f => ({
        pdfFileUrl: f.pdfFileUrl,
        fileName: f.fileName,
        pagesCount: f.pages,
        layout: f.layout,
        colorType: f.colorType,
        binding: f.binding,
        sets: f.sets,
        instructions: f.instructions,
        subtotal: calculateFileSubtotal(f)
      }));

      const payload = {
        studentName,
        registrationNumber,
        contactNumber,
        section,
        department,
        files: mappedFiles,
        paymentScreenshotUrl: paymentScreenshot,
        upiReference: upiRefCode,
        deliveryDate,
        totalPrice: totalPayable
      };

      await api.post('/print/order', payload);
      showToast('Print order submitted successfully!', 'success');
      setIsPaymentModalOpen(false);
      navigate('/orders');
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to place print order', 'error');
    } finally {
      setSubmittingOrder(false);
    }
  };

  const isViit = user?.college === "Vignan's Institute of Information Technology (VIIT)";

  return (
    <div className="min-h-screen bg-[#FAFAFA] font-sans antialiased text-gray-700 pb-24">
      
      {/* ── HEADER ── */}
      <header className="h-[80px] border-b border-[#EBEBEB] bg-white sticky top-0 z-40">
        <div className="max-w-[1280px] h-full mx-auto px-6 flex items-center justify-between">
          <div className="flex items-center gap-3.5">
            <button 
              onClick={() => navigate('/vendors')}
              className="w-10 h-10 rounded-full border border-[#EBEBEB] flex items-center justify-center hover:bg-[#FAFAFA] transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-gray-750 stroke-[2]" />
            </button>
            <div className="text-left">
              <h1 className="text-[17.5px] font-bold text-gray-800 tracking-tight leading-tight">EM Printf Hub</h1>
              <p className="text-[11.5px] text-[#6D5DF6] font-bold mt-0.5">Print Studio</p>
            </div>
          </div>

          <div className="flex items-center gap-4.5">
            <a href="tel:9391461855" className="flex items-center gap-1.5 text-[13.5px] font-semibold text-gray-650 hover:text-[#6D5DF6] transition-all">
              <Headset className="w-4.5 h-4.5 text-gray-500" /> Help
            </a>
            
            {/* WhatsApp Contact pill card */}
            <a 
              href="https://wa.me/9391461855" 
              target="_blank" 
              rel="noreferrer"
              className="h-11 px-4 rounded-2xl border border-[#EBEBEB] bg-white text-gray-750 flex items-center gap-3 hover:bg-gray-50 transition-all shadow-sm active:scale-[0.98]"
            >
              <svg className="w-[18px] h-[18px] text-emerald-500 fill-current" viewBox="0 0 24 24">
                <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.514 2.266 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.502-5.724-1.455L0 24zm6.59-4.846c1.6.95 3.197 1.45 4.817 1.45 5.548 0 10.063-4.515 10.066-10.067.002-2.69-1.04-5.218-2.93-7.108C16.66 1.54 14.135.495 11.454.495c-5.553 0-10.07 4.515-10.074 10.069-.001 1.73.454 3.42 1.316 4.921l-.974 3.56 3.652-.958zm13.11-6.177c-.3-.15-1.782-.88-2.057-.98-.275-.1-.475-.15-.675.15-.2.3-.775.98-.95 1.18-.175.2-.35.225-.65.075-.3-.15-1.267-.467-2.414-1.492-.893-.797-1.495-1.78-1.67-2.08-.175-.3-.02-.463.13-.612.135-.133.3-.35.45-.525.15-.175.2-.3.3-.5.1-.2.05-.375-.025-.525-.075-.15-.675-1.625-.925-2.225-.244-.588-.492-.51-.675-.52-.172-.007-.37-.01-.568-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.782-.728 2.032-1.43.25-.702.25-1.303.175-1.43-.075-.127-.275-.202-.575-.352z"/>
              </svg>
              <div className="flex flex-col text-left leading-none">
                <span className="text-[10px] text-gray-500 font-semibold">Contact Us</span>
                <span className="text-[13px] text-gray-700 font-bold mt-1">9391461855</span>
              </div>
            </a>
          </div>
        </div>
      </header>

      <main className="max-w-[1280px] mx-auto px-6 mt-8 space-y-6">
        
        {/* ── HERO BANNER ── */}
        <div className="w-full">
          <img 
            src="/images/em_print_studio_banner.png" 
            alt="Printf Hub Classroom Delivery Banner" 
            className="w-full h-auto block rounded-[24px]"
            onError={(e) => {
              e.target.style.display = 'none';
            }}
          />
        </div>

        {/* ── ALERT BAR ── */}
        <div className="bg-rose-50 border border-rose-100 rounded-2xl p-4.5 flex items-center gap-3.5 shadow-sm text-left">
          <XCircle className="w-5.5 h-5.5 text-rose-500 shrink-0" />
          <p className="text-[13px] text-rose-700 leading-relaxed font-semibold">
            Outside VIIT? Please contact us on <span className="font-extrabold text-rose-900 underline">9391461855</span> for manual checkout. We will assist you personally!
          </p>
        </div>

        {!isViit ? (
          /* Restriction Card */
          <div className="bg-white rounded-[24px] border border-[#EBEBEB] p-8 text-center shadow-[0_10px_30px_rgba(0,0,0,0.05)]">
            <XCircle className="w-14 h-14 text-rose-500 mx-auto mb-4" />
            <h2 className="text-[18px] font-bold text-gray-800 mb-2">VIIT Eligibility Restricted</h2>
            <p className="text-[13.5px] text-[#6B7280] max-w-[460px] mx-auto mb-6 leading-relaxed font-semibold">
              Automated in-classroom delivery is currently limited to Vignan's Institute of Information Technology (VIIT) students.
            </p>
            <a 
              href="tel:9391461855" 
              className="inline-flex items-center gap-2 bg-[#6D5DF6] hover:bg-[#5C4EE5] text-white font-bold py-2.5 px-6 rounded-xl transition-all shadow-md active:scale-95"
            >
              Contact Coordinator
            </a>
          </div>
        ) : (
          /* Main Portal Ordering Interface */
          <div className="space-y-6">
            
            {/* ── SECTION: YOUR DETAILS ── */}
            <div className="bg-white rounded-[24px] border border-[#EBEBEB] p-6 shadow-[0_10px_30px_rgba(0,0,0,0.05)] text-left">
              <div className="flex items-center gap-3 border-b border-[#F5F5F5] pb-4.5 mb-5">
                <div className="w-8 h-8 rounded-full bg-[#6D5DF6] text-white flex items-center justify-center">
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                  </svg>
                </div>
                <h3 className="text-[15.5px] font-bold text-gray-800">
                  Your Details <span className="text-[#9CA3AF] font-bold text-[13.5px] ml-1">(Auto-filled)</span>
                </h3>
              </div>

              {/* Styled Display Box / Editable Fields */}
              {useMyDetails ? (
                <div className="border border-[#ECECEC] rounded-[20px] p-5.5 bg-white">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="flex flex-col text-left">
                      <span className="text-[11.5px] font-extrabold text-[#6B7280] uppercase tracking-wider">Name</span>
                      <span className="text-[14.5px] font-bold text-gray-800 mt-1.5">{studentName || 'Not Set'}</span>
                    </div>
                    <div className="flex flex-col text-left">
                      <span className="text-[11.5px] font-extrabold text-[#6B7280] uppercase tracking-wider">Reg. No.</span>
                      <span className="text-[14.5px] font-bold text-gray-800 mt-1.5">{registrationNumber || 'Not Set'}</span>
                    </div>
                    <div className="flex flex-col text-left">
                      <span className="text-[11.5px] font-extrabold text-[#6B7280] uppercase tracking-wider">Phone</span>
                      <span className="text-[14.5px] font-bold text-gray-800 mt-1.5">{contactNumber || 'Not Set'}</span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <label className="text-[11px] font-extrabold text-[#9CA3AF] uppercase block mb-1">Student Name</label>
                    <input 
                      type="text" 
                      value={studentName}
                      onChange={(e) => setStudentName(e.target.value)}
                      className="w-full h-11 px-4 text-[13px] border border-[#EBEBEB] rounded-xl focus:border-[#6D5DF6] focus:outline-none bg-white font-semibold"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-extrabold text-[#9CA3AF] uppercase block mb-1">Reg. No.</label>
                    <input 
                      type="text" 
                      value={registrationNumber}
                      onChange={(e) => setRegistrationNumber(e.target.value)}
                      className="w-full h-11 px-4 text-[13px] border border-[#EBEBEB] rounded-xl focus:border-[#6D5DF6] focus:outline-none bg-white font-semibold"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-extrabold text-[#9CA3AF] uppercase block mb-1">Phone</label>
                    <input 
                      type="text" 
                      value={contactNumber}
                      onChange={(e) => setContactNumber(e.target.value)}
                      className="w-full h-11 px-4 text-[13px] border border-[#EBEBEB] rounded-xl focus:border-[#6D5DF6] focus:outline-none bg-white font-semibold"
                    />
                  </div>
                </div>
              )}

              {/* Toggles */}
              <div className="flex flex-wrap items-center gap-6 mt-5 border-t border-[#F5F5F5] pt-4.5">
                <label className="flex items-center gap-2 cursor-pointer text-[13.5px] font-extrabold">
                  <input 
                    type="checkbox" 
                    checked={useMyDetails} 
                    onChange={(e) => handleUseMyDetails(e.target.checked)}
                    className="w-4.5 h-4.5 rounded text-[#6D5DF6] focus:ring-[#6D5DF6] border-gray-300"
                  />
                  Use my details
                </label>
                <label className="flex items-center gap-2 cursor-pointer text-[13.5px] font-extrabold">
                  <input 
                    type="checkbox" 
                    checked={deliverToAnother} 
                    onChange={(e) => handleDeliverToAnother(e.target.checked)}
                    className="w-4.5 h-4.5 rounded text-[#6D5DF6] focus:ring-[#6D5DF6] border-gray-300"
                  />
                  Deliver to another student
                </label>
              </div>
            </div>

            {/* ── SECTION: DELIVERY DETAILS ── */}
            <div className="bg-white rounded-[24px] border border-[#EBEBEB] p-6 shadow-[0_10px_30px_rgba(0,0,0,0.05)] text-left">
              <div className="flex items-center gap-3 border-b border-[#F5F5F5] pb-4.5 mb-5">
                <div className="w-8 h-8 rounded-full bg-[#6D5DF6] text-white flex items-center justify-center">
                  <svg className="w-4.5 h-4.5 stroke-[2.2] text-white fill-none" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25s-7.5-4.108-7.5-11.25a7.5 7.5 0 1115 0z" />
                  </svg>
                </div>
                <h3 className="text-[15.5px] font-bold text-gray-800">Delivery Details</h3>
              </div>

              <div className="flex flex-col gap-6">
                {/* Row 1: Dept, Section */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="text-[11px] font-extrabold text-[#9CA3AF] uppercase block mb-1">Department</label>
                    <input 
                      type="text" 
                      value={department}
                      onChange={(e) => setDepartment(e.target.value)}
                      placeholder="e.g. CSE, MECH, ECE"
                      required
                      className="w-full h-11 px-4 text-[13px] border border-[#EBEBEB] rounded-xl focus:border-[#6D5DF6] focus:outline-none font-semibold bg-white"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-extrabold text-[#9CA3AF] uppercase block mb-1">Section</label>
                    <input 
                      type="text" 
                      value={section}
                      onChange={(e) => setSection(e.target.value)}
                      placeholder="e.g. CSE-1, AI-2, ECE-1"
                      required
                      className="w-full h-11 px-4 text-[13px] border border-[#EBEBEB] rounded-xl focus:border-[#6D5DF6] focus:outline-none font-semibold bg-white"
                    />
                  </div>
                </div>

                {/* Row 2: Date */}
                <div className="grid grid-cols-1 gap-6">
                  <div>
                    <label className="text-[11px] font-extrabold text-[#9CA3AF] uppercase block mb-1">Delivery Date</label>
                    <input 
                      type="date" 
                      value={deliveryDate}
                      onChange={handleDateChange}
                      min={todayDateString}
                      required
                      className="w-full h-11 px-4 text-[13px] border border-[#EBEBEB] rounded-xl focus:border-[#6D5DF6] focus:outline-none font-semibold bg-white cursor-pointer"
                    />
                  </div>
                </div>
              </div>

              {/* Warning Block */}
              {dateError && (
                <div className="bg-rose-50 border border-rose-100 rounded-2xl p-4.5 flex items-start gap-3 mt-6">
                  <AlertTriangle className="w-5.5 h-5.5 text-rose-500 shrink-0 mt-0.5" />
                  <div>
                    <h5 className="text-[13px] font-bold text-rose-700">Selected date must be at least 2 days away. Earliest available date is {earliestAllowedDate}.</h5>
                    <p className="text-[12px] text-rose-600 mt-0.5 leading-normal">
                      Please contact <span className="font-extrabold underline text-rose-800">9391461855</span> for urgent printing.
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* ── SECTION: UPLOAD PDF FILES ── */}
            <div className="bg-white rounded-[24px] border border-[#EBEBEB] p-6 shadow-[0_10px_30px_rgba(0,0,0,0.05)] text-left">
              <div className="flex items-center gap-3 border-b border-[#F5F5F5] pb-4.5 mb-5">
                <div className="w-8 h-8 rounded-full bg-[#6D5DF6] text-white flex items-center justify-center">
                  <svg className="w-4.5 h-4.5 stroke-[2.2] text-white fill-none" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 16.5V9.75m0 0l3 3m-3-3l-3 3M6.75 19.5a4.5 4.5 0 01-1.41-8.775 5.25 5.25 0 0110.233-2.33 3 3 0 013.758 3.848A3.752 3.752 0 0118 19.5H6.75z" />
                  </svg>
                </div>
                <h3 className="text-[15.5px] font-bold text-gray-800">Upload Your PDFs</h3>
              </div>

              <div 
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-[#6D5DF6]/30 hover:border-[#6D5DF6] rounded-[20px] p-8 text-center bg-[#FAF9FF] relative hover:bg-[#F3EFFF] transition-all group cursor-pointer"
              >
                <input 
                  type="file" 
                  ref={fileInputRef}
                  accept=".pdf" 
                  multiple
                  onChange={handleFileChange}
                  className="hidden"
                />
                <UploadCloud className="w-12 h-12 text-[#6D5DF6] mx-auto mb-3 transition-transform group-hover:-translate-y-1" />
                <p className="text-[14px] font-semibold text-gray-800">
                  Drag & drop PDF files here
                </p>
                <p className="text-[12px] text-[#6B7280] mt-1">or <span className="text-[#6D5DF6] font-bold hover:underline">Browse Files</span></p>
                <p className="text-[10px] text-[#9CA3AF] mt-2 font-semibold">You can upload multiple PDF files.</p>
              </div>

              {/* Uploaded Files Cards Stack */}
              <div className="mt-6 space-y-5">
                {files.map((fileItem) => (
                  <div key={fileItem.id} className="border border-[#EBEBEB] rounded-[24px] p-5.5 bg-white flex flex-col gap-5 shadow-sm relative text-left">
                    
                    {/* Header: file details */}
                    <div className="flex items-center justify-between border-b border-[#F5F5F5] pb-4 gap-3">
                      <div className="flex items-center gap-3.5 flex-1 min-w-0">
                        <div className="w-11 h-11 bg-rose-50 border border-rose-100 rounded-xl flex items-center justify-center text-rose-500 flex-shrink-0">
                          <FileText className="w-6.5 h-6.5" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="text-[14.5px] font-bold text-gray-800 truncate">
                            {fileItem.fileName}
                          </h4>
                          <div className="flex items-center gap-1.5 mt-1">
                            <span className="text-[11.5px] text-[#6B7280] font-bold">Pages:</span>
                            <input 
                              type="number"
                              min="1"
                              value={fileItem.pages}
                              onChange={(e) => updateFileSpec(fileItem.id, 'pages', Math.max(1, parseInt(e.target.value) || 1))}
                              className="w-12 h-5.5 px-1 text-[11px] border border-[#EBEBEB] rounded-lg focus:border-[#6D5DF6] focus:outline-none font-bold text-center bg-gray-50 text-gray-700"
                            />
                            {fileItem.uploading && (
                              <span className="text-[11.5px] text-[#6D5DF6] font-bold ml-1.5 animate-pulse">
                                • Uploading...
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      <button 
                        onClick={() => removeFile(fileItem.id)}
                        className="w-8 h-8 rounded-lg flex items-center justify-center text-rose-500 hover:bg-rose-50 transition-colors flex-shrink-0"
                      >
                        <Trash2 className="w-4.5 h-4.5" />
                      </button>
                    </div>

                    {/* Stepper copies counter */}
                    <div className="flex items-center gap-4">
                      <span className="text-[13.5px] font-extrabold text-gray-700">Copies (Sets)</span>
                      <div className="flex items-center border border-[#EBEBEB] rounded-xl bg-white p-1">
                        <button 
                          type="button" 
                          onClick={() => updateFileSpec(fileItem.id, 'sets', Math.max(1, fileItem.sets - 1))}
                          className="w-8 h-8 flex items-center justify-center text-[#6B7280] hover:text-[#6D5DF6]"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span className="w-10 text-center text-[13.5px] font-bold text-gray-800">
                          {fileItem.sets}
                        </span>
                        <button 
                          type="button" 
                          onClick={() => updateFileSpec(fileItem.id, 'sets', fileItem.sets + 1)}
                          className="w-8 h-8 flex items-center justify-center text-[#6B7280] hover:text-[#6D5DF6]"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Layout option cards */}
                    <div>
                      <span className="text-[11px] font-extrabold text-[#9CA3AF] uppercase block mb-2.5 tracking-wider">Layout</span>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        {[
                          { key: 'single-side', title: 'Single-sided', price: '₹0.00' },
                          { key: 'both-side', title: 'Double-sided', price: '₹0.00' },
                          { key: 'four-pages', title: '1/4 Layout (4/pg)', price: '₹0.00' }
                        ].map(item => (
                          <div 
                            key={item.key}
                            onClick={() => updateFileSpec(fileItem.id, 'layout', item.key)}
                            className={`border rounded-xl p-3.5 flex items-center justify-between cursor-pointer transition-all ${
                              fileItem.layout === item.key 
                                ? 'border-[#6D5DF6] bg-[#6D5DF6]/5' 
                                : 'border-[#EBEBEB] bg-white hover:bg-gray-50'
                            }`}
                          >
                            <div className="flex items-center gap-2.5">
                              <div className={`w-4.5 h-4.5 rounded-full border flex items-center justify-center ${
                                fileItem.layout === item.key ? 'border-[#6D5DF6]' : 'border-gray-300'
                              }`}>
                                {fileItem.layout === item.key && <div className="w-2.5 h-2.5 bg-[#6D5DF6] rounded-full" />}
                              </div>
                              <span className="text-[12.5px] font-bold text-gray-800">{item.title}</span>
                            </div>
                            <span className="text-[10.5px] font-bold text-[#9CA3AF]">{item.price}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Ink / Color options */}
                    <div>
                      <span className="text-[11px] font-extrabold text-[#9CA3AF] uppercase block mb-2.5 tracking-wider">Ink / Color</span>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {[
                          { key: 'bw', title: 'Black & White', desc: '₹1.30 / page' },
                          { key: 'color', title: 'Color', desc: '₹3.50 / page' }
                        ].map(item => (
                          <div 
                            key={item.key}
                            onClick={() => updateFileSpec(fileItem.id, 'colorType', item.key)}
                            className={`border rounded-xl p-3.5 flex items-center justify-between cursor-pointer transition-all ${
                              fileItem.colorType === item.key 
                                ? 'border-[#6D5DF6] bg-[#6D5DF6]/5' 
                                : 'border-[#EBEBEB] bg-white hover:bg-gray-50'
                            }`}
                          >
                            <div className="flex items-center gap-2.5">
                              <div className={`w-4.5 h-4.5 rounded-full border flex items-center justify-center ${
                                fileItem.colorType === item.key ? 'border-[#6D5DF6]' : 'border-gray-300'
                              }`}>
                                {fileItem.colorType === item.key && <div className="w-2.5 h-2.5 bg-[#6D5DF6] rounded-full" />}
                              </div>
                              <span className="text-[12.5px] font-bold text-gray-800">{item.title}</span>
                            </div>
                            <span className="text-[11px] font-bold text-[#9CA3AF]">{item.desc}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Binding Options */}
                    <div>
                      <span className="text-[11px] font-extrabold text-[#9CA3AF] uppercase block mb-2.5 tracking-wider">Binding</span>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {[
                          { key: 'none', title: 'None', price: '₹0.00' },
                          { key: 'spiral', title: 'Spiral Binding', price: '₹30.00' }
                        ].map(item => (
                          <div 
                            key={item.key}
                            onClick={() => updateFileSpec(fileItem.id, 'binding', item.key)}
                            className={`border rounded-xl p-3.5 flex items-center justify-between cursor-pointer transition-all ${
                              fileItem.binding === item.key 
                                ? 'border-[#6D5DF6] bg-[#6D5DF6]/5' 
                                : 'border-[#EBEBEB] bg-white hover:bg-gray-50'
                            }`}
                          >
                            <div className="flex items-center gap-2.5">
                              <div className={`w-4.5 h-4.5 rounded-full border flex items-center justify-center ${
                                fileItem.binding === item.key ? 'border-[#6D5DF6]' : 'border-gray-300'
                              }`}>
                                {fileItem.binding === item.key && <div className="w-2.5 h-2.5 bg-[#6D5DF6] rounded-full" />}
                              </div>
                              <span className="text-[12.5px] font-bold text-gray-800">{item.title}</span>
                            </div>
                            <span className="text-[11px] font-bold text-[#9CA3AF]">{item.price}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Specific instruction box */}
                    <div className="mt-1">
                      <label className="text-[12.5px] font-bold text-gray-800 uppercase block mb-1.5">
                        Specific Instructions <span className="text-rose-500 font-extrabold">*</span>
                      </label>
                      <textarea 
                        rows={2}
                        value={fileItem.instructions}
                        onChange={(e) => updateFileSpec(fileItem.id, 'instructions', e.target.value)}
                        placeholder="Describe how you want your document to be printed..."
                        className="w-full py-2 px-3.5 text-[12.5px] border border-[#EBEBEB] bg-white rounded-xl focus:border-[#6D5DF6] focus:outline-none font-semibold resize-none leading-relaxed"
                      />
                    </div>

                    {/* Live card subtotal */}
                    <div className="flex justify-end items-center mt-2.5 pt-3 border-t border-[#F5F5F5]">
                      <span className="text-[13px] text-[#6B7280] font-semibold">Subtotal:</span>
                      <span className="text-[18.5px] font-black text-[#6D5DF6] ml-2">
                        ₹{calculateFileSubtotal(fileItem).toFixed(2)}
                      </span>
                    </div>

                  </div>
                ))}
              </div>

              {/* Add more button */}
              <button 
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="w-full mt-5 h-12 border border-[#6D5DF6] text-[#6D5DF6] hover:bg-[#6D5DF6]/5 font-bold text-[13.5px] rounded-xl flex items-center justify-center gap-2 transition-all active:scale-[0.99] bg-white"
              >
                <Plus className="w-4.5 h-4.5" /> Add More PDF Files
              </button>
            </div>

            {/* ── BOTTOM SECTIONS GRID ── */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start text-left">
              
              {/* Order Summary Receipt */}
              <div className="bg-white rounded-[24px] border border-[#EBEBEB] p-6 shadow-[0_10px_30px_rgba(0,0,0,0.05)]">
                <div className="flex items-center gap-2 border-b border-[#F5F5F5] pb-4 mb-4">
                  <FileText className="w-5 h-5 text-[#6D5DF6]" />
                  <h3 className="text-[15.5px] font-bold text-gray-800">Order Summary</h3>
                </div>
                
                <div className="flex flex-col gap-3 text-[13.5px] font-semibold text-[#6B7280]">
                  <div className="flex justify-between items-center">
                    <span>Total Files</span>
                    <span className="text-gray-700 font-bold">{totalFiles}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Total Pages</span>
                    <span className="text-gray-700 font-bold">{totalPages}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Total Sets</span>
                    <span className="text-gray-700 font-bold">{totalSets}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Subtotal</span>
                    <span className="text-gray-700 font-bold">₹{subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Delivery Charge</span>
                    <span className="text-emerald-600 font-black">FREE</span>
                  </div>

                  <div className="border-t border-[#F5F5F5] pt-4 mt-2 flex justify-between items-center text-[15px] font-bold">
                    <span className="text-gray-700">Total Payable</span>
                    <span className="text-[#6D5DF6] text-[20px]">₹{totalPayable.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              {/* Payment Checkout Panel */}
              <div className="bg-white rounded-[24px] border border-[#EBEBEB] p-6 shadow-[0_10px_30px_rgba(0,0,0,0.05)] flex flex-col gap-4">
                <div className="flex items-center justify-between border-b border-[#F5F5F5] pb-4">
                  <div className="flex items-center gap-2">
                    <Lock className="w-4.5 h-4.5 text-[#6D5DF6]" />
                    <h3 className="text-[15.5px] font-bold text-gray-800">Payment</h3>
                  </div>
                  <div className="flex items-center gap-1 bg-[#EEF9F2] text-emerald-600 font-extrabold text-[10px] uppercase px-2.5 py-0.5 rounded-full border border-emerald-100">
                    <ShieldCheck className="w-3.5 h-3.5 fill-emerald-600 stroke-white" />
                    Secure
                  </div>
                </div>

                <button 
                  type="button"
                  onClick={handleProceedToPayment}
                  disabled={files.length === 0 || dateError || files.some(f => f.uploading)}
                  className="w-full h-12 bg-[#6D5DF6] hover:bg-[#5C4EE5] disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed text-white font-bold text-[14px] rounded-xl flex items-center justify-center gap-2 transition-all active:scale-[0.98] shadow-md shadow-[#6D5DF6]/15"
                >
                  <Lock className="w-4 h-4" /> Proceed to Payment
                </button>

                <p className="text-[12px] text-[#9CA3AF] text-center font-bold">
                  You will be able to review & pay in the next step.
                </p>

                {dateError && (
                  <div className="bg-amber-50 border border-amber-100 rounded-xl p-3.5 flex items-start gap-2.5 mt-2">
                    <Info className="w-4.5 h-4.5 text-amber-500 shrink-0 mt-0.5" />
                    <p className="text-[11.5px] text-amber-700 leading-normal font-semibold">
                      You won't be able to complete the order if the delivery date is less than 2 days away. Earliest available date is {earliestAllowedDate}.
                    </p>
                  </div>
                )}
              </div>

            </div>

          </div>
        )}

      </main>

      {/* ── PAYMENT MODAL ── */}
      {isPaymentModalOpen && (
        <div className="fixed inset-0 z-50 bg-[#0F172A]/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#F8FAFC] rounded-[24px] max-w-[420px] w-full p-7 shadow-[0_20px_60px_rgba(15,23,42,0.12)] relative border border-[#E5E7EB] animate-scaleIn text-left max-h-[92vh] overflow-y-auto scrollbar-none flex flex-col gap-6">
            
            {/* Header */}
            <div className="text-center">
              <h3 className="text-[32px] font-bold text-[#111827] tracking-tight leading-none">
                Verify Payment
              </h3>
              <p className="text-[14px] text-[#6B7280] font-medium mt-1.5">
                Scan QR • Verify • Print
              </p>
            </div>

            {/* QR Section */}
            <div className="flex flex-col items-center gap-3">
              <div className="w-[200px] h-[200px] bg-white border border-[#C7B8FF] rounded-[20px] flex items-center justify-center p-4.5 shadow-[0_8px_24px_rgba(15,23,42,0.05)]">
                <img 
                  src="/images/payment_qr.jpg" 
                  alt="Payment QR Code" 
                  className="w-full h-full object-contain rounded-xl"
                />
              </div>
              <div className="flex items-center gap-1.5 text-[#6B7280]">
                <ShieldCheck className="w-4.5 h-4.5 text-[#6D5DF6]" />
                <span className="text-[14px] font-semibold">Scan to pay with any UPI app</span>
              </div>
            </div>

            {/* PhonePe Details Card */}
            <div className="bg-white border border-[#C7B8FF] rounded-[18px] p-4 flex items-center justify-between shadow-[0_8px_24px_rgba(15,23,42,0.05)]">
              <div className="flex flex-col text-left">
                <span className="text-[14px] font-medium text-[#6B7280]">PhonePe Number</span>
                <div className="flex items-baseline gap-1.5 mt-0.5">
                  <span className="text-[22px] font-extrabold text-[#6D5DF6] tracking-wide">6302085125</span>
                  <span className="text-[14px] font-semibold text-[#6B7280]">(praneeth)</span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  navigator.clipboard.writeText("6302085125");
                  showToast("PhonePe Number copied to clipboard!", "success");
                }}
                className="w-11 h-11 bg-white border border-[#C7B8FF] text-[#6D5DF6] hover:bg-[#FAF9FF] active:scale-[0.95] rounded-xl flex items-center justify-center transition-all shadow-sm"
                title="Copy PhonePe Number"
              >
                <Copy className="w-5 h-5" />
              </button>
            </div>

            {/* Reference Card */}
            <div className="bg-[#FAF9FF] border border-[#C7B8FF] rounded-[18px] p-4 flex items-center justify-between shadow-[0_8px_24px_rgba(15,23,42,0.05)]">
              <div className="flex flex-col text-left">
                <span className="text-[14px] font-medium text-[#6B7280]">Reference / Payment Code</span>
                <span className="text-[28px] font-extrabold text-[#6D5DF6] tracking-wider mt-1 block">
                  {upiRefCode}
                </span>
                <p className="text-[12.5px] text-[#6B7280] leading-normal mt-1.5 font-medium">
                  Enter this reference in the notes while making payment
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  navigator.clipboard.writeText(upiRefCode);
                  showToast("Payment Reference Code copied to clipboard!", "success");
                }}
                className="w-11 h-11 bg-white border border-[#C7B8FF] text-[#6D5DF6] hover:bg-[#FAF9FF] active:scale-[0.95] rounded-xl flex items-center justify-center transition-all shadow-sm shrink-0 ml-3"
                title="Copy Reference Code"
              >
                <Copy className="w-5 h-5" />
              </button>
            </div>

            {/* Upload Section */}
            <div className="flex flex-col gap-2.5">
              <label className="text-[16px] font-bold text-[#111827] block">
                Upload Payment Screenshot
              </label>
              
              {!paymentScreenshotPreview ? (
                <div className="border-2 border-dashed border-[#C7B8FF] hover:border-[#6D5DF6] rounded-[20px] p-6 text-center bg-[#FAF9FF] relative hover:bg-[#F3EFFF] transition-all cursor-pointer group">
                  <input 
                    type="file" 
                    accept="image/*" 
                    onChange={handleScreenshotChange}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  <UploadCloud className="w-10 h-10 text-[#6D5DF6] mx-auto mb-2 transition-transform group-hover:-translate-y-0.5" />
                  <p className="text-[14px] font-bold text-gray-800">Upload receipt screenshot</p>
                  <p className="text-[11px] text-[#6B7280] mt-0.5">JPEG, PNG, WebP image formats</p>
                </div>
              ) : (
                <div className="border border-[#C7B8FF] rounded-[20px] p-3 bg-white flex flex-col gap-3 relative shadow-[0_8px_24px_rgba(15,23,42,0.05)]">
                  <div className="aspect-[4/3] rounded-xl overflow-hidden bg-gray-100 border border-[#E5E7EB] relative flex items-center justify-center">
                    <img 
                      src={paymentScreenshotPreview} 
                      alt="Receipt preview" 
                      className="w-full h-full object-contain" 
                    />
                    {/* Green Tick Badge in bottom-right */}
                    <div className="absolute bottom-2.5 right-2.5 w-6 h-6 bg-[#22C55E] rounded-full flex items-center justify-center shadow-md">
                      <Check className="w-3.5 h-3.5 text-white stroke-[3.5]" />
                    </div>
                  </div>
                  <button 
                    type="button" 
                    onClick={() => {
                      setPaymentScreenshot(null);
                      setPaymentScreenshotPreview('');
                    }}
                    className="w-full h-9.5 bg-rose-50 hover:bg-rose-100 text-rose-600 font-bold text-[12px] rounded-xl transition-colors active:scale-[0.98]"
                  >
                    Remove Receipt and Re-upload
                  </button>
                </div>
              )}
            </div>

            {/* Validation Alert */}
            <div className="bg-[#FEF2F2] border border-[#FEE2E2] rounded-[16px] p-3.5 flex items-center justify-center gap-2.5 text-[#EF4444] shadow-sm">
              <ShieldAlert className="w-5 h-5 text-[#EF4444] shrink-0" />
              <span className="text-[13px] font-bold tracking-wide">
                Ensure the screenshot is clear and valid
              </span>
            </div>

            {/* Bottom Actions Buttons */}
            <div className="flex gap-3 mt-1">
              <button 
                type="button"
                onClick={() => setIsPaymentModalOpen(false)}
                className="flex-1 h-[54px] bg-white border border-[#E5E7EB] text-[#111827] hover:bg-[#F9FAFB] active:scale-[0.98] font-bold text-[14px] rounded-[16px] transition-all shadow-sm"
              >
                Cancel
              </button>
              
              <button 
                type="button"
                onClick={handleVerifySubmit}
                disabled={submittingOrder || !paymentScreenshot}
                className="flex-1 h-[54px] bg-[#6D5DF6] hover:bg-[#5C4EE5] disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed text-white font-bold text-[14px] rounded-[16px] flex items-center justify-center gap-2 transition-all active:scale-[0.98] shadow-sm"
              >
                {submittingOrder ? (
                  'Submitting...'
                ) : (
                  <>
                    <ShieldCheck className="w-5 h-5 stroke-[2.2]" />
                    Verify Payment
                  </>
                )}
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};

export default PrintStudio;
