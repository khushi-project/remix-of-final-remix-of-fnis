import { Navigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';

const AdminRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAdmin, isAuthenticated } = useAuth();
  if (!isAuthenticated || !isAdmin) return <Navigate to="/login" replace />;
  return <>{children}</>;
};

export default AdminRoute;
