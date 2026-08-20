import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Logo } from '../components/Logo';
import { Mail, ArrowLeft, ArrowRight } from 'lucide-react';
import api from '../api/axios';
import './Login.css';

export const ForgotPassword = () => {
  const { showToast } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [debugUrl, setDebugUrl] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) {
      showToast('Please enter your email address', 'error');
      return;
    }
    setLoading(true);
    try {
      const { data } = await api.post('/auth/forgot-password', { email });
      showToast(data.message || 'Reset link sent successfully!', 'success');
      setSubmitted(true);
      if (data.debugUrl) {
        let url = data.debugUrl;
        if (url.includes('localhost:5000')) {
          url = url.replace('localhost:5000', 'localhost:5173');
        }
        setDebugUrl(url);
      }
    } catch (err) {
      const errorMsg = err.response?.data?.error || err.response?.data?.message || 'Failed to request password reset';
      showToast(errorMsg, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page-wrapper">
      <div className="auth-card-container">
        {/* Logo */}
        <div className="auth-logo-row">
          <Link to="/">
            <Logo size={40} showText={false} />
          </Link>
        </div>

        {!submitted ? (
          <>
            {/* Header */}
            <div className="auth-header">
              <h1 className="auth-title" style={{ fontSize: '24px' }}>Reset Password</h1>
              <p className="auth-subtitle">Enter your email address to receive a secure link to reset your password</p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="auth-form">
              {/* Email */}
              <div className="auth-field">
                <label className="auth-label">Email Address</label>
                <div className="auth-input-wrapper">
                  <Mail className="auth-input-icon" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="your.email@gmail.com"
                    className="auth-input"
                  />
                </div>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                className="auth-submit-btn"
              >
                {loading ? (
                  <div className="auth-btn-spinner animate-spin" />
                ) : (
                  <>Send Reset Link <ArrowRight style={{ width: '16px', height: '16px' }} /></>
                )}
              </button>
            </form>
          </>
        ) : (
          <div style={{ textAlign: 'center', backgroundColor: '#FAFAFF', border: '1px solid #E9E6F8', borderRadius: '24px', padding: '1.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
            <h3 style={{ fontWeight: 700, fontSize: '18px', color: '#111827', margin: '0 0 0.5rem 0' }}>Check Your Email</h3>
            <p style={{ fontSize: '13px', color: '#6B7280', lineHeight: 1.625, margin: '0 0 1rem 0' }}>
              A secure password reset link has been generated. If the account exists, you will receive an email shortly.
            </p>
            {debugUrl && (
              <div style={{ marginTop: '1rem', padding: '1rem', backgroundColor: '#eff6ff', border: '1px solid #dbeafe', borderRadius: '16px', textAlign: 'left' }}>
                <p style={{ fontSize: '11px', fontWeight: 700, color: '#4338ca', textTransform: 'uppercase', letterSpacing: '0.05em', margin: '0 0 0.25rem 0' }}>Development Debug Link:</p>
                <p style={{ fontSize: '11px', color: '#6B7280', wordBreak: 'break-all', userSelect: 'all', fontFamily: 'monospace', lineHeight: 1.25, margin: '0 0 0.75rem 0' }}>
                  {debugUrl}
                </p>
                <a
                  href={debugUrl}
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', fontSize: '12px', fontWeight: 700, color: '#6C4EFF', textDecoration: 'none' }}
                >
                  Click here to go to Reset Page <ArrowRight style={{ width: '14px', height: '14px' }} />
                </a>
              </div>
            )}
          </div>
        )}

        {/* Back to Login link */}
        <div style={{ textAlign: 'center', marginTop: '2rem' }}>
          <Link to="/login" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.375rem', fontSize: '13px', fontWeight: 600, color: '#6C4EFF', textDecoration: 'none' }}>
            <ArrowLeft style={{ width: '16px', height: '16px' }} /> Back to Log In
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
