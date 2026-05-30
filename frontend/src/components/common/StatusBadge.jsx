import React from 'react';
import { statusClassMap } from '../../utils/constants';

function StatusBadge({ status }) {
  const className = statusClassMap[status] || 'text-bg-secondary';
  return <span className={`badge rounded-pill ${className}`}>{status}</span>;
}

export default StatusBadge;
