import { useState } from 'react';
import { CheckCircle, Trash2, ClipboardList } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAdminData } from '@/context/AdminContext';

export interface ClientTask {
  id: string;
  clientName: string;
  task: string;
  status: 'pending' | 'in-progress' | 'completed';
}

const statusColors: Record<string, string> = {
  pending: 'bg-yellow-500/20 text-yellow-400',
  'in-progress': 'bg-blue-500/20 text-blue-400',
  completed: 'bg-primary/20 text-primary',
};

const ClientTasksTab = () => {
  const { clients } = useAdminData();
  const [clientTasks, setClientTasks] = useState<ClientTask[]>([]);

  const updateTaskStatus = (id: string) => {
    setClientTasks(prev =>
      prev.map(t => {
        if (t.id !== id) return t;
        const next = t.status === 'pending' ? 'in-progress' : t.status === 'in-progress' ? 'completed' : 'pending';
        return { ...t, status: next as ClientTask['status'] };
      })
    );
  };

  const deleteTask = (id: string) => {
    setClientTasks(prev => prev.filter(t => t.id !== id));
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      {/* Overview */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-border bg-card p-4">
          <p className="text-xs text-muted-foreground">Total Clients</p>
          <p className="text-2xl font-bold">{clients.length}</p>
        </div>
        <div className="rounded-xl border border-border bg-card p-4">
          <p className="text-xs text-muted-foreground">Meal Logs</p>
          <p className="text-2xl font-bold">0</p>
        </div>
        <div className="rounded-xl border border-border bg-card p-4">
          <p className="text-xs text-muted-foreground">Active Tasks</p>
          <p className="text-2xl font-bold">{clientTasks.filter(t => t.status !== 'completed').length}</p>
        </div>
      </div>

      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <div className="border-b border-border px-5 py-3">
          <h2 className="font-display font-bold">Client Tasks</h2>
        </div>
        <div className="divide-y divide-border">
          {clientTasks.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <ClipboardList className="h-10 w-10 text-muted-foreground/40 mb-3" />
              <p className="text-sm text-muted-foreground">No tasks yet.</p>
              <p className="text-xs text-muted-foreground mt-1">Tasks will appear here once connected to a database.</p>
            </div>
          ) : (
            clientTasks.map(task => (
              <div key={task.id} className="flex items-center justify-between px-5 py-4">
                <div>
                  <p className="text-sm font-medium">{task.task}</p>
                  <p className="text-xs text-muted-foreground">{task.clientName}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${statusColors[task.status]}`}>
                    {task.status}
                  </span>
                  <button onClick={() => updateTaskStatus(task.id)} className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground" title="Cycle status">
                    <CheckCircle className="h-4 w-4" />
                  </button>
                  <button onClick={() => deleteTask(task.id)} className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-destructive/20 hover:text-destructive" title="Delete">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default ClientTasksTab;
