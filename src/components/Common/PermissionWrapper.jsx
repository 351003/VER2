import React from 'react';
import { useAuth } from '../../contexts/AuthContext';

const PermissionWrapper = ({ children, permission, fallback = null }) => {
  const { hasPermission } = useAuth();

  if (!permission || hasPermission(permission)) {
    return children;
  }

  return fallback;
};

export default PermissionWrapper;