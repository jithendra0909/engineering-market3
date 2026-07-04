import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, ChevronRight, Tag, Heart, Printer, Gift, Briefcase, Megaphone, Store } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { VerificationRequiredModal } from './VerificationRequiredModal';

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
      <div className="fixed inset-0 z-50 flex items-end lg:items-center justify-center p-0 lg:p-4">
        {/* Backdrop */}
        <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />

        {/* Modal Container */}
        <div className="relative w-full lg:max-w-[500px] max-h-[85vh] lg:max-h-[90vh] bg-white rounded-t-[32px] lg:rounded-[32px] shadow-xl z-10 flex flex-col transition-all duration-300 overflow-y-auto no-scrollbar border border-[#E9E6F8]">
          
          {/* Header */}
          <div className="sticky top-0 bg-white border-b border-[#E9E6F8] px-6 py-5 flex items-center justify-between z-10">
            <div>
              <h2 className="text-xl font-black text-[#111827]">Create New</h2>
              <p className="text-xs text-[#6B7280] mt-0.5">What would you like to do?</p>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-[#FAFAFF] hover:bg-[#F4F1FF] flex items-center justify-center text-[#6B7280] transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="p-6 flex flex-col gap-6">
            
            {/* Vendor Promo Banner */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 bg-[#F4F1FF] p-4 rounded-2xl justify-between border border-[#6C4EFF]/10">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center text-[#6C4EFF] shadow-sm flex-shrink-0">
                  <Store className="w-6 h-6 stroke-[1.8]" />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-[#111827]">Want to reach more students?</h4>
                  <p className="text-[11px] text-[#6B7280] mt-0.5 leading-snug">
                    Register as a vendor and grow your business with our community.
                  </p>
                </div>
              </div>
              <button
                onClick={handleVendorRegister}
                className="w-full sm:w-auto flex items-center justify-center gap-1 text-xs font-bold text-[#6C4EFF] bg-white border border-[#6C4EFF]/20 px-3.5 py-2.5 rounded-full whitespace-nowrap hover:bg-[#6C4EFF]/5 transition-all mt-2 sm:mt-0"
              >
                Coming Soon
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Section: Sell Something */}
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#6B7280] mb-3">Sell Something</h3>
              <div className="flex flex-col gap-2">
                
                {/* Sell an Item */}
                <button
                  onClick={() => handleRowClick('/listing/new?type=sell')}
                  className="flex items-center justify-between p-3.5 bg-white border border-[#E9E6F8] hover:border-[#6C4EFF]/20 rounded-2xl text-left transition-all active:scale-[0.99] group shadow-sm"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-[#F4F1FF] text-[#6C4EFF] flex items-center justify-center">
                      <Tag className="w-6 h-6 stroke-[1.8]" />
                    </div>
                    <div>
                      <p className="font-bold text-sm text-[#111827] group-hover:text-[#6C4EFF] transition-colors">Sell an Item</p>
                      <p className="text-xs text-[#6B7280] mt-0.5">List a product for sale to other students.</p>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-[#6B7280] group-hover:text-[#6C4EFF] transition-colors" />
                </button>

                {/* Offer a Service */}
                <button
                  onClick={() => {
                    showToast('Service section is Coming Soon!', 'info');
                  }}
                  className="flex items-center justify-between p-3.5 bg-white border border-[#E9E6F8] hover:border-[#6C4EFF]/20 rounded-2xl text-left transition-all active:scale-[0.99] group shadow-sm opacity-60"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                      <Briefcase className="w-6 h-6 stroke-[1.8]" />
                    </div>
                    <div>
                      <p className="font-bold text-sm text-[#111827]">Offer a Service (Coming Soon)</p>
                      <p className="text-xs text-[#6B7280] mt-0.5">Offer your skills or services to others.</p>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-[#6B7280]" />
                </button>

              </div>
            </div>

            {/* Section: Give & Help */}
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#6B7280] mb-3">Give & Help</h3>
              
              {/* Donate an Item */}
              <button
                onClick={() => handleRowClick('/listing/new?type=donate')}
                className="w-full flex items-center justify-between p-3.5 bg-white border border-[#E9E6F8] hover:border-[#6C4EFF]/20 rounded-2xl text-left transition-all active:scale-[0.99] group shadow-sm"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-rose-50 text-rose-500 flex items-center justify-center">
                    <Heart className="w-6 h-6 stroke-[1.8]" />
                  </div>
                  <div>
                    <p className="font-bold text-sm text-[#111827] group-hover:text-[#6C4EFF] transition-colors">Donate an Item</p>
                    <p className="text-xs text-[#6B7280] mt-0.5">Give away items for free to students in need.</p>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-[#6B7280] group-hover:text-[#6C4EFF] transition-colors" />
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
