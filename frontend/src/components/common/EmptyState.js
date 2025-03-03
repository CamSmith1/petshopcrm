import React from 'react';
import Button from './Button';

const EmptyState = ({
  title = 'No items found',
  message = 'There are no items to display.',
  icon = '📋',
  actionText,
  onActionClick,
  className = ''
}) => {
  return (
    <div className={`empty-state ${className}`}>
      <div className="empty-state-icon">
        {icon}
      </div>
      <h3 className="empty-state-title">{title}</h3>
      <p className="empty-state-message">{message}</p>
      
      {actionText && onActionClick && (
        <Button 
          variant="primary" 
          onClick={onActionClick}
          className="mt-3"
        >
          {actionText}
        </Button>
      )}
    </div>
  );
};

export default EmptyState;