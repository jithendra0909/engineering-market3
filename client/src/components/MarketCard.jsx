import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';

export const MarketCard = ({
  title,
  description,
  icon: Icon,
  buttonText,
  link,
  bgColor = 'bg-[#F4F1FF]',
  iconBgColor = 'bg-white',
  iconColor = 'text-[#6C4EFF]'
}) => {
  return (
    <div className={`p-5 rounded-[24px] flex flex-col justify-between h-[165px] border border-[#E9E6F8]/50 shadow-sm ${bgColor}`}>
      <div>
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center shadow-sm ${iconBgColor} ${iconColor}`}>
          <Icon className="w-5 h-5 stroke-[2]" />
        </div>
        <h3 className="font-bold text-[15px] text-[#111827] mt-3">{title}</h3>
        <p className="text-[11px] text-[#6B7280] mt-1 leading-relaxed">
          {description}
        </p>
      </div>
      <Link 
        to={link} 
        className={`text-xs font-bold hover:underline flex items-center gap-0.5 mt-2 ${iconColor}`}
      >
        {buttonText} <ChevronRight className="w-3.5 h-3.5" />
      </Link>
    </div>
  );
};

export default MarketCard;
