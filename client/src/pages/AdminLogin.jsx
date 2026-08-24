import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ShieldAlert, Lock, Mail, ArrowRight, Eye, EyeOff } from 'lucide-react';
import './Login.css';

export const AdminLogin = () => {
  const { login, showToast } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const result = await login(email, password);
      if (result.success && result.user?.role === 'admin') {
        showToast('Admin login successful!', 'success');
        navigate('/admin/dashboard');
      } else {
        showToast('Not an admin account', 'error');
      }
    } catch {
      showToast('Login failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page-wrapper">
      <div className="auth-card-container">

        {/* Icon */}
        <div style={{ width: '4rem', height: '4rem', backgroundColor: '#fff1f2', borderRadius: '9999px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem auto' }}>
          <ShieldAlert style={{ width: '28px', height: '28px', color: '#e11d48' }} />
        </div>

        <div className="auth-header">
          <h1 className="auth-title">Admin Simulator</h1>
          <p className="auth-subtitle">Development-only admin login</p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="auth-field">
            <label className="auth-label">Email</label>
            <div className="auth-input-wrapper">
              <Mail className="auth-input-icon" />
              <input 
                type="email" 
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
                className="auth-input" 
                placeholder="Admin Email" 
              />
            </div>
          </div>
          <div className="auth-field">
            <label className="auth-label">Password</label>
            <div className="auth-input-wrapper">
              <Lock className="auth-input-icon" />
              <input 
                type={showPassword ? 'text' : 'password'} 
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
                className="auth-input" 
                placeholder="Password" 
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
          <button 
            type="submit" 
            disabled={loading} 
            className="auth-submit-btn" 
            style={{ backgroundColor: '#e11d48' }}
          >
            {loading ? (
              <div className="auth-btn-spinner" />
            ) : (
              <>
                Enter Admin Dashboard <ArrowRight style={{ width: '16px', height: '16px' }} />
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AdminLogin;
