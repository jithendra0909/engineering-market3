import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  Send, 
  ChevronLeft, 
  ExternalLink, 
  Search, 
  MessageSquare, 
  Clock, 
  User, 
  GraduationCap,
  Sparkles,
  Inbox,
  AlertCircle,
  Flag,
  AlertTriangle
} from 'lucide-react';
import api from '../api/axios';
import './Chat.css';

export const Chat = () => {
  const { user, isLoggedIn, showToast } = useAuth();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const conversationIdParam = searchParams.get('conversationId');

  const [conversations, setConversations] = useState([]);
  const [activeChat, setActiveChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessageText, setNewMessageText] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  
  const [loadingConversations, setLoadingConversations] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [sending, setSending] = useState(false);

  const messagesEndRef = useRef(null);
  const messagesContainerRef = useRef(null);
  const pollingRef = useRef(null);

  // Chat Reporting states
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [reportReason, setReportReason] = useState('Abusive Language');
  const [reportNotes, setReportNotes] = useState('');
  const [reporting, setReporting] = useState(false);

  const handleReportConversation = async (e) => {
    e.preventDefault();
    if (!activeChat || reporting) return;

    setReporting(true);
    try {
      const reasonText = reportNotes.trim()
        ? `${reportReason} - ${reportNotes.trim()}`
        : reportReason;

      await api.post(`/chats/${activeChat._id}/report`, { reason: reasonText });
      showToast('Conversation reported successfully!', 'success');
      
      // Update activeChat locally to show reported status
      setActiveChat(prev => ({
        ...prev,
        reports: [...(prev.reports || []), { reporter: user._id, reason: reasonText }]
      }));
      
      setIsReportModalOpen(false);
      setReportNotes('');
    } catch (err) {
      const errMsg = err.response?.data?.message || 'Failed to submit report';
      showToast(errMsg, 'error');
    } finally {
      setReporting(false);
    }
  };

  // Quick replies list
  const quickReplies = [
    "Is this listing still available?",
    "Can we negotiate the price?",
    "Where can we meet on campus?",
    "Can I inspect the item before buying?"
  ];

  // Fetch all user conversations
  const fetchConversations = async (silent = false) => {
    try {
      if (!silent) setLoadingConversations(true);
      const { data } = await api.get('/chats');
      setConversations(data);

      // Handle query param selection or auto-selection
      if (silent) return;

      if (data.length > 0) {
        let selected = null;
        if (conversationIdParam) {
          selected = data.find(c => c._id === conversationIdParam);
        }
        
        if (selected) {
          setActiveChat(selected);
        } else if (!activeChat && !conversationIdParam) {
          // If no query param and no active chat, select first chat (Desktop only)
          const isDesktop = window.innerWidth >= 1024;
          if (isDesktop) {
            setActiveChat(data[0]);
            setSearchParams({ conversationId: data[0]._id }, { replace: true });
          }
        }
      }
    } catch (err) {
      console.error('Error fetching conversations:', err);
      showToast('Failed to load chat history', 'error');
    } finally {
      if (!silent) setLoadingConversations(false);
    }
  };

  // Fetch messages for active chat
  const fetchMessages = async (chatId, silent = false) => {
    if (!chatId) return;
    try {
      if (!silent) setLoadingMessages(true);
      const { data } = await api.get(`/chats/${chatId}/messages`);
      setMessages(data);
      scrollToBottom();
    } catch (err) {
      console.error('Error fetching messages:', err);
      showToast('Failed to load messages', 'error');
    } finally {
      if (!silent) setLoadingMessages(false);
    }
  };

  // Setup initial load and dynamic params change
  useEffect(() => {
    if (!isLoggedIn) {
      navigate('/login');
      return;
    }
    fetchConversations();
  }, [conversationIdParam]);

  // Handle active chat changes
  useEffect(() => {
    if (activeChat) {
      fetchMessages(activeChat._id);
      
      // Setup smart polling (every 4 seconds)
      if (pollingRef.current) clearInterval(pollingRef.current);
      
      pollingRef.current = setInterval(() => {
        fetchMessages(activeChat._id, true);
        fetchConversations(true);
      }, 4000);
    }

    return () => {
      if (pollingRef.current) clearInterval(pollingRef.current);
    };
  }, [activeChat?._id]);

  const scrollToBottom = (smooth = true) => {
    setTimeout(() => {
      if (messagesContainerRef.current) {
        messagesContainerRef.current.scrollTo({
          top: messagesContainerRef.current.scrollHeight,
          behavior: smooth ? 'smooth' : 'auto'
        });
      }
    }, 80);
  };

  const handleSelectChat = (chat) => {
    setActiveChat(chat);
    setSearchParams({ conversationId: chat._id });
  };

  const handleSendMessage = async (textToSend) => {
    const text = textToSend || newMessageText;
    if (!text.trim() || !activeChat || sending) return;

    setSending(true);
    try {
      const { data } = await api.post(`/chats/${activeChat._id}/messages`, { text: text.trim() });
      setMessages(prev => [...prev, data]);
      setNewMessageText('');
      scrollToBottom();
      
      // Refresh conversations immediately to update preview/timestamp
      fetchConversations(true);
    } catch (err) {
      console.error('Error sending message:', err);
      showToast('Failed to send message', 'error');
    } finally {
      setSending(false);
    }
  };

  // Get recipient profile details
  const getRecipient = (chat) => {
    if (!chat || !user) return {};
    return chat.buyer._id === user._id ? chat.seller : chat.buyer;
  };

  // Format timestamps
  const formatTime = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
  };

  // Filter conversations
  const filteredConversations = conversations.filter(c => {
    const recipient = getRecipient(c);
    const nameMatch = recipient?.fullName?.toLowerCase().includes(searchQuery.toLowerCase());
    const listingMatch = c.listing?.title?.toLowerCase().includes(searchQuery.toLowerCase());
    return nameMatch || listingMatch;
  });

  return (
    <div className="chat-container">
      {/* ─── LEFT SIDEBAR (CONVERSATIONS LIST) ─── */}
      <div className={`chat-sidebar ${activeChat ? 'hidden-mobile' : ''}`}>
        
        {/* Sidebar Header */}
        <div className="chat-sidebar-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <button
              onClick={() => navigate('/')}
              className="chat-back-btn"
              title="Go to Home"
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0.25rem', margin: '-0.25rem 0 0 -0.25rem' }}
            >
              <ChevronLeft style={{ width: '22px', height: '22px' }} />
            </button>
            <h1 className="chat-sidebar-title">
              <MessageSquare style={{ width: '20px', height: '20px', color: '#6C4EFF' }} />
              Messages
            </h1>
          </div>
          
          {/* Search bar */}
          <div className="chat-search-wrapper">
            <Search className="chat-search-icon" />
            <input
              type="text"
              placeholder="Search chat or listing..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="chat-search-input"
            />
          </div>
        </div>

        {/* Chats list */}
        <div className="chat-list">
          {loadingConversations && conversations.length === 0 ? (
            <div className="chat-loading-state">
              <div className="chat-spinner animate-spin" />
              <p className="chat-loading-text">Loading conversations...</p>
            </div>
          ) : filteredConversations.length === 0 ? (
            <div className="chat-empty-state">
              <Inbox style={{ width: '32px', height: '32px', color: '#B5AEDC', marginBottom: '0.5rem' }} />
              <p className="chat-empty-title">No chats found</p>
              <p className="chat-empty-sub">Start a conversation from any product details page.</p>
            </div>
          ) : (
            filteredConversations.map((chat) => {
              const recipient = getRecipient(chat);
              const isSelected = activeChat?._id === chat._id;
              const hasUnread = chat.unreadFor?.includes(user?._id);
              const isListingRemoved = chat.listing?.status === 'removed' || !chat.listing;

              return (
                <button
                  key={chat._id}
                  onClick={() => handleSelectChat(chat)}
                  className={`chat-item-btn ${isSelected ? 'selected' : ''}`}
                >
                  {/* Recipient Avatar */}
                  <div className="chat-avatar-wrapper">
                    {recipient.profileImageUrl ? (
                      <img
                        src={recipient.profileImageUrl}
                        alt={recipient.fullName}
                        className="chat-avatar-img"
                      />
                    ) : (
                      <div className="chat-avatar-placeholder">
                        {recipient.fullName?.charAt(0)}
                      </div>
                    )}
                    {/* Unread badge */}
                    {hasUnread && (
                      <span className="chat-unread-badge" />
                    )}
                  </div>

                  {/* Chat Info */}
                  <div className="chat-item-info">
                    <div className="chat-item-top-row">
                      <h2 className={`chat-item-name ${hasUnread ? 'unread' : ''}`}>
                        {recipient.fullName}
                      </h2>
                      <span className="chat-item-date">
                        {formatDate(chat.updatedAt)}
                      </span>
                    </div>

                    {/* Listing Title Preview */}
                    <div className="chat-item-listing-row">
                      <span className="chat-item-listing-title">
                        {isListingRemoved ? '[Deleted Listing]' : chat.listing.title}
                      </span>
                      {chat.listing?.price !== undefined && !isListingRemoved && (
                        <span className="chat-item-listing-price">₹{chat.listing.price}</span>
                      )}
                    </div>

                    {/* Message Preview */}
                    <p className={`chat-item-preview ${hasUnread ? 'unread' : ''}`}>
                      {chat.lastMessage?.sender === user._id ? 'You: ' : ''}
                      {chat.lastMessage?.text}
                    </p>
                  </div>

                  {/* Small product image thumbnail */}
                  {chat.listing?.images?.[0] && !isListingRemoved && (
                    <img
                      src={chat.listing.images[0]}
                      alt=""
                      className="chat-item-thumb"
                    />
                  )}
                </button>
              );
            })
          )}
        </div>
      </div>

      {/* ─── RIGHT MAIN CHAT AREA ─── */}
      <div className={`chat-main ${!activeChat ? 'hidden-mobile' : ''}`}>
        {activeChat ? (
          <>
            {/* Header info bar */}
            <div className="chat-main-header">
              <div className="chat-header-left">
                {/* Back button for mobile */}
                <button
                  onClick={() => {
                    setActiveChat(null);
                    setSearchParams({});
                  }}
                  className="chat-back-btn"
                >
                  <ChevronLeft style={{ width: '20px', height: '20px', strokeWidth: 2.5 }} />
                </button>

                {/* Recipient info */}
                <div className="chat-header-recipient">
                  <div className="chat-header-avatar">
                    {getRecipient(activeChat).profileImageUrl ? (
                      <img
                        src={getRecipient(activeChat).profileImageUrl}
                        alt=""
                        className="chat-header-avatar-img"
                      />
                    ) : (
                      getRecipient(activeChat).fullName?.charAt(0)
                    )}
                  </div>
                  <div className="chat-header-recipient-info">
                    <h2 className="chat-header-name">
                      {getRecipient(activeChat).fullName}
                    </h2>
                    <p className="chat-header-dept">
                      <GraduationCap style={{ width: '12px', height: '12px', color: '#6C4EFF', flexShrink: 0 }} />
                      <span>{getRecipient(activeChat).department} • {getRecipient(activeChat).year}</span>
                    </p>
                  </div>
                </div>
              </div>

              <div className="chat-header-right">
                {/* Listing Card Header */}
                {activeChat.listing && activeChat.listing.status !== 'removed' && (
                  <Link
                    to={`/listing/${activeChat.listing._id}`}
                    className="chat-header-listing-link"
                  >
                    {activeChat.listing.images?.[0] && (
                      <img
                        src={activeChat.listing.images[0]}
                        alt=""
                        className="chat-header-listing-img"
                      />
                    )}
                    <div className="chat-header-listing-info">
                      <p className="chat-header-listing-title">{activeChat.listing.title}</p>
                      <p className="chat-header-listing-price">₹{activeChat.listing.price}</p>
                    </div>
                    <ExternalLink style={{ width: '14px', height: '14px', color: '#6C4EFF', flexShrink: 0, marginLeft: '4px' }} />
                  </Link>
                )}

                <button
                  onClick={() => setIsReportModalOpen(true)}
                  disabled={activeChat.reports?.some(r => r.reporter === user?._id || r.reporter?._id === user?._id)}
                  className={`chat-report-btn ${
                    activeChat.reports?.some(r => r.reporter === user?._id || r.reporter?._id === user?._id)
                      ? 'reported'
                      : ''
                  }`}
                  title={activeChat.reports?.some(r => r.reporter === user?._id || r.reporter?._id === user?._id) ? "You reported this chat" : "Report conversation"}
                >
                  <Flag style={{ width: '16px', height: '16px' }} />
                </button>
              </div>
            </div>

            {/* Messages box */}
            <div className="chat-messages-container" ref={messagesContainerRef}>
              {loadingMessages && messages.length === 0 ? (
                <div className="chat-messages-loading">
                  <div className="chat-spinner animate-spin" />
                </div>
              ) : (
                messages.map((message) => {
                  const isSelf = message.sender === user._id;

                  return (
                    <div
                      key={message._id}
                      className={`chat-message-row ${isSelf ? 'self' : 'other'}`}
                    >
                      <div className="chat-message-content">
                        <div
                          className={`chat-bubble ${isSelf ? 'self' : 'other'}`}
                        >
                          {message.text}
                        </div>
                        <p className={`chat-message-time ${isSelf ? 'self' : 'other'}`}>
                          <Clock style={{ width: '10px', height: '10px' }} />
                          {formatTime(message.createdAt)}
                        </p>
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Quick replies suggestion chips */}
            {messages.length <= 1 && (
              <div className="chat-quick-replies">
                <span className="chat-quick-replies-label">
                  <Sparkles style={{ width: '14px', height: '14px', color: '#6C4EFF' }} /> Suggested Replies:
                </span>
                {quickReplies.map((reply, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSendMessage(reply)}
                    disabled={sending}
                    className="chat-quick-reply-btn"
                  >
                    {reply}
                  </button>
                ))}
              </div>
            )}

            {/* Input message form */}
            <div className="chat-input-bar">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSendMessage();
                }}
                className="chat-input-form"
              >
                <input
                  type="text"
                  placeholder="Type your message here..."
                  value={newMessageText}
                  onChange={(e) => setNewMessageText(e.target.value)}
                  disabled={sending}
                  className="chat-message-input"
                />
                <button
                  type="submit"
                  disabled={!newMessageText.trim() || sending}
                  className="chat-send-btn"
                >
                  <Send style={{ width: '18px', height: '18px', strokeWidth: 2.2 }} />
                </button>
              </form>
            </div>
          </>
        ) : (
          <div className="chat-welcome">
            <div className="chat-welcome-icon-box">
              <MessageSquare style={{ width: '32px', height: '32px', color: '#6C4EFF' }} />
            </div>
            <h2 className="chat-welcome-title">Welcome to Chat Support</h2>
            <p className="chat-welcome-desc">
              Select a conversation from the sidebar or start a new one to communicate securely with sellers.
            </p>
          </div>
        )}
      </div>

      {/* Report Chat Modal Overlay */}
      {isReportModalOpen && (
        <div className="chat-modal-overlay">
          <div className="chat-modal-backdrop" onClick={() => setIsReportModalOpen(false)} />
          <form onSubmit={handleReportConversation} className="chat-report-modal">
            <h3 className="chat-report-modal-title">
              <Flag style={{ width: '20px', height: '20px', color: '#e11d48' }} /> Report Abusive Chat
            </h3>
            <p className="chat-report-modal-desc">
              If this conversation contains harassment, abusive language, scams, or spam, please report it to our administration.
            </p>
            
            <div>
              <label className="chat-report-label">Reason</label>
              <select
                value={reportReason}
                onChange={(e) => setReportReason(e.target.value)}
                className="chat-report-select"
              >
                <option value="Abusive Language">Abusive Language</option>
                <option value="Scam or Fraud">Scam or Fraud</option>
                <option value="Harassment">Harassment</option>
                <option value="Inappropriate Behavior">Inappropriate Behavior</option>
                <option value="Other">Other (Describe below)</option>
              </select>
            </div>

            <div>
              <label className="chat-report-label">Additional Details (Optional)</label>
              <textarea
                value={reportNotes}
                onChange={(e) => setReportNotes(e.target.value)}
                placeholder="Provide details about why you are reporting this conversation..."
                rows={3}
                className="chat-report-textarea"
              />
            </div>

            <div className="chat-report-actions">
              <button
                type="button"
                onClick={() => setIsReportModalOpen(false)}
                className="chat-report-cancel-btn"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={reporting}
                className="chat-report-submit-btn"
              >
                {reporting ? 'Submitting...' : 'Submit Report'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default Chat;
