import React from 'react';

function MatchingDonorCard({ donor, percentage }) {
  return (
    <div className="card border-0 shadow-sm match-card h-100">
      <div className="card-body">
        <div className="d-flex align-items-start justify-content-between gap-3">
          <div>
            <h3 className="h6 fw-bold mb-1">{donor.name}</h3>
            <p className="text-secondary small mb-0">{donor.location}</p>
          </div>
          <span className="badge text-bg-primary">{percentage}% match</span>
        </div>
        <div className="progress mt-3" role="progressbar" aria-label="Match percentage">
          <div className="progress-bar" style={{ width: `${percentage}%` }}></div>
        </div>
        <div className="d-flex justify-content-between mt-3 small">
          <span>{donor.bloodGroup}</span>
          <span>{donor.organ}</span>
          <span>{donor.availability}</span>
        </div>
      </div>
    </div>
  );
}

export default MatchingDonorCard;
