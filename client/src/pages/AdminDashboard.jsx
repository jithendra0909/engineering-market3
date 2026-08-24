import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ShieldCheck, ShieldAlert, Users, Grid, Eye, Trash2, Check, X as CloseIcon, AlertTriangle, MessageSquare, FileText } from 'lucide-react';
import api from '../api/axios';
import './AdminDashboard.css';

export const AdminDashboard = () => {
  const { showToast } = useAuth();
  const navigate = useNavigate();
  
  // Tab states
  const [activeTab, setActiveTab] = useState('pending'); // pending, listings, students, reported
  const [subStatus, setSubStatus] = useState('approved'); // approved, rejected (for students tab)
  const [modSubTab, setModSubTab] = useState('listings'); // listings, chats (for moderation log)
  
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

  useEffect(() => {
    fetchData();
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
                      <th>ID Card</th>
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
                               {st.year === '1st Year' ? (
                                 <span className="admin-cell-year-badge" title="First year students don't have ID cards yet. Fee receipt or Allotment letter is accepted.">
                                   {st.year} (Receipt Allowed)
                                 </span>
                               ) : (
                                 <span className="admin-cell-year-text">{st.year}</span>
                               )}
                             </div>
                          </td>
                          <td>
                            {st.idCardImageUrl ? (
                              <div
                                onClick={() => { setPreviewIdUrl(st.idCardImageUrl); setPreviewTitle(`${st.fullName} ID Card Preview`); }}
                                className="admin-id-thumb"
                                title="Click to view ID card"
                              >
                                <img src={st.idCardImageUrl} alt="ID Card" />
                              </div>
                            ) : (
                              <span className="admin-no-image">No Image</span>
                            )}
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
                        <th>ID Card</th>
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
                               {st.year === '1st Year' ? (
                                 <span className="admin-cell-year-badge" title="First year students don't have ID cards yet. Fee receipt or Allotment letter is accepted.">
                                   {st.year} (Receipt Allowed)
                                 </span>
                               ) : (
                                 <span className="admin-cell-year-text">{st.year}</span>
                               )}
                             </div>
                            </td>
                            <td>
                              {st.idCardImageUrl ? (
                                <div
                                  onClick={() => { setPreviewIdUrl(st.idCardImageUrl); setPreviewTitle(`${st.fullName} ID Card Preview`); }}
                                  className="admin-id-thumb"
                                  title="Click to view ID card"
                                >
                                  <img src={st.idCardImageUrl} alt="ID Card" />
                                </div>
                              ) : (
                                <span className="admin-no-image">No Image</span>
                              )}
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
          </div>
        )}
      </div>

      {/* ID Card Image Preview Modal Overlay */}
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
    </div>
  );
};

export default AdminDashboard;
