import jwt from 'jsonwebtoken';
import { supabase } from '../config/database.js';

export const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Fetch user from database to ensure they still exist and get latest data
    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', decoded.userId)
      .single();

    if (error || !user) {
      return res.status(401).json({ error: 'Invalid token or user not found' });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error('Token verification error:', error);
    return res.status(403).json({ error: 'Invalid or expired token' });
  }
};

export const requireRole = (roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }

    next();
  };
};

export const requirePermission = (permission) => {
  return async (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    try {
      // Get role permissions from database
      const { data: rolePermissions, error } = await supabase
        .from('role_permissions')
        .select('permissions')
        .eq('role', req.user.role)
        .single();

      if (error && error.code !== 'PGRST116') {
        return res.status(500).json({ error: 'Failed to check permissions' });
      }

      // Use default permissions if no custom permissions found
      const defaultPermissions = {
        admin: {
          canCreatePermits: true,
          canEditPermits: true,
          canDeletePermits: true,
          canClosePermits: true,
          canReopenPermits: true,
          canViewPermits: true,
          canExportPermits: true,
          canManageUsers: true,
          canViewStatistics: true,
          canViewActivityLog: true,
          canManagePermissions: true,
          canReopenAnyPermit: true,
        },
        manager: {
          canCreatePermits: true,
          canEditPermits: true,
          canDeletePermits: false,
          canClosePermits: true,
          canReopenPermits: true,
          canViewPermits: true,
          canExportPermits: true,
          canManageUsers: false,
          canViewStatistics: true,
          canViewActivityLog: true,
          canManagePermissions: false,
          canReopenAnyPermit: true,
        },
        security_officer: {
          canCreatePermits: false,
          canEditPermits: false,
          canDeletePermits: false,
          canClosePermits: true,
          canReopenPermits: true,
          canViewPermits: true,
          canExportPermits: false,
          canManageUsers: false,
          canViewStatistics: false,
          canViewActivityLog: true,
          canManagePermissions: false,
          canReopenAnyPermit: false,
        },
        observer: {
          canCreatePermits: false,
          canEditPermits: false,
          canDeletePermits: false,
          canClosePermits: false,
          canReopenPermits: false,
          canViewPermits: true,
          canExportPermits: false,
          canManageUsers: false,
          canViewStatistics: false,
          canViewActivityLog: false,
          canManagePermissions: false,
          canReopenAnyPermit: false,
        },
      };

      const permissions = rolePermissions?.permissions || defaultPermissions[req.user.role] || {};
      
      if (!permissions[permission]) {
        return res.status(403).json({ error: 'Permission denied' });
      }

      next();
    } catch (error) {
      console.error('Permission check error:', error);
      return res.status(500).json({ error: 'Permission check failed' });
    }
  };
};