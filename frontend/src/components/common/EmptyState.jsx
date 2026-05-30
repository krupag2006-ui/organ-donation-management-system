import React from 'react';

function EmptyState({ icon = 'bi-inbox', title = 'No records found', text = 'Try adjusting the current filters.' }) {
  return (
    <div className="empty-state text-center py-5">
      <i className={`bi ${icon} display-6 text-primary`}></i>
      <h2 className="h5 mt-3 mb-1">{title}</h2>
      <p className="text-secondary mb-0">{text}</p>
    </div>
  );
}

export default EmptyState;
