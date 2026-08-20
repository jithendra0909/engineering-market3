import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import './MarketCard.css';

export const MarketCard = ({
  title,
  description,
  icon: Icon,
  buttonText,
  link,
  bgColor,
  iconBgColor,
  iconColor
}) => {
  return (
    <div 
      className="market-card"
      style={bgColor ? { backgroundColor: bgColor } : undefined}
    >
      <div>
        <div 
          className="market-card-icon-box"
          style={{
            backgroundColor: iconBgColor || undefined,
            color: iconColor || undefined
          }}
        >
          <Icon className="market-card-icon" />
        </div>
        <h3 className="market-card-title">{title}</h3>
        <p className="market-card-desc">
          {description}
        </p>
      </div>
      <Link 
        to={link} 
        className="market-card-link"
        style={iconColor ? { color: iconColor } : undefined}
      >
        {buttonText} <ChevronRight className="market-card-chevron" />
      </Link>
    </div>
  );
};

export default MarketCard;
