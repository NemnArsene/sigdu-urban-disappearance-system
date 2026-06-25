import { type Role } from '../types';

export const RoleRoutes: Record<Role, string> = {
  CITOYEN: '/citoyen/dashboard',
  AGENT: '/agent/dashboard',
  SUPERVISEUR: '/superviseur/dashboard',
  ADMIN: '/admin/dashboard',
};

export const hasAccess = (userRole: Role, path: string): boolean => {
  if (path.startsWith('/citoyen') && userRole === 'CITOYEN') return true;
  if (path.startsWith('/agent') && userRole === 'AGENT') return true;
  if (path.startsWith('/superviseur') && userRole === 'SUPERVISEUR') return true;
  if (path.startsWith('/admin') && userRole === 'ADMIN') return true;
  
  // Public routes
  if (path === '/' || path === '/login') return true;

  return false;
};
