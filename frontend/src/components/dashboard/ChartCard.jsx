import React from 'react';

function ChartCard({ title, children }) {
  return (
    <div className="card border-0 shadow-sm h-100">
      <div className="card-body">
        <div className="d-flex align-items-center justify-content-between mb-3">
          <h2 className="h5 fw-bold mb-0">{title}</h2>
          <span className="badge text-bg-light">Live view</span>
        </div>
        <div className="chart-box">{children}</div>
      </div>
    </div>
  );
}

export default ChartCard;
