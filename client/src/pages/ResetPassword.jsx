import React, { useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Logo } from '../components/Logo';
import { Lock, ArrowRight, Eye, EyeOff, CheckCircle2 } from 'lucide-react';
import api from '../api/axios';
import './Login.css';

export const ResetPassword = () => {
  const { token } = useParams();
  const { showToast } = useAuth();
  const navigate = useNavigate();

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!password || !confirmPassword) {
      showToast('Please fill in both fields', 'error');
      return;
    }
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
    if (!passwordRegex.test(password)) {
      showToast('Password must be at least 8 characters long and include: at least 1 uppercase letter, 1 lowercase letter, and 1 numeric digit.', 'error');
      return;
    }
    if (password !== confirmPassword) {
      showToast('Passwords do not match', 'error');
      return;
    }
    setLoading(true);
    try {
      const { data } = await api.post(`/auth/reset-password/${token}`, { password });
      showToast(data.message || 'Password reset successfully!', 'success');
      setSuccess(true);
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to reset password. Link may be invalid or expired.', 'error');
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

        {!success ? (
          <>
            {/* Header */}
            <div className="auth-header">
              <h1 className="auth-title" style={{ fontSize: '24px' }}>Set New Password</h1>
              <p className="auth-subtitle">Please enter your new password below</p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="auth-form">
              {/* New Password */}
              <div className="auth-field">
                <label className="auth-label">New Password</label>
                <div className="auth-input-wrapper">
                  <Lock className="auth-input-icon" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="At least 6 characters"
                    className="auth-input has-toggle"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="auth-eye-btn"
                  >
                    {showPassword ? <EyeOff style={{ width: '16px', height: '16px' }} /> : <Eye style={{ width: '16px', height: '16px' }} />}
                  </button>
                </div>
              </div>

              {/* Confirm Password */}
              <div className="auth-field">
                <label className="auth-label">Confirm New Password</label>
                <div className="auth-[#6C4EFF]-wrapper" style={{ position: 'relative' }}>
                  <Lock className="auth-input-icon" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm new password"
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
                  <>Reset Password <ArrowRight style={{ width: '16px', height: '16px' }} /></>
                )}
              </button>
            </form>
          </>
        ) : (
          <div style={{ textAlign: 'center', backgroundColor: '#FAFAFF', border: '1px solid #E9E6F8', borderRadius: '24px', padding: '1.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
            <div style={{ width: '3rem', height: '3rem', borderRadius: '9999px', backgroundColor: '#ecfdf5', color: '#059669', display: 'flex', alignItems: 'center', justifyCenter: 'center', margin: '0 auto 1rem auto', border: '1px solid #a7f3d0' }}>
              <CheckCircle2 style={{ width: '24px', height: '24px', strokeWidth: 2 }} />
            </div>
            <h3 style={{ fontWeight: 700, fontSize: '18px', color: '#111827', margin: '0 0 0.5rem 0' }}>Password Reset Successful</h3>
            <p style={{ fontSize: '13px', color: '#6B7280', lineHeight: 1.625, margin: '0 0 1.5rem 0' }}>
              Your password has been successfully updated. You can now log in with your new password.
            </p>
            <Link
              to="/login"
              className="auth-submit-btn"
              style={{ textDecoration: 'none' }}
            >
              Go to Sign In <ArrowRight style={{ width: '16px', height: '16px' }} />
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default ResetPassword;
