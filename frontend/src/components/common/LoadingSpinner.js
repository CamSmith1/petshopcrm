import React from 'react';

const LoadingSpinner = ({ fullPage = true, size = 'medium', message = 'Loading...' }) => {
  const spinnerClasses = `spinner-container ${fullPage ? 'full-page' : ''} ${size}`;
  
  return (
    <div className={spinnerClasses}>
      <div className="spinner"></div>
      {message && <p className="spinner-message">{message}</p>}
    </div>
  );
};

export default LoadingSpinner;