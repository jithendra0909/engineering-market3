import React from 'react';
import { ChevronLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import './ComingSoon.css';

export const ComingSoon = ({
  title = 'Coming Soon',
  message = "We are working hard to bring something amazing for you.",
  image = '/images/file_000000005f1c71fdbfe38ad7bc5ff562.png'
}) => {
  const navigate = useNavigate();

  return (
    <div className="coming-soon-container">
      {/* Decorative blob */}
      <div className="coming-soon-blob-wrapper">
        <div className="coming-soon-blob-bg animate-pulse-soft" />
        <img
          src={image}
          alt="Coming Soon"
          className="coming-soon-img"
        />
      </div>

      {/* Badge */}
      <span className="coming-soon-badge">
        Feature Launching Soon
      </span>

      {/* Content */}
      <h1 className="coming-soon-title">{title}</h1>
      <p className="coming-soon-message">{message}</p>

      {/* Actions */}
      <div className="coming-soon-actions">
        <button
          onClick={() => navigate(-1)}
          className="coming-soon-btn-back"
        >
          <ChevronLeft className="coming-soon-icon" /> Go Back
        </button>
        <button
          onClick={() => navigate('/')}
          className="coming-soon-btn-home"
        >
          Back to Home
        </button>
      </div>
    </div>
  );
};

export default ComingSoon;
