import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, ArrowLeft, Check, Trash2, ShieldCheck, AlertCircle, MessageSquare } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';

export const Notifications = () => {
  const { isLoggedIn, showToast } = useAuth();
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  // Redirect to login if not logged in
  useEffect(() => {
    if (!isLoggedIn) {
      navigate('/login');
    }
  }, [isLoggedIn, navigate]);

  // Fetch notifications
  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const { data } = await api.get('/notifications');
      setNotifications(data);
    } catch (err) {
      console.error('Error fetching notifications:', err);
      showToast('Failed to load notifications', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isLoggedIn) {
      fetchNotifications();
    }
  }, [isLoggedIn]);

  // Mark single as read
  const handleMarkAsRead = async (id) => {
    try {
      await api.put(`/notifications/${id}/read`);
      setNotifications(prev =>
        prev.map(n => (n._id === id ? { ...n, isRead: true } : n))
      );
      // Trigger a custom event so the Navbar can update its badge immediately!
      window.dispatchEvent(new Event('notificationsUpdated'));
    } catch (err) {
      console.error('Error marking read:', err);
    }
  };

  // Mark all as read
  const handleMarkAllAsRead = async () => {
    if (notifications.filter(n => !n.isRead).length === 0) return;
    try {
      await api.put('/notifications/read-all');
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      showToast('All notifications marked as read', 'success');
      window.dispatchEvent(new Event('notificationsUpdated'));
    } catch (err) {
      console.error('Error marking all read:', err);
      showToast('Failed to mark all as read', 'error');
    }
  };

  // Format date nicely
  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  // Get corresponding icon for notification type
  const getNotificationIcon = (type) => {
    switch (type) {
      case 'verification':
        return (
          <div className="w-10 h-10 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100 flex-shrink-0">
            <ShieldCheck className="w-5 h-5 stroke-[2]" />
          </div>
        );
      case 'chat':
        return (
          <div className="w-10 h-10 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center border border-indigo-100 flex-shrink-0">
            <MessageSquare className="w-5 h-5 stroke-[2]" />
          </div>
        );
      case 'listing':
        return (
          <div className="w-10 h-10 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center border border-amber-100 flex-shrink-0">
            <AlertCircle className="w-5 h-5 stroke-[2]" />
          </div>
        );
      default:
        return (
          <div className="w-10 h-10 rounded-full bg-[#F4F1FF] text-[#6C4EFF] flex items-center justify-center border border-[#E9E6F8] flex-shrink-0">
            <Bell className="w-5 h-5 stroke-[2]" />
          </div>
        );
    }
  };

  return (
    <div className="min-h-[calc(100vh-64px)] md:min-h-[calc(100vh-64px)] pb-[80px] bg-[#FAF9FF] px-4 py-8">
      <div className="max-w-[600px] mx-auto bg-white rounded-3xl border border-[#E9E6F8] shadow-sm overflow-hidden">
        
        {/* Header bar */}
        <div className="px-6 py-5 border-b border-[#E9E6F8] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate(-1)}
              className="p-2 hover:bg-[#FAFAFF] rounded-xl text-[#374151] transition-colors"
            >
              <ArrowLeft className="w-5 h-5 stroke-[2]" />
            </button>
            <h1 className="text-lg font-bold text-[#111827] flex items-center gap-2">
              <Bell className="w-5 h-5 text-[#6C4EFF] stroke-[2.2]" />
              Notifications
            </h1>
          </div>

          {notifications.some(n => !n.isRead) && (
            <button
              onClick={handleMarkAllAsRead}
              className="flex items-center gap-1 px-3 py-1.5 rounded-full text-[12px] font-semibold text-[#6C4EFF] bg-[#F4F1FF] hover:bg-[#E9E6F8] transition-colors"
            >
              <Check className="w-3.5 h-3.5" />
              Mark all read
            </button>
          )}
        </div>

        {/* List of notifications */}
        <div className="divide-y divide-[#E9E6F8]/65">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-3">
              <div className="w-8 h-8 border-4 border-[#6C4EFF] border-t-transparent rounded-full animate-spin" />
              <p className="text-xs text-[#9CA3AF]">Loading notifications...</p>
            </div>
          ) : notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center px-6">
              <div className="w-14 h-14 rounded-full bg-[#FAFAFF] border border-[#E9E6F8] flex items-center justify-center mb-4">
                <Bell className="w-6 h-6 text-[#9CA3AF] stroke-[1.8]" />
              </div>
              <h2 className="text-sm font-semibold text-[#374151]">All caught up!</h2>
              <p className="text-xs text-[#9CA3AF] max-w-[240px] mt-1.5 leading-relaxed">
                You have no new notifications. We'll alert you when listing status updates or verify requests complete.
              </p>
            </div>
          ) : (
            notifications.map((notification) => {
              const isUnread = !notification.isRead;
              return (
                <div
                  key={notification._id}
                  onClick={() => isUnread && handleMarkAsRead(notification._id)}
                  className={`p-5 flex gap-4 transition-all duration-200 cursor-pointer ${
                    isUnread
                      ? 'bg-[#F9F8FF]/85 hover:bg-[#F4F1FF]/60'
                      : 'hover:bg-[#FAFAFF]/50 bg-white'
                  }`}
                >
                  {getNotificationIcon(notification.type)}

                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-baseline gap-2">
                      <h3 className={`text-[13.5px] truncate leading-tight ${isUnread ? 'font-bold text-[#111827]' : 'font-semibold text-[#4B5563]'}`}>
                        {notification.title}
                      </h3>
                      <span className="text-[10px] text-[#9CA3AF] flex-shrink-0">
                        {formatDate(notification.createdAt)}
                      </span>
                    </div>
                    <p className={`text-[12.5px] mt-1 leading-relaxed ${isUnread ? 'text-[#374151] font-medium' : 'text-[#6B7280]'}`}>
                      {notification.message}
                    </p>
                  </div>

                  {isUnread && (
                    <div className="w-2.5 h-2.5 rounded-full bg-[#6C4EFF] self-center flex-shrink-0 animate-pulse" />
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};

export default Notifications;
