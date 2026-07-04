import React from 'react';
import { ChevronLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const ComingSoon = ({
  title = 'Coming Soon',
  message = "We are working hard to bring something amazing for you.",
  image = '/images/file_000000005f1c71fdbfe38ad7bc5ff562.png'
}) => {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center justify-center py-16 px-5 text-center max-w-[500px] mx-auto min-h-[60vh]">

      {/* Decorative blob */}
      <div className="relative w-56 h-56 mb-8">
        <div className="absolute inset-0 bg-[#6C4EFF]/[0.06] rounded-full blur-3xl -z-10 animate-pulse-soft" />
        <img
          src={image}
          alt="Coming Soon"
          className="w-full h-full object-contain rounded-[20px] border border-[#E9E6F8]/70"
        />
      </div>

      {/* Badge */}
      <span className="bg-[#F4F1FF] text-[#6C4EFF] text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider mb-4 border border-[#6C4EFF]/10">
        Feature Launching Soon
      </span>

      {/* Content */}
      <h1 className="text-[24px] font-bold text-[#111827] mb-2">{title}</h1>
      <p className="text-[13px] text-[#9CA3AF] leading-relaxed mb-8 max-w-[360px]">{message}</p>

      {/* Actions */}
      <div className="flex gap-3">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-1.5 border border-[#E9E6F8] bg-white hover:bg-[#FAFAFF] text-[#6B7280] font-semibold px-5 py-2.5 rounded-full transition-all active:scale-[0.98] text-[13px]"
        >
          <ChevronLeft className="w-4 h-4" /> Go Back
        </button>
        <button
          onClick={() => navigate('/')}
          className="bg-[#6C4EFF] hover:bg-[#8A72FF] text-white font-semibold px-5 py-2.5 rounded-full transition-all active:scale-[0.98] shadow-sm text-[13px]"
        >
          Back to Home
        </button>
      </div>
    </div>
  );
};

export default ComingSoon;
