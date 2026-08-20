import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Logo } from '../components/Logo';
import { User, Mail, Lock, Hash, BookOpen, Calendar, Camera, ArrowRight, Eye, EyeOff, GraduationCap } from 'lucide-react';
import './Signup.css';

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
            }, 'image/jpeg', 0.7);
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
      <div className="signup-page-wrapper">
        <div className="signup-success-container">
          <div className="signup-success-icon-box">
            <GraduationCap style={{ width: '32px', height: '32px', color: '#059669', strokeWidth: 1.8 }} />
          </div>
          <h2 className="signup-success-title">Registration Submitted!</h2>
          <p className="signup-success-desc">
            Your student account has been created and is pending verification. An admin will review your ID card shortly.
          </p>
          <Link
            to="/login"
            className="signup-success-btn"
          >
            Go to Login <ArrowRight style={{ width: '16px', height: '16px' }} />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="signup-page-wrapper">
      <div className="signup-card-container">

        {/* Logo */}
        <div className="signup-logo-row">
          <Link to="/">
            <Logo size={40} showText={false} />
          </Link>
        </div>

        {/* Header */}
        <div className="signup-header">
          <h1 className="signup-title">Create Account</h1>
          <p className="signup-subtitle">Join the Engineering Market student community</p>
        </div>

        {/* Error */}
        {error && (
          <div className="signup-error-box">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="signup-form">
          {/* Full Name */}
          <div className="signup-field">
            <label className="signup-label">Full Name</label>
            <div className="signup-input-wrapper">
              <User className="signup-input-icon" />
              <input type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="John Doe" className="signup-input" />
            </div>
          </div>

          {/* Email */}
          <div className="signup-field">
            <label className="signup-label">Email</label>
            <div className="signup-input-wrapper">
              <Mail className="signup-input-icon" />
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="your.email@gmail.com" className="signup-input" />
            </div>
          </div>

          {/* WhatsApp */}
          <div className="signup-field">
            <label className="signup-label">WhatsApp Number</label>
            <div className="signup-input-wrapper">
              <span className="signup-prefix">+91</span>
              <input
                type="tel"
                value={whatsappNumber}
                onChange={(e) => setWhatsappNumber(e.target.value.replace(/\D/g, '').slice(0, 10))}
                placeholder="9876543210"
                className="signup-input has-prefix"
              />
            </div>
          </div>

          {/* Password */}
          <div className="signup-field">
            <label className="signup-label">Password</label>
            <div className="signup-input-wrapper">
              <Lock className="signup-input-icon" />
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Create a strong password"
                className="signup-input has-toggle"
              />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="auth-eye-btn">
                {showPassword ? <EyeOff style={{ width: '16px', height: '16px' }} /> : <Eye style={{ width: '16px', height: '16px' }} />}
              </button>
            </div>
          </div>

          {/* Registration Number */}
          <div className="signup-field">
            <label className="signup-label">Registration Number</label>
            <div className="signup-input-wrapper">
              <Hash className="signup-input-icon" />
              <input type="text" value={registrationNumber} onChange={(e) => setRegistrationNumber(e.target.value)} placeholder="e.g. 21BCE7001" className="signup-input" />
            </div>
          </div>

          {/* Department + Year row */}
          <div className="signup-grid-2">
            <div className="signup-field">
              <label className="signup-label">Department</label>
              <div className="signup-input-wrapper">
                <BookOpen className="signup-input-icon-select" />
                <select value={department} onChange={(e) => setDepartment(e.target.value)} className="signup-select">
                  <option value="">Select</option>
                  {DEPARTMENTS.map((d) => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>
            </div>
            <div className="signup-field">
              <label className="signup-label">Year</label>
              <div className="signup-input-wrapper">
                <Calendar className="signup-input-icon-select" />
                <select value={year} onChange={(e) => setYear(e.target.value)} className="signup-select">
                  {YEARS.map((y) => <option key={y} value={y}>{y}</option>)}
                </select>
              </div>
            </div>
          </div>

          {/* College */}
          <div className="signup-field">
            <label className="signup-label">College</label>
            <div className="signup-input-wrapper">
              <GraduationCap className="signup-input-icon-select" />
              <select value={college} onChange={(e) => setCollege(e.target.value)} className="signup-select">
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
          <div className="signup-field">
            <label className="signup-label">
              {year === '1st Year' ? 'College ID Card or Admission Fee Receipt / Allotment Order' : 'College ID Card'}
            </label>
            <label className="signup-upload-box">
              {idCardPreview ? (
                <img src={idCardPreview} alt="ID Preview" className="signup-preview-img" />
              ) : (
                <>
                  <div className="signup-upload-icon-box">
                    <Camera style={{ width: '20px', height: '20px', color: '#6C4EFF' }} />
                  </div>
                  <p className="signup-upload-text">
                    {year === '1st Year' 
                      ? 'Upload college ID, admission fee receipt, or allotment order' 
                      : 'Upload your college ID card'}
                  </p>
                  <p className="signup-upload-subtext">JPG, PNG up to 5MB</p>
                </>
              )}
              <input type="file" accept="image/*" onChange={handleFileChange} style={{ display: 'none' }} />
            </label>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="signup-submit-btn"
          >
            {loading ? (
              <div className="auth-btn-spinner animate-spin" />
            ) : (
              <>Create Account <ArrowRight style={{ width: '16px', height: '16px' }} /></>
            )}
          </button>
        </form>

        {/* Login link */}
        <p className="auth-footer-text">
          Already have an account?{' '}
          <Link to="/login" className="auth-purple-link">
            Sign In
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Signup;
