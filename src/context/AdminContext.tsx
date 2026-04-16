import { createContext, useContext } from 'react';
import { useAdminDashboard, type AdminDashboardData } from '@/hooks/useAdminDashboard';

const AdminContext = createContext<AdminDashboardData | null>(null);

export const useAdminData = () => {
  const ctx = useContext(AdminContext);
  if (!ctx) throw new Error('useAdminData must be used within AdminProvider');
  return ctx;
};

export const AdminProvider = ({ children }: { children: React.ReactNode }) => {
  const data = useAdminDashboard();
  return <AdminContext.Provider value={data}>{children}</AdminContext.Provider>;
};
