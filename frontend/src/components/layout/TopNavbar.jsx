import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { formatRole } from '../../utils/roles';

function TopNavbar() {
  const { user } = useAuth();

  return (
    <nav className="top-navbar navbar navbar-expand-lg bg-white border-bottom sticky-top">
      <div className="container-fluid px-3 px-lg-4">
        <button
          className="btn btn-outline-primary d-lg-none me-2"
          type="button"
          data-bs-toggle="offcanvas"
          data-bs-target="#mobileSidebar"
          aria-controls="mobileSidebar"
          aria-label="Open navigation"
        >
          <i className="bi bi-list"></i>
        </button>
        <span className="navbar-brand fw-bold text-primary mb-0">Organ Donation & Transplant Management System</span>
        <div className="ms-auto d-flex align-items-center gap-3">
          <div className="nav-search d-none d-md-flex">
            <i className="bi bi-search"></i>
            <input className="form-control" type="search" placeholder="Search donors, recipients, hospitals" />
          </div>
          <button className="btn btn-light position-relative rounded-circle icon-button" type="button" aria-label="Notifications">
            <i className="bi bi-bell"></i>
            <span className="notification-dot"></span>
          </button>
          <div className="user-chip">
            <span className="avatar">{user?.name?.charAt(0)?.toUpperCase() || 'A'}</span>
            <div className="d-none d-sm-block">
              <strong>{user?.name || 'Admin User'}</strong>
              <small>{formatRole(user?.role)}</small>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}

export default TopNavbar;
