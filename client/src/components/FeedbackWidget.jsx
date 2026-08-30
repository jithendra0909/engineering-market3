import React, { useState } from 'react';
import { MessageSquare, X, Send, Sparkles, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import api from '../api/axios';
import './FeedbackWidget.css';

const FeedbackWidget = () => {
  const { user, isLoggedIn, showToast } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const [category, setCategory] = useState('feature'); // feature, bug, general
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);

  // Show feedback widget ONLY on the home page ('/') and when user is logged in
  if (location.pathname !== '/' || !isLoggedIn) return null;

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
        className="feedback-fab"
        title="Send feedback or suggest features"
      >
        <MessageSquare style={{ width: '20px', height: '20px' }} />
      </button>

      {/* Slide-out Feedback Drawer */}
      {isOpen && (
        <div className="feedback-drawer-overlay">
          <div className="feedback-drawer-backdrop" onClick={() => setIsOpen(false)} />
          
          <form 
            onSubmit={handleSubmit}
            className="feedback-drawer-form animate-fadeInUp"
          >
            {/* Header */}
            <div className="feedback-header">
              <h3 className="feedback-header-title">
                <Sparkles style={{ width: '16px', height: '16px', color: '#6C4EFF' }} /> Share Your Feedback
              </h3>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="feedback-close-btn"
              >
                <X style={{ width: '16px', height: '16px' }} />
              </button>
            </div>

            <p className="feedback-subtext">
              Have an idea for a feature or found a bug? Tell us! You can also check our public roadmap to view and upvote other requests.
            </p>

            {/* Category selection */}
            <div>
              <label className="feedback-label">Category</label>
              <div className="feedback-category-grid">
                {['feature', 'bug', 'general'].map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setCategory(cat)}
                    className={`feedback-cat-btn ${category === cat ? 'selected' : ''}`}
                  >
                    {cat === 'feature' ? '💡 Idea' : cat === 'bug' ? '🐛 Bug' : '💬 Other'}
                  </button>
                ))}
              </div>
            </div>

            {/* Title */}
            <div>
              <label className="feedback-label">Title</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Brief summary (e.g., Add dark mode)"
                className="feedback-input"
                maxLength={80}
              />
            </div>

            {/* Description */}
            <div>
              <label className="feedback-label">Description</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe your idea or the bug in detail..."
                rows={3}
                className="feedback-textarea"
              />
            </div>

            {/* Buttons */}
            <div className="feedback-actions">
              <button
                type="submit"
                disabled={loading}
                className="feedback-submit-btn"
              >
                <Send style={{ width: '14px', height: '14px' }} /> {loading ? 'Submitting...' : 'Send Feedback'}
              </button>
              
              <button
                type="button"
                onClick={() => {
                  setIsOpen(false);
                  navigate('/feedback-roadmap');
                }}
                className="feedback-roadmap-btn"
              >
                <AlertCircle style={{ width: '14px', height: '14px' }} /> View Public Roadmap
              </button>
            </div>
          </form>
        </div>
      )}
    </>
  );
};

export default FeedbackWidget;
