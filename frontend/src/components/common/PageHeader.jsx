import React from 'react';

function PageHeader({ title, subtitle, action }) {
  return (
    <div className="d-flex flex-column flex-lg-row align-items-lg-center justify-content-between gap-3 mb-4">
      <div>
        <h1 className="h3 fw-bold mb-1">{title}</h1>
        <p className="text-secondary mb-0">{subtitle}</p>
      </div>
      {action}
    </div>
  );
}

export default PageHeader;
