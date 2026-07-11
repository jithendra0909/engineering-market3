import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { ShieldCheck, ShieldAlert, Users, Grid, Eye, Trash2, Check, X as CloseIcon, AlertTriangle, MessageSquare } from 'lucide-react';
import api from '../api/axios';

export const AdminDashboard = () => {
  const { showToast } = useAuth();
  
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
    <div className="max-w-[1360px] mx-auto px-5 lg:px-8 pt-5 lg:pt-8 pb-28 lg:pb-12 flex flex-col gap-8 text-left">
      {/* Title */}
      <div className="flex justify-between items-center border-b border-[#E9E6F8] pb-5">
        <div>
          <h1 className="text-2xl font-black text-[#111827] flex items-center gap-2">
            <ShieldCheck className="w-7 h-7 text-rose-500" />
            Admin Dashboard
          </h1>
          <p className="text-xs text-[#6B7280] mt-1 font-medium">Verify students and manage marketplace listings</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Active Users */}
        <div className="bg-gradient-to-br from-emerald-50/50 to-white/40 backdrop-blur-md border border-emerald-100/60 p-5 rounded-[24px] flex items-start gap-4 shadow-[0_8px_30px_rgb(0,0,0,0.02)] transition-all hover:scale-[1.01]">
          <div className="w-10 h-10 rounded-xl bg-white border border-emerald-50 flex items-center justify-center text-emerald-600 shadow-sm flex-shrink-0">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <p className="text-2xl font-black text-[#111827]">{approvedCount}</p>
            <p className="text-[10px] font-bold text-[#6B7280] uppercase tracking-wider mt-0.5">Active Users</p>
          </div>
        </div>

        {/* Total Listings */}
        <div className="bg-gradient-to-br from-[#F7F4FF]/70 to-white/40 backdrop-blur-md border border-[#E9E6F8]/60 p-5 rounded-[24px] flex items-start gap-4 shadow-[0_8px_30px_rgb(0,0,0,0.02)] transition-all hover:scale-[1.01]">
          <div className="w-10 h-10 rounded-xl bg-white border border-[#E9E6F8]/50 flex items-center justify-center text-[#6C4EFF] shadow-sm flex-shrink-0">
            <Grid className="w-5 h-5" />
          </div>
          <div>
            <p className="text-2xl font-black text-[#111827]">{totalListings}</p>
            <p className="text-[10px] font-bold text-[#6B7280] uppercase tracking-wider mt-0.5">Total Listings</p>
          </div>
        </div>

        {/* Pending Approvals */}
        <div className="bg-gradient-to-br from-amber-50/60 to-white/40 backdrop-blur-md border border-amber-100/60 p-5 rounded-[24px] flex items-start gap-4 shadow-[0_8px_30px_rgb(0,0,0,0.02)] transition-all hover:scale-[1.01]">
          <div className="w-10 h-10 rounded-xl bg-white border border-amber-50 flex items-center justify-center text-amber-600 shadow-sm flex-shrink-0">
            <ShieldAlert className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <p className="text-2xl font-black text-[#111827]">{pendingCount}</p>
            <p className="text-[10px] font-bold text-[#6B7280] uppercase tracking-wider mt-0.5">Pending Approvals</p>
          </div>
        </div>

        {/* Reported Issues */}
        <div className="bg-gradient-to-br from-rose-50/50 to-white/40 backdrop-blur-md border border-rose-100/60 p-5 rounded-[24px] flex items-start gap-4 shadow-[0_8px_30px_rgb(0,0,0,0.02)] transition-all hover:scale-[1.01]">
          <div className="w-10 h-10 rounded-xl bg-white border border-rose-50 flex items-center justify-center text-rose-600 shadow-sm flex-shrink-0">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <p className="text-2xl font-black text-[#111827]">{listings.filter(l => l.reports && l.reports.length > 0).length + reportedChats.length}</p>
            <p className="text-[10px] font-bold text-[#6B7280] uppercase tracking-wider mt-0.5">Reported Issues</p>
          </div>
        </div>
      </div>

      {/* Tabs Header */}
      <div className="flex flex-col gap-6">
        <div className="bg-[#F4F1FF]/30 border border-[#E9E6F8] p-1.5 rounded-2xl flex flex-wrap gap-2 text-xs font-bold w-fit shadow-[0_2px_8px_rgba(108,78,255,0.02)] backdrop-blur-md">
          <button
            onClick={() => setActiveTab('pending')}
            className={`px-4 py-2.5 rounded-xl transition-all duration-200 flex items-center gap-2 ${
              activeTab === 'pending'
                ? 'bg-white text-[#6C4EFF] shadow-sm border border-[#E9E6F8]'
                : 'text-[#6B7280] hover:text-[#111827] border border-transparent'
            }`}
          >
            <ShieldAlert className="w-4 h-4" /> Pending Approvals ({pendingCount})
          </button>
          
          <button
            onClick={() => setActiveTab('students')}
            className={`px-4 py-2.5 rounded-xl transition-all duration-200 flex items-center gap-2 ${
              activeTab === 'students'
                ? 'bg-white text-[#6C4EFF] shadow-sm border border-[#E9E6F8]'
                : 'text-[#6B7280] hover:text-[#111827] border border-transparent'
            }`}
          >
            <Users className="w-4 h-4" /> All Students
          </button>

          <button
            onClick={() => setActiveTab('listings')}
            className={`px-4 py-2.5 rounded-xl transition-all duration-200 flex items-center gap-2 ${
              activeTab === 'listings'
                ? 'bg-white text-[#6C4EFF] shadow-sm border border-[#E9E6F8]'
                : 'text-[#6B7280] hover:text-[#111827] border border-transparent'
            }`}
          >
            <Grid className="w-4 h-4" /> Marketplace Listings ({totalListings})
          </button>

          <button
            onClick={() => setActiveTab('reported')}
            className={`px-4 py-2.5 rounded-xl transition-all duration-200 flex items-center gap-2 ${
              activeTab === 'reported'
                ? 'bg-white text-rose-600 shadow-sm border border-rose-100'
                : 'text-[#6B7280] hover:text-[#111827] border border-transparent'
            }`}
          >
            <AlertTriangle className={`w-4 h-4 ${(listings.filter(l => l.reports && l.reports.length > 0).length > 0 || reportedChats.length > 0) ? 'text-rose-500 animate-pulse' : ''}`} /> Moderation Log ({listings.filter(l => l.reports && l.reports.length > 0).length + reportedChats.length})
          </button>

          <button
            onClick={() => setActiveTab('feedback')}
            className={`px-4 py-2.5 rounded-xl transition-all duration-200 flex items-center gap-2 ${
              activeTab === 'feedback'
                ? 'bg-white text-indigo-600 shadow-sm border border-indigo-100'
                : 'text-[#6B7280] hover:text-[#111827] border border-transparent'
            }`}
          >
            <MessageSquare className="w-4 h-4" /> Feedback Logs ({feedbackList.length})
          </button>
        </div>

        {/* Tab content panel */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-10 h-10 border-4 border-[#6C4EFF] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <div className="bg-white border border-[#E9E6F8] rounded-[24px] overflow-hidden shadow-sm animate-fadeIn">
            {activeTab === 'pending' && (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-[#FAFAFF] border-b border-[#E9E6F8] text-xs font-bold text-[#6B7280] uppercase tracking-wider">
                      <th className="px-6 py-4">Student Name</th>
                      <th className="px-6 py-4">Reg Number</th>
                      <th className="px-6 py-4">Department / Year</th>
                      <th className="px-6 py-4">ID Card</th>
                      <th className="px-6 py-4 text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E9E6F8] text-sm text-[#111827]">
                    {users.filter(u => u.verificationStatus === 'pending').length > 0 ? (
                      users.filter(u => u.verificationStatus === 'pending').map((st) => (
                        <tr key={st._id} className="hover:bg-[#FAFAFF]/50 transition-colors">
                          <td className="px-6 py-4">
                            <p className="font-bold">{st.fullName}</p>
                            <p className="text-xs text-[#6B7280] mt-0.5">{st.email}</p>
                          </td>
                          <td className="px-6 py-4 font-mono text-xs">{st.registrationNumber}</td>
                          <td className="px-6 py-4 font-medium text-xs">
                            {st.department} • {st.year}
                          </td>
                          <td className="px-6 py-4">
                            {st.idCardImageUrl ? (
                              <div
                                onClick={() => { setPreviewIdUrl(st.idCardImageUrl); setPreviewTitle(`${st.fullName} ID Card Preview`); }}
                                className="w-12 h-12 rounded-lg bg-slate-100 border border-[#E9E6F8] overflow-hidden flex-shrink-0 flex items-center justify-center cursor-pointer hover:opacity-85 transition-opacity"
                                title="Click to view ID card"
                              >
                                <img src={st.idCardImageUrl} alt="ID Card" className="w-full h-full object-cover" />
                              </div>
                            ) : (
                              <span className="text-xs text-gray-400 font-medium">No Image</span>
                            )}
                          </td>
                          <td className="px-6 py-4 text-center">
                            <div className="inline-flex gap-2">
                              <button
                                onClick={() => handleApprove(st._id)}
                                disabled={actionLoading}
                                className="w-8 h-8 rounded-full bg-emerald-50 text-emerald-600 hover:bg-emerald-100 flex items-center justify-center transition-colors active:scale-90"
                                title="Approve Student"
                              >
                                <Check className="w-4 h-4 stroke-[2.5]" />
                              </button>
                              
                              <button
                                onClick={() => handleReject(st._id)}
                                disabled={actionLoading}
                                className="w-8 h-8 rounded-full bg-rose-50 text-rose-600 hover:bg-rose-100 flex items-center justify-center transition-colors active:scale-90"
                                title="Reject Student"
                              >
                                <CloseIcon className="w-4 h-4 stroke-[2.5]" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="5" className="px-6 py-12 text-center text-[#6B7280]">
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
                {/* Sub status header tabs */}
                <div className="flex border-b border-[#E9E6F8] bg-[#FAFAFF] px-6 py-3 gap-4 text-xs font-bold">
                  <button
                    onClick={() => setSubStatus('approved')}
                    className={`px-3 py-1.5 rounded-full transition-all ${
                      subStatus === 'approved' ? 'bg-[#111827] text-white' : 'text-[#6B7280] hover:bg-slate-200/50'
                    }`}
                  >
                    Approved Verified Students ({approvedCount})
                  </button>
                  <button
                    onClick={() => setSubStatus('rejected')}
                    className={`px-3 py-1.5 rounded-full transition-all ${
                      subStatus === 'rejected' ? 'bg-[#111827] text-white' : 'text-[#6B7280] hover:bg-slate-200/50'
                    }`}
                  >
                    Rejected Students ({rejectedCount})
                  </button>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-[#E9E6F8] text-xs font-bold text-[#6B7280] uppercase tracking-wider">
                        <th className="px-6 py-4">Student Name</th>
                        <th className="px-6 py-4">Reg Number</th>
                        <th className="px-6 py-4">Department / Year</th>
                        <th className="px-6 py-4">ID Card</th>
                        <th className="px-6 py-4 text-center">Status Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#E9E6F8] text-sm text-[#111827]">
                      {users.filter(u => u.verificationStatus === subStatus).length > 0 ? (
                        users.filter(u => u.verificationStatus === subStatus).map((st) => (
                          <tr key={st._id} className="hover:bg-[#FAFAFF]/50 transition-colors">
                            <td className="px-6 py-4">
                              <p className="font-bold">{st.fullName}</p>
                              <p className="text-xs text-[#6B7280] mt-0.5">{st.email}</p>
                            </td>
                            <td className="px-6 py-4 font-mono text-xs">{st.registrationNumber}</td>
                            <td className="px-6 py-4 font-medium text-xs">
                              {st.department} • {st.year}
                            </td>
                            <td className="px-6 py-4">
                              {st.idCardImageUrl ? (
                                <div
                                  onClick={() => { setPreviewIdUrl(st.idCardImageUrl); setPreviewTitle(`${st.fullName} ID Card Preview`); }}
                                  className="w-12 h-12 rounded-lg bg-slate-100 border border-[#E9E6F8] overflow-hidden flex-shrink-0 flex items-center justify-center cursor-pointer hover:opacity-85 transition-opacity"
                                  title="Click to view ID card"
                                >
                                  <img src={st.idCardImageUrl} alt="ID Card" className="w-full h-full object-cover" />
                                </div>
                              ) : (
                                <span className="text-xs text-gray-400 font-medium">No Image</span>
                              )}
                            </td>
                            <td className="px-6 py-4 text-center">
                              {subStatus === 'approved' ? (
                                <button
                                  onClick={() => handleReject(st._id)}
                                  disabled={actionLoading}
                                  className="text-xs font-bold text-rose-600 bg-rose-50 hover:bg-rose-100 border border-rose-200/50 px-3 py-1.5 rounded-full"
                                >
                                  Reject / Block
                                </button>
                              ) : (
                                <button
                                  onClick={() => handleApprove(st._id)}
                                  disabled={actionLoading}
                                  className="text-xs font-bold text-emerald-600 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200/50 px-3 py-1.5 rounded-full"
                                >
                                  Approve / Unblock
                                </button>
                              )}
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="5" className="px-6 py-12 text-center text-[#6B7280]">
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
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-[#FAFAFF] border-b border-[#E9E6F8] text-xs font-bold text-[#6B7280] uppercase tracking-wider">
                      <th className="px-6 py-4">Product Info</th>
                      <th className="px-6 py-4">Seller details</th>
                      <th className="px-6 py-4">Market / Type</th>
                      <th className="px-6 py-4">Price</th>
                      <th className="px-6 py-4 text-center">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E9E6F8] text-sm text-[#111827]">
                    {listings.length > 0 ? (
                      listings.map((lst) => (
                        <tr key={lst._id} className={`transition-colors ${lst.reports && lst.reports.length > 0 ? 'bg-rose-50/30 hover:bg-rose-50/50' : 'hover:bg-[#FAFAFF]/50'}`}>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              {lst.images && lst.images.length > 0 ? (
                                <div
                                  onClick={() => { setPreviewIdUrl(lst.images[0]); setPreviewTitle('Listing Image Preview'); }}
                                  className="w-12 h-12 rounded-lg bg-slate-100 border border-[#E9E6F8] overflow-hidden flex-shrink-0 flex items-center justify-center cursor-pointer hover:opacity-85 transition-opacity"
                                  title="Click to preview image"
                                >
                                  <img
                                    src={lst.images[0]}
                                    alt=""
                                    className="w-full h-full object-cover"
                                  />
                                </div>
                              ) : (
                                <div className="w-12 h-12 rounded-lg bg-slate-50 border border-[#E9E6F8] flex items-center justify-center text-xs text-gray-400 flex-shrink-0">
                                  No Img
                                </div>
                              )}
                              <div>
                                <div className="flex items-center gap-2">
                                  <p className="font-bold text-[#111827]">{lst.title}</p>
                                  {lst.reports && lst.reports.length > 0 && (
                                    <span className="inline-flex items-center gap-0.5 text-[9px] font-extrabold text-rose-600 bg-rose-50 border border-rose-100 px-2 py-0.5 rounded-full uppercase tracking-wider animate-pulse">
                                      <AlertTriangle className="w-2.5 h-2.5" /> Flagged
                                    </span>
                                  )}
                                </div>
                                <p className="text-xs text-[#6B7280] mt-0.5 truncate max-w-[200px]">
                                  {lst.description}
                                </p>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-xs font-medium">
                            <p className="font-bold">{lst.seller?.fullName || 'Anonymous'}</p>
                            <p className="text-[#6B7280] mt-0.5">{lst.sellerCollege}</p>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex flex-col gap-1 items-start">
                              <span className="bg-indigo-50 border border-[#E9E6F8] text-[#6C4EFF] text-[9px] font-bold px-2 py-0.5 rounded-full uppercase">
                                {lst.marketType}
                              </span>
                              <span className="bg-slate-100 text-slate-700 text-[9px] font-bold px-2 py-0.5 rounded-full uppercase">
                                {lst.listingType}
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4 font-black">
                            {lst.listingType === 'donate' ? 'Free' : `₹${lst.price}`}
                          </td>
                          <td className="px-6 py-4 text-center">
                            <button
                              onClick={() => handleDeleteListing(lst._id)}
                              disabled={actionLoading}
                              className="w-8 h-8 rounded-full bg-rose-50 text-rose-600 hover:bg-rose-100 flex items-center justify-center transition-colors"
                              title="Delete Listing"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="5" className="px-6 py-12 text-center text-[#6B7280]">
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
                {/* Sub status header tabs for Moderation */}
                <div className="flex border-b border-[#E9E6F8] bg-[#FAFAFF] px-6 py-3 gap-4 text-xs font-bold">
                  <button
                    onClick={() => setModSubTab('listings')}
                    className={`px-3 py-1.5 rounded-full transition-all ${
                      modSubTab === 'listings' ? 'bg-[#111827] text-white' : 'text-[#6B7280] hover:bg-slate-200/50'
                    }`}
                  >
                    Reported Listings ({listings.filter(l => l.reports && l.reports.length > 0).length})
                  </button>
                  <button
                    onClick={() => setModSubTab('chats')}
                    className={`px-3 py-1.5 rounded-full transition-all ${
                      modSubTab === 'chats' ? 'bg-[#111827] text-white' : 'text-[#6B7280] hover:bg-slate-200/50'
                    }`}
                  >
                    Reported Chats ({reportedChats.length})
                  </button>
                </div>

                {modSubTab === 'listings' ? (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-[#FAFAFF] border-b border-[#E9E6F8] text-xs font-bold text-[#6B7280] uppercase tracking-wider">
                          <th className="px-6 py-4">Product Info</th>
                          <th className="px-6 py-4">Seller Details</th>
                          <th className="px-6 py-4">Reports & Reasons</th>
                          <th className="px-6 py-4">Status / Price</th>
                          <th className="px-6 py-4 text-center">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#E9E6F8] text-sm text-[#111827]">
                        {listings.filter(l => l.reports && l.reports.length > 0).length > 0 ? (
                          listings.filter(l => l.reports && l.reports.length > 0).map((lst) => (
                            <tr key={lst._id} className="hover:bg-[#FAFAFF]/50 transition-colors">
                              <td className="px-6 py-4">
                                <div className="flex items-center gap-3">
                                  {lst.images && lst.images.length > 0 ? (
                                    <div
                                      onClick={() => { setPreviewIdUrl(lst.images[0]); setPreviewTitle('Listing Image Preview'); }}
                                      className="w-12 h-12 rounded-lg bg-slate-100 border border-[#E9E6F8] overflow-hidden flex-shrink-0 flex items-center justify-center cursor-pointer hover:opacity-85 transition-opacity"
                                      title="Click to preview image"
                                    >
                                      <img
                                        src={lst.images[0]}
                                        alt=""
                                        className="w-full h-full object-cover"
                                      />
                                    </div>
                                  ) : (
                                    <div className="w-12 h-12 rounded-lg bg-slate-50 border border-[#E9E6F8] flex items-center justify-center text-xs text-gray-400 flex-shrink-0">
                                      No Img
                                    </div>
                                  )}
                                  <div>
                                    <p className="font-bold text-[#111827]">{lst.title}</p>
                                    <p className="text-xs text-[#6B7280] mt-0.5 truncate max-w-[200px]">
                                      {lst.description}
                                    </p>
                                  </div>
                                </div>
                              </td>
                              <td className="px-6 py-4 text-xs font-medium">
                                <p className="font-bold">{lst.seller?.fullName || 'Anonymous'}</p>
                                <p className="text-[#6B7280] mt-0.5">{lst.sellerCollege}</p>
                              </td>
                              <td className="px-6 py-4 text-xs">
                                <div className="flex flex-col gap-1.5 max-w-[320px]">
                                  <span className="inline-flex items-center gap-1 font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-md w-fit">
                                    <AlertTriangle className="w-3.5 h-3.5 animate-pulse" /> {lst.reports.length} report(s)
                                  </span>
                                  <div className="flex flex-col gap-1 font-medium text-[#6B7280] pl-1 border-l-2 border-[#E9E6F8]">
                                    {lst.reports.map((r, i) => (
                                      <p key={i} className="text-[11px] leading-tight">
                                        • <span className="font-bold text-[#111827]">{r.reporter?.fullName || 'Student'}:</span> {r.reason}
                                      </p>
                                    ))}
                                  </div>
                                </div>
                              </td>
                              <td className="px-6 py-4 font-black">
                                <div className="flex flex-col gap-1">
                                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full w-fit uppercase ${
                                    lst.status === 'removed' ? 'bg-rose-50 text-rose-600 border border-rose-200' : 'bg-amber-50 text-amber-600 border border-amber-200'
                                  }`}>
                                    {lst.status === 'removed' ? 'Auto-Hidden' : lst.status}
                                  </span>
                                  <span>{lst.listingType === 'donate' ? 'Free' : `₹${lst.price}`}</span>
                                </div>
                              </td>
                              <td className="px-6 py-4">
                                <div className="flex gap-2 justify-center">
                                  <button
                                    onClick={() => handleDismissReports(lst._id)}
                                    disabled={actionLoading}
                                    className="w-8 h-8 rounded-full bg-emerald-50 text-emerald-600 hover:bg-emerald-100 flex items-center justify-center transition-colors"
                                    title="Dismiss Reports & Restore"
                                  >
                                    <Check className="w-4 h-4" />
                                  </button>
                                  <button
                                    onClick={() => handleDeleteListing(lst._id)}
                                    disabled={actionLoading}
                                    className="w-8 h-8 rounded-full bg-rose-50 text-rose-600 hover:bg-rose-100 flex items-center justify-center transition-colors"
                                    title="Delete Listing Permanently"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan="5" className="px-6 py-12 text-center text-[#6B7280]">
                              No reported listings found.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-[#FAFAFF] border-b border-[#E9E6F8] text-xs font-bold text-[#6B7280] uppercase tracking-wider">
                          <th className="px-6 py-4">Chat Context</th>
                          <th className="px-6 py-4">Buyer (Reporter)</th>
                          <th className="px-6 py-4">Seller (Recipient)</th>
                          <th className="px-6 py-4">Report Reason(s)</th>
                          <th className="px-6 py-4 text-center">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#E9E6F8] text-sm text-[#111827]">
                        {reportedChats.length > 0 ? (
                          reportedChats.map((chat) => (
                            <tr key={chat._id} className="hover:bg-[#FAFAFF]/50 transition-colors">
                              <td className="px-6 py-4">
                                <div className="flex flex-col gap-1">
                                  <span className="font-bold text-[#111827]">{chat.listing?.title || 'General Chat'}</span>
                                  {chat.listing?.price !== undefined && (
                                    <span className="text-xs text-emerald-600 font-extrabold">
                                      {chat.listing.price === 0 ? 'Free/Donate' : `₹${chat.listing.price}`}
                                    </span>
                                  )}
                                </div>
                              </td>
                              <td className="px-6 py-4 text-xs font-medium">
                                <p className="font-bold">{chat.buyer?.fullName || 'Anonymous'}</p>
                                <p className="text-[#6B7280] mt-0.5">{chat.buyer?.email}</p>
                                {chat.buyer && chat.buyer.verificationStatus !== 'rejected' && (
                                  <button
                                    onClick={() => handleReject(chat.buyer._id)}
                                    disabled={actionLoading}
                                    className="text-[10px] font-bold text-rose-500 hover:underline mt-1.5 block text-left"
                                  >
                                    Reject / Block Buyer
                                  </button>
                                )}
                              </td>
                              <td className="px-6 py-4 text-xs font-medium">
                                <p className="font-bold">{chat.seller?.fullName || 'Anonymous'}</p>
                                <p className="text-[#6B7280] mt-0.5">{chat.seller?.email}</p>
                                {chat.seller && chat.seller.verificationStatus !== 'rejected' && (
                                  <button
                                    onClick={() => handleReject(chat.seller._id)}
                                    disabled={actionLoading}
                                    className="text-[10px] font-bold text-rose-500 hover:underline mt-1.5 block text-left"
                                  >
                                    Reject / Block Seller
                                  </button>
                                )}
                              </td>
                              <td className="px-6 py-4 text-xs">
                                <div className="flex flex-col gap-1.5 max-w-[320px]">
                                  <span className="inline-flex items-center gap-1 font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-md w-fit">
                                    <AlertTriangle className="w-3.5 h-3.5 animate-pulse" /> {chat.reports.length} report(s)
                                  </span>
                                  <div className="flex flex-col gap-1 font-medium text-[#6B7280] pl-1 border-l-2 border-[#E9E6F8]">
                                    {chat.reports.map((r, i) => (
                                      <p key={i} className="text-[11px] leading-tight">
                                        • <span className="font-bold text-[#111827]">{r.reporter?.fullName || 'Student'}:</span> {r.reason}
                                      </p>
                                    ))}
                                  </div>
                                </div>
                              </td>
                              <td className="px-6 py-4">
                                <div className="flex gap-2 justify-center">
                                  <button
                                    onClick={() => handleDismissChatReports(chat._id)}
                                    disabled={actionLoading}
                                    className="w-8 h-8 rounded-full bg-[#E8F8F0] text-emerald-600 hover:bg-[#D1F2DF] flex items-center justify-center transition-colors"
                                    title="Dismiss Chat Reports"
                                  >
                                    <Check className="w-4 h-4 stroke-[2.5]" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan="5" className="px-6 py-12 text-center text-[#6B7280]">
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
              <div className="overflow-x-auto text-left animate-fadeIn">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-[#FAFAFF] border-b border-[#E9E6F8] text-xs font-bold text-[#6B7280] uppercase tracking-wider">
                      <th className="px-6 py-4">Student</th>
                      <th className="px-6 py-4">Feedback / Issue</th>
                      <th className="px-6 py-4">Category</th>
                      <th className="px-6 py-4">Votes</th>
                      <th className="px-6 py-4">Status</th>
                      <th className="px-6 py-4 text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E9E6F8] text-sm text-[#111827]">
                    {feedbackList.length > 0 ? (
                      feedbackList.map((item) => (
                        <tr key={item._id} className="hover:bg-[#FAFAFF]/50 transition-colors">
                          <td className="px-6 py-4">
                            <p className="font-bold text-xs">{item.user?.fullName || 'Student'}</p>
                            <p className="text-[10px] text-gray-400">{item.user?.department} • {item.user?.year} yr</p>
                          </td>
                          <td className="px-6 py-4 max-w-[280px]">
                            <p className="font-bold text-xs text-[#111827]">{item.title}</p>
                            <p className="text-[11px] text-[#6B7280] mt-0.5 leading-relaxed break-words">{item.description}</p>
                          </td>
                          <td className="px-6 py-4">
                            <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full uppercase border ${
                              item.category === 'feature'
                                ? 'bg-indigo-50 border-indigo-100 text-indigo-600'
                                : item.category === 'bug'
                                ? 'bg-rose-50 border-rose-100 text-rose-600'
                                : 'bg-slate-50 border-slate-100 text-slate-600'
                            }`}>
                              {item.category}
                            </span>
                          </td>
                          <td className="px-6 py-4 font-bold text-xs">
                            ⭐ {item.upvotes?.length || 0} upvotes
                          </td>
                          <td className="px-6 py-4">
                            <select
                              value={item.status}
                              onChange={(e) => handleUpdateFeedbackStatus(item._id, e.target.value)}
                              className="bg-[#FAFAFF] border border-[#E9E6F8] text-xs font-bold rounded-lg px-2.5 py-1 focus:outline-none focus:border-[#6C4EFF]/40 cursor-pointer"
                            >
                              <option value="pending">Review Pending</option>
                              <option value="reviewing">In Review</option>
                              <option value="planned">Planned</option>
                              <option value="completed">Completed</option>
                              <option value="dismissed">Dismissed</option>
                            </select>
                          </td>
                          <td className="px-6 py-4 text-center">
                            <button
                              onClick={() => handleDeleteFeedback(item._id)}
                              className="w-8 h-8 rounded-full bg-rose-50 text-rose-600 hover:bg-rose-100 flex items-center justify-center transition-colors mx-auto"
                              title="Delete Feedback"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="6" className="px-6 py-12 text-center text-[#6B7280]">
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setPreviewIdUrl(null)} />
          <div className="relative w-full max-w-[640px] max-h-[85vh] bg-white rounded-3xl overflow-hidden p-6 z-10 flex flex-col gap-4 border border-[#E9E6F8]">
            <div className="flex justify-between items-center border-b border-[#E9E6F8] pb-3">
              <h3 className="font-bold text-sm text-[#111827]">{previewTitle}</h3>
              <button
                onClick={() => setPreviewIdUrl(null)}
                className="w-8 h-8 rounded-full bg-[#FAFAFF] hover:bg-[#F4F1FF] flex items-center justify-center text-[#6B7280]"
              >
                <CloseIcon className="w-4 h-4" />
              </button>
            </div>
            
            <div className="flex-1 overflow-auto rounded-xl border border-[#E9E6F8] bg-slate-50 relative flex items-center justify-center">
              <img
                src={previewIdUrl}
                alt="ID Card Front"
                className="max-w-full max-h-[60vh] object-contain"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
