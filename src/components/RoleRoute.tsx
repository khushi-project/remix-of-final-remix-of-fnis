import { Navigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import type { UserRole } from '@/types';

const RoleRoute = ({ children, role }: { children: React.ReactNode; role: UserRole }) => {
  const { isAuthenticated, user } = useAuth();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (user?.role !== role) return <Navigate to="/login" replace />;
  return <>{children}</>;
};

export default RoleRoute;
