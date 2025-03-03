import React from 'react';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';

/**
 * Button component with different variants and styling options
 * Can be rendered as a button or a link (if 'to' prop is provided)
 */
const Button = ({
  children,
  onClick,
  to,
  type = 'button',
  primary,
  secondary,
  danger,
  outline,
  small,
  large,
  fullWidth,
  disabled,
  leftIcon,
  rightIcon,
  loading,
  className,
  ...props
}) => {
  // Build class names based on props
  const buttonClasses = [
    'btn',
    primary ? 'btn-primary' : '',
    secondary ? 'btn-secondary' : '',
    danger ? 'btn-danger' : '',
    outline ? 'btn-outline' : '',
    small ? 'btn-sm' : '',
    large ? 'btn-lg' : '',
    fullWidth ? 'btn-block' : '',
    loading ? 'btn-loading' : '',
    className || ''
  ].filter(Boolean).join(' ');
  
  // Render loading state if loading prop is true
  const renderLoadingIndicator = () => {
    if (!loading) return null;
    
    return (
      <span className="btn-spinner" aria-hidden="true">
        <svg 
          className="animate-spin" 
          xmlns="http://www.w3.org/2000/svg" 
          fill="none" 
          viewBox="0 0 24 24"
        >
          <circle 
            className="opacity-25" 
            cx="12" 
            cy="12" 
            r="10" 
            stroke="currentColor" 
            strokeWidth="4"
          ></circle>
          <path 
            className="opacity-75" 
            fill="currentColor" 
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          ></path>
        </svg>
      </span>
    );
  };
  
  // Render content with icons
  const renderContent = () => {
    return (
      <>
        {loading && renderLoadingIndicator()}
        {leftIcon && !loading && <span className="btn-icon btn-icon-left">{leftIcon}</span>}
        <span className={loading ? 'opacity-0' : ''}>{children}</span>
        {rightIcon && !loading && <span className="btn-icon btn-icon-right">{rightIcon}</span>}
      </>
    );
  };
  
  // If 'to' prop is provided, render as Link component
  if (to) {
    return (
      <Link
        to={to}
        className={buttonClasses}
        {...props}
      >
        {renderContent()}
      </Link>
    );
  }
  
  // Otherwise, render as button element
  return (
    <button
      type={type}
      className={buttonClasses}
      onClick={onClick}
      disabled={disabled || loading}
      {...props}
    >
      {renderContent()}
    </button>
  );
};

Button.propTypes = {
  children: PropTypes.node.isRequired,
  onClick: PropTypes.func,
  to: PropTypes.string,
  type: PropTypes.string,
  primary: PropTypes.bool,
  secondary: PropTypes.bool,
  danger: PropTypes.bool,
  outline: PropTypes.bool,
  small: PropTypes.bool,
  large: PropTypes.bool,
  fullWidth: PropTypes.bool,
  disabled: PropTypes.bool,
  leftIcon: PropTypes.node,
  rightIcon: PropTypes.node,
  loading: PropTypes.bool,
  className: PropTypes.string
};

export default Button;