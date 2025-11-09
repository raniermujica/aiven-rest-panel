import { Navigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { hasPermission } from '../../utils/permissions';

export function ProtectedRoute({ permission, children }) {
  const user = useAuthStore((state) => state.user);
  
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  if (permission && !hasPermission(user.role, permission)) {
    return <Navigate to="/unauthorized" replace />;
  }
  
  return children;
};