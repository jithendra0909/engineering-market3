import React from 'react';

export const Logo = ({ size = 34, showText = false, textClass = "" }) => {
  return (
    <div className="flex items-center gap-2.5 flex-shrink-0">
      <svg
        width={size}
        height={size}
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="flex-shrink-0"
      >
        <polygon
          points="50,6 88,28 88,72 50,94 12,72 12,28"
          stroke="#111827"
          strokeWidth="7"
          strokeLinejoin="round"
        />
        <text
          x="50"
          y="52"
          textAnchor="middle"
          dominantBaseline="central"
          fill="#111827"
          fontSize="34"
          fontWeight="bold"
          letterSpacing="-0.02em"
          fontFamily="Inter, system-ui, -apple-system, sans-serif"
        >
          EM
        </text>
      </svg>
      {showText && (
        <span className={textClass || "text-[15px] font-bold text-[#111827] tracking-[-0.01em]"}>
          Engineering Market
        </span>
      )}
    </div>
  );
};

export default Logo;
