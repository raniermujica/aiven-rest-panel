import { useAuthStore } from '../../store/authStore';
import { hasPermission } from '../../utils/permissions';

export function CanAccess({ permission, children, fallback = null }) {
  const user = useAuthStore((state) => state.user);
  
  if (!user) return fallback;
  
  const allowed = hasPermission(user.role, permission);
  
  return allowed ? children : fallback;
};