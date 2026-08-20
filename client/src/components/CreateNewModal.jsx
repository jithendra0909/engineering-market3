import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, ChevronRight, Tag, Heart, Briefcase, Store } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { VerificationRequiredModal } from './VerificationRequiredModal';
import './CreateNewModal.css';

export const CreateNewModal = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const { user, isLoggedIn, isVerified, showToast } = useAuth();
  const [isGateOpen, setIsGateOpen] = useState(false);

  if (!isOpen) return null;

  const handleRowClick = (targetPath) => {
    if (!isLoggedIn || !isVerified) {
      showToast('You are not verified', 'error');
      setIsGateOpen(true);
    } else {
      onClose();
      navigate(targetPath);
    }
  };

  const handleVendorRegister = () => {
    onClose();
    if (!isLoggedIn) {
      navigate('/login');
    } else {
      navigate('/vendors'); // Redirect to vendors/coming-soon for now
    }
  };

  return (
    <>
      <div className="modal-overlay">
        {/* Backdrop */}
        <div className="modal-backdrop" onClick={onClose} />

        {/* Modal Container */}
        <div className="modal-content-container no-scrollbar">
          
          {/* Header */}
          <div className="modal-header">
            <div>
              <h2 className="modal-header-title">Create New</h2>
              <p className="modal-header-subtitle">What would you like to do?</p>
            </div>
            <button
              onClick={onClose}
              className="modal-close-btn"
            >
              <X style={{ width: '16px', height: '16px' }} />
            </button>
          </div>

          <div className="modal-body">
            
            {/* Vendor Promo Banner */}
            <div className="modal-promo-banner">
              <div className="modal-promo-left">
                <div className="modal-promo-icon-box">
                  <Store style={{ width: '24px', height: '24px', strokeWidth: 1.8 }} />
                </div>
                <div>
                  <h4 className="modal-promo-title">Want to reach more students?</h4>
                  <p className="modal-promo-desc">
                    Register as a vendor and grow your business with our community.
                  </p>
                </div>
              </div>
              <button
                onClick={handleVendorRegister}
                className="modal-promo-btn"
              >
                Coming Soon
                <ChevronRight style={{ width: '14px', height: '14px' }} />
              </button>
            </div>

            {/* Section: Sell Something */}
            <div>
              <h3 className="modal-section-title">Sell Something</h3>
              <div className="modal-options-list">
                
                {/* Sell an Item */}
                <button
                  onClick={() => handleRowClick('/listing/new?type=sell')}
                  className="modal-option-card"
                >
                  <div className="modal-option-left">
                    <div className="modal-option-icon-box purple">
                      <Tag style={{ width: '24px', height: '24px', strokeWidth: 1.8 }} />
                    </div>
                    <div>
                      <p className="modal-option-name">Sell an Item</p>
                      <p className="modal-option-desc">List a product for sale to other students.</p>
                    </div>
                  </div>
                  <ChevronRight className="modal-option-chevron" />
                </button>

                {/* Offer a Service */}
                <button
                  onClick={() => {
                    showToast('Service section is Coming Soon!', 'info');
                  }}
                  className="modal-option-card disabled"
                >
                  <div className="modal-option-left">
                    <div className="modal-option-icon-box blue">
                      <Briefcase style={{ width: '24px', height: '24px', strokeWidth: 1.8 }} />
                    </div>
                    <div>
                      <p className="modal-option-name">Offer a Service (Coming Soon)</p>
                      <p className="modal-option-desc">Offer your skills or services to others.</p>
                    </div>
                  </div>
                  <ChevronRight className="modal-option-chevron" />
                </button>

              </div>
            </div>

            {/* Section: Give & Help */}
            <div>
              <h3 className="modal-section-title">Give & Help</h3>
              
              {/* Donate an Item */}
              <button
                onClick={() => handleRowClick('/listing/new?type=donate')}
                className="modal-option-card"
              >
                <div className="modal-option-left">
                  <div className="modal-option-icon-box rose">
                    <Heart style={{ width: '24px', height: '24px', strokeWidth: 1.8 }} />
                  </div>
                  <div>
                    <p className="modal-option-name">Donate an Item</p>
                    <p className="modal-option-desc">Give away items for free to students in need.</p>
                  </div>
                </div>
                <ChevronRight className="modal-option-chevron" />
              </button>
            </div>

          </div>
        </div>
      </div>

      <VerificationRequiredModal isOpen={isGateOpen} onClose={() => setIsGateOpen(false)} />
    </>
  );
};

export default CreateNewModal;
