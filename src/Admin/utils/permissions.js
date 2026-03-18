export const isSuperAdmin = (session) => session?.adminPanelAccess?.level === 'super_admin';

export const hasAdminPermission = (session, permission) => {
  const access = session?.adminPanelAccess;
  if (!access?.enabled) return false;
  if (!permission) return true;
  if (access.level === 'super_admin') return true;
  const perms = Array.isArray(access.permissions) ? access.permissions : [];
  return perms.includes(permission);
};
