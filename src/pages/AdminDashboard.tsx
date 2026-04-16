import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import AdminSidebar from '@/components/AdminSidebar';
import { Users, Clock, Utensils, Dumbbell, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import ClientTasksTab from '@/components/admin/ClientTasksTab';
import DietTasksTab from '@/components/admin/DietTasksTab';
import TrainerManagementTab from '@/components/admin/TrainerManagementTab';
import ClientManagementTab from '@/components/admin/ClientManagementTab';
import ExerciseManagementTab from '@/components/admin/ExerciseManagementTab';
import { AdminProvider, useAdminData } from '@/context/AdminContext';

export type AdminTab = 'clients' | 'diet' | 'trainers' | 'manage-clients' | 'exercises';

const AdminDashboardInner = () => {
  const { user } = useAuth();
  const { stats, isLoading, error } = useAdminData();
  const [activeTab, setActiveTab] = useState<AdminTab>('clients');

  const statCards = [
    { label: 'Total Clients', value: String(stats.totalClients), icon: Users },
    { label: 'Total Trainers', value: String(stats.totalTrainers), icon: Dumbbell },
    { label: 'Diet Plans', value: String(stats.dietPlans), icon: Utensils },
    { label: 'Assignments', value: String(stats.assignments), icon: Clock },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground">
      <AdminSidebar activeTab={activeTab} onTabChange={setActiveTab} />
      <main className="pl-16 transition-all duration-300 md:pl-60">
        <div className="mx-auto max-w-5xl px-6 py-8">
          <div className="mb-8">
            <h1 className="font-display text-2xl font-bold">Admin Dashboard</h1>
            <p className="text-sm text-muted-foreground">Welcome back, {user?.name}</p>
          </div>

          {error && (
            <div className="mb-4 rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">{error}</div>
          )}

          {isLoading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <>
              {/* Stats */}
              <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {statCards.map((stat, i) => (
                  <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }} className="rounded-xl border border-border bg-card p-5">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                        <stat.icon className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="text-2xl font-bold">{stat.value}</p>
                        <p className="text-xs text-muted-foreground">{stat.label}</p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Tab Content */}
              {activeTab === 'clients' && <ClientTasksTab />}
              {activeTab === 'diet' && <DietTasksTab />}
              {activeTab === 'trainers' && <TrainerManagementTab />}
              {activeTab === 'manage-clients' && <ClientManagementTab />}
              {activeTab === 'exercises' && <ExerciseManagementTab />}
            </>
          )}
        </div>
      </main>
    </div>
  );
};

const AdminDashboard = () => (
  <AdminProvider>
    <AdminDashboardInner />
  </AdminProvider>
);

export default AdminDashboard;
