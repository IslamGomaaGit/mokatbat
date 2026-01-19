import { useAuthStore } from '@/store/authStore';

export function usePermissions() {
  const { user } = useAuthStore();

  const hasPermission = (permission: string | null): boolean => {
    if (!permission) return true; // No permission required
    if (user?.role === 'admin' || user?.role === 'Admin') return true; // Admin has all permissions
    
    // In a real app, you would check user.permissions array
    // For now, we'll use role-based checks
    const rolePermissions: Record<string, string[]> = {
      admin: ['*'], // All permissions
      Admin: ['*'], // All permissions (capitalized)
      reviewer: [
        'correspondence:read',
        'correspondence:review',
        'correspondence:update',
        'entity:read',
        'report:read',
      ],
      Reviewer: [
        'correspondence:read',
        'correspondence:review',
        'correspondence:update',
        'entity:read',
        'report:read',
      ],
      employee: [
        'correspondence:read',
        'correspondence:create',
        'correspondence:update',
        'entity:read',
      ],
      Employee: [
        'correspondence:read',
        'correspondence:create',
        'correspondence:update',
        'entity:read',
      ],
      viewer: [
        'correspondence:read',
        'entity:read',
      ],
      Viewer: [
        'correspondence:read',
        'entity:read',
      ],
    };

    const userPermissions = rolePermissions[user?.role || 'viewer'] || [];
    return userPermissions.includes('*') || userPermissions.includes(permission);
  };

  const hasRole = (role: string): boolean => {
    return user?.role === role;
  };

  const isAdmin = (): boolean => {
    return user?.role === 'admin';
  };

  return { hasPermission, hasRole, isAdmin };
}

