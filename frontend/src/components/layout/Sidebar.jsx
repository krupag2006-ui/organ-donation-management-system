import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { canAccess } from '../../utils/roles';

const menuItems = [
  { label: 'Dashboard', path: '/dashboard', icon: 'bi-speedometer2', permission: 'dashboard' },
  { label: 'Donors', path: '/donors', icon: 'bi-heart-pulse', permission: 'donors' },
  { label: 'Recipients', path: '/recipients', icon: 'bi-person-vcard', permission: 'recipients' },
  { label: 'Hospitals', path: '/hospitals', icon: 'bi-hospital', permission: 'hospitals' },
  { label: 'Transplant Requests', path: '/requests', icon: 'bi-clipboard2-pulse', permission: 'requests' },
  { label: 'Matching System', path: '/matching', icon: 'bi-diagram-3', permission: 'matching' },
  { label: 'Analytics', path: '/analytics', icon: 'bi-bar-chart-line', permission: 'analytics' },
  { label: 'Profile', path: '/profile', icon: 'bi-person-circle', permission: 'profile' },
];

function Sidebar({ mobile = false }) {
  const { logout, user } = useAuth();
  const visibleItems = menuItems.filter((item) => canAccess(user?.role, item.permission));

  return (
    <aside className={`sidebar ${mobile ? 'h-100' : 'd-none d-lg-flex'}`}>
      <div className="sidebar-brand">
        <span className="brand-mark">
          <i className="bi bi-heart-pulse-fill"></i>
        </span>
        <div>
          <strong>TransplantCare</strong>
          <small>Admin System</small>
        </div>
      </div>
      <nav className="sidebar-nav">
        {visibleItems.map((item) => (
          <NavLink key={item.path} to={item.path} className="sidebar-link">
            <i className={`bi ${item.icon}`}></i>
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>
      <button type="button" className="sidebar-link logout-button mt-auto" onClick={logout}>
        <i className="bi bi-box-arrow-left"></i>
        <span>Logout</span>
      </button>
    </aside>
  );
}

export default Sidebar;
