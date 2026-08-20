import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, ArrowLeft, Check, ShieldCheck, AlertCircle, MessageSquare } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import './Notifications.css';

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
          <div style={{ width: '2.5rem', height: '2.5rem', borderRadius: '9999px', backgroundColor: '#ecfdf5', color: '#059669', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid #a7f3d0', flexShrink: 0 }}>
            <ShieldCheck style={{ width: '20px', height: '20px', strokeWidth: 2 }} />
          </div>
        );
      case 'chat':
        return (
          <div style={{ width: '2.5rem', height: '2.5rem', borderRadius: '9999px', backgroundColor: '#e0e7ff', color: '#4f46e5', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid #c7d2fe', flexShrink: 0 }}>
            <MessageSquare style={{ width: '20px', height: '20px', strokeWidth: 2 }} />
          </div>
        );
      case 'listing':
        return (
          <div style={{ width: '2.5rem', height: '2.5rem', borderRadius: '9999px', backgroundColor: '#fffbeb', color: '#d97706', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid #fde68a', flexShrink: 0 }}>
            <AlertCircle style={{ width: '20px', height: '20px', strokeWidth: 2 }} />
          </div>
        );
      default:
        return (
          <div style={{ width: '2.5rem', height: '2.5rem', borderRadius: '9999px', backgroundColor: '#F4F1FF', color: '#6C4EFF', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid #E9E6F8', flexShrink: 0 }}>
            <Bell style={{ width: '20px', height: '20px', strokeWidth: 2 }} />
          </div>
        );
    }
  };

  return (
    <div className="notifications-page-wrapper">
      <div className="notifications-card">
        
        {/* Header bar */}
        <div className="notifications-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <button
              onClick={() => navigate(-1)}
              style={{ padding: '0.5rem', backgroundColor: 'transparent', border: 'none', borderRadius: '12px', cursor: 'pointer' }}
            >
              <ArrowLeft style={{ width: '20px', height: '20px', strokeWidth: 2 }} />
            </button>
            <h1 className="notifications-title">
              <Bell style={{ width: '20px', height: '20px', color: '#6C4EFF', strokeWidth: 2.2 }} />
              Notifications
            </h1>
          </div>

          {notifications.some(n => !n.isRead) && (
            <button
              onClick={handleMarkAllAsRead}
              style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', padding: '0.375rem 0.75rem', borderRadius: '9999px', fontSize: '12px', fontWeight: 600, color: '#6C4EFF', backgroundColor: '#F4F1FF', border: 'none', cursor: 'pointer' }}
            >
              <Check style={{ width: '14px', height: '14px' }} />
              Mark all read
            </button>
          )}
        </div>

        {/* List of notifications */}
        <div className="notifications-list">
          {loading ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '5rem 0', gap: '0.75rem' }}>
              <div className="auth-btn-spinner animate-spin" style={{ borderColor: '#6C4EFF', borderTopColor: 'transparent' }} />
              <p style={{ fontSize: '12px', color: '#9CA3AF' }}>Loading notifications...</p>
            </div>
          ) : notifications.length === 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '5rem 1.5rem', textAlign: 'center' }}>
              <div style={{ width: '3.5rem', height: '3.5rem', borderRadius: '9999px', backgroundColor: '#FAFAFF', border: '1px solid #E9E6F8', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem' }}>
                <Bell style={{ width: '24px', height: '24px', color: '#9CA3AF', strokeWidth: 1.8 }} />
              </div>
              <h2 style={{ fontSize: '14px', fontWeight: 600, color: '#374151', margin: 0 }}>All caught up!</h2>
              <p style={{ fontSize: '12px', color: '#9CA3AF', maxWidth: '240px', marginTop: '0.375rem', lineHeight: 1.625 }}>
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
                  className={`notification-item ${isUnread ? 'unread' : 'read'}`}
                >
                  {getNotificationIcon(notification.type)}

                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', justify: 'space-between', alignItems: 'baseline', gap: '0.5rem' }}>
                      <h3 style={{ fontSize: '13.5px', fontWeight: isUnread ? 700 : 600, color: isUnread ? '#111827' : '#4B5563', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {notification.title}
                      </h3>
                      <span style={{ fontSize: '10px', color: '#9CA3AF', flexShrink: 0 }}>
                        {formatDate(notification.createdAt)}
                      </span>
                    </div>
                    <p style={{ fontSize: '12.5px', marginTop: '0.25rem', lineHeight: 1.625, margin: 0, color: isUnread ? '#374151' : '#6B7280', fontWeight: isUnread ? 500 : 400 }}>
                      {notification.message}
                    </p>
                  </div>

                  {isUnread && (
                    <div className="animate-pulse" style={{ width: '10px', height: '10px', borderRadius: '9999px', backgroundColor: '#6C4EFF', alignSelf: 'center', flexShrink: 0 }} />
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
