import React, { useState } from 'react';
import { MessageSquare, X, Send, Sparkles, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import api from '../api/axios';

const FeedbackWidget = () => {
  const { user, isLoggedIn, showToast } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const [category, setCategory] = useState('feature'); // feature, bug, general
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);

  // Hide feedback widget on admin dashboard and login pages
  const hidePaths = ['/admin/dashboard', '/login', '/signup', '/dev/admin-simulator'];
  if (hidePaths.some(p => location.pathname.startsWith(p)) || !isLoggedIn) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) {
      showToast('Please fill out all fields.', 'error');
      return;
    }

    setLoading(true);
    try {
      await api.post('/feedback', { category, title, description });
      showToast('Feedback submitted! Thank you.', 'success');
      setTitle('');
      setDescription('');
      setIsOpen(false);
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to submit feedback', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Floating Action Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-24 right-6 lg:bottom-8 lg:right-8 z-40 w-12 h-12 rounded-full bg-gradient-to-r from-[#6C4EFF] to-[#8A72FF] hover:from-[#5739E6] hover:to-[#765EE6] text-white flex items-center justify-center shadow-lg transition-transform duration-300 hover:scale-105 active:scale-95"
        title="Send feedback or suggest features"
      >
        <MessageSquare className="w-5 h-5" />
      </button>

      {/* Slide-out Feedback Drawer */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-end justify-center lg:items-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-xs" onClick={() => setIsOpen(false)} />
          
          <form 
            onSubmit={handleSubmit}
            className="relative w-full max-w-[420px] bg-white rounded-t-3xl lg:rounded-3xl overflow-hidden p-6 z-10 flex flex-col gap-4 border border-[#E9E6F8] shadow-2xl animate-slideUp text-left"
          >
            {/* Header */}
            <div className="flex justify-between items-center border-b border-[#E9E6F8] pb-3">
              <h3 className="font-bold text-[15px] text-[#111827] flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#6C4EFF]" /> Share Your Feedback
              </h3>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="w-8 h-8 rounded-full bg-[#FAFAFF] hover:bg-[#F4F1FF] flex items-center justify-center text-[#6B7280]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-[11px] text-[#6B7280] leading-relaxed">
              Have an idea for a feature or found a bug? Tell us! You can also check our public roadmap to view and upvote other requests.
            </p>

            {/* Category selection */}
            <div>
              <label className="text-[11px] font-bold text-[#6B7280] block mb-1.5 uppercase tracking-wide">Category</label>
              <div className="grid grid-cols-3 gap-2">
                {['feature', 'bug', 'general'].map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setCategory(cat)}
                    className={`h-9 rounded-xl border text-xs font-bold capitalize transition-all ${
                      category === cat
                        ? 'bg-[#6C4EFF] border-[#6C4EFF] text-white shadow-sm'
                        : 'bg-[#FAFAFF] border-[#E9E6F8] text-[#6B7280] hover:bg-[#F4F1FF]'
                    }`}
                  >
                    {cat === 'feature' ? '💡 Idea' : cat === 'bug' ? '🐛 Bug' : '💬 Other'}
                  </button>
                ))}
              </div>
            </div>

            {/* Title */}
            <div>
              <label className="text-[11px] font-bold text-[#6B7280] block mb-1.5 uppercase tracking-wide">Title</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Brief summary (e.g., Add dark mode)"
                className="w-full h-11 px-4 bg-[#FAFAFF] border border-[#E9E6F8] rounded-xl text-[13px] text-[#111827] focus:bg-white focus:outline-none focus:border-[#6C4EFF]/40 transition-colors"
                maxLength={80}
              />
            </div>

            {/* Description */}
            <div>
              <label className="text-[11px] font-bold text-[#6B7280] block mb-1.5 uppercase tracking-wide">Description</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe your idea or the bug in detail..."
                rows={3}
                className="w-full p-4 bg-[#FAFAFF] border border-[#E9E6F8] rounded-xl text-[13px] text-[#111827] focus:bg-white focus:outline-none focus:border-[#6C4EFF]/40 transition-colors resize-none"
              />
            </div>

            {/* Buttons */}
            <div className="flex flex-col gap-2 mt-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full h-11 bg-gradient-to-r from-[#6C4EFF] to-[#8A72FF] hover:from-[#5739E6] hover:to-[#765EE6] text-white font-bold text-[13px] rounded-full transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <Send className="w-3.5 h-3.5" /> {loading ? 'Submitting...' : 'Send Feedback'}
              </button>
              
              <button
                type="button"
                onClick={() => {
                  setIsOpen(false);
                  navigate('/feedback-roadmap');
                }}
                className="w-full h-11 border border-[#E9E6F8] hover:bg-slate-50 text-[#6C4EFF] font-bold text-[13px] rounded-full transition-colors flex items-center justify-center gap-1.5"
              >
                <AlertCircle className="w-3.5 h-3.5" /> View Public Roadmap
              </button>
            </div>
          </form>
        </div>
      )}
    </>
  );
};

export default FeedbackWidget;
