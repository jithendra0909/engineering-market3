import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldAlert, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import './VerificationRequiredModal.css';

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
        iconClass: "purple"
      };
    }

    const status = user?.verificationStatus || 'pending';
    switch (status) {
      case 'pending':
        return {
          title: "Verification Under Review",
          desc: "Your student account verification is currently pending admin approval. You can browse general listings, but cannot post or contact sellers yet.",
          buttonText: "Browse Listings",
          iconClass: "amber"
        };
      case 'rejected':
        return {
          title: "Verification Rejected",
          desc: "Your student verification request was rejected. Please check your personal profile page to review your registration details or contact admin.",
          buttonText: "Go to Profile",
          iconClass: "rose"
        };
      default:
        return {
          title: "You are not verified",
          desc: "Please submit your student registration and wait for admin approval to access this feature.",
          buttonText: "Check Status",
          iconClass: "purple"
        };
    }
  };

  const content = getModalContent();

  return (
    <div className="verification-modal-overlay">
      {/* Backdrop */}
      <div className="verification-modal-backdrop" onClick={onClose} />

      {/* Modal Dialog */}
      <div className="verification-modal-dialog">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="verification-modal-close"
        >
          <X style={{ width: '16px', height: '16px' }} />
        </button>

        {/* Icon */}
        <div className="verification-modal-icon-wrapper">
          <div className={`verification-modal-icon-box ${content.iconClass}`}>
            <ShieldAlert style={{ width: '32px', height: '32px', strokeWidth: 1.8 }} />
          </div>
        </div>

        {/* Title */}
        <h2 className="verification-modal-title">
          {content.title}
        </h2>

        {/* Description */}
        <p className="verification-modal-desc">
          {content.desc}
        </p>

        {/* Action Buttons */}
        <div className="verification-modal-actions">
          <button
            onClick={content.buttonText === "Browse Listings" ? onClose : handleAction}
            className="verification-modal-primary-btn"
          >
            {content.buttonText}
          </button>
          
          <button
            onClick={onClose}
            className="verification-modal-secondary-btn"
          >
            Maybe Later
          </button>
        </div>

      </div>
    </div>
  );
};

export default VerificationRequiredModal;
