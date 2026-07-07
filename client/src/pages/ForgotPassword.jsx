import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Logo } from '../components/Logo';
import { Mail, ArrowLeft, ArrowRight } from 'lucide-react';
import api from '../api/axios';

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
    <div className="min-h-[calc(100vh-64px)] flex items-center justify-center px-5 py-12">
      <div className="w-full max-w-[400px]">
        {/* Logo */}
        <div className="flex justify-center mb-8">
          <Link to="/">
            <Logo size={40} showText={false} />
          </Link>
        </div>

        {!submitted ? (
          <>
            {/* Header */}
            <div className="text-center mb-8">
              <h1 className="text-[24px] font-bold text-[#111827]">Reset Password</h1>
              <p className="text-[13px] text-[#9CA3AF] mt-1">Enter your email address to receive a secure link to reset your password</p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              {/* Email */}
              <div>
                <label className="text-[12px] font-semibold text-[#6B7280] block mb-1.5">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9CA3AF]" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="your.email@gmail.com"
                    className="w-full h-12 pl-11 pr-4 bg-[#FAFAFF] border border-[#E9E6F8] rounded-[14px] text-[13px] text-[#111827] placeholder-[#9CA3AF] focus:bg-white focus:border-[#6C4EFF]/30 focus:outline-none focus:ring-2 focus:ring-[#6C4EFF]/10 transition-all"
                  />
                </div>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                className="w-full h-12 bg-[#6C4EFF] hover:bg-[#8A72FF] text-white font-bold text-[14px] rounded-full shadow-sm transition-all active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-2"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>Send Reset Link <ArrowRight className="w-4 h-4" /></>
                )}
              </button>
            </form>
          </>
        ) : (
          <div className="text-center bg-[#FAFAFF] border border-[#E9E6F8] rounded-3xl p-6 shadow-sm">
            <h3 className="font-bold text-[18px] text-[#111827] mb-2">Check Your Email</h3>
            <p className="text-[13px] text-[#6B7280] leading-relaxed mb-4">
              A secure password reset link has been generated. If the account exists, you will receive an email shortly.
            </p>
            {debugUrl && (
              <div className="mt-4 p-4 bg-indigo-50 border border-indigo-100 rounded-2xl text-left">
                <p className="text-[11px] font-bold text-indigo-700 uppercase tracking-wider mb-1">Development Debug Link:</p>
                <p className="text-[11px] text-[#6B7280] break-all select-all font-mono leading-tight mb-3">
                  {debugUrl}
                </p>
                <a
                  href={debugUrl}
                  className="inline-flex items-center gap-1 text-xs font-bold text-[#6C4EFF] hover:underline"
                >
                  Click here to go to Reset Page <ArrowRight className="w-3.5 h-3.5" />
                </a>
              </div>
            )}
          </div>
        )}

        {/* Back to Login link */}
        <div className="text-center mt-8">
          <Link to="/login" className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-[#6C4EFF] hover:underline">
            <ArrowLeft className="w-4 h-4" /> Back to Log In
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
