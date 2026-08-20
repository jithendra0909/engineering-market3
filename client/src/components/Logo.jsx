import React from 'react';
import './Logo.css';

export const Logo = ({ size = 34, showText = false, textClass = "" }) => {
  return (
    <div className="logo-container">
      <svg
        width={size}
        height={size}
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="logo-svg"
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
        <span className={textClass || "logo-text"}>
          Engineering Market
        </span>
      )}
    </div>
  );
};

export default Logo;
