import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldAlert, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const VerificationRequiredModal = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const { user, isLoggedIn } = useAuth();

  if (!isOpen) return null;

  const handleAction = () => {
    onClose();
    if (!isLoggedIn) {
      navigate('/login');
    } else {
      navigate('/profile');
    }
  };

  const getModalContent = () => {
    if (!isLoggedIn) {
      return {
        title: "Login Required",
        desc: "You need to log in and verify your student account before you can create listings, make purchases, or contact campus sellers.",
        buttonText: "Log In",
        iconColor: "text-[#6C4EFF] bg-[#F4F1FF]"
      };
    }

    const status = user?.verificationStatus || 'pending';
    switch (status) {
      case 'pending':
        return {
          title: "Verification Under Review",
          desc: "Your student account verification is currently pending admin approval. You can browse general listings, but cannot post or contact sellers yet.",
          buttonText: "Browse Listings",
          iconColor: "text-amber-600 bg-amber-50"
        };
      case 'rejected':
        return {
          title: "Verification Rejected",
          desc: "Your student verification request was rejected. Please check your personal profile page to review your registration details or contact admin.",
          buttonText: "Go to Profile",
          iconColor: "text-rose-600 bg-rose-50"
        };
      default:
        return {
          title: "You are not verified",
          desc: "Please submit your student registration and wait for admin approval to access this feature.",
          buttonText: "Check Status",
          iconColor: "text-[#6C4EFF] bg-[#F4F1FF]"
        };
    }
  };

  const content = getModalContent();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />

      {/* Modal Dialog */}
      <div className="relative w-full max-w-[420px] bg-white rounded-3xl shadow-xl overflow-hidden z-10 flex flex-col p-6 border border-[#E9E6F8]">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 rounded-full bg-[#FAFAFF] hover:bg-[#F4F1FF] flex items-center justify-center text-[#6B7280] transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Icon */}
        <div className="flex justify-center mt-4 mb-5">
          <div className={`w-16 h-16 rounded-full flex items-center justify-center ${content.iconColor}`}>
            <ShieldAlert className="w-8 h-8 stroke-[1.8]" />
          </div>
        </div>

        {/* Title */}
        <h2 className="text-center text-xl font-black text-[#111827] mb-2">
          {content.title}
        </h2>

        {/* Description */}
        <p className="text-center text-[14px] leading-relaxed text-[#6B7280] mb-8 px-2">
          {content.desc}
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col gap-3">
          <button
            onClick={content.buttonText === "Browse Listings" ? onClose : handleAction}
            className="w-full bg-[#6C4EFF] hover:bg-[#8A72FF] text-white font-bold py-3.5 px-4 rounded-full transition-all shadow-sm active:scale-[0.99]"
          >
            {content.buttonText}
          </button>
          
          <button
            onClick={onClose}
            className="w-full bg-transparent hover:bg-[#FAFAFF] text-[#6B7280] font-semibold py-3 px-4 rounded-full transition-all"
          >
            Maybe Later
          </button>
        </div>

      </div>
    </div>
  );
};

export default VerificationRequiredModal;
