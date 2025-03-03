import React from 'react';
import { Link } from 'react-router-dom';

const PageHeader = ({ title, subtitle, backLink, actions }) => {
  return (
    <div className="page-header">
      {backLink && (
        <Link to={backLink} className="back-link">
          <i className="icon-arrow-left"></i> Back
        </Link>
      )}
      
      <div className="page-header-content">
        <div className="page-titles">
          <h1 className="page-title">{title}</h1>
          {subtitle && <p className="page-subtitle">{subtitle}</p>}
        </div>
        
        {actions && (
          <div className="page-actions">
            {actions}
          </div>
        )}
      </div>
    </div>
  );
};

export default PageHeader;