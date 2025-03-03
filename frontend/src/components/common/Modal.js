import React, { useEffect } from 'react';
import { useTheme } from '../../context/ThemeContext';

const Modal = ({ 
  isOpen, 
  onClose, 
  title, 
  children, 
  footer,
  size = 'medium',
  closeOnBackdropClick = true
}) => {
  const { theme } = useTheme();
  
  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);
  
  // Close on ESC key
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    
    if (isOpen) {
      document.addEventListener('keydown', handleEsc);
    }
    
    return () => {
      document.removeEventListener('keydown', handleEsc);
    };
  }, [isOpen, onClose]);
  
  // Handle backdrop click
  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget && closeOnBackdropClick) {
      onClose();
    }
  };
  
  if (!isOpen) return null;
  
  // Determine size class
  const sizeClass = {
    small: 'modal-sm',
    medium: 'modal-md',
    large: 'modal-lg',
    xlarge: 'modal-xl'
  }[size] || 'modal-md';
  
  return (
    <div 
      className={`modal-backdrop ${theme === 'dark' ? 'dark-theme' : ''}`} 
      onClick={handleBackdropClick}
    >
      <div className={`modal-container ${sizeClass}`}>
        <div className="modal-header">
          <h3 className="modal-title">{title}</h3>
          <button 
            type="button" 
            className="modal-close-btn"
            onClick={onClose}
            aria-label="Close modal"
          >
            &times;
          </button>
        </div>
        
        <div className="modal-body">
          {children}
        </div>
        
        {footer && (
          <div className="modal-footer">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
};

export default Modal;