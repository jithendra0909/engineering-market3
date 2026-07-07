import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Mail, Lock, ArrowRight, Eye, EyeOff } from 'lucide-react';

export const Login = () => {
  const { login, showToast } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      showToast('Please enter email and password', 'error');
      return;
    }
    setLoading(true);
    try {
      const result = await login(email, password);
      if (result.success) {
        showToast('Welcome back!', 'success');
        if (result.user?.role === 'admin') {
          navigate('/admin/dashboard');
        } else {
          navigate('/');
        }
      } else {
        showToast(result.message || 'Login failed', 'error');
      }
    } catch {
      showToast('Login failed. Please try again.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-64px)] flex items-center justify-center px-5 py-12">
      <div className="w-full max-w-[400px]">

        {/* Logo */}
        <div className="flex justify-center mb-8">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="w-10 h-10 bg-[#111827] rounded-full flex items-center justify-center">
              <span className="text-white text-[13px] font-extrabold tracking-tight leading-none">EM</span>
            </div>
          </Link>
        </div>

        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-[24px] font-bold text-[#111827]">Welcome back</h1>
          <p className="text-[13px] text-[#9CA3AF] mt-1">Sign in to your Engineering Market account</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {/* Email */}
          <div>
            <label className="text-[12px] font-semibold text-[#6B7280] block mb-1.5">Email</label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9CA3AF]" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your.email@college.edu"
                className="w-full h-12 pl-11 pr-4 bg-[#FAFAFF] border border-[#E9E6F8] rounded-[14px] text-[13px] text-[#111827] placeholder-[#9CA3AF] focus:bg-white focus:border-[#6C4EFF]/30 focus:outline-none focus:ring-2 focus:ring-[#6C4EFF]/10 transition-all"
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label className="text-[12px] font-semibold text-[#6B7280] block mb-1.5">Password</label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9CA3AF]" />
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                className="w-full h-12 pl-11 pr-12 bg-[#FAFAFF] border border-[#E9E6F8] rounded-[14px] text-[13px] text-[#111827] placeholder-[#9CA3AF] focus:bg-white focus:border-[#6C4EFF]/30 focus:outline-none focus:ring-2 focus:ring-[#6C4EFF]/10 transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-[#9CA3AF] hover:text-[#6B7280] transition-colors"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
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
              <>Sign In <ArrowRight className="w-4 h-4" /></>
            )}
          </button>
        </form>

        {/* Sign up link */}
        <p className="text-center text-[13px] text-[#9CA3AF] mt-6">
          Don't have an account?{' '}
          <Link to="/signup" className="text-[#6C4EFF] font-semibold hover:underline">
            Sign Up
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
