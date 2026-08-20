import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { ArrowUp, Sparkles, MessageSquare, Plus, CheckCircle, Clock, Play } from 'lucide-react';
import api from '../api/axios';
import './FeedbackRoadmap.css';

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

  const filteredList = feedbackList.filter(item => {
    if (filter === 'all') return true;
    if (filter === 'feature') return item.category === 'feature';
    if (filter === 'bug') return item.category === 'bug';
    if (filter === 'planned') return ['planned', 'reviewing'].includes(item.status);
    if (filter === 'completed') return item.status === 'completed';
    return true;
  });

  return (
    <div className="roadmap-container animate-fadeIn">
      {/* Title */}
      <div className="roadmap-header">
        <div>
          <h1 className="roadmap-title">
            <Sparkles style={{ width: '24px', height: '24px', color: '#6C4EFF' }} /> Product Roadmap
          </h1>
          <p style={{ fontSize: '12px', color: '#6B7280', marginTop: '6px', lineHeight: 1.5, margin: 0 }}>
            Suggest new features, report bugs, and vote on what we should build next!
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          style={{ height: '44px', paddingLeft: '1.5rem', paddingRight: '1.5rem', borderRadius: '9999px', backgroundColor: '#6C4EFF', color: '#ffffff', fontSize: '12px', fontWeight: 700, border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', cursor: 'pointer' }}
        >
          <Plus style={{ width: '16px', height: '16px' }} /> Suggest Feature
        </button>
      </div>

      {/* Roadmap Filters */}
      <div className="roadmap-filters">
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
            className={`roadmap-filter-btn ${filter === item.key ? 'active' : ''}`}
          >
            {item.label}
          </button>
        ))}
      </div>

      {/* Roadmap Content */}
      {loading ? (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '5rem 0' }}>
          <div className="animate-spin" style={{ width: '40px', height: '40px', border: '4px solid #6C4EFF', borderTopColor: 'transparent', borderRadius: '9999px' }} />
        </div>
      ) : filteredList.length > 0 ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', textAlign: 'left' }}>
          {filteredList.map((item) => {
            const hasUpvoted = item.upvotes.includes(user?._id);

            return (
              <div 
                key={item._id}
                className="roadmap-card"
              >
                {/* Upvote column */}
                <button
                  onClick={() => handleUpvote(item._id)}
                  className={`roadmap-upvote-btn ${hasUpvoted ? 'upvoted' : ''}`}
                >
                  <ArrowUp style={{ width: '16px', height: '16px' }} />
                  <span style={{ fontSize: '11px', fontWeight: 900, marginTop: '4px' }}>{item.upvotes.length}</span>
                </button>

                {/* Main details */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '8px' }}>
                    {/* Category tag */}
                    <span style={{ fontSize: '9px', fontWeight: 700, padding: '2px 8px', borderRadius: '9999px', textTransform: 'uppercase', letterSpacing: '0.05em', border: '1px solid', backgroundColor: item.category === 'feature' ? '#e0e7ff' : (item.category === 'bug' ? '#fff1f2' : '#f8fafc'), color: item.category === 'feature' ? '#4338ca' : (item.category === 'bug' ? '#e11d48' : '#475569'), borderColor: item.category === 'feature' ? '#c7d2fe' : (item.category === 'bug' ? '#ffe4e6' : '#e2e8f0') }}>
                      {item.category === 'feature' ? 'Idea' : item.category === 'bug' ? 'Bug' : 'General'}
                    </span>

                    {/* Status tag */}
                    {item.status !== 'pending' && (
                      <span style={{ fontSize: '9px', fontWeight: 800, padding: '2px 8px', borderRadius: '9999px', textTransform: 'uppercase', display: 'inline-flex', alignItems: 'center', gap: '4px', border: '1px solid', backgroundColor: item.status === 'completed' ? '#ecfdf5' : (['planned', 'reviewing'].includes(item.status) ? '#fffbeb' : '#f1f5f9'), color: item.status === 'completed' ? '#059669' : (['planned', 'reviewing'].includes(item.status) ? '#d97706' : '#64748b'), borderColor: item.status === 'completed' ? '#a7f3d0' : (['planned', 'reviewing'].includes(item.status) ? '#fde68a' : '#e2e8f0') }}>
                        {item.status === 'completed' ? (
                          <>
                            <CheckCircle style={{ width: '10px', height: '10px' }} /> Finished
                          </>
                        ) : item.status === 'planned' ? (
                          <>
                            <Play style={{ width: '10px', height: '10px' }} /> Planned
                          </>
                        ) : item.status === 'reviewing' ? (
                          <>
                            <Clock style={{ width: '10px', height: '10px' }} /> In Review
                          </>
                        ) : (
                          'Dismissed'
                        )}
                      </span>
                    )}
                  </div>

                  <h3 style={{ fontWeight: 700, fontSize: '14px', color: '#111827', marginTop: '8px', lineHeight: 1.4, margin: '8px 0 0 0' }}>
                    {item.title}
                  </h3>
                  
                  <p style={{ fontSize: '12px', color: '#6B7280', marginTop: '6px', lineHeight: 1.5, wordBreak: 'break-word', margin: '6px 0 0 0' }}>
                    {item.description}
                  </p>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '1rem', fontSize: '10px', color: '#9CA3AF', fontWeight: 700 }}>
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
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '5rem 0', textAlign: 'center', backgroundColor: '#ffffff', border: '1px solid #E9E6F8', borderRadius: '24px' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '9999px', backgroundColor: '#FAFAFF', border: '1px solid #E9E6F8', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9ca3af', marginBottom: '1rem' }}>
            <MessageSquare style={{ width: '24px', height: '24px' }} />
          </div>
          <h3 style={{ fontWeight: 700, fontSize: '14px', color: '#111827', margin: 0 }}>No requests found</h3>
          <p style={{ fontSize: '12px', color: '#6B7280', maxWidth: '280px', marginTop: '4px', lineHeight: 1.5, margin: '4px 0 0 0' }}>
            Be the first to submit a suggestion to improve the platform!
          </p>
        </div>
      )}

      {/* Suggestion Modal Form */}
      {isModalOpen && (
        <div className="profile-modal-overlay">
          <form 
            onSubmit={handleSubmitFeedback}
            className="profile-modal-content animate-scaleIn"
            style={{ padding: '1.5rem', gap: '1rem', textAlign: 'left' }}
          >
            <h3 style={{ fontWeight: 700, fontSize: '16px', color: '#111827', display: 'flex', alignItems: 'center', gap: '8px', margin: 0 }}>
              <Plus style={{ width: '20px', height: '20px', color: '#6C4EFF' }} /> Submit Feature Idea
            </h3>
            
            <div>
              <label className="auth-label">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="auth-input"
                style={{ cursor: 'pointer' }}
              >
                <option value="feature">💡 Feature Suggestion</option>
                <option value="bug">🐛 Bug Report</option>
                <option value="general">💬 General Feedback</option>
              </select>
            </div>

            <div>
              <label className="auth-label">Title</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="What is your request?"
                className="auth-input"
                required
              />
            </div>

            <div>
              <label className="auth-label">Details</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe your request in detail. How will this help students?"
                rows={4}
                className="auth-input"
                style={{ height: 'auto', padding: '1rem', resize: 'none' }}
                required
              />
            </div>

            <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                style={{ flex: 1, height: '44px', border: '1px solid #E9E6F8', color: '#6B7280', fontWeight: 700, fontSize: '13px', borderRadius: '9999px', backgroundColor: '#ffffff', cursor: 'pointer' }}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitLoading}
                style={{ flex: 1, height: '44px', backgroundColor: '#6C4EFF', color: '#ffffff', fontWeight: 700, fontSize: '13px', borderRadius: '9999px', border: 'none', cursor: 'pointer', opacity: submitLoading ? 0.5 : 1 }}
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
