import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  FileText, UploadCloud, Trash2, CheckCircle2, ShieldCheck, 
  ShieldAlert, AlertTriangle, Headset, Copy, Check, Lock, Info, Plus, Minus, ArrowLeft, XCircle
} from 'lucide-react';
import api from '../api/axios';
import './PrintStudio.css';

export const PrintStudio = () => {
  const { user, isVerified, showToast } = useAuth();
  const navigate = useNavigate();

  const isViit = user?.college === "Vignan's Institute of Information Technology (VIIT)";

  // Auto-filled details from User Profile
  const [useMyDetails, setUseMyDetails] = useState(true);
  const [deliverToAnother, setDeliverToAnother] = useState(false);

  const [studentName, setStudentName] = useState(user?.fullName || '');
  const [registrationNumber, setRegistrationNumber] = useState(user?.registrationNumber || '');
  const [contactNumber, setContactNumber] = useState(user?.whatsappNumber || '');
  const [department, setDepartment] = useState(user?.department || '');
  const [section, setSection] = useState('');

  // Delivery Date logic (min 2 days requirement)
  const getEarliestAllowedDate = () => {
    const d = new Date();
    d.setDate(d.getDate() + 2);
    return d;
  };

  const formatDateForInput = (d) => {
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const earliestDateObj = getEarliestAllowedDate();
  const earliestAllowedDate = formatDateForInput(earliestDateObj);
  const todayDateString = formatDateForInput(new Date());

  const [deliveryDate, setDeliveryDate] = useState(earliestAllowedDate);
  const [dateError, setDateError] = useState(false);

  // Files State
  const [files, setFiles] = useState([]);
  const fileInputRef = useRef(null);

  // Payment Modal State
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [upiRefCode, setUpiRefCode] = useState('');
  const [paymentScreenshot, setPaymentScreenshot] = useState(null);
  const [paymentScreenshotPreview, setPaymentScreenshotPreview] = useState('');
  const [submittingOrder, setSubmittingOrder] = useState(false);

  useEffect(() => {
    if (user && useMyDetails) {
      setStudentName(user.fullName || '');
      setRegistrationNumber(user.registrationNumber || '');
      setContactNumber(user.whatsappNumber || '');
      setDepartment(user.department || '');
    }
  }, [user, useMyDetails]);

  const handleUseMyDetails = (checked) => {
    setUseMyDetails(checked);
    if (checked) {
      setDeliverToAnother(false);
      setStudentName(user?.fullName || '');
      setRegistrationNumber(user?.registrationNumber || '');
      setContactNumber(user?.whatsappNumber || '');
      setDepartment(user?.department || '');
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

  const handleDateChange = (e) => {
    const val = e.target.value;
    setDeliveryDate(val);

    if (val < earliestAllowedDate) {
      setDateError(true);
    } else {
      setDateError(false);
    }
  };

  // Multiple File Selection & PDF Page Extraction
  const handleFileChange = async (e) => {
    const selectedFiles = Array.from(e.target.files);
    if (!selectedFiles.length) return;

    for (const file of selectedFiles) {
      if (file.type !== 'application/pdf') {
        showToast(`Skipped ${file.name}: Only PDF files are allowed.`, 'error');
        continue;
      }

      const tempId = Date.now() + Math.random().toString(36).substring(2, 9);
      
      const newFileItem = {
        id: tempId,
        rawFile: file,
        fileName: file.name,
        pages: 1,
        sets: 1,
        layout: 'single-side',
        colorType: 'bw',
        binding: 'none',
        instructions: '',
        fileUrl: '',
        publicId: '',
        uploading: true,
        uploadProgress: 0
      };

      setFiles((prev) => [...prev, newFileItem]);

      // Calculate PDF Pages locally using pdf-lib
      try {
        const arrayBuffer = await file.arrayBuffer();
        const { PDFDocument } = await import('pdf-lib');
        const pdfDoc = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true });
        const count = pdfDoc.getPageCount();
        
        setFiles((prev) => prev.map((f) => f.id === tempId ? { ...f, pages: count } : f));
      } catch (err) {
        console.warn('Local PDF page count estimation failed, default to 1:', err);
      }

      // Upload Cloudinary asynchronously
      uploadPdfToCloudinary(file, tempId);
    }

    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const uploadPdfToCloudinary = async (file, tempId) => {
    try {
      const formData = new FormData();
      formData.append('document', file);

      const { data } = await api.post('/print-orders/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (progressEvent) => {
          const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          setFiles((prev) => prev.map((f) => f.id === tempId ? { ...f, uploadProgress: percent } : f));
        }
      });

      setFiles((prev) => prev.map((f) => 
        f.id === tempId ? { 
          ...f, 
          fileUrl: data.fileUrl, 
          publicId: data.publicId, 
          uploading: false 
        } : f
      ));
    } catch (err) {
      console.error('PDF Cloudinary upload error:', err);
      showToast(`Failed to upload ${file.name}. Please try again.`, 'error');
      setFiles((prev) => prev.filter((f) => f.id !== tempId));
    }
  };

  const updateFileSpec = (id, key, val) => {
    setFiles((prev) => prev.map((f) => f.id === id ? { ...f, [key]: val } : f));
  };

  const removeFile = (id) => {
    setFiles((prev) => prev.filter((f) => f.id !== id));
  };

  // Pricing calculations
  const calculateFileSubtotal = (file) => {
    const totalPages = file.pages * file.sets;
    const perPagePrice = file.colorType === 'color' ? 3.50 : 1.30;
    const printCost = totalPages * perPagePrice;
    const bindingCost = file.binding === 'spiral' ? 30.00 * file.sets : 0;
    return printCost + bindingCost;
  };

  const totalFiles = files.length;
  const totalPages = files.reduce((acc, f) => acc + (f.pages * f.sets), 0);
  const totalSheets = files.reduce((acc, f) => {
    const effectivePages = f.layout === 'four-pages' ? Math.ceil(f.pages / 4) : f.pages;
    const sheetsPerSet = (f.layout === 'both-side' || f.layout === 'four-pages') ? Math.ceil(effectivePages / 2) : effectivePages;
    return acc + (sheetsPerSet * f.sets);
  }, 0);

  const totalSets = files.reduce((acc, f) => acc + f.sets, 0);
  const subtotal = files.reduce((acc, f) => acc + calculateFileSubtotal(f), 0);
  const totalPayable = subtotal;

  const generateUpiReferenceCode = () => {
    const dateStr = new Date().toISOString().slice(2, 10).replace(/-/g, '');
    const randDigits = Math.floor(1000 + Math.random() * 9000);
    return `EM-PR-${dateStr}-${randDigits}`;
  };

  const handleProceedToPayment = () => {
    if (!studentName || !registrationNumber || !contactNumber || !department || !section) {
      showToast('Please fill in all student & delivery details.', 'error');
      return;
    }

    if (!files.length) {
      showToast('Please upload at least one PDF file.', 'error');
      return;
    }

    if (files.some(f => f.uploading)) {
      showToast('Please wait for all PDF files to finish uploading.', 'info');
      return;
    }

    if (dateError) {
      showToast(`Selected date must be at least 2 days away. Earliest available date is ${earliestAllowedDate}.`, 'error');
      return;
    }

    setUpiRefCode(generateUpiReferenceCode());
    setIsPaymentModalOpen(true);
  };

  const handleScreenshotChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setPaymentScreenshot(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPaymentScreenshotPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleVerifySubmit = async () => {
    if (!paymentScreenshot) {
      showToast('Please upload a valid payment receipt screenshot.', 'error');
      return;
    }

    setSubmittingOrder(true);
    try {
      const formData = new FormData();
      formData.append('studentName', studentName);
      formData.append('registrationNumber', registrationNumber);
      formData.append('contactNumber', contactNumber);
      formData.append('department', department);
      formData.append('section', section);
      formData.append('deliveryDate', deliveryDate);
      formData.append('paymentRefCode', upiRefCode);
      formData.append('totalPayable', totalPayable);
      
      formData.append('documents', JSON.stringify(files.map(f => ({
        fileUrl: f.fileUrl,
        publicId: f.publicId,
        fileName: f.fileName,
        pages: f.pages,
        sets: f.sets,
        layout: f.layout,
        colorType: f.colorType,
        binding: f.binding,
        instructions: f.instructions,
        subtotal: calculateFileSubtotal(f)
      }))));

      formData.append('paymentScreenshot', paymentScreenshot);

      const { data } = await api.post('/print-orders', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      showToast('Print Order placed successfully!', 'success');
      setIsPaymentModalOpen(false);
      navigate('/orders');
    } catch (err) {
      console.error('Order submission error:', err);
      showToast(err.response?.data?.message || 'Failed to submit order. Please try again.', 'error');
    } finally {
      setSubmittingOrder(false);
    }
  };

  return (
    <div className="print-studio-page">
      
      {/* HEADER */}
      <header className="print-studio-header">
        <div className="print-studio-header-inner">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <button 
              onClick={() => navigate('/vendors')}
              className="profile-icon-btn"
              style={{ border: '1px solid #EBEBEB' }}
            >
              <ArrowLeft style={{ width: '20px', height: '20px', color: '#1f2937', strokeWidth: 2 }} />
            </button>
            <div style={{ textAlign: 'left' }}>
              <h1 style={{ fontSize: '17.5px', fontWeight: 700, color: '#1f2937', margin: 0, lineHeight: 1.2 }}>EM Printf Hub</h1>
              <p style={{ fontSize: '11.5px', color: '#6D5DF6', fontWeight: 700, margin: '2px 0 0 0' }}>Print Studio</p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <a href="tel:9391461855" style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13.5px', fontWeight: 600, color: '#4b5563', textDecoration: 'none' }}>
              <Headset style={{ width: '18px', height: '18px', color: '#6b7280' }} /> Help
            </a>
            
            <a 
              href="https://wa.me/9391461855" 
              target="_blank" 
              rel="noreferrer"
              style={{ display: 'flex', height: '44px', paddingLeft: '1rem', paddingRight: '1rem', borderRadius: '16px', border: '1px solid #EBEBEB', backgroundColor: '#ffffff', color: '#1f2937', alignItems: 'center', gap: '0.75rem', textDecoration: 'none', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}
            >
              <svg style={{ width: '18px', height: '18px', fill: '#10b981' }} viewBox="0 0 24 24">
                <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.514 2.266 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.502-5.724-1.455L0 24zm6.59-4.846c1.6.95 3.197 1.45 4.817 1.45 5.548 0 10.063-4.515 10.066-10.067.002-2.69-1.04-5.218-2.93-7.108C16.66 1.54 14.135.495 11.454.495c-5.553 0-10.07 4.515-10.074 10.069-.001 1.73.454 3.42 1.316 4.921l-.974 3.56 3.652-.958zm13.11-6.177c-.3-.15-1.782-.88-2.057-.98-.275-.1-.475-.15-.675.15-.2.3-.775.98-.95 1.18-.175.2-.35.225-.65.075-.3-.15-1.267-.467-2.414-1.492-.893-.797-1.495-1.78-1.67-2.08-.175-.3-.02-.463.13-.612.135-.133.3-.35.45-.525.15-.175.2-.3.3-.5.1-.2.05-.375-.025-.525-.075-.15-.675-1.625-.925-2.225-.244-.588-.492-.51-.675-.52-.172-.007-.37-.01-.568-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.782-.728 2.032-1.43.25-.702.25-1.303.175-1.43-.075-.127-.275-.202-.575-.352z"/>
              </svg>
              <div style={{ display: 'flex', flexDirection: 'column', textAlign: 'left', lineHeight: 1 }}>
                <span style={{ fontSize: '10px', color: '#6b7280', fontWeight: 600 }}>Contact Us</span>
                <span style={{ fontSize: '13px', color: '#374151', fontWeight: 700, marginTop: '2px' }}>9391461855</span>
              </div>
            </a>
          </div>
        </div>
      </header>

      <main className="print-studio-main">
        
        {/* HERO BANNER */}
        <div style={{ width: '100%' }}>
          <img 
            src="/images/em_print_studio_banner.png" 
            alt="Printf Hub Classroom Delivery Banner" 
            className="print-studio-banner-img"
            onError={(e) => { e.target.style.display = 'none'; }}
          />
        </div>

        {/* ALERT BAR */}
        <div className="print-alert-bar">
          <XCircle style={{ width: '22px', height: '22px', color: '#f43f5e', flexShrink: 0 }} />
          <p className="print-alert-text">
            Outside VIIT? Please contact us on <span style={{ fontWeight: 800, textDecoration: 'underline' }}>9391461855</span> for manual checkout. We will assist you personally!
          </p>
        </div>

        {!isViit ? (
          <div className="print-card" style={{ textAlign: 'center', padding: '2rem' }}>
            <XCircle style={{ width: '56px', height: '56px', color: '#f43f5e', margin: '0 auto 1rem auto' }} />
            <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#1f2937', marginBottom: '0.5rem' }}>VIIT Eligibility Restricted</h2>
            <p style={{ fontSize: '13.5px', color: '#6B7280', maxWidth: '460px', margin: '0 auto 1.5rem auto', lineHeight: 1.6, fontWeight: 600 }}>
              Automated in-classroom delivery is currently limited to Vignan's Institute of Information Technology (VIIT) students.
            </p>
            <a 
              href="tel:9391461855" 
              className="print-pay-btn"
              style={{ width: 'auto', paddingLeft: '1.5rem', paddingRight: '1.5rem', display: 'inline-flex' }}
            >
              Contact Coordinator
            </a>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            
            {/* SECTION: YOUR DETAILS */}
            <div className="print-card">
              <div className="print-card-header">
                <div className="print-card-icon-badge">
                  <svg style={{ width: '16px', height: '16px', fill: 'currentColor' }} viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                  </svg>
                </div>
                <h3 className="print-card-title">
                  Your Details <span style={{ color: '#9CA3AF', fontSize: '13.5px', fontWeight: 700, marginLeft: '4px' }}>(Auto-filled)</span>
                </h3>
              </div>

              {useMyDetails ? (
                <div className="print-details-box">
                  <div className="print-details-row">
                    <div className="print-details-item">
                      <span className="print-details-label">Name:</span>
                      <span className="print-details-val">{studentName || 'Not Set'}</span>
                    </div>
                    <div className="print-divider" />
                    <div className="print-details-item">
                      <span className="print-details-label">Reg:</span>
                      <span className="print-details-val">{registrationNumber || 'Not Set'}</span>
                    </div>
                    <div className="print-divider" />
                    <div className="print-details-item">
                      <span className="print-details-label">Phone:</span>
                      <span className="print-details-val">{contactNumber || 'Not Set'}</span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="print-field-grid cols-3">
                  <div className="print-field-group">
                    <label className="print-field-label">Student Name</label>
                    <input 
                      type="text" 
                      value={studentName}
                      onChange={(e) => setStudentName(e.target.value)}
                      className="print-field-input"
                    />
                  </div>
                  <div className="print-field-group">
                    <label className="print-field-label">Reg. No.</label>
                    <input 
                      type="text" 
                      value={registrationNumber}
                      onChange={(e) => setRegistrationNumber(e.target.value)}
                      className="print-field-input"
                    />
                  </div>
                  <div className="print-field-group">
                    <label className="print-field-label">Phone</label>
                    <input 
                      type="text" 
                      value={contactNumber}
                      onChange={(e) => setContactNumber(e.target.value)}
                      className="print-field-input"
                    />
                  </div>
                </div>
              )}

              <div className="print-checkbox-row">
                <label className="print-checkbox-label">
                  <input 
                    type="checkbox" 
                    checked={useMyDetails} 
                    onChange={(e) => handleUseMyDetails(e.target.checked)}
                    style={{ width: '18px', height: '18px', accentColor: '#6D5DF6' }}
                  />
                  Use my details
                </label>
                <label className="print-checkbox-label">
                  <input 
                    type="checkbox" 
                    checked={deliverToAnother} 
                    onChange={(e) => handleDeliverToAnother(e.target.checked)}
                    style={{ width: '18px', height: '18px', accentColor: '#6D5DF6' }}
                  />
                  Deliver to another student
                </label>
              </div>
            </div>

            {/* SECTION: DELIVERY DETAILS */}
            <div className="print-card">
              <div className="print-card-header">
                <div className="print-card-icon-badge">
                  <svg style={{ width: '18px', height: '18px', stroke: '#ffffff', fill: 'none', strokeWidth: 2.2 }} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25s-7.5-4.108-7.5-11.25a7.5 7.5 0 1115 0z" />
                  </svg>
                </div>
                <h3 className="print-card-title">Delivery Details</h3>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                <div className="print-field-grid cols-2">
                  <div className="print-field-group">
                    <label className="print-field-label">Department</label>
                    <input 
                      type="text" 
                      value={department}
                      onChange={(e) => setDepartment(e.target.value)}
                      placeholder="e.g. CSE, MECH, ECE"
                      required
                      className="print-field-input"
                    />
                  </div>
                  <div className="print-field-group">
                    <label className="print-field-label">Section</label>
                    <input 
                      type="text" 
                      value={section}
                      onChange={(e) => setSection(e.target.value)}
                      placeholder="e.g. CSE-1, AI-2, ECE-1"
                      required
                      className="print-field-input"
                    />
                  </div>
                </div>

                <div className="print-field-grid">
                  <div className="print-field-group">
                    <label className="print-field-label">Delivery Date</label>
                    <input 
                      type="date" 
                      value={deliveryDate}
                      onChange={handleDateChange}
                      min={todayDateString}
                      required
                      className="print-field-input"
                      style={{ cursor: 'pointer' }}
                    />
                  </div>
                </div>
              </div>

              {dateError && (
                <div className="print-alert-bar" style={{ marginTop: '1.5rem' }}>
                  <AlertTriangle style={{ width: '22px', height: '22px', color: '#f43f5e', flexShrink: 0 }} />
                  <div>
                    <h5 style={{ fontSize: '13px', fontWeight: 700, color: '#be123c', margin: 0 }}>Selected date must be at least 2 days away. Earliest available date is {earliestAllowedDate}.</h5>
                    <p style={{ fontSize: '12px', color: '#e11d48', marginTop: '2px', margin: 0 }}>
                      Please contact <span style={{ fontWeight: 800, textDecoration: 'underline' }}>9391461855</span> for urgent printing.
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* SECTION: UPLOAD PDF FILES */}
            <div className="print-card">
              <div className="print-card-header">
                <div className="print-card-icon-badge">
                  <svg style={{ width: '18px', height: '18px', stroke: '#ffffff', fill: 'none', strokeWidth: 2.2 }} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 16.5V9.75m0 0l3 3m-3-3l-3 3M6.75 19.5a4.5 4.5 0 01-1.41-8.775 5.25 5.25 0 0110.233-2.33 3 3 0 013.758 3.848A3.752 3.752 0 0118 19.5H6.75z" />
                  </svg>
                </div>
                <h3 className="print-card-title">Upload Your PDFs</h3>
              </div>

              <div 
                onClick={() => fileInputRef.current?.click()}
                className="print-dropzone"
              >
                <input 
                  type="file" 
                  ref={fileInputRef}
                  accept=".pdf" 
                  multiple
                  onChange={handleFileChange}
                  style={{ display: 'none' }}
                />
                <UploadCloud style={{ width: '48px', height: '48px', color: '#6D5DF6', margin: '0 auto 0.75rem auto' }} />
                <p style={{ fontSize: '14px', fontWeight: 600, color: '#1f2937', margin: 0 }}>
                  Drag & drop PDF files here
                </p>
                <p style={{ fontSize: '12px', color: '#6B7280', marginTop: '4px', margin: 0 }}>or <span style={{ color: '#6D5DF6', fontWeight: 700 }}>Browse Files</span></p>
                <p style={{ fontSize: '10px', color: '#9CA3AF', marginTop: '8px', fontWeight: 600, margin: 0 }}>You can upload multiple PDF files.</p>
              </div>

              {/* Uploaded Files Cards Stack */}
              <div style={{ marginTop: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                {files.map((fileItem) => (
                  <div key={fileItem.id} className="print-file-item">
                    
                    {/* Header */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #F5F5F5', paddingBottom: '1rem', gap: '0.75rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.875rem', flex: 1, minWidth: 0 }}>
                        <div style={{ width: '44px', height: '44px', backgroundColor: '#fff1f2', border: '1px solid #ffe4e6', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#f43f5e', flexShrink: 0 }}>
                          <FileText style={{ width: '26px', height: '26px' }} />
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <h4 style={{ fontSize: '14.5px', fontWeight: 700, color: '#1f2937', margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {fileItem.fileName}
                          </h4>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '4px' }}>
                            <span style={{ fontSize: '11.5px', color: '#6B7280', fontWeight: 700 }}>Pages:</span>
                            <input 
                              type="number"
                              min="1"
                              value={fileItem.pages}
                              onChange={(e) => updateFileSpec(fileItem.id, 'pages', Math.max(1, parseInt(e.target.value) || 1))}
                              style={{ width: '48px', height: '22px', padding: '0 4px', fontSize: '11px', border: '1px solid #EBEBEB', borderRadius: '8px', fontWeight: 700, textAlign: 'center', backgroundColor: '#f9fafb', color: '#374151' }}
                            />
                            {fileItem.uploading && (
                              <span style={{ fontSize: '11.5px', color: '#6D5DF6', fontWeight: 700, marginLeft: '6px' }}>
                                • Uploading... {fileItem.uploadProgress ? `${fileItem.uploadProgress}%` : ''}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      <button 
                        onClick={() => removeFile(fileItem.id)}
                        className="profile-icon-btn"
                        style={{ width: '32px', height: '32px' }}
                      >
                        <Trash2 style={{ width: '18px', height: '18px', color: '#f43f5e' }} />
                      </button>
                    </div>

                    {/* Stepper copies counter */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                      <span style={{ fontSize: '13.5px', fontWeight: 800, color: '#374151' }}>Copies (Sets)</span>
                      <div style={{ display: 'flex', alignItems: 'center', border: '1px solid #EBEBEB', borderRadius: '12px', backgroundColor: '#ffffff', padding: '4px' }}>
                        <button 
                          type="button" 
                          onClick={() => updateFileSpec(fileItem.id, 'sets', Math.max(1, fileItem.sets - 1))}
                          style={{ width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#6B7280', background: 'none', border: 'none', cursor: 'pointer' }}
                        >
                          <Minus style={{ width: '14px', height: '14px' }} />
                        </button>
                        <span style={{ width: '40px', textAlign: 'center', fontSize: '13.5px', fontWeight: 700, color: '#1f2937' }}>
                          {fileItem.sets}
                        </span>
                        <button 
                          type="button" 
                          onClick={() => updateFileSpec(fileItem.id, 'sets', fileItem.sets + 1)}
                          style={{ width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#6B7280', background: 'none', border: 'none', cursor: 'pointer' }}
                        >
                          <Plus style={{ width: '14px', height: '14px' }} />
                        </button>
                      </div>
                    </div>

                    {/* Layout option cards */}
                    <div>
                      <span className="print-field-label">Layout</span>
                      <div className="print-options-grid cols-3">
                        {[
                          { key: 'single-side', title: 'Single-sided', price: '₹0.00' },
                          { key: 'both-side', title: 'Double-sided', price: '₹0.00' },
                          { key: 'four-pages', title: '1/4 Layout (4/pg)', price: '₹0.00' }
                        ].map(item => (
                          <div 
                            key={item.key}
                            onClick={() => updateFileSpec(fileItem.id, 'layout', item.key)}
                            className={`print-option-card ${fileItem.layout === item.key ? 'selected' : ''}`}
                          >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                              <div style={{ width: '18px', height: '18px', borderRadius: '9999px', border: `1px solid ${fileItem.layout === item.key ? '#6D5DF6' : '#d1d5db'}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                {fileItem.layout === item.key && <div style={{ width: '10px', height: '10px', backgroundColor: '#6D5DF6', borderRadius: '9999px' }} />}
                              </div>
                              <span style={{ fontSize: '12.5px', fontWeight: 700, color: '#1f2937' }}>{item.title}</span>
                            </div>
                            <span style={{ fontSize: '10.5px', fontWeight: 700, color: '#9CA3AF' }}>{item.price}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Ink / Color options */}
                    <div>
                      <span className="print-field-label">Ink / Color</span>
                      <div className="print-options-grid cols-2">
                        {[
                          { key: 'bw', title: 'Black & White', desc: '₹1.30 / page' },
                          { key: 'color', title: 'Color', desc: '₹3.50 / page' }
                        ].map(item => (
                          <div 
                            key={item.key}
                            onClick={() => updateFileSpec(fileItem.id, 'colorType', item.key)}
                            className={`print-option-card ${fileItem.colorType === item.key ? 'selected' : ''}`}
                          >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                              <div style={{ width: '18px', height: '18px', borderRadius: '9999px', border: `1px solid ${fileItem.colorType === item.key ? '#6D5DF6' : '#d1d5db'}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                {fileItem.colorType === item.key && <div style={{ width: '10px', height: '10px', backgroundColor: '#6D5DF6', borderRadius: '9999px' }} />}
                              </div>
                              <span style={{ fontSize: '12.5px', fontWeight: 700, color: '#1f2937' }}>{item.title}</span>
                            </div>
                            <span style={{ fontSize: '11px', fontWeight: 700, color: '#9CA3AF' }}>{item.desc}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Binding Options */}
                    <div>
                      <span className="print-field-label">Binding</span>
                      <div className="print-options-grid cols-2">
                        {[
                          { key: 'none', title: 'None', price: '₹0.00' },
                          { key: 'spiral', title: 'Spiral Binding', price: '₹30.00' }
                        ].map(item => (
                          <div 
                            key={item.key}
                            onClick={() => updateFileSpec(fileItem.id, 'binding', item.key)}
                            className={`print-option-card ${fileItem.binding === item.key ? 'selected' : ''}`}
                          >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                              <div style={{ width: '18px', height: '18px', borderRadius: '9999px', border: `1px solid ${fileItem.binding === item.key ? '#6D5DF6' : '#d1d5db'}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                {fileItem.binding === item.key && <div style={{ width: '10px', height: '10px', backgroundColor: '#6D5DF6', borderRadius: '9999px' }} />}
                              </div>
                              <span style={{ fontSize: '12.5px', fontWeight: 700, color: '#1f2937' }}>{item.title}</span>
                            </div>
                            <span style={{ fontSize: '11px', fontWeight: 700, color: '#9CA3AF' }}>{item.price}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Specific instruction box */}
                    <div style={{ marginTop: '4px' }}>
                      <label style={{ fontSize: '12.5px', fontWeight: 700, color: '#1f2937', textTransform: 'uppercase', display: 'block', marginBottom: '6px' }}>
                        Specific Instructions <span style={{ color: '#f43f5e', fontWeight: 800 }}>*</span>
                      </label>
                      <textarea 
                        rows={2}
                        value={fileItem.instructions}
                        onChange={(e) => updateFileSpec(fileItem.id, 'instructions', e.target.value)}
                        placeholder="Describe how you want your document to be printed..."
                        className="print-field-input"
                        style={{ height: 'auto', paddingTop: '8px', paddingBottom: '8px', resize: 'none', lineHeight: 1.5 }}
                      />
                    </div>

                    {/* Live card subtotal */}
                    <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', marginTop: '10px', paddingTop: '12px', borderTop: '1px solid #F5F5F5' }}>
                      <span style={{ fontSize: '13px', color: '#6B7280', fontWeight: 600 }}>Subtotal:</span>
                      <span style={{ fontSize: '18.5px', fontWeight: 900, color: '#6D5DF6', marginLeft: '8px' }}>
                        ₹{calculateFileSubtotal(fileItem).toFixed(2)}
                      </span>
                    </div>

                  </div>
                ))}
              </div>

              <button 
                type="button"
                onClick={() => fileInputRef.current?.click()}
                style={{ width: '100%', marginTop: '1.25rem', height: '48px', border: '1px solid #6D5DF6', color: '#6D5DF6', backgroundColor: '#ffffff', fontWeight: 700, fontSize: '13.5px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', cursor: 'pointer' }}
              >
                <Plus style={{ width: '18px', height: '18px' }} /> Add More PDF Files
              </button>
            </div>

            {/* BOTTOM SECTIONS GRID */}
            <div className="print-bottom-grid">
              
              {/* Order Summary Receipt */}
              <div className="print-card">
                <div className="print-card-header">
                  <FileText style={{ width: '20px', height: '20px', color: '#6D5DF6' }} />
                  <h3 className="print-card-title">Order Summary</h3>
                </div>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div className="print-summary-row">
                    <span>Total Files</span>
                    <span style={{ color: '#374151', fontWeight: 700 }}>{totalFiles}</span>
                  </div>
                  <div className="print-summary-row">
                    <span>Total Pages</span>
                    <span style={{ color: '#374151', fontWeight: 700 }}>{totalPages}</span>
                  </div>
                  <div className="print-summary-row">
                    <span>Total Papers (Sheets)</span>
                    <span style={{ color: '#374151', fontWeight: 700 }}>{totalSheets}</span>
                  </div>
                  <div className="print-summary-row">
                    <span>Total Sets</span>
                    <span style={{ color: '#374151', fontWeight: 700 }}>{totalSets}</span>
                  </div>
                  <div className="print-summary-row">
                    <span>Subtotal</span>
                    <span style={{ color: '#374151', fontWeight: 700 }}>₹{subtotal.toFixed(2)}</span>
                  </div>
                  <div className="print-summary-row">
                    <span>Delivery Charge</span>
                    <span style={{ color: '#059669', fontWeight: 900 }}>FREE</span>
                  </div>

                  <div className="print-summary-total">
                    <span style={{ color: '#374151' }}>Total Payable</span>
                    <span style={{ color: '#6D5DF6', fontSize: '20px' }}>₹{totalPayable.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              {/* Payment Checkout Panel */}
              <div className="print-card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div className="print-card-header">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Lock style={{ width: '18px', height: '18px', color: '#6D5DF6' }} />
                    <h3 className="print-card-title">Payment</h3>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px', backgroundColor: '#EEF9F2', color: '#059669', fontWeight: 800, fontSize: '10px', textTransform: 'uppercase', padding: '2px 10px', borderRadius: '9999px', border: '1px solid #a7f3d0' }}>
                    <ShieldCheck style={{ width: '14px', height: '14px', fill: '#059669', stroke: '#ffffff' }} />
                    Secure
                  </div>
                </div>

                <button 
                  type="button"
                  onClick={handleProceedToPayment}
                  disabled={files.length === 0 || dateError || files.some(f => f.uploading)}
                  className="print-pay-btn"
                >
                  <Lock style={{ width: '16px', height: '16px' }} /> Proceed to Payment
                </button>

                <p style={{ fontSize: '12px', color: '#9CA3AF', textAlign: 'center', fontWeight: 700, margin: 0 }}>
                  You will be able to review & pay in the next step.
                </p>

                {dateError && (
                  <div className="print-alert-bar" style={{ backgroundColor: '#fffbeb', borderColor: '#fde68a', marginTop: '8px' }}>
                    <Info style={{ width: '18px', height: '18px', color: '#d97706', flexShrink: 0 }} />
                    <p style={{ fontSize: '11.5px', color: '#b45309', margin: 0, fontWeight: 600 }}>
                      You won't be able to complete the order if the delivery date is less than 2 days away. Earliest available date is {earliestAllowedDate}.
                    </p>
                  </div>
                )}
              </div>

            </div>

          </div>
        )}

      </main>

      {/* PAYMENT MODAL */}
      {isPaymentModalOpen && (
        <div className="print-modal-overlay">
          <div className="print-modal-card animate-scaleIn">
            
            {/* Header */}
            <div style={{ textAlign: 'center' }}>
              <h3 style={{ fontSize: '28px', fontWeight: 700, color: '#111827', margin: 0 }}>
                Verify Payment
              </h3>
              <p style={{ fontSize: '14px', color: '#6B7280', fontWeight: 500, marginTop: '6px', margin: 0 }}>
                Scan QR • Verify • Print
              </p>
            </div>

            {/* QR Section */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
              <div style={{ width: '200px', height: '200px', backgroundColor: '#ffffff', border: '1px solid #C7B8FF', borderRadius: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '18px', boxShadow: '0 8px 24px rgba(15,23,42,0.05)' }}>
                <img 
                  src="/images/payment_qr.jpg" 
                  alt="Payment QR Code" 
                  style={{ width: '100%', height: '100%', objectFit: 'contain', borderRadius: '12px' }}
                />
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#6B7280' }}>
                <ShieldCheck style={{ width: '18px', height: '18px', color: '#6D5DF6' }} />
                <span style={{ fontSize: '14px', fontWeight: 600 }}>Scan to pay with any UPI app</span>
              </div>
            </div>

            {/* PhonePe Details Card */}
            <div style={{ backgroundColor: '#ffffff', border: '1px solid #C7B8FF', borderRadius: '18px', padding: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', flexDirection: 'column', textAlign: 'left' }}>
                <span style={{ fontSize: '14px', fontWeight: 500, color: '#6B7280' }}>PhonePe Number</span>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px', marginTop: '2px' }}>
                  <span style={{ fontSize: '22px', fontWeight: 800, color: '#6D5DF6' }}>6302085125</span>
                  <span style={{ fontSize: '14px', fontWeight: 600, color: '#6B7280' }}>(praneeth)</span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  navigator.clipboard.writeText("6302085125");
                  showToast("PhonePe Number copied to clipboard!", "success");
                }}
                className="profile-icon-btn"
                style={{ width: '44px', height: '44px', border: '1px solid #C7B8FF' }}
                title="Copy PhonePe Number"
              >
                <Copy style={{ width: '20px', height: '20px', color: '#6D5DF6' }} />
              </button>
            </div>

            {/* Reference Card */}
            <div style={{ backgroundColor: '#FAF9FF', border: '1px solid #C7B8FF', borderRadius: '18px', padding: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', flexDirection: 'column', textAlign: 'left' }}>
                <span style={{ fontSize: '14px', fontWeight: 500, color: '#6B7280' }}>Reference / Payment Code</span>
                <span style={{ fontSize: '28px', fontWeight: 800, color: '#6D5DF6', letterSpacing: '0.05em', marginTop: '4px', display: 'block' }}>
                  {upiRefCode}
                </span>
                <p style={{ fontSize: '12.5px', color: '#6B7280', margin: '6px 0 0 0', fontWeight: 500 }}>
                  Enter this reference in the notes while making payment
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  navigator.clipboard.writeText(upiRefCode);
                  showToast("Payment Reference Code copied to clipboard!", "success");
                }}
                className="profile-icon-btn"
                style={{ width: '44px', height: '44px', border: '1px solid #C7B8FF', flexShrink: 0, marginLeft: '12px' }}
                title="Copy Reference Code"
              >
                <Copy style={{ width: '20px', height: '20px', color: '#6D5DF6' }} />
              </button>
            </div>

            {/* Upload Section */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <label style={{ fontSize: '16px', fontWeight: 700, color: '#111827', display: 'block' }}>
                Upload Payment Screenshot
              </label>
              
              {!paymentScreenshotPreview ? (
                <div className="print-dropzone" style={{ padding: '1.5rem' }}>
                  <input 
                    type="file" 
                    accept="image/*" 
                    onChange={handleScreenshotChange}
                    style={{ position: 'absolute', inset: 0, opacity: 0, cursor: 'pointer', width: '100%', height: '100%' }}
                  />
                  <UploadCloud style={{ width: '40px', height: '40px', color: '#6D5DF6', margin: '0 auto 8px auto' }} />
                  <p style={{ fontSize: '14px', fontWeight: 700, color: '#1f2937', margin: 0 }}>Upload receipt screenshot</p>
                  <p style={{ fontSize: '11px', color: '#6B7280', marginTop: '2px', margin: 0 }}>JPEG, PNG, WebP image formats</p>
                </div>
              ) : (
                <div style={{ border: '1px solid #C7B8FF', borderRadius: '20px', padding: '12px', backgroundColor: '#ffffff', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div style={{ aspectRatio: '4/3', borderRadius: '12px', overflow: 'hidden', backgroundColor: '#f3f4f6', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <img 
                      src={paymentScreenshotPreview} 
                      alt="Receipt preview" 
                      style={{ width: '100%', height: '100%', objectFit: 'contain' }} 
                    />
                    <div style={{ position: 'absolute', bottom: '10px', right: '10px', width: '24px', height: '24px', backgroundColor: '#22C55E', borderRadius: '9999px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Check style={{ width: '14px', height: '14px', color: '#ffffff', strokeWidth: 3.5 }} />
                    </div>
                  </div>
                  <button 
                    type="button" 
                    onClick={() => {
                      setPaymentScreenshot(null);
                      setPaymentScreenshotPreview('');
                    }}
                    style={{ width: '100%', height: '38px', backgroundColor: '#fff1f2', color: '#e11d48', fontWeight: 700, fontSize: '12px', borderRadius: '12px', border: 'none', cursor: 'pointer' }}
                  >
                    Remove Receipt and Re-upload
                  </button>
                </div>
              )}
            </div>

            {/* Validation Alert */}
            <div className="print-alert-bar" style={{ backgroundColor: '#fef2f2', borderColor: '#fee2e2', justifyContent: 'center' }}>
              <ShieldAlert style={{ width: '20px', height: '20px', color: '#ef4444', flexShrink: 0 }} />
              <span style={{ fontSize: '13px', fontWeight: 700, color: '#ef4444' }}>
                Ensure the screenshot is clear and valid
              </span>
            </div>

            {/* Bottom Actions Buttons */}
            <div style={{ display: 'flex', gap: '12px', marginTop: '4px' }}>
              <button 
                type="button"
                onClick={() => setIsPaymentModalOpen(false)}
                style={{ flex: 1, height: '54px', backgroundColor: '#ffffff', border: '1px solid #E5E7EB', color: '#111827', fontWeight: 700, fontSize: '14px', borderRadius: '16px', cursor: 'pointer' }}
              >
                Cancel
              </button>
              
              <button 
                type="button"
                onClick={handleVerifySubmit}
                disabled={submittingOrder || !paymentScreenshot}
                className="print-pay-btn"
                style={{ flex: 1, height: '54px', borderRadius: '16px' }}
              >
                {submittingOrder ? (
                  'Submitting...'
                ) : (
                  <>
                    <ShieldCheck style={{ width: '20px', height: '20px', strokeWidth: 2.2 }} />
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
