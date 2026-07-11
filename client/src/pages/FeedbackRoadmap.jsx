import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { ArrowUp, Sparkles, MessageSquare, Plus, CheckCircle, Clock, Play } from 'lucide-react';
import api from '../api/axios';

const FeedbackRoadmap = () => {
  const { user, showToast } = useAuth();
  const [feedbackList, setFeedbackList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, feature, bug, planned, completed
  
  // Submit modal inside roadmap page
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [category, setCategory] = useState('feature');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [submitLoading, setSubmitLoading] = useState(false);

  const fetchFeedback = async () => {
    setLoading(true);
    try {
      const res = await api.get('/feedback');
      setFeedbackList(res.data);
    } catch (err) {
      showToast('Failed to load roadmap.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFeedback();
  }, []);

  const handleUpvote = async (id) => {
    try {
      const res = await api.post(`/feedback/${id}/upvote`);
      // Update item in local state
      setFeedbackList(prev => prev.map(item => item._id === id ? res.data : item));
    } catch (err) {
      showToast('Failed to update upvote.', 'error');
    }
  };

  const handleSubmitFeedback = async (e) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) {
      showToast('All fields are required.', 'error');
      return;
    }

    setSubmitLoading(true);
    try {
      const res = await api.post('/feedback', { category, title, description });
      showToast('Feedback submitted successfully!', 'success');
      setFeedbackList(prev => [res.data, ...prev]);
      setTitle('');
      setDescription('');
      setIsModalOpen(false);
    } catch (err) {
      showToast('Failed to submit feedback.', 'error');
    } finally {
      setSubmitLoading(false);
    }
  };

  // Filter logic
  const filteredList = feedbackList.filter(item => {
    if (filter === 'all') return true;
    if (filter === 'feature') return item.category === 'feature';
    if (filter === 'bug') return item.category === 'bug';
    if (filter === 'planned') return ['planned', 'reviewing'].includes(item.status);
    if (filter === 'completed') return item.status === 'completed';
    return true;
  });

  return (
    <div className="max-w-[720px] mx-auto px-4 py-8 pb-24 animate-fadeIn">
      {/* Title */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#E9E6F8] pb-6 mb-8 text-left">
        <div>
          <h1 className="text-2xl font-black text-[#111827] tracking-tight flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-[#6C4EFF]" /> Product Roadmap
          </h1>
          <p className="text-xs text-[#6B7280] mt-1.5 leading-relaxed">
            Suggest new features, report bugs, and vote on what we should build next!
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="h-11 px-6 rounded-full bg-gradient-to-r from-[#6C4EFF] to-[#8A72FF] hover:from-[#5739E6] hover:to-[#765EE6] text-white text-xs font-bold shadow-md flex items-center justify-center gap-2 transition-transform hover:scale-105 active:scale-98 self-start md:self-center"
        >
          <Plus className="w-4 h-4" /> Suggest Feature
        </button>
      </div>

      {/* Roadmap Filters */}
      <div className="flex flex-wrap gap-2 border-b border-[#E9E6F8] pb-4 mb-6 text-xs font-bold">
        {[
          { key: 'all', label: 'All Suggestions' },
          { key: 'feature', label: '💡 Ideas' },
          { key: 'bug', label: '🐛 Bugs' },
          { key: 'planned', label: '⚙️ In Progress' },
          { key: 'completed', label: '✅ Completed' }
        ].map((item) => (
          <button
            key={item.key}
            onClick={() => setFilter(item.key)}
            className={`px-3 py-1.5 rounded-full border transition-all ${
              filter === item.key
                ? 'bg-[#111827] border-[#111827] text-white shadow-sm'
                : 'bg-white border-[#E9E6F8] text-[#6B7280] hover:bg-slate-50'
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>

      {/* Roadmap Content */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-10 h-10 border-4 border-[#6C4EFF] border-t-transparent rounded-full animate-spin" />
        </div>
      ) : filteredList.length > 0 ? (
        <div className="flex flex-col gap-4 text-left">
          {filteredList.map((item) => {
            const hasUpvoted = item.upvotes.includes(user?._id);

            return (
              <div 
                key={item._id}
                className="bg-white border border-[#E9E6F8] rounded-[24px] p-5 flex items-start gap-4 shadow-[0_2px_8px_rgba(108,78,255,0.01)] hover:border-[#6C4EFF]/20 transition-all duration-200"
              >
                {/* Upvote column */}
                <button
                  onClick={() => handleUpvote(item._id)}
                  className={`w-12 h-14 rounded-2xl flex flex-col items-center justify-center border flex-shrink-0 transition-all active:scale-95 ${
                    hasUpvoted
                      ? 'bg-[#F4F1FF] border-[#6C4EFF]/40 text-[#6C4EFF]'
                      : 'bg-[#FAFAFF] border-[#E9E6F8] text-[#6B7280] hover:bg-[#F4F1FF] hover:border-[#6C4EFF]/20'
                  }`}
                >
                  <ArrowUp className={`w-4 h-4 transition-transform ${hasUpvoted ? 'translate-y-[-1px]' : ''}`} />
                  <span className="text-[11px] font-black mt-1 leading-none">{item.upvotes.length}</span>
                </button>

                {/* Main details */}
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    {/* Category tag */}
                    <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide border ${
                      item.category === 'feature'
                        ? 'bg-indigo-50 border-indigo-100 text-indigo-600'
                        : item.category === 'bug'
                        ? 'bg-rose-50 border-rose-100 text-rose-600'
                        : 'bg-slate-50 border-slate-100 text-slate-600'
                    }`}>
                      {item.category === 'feature' ? 'Idea' : item.category === 'bug' ? 'Bug' : 'General'}
                    </span>

                    {/* Status tag */}
                    {item.status !== 'pending' && (
                      <span className={`text-[9px] font-extrabold px-2 py-0.5 rounded-full uppercase tracking-wider flex items-center gap-1 border ${
                        item.status === 'completed'
                          ? 'bg-emerald-50 border-emerald-100 text-emerald-600'
                          : ['planned', 'reviewing'].includes(item.status)
                          ? 'bg-amber-50 border-amber-100 text-amber-600'
                          : 'bg-slate-100 border-slate-200 text-slate-500'
                      }`}>
                        {item.status === 'completed' ? (
                          <>
                            <CheckCircle className="w-2.5 h-2.5" /> Finished
                          </>
                        ) : item.status === 'planned' ? (
                          <>
                            <Play className="w-2.5 h-2.5" /> Planned
                          </>
                        ) : item.status === 'reviewing' ? (
                          <>
                            <Clock className="w-2.5 h-2.5" /> In Review
                          </>
                        ) : (
                          'Dismissed'
                        )}
                      </span>
                    )}
                  </div>

                  <h3 className="font-bold text-[14px] text-[#111827] mt-2 leading-snug">
                    {item.title}
                  </h3>
                  
                  <p className="text-xs text-[#6B7280] mt-1.5 leading-relaxed break-words">
                    {item.description}
                  </p>

                  <div className="flex items-center gap-2 mt-4 text-[10px] text-[#9CA3AF] font-bold">
                    <span>Suggested by {item.user?.fullName || 'Student'}</span>
                    <span>•</span>
                    <span>{new Date(item.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 text-center bg-white border border-[#E9E6F8] rounded-[24px]">
          <div className="w-12 h-12 rounded-full bg-[#FAFAFF] border border-[#E9E6F8] flex items-center justify-center text-gray-400 mb-4">
            <MessageSquare className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-sm text-[#111827]">No requests found</h3>
          <p className="text-xs text-[#6B7280] max-w-[280px] mt-1 leading-relaxed">
            Be the first to submit a suggestion to improve the platform!
          </p>
        </div>
      )}

      {/* Suggestion Modal Form */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsModalOpen(false)} />
          
          <form 
            onSubmit={handleSubmitFeedback}
            className="relative w-full max-w-[440px] bg-white rounded-3xl p-6 z-10 flex flex-col gap-4 border border-[#E9E6F8] text-left shadow-2xl"
          >
            <h3 className="font-bold text-base text-[#111827] flex items-center gap-2">
              <Plus className="w-5 h-5 text-[#6C4EFF]" /> Submit Feature Idea
            </h3>
            
            <div>
              <label className="text-[11px] font-bold text-[#6B7280] block mb-1.5 uppercase tracking-wide">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full h-11 px-3 bg-[#FAFAFF] border border-[#E9E6F8] rounded-xl text-[13px] text-[#111827] focus:outline-none focus:border-[#6C4EFF]/40 cursor-pointer"
              >
                <option value="feature">💡 Feature Suggestion</option>
                <option value="bug">🐛 Bug Report</option>
                <option value="general">💬 General Feedback</option>
              </select>
            </div>

            <div>
              <label className="text-[11px] font-bold text-[#6B7280] block mb-1.5 uppercase tracking-wide">Title</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="What is your request?"
                className="w-full h-11 px-4 bg-[#FAFAFF] border border-[#E9E6F8] rounded-xl text-[13px] text-[#111827] focus:outline-none focus:border-[#6C4EFF]/40"
                required
              />
            </div>

            <div>
              <label className="text-[11px] font-bold text-[#6B7280] block mb-1.5 uppercase tracking-wide">Details</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe your request in detail. How will this help students?"
                rows={4}
                className="w-full p-4 bg-[#FAFAFF] border border-[#E9E6F8] rounded-xl text-[13px] text-[#111827] focus:outline-none focus:border-[#6C4EFF]/40 resize-none"
                required
              />
            </div>

            <div className="flex gap-3 mt-2">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="flex-1 h-11 border border-[#E9E6F8] text-[#6B7280] font-bold text-[13px] rounded-full hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitLoading}
                className="flex-1 h-11 bg-gradient-to-r from-[#6C4EFF] to-[#8A72FF] hover:from-[#5739E6] hover:to-[#765EE6] text-white font-bold text-[13px] rounded-full transition-colors flex items-center justify-center disabled:opacity-50"
              >
                {submitLoading ? 'Submitting...' : 'Submit Idea'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default FeedbackRoadmap;
