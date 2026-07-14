import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Logo } from '../components/Logo';
import { User, Mail, Phone, Lock, Hash, BookOpen, Calendar, Camera, Upload, ArrowRight, Eye, EyeOff, GraduationCap } from 'lucide-react';

const DEPARTMENTS = [
  'Computer Science and Engineering',
  'Electronics and Communication Engineering',
  'Electrical Engineering',
  'Mechanical Engineering',
  'Civil Engineering',
  'Information Technology',
  'Chemical Engineering',
  'Other'
];

const YEARS = ['1st Year', '2nd Year', '3rd Year', '4th Year'];

export const Signup = () => {
  const { signup, loading, showToast, colleges } = useAuth();
  const navigate = useNavigate();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [whatsappNumber, setWhatsappNumber] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [registrationNumber, setRegistrationNumber] = useState('');
  const [department, setDepartment] = useState('');
  const [year, setYear] = useState('1st Year');
  const [college, setCollege] = useState('');
  const [idCardFile, setIdCardFile] = useState(null);
  const [idCardPreview, setIdCardPreview] = useState('');
  const [error, setError] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setIdCardFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setIdCardPreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!fullName || !email || !whatsappNumber || !password || !registrationNumber || !department || !year || !college) {
      setError('Please fill in all fields.');
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.(edu\.in|com)$/i;
    if (!emailRegex.test(email)) {
      setError('Email must be a valid address ending with .edu.in or .com (e.g., user@domain.edu.in or user@domain.com).');
      return;
    }
    if (whatsappNumber.length !== 10) {
      setError('WhatsApp number must be exactly 10 digits.');
      return;
    }
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
    if (!passwordRegex.test(password)) {
      setError('Password must be at least 8 characters long and include:\n✓ At least 1 uppercase letter (A-Z)\n✓ At least 1 lowercase letter (a-z)\n✓ At least 1 numeric digit (0-9)');
      return;
    }
    if (!idCardFile) {
      setError('Please upload your college ID card.');
      return;
    }

    const formData = new FormData();
    formData.append('fullName', fullName);
    formData.append('email', email);
    formData.append('whatsappNumber', '+91' + whatsappNumber);
    formData.append('password', password);
    formData.append('registrationNumber', registrationNumber);
    formData.append('department', department);
    formData.append('year', year);
    formData.append('college', college);
    // Compress image before appending to avoid Vercel 4.5MB payload limits
    const compressImage = (file) => {
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = (event) => {
          const img = new Image();
          img.src = event.target.result;
          img.onload = () => {
            const canvas = document.createElement('canvas');
            const MAX_WIDTH = 1200;
            const MAX_HEIGHT = 1200;
            let width = img.width;
            let height = img.height;

            if (width > height) {
              if (width > MAX_WIDTH) {
                height *= MAX_WIDTH / width;
                width = MAX_WIDTH;
              }
            } else {
              if (height > MAX_HEIGHT) {
                width *= MAX_HEIGHT / height;
                height = MAX_HEIGHT;
              }
            }

            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0, width, height);
            canvas.toBlob((blob) => {
              const compressedFile = new File([blob], file.name.replace(/\.[^/.]+$/, "") + ".jpg", {
                type: 'image/jpeg',
                lastModified: Date.now()
              });
              resolve(compressedFile);
            }, 'image/jpeg', 0.7); // 70% quality JPEG
          };
        };
      });
    };

    const compressedIdCard = await compressImage(idCardFile);
    formData.append('idCardImage', compressedIdCard);

    const result = await signup(formData);
    if (result.success) {
      setIsSuccess(true);
      showToast('Account created! Pending admin verification.', 'success');
    } else {
      setError(result.message || 'Signup failed');
    }
  };

  /* ── Success state ── */
  if (isSuccess) {
    return (
      <div className="min-h-[calc(100vh-64px)] flex items-center justify-center px-5 py-12">
        <div className="max-w-[400px] text-center">
          <div className="w-16 h-16 bg-[#EEF9F2] rounded-full flex items-center justify-center mx-auto mb-5">
            <GraduationCap className="w-8 h-8 text-emerald-600 stroke-[1.8]" />
          </div>
          <h2 className="text-[22px] font-bold text-[#111827] mb-2">Registration Submitted!</h2>
          <p className="text-[13px] text-[#9CA3AF] leading-relaxed mb-8">
            Your student account has been created and is pending verification. An admin will review your ID card shortly.
          </p>
          <Link
            to="/login"
            className="inline-flex items-center gap-2 bg-[#6C4EFF] hover:bg-[#8A72FF] text-white font-bold text-[14px] px-6 py-3 rounded-full transition-all active:scale-[0.98]"
          >
            Go to Login <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    );
  }

  const inputClass = "w-full h-12 pl-11 pr-4 bg-[#FAFAFF] border border-[#E9E6F8] rounded-[14px] text-[13px] text-[#111827] placeholder-[#9CA3AF] focus:bg-white focus:border-[#6C4EFF]/30 focus:outline-none focus:ring-2 focus:ring-[#6C4EFF]/10 transition-all";
  const selectClass = "w-full h-12 pl-11 pr-4 bg-[#FAFAFF] border border-[#E9E6F8] rounded-[14px] text-[13px] text-[#111827] focus:bg-white focus:border-[#6C4EFF]/30 focus:outline-none focus:ring-2 focus:ring-[#6C4EFF]/10 transition-all appearance-none cursor-pointer";
  const labelClass = "text-[12px] font-semibold text-[#6B7280] block mb-1.5";

  return (
    <div className="min-h-[calc(100vh-64px)] flex items-center justify-center px-5 py-12">
      <div className="w-full max-w-[440px]">

        {/* Logo */}
        <div className="flex justify-center mb-6">
          <Link to="/">
            <Logo size={40} showText={false} />
          </Link>
        </div>

        {/* Header */}
        <div className="text-center mb-6">
          <h1 className="text-[24px] font-bold text-[#111827]">Create Account</h1>
          <p className="text-[13px] text-[#9CA3AF] mt-1">Join the Engineering Market student community</p>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-4 p-3 bg-rose-50 border border-rose-200 rounded-[12px] text-rose-600 text-[12px] font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-3.5">
          {/* Full Name */}
          <div>
            <label className={labelClass}>Full Name</label>
            <div className="relative">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9CA3AF]" />
              <input type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="John Doe" className={inputClass} />
            </div>
          </div>

          {/* Email */}
          <div>
            <label className={labelClass}>Email</label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9CA3AF]" />
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="your.email@gmail.com" className={inputClass} />
            </div>
          </div>

          {/* WhatsApp */}
          <div>
            <label className={labelClass}>WhatsApp Number</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[13px] font-bold text-[#111827]">+91</span>
              <input
                type="tel"
                value={whatsappNumber}
                onChange={(e) => setWhatsappNumber(e.target.value.replace(/\D/g, '').slice(0, 10))}
                placeholder="9876543210"
                className="w-full h-12 pl-14 pr-4 bg-[#FAFAFF] border border-[#E9E6F8] rounded-[14px] text-[13px] text-[#111827] placeholder-[#9CA3AF] focus:bg-white focus:border-[#6C4EFF]/30 focus:outline-none focus:ring-2 focus:ring-[#6C4EFF]/10 transition-all"
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label className={labelClass}>Password</label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9CA3AF]" />
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Create a strong password"
                className="w-full h-12 pl-11 pr-12 bg-[#FAFAFF] border border-[#E9E6F8] rounded-[14px] text-[13px] text-[#111827] placeholder-[#9CA3AF] focus:bg-white focus:border-[#6C4EFF]/30 focus:outline-none focus:ring-2 focus:ring-[#6C4EFF]/10 transition-all"
              />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-[#9CA3AF] hover:text-[#6B7280]">
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Registration Number */}
          <div>
            <label className={labelClass}>Registration Number</label>
            <div className="relative">
              <Hash className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9CA3AF]" />
              <input type="text" value={registrationNumber} onChange={(e) => setRegistrationNumber(e.target.value)} placeholder="e.g. 21BCE7001" className={inputClass} />
            </div>
          </div>

          {/* Department + Year row */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelClass}>Department</label>
              <div className="relative">
                <BookOpen className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9CA3AF] z-10" />
                <select value={department} onChange={(e) => setDepartment(e.target.value)} className={selectClass}>
                  <option value="">Select</option>
                  {DEPARTMENTS.map((d) => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>
            </div>
            <div>
              <label className={labelClass}>Year</label>
              <div className="relative">
                <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9CA3AF] z-10" />
                <select value={year} onChange={(e) => setYear(e.target.value)} className={selectClass}>
                  {YEARS.map((y) => <option key={y} value={y}>{y}</option>)}
                </select>
              </div>
            </div>
          </div>

          {/* College */}
          <div>
            <label className={labelClass}>College</label>
            <div className="relative">
              <GraduationCap className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9CA3AF] z-10" />
              <select value={college} onChange={(e) => setCollege(e.target.value)} className={selectClass}>
                <option value="">Select your college</option>
                {colleges && colleges.length > 0 ? (
                  colleges.map((c) => (
                    <option key={c._id || c.name} value={c.name}>
                      {c.name}
                    </option>
                  ))
                ) : (
                  <>
                    <option value="Vignan's Institute of Engineering for Women (VIEW)">Vignan's Institute of Engineering for Women (VIEW)</option>
                    <option value="Vignan's Institute of Information Technology (VIIT)">Vignan's Institute of Information Technology (VIIT)</option>
                  </>
                )}
              </select>
            </div>
          </div>

          {/* ID Card Upload */}
          <div>
            <label className={labelClass}>College ID Card</label>
            <label className="flex flex-col items-center justify-center border-2 border-dashed border-[#E9E6F8] rounded-[16px] p-5 cursor-pointer hover:border-[#6C4EFF]/30 hover:bg-[#FAFAFF] transition-all">
              {idCardPreview ? (
                <img src={idCardPreview} alt="ID Preview" className="w-full max-h-[150px] object-contain rounded-[10px]" />
              ) : (
                <>
                  <div className="w-12 h-12 bg-[#F4F1FF] rounded-full flex items-center justify-center mb-2">
                    <Camera className="w-5 h-5 text-[#6C4EFF]" />
                  </div>
                  <p className="text-[12px] font-semibold text-[#6B7280]">Upload your college ID card</p>
                  <p className="text-[10px] text-[#9CA3AF] mt-0.5">JPG, PNG up to 5MB</p>
                </>
              )}
              <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
            </label>
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
              <>Create Account <ArrowRight className="w-4 h-4" /></>
            )}
          </button>
        </form>

        {/* Login link */}
        <p className="text-center text-[13px] text-[#9CA3AF] mt-6">
          Already have an account?{' '}
          <Link to="/login" className="text-[#6C4EFF] font-semibold hover:underline">
            Sign In
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Signup;
