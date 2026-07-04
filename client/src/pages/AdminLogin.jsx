import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ShieldAlert, Lock, Mail, ArrowRight, Eye, EyeOff } from 'lucide-react';

export const AdminLogin = () => {
  const { login, showToast } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('admin@engineeringmarket.com');
  const [password, setPassword] = useState('admin123');
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
    <div className="min-h-[calc(100vh-64px)] flex items-center justify-center px-5 py-12">
      <div className="w-full max-w-[400px]">

        {/* Icon */}
        <div className="flex justify-center mb-6">
          <div className="w-14 h-14 bg-rose-50 rounded-full flex items-center justify-center">
            <ShieldAlert className="w-7 h-7 text-rose-600 stroke-[1.8]" />
          </div>
        </div>

        <div className="text-center mb-6">
          <h1 className="text-[22px] font-bold text-[#111827]">Admin Simulator</h1>
          <p className="text-[13px] text-[#9CA3AF] mt-1">Development-only admin login</p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="text-[12px] font-semibold text-[#6B7280] block mb-1.5">Email</label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9CA3AF]" />
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full h-12 pl-11 pr-4 bg-[#FAFAFF] border border-[#E9E6F8] rounded-[14px] text-[13px] text-[#111827] focus:bg-white focus:border-[#6C4EFF]/30 focus:outline-none focus:ring-2 focus:ring-[#6C4EFF]/10 transition-all" />
            </div>
          </div>
          <div>
            <label className="text-[12px] font-semibold text-[#6B7280] block mb-1.5">Password</label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9CA3AF]" />
              <input type={showPassword ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)} className="w-full h-12 pl-11 pr-12 bg-[#FAFAFF] border border-[#E9E6F8] rounded-[14px] text-[13px] text-[#111827] focus:bg-white focus:border-[#6C4EFF]/30 focus:outline-none focus:ring-2 focus:ring-[#6C4EFF]/10 transition-all" />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-[#9CA3AF]">
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>
          <button type="submit" disabled={loading} className="w-full h-12 bg-rose-600 hover:bg-rose-700 text-white font-bold text-[14px] rounded-full shadow-sm transition-all active:scale-[0.98] disabled:opacity-60 flex items-center justify-center gap-2 mt-2">
            {loading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <>Enter Admin Dashboard <ArrowRight className="w-4 h-4" /></>}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AdminLogin;
