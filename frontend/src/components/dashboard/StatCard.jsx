import React from 'react';

function StatCard({ title, value, icon, accent = 'primary', trend }) {
  return (
    <div className="card stat-card h-100 border-0 shadow-sm">
      <div className="card-body d-flex align-items-center gap-3">
        <div className={`stat-icon bg-${accent}-soft text-${accent}`}>
          <i className={`bi ${icon}`}></i>
        </div>
        <div>
          <p className="text-secondary small mb-1">{title}</p>
          <h2 className="h4 fw-bold mb-0">{value}</h2>
          {trend && <span className="small text-success">{trend}</span>}
        </div>
      </div>
    </div>
  );
}

export default StatCard;
