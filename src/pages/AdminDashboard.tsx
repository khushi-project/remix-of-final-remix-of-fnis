import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import AdminSidebar from '@/components/AdminSidebar';
import { Users, Clock, Utensils, Dumbbell } from 'lucide-react';
import { motion } from 'framer-motion';
import ClientTasksTab from '@/components/admin/ClientTasksTab';
import DietTasksTab from '@/components/admin/DietTasksTab';
import TrainerManagementTab from '@/components/admin/TrainerManagementTab';
import ClientManagementTab from '@/components/admin/ClientManagementTab';

export type AdminTab = 'clients' | 'diet' | 'trainers' | 'manage-clients';

const AdminDashboard = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<AdminTab>('clients');

  const stats = [
    { label: 'Total Clients', value: '4', icon: Users },
    { label: 'Active Tasks', value: '3', icon: Clock },
    { label: 'Diet Plans', value: '3', icon: Utensils },
    { label: 'Trainers', value: '4', icon: Dumbbell },
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

          {/* Stats */}
          <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {stats.map((stat, i) => (
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
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;
