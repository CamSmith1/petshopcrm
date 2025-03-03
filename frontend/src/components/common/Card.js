import React from 'react';
import { useTheme } from '../../context/ThemeContext';

const Card = ({ children, title, actions, footer, className = '' }) => {
  const { theme } = useTheme();
  
  return (
    <div className={`card ${theme === 'dark' ? 'dark-theme' : ''} ${className}`}>
      {(title || actions) && (
        <div className="card-header">
          {title && <h3 className="card-title">{title}</h3>}
          {actions && <div className="card-actions">{actions}</div>}
        </div>
      )}
      
      <div className="card-body">
        {children}
      </div>
      
      {footer && (
        <div className="card-footer">
          {footer}
        </div>
      )}
    </div>
  );
};

export default Card;