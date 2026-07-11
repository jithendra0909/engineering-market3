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
  AlertCircle
} from 'lucide-react';
import api from '../api/axios';

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
  const pollingRef = useRef(null);

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

  const scrollToBottom = () => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
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
    <div className="flex bg-[#EEEAF8] overflow-hidden w-full h-[calc(100vh-56px)] h-[calc(100dvh-56px)] lg:h-[calc(100vh-64px)]">
      {/* ─── LEFT SIDEBAR (CONVERSATIONS LIST) ─── */}
      <div className={`w-full lg:w-[380px] bg-white border-r border-[#E9E6F8] flex flex-col flex-shrink-0 ${activeChat && conversationIdParam ? 'hidden lg:flex' : 'flex'}`}>
        
        {/* Sidebar Header */}
        <div className="p-4 border-b border-[#E9E6F8]">
          <h1 className="text-xl font-bold text-[#111827] flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-[#6C4EFF]" />
            Messages
          </h1>
          
          {/* Search bar */}
          <div className="relative mt-3">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9CA3AF]" />
            <input
              type="text"
              placeholder="Search chat or listing..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-[38px] pl-10 pr-4 bg-[#FAFAFF] border border-[#E9E6F8] rounded-full text-[13px] text-[#111827] focus:outline-none focus:border-[#6C4EFF]/40 transition-colors"
            />
          </div>
        </div>

        {/* Chats list */}
        <div className="flex-1 overflow-y-auto divide-y divide-[#E9E6F8]/50">
          {loadingConversations && conversations.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-48 gap-3">
              <div className="w-8 h-8 border-4 border-[#6C4EFF] border-t-transparent rounded-full animate-spin" />
              <p className="text-xs text-[#9CA3AF]">Loading conversations...</p>
            </div>
          ) : filteredConversations.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-8 text-center h-48">
              <Inbox className="w-8 h-8 text-[#B5AEDC] mb-2" />
              <p className="text-sm font-semibold text-[#6B7280]">No chats found</p>
              <p className="text-xs text-[#9CA3AF] mt-1">Start a conversation from any product details page.</p>
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
                  className={`w-full p-4 flex gap-3 text-left transition-colors duration-150 hover:bg-[#FAFAFF] ${isSelected ? 'bg-[#F4F1FF]/60 hover:bg-[#F4F1FF]/60 border-l-4 border-[#6C4EFF]' : ''}`}
                >
                  {/* Recipient Avatar */}
                  <div className="relative flex-shrink-0">
                    {recipient.profileImageUrl ? (
                      <img
                        src={recipient.profileImageUrl}
                        alt={recipient.fullName}
                        className="w-12 h-12 rounded-full object-cover border border-[#E9E6F8]"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-[#F4F1FF] flex items-center justify-center text-[#6C4EFF] font-bold text-base border border-[#E9E6F8]">
                        {recipient.fullName?.charAt(0)}
                      </div>
                    )}
                    {/* Unread badge */}
                    {hasUnread && (
                      <span className="absolute -top-0.5 -right-0.5 w-3.5 h-3.5 bg-rose-500 rounded-full border-2 border-white" />
                    )}
                  </div>

                  {/* Chat Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-baseline mb-1">
                      <h2 className={`text-[13px] truncate ${hasUnread ? 'font-bold text-[#111827]' : 'font-semibold text-[#374151]'}`}>
                        {recipient.fullName}
                      </h2>
                      <span className="text-[10px] text-[#9CA3AF] flex-shrink-0">
                        {formatDate(chat.updatedAt)}
                      </span>
                    </div>

                    {/* Listing Title Preview */}
                    <div className="flex items-center gap-1.5 mb-1 text-[11px] font-medium text-[#6C4EFF]">
                      <span className="truncate max-w-[150px]">
                        {isListingRemoved ? '[Deleted Listing]' : chat.listing.title}
                      </span>
                      {chat.listing?.price !== undefined && !isListingRemoved && (
                        <span className="text-[#10B981] font-semibold">₹{chat.listing.price}</span>
                      )}
                    </div>

                    {/* Message Preview */}
                    <p className={`text-[12px] truncate ${hasUnread ? 'font-medium text-[#111827]' : 'text-[#6B7280]'}`}>
                      {chat.lastMessage?.sender === user._id ? 'You: ' : ''}
                      {chat.lastMessage?.text}
                    </p>
                  </div>

                  {/* Small product image thumbnail */}
                  {chat.listing?.images?.[0] && !isListingRemoved && (
                    <img
                      src={chat.listing.images[0]}
                      alt=""
                      className="w-10 h-10 rounded-lg object-cover flex-shrink-0 border border-[#E9E6F8]"
                    />
                  )}
                </button>
              );
            })
          )}
        </div>
      </div>

      {/* ─── RIGHT MAIN CHAT AREA ─── */}
      <div className={`flex-1 min-w-0 flex flex-col bg-[#F6F5FB] ${!activeChat || !conversationIdParam ? 'hidden lg:flex' : 'flex'}`}>
        {activeChat ? (
          <>
            {/* Header info bar */}
            <div className="bg-white border-b border-[#E9E6F8] px-4 lg:px-6 py-3.5 flex items-center justify-between flex-shrink-0">
              <div className="flex items-center gap-3 min-w-0">
                {/* Back button for mobile */}
                <button
                  onClick={() => {
                    setActiveChat(null);
                    setSearchParams({});
                  }}
                  className="lg:hidden p-1.5 hover:bg-[#FAFAFF] rounded-lg text-[#374151]"
                >
                  <ChevronLeft className="w-5 h-5 stroke-[2.5]" />
                </button>

                {/* Recipient info */}
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-10 h-10 rounded-full bg-[#F4F1FF] flex items-center justify-center text-[#6C4EFF] font-bold text-sm border border-[#E9E6F8] flex-shrink-0">
                    {getRecipient(activeChat).profileImageUrl ? (
                      <img
                        src={getRecipient(activeChat).profileImageUrl}
                        alt=""
                        className="w-10 h-10 rounded-full object-cover"
                      />
                    ) : (
                      getRecipient(activeChat).fullName?.charAt(0)
                    )}
                  </div>
                  <div className="min-w-0">
                    <h2 className="text-[14px] font-bold text-[#111827] truncate leading-tight">
                      {getRecipient(activeChat).fullName}
                    </h2>
                    <p className="text-[10px] text-[#6B7280] flex items-center gap-1.5 truncate mt-0.5">
                      <GraduationCap className="w-3 h-3 text-[#6C4EFF] flex-shrink-0" />
                      <span>{getRecipient(activeChat).department} • {getRecipient(activeChat).year}</span>
                    </p>
                  </div>
                </div>
              </div>

              {/* Listing Card Header */}
              {activeChat.listing && activeChat.listing.status !== 'removed' && (
                <Link
                  to={`/listing/${activeChat.listing._id}`}
                  className="flex items-center gap-2.5 p-1.5 px-3 bg-[#F4F1FF]/60 hover:bg-[#F4F1FF] rounded-xl border border-[#E9E6F8]/60 transition-colors max-w-[200px] lg:max-w-[320px] text-left"
                >
                  {activeChat.listing.images?.[0] && (
                    <img
                      src={activeChat.listing.images[0]}
                      alt=""
                      className="w-8 h-8 rounded-lg object-cover flex-shrink-0"
                    />
                  )}
                  <div className="min-w-0 leading-tight">
                    <p className="text-[11px] font-bold text-[#111827] truncate">{activeChat.listing.title}</p>
                    <p className="text-[11px] font-extrabold text-[#10B981] mt-0.5">₹{activeChat.listing.price}</p>
                  </div>
                  <ExternalLink className="w-3.5 h-3.5 text-[#6C4EFF] flex-shrink-0 ml-1" />
                </Link>
              )}
            </div>

            {/* Messages box */}
            <div className="flex-1 overflow-y-auto p-4 lg:p-6 space-y-4">
              {loadingMessages && messages.length === 0 ? (
                <div className="flex justify-center py-10">
                  <div className="w-8 h-8 border-4 border-[#6C4EFF] border-t-transparent rounded-full animate-spin" />
                </div>
              ) : (
                messages.map((message) => {
                  const isSelf = message.sender === user._id;

                  return (
                    <div
                      key={message._id}
                      className={`flex ${isSelf ? 'justify-end' : 'justify-start'}`}
                    >
                      <div className="max-w-[70%]">
                        <div
                          className={`p-3.5 rounded-[20px] text-[13px] leading-relaxed shadow-sm ${
                            isSelf
                              ? 'bg-[#6C4EFF] text-white rounded-tr-none'
                              : 'bg-white text-[#374151] border border-[#E9E6F8] rounded-tl-none'
                          }`}
                        >
                          {message.text}
                        </div>
                        <p className={`text-[10px] text-[#9CA3AF] mt-1 flex items-center gap-1 ${isSelf ? 'justify-end' : 'justify-start'}`}>
                          <Clock className="w-2.5 h-2.5" />
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
              <div className="px-4 lg:px-6 py-2 flex flex-wrap gap-2 bg-[#F6F5FB] flex-shrink-0">
                <span className="text-[11px] font-bold text-[#6B7280] w-full flex items-center gap-1.5 mb-1">
                  <Sparkles className="w-3.5 h-3.5 text-[#6C4EFF]" /> Suggested Replies:
                </span>
                {quickReplies.map((reply, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSendMessage(reply)}
                    disabled={sending}
                    className="text-[12px] bg-white hover:bg-[#F4F1FF] hover:text-[#6C4EFF] border border-[#E9E6F8] px-3 py-1.5 rounded-full transition-colors font-medium text-[#4B5563] shadow-sm disabled:opacity-50"
                  >
                    {reply}
                  </button>
                ))}
              </div>
            )}

            {/* Input message form */}
            <div className="p-4 bg-white border-t border-[#E9E6F8] flex-shrink-0">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSendMessage();
                }}
                className="flex items-center gap-3"
              >
                <input
                  type="text"
                  placeholder="Type your message here..."
                  value={newMessageText}
                  onChange={(e) => setNewMessageText(e.target.value)}
                  disabled={sending}
                  className="flex-1 min-w-0 h-[46px] px-5 bg-[#FAFAFF] border border-[#E9E6F8] rounded-full text-[13px] text-[#111827] focus:outline-none focus:border-[#6C4EFF]/40 transition-colors placeholder-[#9CA3AF]"
                />
                <button
                  type="submit"
                  disabled={!newMessageText.trim() || sending}
                  className="w-[46px] h-[46px] flex-shrink-0 bg-[#6C4EFF] hover:bg-[#5739E6] text-white rounded-full flex items-center justify-center transition-colors shadow-md disabled:opacity-50"
                >
                  <Send className="w-4.5 h-4.5 stroke-[2.2] transform rotate-0" />
                </button>
              </form>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
            <div className="w-16 h-16 bg-white rounded-3xl shadow-sm border border-[#E9E6F8] flex items-center justify-center mb-4">
              <MessageSquare className="w-8 h-8 text-[#6C4EFF]" />
            </div>
            <h2 className="text-lg font-bold text-[#111827]">Welcome to Chat Support</h2>
            <p className="text-sm text-[#6B7280] max-w-[320px] mt-1.5">
              Select a conversation from the sidebar or start a new one to communicate securely with sellers.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Chat;
