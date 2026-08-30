import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ShieldCheck, ShieldAlert, Users, Grid, Eye, Trash2, Check, X as CloseIcon, AlertTriangle, MessageSquare, FileText, Gift, Star, Edit, ToggleLeft, ToggleRight, Plus, GraduationCap, Upload } from 'lucide-react';
import api from '../api/axios';
import './AdminDashboard.css';

export const AdminDashboard = () => {
  const { showToast } = useAuth();
  const navigate = useNavigate();
  
  // Tab states
  const [activeTab, setActiveTab] = useState('pending'); // pending, listings, students, reported, feedback, gift-studio, college-dept
  const [subStatus, setSubStatus] = useState('approved'); // approved, rejected (for students tab)
  const [modSubTab, setModSubTab] = useState('listings'); // listings, chats (for moderation log)
  const [giftSubTab, setGiftSubTab] = useState('products'); // products, categories (for gift studio tab)
  
  // Data states
  const [users, setUsers] = useState([]);
  const [listings, setListings] = useState([]);
  const [reportedChats, setReportedChats] = useState([]);
  const [feedbackList, setFeedbackList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  
  // ID Preview Overlay
  const [previewIdUrl, setPreviewIdUrl] = useState(null);
  const [previewTitle, setPreviewTitle] = useState('Image Preview');

  // Gift Studio states
  const [giftProducts, setGiftProducts] = useState([]);
  const [giftCategories, setGiftCategories] = useState([]);
  const [giftLoading, setGiftLoading] = useState(false);
  const [showGiftProductModal, setShowGiftProductModal] = useState(false);
  const [editingGiftProduct, setEditingGiftProduct] = useState(null);
  const [giftProductForm, setGiftProductForm] = useState({
    title: '', description: '', category: '', basePrice: '', mrpPrice: '', features: [''], badge: '', isFeatured: false, sizeOptions: []
  });
  const [giftProductPhotoItems, setGiftProductPhotoItems] = useState([]);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [editingCategory, setEditingCategory] = useState(null);
  const [editCategoryName, setEditCategoryName] = useState('');

  // Colleges & Departments states
  const [colleges, setColleges] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [collegeDeptSubTab, setCollegeDeptSubTab] = useState('colleges'); // colleges, departments
  const [newCollegeName, setNewCollegeName] = useState('');
  const [editingCollege, setEditingCollege] = useState(null);
  const [editCollegeName, setEditCollegeName] = useState('');
  const [newDeptName, setNewDeptName] = useState('');
  const [editingDept, setEditingDept] = useState(null);
  const [editDeptName, setEditDeptName] = useState('');

  const fetchData = async () => {
    setLoading(true);
    try {
      const usersRes = await api.get('/admin/users');
      const listingsRes = await api.get('/admin/listings');
      const chatsRes = await api.get('/admin/chats');
      const feedbackRes = await api.get('/feedback');
      setUsers(usersRes.data);
      setListings(listingsRes.data);
      setReportedChats(chatsRes.data);
      setFeedbackList(feedbackRes.data);
    } catch (err) {
      console.error('Error fetching admin dashboard data:', err);
      showToast('Failed to fetch admin data.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const fetchGiftData = async () => {
    setGiftLoading(true);
    try {
      const [productsRes, categoriesRes] = await Promise.all([
        api.get('/gift/products?showAll=true'),
        api.get('/gift/categories')
      ]);
      setGiftProducts(productsRes.data);
      setGiftCategories(categoriesRes.data);
    } catch (err) {
      console.error('Error fetching gift data:', err);
    } finally {
      setGiftLoading(false);
    }
  };

  const fetchCollegesAndDepartments = async () => {
    try {
      const [collegesRes, deptsRes] = await Promise.all([
        api.get('/colleges?showAll=true'),
        api.get('/departments?showAll=true'),
      ]);
      setColleges(collegesRes.data);
      setDepartments(deptsRes.data);
    } catch (err) {
      console.error('Error fetching colleges/departments:', err);
    }
  };

  useEffect(() => {
    fetchData();
    fetchGiftData();
    fetchCollegesAndDepartments();
  }, []);

  const handleApprove = async (id) => {
    setActionLoading(true);
    try {
      await api.post(`/admin/users/${id}/approve`);
      showToast('Student verified successfully!', 'success');
      fetchData();
    } catch (err) {
      showToast('Failed to approve student', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async (id) => {
    setActionLoading(true);
    try {
      await api.post(`/admin/users/${id}/reject`);
      showToast('Student verification rejected.', 'info');
      fetchData();
    } catch (err) {
      showToast('Failed to reject student', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteListing = async (id) => {
    if (!window.confirm('Are you sure you want to remove this listing?')) return;
    setActionLoading(true);
    try {
      await api.delete(`/admin/listings/${id}`);
      showToast('Listing removed successfully', 'success');
      fetchData();
    } catch (err) {
      showToast('Failed to remove listing', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDismissReports = async (id) => {
    if (!window.confirm('Are you sure you want to dismiss all reports for this listing?')) return;
    setActionLoading(true);
    try {
      await api.post(`/admin/listings/${id}/dismiss-reports`);
      showToast('All reports dismissed successfully!', 'success');
      fetchData();
    } catch (err) {
      showToast('Failed to dismiss reports', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDismissChatReports = async (id) => {
    if (!window.confirm('Are you sure you want to dismiss all reports for this chat?')) return;
    setActionLoading(true);
    try {
      await api.post(`/admin/chats/${id}/dismiss-reports`);
      showToast('All reports on this conversation dismissed successfully!', 'success');
      fetchData();
    } catch (err) {
      showToast('Failed to dismiss chat reports', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteFeedback = async (id) => {
    if (!window.confirm('Are you sure you want to delete this feedback/feature request?')) return;
    setActionLoading(true);
    try {
      await api.delete(`/admin/feedback/${id}`);
      showToast('Feedback deleted successfully', 'success');
      fetchData();
    } catch (err) {
      showToast('Failed to delete feedback', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleUpdateFeedbackStatus = async (id, status) => {
    setActionLoading(true);
    try {
      await api.post(`/admin/feedback/${id}/status`, { status });
      showToast(`Feedback marked as ${status} successfully!`, 'success');
      fetchData();
    } catch (err) {
      showToast('Failed to update feedback status', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  // Stats calculations
  const pendingCount = users.filter(u => u.verificationStatus === 'pending').length;
  const approvedCount = users.filter(u => u.verificationStatus === 'approved').length;
  const rejectedCount = users.filter(u => u.verificationStatus === 'rejected').length;
  const totalListings = listings.length;

  return (
    <div className="admin-dashboard-container">
      {/* Title */}
      <div className="admin-title-bar">
        <div>
          <h1 className="admin-title">
            <ShieldCheck style={{ width: '28px', height: '28px', color: '#f43f5e' }} />
            Admin Dashboard
          </h1>
          <p className="admin-subtitle">Verify students and manage marketplace listings</p>
        </div>
        <button 
          onClick={() => navigate('/vendors/print-dashboard')}
          className="admin-print-btn"
        >
          <FileText style={{ width: '16px', height: '16px' }} />
          Print Shop Dashboard
        </button>
      </div>

      {/* Stats Cards */}
      <div className="admin-stats-grid">
        <div className="admin-stat-card emerald">
          <div className="admin-stat-icon-box emerald">
            <Users style={{ width: '20px', height: '20px' }} />
          </div>
          <div>
            <p className="admin-stat-value">{approvedCount}</p>
            <p className="admin-stat-label">Active Users</p>
          </div>
        </div>

        <div className="admin-stat-card purple">
          <div className="admin-stat-icon-box purple">
            <Grid style={{ width: '20px', height: '20px' }} />
          </div>
          <div>
            <p className="admin-stat-value">{totalListings}</p>
            <p className="admin-stat-label">Total Listings</p>
          </div>
        </div>

        <div className="admin-stat-card amber">
          <div className="admin-stat-icon-box amber">
            <ShieldAlert style={{ width: '20px', height: '20px' }} className="animate-pulse" />
          </div>
          <div>
            <p className="admin-stat-value">{pendingCount}</p>
            <p className="admin-stat-label">Pending Approvals</p>
          </div>
        </div>

        <div className="admin-stat-card rose">
          <div className="admin-stat-icon-box rose">
            <AlertTriangle style={{ width: '20px', height: '20px' }} />
          </div>
          <div>
            <p className="admin-stat-value">{listings.filter(l => l.reports && l.reports.length > 0).length + reportedChats.length}</p>
            <p className="admin-stat-label">Reported Issues</p>
          </div>
        </div>
      </div>

      {/* Tabs Header */}
      <div className="admin-tabs-wrapper">
        <div className="admin-tab-bar">
          <button
            onClick={() => setActiveTab('pending')}
            className={`admin-tab-btn ${activeTab === 'pending' ? 'active' : ''}`}
          >
            <ShieldAlert style={{ width: '16px', height: '16px' }} /> Pending Approvals ({pendingCount})
          </button>
          
          <button
            onClick={() => setActiveTab('students')}
            className={`admin-tab-btn ${activeTab === 'students' ? 'active' : ''}`}
          >
            <Users style={{ width: '16px', height: '16px' }} /> All Students
          </button>

          <button
            onClick={() => setActiveTab('listings')}
            className={`admin-tab-btn ${activeTab === 'listings' ? 'active' : ''}`}
          >
            <Grid style={{ width: '16px', height: '16px' }} /> Marketplace Listings ({totalListings})
          </button>

          <button
            onClick={() => setActiveTab('reported')}
            className={`admin-tab-btn ${activeTab === 'reported' ? 'active-rose' : ''}`}
          >
            <AlertTriangle style={{ width: '16px', height: '16px' }} className={(listings.filter(l => l.reports && l.reports.length > 0).length > 0 || reportedChats.length > 0) ? 'animate-pulse' : ''} /> Moderation Log ({listings.filter(l => l.reports && l.reports.length > 0).length + reportedChats.length})
          </button>

          <button
            onClick={() => setActiveTab('feedback')}
            className={`admin-tab-btn ${activeTab === 'feedback' ? 'active-indigo' : ''}`}
          >
            <MessageSquare style={{ width: '16px', height: '16px' }} /> Feedback Logs ({feedbackList.length})
          </button>

          <button
            onClick={() => setActiveTab('gift-studio')}
            className={`px-4 py-2.5 rounded-xl transition-all duration-200 flex items-center gap-2 ${
              activeTab === 'gift-studio'
                ? 'bg-white text-[#6C4EFF] shadow-sm border border-[#E9E6F8]'
                : 'text-[#6B7280] hover:text-[#111827] border border-transparent'
            }`}
          >
            <Gift className="w-4 h-4" /> Gift Studio ({giftProducts.length})
          </button>

          <button
            onClick={() => setActiveTab('college-dept')}
            className={`px-4 py-2.5 rounded-xl transition-all duration-200 flex items-center gap-2 ${
              activeTab === 'college-dept'
                ? 'bg-white text-[#6C4EFF] shadow-sm border border-[#E9E6F8]'
                : 'text-[#6B7280] hover:text-[#111827] border border-transparent'
            }`}
          >
            <GraduationCap className="w-4 h-4" /> Colleges & Departments ({colleges.length + departments.length})
          </button>
        </div>

        {/* Tab content panel */}
        {loading ? (
          <div className="admin-loading">
            <div className="admin-spinner animate-spin" />
          </div>
        ) : (
          <div className="admin-content-panel animate-fadeIn">
            {activeTab === 'pending' && (
              <div className="admin-table-scroll">
                <table className="admin-table">
                  <thead>
                    <tr className="admin-table-header">
                      <th>Student Name</th>
                      <th>Reg Number</th>
                      <th>Department / Year</th>
                      <th>College & Contact</th>
                      <th className="text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="admin-table-body">
                    {users.filter(u => u.verificationStatus === 'pending').length > 0 ? (
                      users.filter(u => u.verificationStatus === 'pending').map((st) => (
                        <tr key={st._id}>
                          <td>
                            <p className="admin-cell-name">{st.fullName}</p>
                            <p className="admin-cell-email">{st.email}</p>
                          </td>
                          <td className="admin-cell-mono">{st.registrationNumber}</td>
                          <td>
                             <div className="admin-cell-dept">{st.department}</div>
                             <div style={{ marginTop: '4px' }}>
                               <span className="admin-cell-year-text">{st.year}</span>
                             </div>
                          </td>
                          <td>
                            <p className="admin-cell-name" style={{ fontSize: '12px' }}>{st.college || '-'}</p>
                            <p className="admin-cell-email" style={{ marginTop: '2px' }}>{st.whatsappNumber || '-'}</p>
                          </td>
                          <td className="text-center">
                            <div className="admin-action-group">
                              <button
                                onClick={() => handleApprove(st._id)}
                                disabled={actionLoading}
                                className="admin-action-btn approve"
                                title="Approve Student"
                              >
                                <Check style={{ width: '16px', height: '16px', strokeWidth: 2.5 }} />
                              </button>
                              
                              <button
                                onClick={() => handleReject(st._id)}
                                disabled={actionLoading}
                                className="admin-action-btn reject"
                                title="Reject Student"
                              >
                                <CloseIcon style={{ width: '16px', height: '16px', strokeWidth: 2.5 }} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr className="admin-empty-row">
                        <td colSpan="5">
                          No pending verifications. All caught up!
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}

            {activeTab === 'students' && (
              <div>
                <div className="admin-sub-tab-bar">
                  <button
                    onClick={() => setSubStatus('approved')}
                    className={`admin-sub-tab-btn ${subStatus === 'approved' ? 'active' : ''}`}
                  >
                    Approved Verified Students ({approvedCount})
                  </button>
                  <button
                    onClick={() => setSubStatus('rejected')}
                    className={`admin-sub-tab-btn ${subStatus === 'rejected' ? 'active' : ''}`}
                  >
                    Rejected Students ({rejectedCount})
                  </button>
                </div>

                <div className="admin-table-scroll">
                  <table className="admin-table">
                    <thead>
                      <tr className="admin-table-header">
                        <th>Student Name</th>
                        <th>Reg Number</th>
                        <th>Department / Year</th>
                        <th>College & Contact</th>
                        <th className="text-center">Status Action</th>
                      </tr>
                    </thead>
                    <tbody className="admin-table-body">
                      {users.filter(u => u.verificationStatus === subStatus).length > 0 ? (
                        users.filter(u => u.verificationStatus === subStatus).map((st) => (
                          <tr key={st._id}>
                            <td>
                              <p className="admin-cell-name">{st.fullName}</p>
                              <p className="admin-cell-email">{st.email}</p>
                            </td>
                            <td className="admin-cell-mono">{st.registrationNumber}</td>
                            <td>
                             <div className="admin-cell-dept">{st.department}</div>
                             <div style={{ marginTop: '4px' }}>
                               <span className="admin-cell-year-text">{st.year}</span>
                             </div>
                            </td>
                            <td>
                              <p className="admin-cell-name" style={{ fontSize: '12px' }}>{st.college || '-'}</p>
                              <p className="admin-cell-email" style={{ marginTop: '2px' }}>{st.whatsappNumber || '-'}</p>
                            </td>
                            <td className="text-center">
                              {subStatus === 'approved' ? (
                                <button
                                  onClick={() => handleReject(st._id)}
                                  disabled={actionLoading}
                                  className="admin-text-action-btn reject"
                                >
                                  Reject / Block
                                </button>
                              ) : (
                                <button
                                  onClick={() => handleApprove(st._id)}
                                  disabled={actionLoading}
                                  className="admin-text-action-btn approve"
                                >
                                  Approve / Unblock
                                </button>
                              )}
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr className="admin-empty-row">
                          <td colSpan="5">
                            No students in this list.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {activeTab === 'listings' && (
              <div className="admin-table-scroll">
                <table className="admin-table">
                  <thead>
                    <tr className="admin-table-header">
                      <th>Product Info</th>
                      <th>Seller details</th>
                      <th>Market / Type</th>
                      <th>Price</th>
                      <th className="text-center">Action</th>
                    </tr>
                  </thead>
                  <tbody className="admin-table-body">
                    {listings.length > 0 ? (
                      listings.map((lst) => (
                        <tr key={lst._id} className={lst.reports && lst.reports.length > 0 ? 'flagged' : ''}>
                          <td>
                            <div className="admin-product-info">
                              {lst.images && lst.images.length > 0 ? (
                                <div
                                  onClick={() => { setPreviewIdUrl(lst.images[0]); setPreviewTitle('Listing Image Preview'); }}
                                  className="admin-id-thumb"
                                  title="Click to preview image"
                                >
                                  <img src={lst.images[0]} alt="" />
                                </div>
                              ) : (
                                <div className="admin-id-thumb" style={{ backgroundColor: '#f8fafc', cursor: 'default' }}>
                                  <span className="admin-no-image">No Img</span>
                                </div>
                              )}
                              <div>
                                <div className="admin-product-title-row">
                                  <p className="admin-product-title">{lst.title}</p>
                                  {lst.reports && lst.reports.length > 0 && (
                                    <span className="admin-badge flagged animate-pulse">
                                      <AlertTriangle style={{ width: '10px', height: '10px' }} /> Flagged
                                    </span>
                                  )}
                                </div>
                                <p className="admin-product-desc">{lst.description}</p>
                              </div>
                            </div>
                          </td>
                          <td style={{ fontSize: '12px', fontWeight: 500 }}>
                            <p className="admin-cell-name">{lst.seller?.fullName || 'Anonymous'}</p>
                            <p className="admin-cell-email">{lst.sellerCollege}</p>
                          </td>
                          <td>
                            <div className="admin-listing-type-col">
                              <span className="admin-badge market-type">{lst.marketType}</span>
                              <span className="admin-badge listing-type">{lst.listingType}</span>
                            </div>
                          </td>
                          <td className="admin-cell-bold">
                            {lst.listingType === 'donate' ? 'Free' : `₹${lst.price}`}
                          </td>
                          <td className="text-center">
                            <button
                              onClick={() => handleDeleteListing(lst._id)}
                              disabled={actionLoading}
                              className="admin-action-btn delete"
                              title="Delete Listing"
                            >
                              <Trash2 style={{ width: '16px', height: '16px' }} />
                            </button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr className="admin-empty-row">
                        <td colSpan="5">
                          No listings in the marketplace.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}

            {activeTab === 'reported' && (
              <div>
                <div className="admin-sub-tab-bar">
                  <button
                    onClick={() => setModSubTab('listings')}
                    className={`admin-sub-tab-btn ${modSubTab === 'listings' ? 'active' : ''}`}
                  >
                    Reported Listings ({listings.filter(l => l.reports && l.reports.length > 0).length})
                  </button>
                  <button
                    onClick={() => setModSubTab('chats')}
                    className={`admin-sub-tab-btn ${modSubTab === 'chats' ? 'active' : ''}`}
                  >
                    Reported Chats ({reportedChats.length})
                  </button>
                </div>

                {modSubTab === 'listings' ? (
                  <div className="admin-table-scroll">
                    <table className="admin-table">
                      <thead>
                        <tr className="admin-table-header">
                          <th>Product Info</th>
                          <th>Seller Details</th>
                          <th>Reports & Reasons</th>
                          <th>Status / Price</th>
                          <th className="text-center">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="admin-table-body">
                        {listings.filter(l => l.reports && l.reports.length > 0).length > 0 ? (
                          listings.filter(l => l.reports && l.reports.length > 0).map((lst) => (
                            <tr key={lst._id}>
                              <td>
                                <div className="admin-product-info">
                                  {lst.images && lst.images.length > 0 ? (
                                    <div
                                      onClick={() => { setPreviewIdUrl(lst.images[0]); setPreviewTitle('Listing Image Preview'); }}
                                      className="admin-id-thumb"
                                      title="Click to preview image"
                                    >
                                      <img src={lst.images[0]} alt="" />
                                    </div>
                                  ) : (
                                    <div className="admin-id-thumb" style={{ backgroundColor: '#f8fafc', cursor: 'default' }}>
                                      <span className="admin-no-image">No Img</span>
                                    </div>
                                  )}
                                  <div>
                                    <p className="admin-product-title">{lst.title}</p>
                                    <p className="admin-product-desc">{lst.description}</p>
                                  </div>
                                </div>
                              </td>
                              <td style={{ fontSize: '12px', fontWeight: 500 }}>
                                <p className="admin-cell-name">{lst.seller?.fullName || 'Anonymous'}</p>
                                <p className="admin-cell-email">{lst.sellerCollege}</p>
                              </td>
                              <td style={{ fontSize: '12px' }}>
                                <div className="admin-report-col">
                                  <span className="admin-report-count-badge">
                                    <AlertTriangle style={{ width: '14px', height: '14px' }} className="animate-pulse" /> {lst.reports.length} report(s)
                                  </span>
                                  <div className="admin-report-list">
                                    {lst.reports.map((r, i) => (
                                      <p key={i} className="admin-report-item">
                                        • <strong>{r.reporter?.fullName || 'Student'}:</strong> {r.reason}
                                      </p>
                                    ))}
                                  </div>
                                </div>
                              </td>
                              <td className="admin-cell-bold">
                                <div className="admin-status-col">
                                  <span className={`admin-badge ${lst.status === 'removed' ? 'status-removed' : 'status-active'}`}>
                                    {lst.status === 'removed' ? 'Auto-Hidden' : lst.status}
                                  </span>
                                  <span>{lst.listingType === 'donate' ? 'Free' : `₹${lst.price}`}</span>
                                </div>
                              </td>
                              <td>
                                <div className="admin-action-group" style={{ justifyContent: 'center' }}>
                                  <button
                                    onClick={() => handleDismissReports(lst._id)}
                                    disabled={actionLoading}
                                    className="admin-action-btn approve"
                                    title="Dismiss Reports & Restore"
                                  >
                                    <Check style={{ width: '16px', height: '16px' }} />
                                  </button>
                                  <button
                                    onClick={() => handleDeleteListing(lst._id)}
                                    disabled={actionLoading}
                                    className="admin-action-btn delete"
                                    title="Delete Listing Permanently"
                                  >
                                    <Trash2 style={{ width: '16px', height: '16px' }} />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr className="admin-empty-row">
                            <td colSpan="5">
                              No reported listings found.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="admin-table-scroll">
                    <table className="admin-table">
                      <thead>
                        <tr className="admin-table-header">
                          <th>Chat Context</th>
                          <th>Buyer (Reporter)</th>
                          <th>Seller (Recipient)</th>
                          <th>Report Reason(s)</th>
                          <th className="text-center">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="admin-table-body">
                        {reportedChats.length > 0 ? (
                          reportedChats.map((chat) => (
                            <tr key={chat._id}>
                              <td>
                                <div className="admin-chat-context">
                                  <span className="admin-chat-title">{chat.listing?.title || 'General Chat'}</span>
                                  {chat.listing?.price !== undefined && (
                                    <span className="admin-chat-price">
                                      {chat.listing.price === 0 ? 'Free/Donate' : `₹${chat.listing.price}`}
                                    </span>
                                  )}
                                </div>
                              </td>
                              <td style={{ fontSize: '12px', fontWeight: 500 }}>
                                <p className="admin-cell-name">{chat.buyer?.fullName || 'Anonymous'}</p>
                                <p className="admin-cell-email">{chat.buyer?.email}</p>
                                {chat.buyer && chat.buyer.verificationStatus !== 'rejected' && (
                                  <button
                                    onClick={() => handleReject(chat.buyer._id)}
                                    disabled={actionLoading}
                                    className="admin-block-link"
                                  >
                                    Reject / Block Buyer
                                  </button>
                                )}
                              </td>
                              <td style={{ fontSize: '12px', fontWeight: 500 }}>
                                <p className="admin-cell-name">{chat.seller?.fullName || 'Anonymous'}</p>
                                <p className="admin-cell-email">{chat.seller?.email}</p>
                                {chat.seller && chat.seller.verificationStatus !== 'rejected' && (
                                  <button
                                    onClick={() => handleReject(chat.seller._id)}
                                    disabled={actionLoading}
                                    className="admin-block-link"
                                  >
                                    Reject / Block Seller
                                  </button>
                                )}
                              </td>
                              <td style={{ fontSize: '12px' }}>
                                <div className="admin-report-col">
                                  <span className="admin-report-count-badge">
                                    <AlertTriangle style={{ width: '14px', height: '14px' }} className="animate-pulse" /> {chat.reports.length} report(s)
                                  </span>
                                  <div className="admin-report-list">
                                    {chat.reports.map((r, i) => (
                                      <p key={i} className="admin-report-item">
                                        • <strong>{r.reporter?.fullName || 'Student'}:</strong> {r.reason}
                                      </p>
                                    ))}
                                  </div>
                                </div>
                              </td>
                              <td>
                                <div className="admin-action-group" style={{ justifyContent: 'center' }}>
                                  <button
                                    onClick={() => handleDismissChatReports(chat._id)}
                                    disabled={actionLoading}
                                    className="admin-action-btn approve"
                                    title="Dismiss Chat Reports"
                                  >
                                    <Check style={{ width: '16px', height: '16px', strokeWidth: 2.5 }} />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr className="admin-empty-row">
                            <td colSpan="5">
                              No reported conversations.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'feedback' && (
              <div className="admin-table-scroll animate-fadeIn" style={{ textAlign: 'left' }}>
                <table className="admin-table">
                  <thead>
                    <tr className="admin-table-header">
                      <th>Student</th>
                      <th>Feedback / Issue</th>
                      <th>Category</th>
                      <th>Votes</th>
                      <th>Status</th>
                      <th className="text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="admin-table-body">
                    {feedbackList.length > 0 ? (
                      feedbackList.map((item) => (
                        <tr key={item._id}>
                          <td>
                            <p className="admin-feedback-user">{item.user?.fullName || 'Student'}</p>
                            <p className="admin-feedback-user-dept">{item.user?.department} • {item.user?.year} yr</p>
                          </td>
                          <td style={{ maxWidth: '280px' }}>
                            <p className="admin-feedback-title">{item.title}</p>
                            <p className="admin-feedback-desc">{item.description}</p>
                          </td>
                          <td>
                            <span className={`admin-badge ${
                              item.category === 'feature'
                                ? 'cat-feature'
                                : item.category === 'bug'
                                ? 'cat-bug'
                                : 'cat-other'
                            }`}>
                              {item.category}
                            </span>
                          </td>
                          <td className="admin-feedback-votes">
                            ⭐ {item.upvotes?.length || 0} upvotes
                          </td>
                          <td>
                            <select
                              value={item.status}
                              onChange={(e) => handleUpdateFeedbackStatus(item._id, e.target.value)}
                              className="admin-feedback-select"
                            >
                              <option value="pending">Review Pending</option>
                              <option value="reviewing">In Review</option>
                              <option value="planned">Planned</option>
                              <option value="completed">Completed</option>
                              <option value="dismissed">Dismissed</option>
                            </select>
                          </td>
                          <td className="text-center">
                            <button
                              onClick={() => handleDeleteFeedback(item._id)}
                              className="admin-action-btn delete"
                              title="Delete Feedback"
                              style={{ margin: '0 auto' }}
                            >
                              <Trash2 style={{ width: '14px', height: '14px' }} />
                            </button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr className="admin-empty-row">
                        <td colSpan="6">
                          No feedback submitted by students yet.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}

            {activeTab === 'gift-studio' && (
              <div>
                {/* Sub tabs: Products | Categories */}
                <div className="flex border-b border-[#E9E6F8] bg-[#FAFAFF] px-6 py-3 gap-4 text-xs font-bold">
                  <button
                    onClick={() => setGiftSubTab('products')}
                    className={`px-3 py-1.5 rounded-full transition-all ${
                      giftSubTab === 'products' ? 'bg-[#111827] text-white' : 'text-[#6B7280] hover:bg-slate-200/50'
                    }`}
                  >
                    Products ({giftProducts.length})
                  </button>
                  <button
                    onClick={() => setGiftSubTab('categories')}
                    className={`px-3 py-1.5 rounded-full transition-all ${
                      giftSubTab === 'categories' ? 'bg-[#111827] text-white' : 'text-[#6B7280] hover:bg-slate-200/50'
                    }`}
                  >
                    Categories ({giftCategories.length})
                  </button>
                </div>

                {giftSubTab === 'products' ? (
                  <div>
                    {/* Add Product button */}
                    <div className="px-6 py-4 flex justify-end">
                      <button
                        onClick={() => {
                          setEditingGiftProduct(null);
                          setGiftProductForm({ title: '', description: '', category: '', basePrice: '', mrpPrice: '', features: [''], badge: '', isFeatured: false, sizeOptions: [] });
                          setGiftProductPhotoItems([]);
                          setShowGiftProductModal(true);
                        }}
                        className="h-9 px-4 bg-[#6C4EFF] hover:bg-[#5C3EEF] text-white font-bold text-xs rounded-xl flex items-center gap-1.5 transition-all"
                      >
                        <Plus className="w-4 h-4" /> Add Product
                      </button>
                    </div>

                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="bg-[#FAFAFF] border-b border-[#E9E6F8] text-xs font-bold text-[#6B7280] uppercase tracking-wider">
                            <th className="px-6 py-4">Product</th>
                            <th className="px-6 py-4">Category</th>
                            <th className="px-6 py-4">Price</th>
                            <th className="px-6 py-4 text-center">Featured</th>
                            <th className="px-6 py-4 text-center">Active</th>
                            <th className="px-6 py-4 text-center">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[#E9E6F8] text-sm text-[#111827]">
                          {giftProducts.length > 0 ? (
                            giftProducts.map((gp) => (
                              <tr key={gp._id} className={`transition-colors ${!gp.isActive ? 'opacity-50' : ''} hover:bg-[#FAFAFF]/50`}>
                                <td className="px-6 py-4">
                                  <div className="flex items-center gap-3">
                                    <div
                                      onClick={() => { setPreviewIdUrl(gp.images?.[0]); setPreviewTitle('Product Image Preview'); }}
                                      className="w-12 h-12 rounded-lg bg-slate-100 border border-[#E9E6F8] overflow-hidden flex-shrink-0 cursor-pointer hover:opacity-85 transition-opacity"
                                    >
                                      {gp.images?.[0] ? (
                                        <img src={gp.images[0]} alt="" className="w-full h-full object-cover" />
                                      ) : (
                                        <div className="w-full h-full flex items-center justify-center text-xs text-gray-400">No Img</div>
                                      )}
                                    </div>
                                    <div>
                                      <p className="font-bold text-[#111827]">{gp.title}</p>
                                      {gp.badge && (
                                        <span className="inline-flex items-center gap-0.5 text-[9px] font-extrabold text-amber-600 bg-amber-50 border border-amber-100 px-2 py-0.5 rounded-full uppercase tracking-wider mt-0.5">
                                          <Star className="w-2.5 h-2.5" /> {gp.badge}
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                </td>
                                <td className="px-6 py-4 text-xs font-medium">{gp.category}</td>
                                <td className="px-6 py-4">
                                  <span className="font-black">₹{gp.basePrice}</span>
                                  {gp.mrpPrice > gp.basePrice && (
                                    <span className="ml-1.5 text-xs text-[#9CA3AF] line-through">₹{gp.mrpPrice}</span>
                                  )}
                                </td>
                                <td className="px-6 py-4 text-center">
                                  <button
                                    onClick={async () => {
                                      try {
                                        await api.post(`/gift/products/${gp._id}/toggle-featured`);
                                        fetchGiftData();
                                      } catch { showToast('Failed to toggle featured', 'error'); }
                                    }}
                                    className="mx-auto"
                                    title={gp.isFeatured ? 'Unfeature' : 'Feature'}
                                  >
                                    {gp.isFeatured ? (
                                      <ToggleRight className="w-6 h-6 text-[#6C4EFF]" />
                                    ) : (
                                      <ToggleLeft className="w-6 h-6 text-[#9CA3AF]" />
                                    )}
                                  </button>
                                </td>
                                <td className="px-6 py-4 text-center">
                                  <button
                                    onClick={async () => {
                                      try {
                                        await api.put(`/gift/products/${gp._id}`, { isActive: !gp.isActive });
                                        fetchGiftData();
                                        showToast(`Product ${gp.isActive ? 'deactivated' : 'activated'}`, 'success');
                                      } catch { showToast('Failed to toggle active', 'error'); }
                                    }}
                                    className="mx-auto"
                                    title={gp.isActive ? 'Deactivate' : 'Activate'}
                                  >
                                    {gp.isActive ? (
                                      <ToggleRight className="w-6 h-6 text-emerald-500" />
                                    ) : (
                                      <ToggleLeft className="w-6 h-6 text-[#9CA3AF]" />
                                    )}
                                  </button>
                                </td>
                                <td className="px-6 py-4">
                                  <div className="flex gap-2 justify-center">
                                    <button
                                      onClick={() => {
                                        setEditingGiftProduct(gp);
                                        setGiftProductForm({
                                          title: gp.title,
                                          description: gp.description,
                                          category: gp.category,
                                          basePrice: gp.basePrice,
                                          mrpPrice: gp.mrpPrice ?? '',
                                          features: gp.features?.length ? gp.features : [''],
                                          badge: gp.badge || '',
                                          isFeatured: gp.isFeatured,
                                          sizeOptions: gp.sizeOptions || []
                                        });
                                        const existingItems = (gp.images || []).map((imgUrl, idx) => ({
                                          id: `existing-${idx}-${Date.now()}`,
                                          type: 'existing',
                                          url: imgUrl
                                        }));
                                        setGiftProductPhotoItems(existingItems);
                                        setShowGiftProductModal(true);
                                      }}
                                      className="w-8 h-8 rounded-full bg-[#F4F1FF] text-[#6C4EFF] hover:bg-[#E9E6F8] flex items-center justify-center transition-colors"
                                      title="Edit Product"
                                    >
                                      <Edit className="w-4 h-4" />
                                    </button>
                                    <button
                                      onClick={async () => {
                                        const confirmed = window.confirm(
                                          `Permanently delete "${gp.title}"? This cannot be undone. ` +
                                          `If you just want to hide it from customers, use the Active toggle instead.`
                                        );
                                        if (!confirmed) return;
                                        try {
                                          await api.delete(`/gift/products/${gp._id}?hard=true`);
                                          showToast('Product permanently deleted', 'success');
                                          fetchGiftData();
                                        } catch (err) {
                                          showToast(err.response?.data?.message || 'Failed to delete product', 'error');
                                        }
                                      }}
                                      className="w-8 h-8 rounded-full bg-rose-50 text-rose-600 hover:bg-rose-100 flex items-center justify-center transition-colors"
                                      title="Delete Product"
                                    >
                                      <Trash2 className="w-4 h-4" />
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            ))
                          ) : (
                            <tr>
                              <td colSpan="6" className="px-6 py-12 text-center text-[#6B7280]">
                                No gift products yet. Click "Add Product" to create one.
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                ) : (
                  /* Categories sub-tab */
                  <div>
                    {/* Add Category row */}
                    <div className="px-6 py-4 flex gap-2">
                      <input
                        type="text"
                        value={newCategoryName}
                        onChange={(e) => setNewCategoryName(e.target.value)}
                        placeholder="New category name..."
                        className="flex-1 h-9 px-3 bg-[#FAFAFF] border border-[#E9E6F8] rounded-xl text-xs font-medium focus:outline-none focus:border-[#6C4EFF]/40"
                      />
                      <button
                        onClick={async () => {
                          if (!newCategoryName.trim()) return;
                          try {
                            await api.post('/gift/categories', { name: newCategoryName.trim() });
                            setNewCategoryName('');
                            showToast('Category created!', 'success');
                            fetchGiftData();
                          } catch (err) {
                            showToast(err.response?.data?.message || 'Failed to create category', 'error');
                          }
                        }}
                        className="h-9 px-4 bg-[#6C4EFF] hover:bg-[#5C3EEF] text-white font-bold text-xs rounded-xl flex items-center gap-1.5 transition-all"
                      >
                        <Plus className="w-4 h-4" /> Add
                      </button>
                    </div>

                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="bg-[#FAFAFF] border-b border-[#E9E6F8] text-xs font-bold text-[#6B7280] uppercase tracking-wider">
                            <th className="px-6 py-4">Category Name</th>
                            <th className="px-6 py-4 text-center">Active</th>
                            <th className="px-6 py-4 text-center">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[#E9E6F8] text-sm text-[#111827]">
                          {giftCategories.length > 0 ? (
                            giftCategories.map((cat) => (
                              <tr key={cat._id} className={`transition-colors ${!cat.isActive ? 'opacity-50' : ''} hover:bg-[#FAFAFF]/50`}>
                                <td className="px-6 py-4">
                                  {editingCategory === cat._id ? (
                                    <div className="flex gap-2">
                                      <input
                                        type="text"
                                        value={editCategoryName}
                                        onChange={(e) => setEditCategoryName(e.target.value)}
                                        className="flex-1 h-8 px-2 bg-[#FAFAFF] border border-[#E9E6F8] rounded-lg text-xs font-medium focus:outline-none focus:border-[#6C4EFF]/40"
                                      />
                                      <button
                                        onClick={async () => {
                                          try {
                                            await api.put(`/gift/categories/${cat._id}`, { name: editCategoryName.trim() });
                                            setEditingCategory(null);
                                            showToast('Category renamed!', 'success');
                                            fetchGiftData();
                                          } catch (err) {
                                            showToast(err.response?.data?.message || 'Failed to rename', 'error');
                                          }
                                        }}
                                        className="h-8 px-3 bg-[#6C4EFF] text-white text-xs font-bold rounded-lg"
                                      >
                                        Save
                                      </button>
                                      <button
                                        onClick={() => setEditingCategory(null)}
                                        className="h-8 px-3 bg-slate-100 text-[#6B7280] text-xs font-bold rounded-lg"
                                      >
                                        Cancel
                                      </button>
                                    </div>
                                  ) : (
                                    <p className="font-bold">{cat.name}</p>
                                  )}
                                </td>
                                <td className="px-6 py-4 text-center">
                                  <button
                                    onClick={async () => {
                                      try {
                                        await api.put(`/gift/categories/${cat._id}`, { isActive: !cat.isActive });
                                        fetchGiftData();
                                        showToast(`Category ${cat.isActive ? 'deactivated' : 'activated'}`, 'success');
                                      } catch { showToast('Failed to toggle category', 'error'); }
                                    }}
                                    className="mx-auto"
                                  >
                                    {cat.isActive ? (
                                      <ToggleRight className="w-6 h-6 text-emerald-500" />
                                    ) : (
                                      <ToggleLeft className="w-6 h-6 text-[#9CA3AF]" />
                                    )}
                                  </button>
                                </td>
                                <td className="px-6 py-4">
                                  <div className="flex gap-2 justify-center">
                                    <button
                                      onClick={() => {
                                        setEditingCategory(cat._id);
                                        setEditCategoryName(cat.name);
                                      }}
                                      className="w-8 h-8 rounded-full bg-[#F4F1FF] text-[#6C4EFF] hover:bg-[#E9E6F8] flex items-center justify-center transition-colors"
                                      title="Rename"
                                    >
                                      <Edit className="w-4 h-4" />
                                    </button>
                                    <button
                                      onClick={async () => {
                                        if (!window.confirm(`Delete category "${cat.name}"?`)) return;
                                        try {
                                          await api.delete(`/gift/categories/${cat._id}`);
                                          showToast('Category deleted!', 'success');
                                          fetchGiftData();
                                        } catch (err) {
                                          showToast(err.response?.data?.message || 'Failed to delete category', 'error');
                                        }
                                      }}
                                      className="w-8 h-8 rounded-full bg-rose-50 text-rose-600 hover:bg-rose-100 flex items-center justify-center transition-colors"
                                      title="Delete Category"
                                    >
                                      <Trash2 className="w-4 h-4" />
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            ))
                          ) : (
                            <tr>
                              <td colSpan="3" className="px-6 py-12 text-center text-[#6B7280]">
                                No categories yet. Add one above.
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'college-dept' && (
              <div>
                {/* Sub-tab switcher */}
                <div className="flex gap-2 px-6 py-3 border-b border-[#E9E6F8] text-xs font-bold">
                  <button
                    onClick={() => setCollegeDeptSubTab('colleges')}
                    className={`px-3 py-1.5 rounded-full transition-all ${
                      collegeDeptSubTab === 'colleges' ? 'bg-[#111827] text-white' : 'text-[#6B7280] hover:bg-slate-200/50'
                    }`}
                  >
                    Colleges ({colleges.length})
                  </button>
                  <button
                    onClick={() => setCollegeDeptSubTab('departments')}
                    className={`px-3 py-1.5 rounded-full transition-all ${
                      collegeDeptSubTab === 'departments' ? 'bg-[#111827] text-white' : 'text-[#6B7280] hover:bg-slate-200/50'
                    }`}
                  >
                    Departments ({departments.length})
                  </button>
                </div>

                {collegeDeptSubTab === 'colleges' ? (
                  <div>
                    {/* Add College row */}
                    <div className="px-6 py-4 flex gap-2">
                      <input
                        type="text"
                        value={newCollegeName}
                        onChange={(e) => setNewCollegeName(e.target.value)}
                        placeholder="New college name..."
                        className="flex-1 h-9 px-3 bg-[#FAFAFF] border border-[#E9E6F8] rounded-xl text-xs font-medium focus:outline-none focus:border-[#6C4EFF]/40"
                      />
                      <button
                        onClick={async () => {
                          if (!newCollegeName.trim()) return;
                          try {
                            await api.post('/colleges', { name: newCollegeName.trim() });
                            setNewCollegeName('');
                            showToast('College added!', 'success');
                            fetchCollegesAndDepartments();
                          } catch (err) {
                            showToast(err.response?.data?.message || 'Failed to add college', 'error');
                          }
                        }}
                        className="h-9 px-4 bg-[#6C4EFF] hover:bg-[#5C3EEF] text-white font-bold text-xs rounded-xl flex items-center gap-1.5 transition-all"
                      >
                        <Plus className="w-4 h-4" /> Add
                      </button>
                    </div>

                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="bg-[#FAFAFF] border-b border-[#E9E6F8] text-xs font-bold text-[#6B7280] uppercase tracking-wider">
                            <th className="px-6 py-4">College Name</th>
                            <th className="px-6 py-4 text-center">Active</th>
                            <th className="px-6 py-4 text-center">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[#E9E6F8] text-sm text-[#111827]">
                          {colleges.length > 0 ? (
                            colleges.map((col) => (
                              <tr key={col._id} className={`transition-colors ${!col.isActive ? 'opacity-50' : ''} hover:bg-[#FAFAFF]/50`}>
                                <td className="px-6 py-4">
                                  {editingCollege === col._id ? (
                                    <div className="flex gap-2">
                                      <input
                                        type="text"
                                        value={editCollegeName}
                                        onChange={(e) => setEditCollegeName(e.target.value)}
                                        className="flex-1 h-8 px-2 bg-[#FAFAFF] border border-[#E9E6F8] rounded-lg text-xs font-medium focus:outline-none focus:border-[#6C4EFF]/40"
                                      />
                                      <button
                                        onClick={async () => {
                                          try {
                                            await api.put(`/colleges/${col._id}`, { name: editCollegeName.trim() });
                                            setEditingCollege(null);
                                            showToast('College renamed!', 'success');
                                            fetchCollegesAndDepartments();
                                          } catch (err) {
                                            showToast(err.response?.data?.message || 'Failed to rename', 'error');
                                          }
                                        }}
                                        className="h-8 px-3 bg-[#6C4EFF] text-white text-xs font-bold rounded-lg"
                                      >
                                        Save
                                      </button>
                                      <button
                                        onClick={() => setEditingCollege(null)}
                                        className="h-8 px-3 bg-slate-100 text-[#6B7280] text-xs font-bold rounded-lg"
                                      >
                                        Cancel
                                      </button>
                                    </div>
                                  ) : (
                                    <p className="font-bold">{col.name}</p>
                                  )}
                                </td>
                                <td className="px-6 py-4 text-center">
                                  <button
                                    onClick={async () => {
                                      try {
                                        await api.put(`/colleges/${col._id}`, { isActive: !col.isActive });
                                        fetchCollegesAndDepartments();
                                        showToast(`College ${col.isActive ? 'deactivated' : 'activated'}`, 'success');
                                      } catch { showToast('Failed to toggle college', 'error'); }
                                    }}
                                    className="mx-auto"
                                  >
                                    {col.isActive ? (
                                      <ToggleRight className="w-6 h-6 text-emerald-500" />
                                    ) : (
                                      <ToggleLeft className="w-6 h-6 text-[#9CA3AF]" />
                                    )}
                                  </button>
                                </td>
                                <td className="px-6 py-4">
                                  <div className="flex gap-2 justify-center">
                                    <button
                                      onClick={() => { setEditingCollege(col._id); setEditCollegeName(col.name); }}
                                      className="w-8 h-8 rounded-full bg-[#F4F1FF] text-[#6C4EFF] hover:bg-[#E9E6F8] flex items-center justify-center transition-colors"
                                      title="Rename"
                                    >
                                      <Edit className="w-4 h-4" />
                                    </button>
                                    <button
                                      onClick={async () => {
                                        if (!window.confirm(`Delete college "${col.name}"?`)) return;
                                        try {
                                          await api.delete(`/colleges/${col._id}`);
                                          showToast('College deleted!', 'success');
                                          fetchCollegesAndDepartments();
                                        } catch (err) {
                                          showToast(err.response?.data?.message || 'Failed to delete college', 'error');
                                        }
                                      }}
                                      className="w-8 h-8 rounded-full bg-rose-50 text-rose-600 hover:bg-rose-100 flex items-center justify-center transition-colors"
                                      title="Delete College"
                                    >
                                      <Trash2 className="w-4 h-4" />
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            ))
                          ) : (
                            <tr>
                              <td colSpan="3" className="px-6 py-12 text-center text-[#6B7280]">
                                No colleges yet. Add one above.
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                ) : (
                  <div>
                    {/* Add Department row */}
                    <div className="px-6 py-4 flex gap-2">
                      <input
                        type="text"
                        value={newDeptName}
                        onChange={(e) => setNewDeptName(e.target.value)}
                        placeholder="New department name..."
                        className="flex-1 h-9 px-3 bg-[#FAFAFF] border border-[#E9E6F8] rounded-xl text-xs font-medium focus:outline-none focus:border-[#6C4EFF]/40"
                      />
                      <button
                        onClick={async () => {
                          if (!newDeptName.trim()) return;
                          try {
                            await api.post('/departments', { name: newDeptName.trim() });
                            setNewDeptName('');
                            showToast('Department added!', 'success');
                            fetchCollegesAndDepartments();
                          } catch (err) {
                            showToast(err.response?.data?.message || 'Failed to add department', 'error');
                          }
                        }}
                        className="h-9 px-4 bg-[#6C4EFF] hover:bg-[#5C3EEF] text-white font-bold text-xs rounded-xl flex items-center gap-1.5 transition-all"
                      >
                        <Plus className="w-4 h-4" /> Add
                      </button>
                    </div>

                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="bg-[#FAFAFF] border-b border-[#E9E6F8] text-xs font-bold text-[#6B7280] uppercase tracking-wider">
                            <th className="px-6 py-4">Department Name</th>
                            <th className="px-6 py-4 text-center">Active</th>
                            <th className="px-6 py-4 text-center">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[#E9E6F8] text-sm text-[#111827]">
                          {departments.length > 0 ? (
                            departments.map((dep) => (
                              <tr key={dep._id} className={`transition-colors ${!dep.isActive ? 'opacity-50' : ''} hover:bg-[#FAFAFF]/50`}>
                                <td className="px-6 py-4">
                                  {editingDept === dep._id ? (
                                    <div className="flex gap-2">
                                      <input
                                        type="text"
                                        value={editDeptName}
                                        onChange={(e) => setEditDeptName(e.target.value)}
                                        className="flex-1 h-8 px-2 bg-[#FAFAFF] border border-[#E9E6F8] rounded-lg text-xs font-medium focus:outline-none focus:border-[#6C4EFF]/40"
                                      />
                                      <button
                                        onClick={async () => {
                                          try {
                                            await api.put(`/departments/${dep._id}`, { name: editDeptName.trim() });
                                            setEditingDept(null);
                                            showToast('Department renamed!', 'success');
                                            fetchCollegesAndDepartments();
                                          } catch (err) {
                                            showToast(err.response?.data?.message || 'Failed to rename', 'error');
                                          }
                                        }}
                                        className="h-8 px-3 bg-[#6C4EFF] text-white text-xs font-bold rounded-lg"
                                      >
                                        Save
                                      </button>
                                      <button
                                        onClick={() => setEditingDept(null)}
                                        className="h-8 px-3 bg-slate-100 text-[#6B7280] text-xs font-bold rounded-lg"
                                      >
                                        Cancel
                                      </button>
                                    </div>
                                  ) : (
                                    <p className="font-bold">{dep.name}</p>
                                  )}
                                </td>
                                <td className="px-6 py-4 text-center">
                                  <button
                                    onClick={async () => {
                                      try {
                                        await api.put(`/departments/${dep._id}`, { isActive: !dep.isActive });
                                        fetchCollegesAndDepartments();
                                        showToast(`Department ${dep.isActive ? 'deactivated' : 'activated'}`, 'success');
                                      } catch { showToast('Failed to toggle department', 'error'); }
                                    }}
                                    className="mx-auto"
                                  >
                                    {dep.isActive ? (
                                      <ToggleRight className="w-6 h-6 text-emerald-500" />
                                    ) : (
                                      <ToggleLeft className="w-6 h-6 text-[#9CA3AF]" />
                                    )}
                                  </button>
                                </td>
                                <td className="px-6 py-4">
                                  <div className="flex gap-2 justify-center">
                                    <button
                                      onClick={() => { setEditingDept(dep._id); setEditDeptName(dep.name); }}
                                      className="w-8 h-8 rounded-full bg-[#F4F1FF] text-[#6C4EFF] hover:bg-[#E9E6F8] flex items-center justify-center transition-colors"
                                      title="Rename"
                                    >
                                      <Edit className="w-4 h-4" />
                                    </button>
                                    <button
                                      onClick={async () => {
                                        if (!window.confirm(`Delete department "${dep.name}"?`)) return;
                                        try {
                                          await api.delete(`/departments/${dep._id}`);
                                          showToast('Department deleted!', 'success');
                                          fetchCollegesAndDepartments();
                                        } catch (err) {
                                          showToast(err.response?.data?.message || 'Failed to delete department', 'error');
                                        }
                                      }}
                                      className="w-8 h-8 rounded-full bg-rose-50 text-rose-600 hover:bg-rose-100 flex items-center justify-center transition-colors"
                                      title="Delete Department"
                                    >
                                      <Trash2 className="w-4 h-4" />
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            ))
                          ) : (
                            <tr>
                              <td colSpan="3" className="px-6 py-12 text-center text-[#6B7280]">
                                No departments yet. Add one above.
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* ID Card / Image Preview Modal Overlay */}
      {previewIdUrl && (
        <div className="admin-modal-overlay">
          <div className="admin-modal-backdrop" onClick={() => setPreviewIdUrl(null)} />
          <div className="admin-preview-modal">
            <div className="admin-preview-header">
              <h3 className="admin-preview-title">{previewTitle}</h3>
              <button
                onClick={() => setPreviewIdUrl(null)}
                className="admin-preview-close-btn"
              >
                <CloseIcon style={{ width: '16px', height: '16px' }} />
              </button>
            </div>
            
            <div className="admin-preview-body">
              <img
                src={previewIdUrl}
                alt="ID Card Front"
                className="admin-preview-img"
              />
            </div>
          </div>
        </div>
      )}

      {/* Gift Product Add/Edit Modal */}
      {showGiftProductModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowGiftProductModal(false)} />
          <div className="relative w-full max-w-[600px] max-h-[90vh] bg-white rounded-3xl overflow-hidden z-10 flex flex-col border border-[#E9E6F8]">
            {/* Modal Header */}
            <div className="flex justify-between items-center border-b border-[#E9E6F8] px-6 py-4">
              <h3 className="font-bold text-sm text-[#111827]">{editingGiftProduct ? 'Edit Product' : 'Add New Product'}</h3>
              <button
                onClick={() => setShowGiftProductModal(false)}
                className="w-8 h-8 rounded-full bg-[#FAFAFF] hover:bg-[#F4F1FF] flex items-center justify-center text-[#6B7280]"
              >
                <CloseIcon className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto px-6 py-4 flex flex-col gap-4">
              {/* Title */}
              <div>
                <label className="text-[11px] font-bold text-[#6B7280] uppercase tracking-wider block mb-1">Title *</label>
                <input type="text" value={giftProductForm.title} onChange={(e) => setGiftProductForm({...giftProductForm, title: e.target.value})} className="w-full h-10 px-3 bg-[#FAFAFF] border border-[#E9E6F8] rounded-xl text-sm focus:outline-none focus:border-[#6C4EFF]/40" placeholder="Product title" />
              </div>

              {/* Description */}
              <div>
                <label className="text-[11px] font-bold text-[#6B7280] uppercase tracking-wider block mb-1">Description *</label>
                <textarea value={giftProductForm.description} onChange={(e) => setGiftProductForm({...giftProductForm, description: e.target.value})} rows={3} className="w-full px-3 py-2 bg-[#FAFAFF] border border-[#E9E6F8] rounded-xl text-sm focus:outline-none focus:border-[#6C4EFF]/40 resize-none" placeholder="Product description" />
              </div>

              {/* Category + Price row */}
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-[11px] font-bold text-[#6B7280] uppercase tracking-wider block mb-1">Category *</label>
                  <select value={giftProductForm.category} onChange={(e) => setGiftProductForm({...giftProductForm, category: e.target.value})} className="w-full h-10 px-3 bg-[#FAFAFF] border border-[#E9E6F8] rounded-xl text-sm focus:outline-none focus:border-[#6C4EFF]/40 cursor-pointer">
                    <option value="">Select category</option>
                    {giftCategories.filter(c => c.isActive).map(c => (
                      <option key={c._id} value={c.name}>{c.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-[11px] font-bold text-[#6B7280] uppercase tracking-wider block mb-1">Selling Price (₹) *</label>
                  <input type="number" min="0" value={giftProductForm.basePrice} onChange={(e) => setGiftProductForm({...giftProductForm, basePrice: e.target.value})} className="w-full h-10 px-3 bg-[#FAFAFF] border border-[#E9E6F8] rounded-xl text-sm focus:outline-none focus:border-[#6C4EFF]/40" placeholder="180" />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-[#6B7280] uppercase tracking-wider block mb-1">MRP / Cross Price (₹)</label>
                  <input type="number" min="0" value={giftProductForm.mrpPrice} onChange={(e) => setGiftProductForm({...giftProductForm, mrpPrice: e.target.value})} className="w-full h-10 px-3 bg-[#FAFAFF] border border-[#E9E6F8] rounded-xl text-sm focus:outline-none focus:border-[#6C4EFF]/40" placeholder="Optional, e.g. 250" />
                </div>
              </div>

              {/* Live discount preview */}
              {giftProductForm.mrpPrice && Number(giftProductForm.mrpPrice) > Number(giftProductForm.basePrice || 0) && (
                <p className="text-xs font-bold text-emerald-600">
                  {Math.round(((Number(giftProductForm.mrpPrice) - Number(giftProductForm.basePrice)) / Number(giftProductForm.mrpPrice)) * 100)}% OFF will be shown to customers
                </p>
              )}
              {giftProductForm.mrpPrice && Number(giftProductForm.mrpPrice) < Number(giftProductForm.basePrice || 0) && (
                <p className="text-xs font-bold text-rose-600">MRP cannot be lower than the selling price.</p>
              )}

              {/* Badge + Featured row */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-bold text-[#6B7280] uppercase tracking-wider block mb-1">Badge</label>
                  <select value={giftProductForm.badge} onChange={(e) => setGiftProductForm({...giftProductForm, badge: e.target.value})} className="w-full h-10 px-3 bg-[#FAFAFF] border border-[#E9E6F8] rounded-xl text-sm focus:outline-none focus:border-[#6C4EFF]/40 cursor-pointer">
                    <option value="">None</option>
                    <option value="BEST SELLER">Best Seller</option>
                    <option value="NEW">New</option>
                    <option value="TRENDING">Trending</option>
                  </select>
                </div>
                <div className="flex items-end pb-1">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={giftProductForm.isFeatured} onChange={(e) => setGiftProductForm({...giftProductForm, isFeatured: e.target.checked})} className="w-4 h-4 accent-[#6C4EFF]" />
                    <span className="text-xs font-bold text-[#111827]">Featured on homepage</span>
                  </label>
                </div>
              </div>

              {/* Features */}
              <div>
                <label className="text-[11px] font-bold text-[#6B7280] uppercase tracking-wider block mb-1">Features</label>
                {giftProductForm.features.map((feat, idx) => (
                  <div key={idx} className="flex gap-2 mb-1.5">
                    <input type="text" value={feat} onChange={(e) => { const f = [...giftProductForm.features]; f[idx] = e.target.value; setGiftProductForm({...giftProductForm, features: f}); }} className="flex-1 h-8 px-3 bg-[#FAFAFF] border border-[#E9E6F8] rounded-lg text-xs focus:outline-none focus:border-[#6C4EFF]/40" placeholder={`Feature ${idx + 1}`} />
                    {giftProductForm.features.length > 1 && (
                      <button onClick={() => { const f = giftProductForm.features.filter((_, i) => i !== idx); setGiftProductForm({...giftProductForm, features: f}); }} className="w-8 h-8 rounded-lg bg-rose-50 text-rose-500 flex items-center justify-center text-xs">×</button>
                    )}
                  </div>
                ))}
                <button onClick={() => setGiftProductForm({...giftProductForm, features: [...giftProductForm.features, '']})} className="text-xs font-bold text-[#6C4EFF] hover:underline mt-1">+ Add feature</button>
              </div>

              {/* Size Options */}
              <div>
                <label className="text-[11px] font-bold text-[#6B7280] uppercase tracking-wider block mb-1">Size Options (optional)</label>
                {giftProductForm.sizeOptions.map((so, idx) => (
                  <div key={idx} className="flex gap-2 mb-1.5">
                    <input type="text" value={so.label} onChange={(e) => { const s = [...giftProductForm.sizeOptions]; s[idx] = {...s[idx], label: e.target.value}; setGiftProductForm({...giftProductForm, sizeOptions: s}); }} className="flex-1 h-8 px-3 bg-[#FAFAFF] border border-[#E9E6F8] rounded-lg text-xs focus:outline-none" placeholder="e.g. 8×12" />
                    <input type="number" value={so.priceModifier} onChange={(e) => { const s = [...giftProductForm.sizeOptions]; s[idx] = {...s[idx], priceModifier: Number(e.target.value)}; setGiftProductForm({...giftProductForm, sizeOptions: s}); }} className="w-24 h-8 px-3 bg-[#FAFAFF] border border-[#E9E6F8] rounded-lg text-xs focus:outline-none" placeholder="+₹ modifier" />
                    <button onClick={() => { const s = giftProductForm.sizeOptions.filter((_, i) => i !== idx); setGiftProductForm({...giftProductForm, sizeOptions: s}); }} className="w-8 h-8 rounded-lg bg-rose-50 text-rose-500 flex items-center justify-center text-xs">×</button>
                  </div>
                ))}
                <button onClick={() => setGiftProductForm({...giftProductForm, sizeOptions: [...giftProductForm.sizeOptions, { label: '', priceModifier: 0 }]})} className="text-xs font-bold text-[#6C4EFF] hover:underline mt-1">+ Add size option</button>
              </div>

              {/* Images / Photos */}
              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <label className="text-[11px] font-bold text-[#6B7280] uppercase tracking-wider block">
                    Product Photos ({giftProductPhotoItems.length}) *
                  </label>
                  <span className="text-[10px] text-[#6C4EFF] font-semibold">
                    First photo is Main Cover
                  </span>
                </div>

                {/* Grid of photo thumbnails */}
                {giftProductPhotoItems.length > 0 && (
                  <div className="grid grid-cols-4 gap-2 mb-3">
                    {giftProductPhotoItems.map((item, idx) => (
                      <div key={item.id} className="relative group rounded-xl overflow-hidden border border-[#E9E6F8] bg-slate-50 aspect-square flex flex-col justify-between">
                        <img src={item.url} alt="" className="w-full h-full object-cover absolute inset-0" />
                        
                        {/* Cover Badge */}
                        {idx === 0 && (
                          <span className="absolute top-1 left-1 bg-[#6C4EFF] text-white text-[9px] font-bold px-1.5 py-0.5 rounded-md shadow-sm z-10">
                            Cover
                          </span>
                        )}

                        {/* Controls Overlay */}
                        <div className="absolute inset-0 bg-black/45 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1 z-20">
                          {idx > 0 && (
                            <button
                              type="button"
                              onClick={() => {
                                setGiftProductPhotoItems(prev => {
                                  const list = [...prev];
                                  const temp = list[idx - 1];
                                  list[idx - 1] = list[idx];
                                  list[idx] = temp;
                                  return list;
                                });
                              }}
                              className="w-6 h-6 rounded-full bg-white/90 hover:bg-white text-gray-800 flex items-center justify-center text-xs font-bold shadow"
                              title="Move left"
                            >
                              ‹
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => {
                              setGiftProductPhotoItems(prev => prev.filter(i => i.id !== item.id));
                            }}
                            className="w-6 h-6 rounded-full bg-rose-500 hover:bg-rose-600 text-white flex items-center justify-center text-xs font-bold shadow"
                            title="Remove photo"
                          >
                            ×
                          </button>
                          {idx < giftProductPhotoItems.length - 1 && (
                            <button
                              type="button"
                              onClick={() => {
                                setGiftProductPhotoItems(prev => {
                                  const list = [...prev];
                                  const temp = list[idx + 1];
                                  list[idx + 1] = list[idx];
                                  list[idx] = temp;
                                  return list;
                                });
                              }}
                              className="w-6 h-6 rounded-full bg-white/90 hover:bg-white text-gray-800 flex items-center justify-center text-xs font-bold shadow"
                              title="Move right"
                            >
                              ›
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Upload Button Box */}
                <label className="flex flex-col items-center justify-center w-full h-24 border-2 border-dashed border-[#E9E6F8] hover:border-[#6C4EFF]/50 rounded-2xl cursor-pointer bg-[#FAFAFF] hover:bg-[#F4F1FF]/30 transition-all text-center p-3">
                  <Upload className="w-5 h-5 text-[#6C4EFF] mb-1" />
                  <span className="text-xs font-bold text-[#111827]">Click to add photo(s)</span>
                  <span className="text-[10px] text-[#6B7280] mt-0.5">Select multiple photos (JPG, PNG, WebP)</span>
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    multiple
                    className="hidden"
                    onChange={(e) => {
                      const files = Array.from(e.target.files);
                      if (!files.length) return;
                      files.forEach((f, index) => {
                        const reader = new FileReader();
                        reader.onload = (ev) => {
                          setGiftProductPhotoItems(prev => [
                            ...prev,
                            {
                              id: `new-${Date.now()}-${Math.random().toString(36).substring(2, 9)}-${index}`,
                              type: 'new',
                              url: ev.target.result,
                              file: f
                            }
                          ]);
                        };
                        reader.readAsDataURL(f);
                      });
                      e.target.value = '';
                    }}
                  />
                </label>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex gap-3 border-t border-[#E9E6F8] px-6 py-4">
              <button
                onClick={() => setShowGiftProductModal(false)}
                className="flex-1 h-10 border border-[#E9E6F8] text-[#6B7280] font-bold text-xs rounded-xl"
              >
                Cancel
              </button>
              <button
                onClick={async () => {
                  try {
                    if (!giftProductForm.title.trim()) {
                      showToast('Please enter a product title', 'error');
                      return;
                    }
                    if (!giftProductForm.description.trim()) {
                      showToast('Please enter a product description', 'error');
                      return;
                    }
                    if (!giftProductForm.category.trim()) {
                      showToast('Please select a product category', 'error');
                      return;
                    }
                    if (!giftProductForm.basePrice || isNaN(Number(giftProductForm.basePrice)) || Number(giftProductForm.basePrice) <= 0) {
                      showToast('Please enter a valid selling price', 'error');
                      return;
                    }
                    if (giftProductForm.mrpPrice && Number(giftProductForm.mrpPrice) < Number(giftProductForm.basePrice)) {
                      showToast('MRP cannot be lower than the selling price', 'error');
                      return;
                    }

                    if (!giftProductPhotoItems || giftProductPhotoItems.length === 0) {
                      showToast('Please add at least one product photo', 'error');
                      return;
                    }

                    const existingUrls = giftProductPhotoItems
                      .filter(item => item.type === 'existing')
                      .map(item => item.url);

                    const newFileItems = giftProductPhotoItems
                      .filter(item => item.type === 'new' && item.file);

                    // --- Direct-to-Cloudinary upload flow (bypasses Vercel 4.5MB limit) ---
                    let useDirectUpload = false;
                    let signData = null;

                    if (newFileItems.length > 0) {
                      try {
                        const signRes = await api.get('/gift/cloudinary-sign');
                        signData = signRes.data;
                        if (!signData.useFallback) {
                          useDirectUpload = true;
                        }
                      } catch (signErr) {
                        console.warn('Cloudinary sign request failed, falling back to server upload:', signErr);
                        // Fall through to multer fallback
                      }
                    }

                    if (useDirectUpload && newFileItems.length > 0) {
                      // Production path: upload each image directly to Cloudinary from the browser
                      const newImageUrls = [];
                      for (let i = 0; i < newFileItems.length; i++) {
                        const item = newFileItems[i];
                        showToast(`Uploading image ${i + 1} of ${newFileItems.length}...`, 'info');

                        const cloudFormData = new FormData();
                        cloudFormData.append('file', item.file);
                        cloudFormData.append('api_key', signData.apiKey);
                        cloudFormData.append('timestamp', signData.timestamp);
                        cloudFormData.append('signature', signData.signature);
                        cloudFormData.append('folder', signData.folder);

                        try {
                          const cloudRes = await fetch(signData.uploadUrl, {
                            method: 'POST',
                            body: cloudFormData
                          });

                          if (!cloudRes.ok) {
                            const errBody = await cloudRes.json().catch(() => ({}));
                            throw new Error(errBody.error?.message || `HTTP ${cloudRes.status}`);
                          }

                          const cloudResult = await cloudRes.json();
                          newImageUrls.push(cloudResult.secure_url);
                        } catch (uploadErr) {
                          showToast(`Failed to upload "${item.file.name}": ${uploadErr.message}`, 'error');
                          return; // Abort — don't save a product with missing images
                        }
                      }

                      // Send JSON-only payload (no raw image bytes reach Vercel)
                      const payload = {
                        title: giftProductForm.title.trim(),
                        description: giftProductForm.description.trim(),
                        category: giftProductForm.category.trim(),
                        basePrice: giftProductForm.basePrice,
                        mrpPrice: giftProductForm.mrpPrice || '',
                        badge: giftProductForm.badge || '',
                        isFeatured: giftProductForm.isFeatured,
                        features: giftProductForm.features.filter(f => f.trim()),
                        sizeOptions: giftProductForm.sizeOptions.filter(s => s.label.trim()),
                        existingImages: existingUrls,
                        newImages: newImageUrls
                      };

                      if (editingGiftProduct) {
                        await api.put(`/gift/products/${editingGiftProduct._id}`, payload);
                        showToast('Product updated successfully!', 'success');
                      } else {
                        await api.post('/gift/products', payload);
                        showToast('Product created successfully!', 'success');
                      }
                    } else {
                      // Fallback path: local dev without Cloudinary — use FormData + multer
                      const formData = new FormData();
                      formData.append('title', giftProductForm.title.trim());
                      formData.append('description', giftProductForm.description.trim());
                      formData.append('category', giftProductForm.category.trim());
                      formData.append('basePrice', giftProductForm.basePrice);
                      formData.append('mrpPrice', giftProductForm.mrpPrice || '');
                      formData.append('badge', giftProductForm.badge || '');
                      formData.append('isFeatured', giftProductForm.isFeatured);
                      formData.append('features', JSON.stringify(giftProductForm.features.filter(f => f.trim())));
                      formData.append('sizeOptions', JSON.stringify(giftProductForm.sizeOptions.filter(s => s.label.trim())));
                      formData.append('existingImages', JSON.stringify(existingUrls));

                      newFileItems.forEach(item => formData.append('images', item.file));

                      if (editingGiftProduct) {
                        await api.put(`/gift/products/${editingGiftProduct._id}`, formData, { headers: { 'Content-Type': 'multipart/form-data' } });
                        showToast('Product updated successfully!', 'success');
                      } else {
                        await api.post('/gift/products', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
                        showToast('Product created successfully!', 'success');
                      }
                    }

                    setShowGiftProductModal(false);
                    fetchGiftData();
                  } catch (err) {
                    console.error('Save gift product error:', err);
                    const errMsg = err.response?.data?.message || err.response?.data?.error || err.message || 'Failed to save product';
                    showToast(errMsg, 'error');
                  }
                }}
                className="flex-1 h-10 bg-[#6C4EFF] hover:bg-[#5C3EEF] text-white font-bold text-xs rounded-xl transition-all"
              >
                {editingGiftProduct ? 'Save Changes' : 'Create Product'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
