import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { canAccess } from '../../utils/roles';

function RoleRoute({ permission, children }) {
  const { user } = useAuth();

  if (!canAccess(user?.role, permission)) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}

export default RoleRoute;
